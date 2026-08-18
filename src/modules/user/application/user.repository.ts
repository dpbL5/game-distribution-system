export type UserProfile = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarPath: string | null;
  birthDate: Date | null;
  countryCode: string | null;
};

export interface UserRepository {
  findProfileById(userId: string): Promise<UserProfile | null>;
  updateProfile(
    userId: string,
    input: {
      displayName: string;
      avatarPath?: string | null;
      birthDate?: Date | null;
      countryCode?: string | null;
    },
  ): Promise<UserProfile>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  findPasswordHash(userId: string): Promise<string | null>;
}
