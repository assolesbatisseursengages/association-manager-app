import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

/**
 * Mock context for testing
 */
function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {} as any,
  };
}

describe("Local Auth Router", () => {
  const caller = appRouter.createCaller(createMockContext());

  describe("register", () => {
    it("should register a new user with valid credentials", async () => {
      const result = await caller.localAuth.register({
        email: `test-${Date.now()}@example.com`,
        password: "TestPassword123!",
        firstName: "Test",
        lastName: "User",
      });

      expect(result.success).toBe(true);
      expect(result.userId).toBeDefined();
      expect(result.sessionToken).toBeDefined();
      expect(result.user.email).toBeDefined();
    });

    it("should reject invalid email", async () => {
      try {
        await caller.localAuth.register({
          email: "invalid-email",
          password: "TestPassword123!",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should reject weak password", async () => {
      try {
        await caller.localAuth.register({
          email: `test-${Date.now()}@example.com`,
          password: "weak",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
        expect(error.message).toContain("mot de passe");
      }
    });

    it("should reject duplicate email", async () => {
      const email = `test-${Date.now()}@example.com`;

      // First registration
      await caller.localAuth.register({
        email,
        password: "TestPassword123!",
      });

      // Second registration with same email
      try {
        await caller.localAuth.register({
          email,
          password: "TestPassword456!",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("CONFLICT");
      }
    });
  });

  describe("login", () => {
    let testEmail: string;
    let testPassword: string;

    beforeAll(async () => {
      testEmail = `test-${Date.now()}@example.com`;
      testPassword = "TestPassword123!";

      await caller.localAuth.register({
        email: testEmail,
        password: testPassword,
        firstName: "Test",
        lastName: "User",
      });
    });

    it("should login with correct credentials", async () => {
      const result = await caller.localAuth.login({
        email: testEmail,
        password: testPassword,
      });

      expect(result.success).toBe(true);
      expect(result.userId).toBeDefined();
      expect(result.sessionToken).toBeDefined();
      expect(result.user.email).toBe(testEmail);
    });

    it("should reject incorrect password", async () => {
      try {
        await caller.localAuth.login({
          email: testEmail,
          password: "WrongPassword123!",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should reject non-existent email", async () => {
      try {
        await caller.localAuth.login({
          email: "nonexistent@example.com",
          password: "TestPassword123!",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      // Register and login
      const email = `test-${Date.now()}@example.com`;
      const registerResult = await caller.localAuth.register({
        email,
        password: "TestPassword123!",
      });

      // Logout
      const result = await caller.localAuth.logout({
        sessionToken: registerResult.sessionToken,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("verifySession", () => {
    it("should verify valid session", async () => {
      // Register and get session token
      const registerResult = await caller.localAuth.register({
        email: `test-${Date.now()}@example.com`,
        password: "TestPassword123!",
      });

      // Verify session
      const result = await caller.localAuth.verifySession({
        sessionToken: registerResult.sessionToken,
      });

      expect(result.valid).toBe(true);
      expect(result.userId).toBe(registerResult.userId);
    });

    it("should reject invalid session token", async () => {
      try {
        await caller.localAuth.verifySession({
          sessionToken: "invalid-token",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });
});
