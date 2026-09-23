import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./schemas";

describe("auth schemas", () => {
  it("accepts a backend-compatible register payload", () => {
    const result = registerSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "user@example.com",
      phoneNumber: "081234567890",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a backend-compatible login payload", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  /**
   * The server treats both names as optional, but the register form collects
   * them, so the client requires them rather than sending blank strings.
   */
  it("requires both names even though the server does not", () => {
    const result = registerSchema.safeParse({
      firstName: "",
      lastName: "",
      email: "user@example.com",
      phoneNumber: "081234567890",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than the server minimum", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});
