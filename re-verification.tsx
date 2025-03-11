"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Phone, Mail, Cookie, Apple, Chrome } from "lucide-react"

interface ReVerificationProps {
  onComplete: (success: boolean) => void
  onBack: () => void
  primaryColor: string
  buttonClass?: string
}

export default function ReVerification({
  onComplete,
  onBack,
  primaryColor = "#173B3F",
  buttonClass = "rounded-md",
}: ReVerificationProps) {
  const [activeTab, setActiveTab] = useState<"phone" | "email" | "apple" | "google" | "cookie">("phone")
  const [step, setStep] = useState<"select" | "verify" | "processing" | "result">("select")
  const [result, setResult] = useState<"success" | "failure" | null>(null)
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [otpSent, setOtpSent] = useState(false)
  const [hasCookie, setHasCookie] = useState(false)

  // Check for existing verification cookie on mount
  useEffect(() => {
    // Simulate checking for cookie
    const hasVerificationCookie = localStorage.getItem("age_verification_cookie") !== null
    setHasCookie(hasVerificationCookie)
  }, [])

  // Handle OTP countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = () => {
    if ((activeTab === "phone" && !phone) || (activeTab === "email" && !email)) {
      return
    }

    setOtpSent(true)
    setCountdown(60) // 60 second countdown for resending OTP

    // Simulate OTP sending
    console.log(`Sending OTP to ${activeTab === "phone" ? phone : email}`)
  }

  const handleVerify = () => {
    setStep("processing")

    // Simulate verification process
    setTimeout(() => {
      // 90% success rate for demonstration
      const success = Math.random() > 0.1
      setResult(success ? "success" : "failure")
      setStep("result")

      // If successful, store a cookie for future verifications
      if (success) {
        localStorage.setItem(
          "age_verification_cookie",
          JSON.stringify({
            verified: true,
            timestamp: new Date().toISOString(),
            expiresIn: 180, // days
          }),
        )
      }
    }, 2000)
  }

  const handleCookieVerification = () => {
    setStep("processing")

    // Simulate verification process
    setTimeout(() => {
      setResult("success")
      setStep("result")
    }, 1500)
  }

  const handleOAuthVerification = (provider: "apple" | "google") => {
    setStep("processing")

    // Simulate OAuth verification process
    setTimeout(() => {
      // 95% success rate for demonstration
      const success = Math.random() > 0.05
      setResult(success ? "success" : "failure")
      setStep("result")

      // If successful, store a cookie for future verifications
      if (success) {
        localStorage.setItem(
          "age_verification_cookie",
          JSON.stringify({
            verified: true,
            provider,
            timestamp: new Date().toISOString(),
            expiresIn: 180, // days
          }),
        )
      }
    }, 2500)
  }

  const completeVerification = () => {
    onComplete(result === "success")
  }

  return (
    <div className="w-full max-w-md mx-auto flex items-center justify-center">
      <div className="w-full">
        {step === "select" && (
          <div>
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                <RefreshCw className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: primaryColor }}>
              Opakované ověření
            </h3>

            <p className="mb-6 text-center text-gray-600">
              Vyberte způsob, kterým chcete provést opakované ověření vašeho věku
            </p>

            {hasCookie && (
              <Card className="mb-6 border-green-200 bg-green-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <Cookie className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Nalezeno předchozí ověření</p>
                    <p className="text-xs text-green-600">Můžete použít uložené ověření z tohoto prohlížeče</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="phone" className="flex flex-col items-center py-2">
                  <Phone className="h-4 w-4 mb-1" />
                  <span className="text-xs">Telefon</span>
                </TabsTrigger>
                <TabsTrigger value="email" className="flex flex-col items-center py-2">
                  <Mail className="h-4 w-4 mb-1" />
                  <span className="text-xs">Email</span>
                </TabsTrigger>
                <TabsTrigger value="apple" className="flex flex-col items-center py-2">
                  <Apple className="h-4 w-4 mb-1" />
                  <span className="text-xs">Apple</span>
                </TabsTrigger>
                <TabsTrigger value="google" className="flex flex-col items-center py-2">
                  <Chrome className="h-4 w-4 mb-1" />
                  <span className="text-xs">Google</span>
                </TabsTrigger>
                <TabsTrigger value="cookie" className="flex flex-col items-center py-2" disabled={!hasCookie}>
                  <Cookie className="h-4 w-4 mb-1" />
                  <span className="text-xs">Cookie</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="phone" className="mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefonní číslo</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+420 123 456 789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => setStep("verify")}
                    className={buttonClass}
                    disabled={!phone}
                    style={{ backgroundColor: primaryColor }}
                  >
                    Pokračovat
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="email" className="mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mailová adresa</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vas@email.cz"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => setStep("verify")}
                    className={buttonClass}
                    disabled={!email}
                    style={{ backgroundColor: primaryColor }}
                  >
                    Pokračovat
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="apple" className="mt-4">
                <div className="space-y-4 text-center">
                  <p className="text-sm text-gray-600">Přihlaste se pomocí svého Apple ID pro ověření věku</p>
                  <Button
                    onClick={() => handleOAuthVerification("apple")}
                    className="w-full bg-black hover:bg-gray-800 flex items-center justify-center gap-2"
                  >
                    <Apple className="h-5 w-5" />
                    Přihlásit se s Apple
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="google" className="mt-4">
                <div className="space-y-4 text-center">
                  <p className="text-sm text-gray-600">Přihlaste se pomocí svého Google účtu pro ověření věku</p>
                  <Button
                    onClick={() => handleOAuthVerification("google")}
                    className="w-full bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 flex items-center justify-center gap-2"
                  >
                    <Chrome className="h-5 w-5" />
                    Přihlásit se s Google
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="cookie" className="mt-4">
                <div className="space-y-4 text-center">
                  <p className="text-sm text-gray-600">V tomto prohlížeči bylo nalezeno předchozí ověření věku</p>
                  <Button
                    onClick={handleCookieVerification}
                    className="w-full"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Použít uložené ověření
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-center">
              <Button variant="outline" onClick={onBack} className={buttonClass}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zpět
              </Button>
            </div>
          </div>
        )}

        {step === "verify" && (activeTab === "phone" || activeTab === "email") && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: primaryColor }}>
              Ověření kódem
            </h3>

            <p className="mb-6 text-center text-gray-600">
              {otpSent
                ? `Zadejte ověřovací kód, který jsme odeslali na ${activeTab === "phone" ? phone : email}`
                : `Pro ověření vašeho věku vám zašleme ověřovací kód na ${activeTab === "phone" ? phone : email}`}
            </p>

            {otpSent ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Ověřovací kód</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>

                <div className="text-center">
                  <button
                    onClick={handleSendOTP}
                    disabled={countdown > 0}
                    className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
                  >
                    {countdown > 0 ? `Poslat nový kód (${countdown}s)` : "Poslat nový kód"}
                  </button>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => setOtpSent(false)} className={buttonClass}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zpět
                  </Button>
                  <Button onClick={handleVerify} disabled={otp.length < 4} style={{ backgroundColor: primaryColor }}>
                    Ověřit
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    {activeTab === "phone"
                      ? "Na vaše telefonní číslo bude odeslána SMS s ověřovacím kódem."
                      : "Na vaši e-mailovou adresu bude odeslán e-mail s ověřovacím kódem."}
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => setStep("select")} className={buttonClass}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zpět
                  </Button>
                  <Button onClick={handleSendOTP} style={{ backgroundColor: primaryColor }}>
                    Odeslat kód
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "processing" && (
          <div className="text-center py-12">
            <div className="animate-spin mb-6 mx-auto">
              <RefreshCw className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>
              Probíhá ověřování
            </h3>
            <p className="text-gray-500">Čekejte prosím, ověřujeme váš věk...</p>
          </div>
        )}

        {step === "result" && (
          <div className="text-center py-6">
            {result === "success" ? (
              <>
                <div className="mb-6 flex justify-center">
                  <div className="p-4 rounded-full bg-green-100">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-green-600">Ověření úspěšné</h3>
                <p className="text-gray-600 mb-6">Vaše ověření věku bylo úspěšně dokončeno. Nyní můžete pokračovat.</p>
              </>
            ) : (
              <>
                <div className="mb-6 flex justify-center">
                  <div className="p-4 rounded-full bg-red-100">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-red-600">Ověření selhalo</h3>
                <p className="text-gray-600 mb-6">
                  Nepodařilo se ověřit váš věk. Zkuste to znovu nebo použijte jinou metodu ověření.
                </p>
              </>
            )}

            <div className="flex gap-4 justify-center">
              {result === "failure" && (
                <Button variant="outline" onClick={() => setStep("select")} className={buttonClass}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Zkusit znovu
                </Button>
              )}
              <Button
                onClick={completeVerification}
                style={{ backgroundColor: result === "success" ? "green" : primaryColor }}
              >
                {result === "success" ? "Dokončit" : "Zpět na výběr metody"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

