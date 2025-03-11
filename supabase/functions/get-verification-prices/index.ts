import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createServerSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { getVerificationPrice } from '../_shared/pricing.ts'

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
    // Získání shopId z URL parametrů
    const url = new URL(req.url)
    const shopId = url.searchParams.get('shopId')
    
    if (!shopId) {
      return new Response(
        JSON.stringify({ error: 'Chybí ID obchodu' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vytvoření Supabase klienta
    const supabase = createServerSupabaseClient()
    
    // Kontrola existence obchodu
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select('id, status, verification_methods')
      .eq('id', shopId)
      .eq('status', 'active')
      .single()
    
    if (shopError || !shopData) {
      return new Response(
        JSON.stringify({ error: 'Obchod nebyl nalezen nebo není aktivní' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Získání cen pro jednotlivé metody
    const prices: Record<string, number> = {}
    
    for (const method of shopData.verification_methods) {
      try {
        const price = await getVerificationPrice(supabase, method, shopId)
        prices[method] = price
      } catch (error) {
        console.error(`Chyba při získávání ceny pro metodu ${method}:`, error)
        prices[method] = 0 // Výchozí hodnota v případě chyby
      }
    }

    // Odpověď
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ceny ověřovacích metod byly úspěšně načteny',
        data: {
          shopId,
          prices
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 