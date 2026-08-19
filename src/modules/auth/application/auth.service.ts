import "server-only";

import { randomBytes, createHash } from "node:crypto";

import { getEnvironment } from "@/infrastructure/config/env";
import { hashPassword, verifyPassword } from "@/infrastructure/auth/password";
import type { MailDelivery } from "./mail-delivery";
import type { AuthRepository, AuthUser } from "./auth.repository";
import type { SessionManager } from "./session-manager";
import { assertPasswordPolicy } from "../domain/password-policy";
import { AppError } from "@/shared/errors/app-error";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function publicUser(user: AuthUser) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly sessions: SessionManager,
    private readonly mail: MailDelivery,
  ) {}

  async register(input: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) {
    const username = normalizeUsername(input.username);
    const email = normalizeEmail(input.email);
    const displayName = input.displayName?.trim() || username;
    if (!username || !email)
      throw new AppError("AUTH_REQUIRED", "Tên người dùng và email là bắt buộc.");
    assertPasswordPolicy(input.password);

    const [existingEmail, existingUsername] = await Promise.all([
      this.repository.findUserByEmail(email),
      this.repository.findUserByUsername(username),
    ]);
    if (existingEmail || existingUsername) {
      throw new AppError(
        "AUTH_IDENTIFIER_TAKEN",
        "Email hoặc tên người dùng đã được sử dụng.",
        409,
      );
    }

    const user = await this.repository.createUser({
      username,
      email,
      passwordHash: await hashPassword(input.password),
      displayName,
    });
    await this.sessions.create(user.id);
    return publicUser(user);
  }

  async login(input: { email: string; password: string }) {
    const identifier = input.email.trim();
    const user =
      (await this.repository.findUserByEmail(normalizeEmail(identifier))) ??
      (await this.repository.findUserByUsername(normalizeUsername(identifier)));
    if (!user)
      throw new AppError("AUTH_INVALID_CREDENTIALS", "Email hoặc mật khẩu không chính xác.", 401);
    if (user.status === "LOCKED") {
      throw new AppError("ACCOUNT_LOCKED", "Tài khoản này đã bị khóa.", 423);
    }
    if (!(await verifyPassword(input.password, user.passwordHash))) {
      throw new AppError("AUTH_INVALID_CREDENTIALS", "Email hoặc mật khẩu không chính xác.", 401);
    }

    await this.repository.updateLastLogin(user.id, new Date());
    await this.sessions.create(user.id);
    return publicUser(user);
  }

  logout(): Promise<void> {
    return this.sessions.revokeCurrent();
  }

  currentUser() {
    return this.sessions.currentUser();
  }

  async requestPasswordReset(emailInput: string): Promise<void> {
    const email = normalizeEmail(emailInput);
    const user = await this.repository.findUserByEmail(email);
    if (!user || user.status === "LOCKED") return;

    const rawToken = randomBytes(32).toString("hex");
    await this.repository.createPasswordResetToken({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    });

    const { APP_URL } = getEnvironment();
    await this.mail.sendPasswordReset({
      to: user.email,
      displayName: user.displayName,
      resetUrl: `${APP_URL}/reset-password?token=${rawToken}`,
    });
  }

  async resetPassword(rawToken: string, password: string): Promise<void> {
    assertPasswordPolicy(password);
    const token = await this.repository.findPasswordResetToken(hashToken(rawToken.trim()));
    if (!token || token.usedAt || token.expiresAt <= new Date()) {
      throw new AppError("RESET_TOKEN_INVALID", "Mã khôi phục không hợp lệ hoặc đã hết hạn.", 400);
    }

    await this.repository.updatePassword(token.userId, await hashPassword(password));
    await this.repository.consumePasswordResetToken(token.id, new Date());
    await this.repository.revokeAllSessions(token.userId, new Date());
  }
}
