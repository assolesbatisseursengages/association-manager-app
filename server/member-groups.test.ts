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

describe("memberGroups router", () => {
  it("should list member groups", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const groups = await caller.memberGroups.list();
    expect(Array.isArray(groups)).toBe(true);
  });

  it("should create a member group", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.memberGroups.create({
      name: "Test Group",
      slug: "test-group",
      description: "A test group",
      location: "Test City",
      email: "test@group.com",
      phone: "+235 66 00 00 00",
    });

    expect(result).toHaveProperty("name", "Test Group");
    expect(result).toHaveProperty("slug", "test-group");
  });

  it("should get member group by ID", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a group
    const created = await caller.memberGroups.create({
      name: "Test Group 2",
      slug: "test-group-2",
      description: "Another test group",
    });

    // Then retrieve it
    const retrieved = await caller.memberGroups.getById({ id: created.id || 1 });
    expect(retrieved).toBeTruthy();
  });

  it("should update a member group", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a group first
    const created = await caller.memberGroups.create({
      name: "Original Name",
      slug: "original-slug",
    });

    // Update it
    const result = await caller.memberGroups.update({
      id: created.id || 1,
      name: "Updated Name",
    });

    expect(result).toHaveProperty("success", true);
  });
});
