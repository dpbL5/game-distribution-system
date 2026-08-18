"use server";

import { revalidatePath } from "next/cache";

import { adminService } from "@/modules/admin/infrastructure/admin-service";

export async function createCategoryAction(formData: FormData): Promise<void> {
  await adminService.createCategory({
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
  });
  revalidatePath("/admin/categories");
}

export async function setUserStatusAction(formData: FormData): Promise<void> {
  await adminService.setUserStatus(
    String(formData.get("userId") ?? ""),
    String(formData.get("status") ?? "ACTIVE") === "LOCKED" ? "LOCKED" : "ACTIVE",
  );
  revalidatePath("/admin/users");
}

export async function setReviewVisibilityAction(formData: FormData): Promise<void> {
  await adminService.setReviewVisibility(
    String(formData.get("reviewId") ?? ""),
    String(formData.get("visibilityStatus") ?? "VISIBLE") === "HIDDEN" ? "HIDDEN" : "VISIBLE",
  );
  revalidatePath("/admin/reviews");
}

export async function createGameAction(formData: FormData): Promise<void> {
  await adminService.createGame({
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    shortDescription: String(formData.get("shortDescription") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    basePrice: String(formData.get("basePrice") ?? "0"),
    releaseDate: new Date(String(formData.get("releaseDate") ?? "")),
    platforms: String(formData.get("platforms") ?? "PC")
      .split(",")
      .map((platform) => platform.trim())
      .filter(Boolean),
    developerId: String(formData.get("developerId") ?? ""),
    publisherId: String(formData.get("publisherId") ?? ""),
  });
  revalidatePath("/admin/games");
}

export async function setGameStatusAction(formData: FormData): Promise<void> {
  const status = String(formData.get("status") ?? "DRAFT");
  if (!["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"].includes(status)) return;
  await adminService.setGameStatus(
    String(formData.get("gameId") ?? ""),
    status as "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED",
  );
  revalidatePath("/admin/games");
  revalidatePath("/games");
}

export async function createPromotionAction(formData: FormData): Promise<void> {
  await adminService.createPromotion({
    name: String(formData.get("name") ?? "").trim(),
    discountPercent: String(formData.get("discountPercent") ?? "0"),
    startsAt: new Date(String(formData.get("startsAt") ?? "")),
    endsAt: new Date(String(formData.get("endsAt") ?? "")),
    description: String(formData.get("description") ?? "").trim() || undefined,
  });
  revalidatePath("/admin/promotions");
}
