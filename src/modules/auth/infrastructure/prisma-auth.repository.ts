import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/database/prisma";
import type {
  AuthRepository,
  AuthSession,
  AuthUser,
  PasswordResetRecord,
} from "@/modules/auth/application/auth.repository";
import { AppError } from "@/shared/errors/app-error";

const userSelect = {
  id: true,
  username: true,
  email: true,
  passwordHash: true,
  displayName: true,
  role: true,
  status: true,
} as const;

function toAuthUser(user: {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: string;
  status: string;
}): AuthUser {
  return {
    ...user,
    role: user.role as AuthUser["role"],
    status: user.status as AuthUser["status"],
  };
}

export class PrismaAuthRepository implements AuthRepository {
  findUserByEmail(email: string): Promise<AuthUser | null> {
    return prisma.user
      .findUnique({ select: userSelect, where: { email } })
      .then((user) => (user ? toAuthUser(user) : null));
  }

  findUserByUsername(username: string): Promise<AuthUser | null> {
    return prisma.user
      .findUnique({ select: userSelect, where: { username } })
      .then((user) => (user ? toAuthUser(user) : null));
  }

  findSessionByTokenHash(tokenHash: string): Promise<AuthSession | null> {
    return prisma.session
      .findUnique({
        where: { tokenHash },
        include: { user: { select: userSelect } },
      })
      .then((session) =>
        session
          ? {
              id: session.id,
              userId: session.userId,
              expiresAt: session.expiresAt,
              revokedAt: session.revokedAt,
              user: toAuthUser(session.user),
            }
          : null,
      );
  }

  async createUser(input: {
    username: string;
    email: string;
    passwordHash: string;
    displayName: string;
  }): Promise<AuthUser> {
    try {
      const user = await prisma.user.create({
        select: userSelect,
        data: { ...input },
      });
      return toAuthUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(
          "AUTH_IDENTIFIER_TAKEN",
          "Email hoặc tên người dùng đã được sử dụng.",
          409,
        );
      }
      throw error;
    }
  }

  async updateLastLogin(userId: string, lastLoginAt: Date): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { lastLoginAt } });
  }

  async createSession(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await prisma.session.create({ data: input });
  }

  async revokeSession(tokenHash: string, revokedAt: Date): Promise<void> {
    await prisma.session.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt } });
  }

  async revokeAllSessions(userId: string, revokedAt: Date): Promise<void> {
    await prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt } });
  }

  async createPasswordResetToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await prisma.passwordResetToken.deleteMany({ where: { userId: input.userId, usedAt: null } });
    await prisma.passwordResetToken.create({ data: input });
  }

  findPasswordResetToken(tokenHash: string): Promise<PasswordResetRecord | null> {
    return prisma.passwordResetToken.findUnique({ where: { tokenHash } }).then((token) => token);
  }

  async consumePasswordResetToken(id: string, usedAt: Date): Promise<void> {
    await prisma.passwordResetToken.updateMany({ where: { id, usedAt: null }, data: { usedAt } });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }
}

export const prismaAuthRepository = new PrismaAuthRepository();
