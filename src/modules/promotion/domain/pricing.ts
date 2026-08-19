import { Decimal } from "@/shared/money/decimal";

export type PromotionCandidate = {
  id: string;
  discountPercent: string;
  startsAt: Date;
  endsAt: Date;
  status: "DRAFT" | "ACTIVE" | "STOPPED";
};

export function selectActivePromotion(
  promotions: PromotionCandidate[],
  now = new Date(),
): PromotionCandidate | null {
  return (
    promotions
      .filter(
        (promotion) =>
          promotion.status === "ACTIVE" && promotion.startsAt <= now && now < promotion.endsAt,
      )
      .sort((left, right) => {
        const discountDifference = new Decimal(right.discountPercent).minus(
          left.discountPercent,
        );
        if (!discountDifference.isZero()) return discountDifference.isPositive() ? 1 : -1;
        const startDifference = left.startsAt.getTime() - right.startsAt.getTime();
        if (startDifference !== 0) return startDifference;
        return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
      })[0] ?? null
  );
}

export function calculateCurrentPrice(basePrice: string, promotion: PromotionCandidate | null) {
  const base = new Decimal(basePrice);
  const discountPercent = promotion
    ? new Decimal(promotion.discountPercent)
    : new Decimal(0);
  const price = base
    .mul(new Decimal(100).minus(discountPercent))
    .div(100)
    .toDecimalPlaces(2);

  return {
    basePrice: base.toFixed(2),
    discountPercent: discountPercent.toFixed(2),
    price: price.toFixed(2),
  };
}
