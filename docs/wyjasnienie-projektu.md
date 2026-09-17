# Simple Shop — jak to działa (notatka dla siebie)

Ten plik nie jest częścią README (to jest dla rekrutera/oceniającego). Tu tłumaczę
po ludzku, jak poukładany jest kod i dlaczego akurat tak — żebyś mógł to swobodnie
opowiedzieć na rozmowie albo szybko sobie przypomnieć za miesiąc.

## 1. Co tu w ogóle jest

Jedna strona: tabela produktów + przycisk „Dodaj produkt”, który otwiera modal
z 3-krokowym formularzem. Zero backendu — dane trzymane w pamięci przeglądarki
(`useState` w `App.tsx`), więc po odświeżeniu strony dodane produkty znikają
(zostają tylko 5 produktów startowych). Jedyna rzecz zapisana w URL to numer
strony tabeli (`?page=`).

## 2. Mapa katalogów — co gdzie szukać

```
src/
  App.tsx                       # trzyma listę produktów (useState), renderuje ProductsPage
  schemas/product-schema.ts     # SERCE walidacji — schematy Zod dla każdego kroku
  data/
    product-options.ts          # słowniki: producenci, kategorie, cechy, VAT, waluty
    mock-products.ts            # 5 startowych produktów
  hooks/form.ts                 # konfiguracja TanStack Form (żeby dało się dzielić na pliki)
  components/
    products/
      add-product-dialog.tsx    # modal + logika przechodzenia między krokami 1→2→3
      step-indicator.tsx        # pasek z kółkami 1/2/3 na górze modala
      steps/                    # trzy pliki — pola każdego kroku
      product-table.tsx         # tabela + paginacja (TanStack Table + nuqs)
      product-columns.tsx       # definicje kolumn tabeli
    ui/                         # gotowe komponenty shadcn/ui (button, dialog, select...)
e2e/product-form.spec.ts        # testy Playwright — klikają po prawdziwej przeglądarce
```

## 3. Po co ta konkretna biblioteka

- **Zod** — opisuje, jak wyglądają poprawne dane („nazwa min. 3 znaki”, „SKU tylko
  litery/cyfry”...). Jeden schemat = jedno źródło prawdy, którego można użyć
  zarówno do walidacji pojedynczego pola, jak i całego kroku naraz.
- **TanStack Form** — trzyma stan całego formularza (wszystkie 3 kroki naraz, w
  jednym `useAppForm`). Dzięki temu przejście „Wstecz” nic nie kasuje — to nie są
  3 osobne formularze, tylko jeden, gdzie pokazujemy raz jeden, raz drugi zestaw pól.
- **TanStack Table** — silnik do tabeli (sortowanie, paginacja jako „model danych”),
  bez narzucania wyglądu — wygląd robimy sami komponentami shadcn/ui.
- **nuqs** — trzyma numer strony w `?page=1` zamiast w zwykłym `useState`, więc
  odświeżenie strony nie resetuje, na której stronie tabeli byłeś.
- **shadcn/ui** — nie biblioteka z npm, tylko gotowe komponenty *wklejone do kodu*
  (`src/components/ui/`). Dlatego można je swobodnie modyfikować — np. zmieniłem
  `Input`/`Select` na w pełni zaokrąglone (`rounded-full`), bo tak wyglądało w Figmie.

## 4. Jak działa formularz krok po kroku

`add-product-dialog.tsx` trzyma dwa stany: `step` (0/1/2) i `form` (jeden,
wspólny dla wszystkich kroków). Renderuje się tylko komponent aktualnego kroku
(`{step === 0 && <StepBasicInfo .../>}` itd.) — pola pozostałych kroków są cały
czas „w formularzu”, tylko niewidoczne.

Kliknięcie „Dalej” / „Zapisz produkt” wywołuje `handlePrimaryAction`:
1. Odpala walidację pól **tylko bieżącego kroku** (`form.validateField`).
2. Dodatkowo sprawdza cały krok naraz przez jego schemat Zod (`safeParse`) — to
   łapie reguły, które dotyczą kilku pól naraz (patrz punkt 5 i 6).
