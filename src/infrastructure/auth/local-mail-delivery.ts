import "server-only";

import type { MailDelivery } from "@/modules/auth/application/mail-delivery";
import { logger } from "@/infrastructure/logging/logger";

export class LocalMailDelivery implements MailDelivery {
  async sendPasswordReset(input: {
    to: string;
    displayName: string;
    resetUrl: string;
  }): Promise<void> {
    logger.info("password_reset_queued", {
      recipientDomain: input.to.split("@")[1] ?? "unknown",
      displayNameLength: input.displayName.length,
      hasResetUrl: Boolean(input.resetUrl),
    });
  }
}
