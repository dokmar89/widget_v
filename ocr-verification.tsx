"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Scan, CheckCircle, AlertCircle, ArrowLeft, RefreshCw, Upload, Camera } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SaveVerificationResult from "./save-verification-result"

interface OCRVerificationProps {
  onComplete: (success: boolean) => void
  onBack: () => void
  primaryColor: string
  buttonClass?: string
}

export default function OCRVerification({
  onComplete,
  onBack,
  primaryColor = "#173B3F",
  buttonClass = "rounded-md",
}: OCRVerificationProps) {
  const [step, setStep] = useState<"instructions" | "upload" | "processing" | "result" | "save">("instructions")
  const [result, setResult] = useState<"success" | "failure" | null>(null)
  const [activeTab, setActiveTab] = useState<"upload" | "camera">("upload")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      setStream(mediaStream)
      setCameraActive(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      alert("Nepodařilo se získat přístup k fotoaparátu. Zkuste nahrát fotografii.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setCameraActive(false)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to data URL
        const dataUrl = canvas.toDataURL("image/jpeg")
        setImagePreview(dataUrl)

        // Stop camera
        stopCamera()
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as "upload" | "camera")
    if (value === "camera") {
      startCamera()
    } else {
      stopCamera()
    }
  }

  const handleUpload = () => {
    if (!imagePreview) {
      alert("Nejprve nahrajte fotografii dokladu nebo pořiďte snímek.")
      return
    }

    setStep("processing")

    // Simulate processing
    setTimeout(() => {
      // Simulate verification result (80% success rate)
      const success = Math.random() > 0.2
      setResult(success ? "success" : "failure")
      setStep(success ? "save" : "result")
    }, 3000)
  }

  const resetUpload = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const completeVerification = () => {
    onComplete(result === "success")
  }

  const handleSaveComplete = () => {
    onComplete(true)
  }

  const handleSaveSkip = () => {
    setStep("result")
  }

  return (
    <div className="w-full max-w-md mx-auto flex items-center justify-center">
      <div className="w-full">
        {step === "instructions" && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                <Scan className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
              Ověření pomocí dokladu totožnosti
            </h3>

            <p className="mb-6 text-gray-600">
              Pro ověření vašeho věku nahrajte fotografii vašeho dokladu totožnosti (občanský průkaz nebo cestovní pas).
              Ujistěte se, že jsou všechny údaje čitelné.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 text-center">
                <div className="text-sm font-medium mb-1">Krok 1</div>
                <p className="text-xs text-gray-500">Nahrajte fotografii dokladu</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-sm font-medium mb-1">Krok 2</div>
                <p className="text-xs text-gray-500">Systém zpracuje údaje</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-sm font-medium mb-1">Krok 3</div>
                <p className="text-xs text-gray-500">Ověříme váš věk</p>
              </Card>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onBack} className={buttonClass}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zpět
              </Button>
              <Button
                onClick={() => setStep("upload")}
                style={{ backgroundColor: primaryColor }}
                className={buttonClass}
              >
                Pokračovat
              </Button>
            </div>
          </div>
        )}

        {step === "upload" && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: primaryColor }}>
              Nahrání dokladu totožnosti
            </h3>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Nahrát soubor</TabsTrigger>
                <TabsTrigger value="camera">Použít fotoaparát</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="pt-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="mb-4">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Náhled dokladu"
                        className="max-h-[200px] mx-auto rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="py-8">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Přetáhněte sem soubor nebo klikněte pro výběr</p>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="flex gap-2 justify-center">
                    {imagePreview ? (
                      <Button variant="outline" onClick={resetUpload} className={buttonClass}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Změnit
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className={buttonClass}>
                        Vybrat soubor
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="camera" className="pt-4">
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  {imagePreview ? (
                    <div className="mb-4">
                      <img src={imagePreview || "/placeholder.svg"} alt="Náhled dokladu" className="w-full" />
                    </div>
                  ) : (
                    <div className="relative bg-black aspect-[4/3]">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}

                  <div className="p-4 flex justify-center">
                    {imagePreview ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setImagePreview(null)
                          startCamera()
                        }}
                        className={buttonClass}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Pořídit nový snímek
                      </Button>
                    ) : (
                      <Button onClick={captureImage} disabled={!cameraActive} className={buttonClass}>
                        <Camera className="h-4 w-4 mr-2" />
                        Pořídit snímek
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onBack} className={buttonClass}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zpět
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!imagePreview}
                style={{ backgroundColor: primaryColor }}
                className={buttonClass}
              >
                Pokračovat
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
              Probíhá zpracování
            </h3>
            <p className="text-gray-500">Čekejte prosím, zpracováváme váš doklad...</p>
          </div>
        )}

        {step === "save" && (
          <SaveVerificationResult onComplete={handleSaveComplete} onSkip={handleSaveSkip} primaryColor={primaryColor} />
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
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("upload")
                    setImagePreview(null)
                  }}
                  className={buttonClass}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Zkusit znovu
                </Button>
              )}
              <Button
                onClick={completeVerification}
                style={{ backgroundColor: result === "success" ? "green" : primaryColor }}
                className={buttonClass}
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

