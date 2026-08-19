import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/database/prisma";
import type {
  PaymentOrder,
  PaymentRecord,
  PaymentRepository,
} from "@/modules/payment/application/payment.repository";
import { AppError } from "@/shared/errors/app-error";

const orderInclude = { items: { select: { id: true, gameId: true } } } as const;

function toOrder(order: {
  id: string;
  userId: string;
  grandTotal: Prisma.Decimal;
  currency: string;
  status: string;
  items: Array<{ id: string; gameId: string }>;
}): PaymentOrder {
  return {
    id: order.id,
    userId: order.userId,
    grandTotal: order.grandTotal.toFixed(2),
    currency: order.currency,
    status: order.status as PaymentOrder["status"],
    items: order.items,
  };
}

function toPayment(payment: {
  id: string;
  orderId: string;
  providerTransactionId: string | null;
  amount: Prisma.Decimal;
  status: string;
  failureReason: string | null;
}): PaymentRecord {
  return {
    id: payment.id,
    orderId: payment.orderId,
    providerTransactionId: payment.providerTransactionId,
    amount: payment.amount.toFixed(2),
    status: payment.status as PaymentRecord["status"],
    failureReason: payment.failureReason,
  };
}

export class PrismaPaymentRepository implements PaymentRepository {
  async findOrderForUser(orderId: string, userId: string): Promise<PaymentOrder | null> {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: orderInclude,
    });
    return order ? toOrder(order) : null;
  }

  async findOrder(orderId: string): Promise<PaymentOrder | null> {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
    return order ? toOrder(order) : null;
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<PaymentRecord | null> {
    const payment = await prisma.payment.findUnique({ where: { idempotencyKey } });
    return payment ? toPayment(payment) : null;
  }

  async findByOrderId(orderId: string): Promise<PaymentRecord | null> {
    const payment = await prisma.payment.findUnique({ where: { orderId } });
    return payment ? toPayment(payment) : null;
  }

  async createPending(input: {
    orderId: string;
    method: string;
    provider: string;
    providerTransactionId: string;
    amount: string;
    idempotencyKey: string;
  }): Promise<PaymentRecord> {
    try {
      const payment = await prisma.payment.create({ data: input });
      return toPayment(payment);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const existing = await this.findByIdempotencyKey(input.idempotencyKey);
        if (existing) return existing;
      }
      throw error;
    }
  }

  async applyCallback(input: {
    orderId: string;
    providerTransactionId: string;
    amount: string;
    status: "SUCCEEDED" | "FAILED";
    failureReason?: string;
  }): Promise<PaymentRecord> {
    return prisma.$transaction(async (transaction) => {
      const payment = await transaction.payment.findUnique({ where: { orderId: input.orderId } });
      const order = await transaction.order.findUnique({
        where: { id: input.orderId },
        include: { items: { select: { id: true, gameId: true } } },
      });
      if (!payment || !order)
        throw new AppError("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng.", 404);
      if (payment.status === "SUCCEEDED") return toPayment(payment);

      const nextStatus = input.status === "SUCCEEDED" ? "SUCCEEDED" : "FAILED";
      const updatedPayment = await transaction.payment.update({
        where: { id: payment.id },
        data: {
          providerTransactionId: input.providerTransactionId,
          status: nextStatus,
          processedAt: new Date(),
          failureReason: input.failureReason ?? null,
        },
      });
      await transaction.order.update({
        where: { id: order.id },
        data: {
          status: input.status === "SUCCEEDED" ? "PAID" : "PAYMENT_FAILED",
          paidAt: input.status === "SUCCEEDED" ? new Date() : null,
        },
      });

      if (input.status === "SUCCEEDED") {
        await transaction.libraryItem.createMany({
          data: order.items.map((item) => ({
            userId: order.userId,
            gameId: item.gameId,
            orderItemId: item.id,
            ownershipStatus: "ACTIVE" as const,
          })),
          skipDuplicates: true,
        });
        // Clear purchased games from the user's active cart so checkout does
        // not fail with GAME_ALREADY_OWNED on the next attempt. This runs in the
        // same transaction as ownership creation, satisfying the invariant in
        // AGENTS.md §10 that cart updates accompany LibraryItem creation.
        const purchasedGameIds = order.items.map((item) => item.gameId);
        if (purchasedGameIds.length > 0) {
          await transaction.cartItem.deleteMany({
            where: { gameId: { in: purchasedGameIds }, cart: { userId: order.userId, status: "ACTIVE" } },
          });
        }
      }
      return toPayment(updatedPayment);
    });
  }
}

export const prismaPaymentRepository = new PrismaPaymentRepository();
