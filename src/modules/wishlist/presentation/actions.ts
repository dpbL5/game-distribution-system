"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { wishlistService } from "@/modules/wishlist/infrastructure/wishlist-service";

export async function addToWishlistAction(formData: FormData): Promise<void> {
  await wishlistService.add(String(formData.get("gameId") ?? ""));
  revalidatePath("/wishlist");
  redirect("/wishlist");
}

export async function removeFromWishlistAction(formData: FormData): Promise<void> {
  await wishlistService.remove(String(formData.get("itemId") ?? ""));
  revalidatePath("/wishlist");
}
