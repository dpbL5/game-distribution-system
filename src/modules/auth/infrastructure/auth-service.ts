import "server-only";

import { LocalMailDelivery } from "@/infrastructure/auth/local-mail-delivery";
import { prismaAuthRepository } from "@/modules/auth/infrastructure/prisma-auth.repository";
import { CookieSessionManager } from "@/modules/auth/infrastructure/cookie-session-manager";
import { AuthService } from "@/modules/auth/application/auth.service";

const sessionManager = new CookieSessionManager(prismaAuthRepository);

export const authService = new AuthService(
  prismaAuthRepository,
  sessionManager,
  new LocalMailDelivery(),
);
