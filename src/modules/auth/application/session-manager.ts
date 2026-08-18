import type { AuthUser } from "./auth.repository";

export interface SessionManager {
  create(userId: string): Promise<void>;
  currentUser(): Promise<AuthUser | null>;
  revokeCurrent(): Promise<void>;
}
