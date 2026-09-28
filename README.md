# Fundacja Szansa AI — strona www

Premiumowa strona Fundacji „Szansa AI”: edukacja AI dla dzieci z małych miejscowości i wsi.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- GSAP + ScrollTrigger (panele 3D)
- Lenis (smooth scroll)
- Lucide React
- i18n: PL (domyślny) | EN

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
  lib/                  # i18n, legal
public/
  brand/                # logo SVG
  legal/                # statut, RODO, SOM, regulamin
```

## Dane rejestrowe

Zgodnie ze statutem (KRS):

| Pole | Wartość |
|------|---------|
| KRS | 0001221999 |
| NIP | 6040267132 |
| REGON | 543905350 |
| Adres | ul. Świerkowa 3, 83-042 Ełganowo |
| E-mail | kontakt@szansaai.pl |

**Do uzupełnienia przed produkcją:** numer rachunku IBAN, nazwa banku oraz BLIK / operator płatności (oznaczone w UI jako PLACEHOLDER).

## Zgodność

- Cookie consent: akceptacja / odrzucenie cookies opcjonalnych (RODO/GDPR)
- Polityka prywatności (modal + pełny dokument w `/public/legal`)
- Linki: Statut, Standardy Ochrony Małoletnich (Ustawa Kamilka), sprawozdania (po pierwszym roku)
- WCAG 2.1 AA: kontrast, focus, skip-link, etykiety, `prefers-reduced-motion`
