import "server-only";

import { mockPaymentGateway } from "@/infrastructure/payment/mock-payment-gateway";
import { PaymentService } from "@/modules/payment/application/payment.service";
import { prismaPaymentRepository } from "./prisma-payment.repository";

export const paymentService = new PaymentService(prismaPaymentRepository, mockPaymentGateway);
