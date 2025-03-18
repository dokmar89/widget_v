import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createServerSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

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
    const { apiKey } = await req.json()
    
    // Validace požadavku
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API klíč je povinný parametr' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vytvoření Supabase klienta
    const supabase = createServerSupabaseClient()
    
    // Získání konfigurace widgetu pro daný e-shop podle API klíče
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select('*')
      .eq('api_key', apiKey)
      .single()
    
    if (shopError || !shopData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Neplatný API klíč nebo e-shop nebyl nalezen' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Kontrola stavu e-shopu
    if (shopData.status !== 'active') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'E-shop není aktivní' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sestavení konfigurace widgetu
    const widgetConfig = {
      shopId: shopData.id,
      shopLogo: shopData.logo_url || null,
      welcomeText: shopData.welcome_text || "Vítejte! Pro pokračování je nutné ověřit váš věk.",
      primaryColor: shopData.primary_color || "#173B3F",
      secondaryColor: shopData.secondary_color || "#96C4C8",
      buttonShape: shopData.button_shape || "rounded",
      fontFamily: shopData.font_family || "inter",
      showBankID: shopData.verification_methods?.includes('bank_id') !== false,
      showMojeID: shopData.verification_methods?.includes('moje_id') !== false,
      showOCR: shopData.verification_methods?.includes('ocr') !== false,
      showFaceScan: shopData.verification_methods?.includes('face_scan') !== false,
      showReVerification: shopData.verification_methods?.includes('re_verification') !== false,
      showQRCode: shopData.verification_methods?.includes('qr_code') !== false
    }
    
    // Vrácení úspěšné odpovědi
    return new Response(
      JSON.stringify({
        success: true,
        data: widgetConfig
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Chyba při získávání konfigurace widgetu:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Došlo k chybě při zpracování požadavku',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    )
  }
}) 