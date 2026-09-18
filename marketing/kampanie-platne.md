# Kampanie płatne — Meta Ads i Google Ad Grants

Budżet płatny (z kategorii marketing, 150 tys. PLN/18 mies.): Meta Ads ~2 500 PLN/mies.
od M3 + Google Ad Grants (bezpłatne 10 000 USD/mies. w Google Search dla NGO — patrz sekcja 2).

---

## 1. Meta Ads (Facebook + Instagram)

### Kampania M-1: „Nabór gmin i rodziców" (cel: zgłoszenia)
- **Cel kampanii:** konwersje (wysłanie formularza na zgloszenia.html) / formularze błyskawiczne.
- **Targetowanie:** Polska, geotargeting na powiaty pilotażowe (promień 30 km wokół
  wybranych gmin), wiek 28–55, rodzice; osobny zestaw: nauczyciele (zainteresowania
  edukacyjne). **Wykluczamy targetowanie dzieci — reklamy kierujemy wyłącznie do dorosłych.**
- **Budżet:** 1 000 PLN/mies. w fazie naboru.
- **Kreacje (A/B):**
  - Wariant A (szansa): „Bezpłatne szkolenie AI w [powiat]. Przyjeżdżamy z gotowym
    programem i trenerami. Zgłoś szkołę swojego dziecka." + zdjęcie pracowni.
  - Wariant B (bezpieczeństwo): „Twoje dziecko już używa AI. Nauczymy je robić to
    bezpiecznie — bezpłatnie, w Waszej gminie." + grafika deepfake-quiz.
- **KPI:** koszt zgłoszenia < 25 PLN; CTR > 1,5%.

### Kampania M-2: „Darczyńcy cykliczni" (cel: wpłaty)
- **Cel:** konwersje (wpłata na wsparcie.html), remarketing na odwiedzających stronę
  i obserwujących (custom audiences + lookalike 1% darczyńców).
- **Budżet:** 1 000 PLN/mies. od M4.
- **Kreacje:**
  - „100 zł = godzina warsztatów AI dla grupy dzieci z małej gminy. Zobacz relacje
    z zajęć, które opłacili darczyńcy." (wideo 15 s z warsztatów)
  - „30 zł miesięcznie — mniej niż jedna pizza. Dla dziecka z małej gminy: solidna dawka
    wiedzy o technologii, która zdecyduje o jego przyszłości."
- **KPI:** koszt pozyskania darczyńcy cyklicznego < 60 PLN; ROAS kampanii jednorazowych > 2,5.

### Kampania M-3: „E-book / cegiełki" (cel: sprzedaż)
- **Cel:** konwersje (zakup e-booka), szeroka grupa rodziców w całej Polsce
  (produkt cyfrowy nie wymaga geotargetingu).
- **Budżet:** 500 PLN/mies. pulsacyjnie (wrzesień — początek roku szkolnego, Dzień
  Dziecka, Mikołajki).
- **Kreacja:** „Bezpieczny AI-Guide dla Rodzica — 60 stron konkretów zamiast paniki.
  Kupując, fundujesz warsztaty dzieciom z małych miejscowości."
- **KPI:** koszt sprzedaży < 15 PLN (przy cenie 39–49 PLN).

### Zgodność (Meta)
- Kategoria reklamodawcy: organizacja non-profit; przejść weryfikację strony.
- Zakaz targetowania < 18 lat; brak remarketingu na osoby, które cofnęły zgodę.
- Piksel Meta na stronie **dopiero po** wdrożeniu banera zgód (obecnie strona nie
  używa cookies — piksel wymaga zgody wg ePrivacy/RODO).

---

## 2. Google Ad Grants (10 000 USD/mies. bezpłatnie)

### Proces uzyskania
1. Konto Google for Nonprofits (wymaga wpisu KRS; weryfikacja przez Percent/TechSoup Polska).
2. Aktywacja Ad Grants → konto Google Ads w trybie grantowym.
3. Warunki utrzymania: CTR ≥ 5% miesięcznie, min. 2 grupy reklam/kampanię,
   min. 2 linki rozszerzone, konwersje mierzone w GA4, brak słów jednowyrazowych
   i ogólnych, dzienna struktura budżetu ~329 USD.

### Kampanie search (tylko sieć wyszukiwania — ograniczenie grantu)

| Kampania | Słowa kluczowe (przykłady) | Landing | Cel |
|---|---|---|---|
| G-1 Rodzice: bezpieczeństwo | „czy chatgpt jest bezpieczny dla dzieci", „deepfake jak rozpoznać", „dziecko a sztuczna inteligencja" | e-book / misja | ruch + zapisy newsletter |
| G-2 Nauczyciele | „sztuczna inteligencja w szkole scenariusz lekcji", „ai w edukacji kurs" | kurs „AI w klasie" | sprzedaż DPP |
| G-3 Darczyńcy | „fundacja edukacyjna darowizna odliczenie", „jak pomóc dzieciom z małych miejscowości" | wsparcie.html | wpłaty |
| G-4 Brand | „szansa ai", „fundacja szansa ai" | strona główna | ochrona brandu, CTR↑ |

### Przykładowe reklamy (RSA)
- **Nagłówki:** „Bezpłatne Warsztaty AI Dla Dzieci" / „Fundacja Szansa AI" /
  „Edukacja AI w Małych Gminach" / „Odlicz Darowiznę Od Podatku"
- **Teksty:** „Uczymy dzieci z małych miejscowości bezpiecznego korzystania z AI.
  Dołącz do darczyńców." / „Poradnik dla rodziców: AI bez paniki i bez ryzyka. Pobierz."

---

## 3. Pomiar i atrybucja

- GA4 + konwersje: wpłata (thank-you page operatora), formularz zgłoszenia, zakup e-booka,
  zapis na newsletter. UTM-y wg schematu `utm_source/medium/campaign=m1-nabor-gmin`.
- Cotygodniowy raport skuteczności w systemie Jarvis (`jarvis report marketing`).
- Test przyrostowy co kwartał: pauza kampanii darczyńców na 2 tyg. w jednym regionie —
  weryfikacja, czy wpłaty rzeczywiście pochodzą z reklam.
