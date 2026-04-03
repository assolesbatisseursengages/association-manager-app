import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { requireAdmin, requireManageUsers, getRoleDisplayName, getRoleDescription } from "../permissions";

export const usersRouter = router({
  /**
   * Get all users (admin only)
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    requireManageUsers(ctx.user);

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection not available",
      });
    }

    try {
      const allUsers = await db.select().from(users);
      return allUsers.map(user => ({
        ...user,
        roleDisplay: getRoleDisplayName(user.role as any),
      }));
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch users: ${error.message}`,
      });
    }
  }),

  /**
   * Get user by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection not available",
        });
      }

      try {
        const user = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
        if (!user.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }
        return {
          ...user[0],
          roleDisplay: getRoleDisplayName(user[0].role as any),
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch user: ${error.message}`,
        });
      }
    }),

  /**
   * Update user role (admin only)
   */
  updateRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["admin", "gestionnaire", "lecteur"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user);

      // Prevent demoting the last admin
      if (input.role !== "admin" && ctx.user?.id === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot demote yourself from admin role",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection not available",
        });
      }

      try {
        await db
          .update(users)
          .set({ role: input.role })
          .where(eq(users.id, input.userId));

        return {
          success: true,
          message: `User role updated to ${getRoleDisplayName(input.role)}`,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update user role: ${error.message}`,
        });
      }
    }),

  /**
   * Delete user (admin only)
   */
  delete: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user);

      // Prevent deleting yourself
      if (ctx.user?.id === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete your own account",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection not available",
        });
      }

      try {
        // Soft delete or mark as inactive
        await db
          .update(users)
          .set({ 
            email: null,
            name: "Deleted User",
            updatedAt: new Date(),
          })
          .where(eq(users.id, input.userId));

        return {
          success: true,
          message: "User deleted successfully",
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete user: ${error.message}`,
        });
      }
    }),

  /**
   * Get current user permissions
   */
  getPermissions: protectedProcedure.query(({ ctx }) => {
    const role = (ctx.user?.role as any) || "lecteur";
    
    return {
      role,
      roleDisplay: getRoleDisplayName(role),
      description: getRoleDescription(role),
      permissions: {
        canCreate: role === "admin" || role === "gestionnaire",
        canRead: true,
        canUpdate: role === "admin" || role === "gestionnaire",
        canDelete: role === "admin",
        canDownload: true,
        canManageUsers: role === "admin",
        canAccessSettings: role === "admin",
      },
    };
  }),

  /**
   * Get all available roles with descriptions
   */
  getRoles: protectedProcedure.query(() => {
    return [
      {
        value: "admin",
        label: getRoleDisplayName("admin"),
        description: getRoleDescription("admin"),
      },
      {
        value: "gestionnaire",
        label: getRoleDisplayName("gestionnaire"),
        description: getRoleDescription("gestionnaire"),
      },
      {
        value: "lecteur",
        label: getRoleDisplayName("lecteur"),
        description: getRoleDescription("lecteur"),
      },
    ];
  }),
});
