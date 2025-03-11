import { createRoot } from "react-dom/client"
import { PassProveWidget, type PassProveWidgetProps } from "./PassProveWidget"

interface PassProveInitOptions extends PassProveWidgetProps {
  /**
   * Selektor elementu, do kterého se vloží tlačítko pro ověření věku
   */
  selector: string
}

export function init(options: PassProveInitOptions): void {
  const { selector, ...widgetProps } = options

  // Najdi element podle selektoru
  const container = document.querySelector(selector)

  if (!container) {
    console.error(`PassProve: Element s selektorem "${selector}" nebyl nalezen.`)
    return
  }

  // Vytvoř div pro widget
  const widgetContainer = document.createElement("div")
  widgetContainer.className = "passprove-widget-container"
  container.appendChild(widgetContainer)

  // Renderuj React komponentu do kontejneru
  const root = createRoot(widgetContainer)
  root.render(<PassProveWidget {...widgetProps} />)
}

// Přidej globální objekt pro inicializaci widgetu
declare global {
  interface Window {
    PassProve?: {
      init: typeof init
    }
  }
}

// Inicializuj globální objekt
if (typeof window !== "undefined") {
  window.PassProve = {
    init,
  }
}

