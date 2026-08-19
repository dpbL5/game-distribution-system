"use server";

import { redirect } from "next/navigation";

import { authService } from "@/modules/auth/infrastructure/auth-service";
import { isAppError } from "@/shared/errors/app-error";
import type { AuthActionState } from "./action-state";

function errorMessage(error: unknown): string {
  if (isAppError(error)) return error.message;
  return "Không thể hoàn tất yêu cầu. Vui lòng thử lại.";
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const next = String(formData.get("next") ?? "").trim();
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : null;
  try {
    const user = await authService.login({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    if (safeNext) redirect(safeNext);
    if (user.role === "ADMIN") redirect("/admin");
  } catch (error) {
    return { error: errorMessage(error), success: null };
  }
  redirect("/");
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    await authService.register({
      username: String(formData.get("username") ?? ""),
      email: String(formData.get("email") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
  } catch (error) {
    return { error: errorMessage(error), success: null };
  }
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await authService.logout();
  redirect("/");
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    await authService.requestPasswordReset(String(formData.get("email") ?? ""));
  } catch (error) {
    return { error: errorMessage(error), success: null };
  }
  return {
    error: null,
    success: "Nếu tài khoản tồn tại, hướng dẫn khôi phục đã được gửi.",
  };
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    await authService.resetPassword(
      String(formData.get("token") ?? ""),
      String(formData.get("password") ?? ""),
    );
  } catch (error) {
    return { error: errorMessage(error), success: null };
  }
  return { error: null, success: "Mật khẩu đã được cập nhật. Bạn có thể đăng nhập lại." };
}
