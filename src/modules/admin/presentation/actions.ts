"use server";

import { revalidatePath } from "next/cache";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { paymentService } from "@/modules/payment/infrastructure/payment-service";

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

export async function updateUserAction(formData: FormData): Promise<void> {
  await adminService.updateUser(String(formData.get("userId") ?? ""), {
    displayName: String(formData.get("displayName") ?? "").trim(),
    role: String(formData.get("role") ?? "CUSTOMER") === "ADMIN" ? "ADMIN" : "CUSTOMER",
  });
  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) return;
  await adminService.deleteUser(userId);
  revalidatePath("/admin/users");
}

export async function setReviewVisibilityAction(formData: FormData): Promise<void> {
  await adminService.setReviewVisibility(
    String(formData.get("reviewId") ?? ""),
    String(formData.get("visibilityStatus") ?? "VISIBLE") === "HIDDEN" ? "HIDDEN" : "VISIBLE",
  );
  revalidatePath("/admin/reviews");
}

export async function createDeveloperAction(formData: FormData): Promise<void> {
  await adminService.createDeveloper({
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
    website: String(formData.get("website") ?? "").trim() || undefined,
    countryCode: String(formData.get("countryCode") ?? "").trim() || undefined,
  });
  revalidatePath("/admin/developers");
  revalidatePath("/admin/games");
}

export async function updateDeveloperAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await adminService.updateDeveloper(id, {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
    website: String(formData.get("website") ?? "").trim() || undefined,
    countryCode: String(formData.get("countryCode") ?? "").trim() || undefined,
  });
  revalidatePath("/admin/developers");
  revalidatePath("/admin/games");
}

export async function deleteDeveloperAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await adminService.deleteDeveloper(id);
  revalidatePath("/admin/developers");
  revalidatePath("/admin/games");
}

export async function createPublisherAction(formData: FormData): Promise<void> {
  await adminService.createPublisher({
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
    website: String(formData.get("website") ?? "").trim() || undefined,
    countryCode: String(formData.get("countryCode") ?? "").trim() || undefined,
  });
  revalidatePath("/admin/publishers");
  revalidatePath("/admin/games");
}

export async function updatePublisherAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await adminService.updatePublisher(id, {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
    website: String(formData.get("website") ?? "").trim() || undefined,
    countryCode: String(formData.get("countryCode") ?? "").trim() || undefined,
  });
  revalidatePath("/admin/publishers");
  revalidatePath("/admin/games");
}

export async function deletePublisherAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await adminService.deletePublisher(id);
  revalidatePath("/admin/publishers");
  revalidatePath("/admin/games");
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

export async function updatePromotionAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await adminService.updatePromotion(id, {
    name: String(formData.get("name") ?? "").trim(),
    discountPercent: String(formData.get("discountPercent") ?? "0"),
    startsAt: new Date(String(formData.get("startsAt") ?? "")),
    endsAt: new Date(String(formData.get("endsAt") ?? "")),
    description: String(formData.get("description") ?? "").trim() || undefined,
  });
  revalidatePath("/admin/promotions");
}

export async function setPromotionStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT");
  if (!["DRAFT", "ACTIVE", "STOPPED"].includes(status)) return;
  await adminService.setPromotionStatus(id, status as "DRAFT" | "ACTIVE" | "STOPPED");
  revalidatePath("/admin/promotions");
}

export async function deletePromotionAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await adminService.deletePromotion(id);
  revalidatePath("/admin/promotions");
}

/**
 * Admin confirms or rejects a pending payment, acting as the mock gateway.
 * Only users with ADMIN role can invoke this (enforced in PaymentService).
 * Idempotent — re-approving an already SUCCEEDED payment is a no-op.
 */
export async function adminCompletePaymentAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) return;
  const raw = String(formData.get("decision") ?? formData.get("succeeded") ?? "approve");
  const succeeded = raw === "true" || raw === "approve" || raw === "SUCCEEDED";
  await paymentService.adminCompleteMock(orderId, succeeded);
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}
