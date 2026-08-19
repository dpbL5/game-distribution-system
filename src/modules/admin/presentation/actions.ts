"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { localMediaStorage } from "@/infrastructure/storage/local-media-storage";

function stringField(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  await adminService.createCategory({
    name: stringField(formData, "name"),
    slug: stringField(formData, "slug"),
    description: stringField(formData, "description") || undefined,
  });
  revalidatePath("/admin/categories");
}

export async function updateCategoryAction(formData: FormData): Promise<void> {
  await adminService.updateCategory(stringField(formData, "id"), {
    name: stringField(formData, "name"),
    slug: stringField(formData, "slug"),
    description: stringField(formData, "description") || undefined,
  });
  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await adminService.deleteCategory(stringField(formData, "id"));
  revalidatePath("/admin/categories");
}

export async function createDeveloperAction(formData: FormData): Promise<void> {
  await adminService.createDeveloper({
    name: stringField(formData, "name"),
    description: stringField(formData, "description") || undefined,
    website: stringField(formData, "website") || undefined,
  });
  revalidatePath("/admin/developers");
}

export async function updateDeveloperAction(formData: FormData): Promise<void> {
  await adminService.updateDeveloper(stringField(formData, "id"), {
    name: stringField(formData, "name"),
    description: stringField(formData, "description") || undefined,
    website: stringField(formData, "website") || undefined,
  });
  revalidatePath("/admin/developers");
}

export async function deleteDeveloperAction(formData: FormData): Promise<void> {
  await adminService.deleteDeveloper(stringField(formData, "id"));
  revalidatePath("/admin/developers");
}

export async function createPublisherAction(formData: FormData): Promise<void> {
  await adminService.createPublisher({
    name: stringField(formData, "name"),
    description: stringField(formData, "description") || undefined,
    website: stringField(formData, "website") || undefined,
  });
  revalidatePath("/admin/publishers");
}

export async function updatePublisherAction(formData: FormData): Promise<void> {
  await adminService.updatePublisher(stringField(formData, "id"), {
    name: stringField(formData, "name"),
    description: stringField(formData, "description") || undefined,
    website: stringField(formData, "website") || undefined,
  });
  revalidatePath("/admin/publishers");
}

export async function deletePublisherAction(formData: FormData): Promise<void> {
  await adminService.deletePublisher(stringField(formData, "id"));
  revalidatePath("/admin/publishers");
}

export async function setUserStatusAction(formData: FormData): Promise<void> {
  await adminService.setUserStatus(
    stringField(formData, "userId"),
    stringField(formData, "status") === "LOCKED" ? "LOCKED" : "ACTIVE",
  );
  revalidatePath("/admin/users");
}

export async function setReviewVisibilityAction(formData: FormData): Promise<void> {
  await adminService.setReviewVisibility(
    stringField(formData, "reviewId"),
    stringField(formData, "visibilityStatus") === "HIDDEN" ? "HIDDEN" : "VISIBLE",
  );
  revalidatePath("/admin/reviews");
}

export async function createGameAction(formData: FormData): Promise<void> {
  const { createGameSchema } = await import("@/shared/validation/game");
  const parsed = createGameSchema.parse({
    name: stringField(formData, "name"),
    slug: stringField(formData, "slug"),
    shortDescription: stringField(formData, "shortDescription"),
    description: stringField(formData, "description"),
    basePrice: stringField(formData, "basePrice") || "0",
    releaseDate: stringField(formData, "releaseDate") || new Date().toISOString(),
    platforms: stringField(formData, "platforms"),
    developerId: stringField(formData, "developerId"),
    publisherId: stringField(formData, "publisherId"),
    heroPath: stringField(formData, "heroPath") || null,
    ageRating: stringField(formData, "ageRating") || null,
    minimumRequirements: undefined,
    recommendedRequirements: undefined,
    categoryIds: formData.getAll("categoryIds").map((value) => String(value)).filter(Boolean),
  });
  await adminService.createGame(parsed);
  revalidatePath("/admin/games");
}

export async function updateGameAction(formData: FormData): Promise<void> {
  const id = stringField(formData, "id");
  const categoryIds = formData.getAll("categoryIds").map((value) => String(value)).filter(Boolean);
  let coverPath: string | null | undefined;
  let heroPath: string | null | undefined;

  const coverFile = formData.get("coverFile");
  if (coverFile instanceof File && coverFile.size > 0) {
    const stored = await localMediaStorage.save({
      buffer: Buffer.from(await coverFile.arrayBuffer()),
      filename: coverFile.name,
      mimeType: coverFile.type || "image/jpeg",
    });
    coverPath = stored.path;
  } else if (formData.has("coverPath")) {
    coverPath = stringField(formData, "coverPath") || null;
  }
  const heroFile = formData.get("heroFile");
  if (heroFile instanceof File && heroFile.size > 0) {
    const stored = await localMediaStorage.save({
      buffer: Buffer.from(await heroFile.arrayBuffer()),
      filename: heroFile.name,
      mimeType: heroFile.type || "image/jpeg",
    });
    heroPath = stored.path;
  } else if (formData.has("heroPath")) {
    heroPath = stringField(formData, "heroPath") || null;
  }

  const { updateGameSchema } = await import("@/shared/validation/game");
  const parsed = updateGameSchema.parse({
    name: stringField(formData, "name") || undefined,
    slug: stringField(formData, "slug") || undefined,
    shortDescription: stringField(formData, "shortDescription") || undefined,
    description: stringField(formData, "description") || undefined,
    basePrice: stringField(formData, "basePrice") || undefined,
    releaseDate: stringField(formData, "releaseDate") || undefined,
    platforms: formData.has("platforms") ? stringField(formData, "platforms") : undefined,
    developerId: stringField(formData, "developerId") || undefined,
    publisherId: stringField(formData, "publisherId") || undefined,
    ageRating: formData.has("ageRating") ? stringField(formData, "ageRating") || null : undefined,
    heroPath,
    coverPath,
    categoryIds: formData.has("categoryIds") ? categoryIds : undefined,
    minimumRequirements: undefined,
    recommendedRequirements: undefined,
    status: stringField(formData, "status") || undefined,
  });
  await adminService.updateGame(id, parsed);
  revalidatePath("/admin/games");
  revalidatePath(`/admin/games/${id}`);
  revalidatePath("/games");
}

