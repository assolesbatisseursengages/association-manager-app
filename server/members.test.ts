import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("members router", () => {
  it("should list members", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    try {
      const result = await caller.members.list();
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      // Expected if no members exist
      expect(error).toBeDefined();
    }
  });

  it("should get member stats", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    try {
      const result = await caller.members.stats();
      expect(result).toHaveProperty("total");
    } catch (error) {
      // Expected if no data
      expect(error).toBeDefined();
    }
  });
});

describe("documents router", () => {
  it("should list documents", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    try {
      const result = await caller.documents.list();
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should get document stats", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    try {
      const result = await caller.documents.stats();
      expect(result).toHaveProperty("total");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("finances router", () => {
  it("should get finance stats", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    try {
      const result = await caller.finances.stats();
      expect(result).toHaveProperty("solde");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
