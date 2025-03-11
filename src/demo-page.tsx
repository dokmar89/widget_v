"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Laptop, Smartphone, Moon, Sun, CreditCard, Scan, Camera, RefreshCw, QrCode } from "lucide-react"
import AgeVerificationModal from "./age-verification-modal"

export default function DemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")
  const [isDarkMode, setIsDarkMode] = useState(false)
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

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-gray-900 text-white" : "bg-gray-50"}`}>
      <div className="container mx-auto py-8 px-4">
        <header className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">PassProve - Konfigurace ověření věku</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl">
            Přizpůsobte si vzhled a funkce ověřovacího okna PassProve podle potřeb vašeho e-shopu.
          </p>
        </header>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Preview Section - 2 columns */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="sticky top-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Náhled</h2>
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Button
                    variant={viewMode === "desktop" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("desktop")}
                    className="flex items-center gap-1"
                  >
                    <Laptop className="h-4 w-4" />
                    <span>Desktop</span>
                  </Button>
                  <Button
                    variant={viewMode === "mobile" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("mobile")}
                    className="flex items-center gap-1"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Mobil</span>
                  </Button>
                </div>
              </div>

              <div
                className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center ${
                  viewMode === "mobile" ? "max-w-[375px] h-[667px] mx-auto" : "w-full aspect-[16/9]"
                }`}
              >
                <div
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden ${
                    viewMode === "mobile" ? "w-full h-full" : "w-[80%] max-w-md aspect-[9/16]"
                  }`}
                >
                  <div className="h-full flex flex-col">
                    <div className="bg-gradient-to-r from-[#173B3F] to-[#96C4C8] p-4 text-white">
                      <div className="flex justify-between items-center">
                        <div className="text-sm opacity-80">eshop.cz</div>
                        <div className="text-sm opacity-80">12:34</div>
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-6">
                      <Button
                        onClick={() => setIsModalOpen(true)}
                        style={{ backgroundColor: settings.primaryColor }}
                        className="px-8 py-6 text-lg"
                      >
                        Ověřit věk
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-[#173B3F] to-[#96C4C8] p-4">
                    <h3 className="text-white font-medium">Doporučené barvy PassProve</h3>
                  </div>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-5 gap-2">
                      <button
                        className="h-12 rounded-md border transition-transform hover:scale-105 flex items-center justify-center"
                        style={{ backgroundColor: "#173B3F" }}
                        onClick={() => updateSetting("primaryColor", "#173B3F")}
                      >
                        <span className="text-white text-xs">Hlavní</span>
                      </button>
                      <button
                        className="h-12 rounded-md border transition-transform hover:scale-105 flex items-center justify-center"
                        style={{ backgroundColor: "#96C4C8" }}
                        onClick={() => updateSetting("secondaryColor", "#96C4C8")}
                      >
                        <span className="text-gray-800 text-xs">Vedlejší</span>
                      </button>
                      <button
                        className="h-12 rounded-md border transition-transform hover:scale-105"
                        style={{ backgroundColor: "#F0D423" }}
                        onClick={() => updateSetting("primaryColor", "#F0D423")}
                      />
                      <button
                        className="h-12 rounded-md border transition-transform hover:scale-105"
                        style={{ backgroundColor: "#9D9D9C" }}
                        onClick={() => updateSetting("primaryColor", "#9D9D9C")}
                      />
                      <button
                        className="h-12 rounded-md border transition-transform hover:scale-105"
                        style={{ backgroundColor: "#1D1D1B" }}
                        onClick={() => updateSetting("primaryColor", "#1D1D1B")}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Settings Section - 3 columns */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <h2 className="text-2xl font-semibold mb-6">Nastavení</h2>

            <div className="grid gap-8">
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {settings.welcomeText.length}/150 znaků
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buttonShape">Tvar tlačítek</Label>
                        <Select
                          value={settings.buttonShape}
                          onValueChange={(value) => updateSetting("buttonShape", value)}
                        >
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

                      <div className="space-y-2">
                        <Label htmlFor="fontFamily">Font</Label>
                        <Select
                          value={settings.fontFamily}
                          onValueChange={(value) => updateSetting("fontFamily", value)}
                        >
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
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-[#173B3F] to-[#96C4C8] p-4">
                  <h3 className="text-white font-medium">Metody ověření</h3>
                </div>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="space-y-4">
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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

