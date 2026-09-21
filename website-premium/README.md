# Strona premium (styl awwwards) — punkt wyjścia do przebudowy

**Status: kandydat / praca w toku, NIE zastępuje jeszcze `website/`.**

To jest strona zaprojektowana przez fundatorkę (GSAP + Three.js, ciemny motyw,
scroll-driven animacje, horizontal scroll na sekcji programów) — jednostronicowa
(`index.html`, sekcje jako kotwice `#mission`, `#programs` itd.).

## Co już zaktualizowałam w tej turze

- Logo: sygnet w navbarze i stopce zamieniony na nowy motyw (sieć neuronów +
  dziecko sięgające po iskrę, złoty gradient) zamiast placeholdera „AI" w kółku.
- Dane formalne: KRS 0001221999, NIP 6040267132, REGON 543905350,
  adres ul. Świerkowa 3, 83-042 Ełganowo — w stopce i sekcji kontaktowej.
- Liczniki „Impact": przeliczone na realny model z `ANEKS-01-model-szkolen.md`
  (9 500 szkół w zasięgu misji wg GUS, 50 szkół w roku 1, 5 000 dzieci, 100%
  bezpłatnie) — wcześniej były to liczby-placeholdery.
- Opis programu „Warsztaty AI" doprecyzowany: intensywne, maks. 2-dniowe
  szkolenia (zgodnie z modelem — bez obietnicy przywożenia sprzętu).
- Link do polityki prywatności w stopce.

## Czego TU JESZCZE BRAKUJE (do wspólnej pracy w kolejnej turze)

1. **Struktura wielostronicowa** — fundatorka wyraźnie ceni to, że obecna
   `website/` ma osobne podstrony (nie przewijane sekcje). Ta wersja jest
   jednostronicowa; trzeba zdecydować: (a) rozbić na osobne pliki w tym stylu
   (misja.html, sponsorzy.html, wsparcie.html, zgloszenia.html) z zachowaniem
   wspólnego layoutu/animacji, czy (b) zostawić jako long-scroll z kotwicami.
2. **Moduł wpłat** — obecny formularz kontaktowy to tylko demo (`alert()`).
   Trzeba przenieść logikę modułu wpłat z `website/wsparcie.html`
   (`PAYMENT_CONFIG`, PayU) w tym samym stylu wizualnym.
3. **Formularz zgłoszeniowy szkół** — brak dedykowanej sekcji/strony
   (jest tylko ogólny formularz kontaktowy z selectem tematu).
4. **Pakiety sponsorskie** (Brązowy/Srebrny/Złoty) — brak sekcji z cennikiem;
   trzeba przenieść z `website/sponsorzy.html`.
5. **Treści sekcji „Programs" i „Why"** — obecnie ogólne opisy (kompetencje
   przyszłości, kreatywność) niezwiązane wprost z modelem 2-dniowych szkoleń;
   do dopracowania razem z fundatorką, sekcja po sekcji.
6. **Obrazy z Unsplash** (`h-card` w sekcji programów) — stockowe, docelowo
   zastąpić prawdziwymi zdjęciami z warsztatów (za zgodą, zgodnie z polityką
   wizerunku dzieci) lub dopracowaną grafiką w stylu logo.
7. **Telefon kontaktowy** — nadal placeholder `[uzupełnić]`.

## Dlaczego nie zrobiłam tego wszystkiego od razu

Fundatorka zdecydowała: *„narazie zostawmy tą stronę tak jak jest, a wrócimy
do jej przebudowy i wtedy wszystko razem z treściami będziemy robić"* — czyli
pełne połączenie (struktura + wszystkie treści + wszystkie podstrony) to
świadomie odłożone zadanie na dedykowaną turę pracy, nie coś do zrobienia
„przy okazji". Ta aktualizacja to bezpieczny, wartościowy krok pośredni:
strona ma już prawdziwe dane i nowe logo, gdyby ktoś ją zobaczył wcześniej.

## Podgląd lokalny

```bash
cd website-premium && python3 -m http.server 8080
```
