import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";
import fs from "fs";
import path from "path";

/**
 * Router for managing demo data
 * - Generate realistic demo data for testing
 * - Reset to clean state
 */
export const demoDataRouter = router({
  /**
   * Generate demo data for demonstration purposes
   * Only available to admin users
   */
  generateDemoData: protectedProcedure.mutation(async ({ ctx }) => {
    // Check admin permission
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can generate demo data",
      });
    }

    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      // Read the SQL file
      const sqlPath = path.join(
        process.cwd(),
        "seed-demo-data-tchad.sql"
      );

      if (!fs.existsSync(sqlPath)) {
        throw new Error("Demo data SQL file not found");
      }

      const sqlContent = fs.readFileSync(sqlPath, "utf-8");

      // Split by statement and execute
      const statements = sqlContent
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s && !s.startsWith("--"));

      let executedCount = 0;
      for (const statement of statements) {
        try {
          await db.execute(statement);
          executedCount++;
        } catch (error) {
          console.warn(`[Demo Data] Skipped statement:`, error);
        }
      }

      return {
        success: true,
        message: `Demo data generated successfully (${executedCount} statements executed)`,
        count: executedCount,
      };
    } catch (error) {
      console.error("[Demo Data] Generation failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to generate demo data: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),

  /**
   * Reset demo data - delete all test data
   * Only available to admin users
   */
  resetDemoData: protectedProcedure.mutation(async ({ ctx }) => {
    // Check admin permission
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can reset demo data",
      });
    }

    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      // Delete in reverse order of dependencies
      const deleteStatements = [
        "DELETE FROM notifications WHERE userId > 0",
        "DELETE FROM announcements WHERE id > 0",
        "DELETE FROM tasks WHERE id > 0",
        "DELETE FROM projects WHERE id > 0",
        "DELETE FROM crm_activities WHERE id > 0",
        "DELETE FROM documents WHERE id > 0",
        "DELETE FROM budget_lines WHERE id > 0",
        "DELETE FROM budgets WHERE id > 0",
        "DELETE FROM suppliers WHERE id > 0",
        "DELETE FROM invoices WHERE id > 0",
        "DELETE FROM contributions WHERE id > 0",
        "DELETE FROM memberships WHERE id > 0",
        "DELETE FROM events WHERE id > 0",
        "DELETE FROM crm_contacts WHERE id > 0",
        "DELETE FROM members WHERE id > 0",
      ];

      let deletedCount = 0;
      for (const statement of deleteStatements) {
        try {
          await db.execute(statement);
          deletedCount++;
        } catch (error) {
          console.warn(`[Demo Data] Delete statement failed:`, error);
        }
      }

      return {
        success: true,
        message: `Demo data reset successfully (${deletedCount} tables cleared)`,
        count: deletedCount,
      };
    } catch (error) {
      console.error("[Demo Data] Reset failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to reset demo data: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),

  /**
   * Get demo data status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      // Count records in main tables
      const [membersResult] = await db.execute(
        "SELECT COUNT(*) as count FROM members"
      );
      const [contactsResult] = await db.execute(
        "SELECT COUNT(*) as count FROM crm_contacts"
      );
      const [projectsResult] = await db.execute(
        "SELECT COUNT(*) as count FROM projects"
      );
      const [invoicesResult] = await db.execute(
        "SELECT COUNT(*) as count FROM invoices"
      );
      const [documentsResult] = await db.execute(
        "SELECT COUNT(*) as count FROM documents"
      );

      const getCount = (result: any) => {
        if (Array.isArray(result) && result.length > 0) {
          return result[0].count || 0;
        }
        return 0;
      };

      return {
        members: getCount(membersResult),
        contacts: getCount(contactsResult),
        projects: getCount(projectsResult),
        invoices: getCount(invoicesResult),
        documents: getCount(documentsResult),
        hasDemoData:
          getCount(membersResult) > 5 && getCount(contactsResult) > 5,
      };
    } catch (error) {
      console.error("[Demo Data] Status check failed:", error);
      return {
        members: 0,
        contacts: 0,
        projects: 0,
        invoices: 0,
        documents: 0,
        hasDemoData: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }),
});
