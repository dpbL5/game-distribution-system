import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, email = "buyer@example.com") {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  const password = email === "admin@example.com" ? "ChangeMe123!" : "Customer123!";
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3000/");
}

async function signOut(page: Page) {
  await page.goto("/");
  const logoutButton = page.getByRole("button", { name: "Đăng xuất" });
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await expect(page).toHaveURL(/\/login|\/$/);
  }
}

async function registerFreshCustomer(page: Page): Promise<string> {
  const suffix = Date.now().toString();
  const email = `e2e_${suffix}@example.com`;
  await page.goto("/register");
  await page.getByLabel("Tên người dùng").fill(`e2e_${suffix}`);
  await page.getByLabel("Tên hiển thị").fill("E2E Customer");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill("Customer123!");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3000/");
  return email;
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

test("customer creates an order, admin approves invoice, library is granted", async ({ page }) => {
  const customerEmail = await registerFreshCustomer(page);
  await page.goto("/games");
  await page.locator('a[href^="/games/"]').first().click();
  await page.getByRole("button", { name: "Thêm vào giỏ" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3000/cart");
  await expect(page.getByRole("heading", { name: "Giỏ hàng của bạn" })).toBeVisible();
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Tạo đơn hàng chờ thanh toán" }).click();
  await expect(page).toHaveURL(/\/checkout\/result\?orderId=/);
  // Customer starts payment → order is PENDING_PAYMENT + PENDING invoice awaiting admin approval.
  await page.getByRole("button", { name: "Bắt đầu thanh toán" }).click();
  await expect(page.getByText("Chờ admin xác nhận")).toBeVisible();
  await expect(page.getByRole("button", { name: "Bắt đầu thanh toán" })).toBeHidden();

  const orderUrl = page.url();
  const orderId = new URL(orderUrl).searchParams.get("orderId") ?? "";
  expect(orderId).not.toBe("");

  // Admin approves the invoice — admin đóng vai mock payment gateway.
  await signOut(page);
  await signIn(page, "admin@example.com");
  await page.goto("/admin/orders");
  await expect(page.getByRole("heading", { name: "Đơn hàng" })).toBeVisible();
  // Approve: first PENDING row is the freshly created order when filtered by time.
  const approveButton = page.getByRole("button", { name: "Duyệt" }).first();
  await expect(approveButton).toBeVisible({ timeout: 10_000 });
  await approveButton.click();
  await expect(page.getByText("Đã thanh toán").first()).toBeVisible({ timeout: 10_000 });

  // Customer now sees PAID + library granted.
  await signOut(page);
  await signIn(page, customerEmail);
  await page.goto(`/checkout/result?orderId=${orderId}`);
  await expect(page.getByText("Thanh toán thành công")).toBeVisible({ timeout: 10_000 });
  await page.goto("/library");
  await expect(page.getByText("Đã sở hữu").first()).toBeVisible({ timeout: 10_000 });
});
