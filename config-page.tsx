"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Scan, Camera, RefreshCw, QrCode, Moon, Sun, Copy, Check } from "lucide-react"
import AgeVerificationModal from "./age-verification-modal"

export default function ConfigPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState({
    shopLogo: "/placeholder.svg?height=60&width=120",
    welcomeText: "Vítejte! Pro pokračování je nutné ověřit váš věk.",
    primaryColor: "#173B3F",
    secondaryColor: "#96C4C8",
    buttonShape: "rounded",
    fontFamily: "inter",
    showBankID: true,
    showMojeID: true,
    showOCR: true,
    showFaceScan: true,
    showReVerification: true,
    showQRCode: true,
  })

  const handleVerificationSelected = (method: string) => {
    console.log(`Selected verification method: ${method}`)
    // In a real implementation, this would initiate the verification process
    setTimeout(() => {
      setIsModalOpen(false)
    }, 1000)
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const copyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(settings, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-gray-900 text-white" : "bg-gray-50"}`}>
      <div className="container mx-auto py-8 px-4">
        <header className="mb-10">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WjkAe8ZTI3kS5AbMKIqw66tQ99eoFP.png"
                alt="PassProve Logo"
                className="h-10"
              />
              <h1 className="text-2xl md:text-3xl font-bold">Konfigurace ověření věku</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} className="h-9 w-9">
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="h-9"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Zobrazit náhled
              </Button>
            </div>
          </div>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-3xl">
            Přizpůsobte si vzhled a funkce ověřovacího okna PassProve podle potřeb vašeho e-shopu.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Settings */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-[#173B3F] to-[#96C4C8] p-4">
              <h3 className="text-white font-medium">Základní nastavení</h3>
            </div>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="shopLogo">Logo e-shopu (URL)</Label>
                  <Input
                    id="shopLogo"
                    value={settings.shopLogo}
                    onChange={(e) => updateSetting("shopLogo", e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcomeText">Uvítací text (max. 150 znaků)</Label>
                  <Input
                    id="welcomeText"
                    value={settings.welcomeText}
                    onChange={(e) => updateSetting("welcomeText", e.target.value)}
                    maxLength={150}
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">{settings.welcomeText.length}/150 znaků</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fontFamily">Font</Label>
                  <Select value={settings.fontFamily} onValueChange={(value) => updateSetting("fontFamily", value)}>
                    <SelectTrigger id="fontFamily" className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectValue placeholder="Vyberte font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                      <SelectItem value="open-sans">Open Sans</SelectItem>
                      <SelectItem value="montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design Settings */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-[#173B3F] to-[#96C4C8] p-4">
              <h3 className="text-white font-medium">Vzhled</h3>
            </div>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primární barva</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting("primaryColor", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting("primaryColor", e.target.value)}
                      className="dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Sekundární barva</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSetting("secondaryColor", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => updateSetting("secondaryColor", e.target.value)}
                      className="dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buttonShape">Tvar tlačítek</Label>
                  <Select value={settings.buttonShape} onValueChange={(value) => updateSetting("buttonShape", value)}>
                    <SelectTrigger id="buttonShape" className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectValue placeholder="Vyberte tvar tlačítek" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded">Zaoblené</SelectItem>
                      <SelectItem value="square">Hranaté</SelectItem>
                      <SelectItem value="pill">Pilulka</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-4" />

                <div>
                  <p className="text-sm font-medium mb-3">Doporučené barvy PassProve</p>
                  <div className="grid grid-cols-5 gap-2">
                    <button
                      className="h-10 rounded-md border transition-transform hover:scale-105"
                      style={{ backgroundColor: "#173B3F" }}
                      onClick={() => updateSetting("primaryColor", "#173B3F")}
                    />
                    <button
                      className="h-10 rounded-md border transition-transform hover:scale-105"
                      style={{ backgroundColor: "#96C4C8" }}
                      onClick={() => updateSetting("secondaryColor", "#96C4C8")}
                    />
                    <button
                      className="h-10 rounded-md border transition-transform hover:scale-105"
                      style={{ backgroundColor: "#F0D423" }}
                      onClick={() => updateSetting("primaryColor", "#F0D423")}
                    />
                    <button
                      className="h-10 rounded-md border transition-transform hover:scale-105"
                      style={{ backgroundColor: "#9D9D9C" }}
                      onClick={() => updateSetting("primaryColor", "#9D9D9C")}
                    />
                    <button
                      className="h-10 rounded-md border transition-transform hover:scale-105"
                      style={{ backgroundColor: "#1D1D1B" }}
                      onClick={() => updateSetting("primaryColor", "#1D1D1B")}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Methods */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-[#173B3F] to-[#96C4C8] p-4">
              <h3 className="text-white font-medium">Metody ověření</h3>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[#173B3F20]">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <Label htmlFor="showBankID" className="cursor-pointer">
                      BankID
                    </Label>
                  </div>
                  <Switch
                    id="showBankID"
                    checked={settings.showBankID}
                    onCheckedChange={(checked) => updateSetting("showBankID", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[#173B3F20]">
                      <Scan className="h-5 w-5" />
                    </div>
                    <Label htmlFor="showMojeID" className="cursor-pointer">
                      mojeID
                    </Label>
                  </div>
                  <Switch
                    id="showMojeID"
                    checked={settings.showMojeID}
                    onCheckedChange={(checked) => updateSetting("showMojeID", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[#173B3F20]">
                      <Scan className="h-5 w-5" />
                    </div>
                    <Label htmlFor="showOCR" className="cursor-pointer">
                      OCR
                    </Label>
                  </div>
                  <Switch
                    id="showOCR"
                    checked={settings.showOCR}
                    onCheckedChange={(checked) => updateSetting("showOCR", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[#173B3F20]">
                      <Camera className="h-5 w-5" />
                    </div>
                    <Label htmlFor="showFaceScan" className="cursor-pointer">
                      Face Scan
                    </Label>
                  </div>
                  <Switch
                    id="showFaceScan"
                    checked={settings.showFaceScan}
                    onCheckedChange={(checked) => updateSetting("showFaceScan", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[#173B3F20]">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <Label htmlFor="showReVerification" className="cursor-pointer">
                      Opakované ověření
                    </Label>
                  </div>
                  <Switch
                    id="showReVerification"
                    checked={settings.showReVerification}
                    onCheckedChange={(checked) => updateSetting("showReVerification", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[#173B3F20]">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <Label htmlFor="showQRCode" className="cursor-pointer">
                      QR kód
                    </Label>
                  </div>
                  <Switch
                    id="showQRCode"
                    checked={settings.showQRCode}
                    onCheckedChange={(checked) => updateSetting("showQRCode", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="md:col-span-2 lg:col-span-3 overflow-hidden">
            <div className="bg-gradient-to-r from-[#173B3F] to-[#96C4C8] p-4">
              <h3 className="text-white font-medium">Náhled a implementace</h3>
            </div>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium mb-4">Náhled</h4>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    <div className="w-full max-w-xs">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                          <div className="text-sm font-medium">Váš E-shop</div>
                          <div className="text-xs text-gray-500">Košík (3)</div>
                        </div>
                        <div className="p-6 flex flex-col items-center justify-center gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-4">
                              Pro pokračování k pokladně je nutné ověřit váš věk
                            </p>
                            <Button
                              onClick={() => setIsModalOpen(true)}
                              style={{ backgroundColor: settings.primaryColor }}
                              className="px-6"
                            >
                              Ověřit věk
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-4">Implementace</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-gray-300 text-sm font-mono overflow-auto max-h-[300px]">
                    <pre className="whitespace-pre-wrap">
                      {`// Přidejte tento kód do vašeho e-shopu
import AgeVerificationModal from '@passprove/age-verification';

// V komponentě vašeho e-shopu
const [isVerificationOpen, setIsVerificationOpen] = useState(false);

// Konfigurace
const verificationConfig = ${JSON.stringify(settings, null, 2)};

// Funkce pro zpracování ověření
const handleVerification = (method) => {
  // Zde zpracujte výsledek ověření
  console.log(\`Metoda ověření: \${method}\`);
};

// Tlačítko pro otevření ověření
<button onClick={() => setIsVerificationOpen(true)}>
  Ověřit věk
</button>

// Komponenta modálního okna
<AgeVerificationModal
  isOpen={isVerificationOpen}
  onClose={() => setIsVerificationOpen(false)}
  onVerificationSelected={handleVerification}
  {...verificationConfig}
/>`}
                    </pre>
                  </div>
                  <div className="mt-4">
                    <Button
                      onClick={copyConfig}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Zkopírováno
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Zkopírovat konfiguraci
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AgeVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerificationSelected={handleVerificationSelected}
        {...settings}
      />
    </div>
  )
}

