"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Shield, 
  Mail, 
  Smartphone, 
  Cookie
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiService } from "../services/api"

interface ReVerificationProps {
  onComplete: (success: boolean) => void
  onBack: () => void
  primaryColor: string
  buttonClass?: string
  sessionId: string
}

export default function ReVerification({
  onComplete,
  onBack,
  primaryColor = "#173B3F",
  buttonClass = "rounded-md",
  sessionId,
}: ReVerificationProps) {
  const [step, setStep] = useState<"method" | "verify" | "result">("method")
  const [method, setMethod] = useState<"cookie" | "email" | "phone" | null>(null)
  const [identifier, setIdentifier] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [result, setResult] = useState<"success" | "failure" | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cookieVerified, setCookieVerified] = useState(false)
  
  // Kontrola lokálního úložiště pro cookie verifikaci při načtení
  useEffect(() => {
    // Kontrola existence verifikačního tokenu v localStorage
    const verificationToken = localStorage.getItem('passprove_verification_token')
    
    if (verificationToken) {
      setCookieVerified(true)
    }
  }, [])

  // Simulace postupu zpracování
  useEffect(() => {
    if (step === "verify" && isSubmitting) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 5
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [step, isSubmitting])
  
  // Zpracování výsledku po dokončení progress baru
  useEffect(() => {
    if (progress === 100 && step === "verify" && isSubmitting) {
      completeVerification()
    }
  }, [progress, step, isSubmitting])
  
  // Funkce pro odeslání a ověření
  const startVerification = async () => {
    if (!method) {
      setErrorMessage("Vyberte metodu ověření")
      return
    }
    
    if (method !== "cookie" && !identifier) {
      setErrorMessage("Zadejte svůj identifikátor")
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)
    setProgress(0)
    
    try {
      // Pokud je metoda cookie a máme token, přeskočíme ověřovací krok
      if (method === "cookie" && cookieVerified) {
        // Simulujeme krátké čekání
        setTimeout(() => {
          setResult("success")
          setStep("result")
          setIsSubmitting(false)
        }, 1000)
        return
      }
      
      // Pro ostatní metody odešleme požadavek pro ověření
      const response = await ApiService.verifyWithReVerification(sessionId, {
        method,
        identifier: method === "cookie" ? "browser" : identifier
      })
      
      if (response.success) {
        if (method === "cookie") {
          // Cookie ověření je přímé
          setProgress(100) // Spustí completeVerification
        } else {
          // Pro email a telefon přejdeme k zadání kódu
          setStep("verify")
          setIsSubmitting(false)
        }
      } else {
        setResult("failure")
        setErrorMessage(response.message || "Nepodařilo se zahájit ověření. Zkuste to prosím znovu.")
        setStep("result")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Chyba při ověřování', error)
      setResult("failure")
      setErrorMessage("Při ověřování došlo k chybě. Zkuste to prosím znovu.")
      setStep("result")
      setIsSubmitting(false)
    }
  }
  
  // Dokončení ověření
  const completeVerification = async () => {
    try {
      if (method === "cookie" && cookieVerified) {
        // Pokud máme cookie, použijeme lokální token k ověření
        const token = localStorage.getItem('passprove_verification_token')
        
        const response = await ApiService.checkVerificationHash(token || "")
        
        if (response.success && response.data?.verified) {
          setResult("success")
        } else {
          // Token je neplatný, odstraníme ho
          localStorage.removeItem('passprove_verification_token')
          setCookieVerified(false)
          setResult("failure")
          setErrorMessage("Ověření vypršelo nebo je neplatné. Zkuste prosím jinou metodu.")
        }
      } else if (method === "email" || method === "phone") {
        // Pro email a telefon ověříme zadaný kód
        const response = await ApiService.verifyCode(sessionId, method, identifier, verificationCode)
        
        if (response.success && response.data?.verified) {
      setResult("success")
          
          // Pokud je k dispozici verifikační token, uložíme ho pro budoucí použití
          if (response.data?.verificationToken) {
            localStorage.setItem('passprove_verification_token', response.data.verificationToken)
          }
        } else {
          setResult("failure")
          setErrorMessage(response.message || "Nesprávný ověřovací kód. Zkuste to prosím znovu.")
        }
      } else {
        setResult("failure")
        setErrorMessage("Neplatná metoda ověření")
      }
      
      setStep("result")
    } catch (error) {
      console.error('Chyba při ověřování kódu', error)
      setResult("failure")
      setErrorMessage("Při ověřování kódu došlo k chybě. Zkuste to prosím znovu.")
      setStep("result")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Ověření kódu zadaného uživatelem
  const verifyCode = () => {
    if (!verificationCode || verificationCode.length < 6) {
      setErrorMessage("Zadejte platný ověřovací kód")
      return
    }
    
    setErrorMessage(null)
    setIsSubmitting(true)
    setProgress(0)
  }
  
  // Výběr metody ověření
  if (step === "method") {
  return (
      <div className="space-y-6 p-1">
        <h2 className="text-xl font-semibold text-center">Opakované ověření</h2>
        
        <p className="text-center text-muted-foreground">
          Byli jste již dříve ověřeni? Vyberte metodu, kterou jste použili pro uložení ověření.
        </p>
        
        {errorMessage && (
          <div className="flex items-center p-3 rounded-md bg-red-50 text-red-800">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{errorMessage}</p>
                  </div>
        )}
        
        <Tabs
          defaultValue={cookieVerified ? "cookie" : "email"}
          value={method || (cookieVerified ? "cookie" : "email")}
          onValueChange={(v) => setMethod(v as any)}
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="cookie">
              <Cookie className="h-4 w-4 mr-2" />
              Tento prohlížeč
                </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
                </TabsTrigger>
            <TabsTrigger value="phone">
              <Smartphone className="h-4 w-4 mr-2" />
              Telefon
                </TabsTrigger>
              </TabsList>

          <TabsContent value="cookie" className="p-4 border rounded-md mt-4">
            <div className="flex items-start space-x-4">
              <Cookie className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium">Tento prohlížeč</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Pokud jste se již ověřili na tomto zařízení v tomto prohlížeči.
                </p>
                
                {cookieVerified ? (
                  <div className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Nalezeno uložené ověření
                  </div>
                ) : (
                  <div className="text-sm text-amber-600">
                    Nebylo nalezeno žádné ověření v tomto prohlížeči
                  </div>
                )}
              </div>
                </div>
              </TabsContent>

          <TabsContent value="email" className="p-4 border rounded-md mt-4">
            <div className="flex items-start space-x-4 mb-4">
              <Mail className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-sm text-muted-foreground">
                  Zadejte emailovou adresu, kterou jste použili při předchozím ověření.
                </p>
              </div>
            </div>
            
                    <Input
                      type="email"
                      placeholder="vas@email.cz"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
              </TabsContent>

          <TabsContent value="phone" className="p-4 border rounded-md mt-4">
            <div className="flex items-start space-x-4 mb-4">
              <Smartphone className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium">Telefonní číslo</h3>
                <p className="text-sm text-muted-foreground">
                  Zadejte telefonní číslo, které jste použili při předchozím ověření.
                </p>
              </div>
                </div>
            
            <Input
              type="tel"
              placeholder="+420 123 456 789"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
              </TabsContent>
        </Tabs>

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
            onClick={startVerification}
            disabled={isSubmitting || (!method) || (method !== "cookie" && !identifier)}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Ověřování...
              </>
            ) : (
              "Ověřit"
            )}
                  </Button>
                </div>
        
        {isSubmitting && (
          <Progress value={progress} className="h-2 mt-4" />
        )}
            </div>
    )
  }
  
  // Zadání ověřovacího kódu
  if (step === "verify") {
    return (
      <div className="space-y-6 p-1">
        <h2 className="text-xl font-semibold text-center">Zadejte ověřovací kód</h2>
        
        <p className="text-center text-muted-foreground">
          {method === "email" 
            ? `Zadejte 6-místný kód, který jsme poslali na váš email ${identifier}.` 
            : `Zadejte 6-místný kód, který jsme poslali na vaše telefonní číslo ${identifier}.`}
        </p>
        
        {errorMessage && (
          <div className="flex items-center p-3 rounded-md bg-red-50 text-red-800">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
            className="text-center text-2xl tracking-widest"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  />
          
          <p className="text-sm text-center text-muted-foreground">
            Kód je platný po dobu 15 minut.
          </p>
                </div>

        <div className="flex space-x-4 mt-6">
          <Button
            variant="outline"
            className={`${buttonClass} flex-1`}
            onClick={() => setStep("method")}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
                    Zpět
                  </Button>
          
          <Button
            style={{ backgroundColor: primaryColor }}
            className={`${buttonClass} flex-1`}
            onClick={verifyCode}
            disabled={isSubmitting || !verificationCode || verificationCode.length < 6}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Ověřování...
              </>
            ) : (
              "Ověřit kód"
            )}
          </Button>
          </div>
        
        {isSubmitting && (
          <Progress value={progress} className="h-2 mt-4" />
        )}
      </div>
    )
  }
  
  // Výsledek ověření
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
            ? "Vaše ověření bylo úspěšně obnoveno. Nyní můžete pokračovat."
            : errorMessage || "Nepodařilo se ověřit váš věk. Zkuste prosím jinou metodu ověření."}
        </p>
        
        <div className="flex space-x-4">
              {result === "failure" && (
            <Button
              variant="outline"
              className={`${buttonClass} flex-1`}
              onClick={() => setStep("method")}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
                  Zkusit znovu
                </Button>
              )}
          
              <Button
            style={{ backgroundColor: primaryColor }}
            className={`${buttonClass} flex-1`}
            onClick={() => onComplete(result === "success")}
              >
            {result === "success" ? "Pokračovat" : "Zpět na výběr metody"}
              </Button>
      </div>
    </div>
  )
  }

  return null
}

