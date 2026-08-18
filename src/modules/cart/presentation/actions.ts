"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cartService } from "@/modules/cart/infrastructure/cart-service";

export async function addToCartAction(formData: FormData): Promise<void> {
  await cartService.add(String(formData.get("gameId") ?? ""));
  revalidatePath("/cart");
  redirect("/cart");
}

export async function removeFromCartAction(formData: FormData): Promise<void> {
  await cartService.remove(String(formData.get("itemId") ?? ""));
  revalidatePath("/cart");
}
