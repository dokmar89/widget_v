"use client"

import type React from "react"
import { useState, useEffect } from "react" 
import AgeVerificationModal from "@/components/age-verification-modal"
import { ApiService } from "@/config/api"

export interface PassProveWidgetProps {
  /**
   * ID e-shopu - **REQUIRED**
   */
  shopId: string; // Make shopId REQUIRED

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
  onVerificationSuccess?: (method: string) => void;

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
  shopId, // shopId is now REQUIRED and no default value
  shopLogo, // Removed default
  welcomeText, // Removed default
  primaryColor, // Removed default
  secondaryColor, // Removed default
  buttonShape, // Removed default
  fontFamily, // Removed default
  showBankID, // Removed default
  showMojeID, // Removed default
  showOCR, // Removed default
  showFaceScan, // Removed default
  showReVerification, // Removed default
  showQRCode, // Removed default
  onVerificationSuccess,
  onClose,
  buttonClassName = "", // Keep default for className if not provided
  buttonText = "Ověřit věk", // Keep default for button text if not provided
  autoOpen = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(autoOpen);
  const [widgetConfig, setWidgetConfig] = useState<PassProveWidgetProps | null>(null); // State for config
  const [configLoading, setConfigLoading] = useState(true); // Loading state for config
  const [configError, setConfigError] = useState<string | null>(null); // Error state for config

  useEffect(() => {
    const fetchConfig = async () => {
      setConfigLoading(true);
      setConfigError(null);
      try {
        if (!shopId) {
          throw new Error("Shop ID is required for PassProveWidget.");
        }
        const configResponse = await ApiService.getWidgetConfig(shopId);
        if (configResponse.success && configResponse.data) {
          setWidgetConfig(configResponse.data);
        } else {
          setConfigError(configResponse.message || 'Failed to load widget configuration.');
        }
      } catch (error: any) {
        setConfigError(error.message || 'Error loading widget configuration.');
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, [shopId]); // shopId in dependency array to refetch if shopId changes (unlikely in widget context)


  const handleVerificationSelected = (method: string) => {
    if (onVerificationSuccess) {
      onVerificationSuccess(method);
    }
    setIsModalOpen(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const getButtonClass = () => {
    let baseClass = "px-4 py-2 text-white";
    const currentButtonShape = widgetConfig?.buttonShape || buttonShape || "rounded"; // Default to 'rounded' if no config or prop

    switch (currentButtonShape) {
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

  if (configLoading) {
    return <div>Načítání widgetu pro ověření věku...</div>; // Or a loading spinner
  }

  if (configError) {
    return <div>Chyba při načítání widgetu: {configError}</div>; // Display error message
  }

  if (!widgetConfig) {
    return <div>Widget configuration missing.</div>; // Fallback in case config is unexpectedly null
  }


  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{ backgroundColor: widgetConfig.primaryColor || primaryColor || "#173B3F" }} // Fallback color
        className={getButtonClass()}
      >
        {buttonText}
      </button>

      <AgeVerificationModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onVerificationSelected={handleVerificationSelected}
        shopLogo={widgetConfig.shopLogo || shopLogo} // Use config value, then prop, then default from AgeVerificationModal
        welcomeText={widgetConfig.welcomeText || welcomeText}
        primaryColor={widgetConfig.primaryColor || primaryColor}
        secondaryColor={widgetConfig.secondaryColor || secondaryColor}
        buttonShape={widgetConfig.buttonShape || buttonShape}
        fontFamily={widgetConfig.fontFamily || fontFamily}
        showBankID={widgetConfig.showBankID ?? showBankID} // Use config value if available, otherwise prop
        showMojeID={widgetConfig.showMojeID ?? showMojeID}
        showOCR={widgetConfig.showOCR ?? showOCR}
        showFaceScan={widgetConfig.showFaceScan ?? showFaceScan}
        showReVerification={widgetConfig.showReVerification ?? showReVerification}
        showQRCode={widgetConfig.showQRCode ?? showQRCode}
        shopId={shopId} // Pass shopId - important for modal to function correctly
      />
    </>
  );
};

export default PassProveWidget;