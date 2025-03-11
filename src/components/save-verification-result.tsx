"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle, 
  ArrowLeft, 
  Smartphone, 
  Mail, 
  Cookie, 
  AlertCircle,
  Apple,
  } from "lucide-react"
import { ApiService } from "../services/api"

interface SaveVerificationResultProps {
  onComplete: (success: boolean) => void
  onBack: () => void
  primaryColor: string
  buttonClass?: string
  sessionId: string
}

export default function SaveVerificationResult({
  onComplete,
  onBack,
  primaryColor = "#173B3F",
  buttonClass = "rounded-md",
  sessionId,
}: SaveVerificationResultProps) {
  const [activeTab, setActiveTab] = useState<"cookie" | "email" | "phone" | "social">("cookie")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      let contactInfo = ""
      
      switch (activeTab) {
        case "phone":
          contactInfo = phoneNumber
          break
        case "email":
          contactInfo = email
          break
        case "social":
          // V případě sociálních účtů by zde byla implementace OAuth
          contactInfo = "social"
          break
        case "cookie":
        default:
          contactInfo = "cookie"
          break
      }
      
      const response = await ApiService.saveVerificationResult(
        sessionId, 
        activeTab, 
        contactInfo
      )
      
      if (response.success) {
        setSaved(true)
        // Počkat 2 sekundy a pak ukončit
        setTimeout(() => {
          onComplete(true)
        }, 2000)
      } else {
        setError(response.message || "Nastala chyba při ukládání výsledku ověření.")
      }
    } catch (error) {
      console.error('Chyba při ukládání výsledku', error)
      setError("Nastala chyba při ukládání výsledku ověření.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const isButtonDisabled = () => {
    if (isSubmitting) return true
    
    switch (activeTab) {
      case "phone":
        return !phoneNumber || phoneNumber.length < 9
      case "email":
        return !email || !email.includes('@')
      default:
        return false
    }
  }
  
  if (saved) {
    return (
      <div className="p-1 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-center">Uloženo!</h2>
          
          <p className="text-center text-muted-foreground">
            Výsledek ověření byl úspěšně uložen. Nyní můžete pokračovat.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-1 space-y-6">
      <h2 className="text-xl font-semibold text-center">Uložit výsledek ověření</h2>
      
      <p className="text-center text-muted-foreground">
        Vyberte způsob, jakým chcete uložit výsledek ověření pro příští návštěvy.
      </p>
      
      {error && (
        <div className="flex items-center p-3 rounded-md bg-red-50 text-red-800">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <Tabs defaultValue="cookie" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="cookie">Cookie</TabsTrigger>
          <TabsTrigger value="phone">Telefon</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="social">Účet</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cookie" className="p-4 border rounded-md mt-4">
          <div className="flex items-start space-x-4">
            <Cookie className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium">Cookie v prohlížeči</h3>
              <p className="text-sm text-muted-foreground">
                Výsledek ověření bude uložen v cookie ve vašem prohlížeči. 
                Funguje pouze na tomto zařízení a v tomto prohlížeči.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="phone" className="p-4 border rounded-md mt-4">
          <div className="flex items-start space-x-4 mb-4">
            <Smartphone className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium">Telefonní číslo</h3>
              <p className="text-sm text-muted-foreground">
                Na vaše telefonní číslo zašleme SMS s ověřovacím kódem, který pak můžete použít
                pro přihlášení na libovolném zařízení.
              </p>
            </div>
          </div>
          
          <Input
            type="tel"
            placeholder="+420 123 456 789"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </TabsContent>
        
        <TabsContent value="email" className="p-4 border rounded-md mt-4">
          <div className="flex items-start space-x-4 mb-4">
            <Mail className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium">E-mail</h3>
              <p className="text-sm text-muted-foreground">
                Na váš e-mail zašleme ověřovací odkaz, který pak můžete použít
                pro přihlášení na libovolném zařízení.
              </p>
            </div>
          </div>
          
          <Input
            type="email"
            placeholder="vas@email.cz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </TabsContent>
        
        <TabsContent value="social" className="p-4 border rounded-md mt-4">
          <div className="flex items-start space-x-4 mb-4">
            <div>
              <h3 className="font-medium">Sociální účet</h3>
              <p className="text-sm text-muted-foreground">
                Propojte si ověření s vaším sociálním účtem pro rychlé přihlášení.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="outline" className="w-full">
              <Apple className="h-4 w-4 mr-2" />
              Apple ID
            </Button>
            
            </div>
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
          onClick={handleSubmit}
          disabled={isButtonDisabled()}
        >
          {isSubmitting ? "Ukládání..." : "Uložit a pokračovat"}
        </Button>
      </div>
      
      <p className="text-xs text-center text-muted-foreground mt-4">
        Vaše ověření bude platné po dobu 30 dnů od data ověření.
      </p>
    </div>
  )
}

