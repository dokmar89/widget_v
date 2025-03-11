"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, RefreshCw, QrCode, CheckCircle, AlertCircle, Shield } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import SaveVerificationResult from "./save-verification-result"
import { ApiService } from "../services/api"

interface QRVerificationProps {
  onComplete: (success: boolean) => void
  onBack: () => void
  primaryColor: string
  buttonClass?: string
  sessionId: string
}

export default function QRVerification({
  onComplete,
  onBack,
  primaryColor = "#173B3F",
  buttonClass = "rounded-md",
  sessionId,
}: QRVerificationProps) {
  const [step, setStep] = useState<"instructions" | "verification" | "result" | "save">("instructions")
  const [result, setResult] = useState<"success" | "failure" | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [statusCheckInterval, setStatusCheckInterval] = useState<number | null>(null)

  // Generování QR kódu a zahájení procesu verifikace
  useEffect(() => {
    if (step === "verification") {
      startVerification()
    }
    
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }
    }
  }, [step])
  
  // Stav kontroly postupu
  useEffect(() => {
    if (step === "verification" && !checkingStatus) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            return 100
          }
          return prev + 0.5
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [step, checkingStatus])
  
  // Simulace kontroly vypršení po dosažení 100%
  useEffect(() => {
    if (progress >= 100 && step === "verification" && !checkingStatus && !result) {
      setResult("failure")
      setErrorMessage("Čas pro ověření vypršel. Zkuste to prosím znovu.")
      setStep("result")
      
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }
    }
  }, [progress, step, checkingStatus, result])
  
  const startVerification = async () => {
    try {
      // Resetování stavu
      setProgress(0)
      setErrorMessage(null)
      setCheckingStatus(true)
      
      // Volání API pro získání QR kódu
      const response = await ApiService.verifyWithQrCode(sessionId)
      
      if (response.success && response.data?.qrCodeUrl) {
        setQrCodeUrl(response.data.qrCodeUrl)
        
        // Nastavení intervalu pro kontrolu stavu ověření
        const interval = window.setInterval(async () => {
          await checkVerificationStatus()
        }, 3000)
        
        setStatusCheckInterval(interval)
      } else {
        setResult("failure")
        setErrorMessage(response.message || "Nepodařilo se vygenerovat QR kód. Zkuste to prosím znovu.")
        setStep("result")
      }
      
      setCheckingStatus(false)
    } catch (error) {
      console.error('Chyba při generování QR kódu', error)
      setResult("failure")
      setErrorMessage("Při generování QR kódu došlo k chybě. Zkuste to prosím znovu.")
      setStep("result")
      setCheckingStatus(false)
    }
  }
  
  const checkVerificationStatus = async () => {
    try {
      // Volání API pro kontrolu stavu ověření
      const response = await ApiService.checkVerificationStatus(sessionId)
      
      if (response.success) {
        if (response.data?.status === 'completed') {
          if (response.data?.verified) {
            // Ověření bylo úspěšné
            if (statusCheckInterval) {
              clearInterval(statusCheckInterval)
            }
            
            setResult("success")
            setStep("result")
          } else {
            // Ověření bylo neúspěšné
            if (statusCheckInterval) {
              clearInterval(statusCheckInterval)
            }
            
            setResult("failure")
            setErrorMessage(response.message || "Nepodařilo se ověřit váš věk.")
            setStep("result")
          }
        }
        // Jinak pokračujeme v kontrole
      } else {
        // Chyba při kontrole stavu
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
        }
        
        setResult("failure")
        setErrorMessage(response.message || "Nepodařilo se zkontrolovat stav ověření.")
        setStep("result")
      }
    } catch (error) {
      console.error('Chyba při kontrole stavu ověření', error)
      
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }
      
      setResult("failure")
      setErrorMessage("Při kontrole stavu ověření došlo k chybě.")
      setStep("result")
    }
  }
  
  const handleCompleteProcess = () => {
    if (result === "success") {
      setStep("save")
    } else {
      onComplete(false)
    }
  }
  
  const handleSaveComplete = (saved: boolean) => {
    onComplete(saved)
  }
  
  // Instrukce
  if (step === "instructions") {
  return (
      <div className="space-y-6 p-1">
        <h2 className="text-xl font-semibold text-center">Ověření pomocí QR kódu</h2>
        
        <p className="text-center text-muted-foreground">
          Pro ověření vašeho věku naskenujte QR kód pomocí jiného zařízení, na kterém jste již ověřeni.
        </p>
        
        <div className="grid grid-cols-1 gap-4 mt-6">
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <QrCode className="h-12 w-12 text-primary" />
              <p className="text-sm">
                Naskenujte QR kód a následujte instrukce na vašem mobilním zařízení.
              </p>
              <p className="text-xs text-muted-foreground">
                Tato metoda vyžaduje, abyste již byli ověřeni na jiném zařízení.
              </p>
            </div>
              </Card>
            </div>

        <div className="flex space-x-4 mt-6">
          <Button
            variant="outline"
            className={`${buttonClass} flex-1`}
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
                Zpět
              </Button>
          
          <Button
            style={{ backgroundColor: primaryColor }}
            className={`${buttonClass} flex-1`}
            onClick={() => setStep("verification")}
          >
                Pokračovat
              </Button>
            </div>
        
        <div className="text-xs text-muted-foreground mt-6">
          <p className="flex items-center mb-2">
            <Shield className="h-3 w-3 mr-1" />
            Vaše ověření na druhém zařízení je zabezpečeno.
                </p>
              </div>
            </div>
    )
  }
  
  // Verifikace pomocí QR kódu
  if (step === "verification") {
    return (
      <div className="space-y-6 p-1">
        <h2 className="text-xl font-semibold text-center">Naskenujte QR kód</h2>
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {qrCodeUrl ? (
            <div className="relative w-64 h-64 bg-white p-4 rounded-lg shadow-sm">
              <img
                src={qrCodeUrl}
                alt="QR kód pro ověření"
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-lg">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

          <p className="text-sm text-center">
            Naskenujte tento QR kód pomocí mobilního zařízení, kde jste již ověřeni.
              </p>
            </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-muted-foreground">
            Čekání na dokončení ověření... {Math.floor(progress)}%
          </p>
            </div>

        <Button
          variant="outline"
          className={`${buttonClass} w-full`}
          onClick={onBack}
        >
          Zrušit
              </Button>
            </div>
    )
  }
  
  // Výsledek
  if (step === "result") {
    return (
      <div className="space-y-6 p-1">
        <h2 className="text-xl font-semibold text-center">
          {result === "success" ? "Ověření proběhlo úspěšně" : "Ověření se nezdařilo"}
        </h2>
        
        <div className="flex justify-center">
            {result === "success" ? (
            <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
          ) : (
            <div className="rounded-full bg-red-100 p-3">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
          )}
                </div>
        
        <p className="text-center text-muted-foreground">
          {result === "success"
            ? "Váš věk byl úspěšně ověřen. Nyní můžete pokračovat."
            : errorMessage || "Nepodařilo se ověřit váš věk. Zkuste to prosím znovu s jinou metodou."}
        </p>
        
        <div className="flex space-x-4">
              {result === "failure" && (
            <Button
              variant="outline"
              className={`${buttonClass} flex-1`}
              onClick={() => setStep("instructions")}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
                  Zkusit znovu
                </Button>
              )}
          
              <Button
            style={{ backgroundColor: primaryColor }}
            className={`${buttonClass} flex-1`}
            onClick={handleCompleteProcess}
              >
            {result === "success" ? "Pokračovat" : "Zpět na výběr metody"}
              </Button>
      </div>
    </div>
  )
  }
  
  // Uložení výsledku
  if (step === "save") {
    return (
      <SaveVerificationResult
        onComplete={handleSaveComplete}
        onBack={() => setStep("result")}
        primaryColor={primaryColor}
        buttonClass={buttonClass}
        sessionId={sessionId}
      />
    )
  }

  return null
}