export async function deleteGameAction(formData: FormData): Promise<void> {
  const id = stringField(formData, "id");
  const game = await adminService.getGame(id);
  await adminService.deleteGame(id);
  if (game) {
    if (game.coverPath) await localMediaStorage.delete(game.coverPath);
    if (game.heroPath) await localMediaStorage.delete(game.heroPath);
    for (const media of game.media) await localMediaStorage.delete(media.path);
  }
  revalidatePath("/admin/games");
  revalidatePath("/games");
  redirect("/admin/games");
}

export async function setGameStatusAction(formData: FormData): Promise<void> {
  const status = stringField(formData, "status");
  if (!["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"].includes(status)) return;
  await adminService.setGameStatus(
    stringField(formData, "gameId"),
    status as "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED",
  );
  revalidatePath("/admin/games");
  revalidatePath("/games");
}

export async function uploadGameMediaAction(formData: FormData): Promise<void> {
  const gameId = stringField(formData, "gameId");
  const type = stringField(formData, "type") === "VIDEO" ? "VIDEO" : "IMAGE";
  const title = stringField(formData, "title") || null;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const stored = await localMediaStorage.save({
    buffer: Buffer.from(await file.arrayBuffer()),
    filename: file.name,
    mimeType: file.type || (type === "VIDEO" ? "video/mp4" : "image/jpeg"),
  });
  try {
    await adminService.createGameMedia({ gameId, type, path: stored.path, title });
  } catch (error) {
    await localMediaStorage.delete(stored.path);
    throw error;
  }
  revalidatePath("/admin/games");
  revalidatePath(`/admin/games/${gameId}`);
}

export async function deleteGameMediaAction(formData: FormData): Promise<void> {
  const id = stringField(formData, "id");
  const gameId = stringField(formData, "gameId");
  const path = await adminService.deleteGameMedia(id);
  if (path) await localMediaStorage.delete(path);
  revalidatePath("/admin/games");
  if (gameId) revalidatePath(`/admin/games/${gameId}`);
}

export async function createPromotionAction(formData: FormData): Promise<void> {
  await adminService.createPromotion({
    name: stringField(formData, "name"),
    discountPercent: stringField(formData, "discountPercent") || "0",
    startsAt: new Date(stringField(formData, "startsAt")),
    endsAt: new Date(stringField(formData, "endsAt")),
    description: stringField(formData, "description") || undefined,
  });
  revalidatePath("/admin/promotions");
}

export async function updatePromotionAction(formData: FormData): Promise<void> {
  await adminService.updatePromotion(stringField(formData, "id"), {
    name: stringField(formData, "name"),
    discountPercent: stringField(formData, "discountPercent") || "0",
    startsAt: new Date(stringField(formData, "startsAt")),
    endsAt: new Date(stringField(formData, "endsAt")),
    description: stringField(formData, "description") || undefined,
  });
  revalidatePath("/admin/promotions");
  revalidatePath(`/admin/promotions/${stringField(formData, "id")}`);
}

export async function setPromotionStatusAction(formData: FormData): Promise<void> {
  const status = stringField(formData, "status");
  if (!["DRAFT", "ACTIVE", "STOPPED"].includes(status)) return;
  await adminService.setPromotionStatus(stringField(formData, "id"), status as "DRAFT" | "ACTIVE" | "STOPPED");
  revalidatePath("/admin/promotions");
}

export async function setPromotionGamesAction(formData: FormData): Promise<void> {
  const id = stringField(formData, "id");
  const gameIds = formData.getAll("gameIds").map((value) => String(value)).filter(Boolean);
  await adminService.setPromotionGames(id, gameIds);
  revalidatePath("/admin/promotions");
  revalidatePath(`/admin/promotions/${id}`);
}

export async function deletePromotionAction(formData: FormData): Promise<void> {
  await adminService.deletePromotion(stringField(formData, "id"));
  revalidatePath("/admin/promotions");
  redirect("/admin/promotions");
}

export async function updateUserAction(formData: FormData): Promise<void> {
  await adminService.updateUser(stringField(formData, "userId"), {
    displayName: stringField(formData, "displayName"),
    role: stringField(formData, "role") === "ADMIN" ? "ADMIN" : "CUSTOMER",
  });
  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  await adminService.deleteUser(stringField(formData, "userId"));
  revalidatePath("/admin/users");
}

export async function adminCompletePaymentAction(formData: FormData): Promise<void> {
  const { paymentService } = await import("@/modules/payment/infrastructure/payment-service");
  const orderId = stringField(formData, "orderId");
  const approved = stringField(formData, "approved") === "true" || stringField(formData, "decision") === "approve";
  if (!orderId) return;
  await paymentService.adminCompleteMock(orderId, approved);
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}
