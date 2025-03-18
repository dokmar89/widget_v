import { SupabaseClient } from 'npm:@supabase/supabase-js'

// Ceník pro jednotlivé metody ověření
export const VERIFICATION_PRICES = {
    bankid: 10.0,
    mojeid: 8.0,
    ocr: 15.0,
    facescan: 12.0,
    reverification: 2.0,
    qrcode: 5.0,
  }
  
  // Funkce pro získání ceny ověření podle metody a plánu e-shopu
  export async function getVerificationPrice(
    supabase: SupabaseClient,
    method: string,
    shopId: string
  ): Promise<number> {
    try {
      // Získání informací o obchodu a jeho cenovém plánu
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('pricing_plan')
        .eq('id', shopId)
        .single()
      
      if (shopError || !shopData) {
        throw new Error('Nepodařilo se načíst informace o obchodu')
      }
      
      // Získání ceny podle cenového plánu a metody ověření
      const { data: priceData, error: priceError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('category', 'pricing')
        .eq('key', `${method}_${shopData.pricing_plan}`)
        .single()
      
      if (priceError) {
        // Pokud není specifická cena pro kombinaci metoda+plán, zkusíme získat výchozí cenu pro metodu
        const { data: defaultPriceData, error: defaultPriceError } = await supabase
          .from('system_settings')
          .select('value')
          .eq('category', 'pricing')
          .eq('key', `${method}_default`)
          .single()
        
        if (defaultPriceError || !defaultPriceData) {
          throw new Error('Nepodařilo se načíst informace o ceně ověření')
        }
        
        return parseFloat(defaultPriceData.value.price)
      }
      
      return parseFloat(priceData.value.price)
    } catch (error) {
      console.error('Chyba při získávání ceny ověření:', error)
      throw error
    }
  }
  
  // Funkce pro kontrolu dostatečného zůstatku v peněžence
  export async function checkWalletBalance(
    supabase: SupabaseClient,
    companyId: string,
    amount: number
  ): Promise<boolean> {
    try {
      // Získání aktuálního zůstatku peněženky
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('walletBalance')
        .eq('id', companyId)
        .single()
      
      if (companyError || !companyData) {
        throw new Error('Nepodařilo se načíst informace o zůstatku peněženky')
      }
      
      // Kontrola, zda je zůstatek dostatečný
      return parseFloat(companyData.walletBalance) >= amount
    } catch (error) {
      console.error('Chyba při kontrole zůstatku peněženky:', error)
      throw error
    }
  }
  
  // Funkce pro provedení transakce
  export async function processVerificationPayment(
    supabase: SupabaseClient,
    companyId: string,
    amount: number,
    verificationId: string,
    method: string
  ): Promise<boolean> {
    try {
      // Kontrola, zda je zůstatek dostatečný
      const hasBalance = await checkWalletBalance(supabase, companyId, amount)
      
      if (!hasBalance) {
        throw new Error('Nedostatečný zůstatek peněženky')
      }
      
      // Odečtení částky z peněženky
      const { error: updateError } = await supabase.rpc('subtract_from_wallet', {
        company_id: companyId,
        amount_to_subtract: amount
      })
      
      if (updateError) {
        throw new Error('Nepodařilo se odečíst částku z peněženky')
      }
      
      // Vytvoření transakce
      const transactionNumber = generateTransactionNumber()
      
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          company_id: companyId,
          type: 'verification',
          amount: -amount, // Záporná hodnota pro odečet
          description: `Platba za ověření metodou ${method}`,
          status: 'completed',
          transaction_number: transactionNumber,
          metadata: {
            verificationId,
            method
          }
        })
      
      if (transactionError) {
        // Pokud se nepodaří vytvořit transakci, vrátíme peníze zpět
        await supabase.rpc('add_to_wallet', {
          company_id: companyId,
          amount_to_add: amount
        })
        
        throw new Error('Nepodařilo se vytvořit transakci')
      }
      
      return true
    } catch (error) {
      console.error('Chyba při zpracování platby za ověření:', error)
      throw error
    }
  }

  // Generování unikátního čísla transakce
  function generateTransactionNumber(): string {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `TR-${timestamp}-${random}`
  }