"use server";

import { redirect } from "next/navigation";

import { userService } from "@/modules/user/infrastructure/user-service";
import { isAppError } from "@/shared/errors/app-error";

function errorMessage(error: unknown): string {
  if (isAppError(error)) return error.message;
  return "Không thể cập nhật thông tin. Vui lòng thử lại.";
}

export async function updateProfileAction(formData: FormData) {
  try {
    await userService.updateProfile({
      displayName: String(formData.get("displayName") ?? ""),
      countryCode: String(formData.get("countryCode") ?? "") || null,
    });
  } catch (error) {
    throw new Error(errorMessage(error));
  }
  redirect("/profile");
}

export async function changePasswordAction(formData: FormData) {
  try {
    await userService.changePassword({
      currentPassword: String(formData.get("currentPassword") ?? ""),
      newPassword: String(formData.get("newPassword") ?? ""),
    });
  } catch (error) {
    throw new Error(errorMessage(error));
  }
  redirect("/login");
}
