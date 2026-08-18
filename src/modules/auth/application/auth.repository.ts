export type AuthUser = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: "CUSTOMER" | "ADMIN";
  status: "ACTIVE" | "LOCKED";
};

export type AuthSession = {
  id: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  user: AuthUser;
};

export type PasswordResetRecord = {
  id: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
};

export interface AuthRepository {
  findUserByEmail(email: string): Promise<AuthUser | null>;
  findUserByUsername(username: string): Promise<AuthUser | null>;
  findSessionByTokenHash(tokenHash: string): Promise<AuthSession | null>;
  createUser(input: {
    username: string;
    email: string;
    passwordHash: string;
    displayName: string;
  }): Promise<AuthUser>;
  updateLastLogin(userId: string, lastLoginAt: Date): Promise<void>;
  createSession(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  revokeSession(tokenHash: string, revokedAt: Date): Promise<void>;
  revokeAllSessions(userId: string, revokedAt: Date): Promise<void>;
  createPasswordResetToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  findPasswordResetToken(tokenHash: string): Promise<PasswordResetRecord | null>;
  consumePasswordResetToken(id: string, usedAt: Date): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}
