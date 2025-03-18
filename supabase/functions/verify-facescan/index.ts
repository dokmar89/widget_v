import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createServerSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { VerificationRequest, VerificationResponse } from '../_shared/types.ts'
import { getFaceAnalysisAPI } from '../_shared/external-api.ts'

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
    const { sessionId, data } = await req.json() as VerificationRequest & { data: { imageBase64: string } }
    
    // Validace požadavku
    if (!sessionId || !data?.imageBase64) {
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
    if (sessionData.verification_method !== 'facescan') {
      return new Response(
        JSON.stringify({ error: 'Neplatná metoda ověření pro tento endpoint' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Uložení obrázku do Storage
    const imageData = data.imageBase64.split(',')[1] // Odstranění prefixu "data:image/jpeg;base64,"
    const imageBuffer = Uint8Array.from(atob(imageData), c => c.charCodeAt(0))
    
    const fileName = `${sessionId}-face-${Date.now()}.jpg`
    const { error: uploadError } = await supabase
      .storage
      .from('verification-documents')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      })
    
    if (uploadError) {
      return new Response(
        JSON.stringify({ error: 'Nepodařilo se nahrát obrázek obličeje' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Získat URL pro veřejný přístup k souboru
    const { data: urlData } = await supabase
      .storage
      .from('verification-documents')
      .getPublicUrl(fileName)
    
    if (!urlData?.publicUrl) {
      return new Response(
        JSON.stringify({ error: 'Nepodařilo se získat URL obrázku' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Volání externí API pro analýzu obličeje
    const faceAnalysisResult = await getFaceAnalysisAPI(urlData.publicUrl)
    
    let verificationResult = {
      success: false,
      verified: false,
      age: 0,
      confidence: 0,
      verificationData: {}
    }
    
    if (faceAnalysisResult && faceAnalysisResult.success) {
      // Kontrola, zda odhadovaný věk je 18+
      const isAdult = faceAnalysisResult.age >= 18
      
      verificationResult = {
        success: true,
        verified: isAdult,
        age: faceAnalysisResult.age,
        confidence: faceAnalysisResult.confidence,
        verificationData: {
          provider: 'FaceAnalysisAPI',
          estimatedAge: faceAnalysisResult.age,
          faceImagePath: fileName,
          gender: faceAnalysisResult.gender,
          confidence: faceAnalysisResult.confidence,
          verificationTime: new Date().toISOString()
        }
      }
    }

    // Aktualizace session
    const { error: updateError } = await supabase
      .from('verification_sessions')
      .update({
        status: verificationResult.success ? 'completed' : 'failed',
        verification_result: verificationResult.verified ? 'success' : 'failure',
        verification_details: verificationResult.verificationData,
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId)
    
    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Nepodařilo se aktualizovat ověřovací session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Uložení výsledku ověření
    const { error: resultError } = await supabase
      .from('verifications')
      .update({
        result: verificationResult.verified ? 'success' : 'failure',
        status: 'completed',
        completed_at: new Date().toISOString(),
        metadata: {
          method: 'facescan',
          age: verificationResult.age,
          confidence: verificationResult.confidence,
          imageUrl: urlData.publicUrl
        }
      })
      .eq('session_id', sessionId)
    
    if (resultError) {
      return new Response(
        JSON.stringify({ error: 'Nepodařilo se uložit výsledek ověření' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Logování události
    await supabase
      .from('verification_logs')
      .insert({
        session_id: sessionId,
        event_type: verificationResult.verified ? 'verification_success' : 'verification_failed',
        details: {
          method: 'facescan',
          result: verificationResult
        }
      })

    // Odpověď
    const response: VerificationResponse = {
      success: verificationResult.success,
      message: verificationResult.verified 
        ? 'Ověření bylo úspěšné' 
        : 'Nepodařilo se ověřit věk. Věk musí být 18+.',
      sessionId,
      data: {
        verified: verificationResult.verified,
        age: verificationResult.age,
        provider: 'FaceAnalysisAPI'
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