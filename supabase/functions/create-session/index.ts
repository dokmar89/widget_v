import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createServerSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { VerificationRequest, VerificationResponse } from '../_shared/types.ts'
import { getVerificationPrice, checkWalletBalance } from '../_shared/pricing.ts'

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
    const { method, shopId, data } = await req.json() as VerificationRequest
    
    // Validace požadavku
    if (!method || !shopId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vytvoření Supabase klienta
    const supabase = createServerSupabaseClient()
    
    // Kontrola existence e-shopu
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select('id, company_id, status, verification_methods')
      .eq('id', shopId)
      .eq('status', 'active')
      .single()
    
    if (shopError || !shopData) {
      return new Response(
        JSON.stringify({ error: 'Shop not found or inactive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Kontrola, zda e-shop podporuje zvolenou metodu ověření
    if (!shopData.verification_methods.includes(method)) {
      return new Response(
        JSON.stringify({ error: 'Verification method not supported by this shop' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Získání ceny ověření
    const price = await getVerificationPrice(supabase, method, shopId)
    
    // Kontrola zůstatku v peněžence
    const hasBalance = await checkWalletBalance(supabase, shopData.company_id, price)
    
    if (!hasBalance) {
      return new Response(
        JSON.stringify({ error: 'Insufficient wallet balance' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vytvoření nové session
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Platnost 1 hodina
    
    const { data: sessionData, error: sessionError } = await supabase
      .from('verification_sessions')
      .insert({
        shop_id: shopId,
        status: 'pending',
        verification_method: method,
        verification_details: data || {},
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get('X-Forwarded-For') || req.headers.get('CF-Connecting-IP'),
        user_agent: req.headers.get('User-Agent')
      })
      .select()
      .single()
    
    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ error: 'Failed to create verification session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Vytvoření záznamu o ověření
    const { data: verificationData, error: verificationError } = await supabase
      .from('verifications')
      .insert({
        shop_id: shopId,
        method: method,
        result: 'pending',
        price: price,
        session_id: sessionData.id,
        status: 'pending'
      })
      .select()
      .single()
    
    if (verificationError || !verificationData) {
      return new Response(
        JSON.stringify({ error: 'Failed to create verification record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Odpověď
    const response: VerificationResponse = {
      success: true,
      message: 'Verification session created successfully',
      sessionId: sessionData.id,
      data: {
        expiresAt: sessionData.expires_at,
        verificationId: verificationData.id,
        price: price
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