3. Jeśli coś nie gra — **nie przechodzi dalej**, błędy pokazują się pod polami.
4. Jeśli to ostatni krok i wszystko OK — tworzy obiekt produktu, dodaje go do
   listy (`onAddProduct`), pokazuje toast i zamyka modal.

Zamknięcie modala w dowolny sposób (X, Escape, klik w tło) woła
`handleOpenChange(false)`, co resetuje formularz (`form.reset()`) i wraca do
kroku 1 — zgodnie ze specyfikacją.

## 5. Ceny (krok 2) — jak się przeliczają

To nie jest walidacja, tylko zwykły `onChange` na polu:
- wpisujesz **Cena netto** → od razu liczy `brutto = netto × (1 + VAT/100)` i
  wstawia do pola brutto (`form.setFieldValue("grossPrice", ...)`),
- wpisujesz **Cena brutto** → liczy netto w drugą stronę,
- zmieniasz **VAT** → przelicza brutto z aktualnego netto.

Zod dodatkowo ma „siatkę bezpieczeństwa” (`pricingIssues` w `product-schema.ts`),
która sprawdza, czy obie ceny są ze sobą spójne — w normalnym użytkowaniu nigdy
nie powinna nic wyłapać, bo pola same się pilnują; to na wypadek dziwnych
przypadków (zaokrąglenia, wklejone wartości).

## 6. Krok 3 — pole „Ilość na magazynie”

Pojawia się **tylko gdy zaznaczysz „Produkt limitowany”**. Technicznie:
`form.Subscribe` w `step-availability.tsx` podgląda wartość `isLimited` i
renderuje pole `stockQuantity` warunkowo. Odznaczenie checkboxa czyści tę
wartość (`null`), żeby nie zostały „śmieci” w danych.

Limity koszyka (min/maks) pilnują się nawzajem na bieżąco —
`validators.onChangeListenTo` w `step-availability.tsx` sprawia, że zmiana
jednego pola od razu przelicza walidację drugiego (np. wpisując maks. mniejsze
niż min., obydwa pola od razu pokażą błąd).

## 7. Tabela i paginacja

`PAGE_SIZE = 3` w `product-table.tsx` — celowo małe, żeby 5 startowych
produktów od razu dało 2 strony (inaczej paginacja nie miałaby czego pokazywać).
Numer strony w URL jest 1-indeksowany (`?page=1`, `?page=2`...), a TanStack
Table wewnątrz liczy od zera — konwersja między tymi dwoma światami dzieje się
w jednym miejscu (`pageIndex = page - 1`), żeby nie mieszać konwencji w całym kodzie.

## 8. Skąd wiadomo, że to działa (nie „na oko”)

`e2e/product-form.spec.ts` — 6 testów Playwright, które naprawdę klikają po
stronie w przeglądarce (nie testy jednostkowe na sucho): pełna ścieżka dodania
produktu, blokowanie „Dalej” przy błędnych danych, walidacja SKU, przeliczanie
cen, reset po zamknięciu, paginacja w URL. Jak odpalić — patrz README.

## 9. Gdzie design (Figma) różni się od treści PDF-a

Zadanie dawało dwa źródła prawdy — PDF (opis logiki/walidacji) i Figma (wygląd).
Czasem się różniły w nazewnictwie (np. przycisk zapisu w Figmie to „Zapisz
produkt”, a nie „Dodaj produkt”; przełącznik dostępności to „Produkt jest
dostępny”, a nie „Czy produkt jest dostępny”). W takich przypadkach na ekranie
jest dokładny tekst z Figmy, a logika/reguły walidacji trzymają się PDF-a —
bo ocena zadania patrzy właśnie na zgodność z designem. Pełna lista w README,
sekcja „Decyzje projektowe”.
