"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import AgeVerificationModal from "./age-verification-modal"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function Demo() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Upravit handleVerificationSelected pro podporu nových metod ověření
  const handleVerificationSelected = (method: string) => {
    console.log(`Selected verification method: ${method}`)

    // Show toast notification based on the verification method
    if (method === "facescan" || method === "ocr" || method === "reverification" || method === "qrcode") {
      const methodName =
        method === "facescan"
          ? "Face Scan"
          : method === "ocr"
            ? "OCR"
            : method === "reverification"
              ? "Opakované ověření"
              : "QR kód"

      toast({
        title: "Ověření úspěšné",
        description: `Váš věk byl úspěšně ověřen pomocí metody ${methodName}.`,
        variant: "default",
        duration: 5000,
        action: <ToastAction altText="Zavřít">Zavřít</ToastAction>,
      })
    } else {
      toast({
        title: "Metoda není implementována",
        description: `Metoda ${method} není v této ukázce plně implementována.`,
        variant: "destructive",
        duration: 5000,
        action: <ToastAction altText="Zavřít">Zavřít</ToastAction>,
      })
    }

    // Close the modal after verification
    setTimeout(() => {
      setIsModalOpen(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <header className="bg-[#173B3F] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WjkAe8ZTI3kS5AbMKIqw66tQ99eoFP.png"
              alt="PassProve Logo"
              className="h-8"
            />
            <span className="font-bold text-lg">PassProve</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm hover:underline">
              O nás
            </a>
            <a href="#" className="text-sm hover:underline">
              Kontakt
            </a>
            <a href="#" className="text-sm hover:underline">
              Podpora
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Ověření věku pro váš e-shop</h1>
          <p className="text-lg text-gray-600 mb-8">
            PassProve poskytuje jednoduché a bezpečné řešení pro ověření věku zákazníků vašeho e-shopu. Vyzkoušejte si,
            jak bude ověření vypadat pro vaše zákazníky.
          </p>

          <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
                <img src="/placeholder.svg?height=60&width=60" alt="E-shop logo" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Váš E-shop</h2>
              <p className="text-gray-500 mb-6">Dokončujete objednávku produktů s věkovým omezením</p>

              <Button onClick={() => setIsModalOpen(true)} className="bg-[#173B3F] hover:bg-[#0e2325]">
                Ověřit věk pro pokračování
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-2">Jednoduché nastavení</h3>
              <p className="text-gray-600 text-sm">Implementace do vašeho e-shopu je otázkou několika minut.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-2">Plně přizpůsobitelné</h3>
              <p className="text-gray-600 text-sm">Přizpůsobte vzhled ověření podle designu vašeho e-shopu.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-2">Bezpečné ověření</h3>
              <p className="text-gray-600 text-sm">Několik metod ověření pro maximální bezpečnost a pohodlí.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} PassProve. Všechna práva vyhrazena.</p>
        </div>
      </footer>

      <AgeVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerificationSelected={handleVerificationSelected}
        shopLogo="/placeholder.svg?height=60&width=120"
        welcomeText="Vítejte! Pro pokračování je nutné ověřit váš věk."
        primaryColor="#173B3F"
        secondaryColor="#96C4C8"
        buttonShape="rounded"
        fontFamily="inter"
      />
    </div>
  )
}

