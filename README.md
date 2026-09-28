# Fundacja Szansa AI — strona www

Premiumowa strona Fundacji „Szansa AI”: edukacja AI dla dzieci z małych miejscowości i wsi.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- GSAP + ScrollTrigger (panele 3D)
- `@studio-freight/lenis` (smooth scroll)
- Lucide React, `clsx`, `tailwind-merge`
- i18n: PL (domyślny) | EN
- Bez aliasu importów (`@/`) — ścieżki względne

## Uruchomienie

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Struktura

```
src/
  app/                  # layout, page, globals.css
  components/
    layout/             # Navbar, Footer, LanguageSwitcher
    sections/           # Preloader, Hero, PanelScroll, MissionVision, Donate, Contact
    ui/                 # CookieConsent, PrivacyModal
    providers/          # Language, Cookie, SmoothScroll
  lib/                  # i18n, legal, utils (cn)
public/
  brand/                # logo SVG
  legal/                # statut, RODO, SOM, regulamin
```

## Dane rejestrowe

| Pole | Wartość |
|------|---------|
| KRS | 0001221999 |
| NIP | 6040267132 |
| REGON | 543905350 |
| Adres | ul. Świerkowa 3, 83-042 Ełganowo |
| E-mail | kontakt@szansaai.pl |

**Do uzupełnienia przed produkcją:** IBAN, nazwa banku, BLIK / operator płatności (PLACEHOLDER w UI).

## Zgodność

- Cookie consent Accept / Reject (RODO/GDPR)
- Polityka prywatności (modal + `/public/legal`)
- Statut, Standardy Ochrony Małoletnich (Ustawa Kamilka), sprawozdania
- WCAG 2.1 AA: kontrast, focus, skip-link, `prefers-reduced-motion`

> Uwaga: pakiet `@studio-freight/lenis` jest oznaczony jako deprecated na rzecz `lenis` — używamy wersji wskazanej w wymaganiach projektu.
