import "server-only";

import { prisma } from "@/infrastructure/database/prisma";
import type { UserProfile, UserRepository } from "@/modules/user/application/user.repository";

const profileSelect = {
  id: true,
  username: true,
  email: true,
  displayName: true,
  avatarPath: true,
  birthDate: true,
  countryCode: true,
} as const;

export class PrismaUserRepository implements UserRepository {
  findProfileById(userId: string): Promise<UserProfile | null> {
    return prisma.user.findUnique({ where: { id: userId }, select: profileSelect });
  }

  updateProfile(
    userId: string,
    input: {
      displayName: string;
      avatarPath?: string | null;
      birthDate?: Date | null;
      countryCode?: string | null;
    },
  ): Promise<UserProfile> {
    return prisma.user.update({ where: { id: userId }, data: input, select: profileSelect });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async findPasswordHash(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    return user?.passwordHash ?? null;
  }
}

export const prismaUserRepository = new PrismaUserRepository();
