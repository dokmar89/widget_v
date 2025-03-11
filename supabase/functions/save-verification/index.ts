import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createServerSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { VerificationRequest, VerificationResponse, SaveMethod } from '../_shared/types.ts'

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
        saveMethod: SaveMethod,
        contactInfo?: string
      } 
    }
    
    // Validace požadavku
    if (!sessionId || !data?.saveMethod) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vytvoření Supabase klienta
    const supabase = createServerSupabaseClient()
    
    // Kontrola existence a platnosti session
    const { data: sessionData, error: sessionError } = await supabase
      .from('verification_sessions')
      .select('id, status, verification_result')
      .eq('id', sessionId)
      .single()
    
    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ error: 'Verification session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (sessionData.status !== 'completed' || sessionData.verification_result !== 'success') {
      return new Response(
        JSON.stringify({ error: 'Verification session is not successfully completed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generování unikátního hashe pro ověření
    const verificationHash = crypto.randomUUID()
    
    // Nastavení expirace (180 dní)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 180)

    // Uložení výsledku ověření
    const { data: savedVerification, error: saveError } = await supabase
      .from('saved_verifications')
      .insert({
        verification_hash: verificationHash,
        method: data.saveMethod,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()
    
    if (saveError || !savedVerification) {
      return new Response(
        JSON.stringify({ error: 'Failed to save verification result' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vytvoření záznamu o výsledku ověření
    const { error: resultError } = await supabase
      .from('verification_results')
      .insert({
        verification_id: sessionId,
        save_method: data.saveMethod,
        identifier: data.contactInfo || verificationHash,
        valid_until: expiresAt.toISOString(),
        metadata: {
          saveMethod: data.saveMethod,
          contactInfo: data.contactInfo,
          savedAt: new Date().toISOString()
        }
      })
    
    if (resultError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create verification result record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Odpověď
    const response: VerificationResponse = {
      success: true,
      message: 'Verification saved successfully',
      sessionId,
      data: {
        verificationHash,
        saveMethod: data.saveMethod,
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