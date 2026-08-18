import "server-only";

import { WishlistService } from "@/modules/wishlist/application/wishlist.service";
import { prismaWishlistRepository } from "./prisma-wishlist.repository";

export const wishlistService = new WishlistService(prismaWishlistRepository);
