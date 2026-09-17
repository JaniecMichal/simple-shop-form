# Simple Shop — wieloetapowy formularz dodawania produktu

Zadanie rekrutacyjne (Frontend/React) dla WorkConnect: trzyetapowy formularz dodawania
produktu osadzony w oknie modalnym, oraz tabela produktów z paginacją zsynchronizowaną
z URL-em. Pełna treść zadania: `docs/Specyfikacja_Zadania.pdf`, projekt UI: `docs/*.fig`.

**Działająca wersja online:** https://simple-shop-form.vercel.app/

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives, Nova preset — Geist + Lucide)
- **TanStack Form** — stan formularza i kroki (przez `createFormHook`, patrz `src/hooks/form.ts`)
- **TanStack Table v9** — tabela produktów i model paginacji
- **Zod** — schematy walidacji dla każdego kroku (`src/schemas/product-schema.ts`)
- **nuqs** — numer strony w parametrach URL (`?page=`)
- **Playwright** — testy e2e

## Uruchomienie lokalne

Wymagany Node.js 20+.

```bash
npm install
npm run dev
```

Aplikacja wystartuje pod adresem wypisanym w konsoli (domyślnie `http://localhost:5173`).

Inne przydatne skrypty:

```bash
npm run build     # tsc -b && vite build — build produkcyjny do ./dist
npm run preview   # podgląd builda produkcyjnego
npm run lint      # oxlint
```

## Testy e2e (Playwright)

Testy uruchamiają prawdziwą przeglądarkę (Chromium) i klikają po realnym UI: tabelę
i paginację zsynchronizowaną z URL, blokowanie nawigacji między krokami przy błędnych
danych, walidację SKU, automatyczne przeliczanie ceny netto/brutto/VAT, pełną ścieżkę
dodania produktu (krok 1 → 2 → 3 → zapis → toast → nowy wiersz w tabeli) oraz reset
formularza po zamknięciu dialogu.

Jednorazowo pobierz przeglądarkę używaną przez Playwright:

```bash
npx playwright install --with-deps chromium
```

Uruchomienie testów (samo automatycznie odpali `npm run dev`, jeśli serwer nie działa):

```bash
npx playwright test
```

Przydatne warianty:

```bash
npx playwright test --ui        # tryb interaktywny z podglądem kroków
npx playwright test --headed    # odpalenie z widoczną przeglądarką
npx playwright show-report      # raport HTML z ostatniego przebiegu
```

## Struktura projektu

```
src/
  components/
    ui/                     # komponenty shadcn/ui (button, dialog, select, table, ...)
    products/
      add-product-dialog.tsx # modal + logika przechodzenia między krokami
      step-indicator.tsx     # pasek postępu 1/2/3
      steps/                 # pola każdego z 3 kroków (TanStack Form)
      product-table.tsx      # tabela + paginacja (TanStack Table + nuqs)
      product-columns.tsx    # definicje kolumn tabeli
  schemas/product-schema.ts  # schematy Zod per krok + reguły współzależne (np. min ≤ maks)
  data/                      # słowniki (producenci, kategorie, cechy, VAT, waluty) + mocki
  hooks/form.ts               # `createFormHook` — pozwala dzielić formularz na pliki kroków
e2e/                          # testy Playwright
```

## Decyzje projektowe (dla zrozumienia logiki)

- **Rozbieżności treści między PDF a Figmą**: tam gdzie projekt w Figmie różnił się
  literalnym brzmieniem etykiet od specyfikacji PDF (np. przycisk zapisu na kroku 3 to
  „Zapisz produkt", switch dostępności to „Produkt jest dostępny", pola limitów koszyka
  to „Minimalna/Maksymalna ilość"), w UI zastosowano dokładne teksty z Figmy (ocena
  zadania premiuje wierność designowi), a logika walidacji trzyma się reguł z PDF-a.
- **Przeliczanie cen (krok 2)**: edycja `Cena netto`, `Cena brutto` lub `Stawka VAT`
  natychmiast przelicza pozostałe pola (`brutto = netto × (1 + VAT / 100)`) —
  patrz `src/components/products/steps/step-pricing.tsx`. Schemat Zod dodatkowo
  weryfikuje spójność obu cen jako zabezpieczenie (tolerancja zaokrągleń ±0,02).
- **Pole „Ilość na magazynie" (krok 3)**: renderowane i wymagane tylko, gdy zaznaczono
  „Produkt limitowany" — sterowane przez `form.Subscribe` w `step-availability.tsx`.
- **Walidacja per krok + integracja z TanStack Form**: każdy krok ma własny schemat Zod
  (`basicInfoSchema`, `pricingSchema`, `availabilitySchema`). Pola formularza podpinają
  pojedyncze części schematu jako walidatory `onChange` (natychmiastowy feedback), a
  reguły między polami (np. min ≤ maks, cena spójna z VAT) korzystają z
  `validators.onChangeListenTo`. Kliknięcie „Dalej"/„Zapisz produkt" dodatkowo uruchamia
  pełny schemat danego kroku jako ostateczną bramkę przed przejściem dalej — przycisk
  nigdy nie przechodzi do kolejnego kroku przy niepoprawnych danych, a powrót do
  poprzedniego kroku nie czyści wprowadzonych wartości (jeden `useAppForm` na cały
  dialog, kroki tylko przełączają widoczność pól).
- **Reset formularza**: zamknięcie dialogu w dowolny sposób (X, Escape, kliknięcie w tło)
  resetuje formularz i wraca do kroku 1 — obsłużone w `onOpenChange` w
  `add-product-dialog.tsx`.
- **Paginacja**: rozmiar strony to 3 produkty — przy 5 produktach startowych z PDF-a daje
  to od razu 2 strony, dzięki czemu paginacja jest widoczna i testowalna bez dokładania
  danych. Numer strony trzymany jest w parametrze `?page=` przez `nuqs`; odświeżenie
  strony zachowuje widok.

## Deploy

Link do wdrożonej wersji (Vercel): https://simple-shop-form.vercel.app/
