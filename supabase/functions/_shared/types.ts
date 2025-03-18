export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface VerificationRequest {
  method: string;
  shopId: string;
  sessionId?: string;
  data?: any;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  data?: any;
}

export type SaveMethod = 'cookie' | 'phone' | 'email' | 'apple' | 'google';

export interface Database {
  public: {
    Tables: {
      // Definice tabulek podle existující databáze
      // Zde by byly definovány všechny tabulky z poskytnutého schématu
    }
  }
}