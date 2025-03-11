# PassProve Widget

Univerzální widget pro ověřování věku pro e-shopy. Tento balíček umožňuje jednoduchou integraci ověřování věku do vašeho e-shopu.

## Instalace

### NPM
```bash
npm install passprove-widget
```

### Yarn
```bash
yarn add passprove-widget
```

## Použití

### React

```jsx
import { PassProveWidget } from 'passprove-widget';

function App() {
  return (
    <div className="App">
      <h1>Můj e-shop s věkovým omezením</h1>
      
      <PassProveWidget 
        shopId="vas-shop-id"
        primaryColor="#1a73e8"
        buttonText="Ověřit věk pro vstup"
        onVerificationSuccess={(method, data) => {
          console.log(`Úspěšné ověření metodou: ${method}`, data);
          // Zde můžete přesměrovat uživatele nebo zobrazit obsah s věkovým omezením
        }}
      />
    </div>
  );
}
```

### Vanilla JavaScript

```html
<div id="age-verification"></div>

<script src="https://cdn.jsdelivr.net/npm/passprove-widget/dist/umd/passprove-widget.min.js"></script>
<script>
  const widget = PassProve.createWidget({
    container: '#age-verification',
    shopId: 'vas-shop-id',
    primaryColor: '#1a73e8',
    buttonText: 'Ověřit věk pro vstup',
    onVerificationSuccess: (method, data) => {
      console.log(`Úspěšné ověření metodou: ${method}`, data);
      // Zde můžete přesměrovat uživatele nebo zobrazit obsah s věkovým omezením
    }
  });
</script>
```

## Konfigurace

PassProve Widget nabízí řadu možností konfigurace:

| Vlastnost           | Typ                 | Výchozí hodnota | Popis |
|---------------------|---------------------|-----------------|-------|
| shopId              | string              | -               | *Povinné* - ID vašeho obchodu pro identifikaci |
| shopLogo            | string              | -               | URL loga e-shopu |
| welcomeText         | string              | "Vítejte! Pro pokračování je nutné ověřit váš věk." | Uvítací text v modálním okně |
| primaryColor        | string              | "#173B3F"       | Primární barva (HEX) |
| secondaryColor      | string              | "#96C4C8"       | Sekundární barva (HEX) |
| buttonShape         | "rounded" \| "square" \| "pill" | "rounded" | Tvar tlačítek |
| fontFamily          | string              | "inter"         | Font použitý ve widgetu |
| showBankID          | boolean             | true            | Zobrazit metodu BankID |
| showMojeID          | boolean             | true            | Zobrazit metodu mojeID |
| showOCR             | boolean             | true            | Zobrazit metodu OCR |
| showFaceScan        | boolean             | true            | Zobrazit metodu Face Scan |
| showReVerification  | boolean             | true            | Zobrazit metodu opakovaného ověření |
| showQRCode          | boolean             | true            | Zobrazit metodu QR kódu |
| onVerificationSuccess | function          | -               | Callback při úspěšném ověření |
| onClose             | function            | -               | Callback při zavření modálního okna |
| buttonClassName     | string              | ""              | Vlastní CSS třídy pro tlačítko |
| buttonText          | string              | "Ověřit věk"    | Text tlačítka |
| autoOpen            | boolean             | false           | Automaticky otevřít modální okno při načtení stránky |

## Metody ověření

Widget podporuje několik metod ověření věku:

1. **BankID** - Ověření prostřednictvím bankovní identity
2. **MojeID** - Ověření pomocí mojeID
3. **OCR** - Ověření naskenováním dokladu totožnosti
4. **Face Scan** - Ověření pomocí analýzy obličeje
5. **QR kód** - Ověření pomocí naskenování QR kódu z jiného zařízení
6. **Opakované ověření** - Pro vracející se zákazníky, kteří již byli dříve ověřeni

## API Reference

Balíček obsahuje také nízkoúrovňové API pro vlastní implementaci:

```javascript
import { ApiService } from 'passprove-widget';

// Příklad volání API
async function verifyUser() {
  try {
    // Vytvoření session
    const session = await ApiService.createSession('ocr', 'vas-shop-id');
    
    // Ověření pomocí OCR
    const result = await ApiService.verifyWithOcr(session.sessionId, imageBase64);
    
    if (result.success) {
      console.log('Ověření úspěšné!', result.data);
    }
  } catch (error) {
    console.error('Chyba při ověřování:', error);
  }
}
```

## Vlastní komponenty

Widget lze rozšířit o vlastní komponenty nebo upravit existující:

```jsx
import { PassProveWidget } from 'passprove-widget';
import MyCustomVerification from './MyCustomVerification';

function CustomizedWidget() {
  return (
    <PassProveWidget
      shopId="vas-shop-id"
      renderCustomMethod={(props) => (
        <MyCustomVerification {...props} />
      )}
    />
  );
}
```
# widget_v
