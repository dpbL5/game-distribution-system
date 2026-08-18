import { AppError } from "@/shared/errors/app-error";

export function assertPasswordPolicy(password: string): void {
  if (
    password.length < 12 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    throw new AppError(
      "AUTH_REQUIRED",
      "Mật khẩu phải có ít nhất 12 ký tự, gồm chữ hoa, chữ thường và số.",
    );
  }
}
