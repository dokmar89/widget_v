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
    const { shopId } = await req.json()
    
    // Validace požadavku
    if (!shopId) {
      return new Response(
        JSON.stringify({ error: 'Shop ID je povinný parametr' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vytvoření Supabase klienta
    const supabase = createServerSupabaseClient()
    
    // Získání konfigurace widgetu pro daný e-shop
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single()
    
    if (shopError || !shopData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'E-shop nebyl nalezen' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Sestavení konfigurace widgetu
    const widgetConfig = {
      shopLogo: shopData.logo_url || null,
      welcomeText: shopData.welcome_text || "Vítejte! Pro pokračování je nutné ověřit váš věk.",
      primaryColor: shopData.primary_color || "#173B3F",
      secondaryColor: shopData.secondary_color || "#96C4C8",
      buttonShape: shopData.button_shape || "rounded",
      fontFamily: shopData.font_family || "inter",
      showBankID: shopData.show_bank_id !== false,
      showMojeID: shopData.show_moje_id !== false,
      showOCR: shopData.show_ocr !== false,
      showFaceScan: shopData.show_face_scan !== false,
      showReVerification: shopData.show_re_verification !== false,
      showQRCode: shopData.show_qr_code !== false
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