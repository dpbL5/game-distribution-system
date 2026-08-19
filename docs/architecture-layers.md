# Kiến trúc phân lớp & cơ chế giao tiếp giữa các layer

> Tài liệu mô tả cách các layer trong hệ thống PlayPort giao tiếp với nhau, kèm đường dẫn file cụ thể. Nguồn tham chiếu: `AGENTS.md` §6, ADR-0001.

## 1. Mô hình 4 lớp

Dự án là **Modular Monolith** theo phong cách Ports & Adapters (hexagonal). Mỗi module nghiệp vụ trong `src/modules/<module>/` có tối đa 4 lớp:

```text
┌─────────────────────────────────────────────────────────────┐
│ PRESENTATION   (Server Actions, Route Handlers, Pages, UI)  │
│   "use server" — adapter mỏng, KHÔNG chứa business logic    │
└──────────────────────────┬──────────────────────────────────┘
                           │ gọi trực tiếp (import service)
┌──────────────────────────▼──────────────────────────────────┐
│ APPLICATION    (services, use cases, ports, DTOs)           │
│   Quy tắc nghiệp vụ, xác thực actor, orchestration          │
└──────────┬────────────────────────────┬─────────────────────┘
           │ phụ thuộc port (interface) │
┌──────────▼─────────────┐  ┌───────────▼─────────────────────┐
│ DOMAIN (thuần, không   │  │ INFRASTRUCTURE (adapters)       │
│  import Next/Prisma)   │  │  triển khai các port: Prisma,   │
│  pricing, policy,      │  │  mock gateway, local storage... │
│  typed errors          │  │                                 │
└────────────────────────┘  └─────────────────────────────────┘
```

**Chiều phụ thuộc một chiều**: `presentation → application → domain`.
`infrastructure` **triển khai** port do application/domain định nghĩa — code infrastructure phụ thuộc vào application, không bao giờ ngược lại.

## 2. Vai trò từng lớp

### 2.1. Presentation (`src/modules/<module>/presentation/`)

- **Server Actions** (`"use server"`) cho mutation từ form.
- **Route Handlers** (`src/app/api/`) cho HTTP contract bên ngoài: payment callback, media upload, health.
- **Pages** (`src/app/`) là Server Components, gọi thẳng service để đọc dữ liệu.
- Chỉ làm việc: đọc FormData, gọi service, map lỗi → UI/HTTP an toàn, `revalidatePath`, `redirect`.

Ví dụ `cart/presentation/actions.ts`:

```ts
"use server";
export async function addToCartAction(formData: FormData): Promise<void> {
  await cartService.add(String(formData.get("gameId") ?? ""));
  revalidatePath("/cart");
  redirect("/cart");
}
```

### 2.2. Application (`src/modules/<module>/application/`)

- Class service nhận repository qua **constructor injection** (không dùng DI container).
- Là nơi duy nhất chứa business logic: xác thực actor (`requireUser`/`requireAdmin`), kiểm tra trạng thái, tính toán, phối hợp nhiều module.
- Định nghĩa **port (interface)** — ví dụ `CartRepository`, `PaymentGateway`, `MediaStorage`, `MailDelivery` — kèm **DTO/record types** mà infrastructure phải trả về (không để lộ Prisma types).

Ví dụ `payment/application/payment-gateway.ts`:

```ts
export interface PaymentGateway {
  createPayment(input: PaymentRequest): Promise<PaymentIntent>;
  verifyCallback(payload: string, signature: string): PaymentCallback;
}
```

### 2.3. Domain (`src/modules/<module>/domain/`)

- Hàm thuần, không import Next.js/React/Prisma/env. Chỉ dùng `Decimal` và `AppError`.
- Ví dụ: `promotion/domain/pricing.ts` (`selectActivePromotion`, `calculateCurrentPrice`), `auth/domain/password-policy.ts`.

### 2.4. Infrastructure (`src/modules/<module>/infrastructure/` + `src/infrastructure/`)

- Triển khai port bằng Prisma (`PrismaCartRepository`, `PrismaPaymentRepository`...), mock gateway (`MockPaymentGateway`), local storage (`LocalMediaStorage`).
- Chịu trách nhiệm **map Prisma types → DTO của application** (chuyển `Prisma.Decimal` → string qua `.toFixed(2)`, cast enum).
- **Wiring file** (`<module>-service.ts`): nơi duy nhất khởi tạo service với adapter cụ thể và export singleton.

Ví dụ `cart/infrastructure/cart-service.ts`:

```ts
export const cartService = new CartService(prismaCartRepository);
```

Ví dụ `payment/infrastructure/payment-service.ts` (inject cả repository lẫn gateway):

```ts
export const paymentService = new PaymentService(prismaPaymentRepository, mockPaymentGateway);
```

## 3. Quy tắc giao tiếp giữa các module

- Chỉ import module khác thông qua **`index.ts` công khai** của module đó.
- **Cấm** import repository/infrastructure của module khác.
- Business rule nằm ở module sở hữu nó; module khác chỉ hỏi qua service công khai.

Ví dụ thực tế trong code:

```ts
// review.service.ts — Review KHÔNG query LibraryItem trực tiếp
import { libraryService } from "@/modules/library";
if (!(await libraryService.ownsGame(user.id, input.gameId))) {
  throw new AppError("REVIEW_OWNERSHIP_REQUIRED", "...", 403);
}
```

```ts
// order.service.ts — Order gọi Cart và Promotion qua public API
import { cartService } from "@/modules/cart";
import { calculateCurrentPrice, selectActivePromotion } from "@/modules/promotion";
```

Các `index.ts` công khai điển hình:

