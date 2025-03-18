import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createServerSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { VerificationRequest, VerificationResponse } from '../_shared/types.ts'
import { sendVerificationCode } from '../_shared/communications.ts'
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
        method: 'cookie' | 'email' | 'phone', 
        identifier: string
      } 
    }
    
    // Validace požadavku
    if (!sessionId || !data?.method) {
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
      .select('id, shop_id, status, verification_method, expires_at')
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

    // Kontrola, zda jde o správnou metodu ověření
    if (sessionData.verification_method !== 'reverification') {
      return new Response(
        JSON.stringify({ error: 'Neplatná metoda ověření pro tento endpoint' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Různé zpracování podle metody opakovaného ověření
    let verificationResult = {
      success: true,
      message: '',
      needsCode: false,
      verificationData: {}
    }
    
    if (data.method === 'cookie') {
      // Pro cookie metodu není potřeba generovat kód
      verificationResult = {
        success: true,
        message: 'Použijte lokálně uložený token pro ověření',
        needsCode: false,
        verificationData: {
          method: 'cookie',
          timestamp: new Date().toISOString()
        }
      }
    } else if (data.method === 'email' || data.method === 'phone') {
      // Kontrola, zda existuje záznam s daným identifikátorem
      const { data: savedVerification, error: savedVerificationError } = await supabase
        .from('verification_results')
        .select('id, verification_id, save_method, identifier, valid_until')
        .eq('save_method', data.method)
        .eq('identifier', data.identifier)
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (savedVerificationError) {
        return new Response(
          JSON.stringify({ error: 'Chyba při hledání uloženého ověření' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (!savedVerification) {
        return new Response(
          JSON.stringify({ 
            error: `Nebyl nalezen žádný záznam o ověření pro tento ${data.method === 'email' ? 'email' : 'telefon'}` 
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Generování ověřovacího kódu
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Uložení kódu do session
      const { error: updateError } = await supabase
        .from('verification_sessions')
        .update({
          verification_details: {
            method: data.method,
            identifier: data.identifier,
            verificationCode,
            codeGeneratedAt: new Date().toISOString(),
            savedVerificationId: savedVerification.id
          }
        })
        .eq('id', sessionId)
      
      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Nepodařilo se aktualizovat ověřovací session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Odeslání ověřovacího kódu
      const sendResult = await sendVerificationCode(
        data.method, 
        data.identifier, 
        verificationCode
      )
      
      if (!sendResult.success) {
        return new Response(
          JSON.stringify({ error: `Nepodařilo se odeslat ověřovací kód: ${sendResult.error}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      verificationResult = {
        success: true,
        message: `Ověřovací kód byl odeslán na ${data.method === 'email' ? 'email' : 'telefon'}`,
        needsCode: true,
        verificationData: {
          method: data.method,
          identifier: data.identifier,
          codeExpiresAt: new Date(new Date().getTime() + 15 * 60000).toISOString() // 15 minut
        }
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Neplatná metoda opakovaného ověření' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Logování události
    await supabase
      .from('verification_logs')
      .insert({
        session_id: sessionId,
        event_type: 'reverification_initiated',
        details: {
          method: data.method,
          identifier: data.identifier,
          needsCode: verificationResult.needsCode
        }
      })

    // Odpověď
    const response: VerificationResponse = {
      success: true,
      message: verificationResult.message,
      sessionId,
      data: {
        needsCode: verificationResult.needsCode,
        method: data.method
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
