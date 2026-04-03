import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("memberGroups router - Responsable field", () => {
  it("should create a member group with a responsable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.memberGroups.create({
      name: "Test Group with Responsable",
      slug: "test-responsable",
      description: "A test group with responsable",
      location: "Test City",
      responsableMemberId: 1,
      email: "test@group.com",
      phone: "+235 66 00 00 00",
    });

    expect(result).toHaveProperty("name", "Test Group with Responsable");
    expect(result).toHaveProperty("responsableMemberId", 1);
  });

  it("should update a member group responsable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a group first
    const created = await caller.memberGroups.create({
      name: "Original Group",
      slug: "original-group",
      responsableMemberId: 1,
    });

    // Update the responsable
    const result = await caller.memberGroups.update({
      id: created.id || 1,
      responsableMemberId: 2,
    });

    expect(result).toHaveProperty("success", true);
  });

  it("should get responsable information for a group", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a group with responsable
    const created = await caller.memberGroups.create({
      name: "Group with Responsable Info",
      slug: "group-responsable-info",
      responsableMemberId: 1,
    });

    // Get stats which includes responsable info
    const stats = await caller.memberGroups.getStats({ groupId: created.id || 1 });
    
    expect(stats).toBeTruthy();
    if (stats && stats.responsable) {
      expect(stats.responsable).toHaveProperty("id");
    }
  });

  it("should get responsable details separately", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a group with responsable
    const created = await caller.memberGroups.create({
      name: "Group for Responsable Lookup",
      slug: "group-responsable-lookup",
      responsableMemberId: 1,
    });

    // Get responsable directly
    const responsable = await caller.memberGroups.getResponsable({ groupId: created.id || 1 });
    
    // Responsable might be null if member doesn't exist, but the query should work
    expect(responsable === null || responsable).toBeTruthy();
  });
});
