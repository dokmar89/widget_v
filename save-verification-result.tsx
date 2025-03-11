"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { RefreshCw, CheckCircle, Phone, Mail, Cookie, Apple, Shield, Lock } from "lucide-react"

interface SaveVerificationResultProps {
  onComplete: () => void
  onSkip: () => void
  primaryColor: string
  buttonClass?: string
}

export default function SaveVerificationResult({
  onComplete,
  onSkip,
  primaryColor = "#173B3F",
  buttonClass = "rounded-md",
}: SaveVerificationResultProps) {
  const [activeTab, setActiveTab] = useState<"phone" | "email" | "apple" | "google" | "cookie">("cookie")
  const [step, setStep] = useState<"select" | "verify" | "processing" | "result">("select")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [otpSent, setOtpSent] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

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
      setStep("result")

      // Store verification result based on selected method
      saveVerificationResult(activeTab)
    }, 2000)
  }

  const handleOAuthSave = (provider: "apple" | "google") => {
    setStep("processing")

    // Simulate OAuth verification process
    setTimeout(() => {
      setStep("result")

      // Store verification result
      saveVerificationResult(provider)
    }, 2500)
  }

  const handleCookieSave = () => {
    setStep("processing")

    // Simulate saving process
    setTimeout(() => {
      setStep("result")

      // Store verification result in cookies
      saveVerificationResult("cookie")
    }, 1500)
  }

  const saveVerificationResult = (method: string) => {
    // In a real implementation, this would securely store the verification result
    // For this demo, we'll use localStorage

    const verificationData = {
      verified: true,
      method,
      timestamp: new Date().toISOString(),
      expiresIn: 180, // days
      data: method === "phone" ? phone : method === "email" ? email : null,
    }

    localStorage.setItem("age_verification_result", JSON.stringify(verificationData))

    // Also set the cookie for re-verification
    localStorage.setItem(
      "age_verification_cookie",
      JSON.stringify({
        verified: true,
        timestamp: new Date().toISOString(),
        expiresIn: 180, // days
      }),
    )
  }

  return (
    <div className="w-full max-w-md mx-auto flex items-center justify-center">
      <div className="w-full">
        {step === "select" && (
          <div>
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2 text-center text-green-600">Ověření úspěšné</h3>

            <p className="mb-6 text-center text-gray-600">
              Vaše ověření věku bylo úspěšně dokončeno. Chcete si uložit výsledek pro příští návštěvu?
            </p>

            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-700 mb-1">Bezpečné uložení výsledku</p>
                  <p className="text-xs text-blue-600">
                    Uložením výsledku ověření si usnadníte příští návštěvu. Vaše údaje jsou bezpečně šifrovány a
                    chráněny.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="cookie" className="flex flex-col items-center py-2">
                  <Cookie className="h-4 w-4 mb-1" />
                  <span className="text-xs">Prohlížeč</span>
                </TabsTrigger>
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
                </TabsList>

              <TabsContent value="cookie" className="mt-4">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
                    <Lock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700 font-medium mb-1">Uložení v prohlížeči</p>
                      <p className="text-sm text-gray-600">
                        Výsledek ověření bude uložen v tomto prohlížeči po dobu 180 dní. Při příští návštěvě budete
                        automaticky ověřeni.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms-cookie"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms-cookie"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Souhlasím s uložením výsledku ověření
                      </label>
                      <p className="text-xs text-gray-500">
                        Přečtěte si naše{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          podmínky použití
                        </a>{" "}
                        a{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          zásady ochrany soukromí
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleCookieSave}
                    className={`w-full ${buttonClass}`}
                    disabled={!acceptTerms}
                    style={{ backgroundColor: primaryColor }}
                  >
                    Uložit pro tento prohlížeč
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="phone" className="mt-4">
                <div className="space-y-4">
                  {!otpSent ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefonní číslo</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+420 123 456 789"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
                        <Lock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-700 font-medium mb-1">Propojení s telefonním číslem</p>
                          <p className="text-sm text-gray-600">
                            Výsledek ověření bude propojen s vaším telefonním číslem. Pro ověření vám zašleme SMS s
                            kódem.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms-phone"
                          checked={acceptTerms}
                          onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="terms-phone"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Souhlasím s uložením výsledku ověření
                          </label>
                          <p className="text-xs text-gray-500">
                            Přečtěte si naše{" "}
                            <a href="#" className="text-blue-600 hover:underline">
                              podmínky použití
                            </a>{" "}
                            a{" "}
                            <a href="#" className="text-blue-600 hover:underline">
                              zásady ochrany soukromí
                            </a>
                            .
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={handleSendOTP}
                        className={`w-full ${buttonClass}`}
                        disabled={!phone || !acceptTerms}
                        style={{ backgroundColor: primaryColor }}
                      >
                        Odeslat ověřovací kód
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="otp">Ověřovací kód</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="text-center text-lg tracking-widest border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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

                      <Button
                        onClick={handleVerify}
                        className={`w-full ${buttonClass}`}
                        disabled={otp.length < 4}
                        style={{ backgroundColor: primaryColor }}
                      >
                        Ověřit a uložit
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="email" className="mt-4">
                <div className="space-y-4">
                  {!otpSent ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mailová adresa</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="vas@email.cz"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
                        <Lock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-700 font-medium mb-1">Propojení s e-mailem</p>
                          <p className="text-sm text-gray-600">
                            Výsledek ověření bude propojen s vaší e-mailovou adresou. Pro ověření vám zašleme e-mail s
                            kódem.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms-email"
                          checked={acceptTerms}
                          onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="terms-email"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Souhlasím s uložením výsledku ověření
                          </label>
                          <p className="text-xs text-gray-500">
                            Přečtěte si naše{" "}
                            <a href="#" className="text-blue-600 hover:underline">
                              podmínky použití
                            </a>{" "}
                            a{" "}
                            <a href="#" className="text-blue-600 hover:underline">
                              zásady ochrany soukromí
                            </a>
                            .
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={handleSendOTP}
                        className={`w-full ${buttonClass}`}
                        disabled={!email || !acceptTerms}
                        style={{ backgroundColor: primaryColor }}
                      >
                        Odeslat ověřovací kód
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="otp">Ověřovací kód</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="text-center text-lg tracking-widest border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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

                      <Button
                        onClick={handleVerify}
                        className={`w-full ${buttonClass}`}
                        disabled={otp.length < 4}
                        style={{ backgroundColor: primaryColor }}
                      >
                        Ověřit a uložit
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="apple" className="mt-4">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
                    <Lock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700 font-medium mb-1">Propojení s Apple ID</p>
                      <p className="text-sm text-gray-600">
                        Výsledek ověření bude spojen s vaším Apple ID. Při příští návštěvě se budete moci rychle ověřit
                        pomocí Apple přihlášení.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms-apple"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms-apple"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Souhlasím s uložením výsledku ověření
                      </label>
                      <p className="text-xs text-gray-500">
                        Přečtěte si naše{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          podmínky použití
                        </a>{" "}
                        a{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          zásady ochrany soukromí
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleOAuthSave("apple")}
                    className={`w-full ${buttonClass} bg-black hover:bg-gray-800 flex items-center justify-center gap-2`}
                    disabled={!acceptTerms}
                  >
                    <Apple className="h-5 w-5" />
                    Propojit s Apple ID
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="google" className="mt-4">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
                    <Lock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700 font-medium mb-1">Propojení s Google účtem</p>
                      <p className="text-sm text-gray-600">
                        Výsledek ověření bude spojen s vaším Google účtem. Při příští návštěvě se budete moci rychle
                        ověřit pomocí Google přihlášení.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms-google"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms-google"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Souhlasím s uložením výsledku ověření
                      </label>
                      <p className="text-xs text-gray-500">
                        Přečtěte si naše{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          podmínky použití
                        </a>{" "}
                        a{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          zásady ochrany soukromí
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-center gap-4 mt-6">
              <Button variant="outline" onClick={onSkip} className={buttonClass}>
                Přeskočit
              </Button>
              <Button onClick={onComplete} style={{ backgroundColor: primaryColor }} className={buttonClass}>
                Dokončit
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center py-12">
            <div className="animate-spin mb-6 mx-auto">
              <RefreshCw className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>
              Ukládání výsledku
            </h3>
            <p className="text-gray-500">Čekejte prosím, ukládáme výsledek ověření...</p>

            <div className="max-w-xs mx-auto mt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Šifrování dat</span>
                  <span>Dokončeno</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Ukládání výsledku</span>
                  <span>Probíhá...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="text-center py-6">
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-green-600">Výsledek uložen</h3>
            <p className="text-gray-600 mb-6">
              Výsledek ověření byl úspěšně uložen. Při příští návštěvě můžete použít rychlejší metodu ověření.
            </p>

            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-green-700 mb-1">Bezpečně uloženo</p>
                <p className="text-xs text-green-600">
                  Vaše údaje jsou bezpečně zašifrovány a uloženy v souladu s GDPR. Platnost ověření je 180 dní.
                </p>
              </div>
            </div>

            <Button onClick={onComplete} className={`bg-green-600 hover:bg-green-700 ${buttonClass}`}>
              Dokončit
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

