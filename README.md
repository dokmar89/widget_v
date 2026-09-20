# PassProve — konfigurovatelný ověřovací widget

Prototyp widgetu v Reactu a TypeScriptu pro nabídku způsobů ověření věku v e-shopu. Repozitář spojuje upravitelné uživatelské rozhraní, ukázkové stránky a zdrojové kódy Supabase Edge Functions.

**Stav:** Prototyp do portfolia; sestavení balíčku není dokončené. Funkčnost napojení poskytovatelů ani připravenost pro produkci nejsou potvrzené.

## Co projekt obsahuje

- Nastavení vzhledu, textů, tlačítek a viditelnosti ověřovacích metod v `PassProveWidget.tsx`.
- Rozhraní pro sken obličeje, doklady/OCR, QR kódy a opakované ověření, doplněné o volby BankID a mojeID.
- Zdrojové kódy funkcí pro ověřovací relace, jednotlivé metody, ceny a ukládání výsledků.

## Technologie

Next.js, React, TypeScript, Tailwind CSS, Supabase, Rollup.

## Architektura a struktura

- `PassProveWidget.tsx` — hlavní React komponenta a její parametry
- `age-verification-modal.tsx` — zdroj ověřovacího modálního okna v kořeni projektu
- `supabase/functions/` — zdrojové kódy serverových funkcí
- `rollup.config.cjs` — konfigurace sestavení knihovny
- `src/types/index.d.ts` — vstupní soubor typových deklarací

## Lokální vývoj

Potřebujete Node.js a npm. Balíček deklaruje následující příkazy:

```sh
npm install
npm run build
# Sledování změn zdrojových souborů:
npm run dev
```

Sestavení blokuje chybějící vstupní soubor popsaný níže. Příkazy nebyly označeny za úspěšně otestované. `npm run serve` obsluhuje složku `dev`, jejíž ukázkové prostředí je také nutné ověřit.

## Konfigurace a omezení

Hlavní komponenta odkazuje na `./components/age-verification-modal`, ale složka `components/` v této verzi chybí; stejnojmenný zdroj je v kořeni. Také tento import vyžaduje opravu. Konfigurace Rollupu očekává `src/index.ts`, který v této verzi chybí. Pracuje také s generovanými deklaracemi v `dist/esm/types/`; před vydáním je nutné sestavení opravit a ověřit. `npm run dev` spouští sledování změn v Rollupu, nikoli vývojový server Next.js. Balíček má nastaveno `private: true`; zveřejnění balíčku `passprove-widget` nebylo ověřeno.

Funkce pro BankID obsahuje náhodnou/ukázkovou logiku. Nabízené volby v rozhraní nejsou důkazem certifikovaného ověření identity. Výsledek klientského callbacku nelze považovat za autoritativní potvrzení věku. Do ověření oprávnění, callbacků poskytovatelů a práce s daty používejte fiktivní údaje.

## Přínos pro portfolio

Ukazuje návrh konfigurovatelných komponent, typovaného rozhraní a rozdělení odpovědnosti mezi vložený widget a serverové služby. Zbývající technická práce je výslovně popsaná.

## Co doplnit do dokumentace

Snímky obrazovky s fiktivními daty, opakovatelný postup ověření a přehled skutečně otestovaných integrací. Přihlašovací údaje a konfigurace konkrétního nasazení patří mimo Git.
