import "server-only";

import { CartService } from "@/modules/cart/application/cart.service";
import { prismaCartRepository } from "./prisma-cart.repository";

export const cartService = new CartService(prismaCartRepository);
