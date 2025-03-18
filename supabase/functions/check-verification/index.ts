import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createServerSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { VerificationResponse } from '../_shared/types.ts'

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  // Pouze GET požadavky
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Extrahovat hash nebo sessionId z URL parametrů
    const url = new URL(req.url)
    const hash = url.searchParams.get('hash')
    const sessionId = url.searchParams.get('sessionId')
    
    if (!hash && !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Chybí hash nebo sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vytvoření Supabase klienta
    const supabase = createServerSupabaseClient()
    
    let verified = false
    let verificationDetails = null
    
    if (hash) {
      // Kontrola platnosti hashe
      const { data: savedVerification, error: savedVerificationError } = await supabase
        .from('saved_verifications')
        .select('*')
        .eq('verification_hash', hash)
        .gte('expires_at', new Date().toISOString())
        .single()
      
      if (savedVerificationError) {
        return new Response(
          JSON.stringify({ error: 'Verifikační hash nebyl nalezen nebo vypršel' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      verified = true
      verificationDetails = savedVerification
    } else if (sessionId) {
      // Kontrola stavu ověření pro danou session
      const { data: sessionData, error: sessionError } = await supabase
        .from('verification_sessions')
        .select('status, verification_result, completed_at, verification_details')
        .eq('id', sessionId)
        .single()
      
      if (sessionError) {
        return new Response(
          JSON.stringify({ error: 'Ověřovací session nebyla nalezena' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (sessionData.status === 'completed' && sessionData.verification_result === 'success') {
        verified = true
        verificationDetails = {
          sessionId,
          completedAt: sessionData.completed_at,
          details: sessionData.verification_details
        }
      }
    }

    // Odpověď
    const response: VerificationResponse = {
      success: true,
      message: verified ? 'Verifikace je platná' : 'Verifikace nenalezena nebo vypršela',
      data: {
        verified,
        details: verificationDetails
      }
    }

    // Logování kontroly
    if (verified) {
      await supabase
        .from('verification_logs')
        .insert({
          session_id: sessionId || null,
          event_type: 'verification_check',
          details: {
            hash: hash || null,
            sessionId: sessionId || null,
            result: 'valid'
          }
        })
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