"use server";

import { revalidatePath } from "next/cache";

import { reviewService } from "@/modules/review/infrastructure/review-service";

export async function createReviewAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  await reviewService.create({
    gameId: String(formData.get("gameId") ?? ""),
    content: String(formData.get("content") ?? ""),
    isRecommended: String(formData.get("isRecommended") ?? "false") === "true",
  });
  revalidatePath(`/games/${slug}`);
}

export async function updateReviewAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  await reviewService.update({
    id: String(formData.get("reviewId") ?? ""),
    content: String(formData.get("content") ?? ""),
    isRecommended: String(formData.get("isRecommended") ?? "false") === "true",
  });
  revalidatePath(`/games/${slug}`);
}

export async function deleteReviewAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  await reviewService.delete(String(formData.get("reviewId") ?? ""));
  revalidatePath(`/games/${slug}`);
}
