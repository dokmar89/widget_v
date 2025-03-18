// Funkce pro odesílání ověřovacích kódů
export async function sendVerificationCode(
  method: 'email' | 'phone',
  recipient: string,
  code: string
): Promise<{ success: boolean, error?: string }> {
  try {
    if (method === 'email') {
      return await sendEmailVerificationCode(recipient, code)
    } else if (method === 'phone') {
      return await sendSmsVerificationCode(recipient, code)
    } else {
      return { success: false, error: 'Neplatná metoda ověření' }
    }
  } catch (error) {
    console.error('Chyba při odesílání ověřovacího kódu:', error)
    return { success: false, error: error.message }
  }
}

// Funkce pro odesílání ověřovacích kódů e-mailem
async function sendEmailVerificationCode(
  email: string,
  code: string
): Promise<{ success: boolean, error?: string }> {
  try {
    // V reálné implementaci bychom zde měli integraci s e-mailovým poskytovatelem
    // Například SendGrid, Mailchimp, Amazon SES, atp.
    
    // Příklad pro SendGrid:
    const apiKey = Deno.env.get('SENDGRID_API_KEY')
    
    if (!apiKey) {
      throw new Error('Chybí API klíč pro odesílání e-mailů')
    }
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }]
        }],
        from: { email: 'verification@passprove.com', name: 'PassProve Verification' },
        subject: 'Váš ověřovací kód',
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Váš ověřovací kód</h2>
              <p>Pro dokončení ověření věku použijte následující kód:</p>
              <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 10px;">${code}</h1>
              <p>Kód je platný po dobu 15 minut.</p>
              <p>Pokud jste o tento kód nežádali, ignorujte tento e-mail.</p>
            </div>
          `
        }]
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Chyba při odesílání e-mailu:', errorData)
      return { success: false, error: 'Nepodařilo se odeslat e-mail' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Chyba při odesílání e-mailu:', error)
    return { success: false, error: error.message }
  }
}

// Funkce pro odesílání ověřovacích kódů SMS
async function sendSmsVerificationCode(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean, error?: string }> {
  try {
    // V reálné implementaci bychom zde měli integraci s SMS poskytovatelem
    // Například Twilio, Vonage, MessageBird, atp.
    
    // Příklad pro Twilio:
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')
    
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error('Chybí přístupové údaje pro odesílání SMS')
    }
    
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const basicAuth = btoa(`${accountSid}:${authToken}`)
    
    const formData = new URLSearchParams()
    formData.append('To', phoneNumber)
    formData.append('From', twilioPhoneNumber)
    formData.append('Body', `Váš ověřovací kód pro PassProve je: ${code}. Kód je platný 15 minut.`)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Chyba při odesílání SMS:', errorData)
      return { success: false, error: 'Nepodařilo se odeslat SMS' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Chyba při odesílání SMS:', error)
    return { success: false, error: error.message }
  }
} 