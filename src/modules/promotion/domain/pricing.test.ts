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
});
