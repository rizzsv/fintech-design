import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./auth";

describe("auth schemas", () => {
  it("accepts backend-compatible register payload", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      phoneNumber: "081234567890",
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
    });

    expect(result.success).toBe(true);
  });

  it("accepts backend-compatible login payload", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });
});
