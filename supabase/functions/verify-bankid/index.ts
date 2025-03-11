import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createServerSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { VerificationRequest, VerificationResponse } from '../_shared/types.ts'
import { processTransaction } from '../_shared/pricing.ts'

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
    const { sessionId, data } = await req.json() as VerificationRequest
    
    // Validace požadavku
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing session ID' }),
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
        JSON.stringify({ error: 'Verification session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (sessionData.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Verification session is not in pending state' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (new Date(sessionData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Verification session has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (sessionData.verification_method !== 'bankid') {
      return new Response(
        JSON.stringify({ error: 'Invalid verification method for this endpoint' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Získání informací o e-shopu
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select('id, company_id')
      .eq('id', sessionData.shop_id)
      .single()
    
    if (shopError || !shopData) {
      return new Response(
        JSON.stringify({ error: 'Shop not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Získání záznamu o ověření
    const { data: verificationData, error: verificationError } = await supabase
      .from('verifications')
      .select('id, price, status')
      .eq('session_id', sessionId)
      .single()
    
    if (verificationError || !verificationData) {
      return new Response(
        JSON.stringify({ error: 'Verification record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (verificationData.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Verification is not in pending state' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Simulace ověření BankID (v reálném prostředí by zde byla integrace s BankID API)
    // V produkci by zde byla skutečná implementace volání BankID API
    const bankIdVerificationResult = {
      success: true,
      verified: true,
      age: 25, // Věk získaný z BankID
      verificationData: {
        provider: 'BankID',
        bankName: 'Demo Bank',
        verificationTime: new Date().toISOString(),
        transactionId: `bankid-${Math.random().toString(36).substring(2, 15)}`
      }
    }

    // Zpracování platby
    const transactionSuccess = await processTransaction(
      supabase,
      shopData.company_id,
      verificationData.price,
      verificationData.id,
      'bankid'
    )
    
    if (!transactionSuccess) {
      return new Response(
        JSON.stringify({ error: 'Failed to process payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Aktualizace session
    const { error: updateSessionError } = await supabase
      .from('verification_sessions')
      .update({
        status: bankIdVerificationResult.success ? 'completed' : 'failed',
        verification_result: bankIdVerificationResult.verified ? 'success' : 'failure',
        verification_details: {
          ...sessionData.verification_details,
          result: bankIdVerificationResult
        },
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId)
    
    if (updateSessionError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update verification session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Aktualizace záznamu o ověření
    const { error: updateVerificationError } = await supabase
      .from('verifications')
      .update({
        result: bankIdVerificationResult.verified ? 'success' : 'failure',
        status: 'completed',
        completed_at: new Date().toISOString(),
        metadata: bankIdVerificationResult.verificationData
      })
      .eq('id', verificationData.id)
    
    if (updateVerificationError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update verification record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Odpověď
    const response: VerificationResponse = {
      success: bankIdVerificationResult.success,
      message: bankIdVerificationResult.success ? 'Verification successful' : 'Verification failed',
      sessionId,
      data: {
        verified: bankIdVerificationResult.verified,
        age: bankIdVerificationResult.age,
        provider: 'BankID',
        verificationId: verificationData.id
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