import "server-only";

import { OrderService } from "@/modules/order/application/order.service";
import { prismaOrderRepository } from "./prisma-order.repository";

export const orderService = new OrderService(prismaOrderRepository);
