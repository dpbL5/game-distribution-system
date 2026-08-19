import { describe, expect, it } from "vitest";

import { calculateCurrentPrice, selectActivePromotion } from "./pricing";

const now = new Date("2026-08-18T10:00:00.000Z");

describe("promotion pricing", () => {
  it("selects the highest valid active discount", () => {
    const promotion = selectActivePromotion(
      [
        {
          id: "small",
          discountPercent: "10",
          startsAt: new Date("2026-08-01"),
          endsAt: new Date("2026-09-01"),
          status: "ACTIVE",
        },
        {
          id: "large",
          discountPercent: "25",
          startsAt: new Date("2026-08-01"),
          endsAt: new Date("2026-09-01"),
          status: "ACTIVE",
        },
      ],
      now,
    );
    expect(promotion?.id).toBe("large");
  });

  it("uses decimal arithmetic for the current price", () => {
    expect(
      calculateCurrentPrice("199999.99", {
        id: "sale",
        discountPercent: "12.5",
        startsAt: new Date("2026-08-01"),
        endsAt: new Date("2026-09-01"),
        status: "ACTIVE",
      }).price,
    ).toBe("174999.99");
  });

  it("includes promotion at startsAt and excludes at endsAt", () => {
    const promo = {
      id: "window",
      discountPercent: "20",
      startsAt: new Date("2026-08-10T00:00:00.000Z"),
      endsAt: new Date("2026-08-20T00:00:00.000Z"),
      status: "ACTIVE" as const,
    };
    expect(selectActivePromotion([promo], new Date("2026-08-10T00:00:00.000Z"))?.id).toBe("window");
    expect(selectActivePromotion([promo], new Date("2026-08-20T00:00:00.000Z"))).toBeNull();
  });

  it("ignores non-ACTIVE promotions regardless of window", () => {
    const base = {
      id: "draft",
      discountPercent: "50",
      startsAt: new Date("2026-08-01"),
      endsAt: new Date("2026-09-01"),
    };
    expect(selectActivePromotion([{ ...base, status: "DRAFT" as const }], now)).toBeNull();
    expect(selectActivePromotion([{ ...base, status: "STOPPED" as const }], now)).toBeNull();
  });

  it("returns 0.00 price for 100% discount and deterministic tie-break", () => {
    expect(
      calculateCurrentPrice("50000", {
        id: "free",
        discountPercent: "100",
        startsAt: new Date("2026-08-01"),
        endsAt: new Date("2026-09-01"),
        status: "ACTIVE",
      }).price,
    ).toBe("0.00");

    const a = {
      id: "a",
      discountPercent: "15",
      startsAt: new Date("2026-08-01"),
      endsAt: new Date("2026-09-01"),
      status: "ACTIVE" as const,
    };
    const b = { ...a, id: "b" };
    // Same discount and window -> smallest id wins
    expect(selectActivePromotion([b, a], now)?.id).toBe("a");
  });
});
