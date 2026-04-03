import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import fs from "fs";
import path from "path";

export const adminRouter = router({
  // Migration endpoint - only for admins
  runMigrations: protectedProcedure.mutation(async ({ ctx }) => {
    // Check if user is admin
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can run migrations",
      });
    }

    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection not available");
      }

      // Read SQL file
      const sqlFile = path.join(process.cwd(), "drizzle", "migrations_clean.sql");
      if (!fs.existsSync(sqlFile)) {
        throw new Error("Migration SQL file not found");
      }

      const sql = fs.readFileSync(sqlFile, "utf8");
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));

      console.log(`📋 Running ${statements.length} SQL statements...`);

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const statement of statements) {
        try {
          await db.execute(statement);
          successCount++;
        } catch (error: any) {
          if (error.code === "ER_TABLE_EXISTS_ERROR") {
            successCount++;
          } else {
            errorCount++;
            errors.push(`${error.message}`);
          }
        }
      }

      console.log(
        `✅ Migrations completed: ${successCount} successful, ${errorCount} failed`
      );

      return {
        success: true,
        message: `Migrations completed: ${successCount} successful, ${errorCount} failed`,
        successCount,
        errorCount,
        errors: errors.slice(0, 5), // Return first 5 errors
      };
    } catch (error: any) {
      console.error("❌ Migration error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Migration failed: ${error.message}`,
      });
    }
  }),
});
