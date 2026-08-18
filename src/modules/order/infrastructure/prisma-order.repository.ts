import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/database/prisma";
import type {
  OrderLineInput,
  OrderRepository,
  PendingOrder,
} from "@/modules/order/application/order.repository";

const orderInclude = {
  items: true,
} as const;

function toOrder(order: {
  id: string;
  userId: string;
  idempotencyKey: string;
  subtotal: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  grandTotal: Prisma.Decimal;
  currency: string;
  status: string;
  createdAt: Date;
  items: Array<{
    id: string;
    gameId: string;
    gameNameSnapshot: string;
    basePriceSnapshot: Prisma.Decimal;
    discountSnapshot: Prisma.Decimal;
    paidPrice: Prisma.Decimal;
  }>;
}): PendingOrder {
  return {
    id: order.id,
    userId: order.userId,
    idempotencyKey: order.idempotencyKey,
    subtotal: order.subtotal.toFixed(2),
    discountTotal: order.discountTotal.toFixed(2),
    grandTotal: order.grandTotal.toFixed(2),
    currency: order.currency,
    status: order.status as PendingOrder["status"],
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      gameId: item.gameId,
      gameNameSnapshot: item.gameNameSnapshot,
      basePriceSnapshot: item.basePriceSnapshot.toFixed(2),
      discountSnapshot: item.discountSnapshot.toFixed(2),
      paidPrice: item.paidPrice.toFixed(2),
    })),
  };
}

export class PrismaOrderRepository implements OrderRepository {
  async findByIdempotencyKey(idempotencyKey: string): Promise<PendingOrder | null> {
    const order = await prisma.order.findUnique({
      where: { idempotencyKey },
      include: orderInclude,
    });
    return order ? toOrder(order) : null;
  }

  async createPending(input: {
    userId: string;
    idempotencyKey: string;
    subtotal: string;
    discountTotal: string;
    grandTotal: string;
    currency: string;
    items: OrderLineInput[];
  }): Promise<PendingOrder> {
    try {
      const order = await prisma.order.create({
        include: orderInclude,
        data: {
          userId: input.userId,
          idempotencyKey: input.idempotencyKey,
          subtotal: input.subtotal,
          discountTotal: input.discountTotal,
          grandTotal: input.grandTotal,
          currency: input.currency,
          items: { create: input.items },
        },
      });
      return toOrder(order);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const existing = await this.findByIdempotencyKey(input.idempotencyKey);
        if (existing) return existing;
      }
      throw error;
    }
  }

  async findByIdForUser(orderId: string, userId: string): Promise<PendingOrder | null> {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: orderInclude,
    });
    return order ? toOrder(order) : null;
  }

  async listForUser(userId: string): Promise<PendingOrder[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: orderInclude,
    });
    return orders.map(toOrder);
  }
}

export const prismaOrderRepository = new PrismaOrderRepository();
