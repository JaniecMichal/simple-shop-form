import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
})

test("product table shows mock data with URL-synced pagination", async ({
  page,
}) => {
  await expect(page.getByRole("heading", { name: "Produkty" })).toBeVisible()
  await expect(page.getByText("5 produktów w katalogu")).toBeVisible()

  // 5 mock products, page size 3 -> page 1 has 3 rows, page 2 has 2 rows.
  await expect(page.getByRole("row")).toHaveCount(1 + 3) // header + 3 rows
  await expect(page.getByText("Strona 1 z 2")).toBeVisible()

  await page.getByRole("button", { name: "2", exact: true }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.getByText("Strona 2 z 2")).toBeVisible()

  // Reload keeps the page from the URL.
  await page.reload()
  await expect(page.getByText("Strona 2 z 2")).toBeVisible()
})

test("step 1 blocks navigation until required fields are valid", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Dodaj produkt" }).click()
  await expect(page.getByText("Dodaj nowy produkt")).toBeVisible()

  await page.getByRole("button", { name: "Dalej" }).click()
  await expect(
    page.getByText("Nazwa produktu musi mieć min. 3 znaki"),
  ).toBeVisible()
  await expect(page.getByText("SKU jest wymagane")).toBeVisible()

  // Still on step 1: pricing fields aren't in the DOM yet.
  await expect(page.getByLabel("Cena netto")).toHaveCount(0)
})

test("SKU rejects non-alphanumeric characters", async ({ page }) => {
  await page.getByRole("button", { name: "Dodaj produkt" }).click()
  await page.getByLabel("Nazwa produktu").fill("Test Produkt")
  await page.getByLabel("SKU produktu").fill("ABC-123!")
  await page.getByLabel("SKU produktu").blur()
  await expect(
    page.getByText("SKU może zawierać tylko litery i cyfry"),
  ).toBeVisible()
})

test("price step auto-calculates gross from net and VAT", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Dodaj produkt" }).click()

  await page.getByLabel("Nazwa produktu").fill("Klawiatura mechaniczna")
  await page.getByLabel("SKU produktu").fill("KLAW001")
  await page.getByLabel("Producent").click()
  await page.getByRole("option", { name: "Dell" }).click()
  await page.getByLabel("Kategoria").click()
  await page.getByRole("option", { name: "Akcesoria" }).click()
  await page.getByRole("button", { name: "Bluetooth", exact: true }).click()
  await page.getByRole("button", { name: "Dalej" }).click()

  await expect(page.getByLabel("Cena netto")).toBeVisible()
  await page.getByLabel("Cena netto").fill("100")
  await page.getByLabel("Cena netto").blur()
  // Default VAT is 23% -> gross should become 123.
  await expect(page.getByLabel("Cena brutto")).toHaveValue("123")

  await page.getByLabel("Stawka VAT").click()
  await page.getByRole("option", { name: "8%" }).click()
  await expect(page.getByLabel("Cena brutto")).toHaveValue("108")
})

test("full happy path: add a product through all 3 steps", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Dodaj produkt" }).click()

  // Step 1
  await page.getByLabel("Nazwa produktu").fill("Klawiatura mechaniczna")
  await page.getByLabel("SKU produktu").fill("KLAW001")
  await page.getByLabel("Opis").fill("Podświetlana klawiatura mechaniczna.")
  await page.getByLabel("Producent").click()
  await page.getByRole("option", { name: "Dell" }).click()
  await page.getByLabel("Kategoria").click()
  await page.getByRole("option", { name: "Akcesoria" }).click()
  await page.getByRole("button", { name: "Bluetooth", exact: true }).click()
  await page.getByRole("button", { name: "Dalej" }).click()

  // Step 2
  await page.getByLabel("Cena netto").fill("100")
  await page.getByLabel("Cena netto").blur()
  await expect(page.getByLabel("Cena brutto")).toHaveValue("123")
  await page.getByRole("button", { name: "Dalej" }).click()

  // Step 3 — mark as limited, reveals stock field.
  await page.getByRole("checkbox", { name: "Produkt limitowany" }).check()
  await expect(page.getByLabel("Ilość na magazynie")).toBeVisible()
  await page.getByLabel("Ilość na magazynie").fill("15")

  await page.getByRole("button", { name: "Zapisz produkt" }).click()

  await expect(page.getByText("Produkt został dodany")).toBeVisible()
  await expect(page.getByText("Dodaj nowy produkt")).toHaveCount(0)
  await expect(page.getByText("6 produktów w katalogu")).toBeVisible()
})

test("closing the dialog resets the form back to step 1", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Dodaj produkt" }).click()
  await page.getByLabel("Nazwa produktu").fill("Coś tam")
  await page.getByLabel("SKU produktu").fill("ABC123")
  await page.getByLabel("Producent").click()
  await page.getByRole("option", { name: "Apple" }).click()
  await page.getByLabel("Kategoria").click()
  await page.getByRole("option", { name: "Komputery" }).click()
  await page.getByRole("button", { name: "Premium", exact: true }).click()
  await page.getByRole("button", { name: "Dalej" }).click()
  await expect(page.getByLabel("Cena netto")).toBeVisible()

  await page.keyboard.press("Escape")
  await expect(page.getByText("Dodaj nowy produkt")).toHaveCount(0)

  await page.getByRole("button", { name: "Dodaj produkt" }).click()
  await expect(page.getByLabel("Nazwa produktu")).toHaveValue("")
  await expect(page.getByLabel("Cena netto")).toHaveCount(0)
})
