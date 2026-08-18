import "server-only";

import { hashPassword, verifyPassword } from "@/infrastructure/auth/password";
import { requireUser } from "@/modules/auth/application/guards";
import { assertPasswordPolicy } from "@/modules/auth/domain/password-policy";
import { authService } from "@/modules/auth/infrastructure/auth-service";
import { AppError } from "@/shared/errors/app-error";
import type { UserRepository } from "./user.repository";

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async profile() {
    const user = await requireUser();
    const profile = await this.repository.findProfileById(user.id);
    if (!profile) throw new AppError("AUTH_REQUIRED", "Không tìm thấy người dùng.", 401);
    return profile;
  }

  async updateProfile(input: {
    displayName: string;
    avatarPath?: string | null;
    birthDate?: Date | null;
    countryCode?: string | null;
  }) {
    const user = await requireUser();
    const displayName = input.displayName.trim();
    if (!displayName) throw new AppError("AUTH_REQUIRED", "Tên hiển thị là bắt buộc.");
    return this.repository.updateProfile(user.id, { ...input, displayName });
  }

  async changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
    const user = await requireUser();
    const passwordHash = await this.repository.findPasswordHash(user.id);
    if (!passwordHash || !(await verifyPassword(input.currentPassword, passwordHash))) {
      throw new AppError("AUTH_INVALID_CREDENTIALS", "Mật khẩu hiện tại không chính xác.", 401);
    }
    assertPasswordPolicy(input.newPassword);
    await this.repository.updatePassword(user.id, await hashPassword(input.newPassword));
    await authService.logout();
  }
}
