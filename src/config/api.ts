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

// Vytvořte nový soubor api.ts
export class ApiService {
  private static async makeRequest(endpoint: string, data?: any) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Chyba při komunikaci se serverem',
      };
    }
  }

  static async getWidgetConfig(shopId: string) {
    return this.makeRequest('/widget-config', { shopId });
  }

  static async getVerificationPrices(shopId: string) {
    return this.makeRequest('/verification-prices', { shopId });
  }

  static async createSession(shopId: string, method: string) {
    return this.makeRequest('/create-session', { shopId, method });
  }

  static async verifyWithBankId(sessionId: string, data: any) {
    return this.makeRequest('/verify-bankid', { sessionId, data });
  }

  static async verifyWithMojeId(sessionId: string, data: any) {
    return this.makeRequest('/verify-mojeid', { sessionId, data });
  }

  static async verifyWithFaceScan(sessionId: string, imageData: string) {
    return this.makeRequest('/verify-facescan', { sessionId, imageData });
  }

  static async verifyWithOcr(sessionId: string, imageData: string) {
    return this.makeRequest('/verify-ocr', { sessionId, imageData });
  }

  static async verifyWithQrCode(sessionId: string) {
    return this.makeRequest('/verify-qrcode', { sessionId });
  }

  static async verifyWithReVerification(sessionId: string, data: any) {
    return this.makeRequest('/verify-reverification', { sessionId, data });
  }

  static async checkVerificationStatus(sessionId: string) {
    return this.makeRequest('/check-verification-status', { sessionId });
  }

  static async checkVerificationHash(hash: string) {
    return this.makeRequest('/check-verification-hash', { hash });
  }

  static async verifyCode(sessionId: string, method: string, identifier: string, code: string) {
    return this.makeRequest('/verify-code', { sessionId, method, identifier, code });
  }
}