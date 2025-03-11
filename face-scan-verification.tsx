"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, CheckCircle, AlertCircle, ArrowLeft, RefreshCw, Shield } from "lucide-react"
import SaveVerificationResult from "./save-verification-result"

interface FaceScanVerificationProps {
  onComplete: (success: boolean) => void
  onBack: () => void
  primaryColor: string
  buttonClass?: string
}

export default function FaceScanVerification({
  onComplete,
  onBack,
  primaryColor = "#173B3F",
  buttonClass = "rounded-md",
}: FaceScanVerificationProps) {
  const [step, setStep] = useState<"instructions" | "scanning" | "processing" | "result" | "save">("instructions")
  const [result, setResult] = useState<"success" | "failure" | null>(null)
  const [countdown, setCountdown] = useState(3)
  const [faceCaptured, setFaceCaptured] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [faceAligned, setFaceAligned] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)

  // Start camera when entering scanning step
  useEffect(() => {
    if (step === "scanning") {
      startCamera()

      // Simulate face detection after 1-2 seconds
      setTimeout(
        () => {
          setFaceDetected(true)

          // Simulate face alignment after another 1-2 seconds
          setTimeout(
            () => {
              setFaceAligned(true)

              // Start countdown after face is aligned
              const timer = setInterval(() => {
                setCountdown((prev) => {
                  if (prev <= 1) {
                    clearInterval(timer)
                    captureFace()
                    return 0
                  }
                  return prev - 1
                })
              }, 1000)
            },
            1000 + Math.random() * 1000,
          )
        },
        1000 + Math.random() * 1000,
      )

      // Start drawing face guide overlay
      startFaceGuideAnimation()

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [step])

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setStep("result")
      setResult("failure")
    }
  }

  const startFaceGuideAnimation = () => {
    if (!overlayCanvasRef.current || !videoRef.current) return

    const canvas = overlayCanvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    const drawFaceGuide = () => {
      if (!videoRef.current || !canvas) return

      // Set canvas dimensions to match video
      canvas.width = videoRef.current.clientWidth
      canvas.height = videoRef.current.clientHeight

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const ovalWidth = canvas.width * 0.5
      const ovalHeight = canvas.height * 0.7

      // Draw oval face guide
      context.beginPath()
      context.ellipse(centerX, centerY, ovalWidth / 2, ovalHeight / 2, 0, 0, 2 * Math.PI)
      context.strokeStyle = faceAligned
        ? "rgba(16, 185, 129, 0.8)"
        : faceDetected
          ? "rgba(245, 158, 11, 0.8)"
          : "rgba(239, 68, 68, 0.8)"
      context.lineWidth = 2
      context.stroke()

      // Draw face landmark points
      if (faceDetected) {
        // Eyes
        const eyeSize = ovalWidth * 0.08
        const eyeY = centerY - ovalHeight * 0.1
        const eyeXOffset = ovalWidth * 0.15

        // Left eye
        context.beginPath()
        context.ellipse(centerX - eyeXOffset, eyeY, eyeSize, eyeSize / 2, 0, 0, 2 * Math.PI)
        context.strokeStyle = faceAligned ? "rgba(16, 185, 129, 0.8)" : "rgba(245, 158, 11, 0.8)"
        context.stroke()

        // Right eye
        context.beginPath()
        context.ellipse(centerX + eyeXOffset, eyeY, eyeSize, eyeSize / 2, 0, 0, 2 * Math.PI)
        context.strokeStyle = faceAligned ? "rgba(16, 185, 129, 0.8)" : "rgba(245, 158, 11, 0.8)"
        context.stroke()

        // Nose
        context.beginPath()
        context.moveTo(centerX, eyeY + eyeSize)
        context.lineTo(centerX, eyeY + ovalHeight * 0.25)
        context.strokeStyle = faceAligned ? "rgba(16, 185, 129, 0.8)" : "rgba(245, 158, 11, 0.8)"
        context.stroke()

        // Mouth
        const mouthY = centerY + ovalHeight * 0.2
        const mouthWidth = ovalWidth * 0.3
        context.beginPath()
        context.ellipse(centerX, mouthY, mouthWidth / 2, mouthWidth / 6, 0, 0, Math.PI)
        context.strokeStyle = faceAligned ? "rgba(16, 185, 129, 0.8)" : "rgba(245, 158, 11, 0.8)"
        context.stroke()

        // Draw face mesh points
        if (faceAligned) {
          // Draw a grid of points to simulate face mesh
          const gridSize = 8
          const pointRadius = 1
          const gridWidth = ovalWidth * 0.8
          const gridHeight = ovalHeight * 0.8

          context.fillStyle = "rgba(16, 185, 129, 0.5)"

          for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
              const x = centerX - gridWidth / 2 + (gridWidth / (gridSize - 1)) * i
              const y = centerY - gridHeight / 2 + (gridHeight / (gridSize - 1)) * j

              // Only draw points that are inside the oval
              const normalizedX = (x - centerX) / (ovalWidth / 2)
              const normalizedY = (y - centerY) / (ovalHeight / 2)

              if (normalizedX * normalizedX + normalizedY * normalizedY <= 1) {
                context.beginPath()
                context.arc(x, y, pointRadius, 0, 2 * Math.PI)
                context.fill()
              }
            }
          }
        }
      }

      // Draw alignment guide text
      context.font = "14px Arial"
      context.textAlign = "center"

      if (!faceDetected) {
        context.fillStyle = "rgba(239, 68, 68, 0.8)"
        context.fillText("Umístěte obličej do oválu", centerX, centerY - ovalHeight / 2 - 20)
      } else if (!faceAligned) {
        context.fillStyle = "rgba(245, 158, 11, 0.8)"
        context.fillText("Vycentrujte obličej", centerX, centerY - ovalHeight / 2 - 20)
      } else {
        context.fillStyle = "rgba(16, 185, 129, 0.8)"
        context.fillText(`Nehýbejte se - ${countdown}`, centerX, centerY - ovalHeight / 2 - 20)
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(drawFaceGuide)
    }

    drawFaceGuide()
  }

  const captureFace = () => {
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

        setFaceCaptured(true)

        // Simulate processing
        setStep("processing")

        // Simulate verification result (80% success rate)
        setTimeout(() => {
          const success = Math.random() > 0.2
          setResult(success ? "success" : "failure")
          setStep(success ? "save" : "result")

          // Stop camera
          if (stream) {
            stream.getTracks().forEach((track) => track.stop())
          }

          // Stop animation
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
          }
        }, 2000)
      }
    }
  }

  const retryCapture = () => {
    setFaceCaptured(false)
    setFaceDetected(false)
    setFaceAligned(false)
    setCountdown(3)
    setStep("scanning")
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
                <Camera className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
              Ověření pomocí rozpoznání obličeje
            </h3>

            <p className="mb-6 text-gray-600">
              Pro ověření vašeho věku použijeme technologii rozpoznávání obličeje. Ujistěte se, že jste v dobře
              osvětleném prostředí a vaše tvář je jasně viditelná.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-medium mb-1">Krok 1</div>
                <p className="text-xs text-gray-500">Umístěte obličej do rámečku</p>
              </Card>
              <Card className="p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-medium mb-1">Krok 2</div>
                <p className="text-xs text-gray-500">Počkejte na odpočet</p>
              </Card>
              <Card className="p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-medium mb-1">Krok 3</div>
                <p className="text-xs text-gray-500">Systém ověří váš věk</p>
              </Card>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-700 mb-1">Bezpečné a soukromé</p>
                <p className="text-xs text-blue-600">
                  Vaše biometrická data jsou zpracována pouze lokálně a nejsou nikde ukládána. Celý proces probíhá v
                  souladu s GDPR.
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onBack} className={buttonClass}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zpět
              </Button>
              <Button
                onClick={() => setStep("scanning")}
                style={{ backgroundColor: primaryColor }}
                className={buttonClass}
              >
                Pokračovat
              </Button>
            </div>
          </div>
        )}

        {step === "scanning" && (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
              Snímání obličeje
            </h3>

            <div className="relative mb-6 rounded-lg overflow-hidden border-2 border-gray-300 aspect-[4/3] bg-black shadow-md">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={overlayCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
              <canvas ref={canvasRef} className="hidden" />

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${faceDetected ? (faceAligned ? "bg-green-500" : "bg-yellow-500") : "bg-red-500"}`}
                    ></div>
                    <span className="text-xs text-white">
                      {!faceDetected
                        ? "Hledání obličeje..."
                        : !faceAligned
                          ? "Zarovnání obličeje..."
                          : "Obličej detekován"}
                    </span>
                  </div>
                  <div className="text-xs text-white">{faceAligned && `Snímání za: ${countdown}s`}</div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Umístěte svůj obličej do vyznačeného oválu a nehýbejte se, dokud nebude snímání dokončeno.
            </p>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onBack} disabled={faceCaptured} className={buttonClass}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zpět
              </Button>
              <Button onClick={retryCapture} variant="outline" disabled={!faceCaptured} className={buttonClass}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Opakovat
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
              Probíhá ověřování
            </h3>
            <p className="text-gray-500">Čekejte prosím, ověřujeme váš věk...</p>

            <div className="max-w-xs mx-auto mt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Analýza obličeje</span>
                  <span>Dokončeno</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Ověření věku</span>
                  <span>Probíhá...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "save" && (
          <SaveVerificationResult
            onComplete={handleSaveComplete}
            onSkip={handleSaveSkip}
            primaryColor={primaryColor}
            buttonClass={buttonClass}
          />
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

                <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-green-700 mb-1">Ověření dokončeno</p>
                    <p className="text-xs text-green-600">
                      Vaše identita byla úspěšně ověřena. Děkujeme za využití služby PassProve.
                    </p>
                  </div>
                </div>
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

                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-red-700 mb-1">Možné důvody selhání</p>
                    <ul className="text-xs text-red-600 list-disc pl-4">
                      <li>Nedostatečné osvětlení</li>
                      <li>Obličej nebyl správně umístěn v rámečku</li>
                      <li>Pohyb během snímání</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4 justify-center">
              {result === "failure" && (
                <Button variant="outline" onClick={retryCapture} className={buttonClass}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Zkusit znovu
                </Button>
              )}
              <Button
                onClick={completeVerification}
                style={{ backgroundColor: result === "success" ? "#10b981" : primaryColor }}
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

