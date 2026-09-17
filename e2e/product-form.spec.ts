import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
})

test("product table shows mock data with URL-synced pagination", async ({
  page,
}) => {
  await expect(page.getByRole("heading", { name: "Produkty" })).toBeVisible()
  await expect(page.getByText("5 produktów w katalogu")).toBeVisible()

  await expect(page.getByRole("row")).toHaveCount(1 + 3) // header + 3 rows (page size 3)
  await expect(page.getByText("Strona 1 z 2")).toBeVisible()

  await page.getByRole("button", { name: "2", exact: true }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.getByText("Strona 2 z 2")).toBeVisible()

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
  await expect(page.getByLabel("Cena brutto")).toHaveValue("123") // default VAT 23%

  await page.getByLabel("Stawka VAT").click()
  await page.getByRole("option", { name: "8%" }).click()
  await expect(page.getByLabel("Cena brutto")).toHaveValue("108")
})

test("full happy path: add a product through all 3 steps", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Dodaj produkt" }).click()

  await page.getByLabel("Nazwa produktu").fill("Klawiatura mechaniczna")
  await page.getByLabel("SKU produktu").fill("KLAW001")
  await page.getByLabel("Opis").fill("Podświetlana klawiatura mechaniczna.")
  await page.getByLabel("Producent").click()
  await page.getByRole("option", { name: "Dell" }).click()
  await page.getByLabel("Kategoria").click()
  await page.getByRole("option", { name: "Akcesoria" }).click()
  await page.getByRole("button", { name: "Bluetooth", exact: true }).click()
  await page.getByRole("button", { name: "Dalej" }).click()

  await page.getByLabel("Cena netto").fill("100")
  await page.getByLabel("Cena netto").blur()
  await expect(page.getByLabel("Cena brutto")).toHaveValue("123")
  await page.getByRole("button", { name: "Dalej" }).click()

  await page.getByRole("checkbox", { name: "Produkt limitowany" }).check()
  await expect(page.getByLabel("Ilość na magazynie")).toBeVisible()
  await page.getByLabel("Ilość na magazynie").fill("15")

  await page.getByRole("button", { name: "Zapisz produkt" }).click()

  await expect(page.getByText("Produkt został dodany")).toBeVisible()
  await expect(page.getByText("Dodaj nowy produkt")).toHaveCount(0)
  await expect(page.getByText("6 produktów w katalogu")).toBeVisible()
})

test("going back preserves values in every step", async ({ page }) => {
  await page.getByRole("button", { name: "Dodaj produkt" }).click()

  await page.getByLabel("Nazwa produktu").fill("Trwały Produkt")
  await page.getByLabel("SKU produktu").fill("TRWALY1")
  await page.getByLabel("Producent").click()
  await page.getByRole("option", { name: "Dell" }).click()
  await page.getByLabel("Kategoria").click()
  await page.getByRole("option", { name: "Akcesoria" }).click()
  await page.getByRole("button", { name: "Premium", exact: true }).click()
  await page.getByRole("button", { name: "Dalej" }).click()

  await page.getByLabel("Cena netto").fill("250")
  await page.getByLabel("Cena netto").blur()
  await page.getByRole("button", { name: "Dalej" }).click()

  await page.getByRole("button", { name: "Wstecz" }).click()
  await expect(page.getByLabel("Cena netto")).toHaveValue("250")
  await expect(page.getByLabel("Cena brutto")).toHaveValue("307.5")

  await page.getByRole("button", { name: "Wstecz" }).click()
  await expect(page.getByLabel("Nazwa produktu")).toHaveValue("Trwały Produkt")
  await expect(page.getByLabel("SKU produktu")).toHaveValue("TRWALY1")
  await expect(
    page.getByRole("button", { name: "Premium", exact: true }),
  ).toHaveAttribute("aria-pressed", "true")

  await page.getByRole("button", { name: "Dalej" }).click()
  await expect(page.getByLabel("Cena netto")).toHaveValue("250")
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

test.describe("mobile viewport", () => {
  test.use({ viewport: { width: 393, height: 852 } })

  test("table renders as a card list instead of a table", async ({ page }) => {
    await expect(page.getByRole("table")).toBeHidden()
    await expect(page.getByText("MacBook Pro 14").first()).toBeVisible()
    await expect(page.getByText("Dostępny").first()).toBeVisible()
  })

  test("add-product dialog runs full-screen", async ({ page }) => {
    await page.getByRole("button", { name: "Dodaj produkt" }).click()
    const dialog = page.getByRole("dialog")
    const box = await dialog.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(350)
    expect(box?.height).toBeGreaterThanOrEqual(750)

    await expect(page.getByText("Informacje", { exact: true })).toBeVisible()
    await expect(page.getByText("Dane podstawowe")).toBeVisible()
  })
})
