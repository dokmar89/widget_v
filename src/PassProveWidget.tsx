"use client"

import type React from "react"
import { useState, useEffect } from "react"
import AgeVerificationModal from "./components/age-verification-modal"
import { ApiService } from "./services/api"

export interface PassProveWidgetProps {
  /**
   * ID e-shopu
   */
  shopId: string;

  /**
   * URL loga e-shopu
   */
  shopLogo?: string;

  /**
   * Uvítací text v modálním okně
   */
  welcomeText?: string;

  /**
   * Primární barva (HEX)
   */
  primaryColor?: string;

  /**
   * Sekundární barva (HEX)
   */
  secondaryColor?: string;

  /**
   * Tvar tlačítek
   */
  buttonShape?: "rounded" | "square" | "pill";

  /**
   * Font
   */
  fontFamily?: "inter" | "roboto" | "poppins" | "open-sans" | "montserrat";

  /**
   * Zobrazit metodu BankID
   */
  showBankID?: boolean;

  /**
   * Zobrazit metodu mojeID
   */
  showMojeID?: boolean;

  /**
   * Zobrazit metodu OCR
   */
  showOCR?: boolean;

  /**
   * Zobrazit metodu Face Scan
   */
  showFaceScan?: boolean;

  /**
   * Zobrazit metodu opakovaného ověření
   */
  showReVerification?: boolean;

  /**
   * Zobrazit metodu QR kódu
   */
  showQRCode?: boolean;

  /**
   * Callback při úspěšném ověření
   */
  onVerificationSuccess?: (method: string, verificationData?: any) => void;

  /**
   * Callback při zavření modálního okna
   */
  onClose?: () => void;

  /**
   * Vlastní CSS třídy pro tlačítko
   */
  buttonClassName?: string;

  /**
   * Text tlačítka
   */
  buttonText?: string;

  /**
   * Automaticky otevřít modální okno při načtení stránky
   */
  autoOpen?: boolean;
}

export const PassProveWidget: React.FC<PassProveWidgetProps> = ({
  shopId,
  shopLogo = "/placeholder.svg?height=60&width=120",
  welcomeText = "Vítejte! Pro pokračování je nutné ověřit váš věk.",
  primaryColor = "#173B3F",
  secondaryColor = "#96C4C8",
  buttonShape = "rounded",
  fontFamily = "inter",
  showBankID = true,
  showMojeID = true,
  showOCR = true,
  showFaceScan = true,
  showReVerification = true,
  showQRCode = true,
  onVerificationSuccess,
  onClose,
  buttonClassName = "",
  buttonText = "Ověřit věk",
  autoOpen = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(autoOpen);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Kontrola tokenu při načtení komponenty
  useEffect(() => {
    const checkExistingVerification = async () => {
      const token = localStorage.getItem('passprove_verification_token');
      
      if (token) {
        try {
          const response = await ApiService.checkVerificationHash(token);
          
          if (response.success && response.data?.verified) {
            // Existuje platné ověření
            if (onVerificationSuccess) {
              onVerificationSuccess('stored', response.data?.details);
            }
          }
        } catch (error) {
          console.error('Chyba při kontrole tokenu:', error);
          localStorage.removeItem('passprove_verification_token');
        }
      }
    };
    
    checkExistingVerification();
  }, [onVerificationSuccess]);

  const handleVerificationSelected = async (method: string) => {
    try {
      setLoading(true);
      
      // Vytvoření nové session pro ověření
      const response = await ApiService.createSession(method, shopId);
      
      if (response.success && response.sessionId) {
        setSessionId(response.sessionId);
      } else {
        console.error('Nepodařilo se vytvořit session:', response.message);
      }
    } catch (error) {
      console.error('Chyba při vytváření session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = (method: string, result: boolean, data?: any) => {
    if (result && onVerificationSuccess) {
      onVerificationSuccess(method, data);
    }
    setIsModalOpen(false);
    setSessionId(null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSessionId(null);
    if (onClose) {
      onClose();
    }
  };

  const getButtonClass = () => {
    let baseClass = "px-4 py-2 text-white";

    switch (buttonShape) {
      case "square":
        baseClass += " rounded-none";
        break;
      case "pill":
        baseClass += " rounded-full";
        break;
      case "rounded":
      default:
        baseClass += " rounded-md";
        break;
    }

    return `${baseClass} ${buttonClassName}`;
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{ backgroundColor: primaryColor }}
        className={getButtonClass()}
        disabled={loading}
      >
        {loading ? "Načítání..." : buttonText}
      </button>

      <AgeVerificationModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onVerificationSelected={handleVerificationSelected}
        onVerificationComplete={handleVerificationComplete}
        shopLogo={shopLogo}
        welcomeText={welcomeText}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        buttonShape={buttonShape}
        fontFamily={fontFamily}
        showBankID={showBankID}
        showMojeID={showMojeID}
        showOCR={showOCR}
        showFaceScan={showFaceScan}
        showReVerification={showReVerification}
        showQRCode={showQRCode}
        sessionId={sessionId}
      />
    </>
  );
};

export default PassProveWidget;