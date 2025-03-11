"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, CreditCard, Scan, Camera, RefreshCw, QrCode, X, Shield, Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import FaceScanVerification from "./components/face-scan-verification"
import OCRVerification from "./components/ocr-verification"
import ReVerification from "./components/re-verification"
import QRVerification from "./components/qr-verification"
import SaveVerificationResult from "./components/save-verification-result"

interface AgeVerificationProps {
  // Customizable elements
  shopLogo?: string
  welcomeText?: string
  primaryColor?: string
  secondaryColor?: string
  buttonShape?: "rounded" | "square" | "pill"
  fontFamily?: "inter" | "roboto" | "poppins" | "open-sans" | "montserrat"
  showBankID?: boolean
  showMojeID?: boolean
  showOCR?: boolean
  showFaceScan?: boolean
  showReVerification?: boolean
  showQRCode?: boolean
  onVerificationSelected: (method: string) => void
  onClose: () => void
  isOpen: boolean
  shopId: string
}

type VerificationMethod = "bankid" | "mojeid" | "ocr" | "facescan" | "reverification" | "qrcode" | null

export default function AgeVerificationModal({
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
  onVerificationSelected,
  onClose,
  isOpen,
}: AgeVerificationProps) {
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null)
  const [activeMethod, setActiveMethod] = useState<VerificationMethod>(null)
  const [showSaveOptions, setShowSaveOptions] = useState(false)
  const [lastSuccessMethod, setLastSuccessMethod] = useState<string | null>(null)

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setActiveMethod(null)
      setShowSaveOptions(false)
      setLastSuccessMethod(null)
      setHoveredMethod(null)
    }
  }, [isOpen])

  const getButtonClass = () => {
    switch (buttonShape) {
      case "square":
        return "rounded-none"
      case "pill":
        return "rounded-full"
      case "rounded":
      default:
        return "rounded-md"
    }
  }

  const getCardClass = () => {
    const baseClass = "group h-full cursor-pointer transition-all border-2 shadow-sm hover:shadow-md"

    switch (buttonShape) {
      case "square":
        return `${baseClass} rounded-none`
      case "pill":
        return `${baseClass} rounded-xl`
      case "rounded":
      default:
        return `${baseClass} rounded-md`
    }
  }

  const cardClass = getCardClass()
  const buttonClass = getButtonClass()

  const verificationMethods = [
    {
      id: "bankid",
      name: "BankID",
      description: "Ověření pomocí bankovní identity",
      detailedInfo:
        "Rychlé a bezpečné ověření věku prostřednictvím vaší bankovní identity. Podporuje většinu českých bank.",
      icon: <CreditCard className="h-6 w-6" />,
      show: showBankID,
      securityLevel: "Vysoká",
    },
    {
      id: "mojeid",
      name: "mojeID",
      description: "Ověření pomocí mojeID",
      detailedInfo: "Ověření věku pomocí služby mojeID, kterou poskytuje CZ.NIC.",
      icon: <Scan className="h-6 w-6" />,
      show: showMojeID,
      securityLevel: "Vysoká",
    },
    {
      id: "ocr",
      name: "OCR",
      description: "Ověření pomocí dokladu totožnosti",
      detailedInfo: "Naskenujte svůj doklad totožnosti pro ověření věku. Podporujeme občanský průkaz a cestovní pas.",
      icon: <Scan className="h-6 w-6" />,
      show: showOCR,
      securityLevel: "Střední",
    },
    {
      id: "facescan",
      name: "Face Scan",
      description: "Ověření pomocí rozpoznání obličeje",
      detailedInfo: "Rychlé ověření věku pomocí technologie rozpoznávání obličeje.",
      icon: <Camera className="h-6 w-6" />,
      show: showFaceScan,
      securityLevel: "Střední",
    },
    {
      id: "reverification",
      name: "Opakované ověření",
      description: "Použít předchozí ověření",
      detailedInfo: "Pokud jste již dříve prošli ověřením, můžete použít tuto možnost pro rychlejší proces.",
      icon: <RefreshCw className="h-6 w-6" />,
      show: showReVerification,
      securityLevel: "Střední",
    },
    {
      id: "qrcode",
      name: "QR kód",
      description: "Ověření pomocí QR kódu",
      detailedInfo: "Naskenujte QR kód pomocí mobilního zařízení pro ověření věku.",
      icon: <QrCode className="h-6 w-6" />,
      show: showQRCode,
      securityLevel: "Střední",
    },
  ]

  const filteredMethods = verificationMethods.filter((method) => method.show)

  const handleMethodClick = (methodId: string) => {
    setActiveMethod(methodId as VerificationMethod)

    // Pro metody, které nejsou implementovány, jen zavolat callback a nabídnout uložení
    if (methodId !== "facescan" && methodId !== "ocr" && methodId !== "reverification" && methodId !== "qrcode") {
      setLastSuccessMethod(methodId)
      setShowSaveOptions(true)
    }
  }

  const handleVerificationComplete = (success: boolean) => {
    if (success) {
      // Pokud jde o opakované ověření, rovnou dokončíme proces bez nabízení uložení
      if (activeMethod === "reverification") {
        onVerificationSelected(activeMethod)
        return
      }

      // Pro ostatní metody nabídneme uložení výsledku
      if (activeMethod) {
        setLastSuccessMethod(activeMethod)
        setShowSaveOptions(true)
      } else {
        // If verification was successful, call the callback
        onVerificationSelected(activeMethod as unknown as string)
      }
    } else {
      // If verification failed, go back to method selection
      setActiveMethod(null)
    }
  }

  const handleSaveComplete = () => {
    // After saving, call the callback with the last successful method
    if (lastSuccessMethod) {
      onVerificationSelected(lastSuccessMethod)
    }
    setShowSaveOptions(false)
    setActiveMethod(null)
  }

  const handleSaveSkip = () => {
    // Skip saving, just call the callback with the last successful method
    if (lastSuccessMethod) {
      onVerificationSelected(lastSuccessMethod)
    }
    setShowSaveOptions(false)
    setActiveMethod(null)
  }

  const renderSidebarContent = () => {
    if (activeMethod === "facescan") {
      return (
        <>
          <h2 className="text-xl font-bold mb-4">PassProve</h2>

          <h3 className="text-lg font-medium mb-3">Face Scan</h3>

          <p className="text-white/80 text-sm">Ověření pomocí rozpoznání obličeje</p>

          <div className="mt-6 pt-4 border-t border-white/20 w-full">
            <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
              <Lock className="h-4 w-4" />
              <span>Šifrovaný přenos dat</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
              <Shield className="h-4 w-4" />
              <span>Zabezpečené ověření</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-xs text-white/70 mt-6">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WjkAe8ZTI3kS5AbMKIqw66tQ99eoFP.png"
                alt="PassProve Logo"
                className="h-6"
              />
              <span className="text-xs">Zabezpečeno technologií PassProve</span>
            </div>
          </div>
        </>
      )
    } else if (activeMethod === "ocr") {
      return (
        <>
          <h2 className="text-xl font-bold mb-4">PassProve</h2>

          <h3 className="text-lg font-medium mb-3">OCR</h3>

          <p className="text-white/80 text-sm">Ověření pomocí dokladu totožnosti</p>

          <div className="mt-6 pt-4 border-t border-white/20 w-full">
            <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
              <Lock className="h-4 w-4" />
              <span>Šifrovaný přenos dat</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
              <Shield className="h-4 w-4" />
              <span>Zabezpečené ověření</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-xs text-white/70 mt-6">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WjkAe8ZTI3kS5AbMKIqw66tQ99eoFP.png"
                alt="PassProve Logo"
                className="h-6"
              />
              <span className="text-xs">Zabezpečeno technologií PassProve</span>
            </div>
          </div>
        </>
      )
    } else if (activeMethod === "reverification") {
      return (
        <>
          <h2 className="text-xl font-bold mb-4">PassProve</h2>

          <h3 className="text-lg font-medium mb-3">Opakované ověření</h3>

          <p className="text-white/80 text-sm">Rychlé ověření pomocí předchozího ověření</p>

          <div className="mt-6 pt-4 border-t border-white/20 w-full">
            <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
              <Lock className="h-4 w-4" />
              <span>Šifrovaný přenos dat</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
              <Shield className="h-4 w-4" />
              <span>Zabezpečené ověření</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-xs text-white/70 mt-6">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WjkAe8ZTI3kS5AbMKIqw66tQ99eoFP.png"
                alt="PassProve Logo"
                className="h-6"
              />
              <span className="text-xs">Zabezpečeno technologií PassProve</span>
            </div>
          </div>
        </>
      )
    } else if (activeMethod === "qrcode") {
      return (
        <>
          <h2 className="text-xl font-bold mb-4">PassProve</h2>

          <h3 className="text-lg font-medium mb-3">QR kód</h3>

          <p className="text-white/80 text-sm">Ověření pomocí jiného zařízení</p>

          <div className="mt-6 pt-4 border-t border-white/20 w-full">
            <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
              <Lock className="h-4 w-4" />
              <span>Šifrovaný přenos dat</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
              <Shield className="h-4 w-4" />
              <span>Zabezpečené ověření</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-xs text-white/70 mt-6">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WjkAe8ZTI3kS5AbMKIqw66tQ99eoFP.png"
                alt="PassProve Logo"
                className="h-6"
              />
              <span className="text-xs">Zabezpečeno technologií PassProve</span>
            </div>
          </div>
        </>
      )
    } else if (showSaveOptions) {
      return (
        <>
          <h2 className="text-xl font-bold mb-4">PassProve</h2>

          <h3 className="text-lg font-medium mb-3">Uložení výsledku</h3>

          <p className="text-white/80 text-sm">Uložte si výsledek ověření pro příští návštěvu</p>

          <div className="mt-6 pt-4 border-t border-white/20 w-full">
            <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
              <Lock className="h-4 w-4" />
              <span>Šifrovaný přenos dat</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
              <Shield className="h-4 w-4" />
              <span>Zabezpečené ověření</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-xs text-white/70 mt-6">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WjkAe8ZTI3kS5AbMKIqw66tQ99eoFP.png"
                alt="PassProve Logo"
                className="h-6"
              />
              <span className="text-xs">Zabezpečeno technologií PassProve</span>
            </div>
          </div>
        </>
      )
    }

    return (
      <>
        <h2 className="text-xl font-bold mb-4">PassProve</h2>

        <h3 className="text-lg font-medium mb-3">Ověření věku</h3>

        {welcomeText && (
          <p className="text-white/80 text-sm">
            {welcomeText.length > 150 ? `${welcomeText.substring(0, 150)}...` : welcomeText}
          </p>
        )}

        <div className="mt-6 pt-4 border-t border-white/20 w-full">
          <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
            <Lock className="h-4 w-4" />
            <span>Šifrovaný přenos dat</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
            <Shield className="h-4 w-4" />
            <span>Zabezpečené ověření</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-xs text-white/70 mt-6">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WjkAe8ZTI3kS5AbMKIqw66tQ99eoFP.png"
              alt="PassProve Logo"
              className="h-6"
            />
            <span className="text-xs">Zabezpečeno technologií PassProve</span>
          </div>
        </div>
      </>
    )
  }

  const renderContent = () => {
    if (showSaveOptions) {
      return (
        <div className="flex flex-col md:flex-row h-full w-full">
          {/* Left column - Logo and description (1/4) */}
          <div
            className="md:w-1/4 p-6 flex flex-col items-center justify-center text-center"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            <div className="flex flex-col items-center text-white">
              {shopLogo && (
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl mb-4 inline-block">
                  <img
                    src={shopLogo || "/placeholder.svg"}
                    alt="E-shop logo"
                    className="h-12 max-w-[120px] object-contain"
                  />
                </div>
              )}

              {renderSidebarContent()}
            </div>
          </div>

          {/* Right column - Save options (3/4) */}
          <div className="md:w-3/4 bg-white p-6 relative">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <SaveVerificationResult
              onComplete={handleSaveComplete}
              onSkip={handleSaveSkip}
              primaryColor={primaryColor}
              buttonClass={buttonClass}
            />
          </div>
        </div>
      )
    } else if (activeMethod === "facescan") {
      return (
        <div className="flex flex-col md:flex-row h-full w-full">
          {/* Left column - Logo and description (1/4) */}
          <div
            className="md:w-1/4 p-6 flex flex-col items-center justify-center text-center"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            <div className="flex flex-col items-center text-white">
              {shopLogo && (
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl mb-4 inline-block">
                  <img
                    src={shopLogo || "/placeholder.svg"}
                    alt="E-shop logo"
                    className="h-12 max-w-[120px] object-contain"
                  />
                </div>
              )}

              {renderSidebarContent()}
            </div>
          </div>

          {/* Right column - Face Scan (3/4) */}
          <div className="md:w-3/4 bg-white p-6 relative">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <FaceScanVerification
              onComplete={handleVerificationComplete}
              onBack={() => setActiveMethod(null)}
              primaryColor={primaryColor}
              buttonClass={buttonClass}
            />
          </div>
        </div>
      )
    } else if (activeMethod === "ocr") {
      return (
        <div className="flex flex-col md:flex-row h-full w-full">
          {/* Left column - Logo and description (1/4) */}
          <div
            className="md:w-1/4 p-6 flex flex-col items-center justify-center text-center"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            <div className="flex flex-col items-center text-white">
              {shopLogo && (
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl mb-4 inline-block">
                  <img
                    src={shopLogo || "/placeholder.svg"}
                    alt="E-shop logo"
                    className="h-12 max-w-[120px] object-contain"
                  />
                </div>
              )}

              {renderSidebarContent()}
            </div>
          </div>

          {/* Right column - OCR (3/4) */}
          <div className="md:w-3/4 bg-white p-6 relative">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <OCRVerification
              onComplete={handleVerificationComplete}
              onBack={() => setActiveMethod(null)}
              primaryColor={primaryColor}
              buttonClass={buttonClass}
            />
          </div>
        </div>
      )
    } else if (activeMethod === "reverification") {
      return (
        <div className="flex flex-col md:flex-row h-full w-full">
          {/* Left column - Logo and description (1/4) */}
          <div
            className="md:w-1/4 p-6 flex flex-col items-center justify-center text-center"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            <div className="flex flex-col items-center text-white">
              {shopLogo && (
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl mb-4 inline-block">
                  <img
                    src={shopLogo || "/placeholder.svg"}
                    alt="E-shop logo"
                    className="h-12 max-w-[120px] object-contain"
                  />
                </div>
              )}

              {renderSidebarContent()}
            </div>
          </div>

          {/* Right column - Re-verification (3/4) */}
          <div className="md:w-3/4 bg-white p-6 relative">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <ReVerification
              onComplete={handleVerificationComplete}
              onBack={() => setActiveMethod(null)}
              primaryColor={primaryColor}
              buttonClass={buttonClass}
            />
          </div>
        </div>
      )
    } else if (activeMethod === "qrcode") {
      return (
        <div className="flex flex-col md:flex-row h-full w-full">
          {/* Left column - Logo and description (1/4) */}
          <div
            className="md:w-1/4 p-6 flex flex-col items-center justify-center text-center"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            <div className="flex flex-col items-center text-white">
              {shopLogo && (
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl mb-4 inline-block">
                  <img
                    src={shopLogo || "/placeholder.svg"}
                    alt="E-shop logo"
                    className="h-12 max-w-[120px] object-contain"
                  />
                </div>
              )}

              {renderSidebarContent()}
            </div>
          </div>

          {/* Right column - QR Code (3/4) */}
          <div className="md:w-3/4 bg-white p-6 relative">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <QRVerification
              onComplete={handleVerificationComplete}
              onBack={() => setActiveMethod(null)}
              primaryColor={primaryColor}
              buttonClass={buttonClass}
            />
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col md:flex-row h-full w-full">
        {/* Left column - Logo and description (1/4) */}
        <div
          className="md:w-1/4 p-6 flex flex-col items-center justify-center text-center"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          }}
        >
          <div className="flex flex-col items-center text-white">
            {shopLogo && (
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl mb-4 inline-block">
                <img
                  src={shopLogo || "/placeholder.svg"}
                  alt="E-shop logo"
                  className="h-12 max-w-[120px] object-contain"
                />
              </div>
            )}

            {renderSidebarContent()}
          </div>
        </div>

        {/* Right column - Verification methods (3/4) */}
        <div className="md:w-3/4 bg-white p-6 relative">
          <Button
            variant="ghost"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-2" style={{ color: primaryColor }}>
              Vyberte způsob ověření
            </h3>
            <p className="text-gray-500 text-sm">Zvolte jednu z následujících metod pro ověření vašeho věku</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <TooltipProvider>
              {filteredMethods.map((method) => (
                <Card
                  key={method.id}
                  className={cardClass}
                  style={{
                    borderColor: hoveredMethod === method.id ? primaryColor : "transparent",
                    backgroundColor: hoveredMethod === method.id ? `${secondaryColor}10` : undefined,
                    transform: hoveredMethod === method.id ? "translateY(-2px)" : "none",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => handleMethodClick(method.id)}
                  onMouseEnter={() => setHoveredMethod(method.id)}
                  onMouseLeave={() => setHoveredMethod(null)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center h-full">
                    <div className="p-3 rounded-full mb-3 mt-2" style={{ backgroundColor: `${primaryColor}15` }}>
                      {method.icon}
                    </div>
                    <div className="font-medium mb-1">{method.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{method.description}</div>

                    <div className="flex items-center gap-1 mt-auto mb-1">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: method.securityLevel === "Vysoká" ? "#10b981" : "#f59e0b",
                        }}
                      />
                      <span className="text-xs text-gray-500">Úroveň zabezpečení: {method.securityLevel}</span>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{method.detailedInfo}</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardContent>
                </Card>
              ))}
            </TooltipProvider>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-2">
              <div className="flex gap-4">
                <a href="#" className="hover:underline hover:text-gray-600">
                  Obchodní podmínky
                </a>
                <a href="#" className="hover:underline hover:text-gray-600">
                  O službě
                </a>
                <a href="#" className="hover:underline hover:text-gray-600">
                  Ochrana soukromí
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-3 w-3" />
                <span>© {new Date().getFullYear()} PassProve</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[800px] p-0 gap-0 border-0 shadow-2xl flex items-center justify-center"
        style={{
          fontFamily:
            fontFamily === "inter"
              ? "Inter, sans-serif"
              : fontFamily === "roboto"
                ? "Roboto, sans-serif"
                : fontFamily === "poppins"
                  ? "Poppins, sans-serif"
                  : fontFamily === "open-sans"
                    ? "Open Sans, sans-serif"
                    : "Montserrat, sans-serif",
          height: "600px", // Fixed height for consistency
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}

