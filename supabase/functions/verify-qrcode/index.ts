import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createServerSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { VerificationRequest, VerificationResponse } from '../_shared/types.ts'
import { generateQRCode } from '../_shared/qr-code.ts'

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
    const { sessionId } = await req.json() as VerificationRequest
    
    // Validace požadavku
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Chybí ID session' }),
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
    if (sessionData.verification_method !== 'qrcode') {
      return new Response(
        JSON.stringify({ error: 'Neplatná metoda ověření pro tento endpoint' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generování unikátního tokenu pro QR kód
    const verificationToken = crypto.randomUUID()
    
    // Aktualizace session s tokenem
    const { error: updateError } = await supabase
      .from('verification_sessions')
      .update({
        verification_details: {
          qrToken: verificationToken,
          generatedAt: new Date().toISOString()
        }
      })
      .eq('id', sessionId)
    
    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Nepodařilo se aktualizovat ověřovací session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // URL pro QR kód, který bude naskenován na mobilu
    const verificationUrl = `https://verify.passprove.com/qr/${verificationToken}`
    
    // Vygenerování QR kódu
    const qrCodeBase64 = await generateQRCode(verificationUrl)
    
    // Logování události
    await supabase
      .from('verification_logs')
      .insert({
        session_id: sessionId,
        event_type: 'qr_code_generated',
        details: {
          method: 'qrcode',
          token: verificationToken
        }
      })

    // Odpověď
    const response: VerificationResponse = {
      success: true,
      message: 'QR kód byl úspěšně vygenerován',
      sessionId,
      data: {
        qrCodeUrl: qrCodeBase64,
        expiresIn: 300 // 5 minut platnost
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
