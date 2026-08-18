export interface MailDelivery {
  sendPasswordReset(input: { to: string; displayName: string; resetUrl: string }): Promise<void>;
}
