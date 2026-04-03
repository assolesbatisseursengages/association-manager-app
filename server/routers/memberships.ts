import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

export const membershipsRouter = router({
  listTypes: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const result = await (db as any).$client.query(`
        SELECT id, name, monthlyAmount, yearlyAmount, benefits, isActive
        FROM membership_types
        WHERE isActive = TRUE
        ORDER BY name
      `);
      return result?.[0] || [];
    } catch (error) {
      console.error("[Memberships] Error listing types:", error);
      return [];
    }
  }),

  listMemberships: protectedProcedure
    .input(z.object({ memberId: z.number().optional(), status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const memberFilter = input?.memberId ? `AND memberId = ${input.memberId}` : "";
        const statusFilter = input?.status ? `AND paymentStatus = '${input.status}'` : "";
        
        const result = await (db as any).$client.query(`
          SELECT m.id, m.memberId, m.membershipTypeId, m.startDate, m.endDate, m.amount, 
                 m.paymentStatus, m.paymentDate, mt.name as typeName
          FROM memberships m
          JOIN membership_types mt ON m.membershipTypeId = mt.id
          WHERE 1=1 ${memberFilter} ${statusFilter}
          ORDER BY m.endDate DESC
        `);
        return result?.[0] || [];
      } catch (error) {
        console.error("[Memberships] Error listing:", error);
        return [];
      }
    }),

  createMembership: protectedProcedure
    .input(
      z.object({
        memberId: z.number(),
        membershipTypeId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        amount: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const result = await (db as any).$client.query(`
          INSERT INTO memberships (memberId, membershipTypeId, startDate, endDate, amount, paymentStatus)
          VALUES (${input.memberId}, ${input.membershipTypeId}, '${input.startDate}', '${input.endDate}', ${input.amount}, 'pending')
        `);
        return { success: true, id: result?.[0]?.insertId };
      } catch (error) {
        console.error("[Memberships] Error creating:", error);
        throw error;
      }
    }),

  recordContribution: protectedProcedure
    .input(
      z.object({
        memberId: z.number(),
        amount: z.number(),
        contributionDate: z.string(),
        paymentMethod: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const result = await (db as any).$client.query(`
          INSERT INTO contributions (memberId, amount, contributionDate, paymentMethod, status)
          VALUES (${input.memberId}, ${input.amount}, '${input.contributionDate}', '${input.paymentMethod || ""}', 'completed')
        `);
        return { success: true, id: result?.[0]?.insertId };
      } catch (error) {
        console.error("[Memberships] Error recording contribution:", error);
        throw error;
      }
    }),
});
