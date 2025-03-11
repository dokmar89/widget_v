"use client"

import type React from "react"
import { useState } from "react"
import AgeVerificationModal from "./components/age-verification-modal"

export interface PassProveWidgetProps {
  /**
   * URL loga e-shopu
   */
  shopLogo?: string

  /**
   * Uvítací text v modálním okně
   */
  welcomeText?: string

  /**
   * Primární barva (HEX)
   */
  primaryColor?: string

  /**
   * Sekundární barva (HEX)
   */
  secondaryColor?: string

  /**
   * Tvar tlačítek
   */
  buttonShape?: "rounded" | "square" | "pill"

  /**
   * Font
   */
  fontFamily?: "inter" | "roboto" | "poppins" | "open-sans" | "montserrat"

  /**
   * Zobrazit metodu BankID
   */
  showBankID?: boolean

  /**
   * Zobrazit metodu mojeID
   */
  showMojeID?: boolean

  /**
   * Zobrazit metodu OCR
   */
  showOCR?: boolean

  /**
   * Zobrazit metodu Face Scan
   */
  showFaceScan?: boolean

  /**
   * Zobrazit metodu opakovaného ověření
   */
  showReVerification?: boolean

  /**
   * Zobrazit metodu QR kódu
   */
  showQRCode?: boolean

  /**
   * Callback při úspěšném ověření
   */
  onVerificationSuccess?: (method: string) => void

  /**
   * Callback při zavření modálního okna
   */
  onClose?: () => void

  /**
   * Vlastní CSS třídy pro tlačítko
   */
  buttonClassName?: string

  /**
   * Text tlačítka
   */
  buttonText?: string

  /**
   * Automaticky otevřít modální okno při načtení stránky
   */
  autoOpen?: boolean
}

export const PassProveWidget: React.FC<PassProveWidgetProps> = ({
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
  const [isModalOpen, setIsModalOpen] = useState(autoOpen)

  const handleVerificationSelected = (method: string) => {
    if (onVerificationSuccess) {
      onVerificationSuccess(method)
    }
    setIsModalOpen(false)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    if (onClose) {
      onClose()
    }
  }

  const getButtonClass = () => {
    let baseClass = "px-4 py-2 text-white"

    switch (buttonShape) {
      case "square":
        baseClass += " rounded-none"
        break
      case "pill":
        baseClass += " rounded-full"
        break
      case "rounded":
      default:
        baseClass += " rounded-md"
        break
    }

    return `${baseClass} ${buttonClassName}`
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{ backgroundColor: primaryColor }}
        className={getButtonClass()}
      >
        {buttonText}
      </button>

      <AgeVerificationModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onVerificationSelected={handleVerificationSelected}
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
      />
    </>
  )
}

export default PassProveWidget

