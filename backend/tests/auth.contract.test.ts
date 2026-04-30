import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, resetPasswordSchema } from "../src/modules/auth/auth.schema";

const strongPassword = "NexusPass#123";

describe("auth validation contract", () => {
  it("accepts a secure registration payload", () => {
    const result = registerSchema.body.safeParse({
      email: "player@nexus.test",
      username: "player_one",
      password: strongPassword
    });

    expect(result.success).toBe(true);
  });

  it("rejects weak registration passwords", () => {
    const result = registerSchema.body.safeParse({
      email: "player@nexus.test",
      username: "player_one",
      password: "password"
    });

    expect(result.success).toBe(false);
  });

  it("accepts login and reset-password payload shapes", () => {
    expect(
      loginSchema.body.safeParse({
        email: "player@nexus.test",
        password: strongPassword
      }).success
    ).toBe(true);

    expect(
      resetPasswordSchema.body.safeParse({
        token: "a".repeat(32),
        password: strongPassword
      }).success
    ).toBe(true);
  });
});

describe("auth route contract", () => {
  const routesSource = fs.readFileSync(
    path.resolve(__dirname, "../src/modules/auth/auth.routes.ts"),
    "utf8"
  );

  it("exposes core email/password and session routes", () => {
    for (const route of ["/register", "/login", "/logout", "/refresh", "/me"]) {
      expect(routesSource).toContain(route);
    }
  });

  it("exposes Google and Apple OAuth callback routes", () => {
    for (const route of ["/google", "/google/callback", "/apple", "/apple/callback"]) {
      expect(routesSource).toContain(route);
    }
  });
});

