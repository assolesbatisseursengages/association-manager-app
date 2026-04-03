import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { memberGroups, members } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const memberGroupsRouter = router({
  // Lister tous les groupes
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(memberGroups).orderBy(desc(memberGroups.createdAt));
  }),

  // Obtenir un groupe par ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(memberGroups).where(eq(memberGroups.id, input.id)).limit(1);
      return result[0] || null;
    }),

  // Obtenir les membres d'un groupe
  getMembers: publicProcedure
    .input(z.object({ groupId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(members).where(eq(members.groupId, input.groupId)).orderBy(members.lastName);
    }),

  // Obtenir le responsable d'un groupe
  getResponsable: publicProcedure
    .input(z.object({ groupId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const groupData = await db.select().from(memberGroups).where(eq(memberGroups.id, input.groupId)).limit(1);
      if (!groupData[0] || !groupData[0].responsableMemberId) return null;

      const responsable = await db.select().from(members).where(eq(members.id, groupData[0].responsableMemberId)).limit(1);
      return responsable[0] || null;
    }),

  // Créer un nouveau groupe
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Le nom du groupe est requis"),
      slug: z.string().min(1),
      description: z.string().optional(),
      location: z.string().optional(),
      coordinatorId: z.number().optional(),
      responsableMemberId: z.number().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");

      const result = await db.insert(memberGroups).values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        location: input.location,
        coordinatorId: input.coordinatorId,
        responsableMemberId: input.responsableMemberId,
        email: input.email,
        phone: input.phone,
        status: "active",
      });

      return { id: (result as any).insertId || 0, ...input };
    }),

  // Mettre à jour un groupe
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      location: z.string().optional(),
      coordinatorId: z.number().optional(),
      responsableMemberId: z.number().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      status: z.enum(["active", "inactive"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");

      const { id, ...updateData } = input;
      await db.update(memberGroups).set(updateData).where(eq(memberGroups.id, id));
      return { success: true };
    }),

  // Supprimer un groupe
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");

      // Vérifier s'il y a des membres dans ce groupe
      const memberCount = await db.select().from(members).where(eq(members.groupId, input.id));
      if (memberCount.length > 0) {
        throw new Error("Impossible de supprimer un groupe avec des membres");
      }

      await db.delete(memberGroups).where(eq(memberGroups.id, input.id));
      return { success: true };
    }),

  // Obtenir les statistiques d'un groupe
  getStats: publicProcedure
    .input(z.object({ groupId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const groupData = await db.select().from(memberGroups).where(eq(memberGroups.id, input.groupId)).limit(1);
      if (!groupData[0]) return null;

      const groupMembers = await db.select().from(members).where(eq(members.groupId, input.groupId));
      const activeMembers = groupMembers.filter(m => m.status === "active").length;
      const inactiveMembers = groupMembers.filter(m => m.status === "inactive").length;

      // Obtenir les informations du responsable
      let responsable = null;
      if (groupData[0].responsableMemberId) {
        const responsableData = await db.select().from(members).where(eq(members.id, groupData[0].responsableMemberId)).limit(1);
        responsable = responsableData[0] || null;
      }

      return {
        group: groupData[0],
        responsable,
        totalMembers: groupMembers.length,
        activeMembers,
        inactiveMembers,
      };
    }),
});
