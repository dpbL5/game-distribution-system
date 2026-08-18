export type AppErrorCode =
  | "AUTH_REQUIRED"
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_IDENTIFIER_TAKEN"
  | "FORBIDDEN"
  | "ACCOUNT_LOCKED"
  | "GAME_NOT_FOUND"
  | "GAME_NOT_AVAILABLE"
  | "GAME_ALREADY_OWNED"
  | "CART_ITEM_EXISTS"
  | "WISHLIST_ITEM_EXISTS"
  | "CART_EMPTY"
  | "PRICE_CHANGED"
  | "PROMOTION_INVALID"
  | "ORDER_NOT_FOUND"
  | "PAYMENT_AMOUNT_MISMATCH"
  | "PAYMENT_ALREADY_PROCESSED"
  | "REVIEW_OWNERSHIP_REQUIRED"
  | "REVIEW_ALREADY_EXISTS"
  | "MEDIA_TYPE_NOT_ALLOWED"
  | "MEDIA_TOO_LARGE"
  | "RESET_TOKEN_INVALID";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(code: AppErrorCode, message: string, status = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
