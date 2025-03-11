"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Scan, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  RefreshCw, 
  Shield, 
  CameraIcon, 
  Upload 
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import SaveVerificationResult from "./save-verification-result"
import { ApiService } from '../services/api'

interface OCRVerificationProps {
  onComplete: (success: boolean) => void
  onBack: () => void
  primaryColor: string
  buttonClass?: string
  sessionId: string
}

export default function OCRVerification({
  onComplete,
  onBack,
  primaryColor = "#173B3F",
  buttonClass = "rounded-md",
  sessionId,
}: OCRVerificationProps) {
  const [step, setStep] = useState<"instructions" | "capture" | "processing" | "result" | "save">("instructions")
  const [result, setResult] = useState<"success" | "failure" | null>(null)
  const [documentType, setDocumentType] = useState<"id" | "passport" | "driving-license" | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Ukončení streamu kamery při odchodu z komponenty
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  // Simulace postupu zpracování
  useEffect(() => {
    if (step === "processing") {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 5
        })
      }, 150)

      return () => clearInterval(interval)
    }
  }, [step])

  // Zpracování výsledku po dokončení progress baru
  useEffect(() => {
    if (progress === 100 && step === "processing") {
      processOCR()
    }
  }, [progress])

  const processOCR = async () => {
    if (!imageSrc) {
      setResult("failure")
      setErrorMessage("Nepodařilo se zpracovat obrázek. Zkuste to prosím znovu.")
      setStep("result")
      return
    }

    try {
      // Odeslání obrázku na server pro OCR
      const response = await ApiService.verifyWithOcr(sessionId, imageSrc)
      
      if (response.success && response.data?.verified) {
        setResult("success")
        setStep("result")
      } else {
        setResult("failure")
        setErrorMessage(response.message || "Nepodařilo se ověřit váš doklad. Zkuste to prosím znovu.")
        setStep("result")
      }
    } catch (error) {
      console.error('Chyba při ověřování dokladu', error)
      setResult("failure")
      setErrorMessage("Při ověřování došlo k chybě. Zkuste to prosím znovu.")
      setStep("result")
    }
  }

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

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Chyba při spuštění kamery', error)
      setErrorMessage('Nepodařilo se získat přístup ke kameře. Zkontrolujte, zda máte povolen přístup ke kameře ve vašem prohlížeči.')
    }
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const video = videoRef.current
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    const imageData = canvas.toDataURL('image/jpeg')
    setImageSrc(imageData)
    
    // Zastavit stream kamery
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    
    // Přejít na krok zpracování
    setStep("processing")
    setProgress(0)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (file) {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImageSrc(result)
        
        // Přejít na krok zpracování
        setStep("processing")
        setProgress(0)
      }
      
      reader.onerror = () => {
        setErrorMessage("Nepodařilo se načíst soubor. Zkuste to prosím znovu.")
      }
      
      reader.readAsDataURL(file)
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

  // Různé stavy a UI komponenty podle aktuálního kroku verifikace

  // Instrukce
  if (step === "instructions") {
    return (
      <div className="space-y-6 p-1">
        <h2 className="text-xl font-semibold text-center">Ověření pomocí dokladu</h2>
        
        <p className="text-center text-muted-foreground">
          Pro ověření vašeho věku prosím naskenujte platný doklad totožnosti.
        </p>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Card
            className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
              documentType === "id" ? "border-2 border-primary" : ""
            }`}
            onClick={() => setDocumentType("id")}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <Scan className="h-8 w-8" />
              <span className="text-sm font-medium">Občanský průkaz</span>
            </div>
          </Card>
          
          <Card
            className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
              documentType === "passport" ? "border-2 border-primary" : ""
            }`}
            onClick={() => setDocumentType("passport")}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <Scan className="h-8 w-8" />
              <span className="text-sm font-medium">Cestovní pas</span>
              </div>
          </Card>
          
          <Card
            className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
              documentType === "driving-license" ? "border-2 border-primary" : ""
            }`}
            onClick={() => setDocumentType("driving-license")}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <Scan className="h-8 w-8" />
              <span className="text-sm font-medium">Řidičský průkaz</span>
            </div>
              </Card>
            </div>

        <div className="flex flex-col space-y-4 mt-8">
              <Button
                style={{ backgroundColor: primaryColor }}
                className={buttonClass}
            onClick={() => {
              setStep("capture")
              startCamera()
            }}
            disabled={!documentType}
              >
            <CameraIcon className="mr-2 h-4 w-4" />
            Fotit doklad
              </Button>
          
          <Button
            variant="outline"
            className={buttonClass}
            onClick={() => fileInputRef.current?.click()}
            disabled={!documentType}
          >
            <Upload className="mr-2 h-4 w-4" />
            Nahrát fotografii
          </Button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
            onChange={handleFileUpload}
          />
        </div>
        
        <Button variant="ghost" onClick={onBack} className="mt-4 w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zpět
                      </Button>
        
        <div className="text-xs text-muted-foreground mt-6">
          <p className="flex items-center mb-2">
            <Shield className="h-3 w-3 mr-1" />
            Vaše data jsou šifrována a bezpečně uložena.
          </p>
          <p>
            Doklad bude použit pouze pro účely ověření věku a bude po ověření bezpečně smazán.
          </p>
                  </div>
                </div>
    )
  }

  // Zachycení pomocí kamery
  if (step === "capture") {
    return (
      <div className="space-y-6 p-1">
        <h2 className="text-xl font-semibold text-center">Vyfoťte svůj doklad</h2>
        
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
                      <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute inset-0 border-2 border-dashed border-primary opacity-50 pointer-events-none" />
                    </div>
        
        <p className="text-center text-sm text-muted-foreground">
          Umístěte celý doklad do vyznačeného rámečku a ujistěte se, že je text dobře čitelný.
        </p>

        <div className="flex space-x-4">
                      <Button
                        variant="outline"
            className={`${buttonClass} flex-1`}
                        onClick={() => {
              if (stream) {
                stream.getTracks().forEach((track) => track.stop())
                setStream(null)
              }
              setStep("instructions")
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
                Zpět
              </Button>
          
              <Button
                style={{ backgroundColor: primaryColor }}
            className={`${buttonClass} flex-1`}
            onClick={captureImage}
              >
            <CameraIcon className="mr-2 h-4 w-4" />
            Vyfotit
              </Button>
            </div>
          </div>
    )
  }

  // Zpracování
  if (step === "processing") {
    return (
      <div className="space-y-6 p-1">
        <h2 className="text-xl font-semibold text-center">Zpracováváme váš doklad</h2>
        
        {imageSrc && (
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={imageSrc}
              alt="Captured ID"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-muted-foreground">
            Probíhá ověřování vašeho dokladu...
          </p>
        </div>
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
            : errorMessage || "Nepodařilo se ověřit váš věk. Zkuste to prosím znovu s jiným dokladem nebo jinou metodou."}
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