| Module | Export công khai |
|---|---|
| `cart/index.ts` | `cartService` + type `CartRepository` |
| `game/index.ts` | `gameService` + types domain |
| `library/index.ts` | `libraryService` + type `LibraryRepository` |
| `promotion/index.ts` | `selectActivePromotion`, `calculateCurrentPrice` + type |
| `auth/index.ts` | `currentUser`, `requireAdmin`, `requireUser`, `assertPasswordPolicy` |

## 4. Luồng giao tiếp điển hình

### 4.1. Đọc dữ liệu (Server Component)

```text
Page (src/app/(store)/games/page.tsx)
  → gameService.listPublished({...})     [application]
      → prismaGameRepository.listPublished(...)   [infrastructure → Prisma]
      → trả về DTO (Decimal đã thành string)
```

Server Component gọi **trực tiếp** service — không tạo HTTP request nội bộ.

### 4.2. Mutation (Server Action) — ví dụ thêm vào giỏ

```text
Form (Client Component) gửi FormData
  → addToCartAction                          [presentation]
      → cartService.add(gameId)              [application]
          → requireUser()                    [auth guard — lấy user từ session cookie]
          → prismaCartRepository.findPublishedGame(gameId)  [infrastructure]
          → libraryService.ownsGame(...)     [gọi module khác qua index.ts]
          → selectActivePromotion + calculateCurrentPrice   [domain thuần]
          → prismaCartRepository.addItem(...)  [infrastructure, giá đã tính tại server]
  → revalidatePath("/cart") + redirect("/cart")
```

### 4.3. Luồng mua hàng đầy đủ (User → Cart → Order → Payment → LibraryItem)

```text
1. checkout page (Server Component) → cartService.quote()
      → tính lại giá từng dòng tại server (Decimal), đánh dấu line.available

2. form checkout → createPendingOrderAction          [order/presentation]
      → orderService.createPending({ idempotencyKey, expectedQuote })
          → requireUser()
          → kiểm tra idempotencyKey đã tồn tại (trả lại đơn cũ nếu có)
          → cartService.quote()                      [module khác]
          → so sánh expectedQuote với giá server → lỗi PRICE_CHANGED nếu lệch
          → prismaOrderRepository.createPending()    [tạo Order + OrderItem snapshot giá]

3. bắt đầu thanh toán → paymentService.start()
          → gateway.createPayment()                  [MockPaymentGateway — KHÔNG nằm trong transaction]
          → prismaPaymentRepository.createPending()  [Payment PENDING]

4. admin duyệt (MVP mock) → adminCompleteMock()      [requireAdmin()]
          → tạo payload + chữ ký HMAC-SHA256 (PAYMENT_CALLBACK_SECRET)
          → handleCallback(payload, signature)
              → gateway.verifyCallback()             [verify chữ ký + shape payload]
              → so số tiền bằng Decimal → PAYMENT_AMOUNT_MISMATCH nếu lệch
              → prismaPaymentRepository.applyCallback()
                    → $transaction MỘT LẦN: Payment SUCCEEDED/FAILED
                      + Order PAID/PAYMENT_FAILED
                      + createMany LibraryItem (skipDuplicates → idempotent)
                      + xóa game đã mua khỏi CartItem
```

Route handler callback bên ngoài (`src/app/api/payments/callback/route.ts`) là adapter mỏng: đọc payload + header `x-payment-signature`, gọi `paymentService.handleCallback()`, trả JSON an toàn — không chứa logic nghiệp vụ.

## 5. Ranh giới Server / Client

- Các module đụng DB/auth/payment/file dùng `import "server-only"` — import nhầm từ Client Component sẽ lỗi build.
- Server Components mặc định cho đọc dữ liệu; Client Components chỉ ở ranh giới nhỏ nhất cần browser state (form, slideshow, navigation).
- Server Action/Route Handler chỉ là adapter — business logic nằm ở application service.
- Không tin dữ liệu từ client: `userId`, role, giá, `expectedQuote` đều được **kiểm tra lại phía server**.

## 6. Xử lý lỗi giữa các layer

```text
domain/application ném AppError (code ổn định + message tiếng Việt)
        │  ví dụ: PRICE_CHANGED, GAME_ALREADY_OWNED, PAYMENT_AMOUNT_MISMATCH
        ▼
presentation bắt lỗi, map thành phản hồi an toàn
        │  Server Action → trả { error } cho form hiển thị
        │  Route Handler → trả JSON + status code, không lộ stack trace
        ▼
lỗi bất ngờ (không phải AppError) → log + error boundary, KHÔNG trả chi tiết cho client
```

Infrastructure map lỗi Prisma → `AppError` tại repository (ví dụ `P2002` → `CART_ITEM_EXISTS` 409, `P2025` → 404), phần còn lại của hệ thống chỉ thấy lỗi miền.

## 7. Tổng kết

| Cơ chế | Cách thực hiện |
|---|---|
| Dependency Injection | Constructor injection thủ công tại file wiring `infrastructure/<module>-service.ts` |
| Module nói chuyện với module | Chỉ qua `index.ts` công khai (service + types), không đụng repository của nhau |
| Port/Adapter | Application định nghĩa interface; infrastructure triển khai (Prisma, MockGateway, LocalStorage) |
| Domain thuần | Không import framework; chỉ Decimal + AppError |
| Data mapping | Infrastructure chuyển Prisma types → DTO (Decimal → string) trước khi sang application |
| Actor xác thực | Guards (`requireUser`, `requireAdmin`) gọi tại tầng application, không phụ thuộc middleware |
| Idempotency | Key unique ở DB + application check + `skipDuplicates` trong transaction |
| Lỗi | `AppError` code ổn định, map tại presentation boundary |
