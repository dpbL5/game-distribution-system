import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("buyer@example.com");
  await page.getByLabel("Mật khẩu").fill("Customer123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3000/");
}

async function registerFreshCustomer(page: Page) {
  const suffix = Date.now().toString();
  await page.goto("/register");
  await page.getByLabel("Tên người dùng").fill(`e2e_${suffix}`);
  await page.getByLabel("Tên hiển thị").fill("E2E Customer");
  await page.getByLabel("Email").fill(`e2e_${suffix}@example.com`);
  await page.getByLabel("Mật khẩu").fill("Customer123!");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3000/");
}

test("guest can browse the seeded catalog", async ({ page }) => {
  await page.goto("/games");
  await expect(page).toHaveURL(/\/games$/);
  await expect(page.getByRole("heading", { name: "Khám phá game" })).toBeVisible();
});

test("protected cart redirects a guest to login", async ({ page }) => {
  await page.goto("/cart");
  await expect(page).toHaveURL(/\/login\?next=%2Fcart/);
});

test("active customer can sign in and access the cart", async ({ page }) => {
  await signIn(page);
  await page.goto("/cart");
  await expect(page).toHaveURL("http://127.0.0.1:3000/cart");
});

test("customer can create an order and complete mock payment", async ({ page }) => {
  await registerFreshCustomer(page);
  await page.goto("/games");
  await page.locator('a[href^="/games/"]').first().click();
  await page.getByRole("button", { name: "Thêm vào giỏ" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3000/cart");
  await expect(page.getByRole("heading", { name: "Giỏ hàng của bạn" })).toBeVisible();
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Tạo đơn hàng chờ thanh toán" }).click();
  await expect(page).toHaveURL(/\/checkout\/result\?orderId=/);
  await page.getByRole("button", { name: "Bắt đầu thanh toán" }).click();
  await page.getByRole("button", { name: "Hoàn tất thanh toán thử nghiệm" }).click();
  await expect(page.getByText("Thanh toán thành công")).toBeVisible();
  await page.goto("/library");
  await expect(page.getByText("Đã sở hữu").first()).toBeVisible();
});
