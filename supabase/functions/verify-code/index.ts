import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createServerSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { VerificationRequest, VerificationResponse } from '../_shared/types.ts'
import { generateVerificationHash } from '../_shared/crypto.ts'

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  // Pouze POST požadavky
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { sessionId, data } = await req.json() as VerificationRequest & { 
      data: { 
        method: 'email' | 'phone', 
        identifier: string,
        code: string
      } 
    }
    
    // Validace požadavku
    if (!sessionId || !data?.method || !data?.identifier || !data?.code) {
      return new Response(
        JSON.stringify({ error: 'Chybí požadované údaje' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vytvoření Supabase klienta
    const supabase = createServerSupabaseClient()
    
    // Kontrola existence a platnosti session
    const { data: sessionData, error: sessionError } = await supabase
      .from('verification_sessions')
      .select('id, shop_id, status, verification_method, verification_details, expires_at')
      .eq('id', sessionId)
      .single()
    
    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ error: 'Ověřovací session nebyla nalezena' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (sessionData.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Ověřovací session není ve stavu čekající' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (new Date(sessionData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Ověřovací session vypršela' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Kontrola detailů verifikace
    const details = sessionData.verification_details
    
    if (!details || 
        details.method !== data.method || 
        details.identifier !== data.identifier ||
        !details.verificationCode ||
        !details.codeGeneratedAt ||
        !details.savedVerificationId) {
      return new Response(
        JSON.stringify({ error: 'Neplatné údaje pro ověření kódu' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Kontrola vypršení kódu (15 minut)
    const codeGeneratedAt = new Date(details.codeGeneratedAt)
    const now = new Date()
    const diffMs = now.getTime() - codeGeneratedAt.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    
    if (diffMinutes > 15) {
      return new Response(
        JSON.stringify({ error: 'Ověřovací kód vypršel' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Kontrola správnosti kódu
    if (details.verificationCode !== data.code) {
      return new Response(
        JSON.stringify({ error: 'Nesprávný ověřovací kód' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Kontrola existujícího ověření
    const { data: savedVerification, error: savedVerificationError } = await supabase
      .from('verification_results')
      .select('id, verification_id')
      .eq('id', details.savedVerificationId)
      .single()
    
    if (savedVerificationError || !savedVerification) {
      return new Response(
        JSON.stringify({ error: 'Uložené ověření nebylo nalezeno' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Generování nového verifikačního hashe
    const verificationToken = await generateVerificationHash(sessionId, data.method, data.identifier)
    
    // Získání informací o původním ověření
    const { data: originalVerification, error: originalVerificationError } = await supabase
      .from('verifications')
      .select('id, method, result, price, metadata')
      .eq('id', savedVerification.verification_id)
      .single()
    
    if (originalVerificationError || !originalVerification) {
      return new Response(
        JSON.stringify({ error: 'Původní ověření nebylo nalezeno' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Vytvoření nového záznamu v saved_verifications
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // Platnost 30 dní
    
    const { error: saveHashError } = await supabase
      .from('saved_verifications')
      .insert({
        verification_hash: verificationToken,
        method: data.method,
        expires_at: expiresAt.toISOString()
      })
    
    if (saveHashError) {
      return new Response(
        JSON.stringify({ error: 'Nepodařilo se uložit verifikační hash' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Aktualizace session
    const { error: updateError } = await supabase
      .from('verification_sessions')
      .update({
        status: 'completed',
        verification_result: 'success',
        verification_details: {
          ...details,
          codeVerified: true,
          verifiedAt: now.toISOString(),
          originalVerificationId: savedVerification.verification_id,
          verificationToken
        },
        completed_at: now.toISOString()
      })
      .eq('id', sessionId)
    
    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Nepodařilo se aktualizovat ověřovací session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Logování události
    await supabase
      .from('verification_logs')
      .insert({
        session_id: sessionId,
        event_type: 'reverification_success',
        details: {
          method: data.method,
          identifier: data.identifier,
          originalVerificationId: savedVerification.verification_id
        }
      })

    // Odpověď
    const response: VerificationResponse = {
      success: true,
      message: 'Ověření bylo úspěšné',
      sessionId,
      data: {
        verified: true,
        verificationToken,
        expiresAt: expiresAt.toISOString()
      }
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 