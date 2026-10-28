import { expect, test } from "@playwright/test";

/**
 * Смоук сквозного пути «гость → клиент».
 *
 * Проверяет ровно то, что ломается при расхождении фронта и API: загрузку
 * справочников, регистрацию, покупку абонемента и запись на занятие.
 * Данные берутся из `manage.py seed_demo`.
 */

const PASSWORD = "SuperPass123!";

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@stackfitness.ru`;
}

async function register(page) {
  const email = uniqueEmail();

  await page.goto("/registration");
  await page.fill("input[name=email]", email);
  await page.fill("input[name=password]", PASSWORD);
  await page.fill("input[name=confirmPassword]", PASSWORD);
  await page.check("input[name=consent]");
  await page.click("button[type=submit]");

  await expect(page).toHaveURL(/\/account$/);
  return email;
}

test("справочники приходят из API", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#tariffs")).toContainText("Сетевой 12 месяцев");
  await expect(page.locator("#tariffs")).toContainText("Клубный 6 месяцев");

  await page.getByRole("button", { name: "Клубы" }).hover();
  await expect(page.locator('header a[href^="/clubs/"]').first()).toBeVisible();
});

test("навигация подсвечивает текущую страницу", async ({ page }) => {
  await page.goto("/tariffs");

  await expect(page.locator('header [aria-current="page"]')).toHaveText("Тарифы");
});

test("гостя не пускают в личный кабинет", async ({ page }) => {
  await page.goto("/account");

  await expect(page).toHaveURL(/\/login$/);
});

test("регистрация открывает личный кабинет", async ({ page }) => {
  const email = await register(page);

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Привет");
  await expect(page.locator("main")).toContainText(email);
});

test("клиент покупает сетевой абонемент", async ({ page }) => {
  await register(page);

  await page.goto("/tariffs");
  const networkCard = page
    .locator("#tariffs .snap-center")
    .filter({ hasText: "Вся сеть" });
  await networkCard.getByRole("button", { name: "Купить" }).click();

  await expect(page.locator("#tariffs")).toContainText("Абонемент оформлен");

  await page.goto("/account");
  await expect(page.locator("main")).toContainText("Сетевой 12 месяцев");
});

test("клиент записывается на занятие", async ({ page }) => {
  await register(page);

  await page.goto("/clubs/1");
  // Занятия из seed_demo стоят на завтра.
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  await page
    .locator("button", { hasText: String(tomorrow.getDate()) })
    .first()
    .click();

  const bookButton = page.getByRole("button", { name: "Записаться" }).first();
  await expect(bookButton).toBeVisible();
  await bookButton.click();

  await expect(page.getByRole("button", { name: "Вы записаны" })).toBeVisible();

  await page.goto("/account");
  await expect(page.locator("main")).toContainText("Йога");
});

test("неверный пароль показывает русскую ошибку", async ({ page }) => {
  await page.goto("/login");
  await page.fill("input[name=email]", "nobody@stackfitness.ru");
  await page.fill("input[name=password]", "wrong-password");
  await page.click("button[type=submit]");

  await expect(page.locator("form")).toContainText("Неверная почта или пароль.");
});
