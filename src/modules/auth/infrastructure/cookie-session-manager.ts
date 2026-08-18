import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import type { AuthRepository } from "@/modules/auth/application/auth.repository";
import type { SessionManager } from "@/modules/auth/application/session-manager";

const sessionCookieName = "playport_session";
const sessionLifetimeMs = 1000 * 60 * 60 * 24 * 30;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class CookieSessionManager implements SessionManager {
  constructor(private readonly repository: AuthRepository) {}

  async create(userId: string): Promise<void> {
    const rawToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + sessionLifetimeMs);
    await this.repository.createSession({ userId, tokenHash: hashToken(rawToken), expiresAt });

    const cookieStore = await cookies();
    cookieStore.set(sessionCookieName, rawToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    });
  }

  async currentUser() {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(sessionCookieName)?.value;
    if (!rawToken) return null;

    const session = await this.repository.findSessionByTokenHash(hashToken(rawToken));
    if (!session || session.revokedAt || session.expiresAt <= new Date()) return null;
    if (session.user.status === "LOCKED") return null;
    return session.user;
  }

  async revokeCurrent(): Promise<void> {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(sessionCookieName)?.value;
    if (rawToken) {
      await this.repository.revokeSession(hashToken(rawToken), new Date());
    }
    cookieStore.delete(sessionCookieName);
  }
}
