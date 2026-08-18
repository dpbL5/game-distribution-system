import { describe, expect, it } from "vitest";

import { assertPasswordPolicy } from "./password-policy";

describe("password policy", () => {
  it("accepts a password that meets the report requirements", () => {
    expect(() => assertPasswordPolicy("GamePass9secure")).not.toThrow();
  });

  it("requires length, case, number, and symbol", () => {
    expect(() => assertPasswordPolicy("short")).toThrow();
    expect(() => assertPasswordPolicy("longpassword9")).toThrow();
    expect(() => assertPasswordPolicy("Longpassword")).toThrow();
    expect(() => assertPasswordPolicy("LONGPASSWORD9")).toThrow();
  });
});
