import * as qrcode from 'https://esm.sh/qrcode@1.5.1'

// Funkce pro generování QR kódu
export async function generateQRCode(text: string): Promise<string> {
  try {
    const qrCodeDataUrl = await qrcode.toDataURL(text, {
      errorCorrectionLevel: 'H', // Vysoká úroveň korekce chyb
      margin: 1,
      width: 256,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    return qrCodeDataUrl
  } catch (error) {
    console.error('Chyba při generování QR kódu:', error)
    throw new Error('Nepodařilo se vygenerovat QR kód')
  }
} 