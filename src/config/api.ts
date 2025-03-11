// Konfigurace API endpointů
export const API_CONFIG = {
    // Základní URL pro API
    BASE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://uaduwdrxzogiiwtnmpcu.supabase.co/functions/v1' 
      : 'http://localhost:54321/functions/v1',
    
    // Endpointy pro jednotlivé metody ověření
    ENDPOINTS: {
      CREATE_SESSION: '/create-session',
      BANK_ID: '/verify-bankid',
      MOJE_ID: '/verify-mojeid',
      OCR: '/verify-ocr',
      FACE_SCAN: '/verify-facescan',
      RE_VERIFICATION: '/verify-reverification',
      QR_CODE: '/verify-qrcode',
      SAVE_VERIFICATION: '/save-verification',
      CHECK_VERIFICATION: '/check-verification',
      CHECK_VERIFICATION_STATUS: '/check-verification-status',
      NATIVE_VERIFICATION_URL: '/native-verification-url',
    },
    
    // Timeout pro API požadavky (v ms)
    TIMEOUT: 30000,
  }