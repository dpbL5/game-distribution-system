import "server-only";

import { authService } from "@/modules/auth/infrastructure/auth-service";
import { AppError } from "@/shared/errors/app-error";

export async function requireUser() {
  const user = await authService.currentUser();
  if (!user) throw new AppError("AUTH_REQUIRED", "Bạn cần đăng nhập để tiếp tục.", 401);
  return user;
}

/**
 * Returns the authenticated user when present, or `null` for guests. Used on
 * storefront pages that are open to both guests and customers (e.g. game
 * detail) so ownership state can be shown without forcing a login.
 */
export async function currentUser() {
  return authService.currentUser();
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN")
    throw new AppError("FORBIDDEN", "Bạn cần quyền quản trị để truy cập.", 403);
  return user;
}
