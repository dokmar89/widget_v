// Funkce pro generování verifikačního hashe
export async function generateVerificationHash(
  sessionId: string,
  method: string,
  identifier: string
): Promise<string> {
  try {
    // Vytvoření náhodného tokenu
    const randomBytes = new Uint8Array(32)
    crypto.getRandomValues(randomBytes)
    
    // Kombinace náhodných bytů s dalšími daty
    const data = `${sessionId}_${method}_${identifier}_${Date.now()}_${Array.from(randomBytes).join('')}`
    
    // Vytvoření SHA-256 hashe
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    
    // Konverze na hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return hashHex
  } catch (error) {
    console.error('Chyba při generování hashe:', error)
    throw new Error('Nepodařilo se vygenerovat verifikační hash')
  }
} 