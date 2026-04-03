/**
 * Zod schemas for data validation
 * Used in tRPC procedures to validate inputs
 */

import { z } from "zod";

// ============ FINANCIAL SCHEMAS ============

/**
 * Montant - monetary amount validation
 * Accepts numbers and strings that can be parsed as decimal
 */
export const montantSchema = z
  .union([z.number(), z.string()])
  .refine((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return !isNaN(num) && num >= 0;
  }, "Montant doit être un nombre positif")
  .transform((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return Math.round(num * 100) / 100; // Round to 2 decimal places
  });

// ============ COTISATIONS SCHEMAS ============

export const createCotisationSchema = z.object({
  memberId: z.number().int().positive(),
  montant: montantSchema,
  dateDebut: z.date().or(z.string().datetime()),
  dateFin: z.date().or(z.string().datetime()),
  notes: z.string().optional(),
}).refine(
  (data) => {
    const debut = typeof data.dateDebut === "string" ? new Date(data.dateDebut) : data.dateDebut;
    const fin = typeof data.dateFin === "string" ? new Date(data.dateFin) : data.dateFin;
    return fin > debut;
  },
  { message: "La date de fin doit être après la date de début", path: ["dateFin"] }
);

export const updateCotisationSchema = z.object({
  id: z.number().int().positive(),
  montant: montantSchema.optional(),
  dateDebut: z.date().or(z.string().datetime()).optional(),
  dateFin: z.date().or(z.string().datetime()).optional(),
  statut: z.enum(["payée", "en attente", "en retard"]).optional(),
  datePayment: z.date().or(z.string().datetime()).optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (!data.dateDebut || !data.dateFin) return true;
    const debut = typeof data.dateDebut === "string" ? new Date(data.dateDebut) : data.dateDebut;
    const fin = typeof data.dateFin === "string" ? new Date(data.dateFin) : data.dateFin;
    return fin > debut;
  },
  { message: "La date de fin doit être après la date de début", path: ["dateFin"] }
);

export const listCotisationsSchema = z.object({
  memberId: z.number().int().positive().optional(),
  statut: z.enum(["payée", "en attente", "en retard"]).optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// ============ DONS SCHEMAS ============

export const createDonSchema = z.object({
  donateur: z.string().min(1, "Le nom du donateur est requis"),
  montant: montantSchema,
  description: z.string().optional(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  date: z.date().or(z.string().datetime()).optional(),
});

export const listDonsSchema = z.object({
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
  startDate: z.date().or(z.string().datetime()).optional(),
  endDate: z.date().or(z.string().datetime()).optional(),
});

// ============ DEPENSES SCHEMAS ============

export const createDepenseSchema = z.object({
  description: z.string().min(1, "La description est requise"),
  montant: montantSchema,
  categorie: z.string().min(1, "La catégorie est requise"),
  date: z.date().or(z.string().datetime()).optional(),
  approuvePar: z.number().int().positive().optional(),
  notes: z.string().optional(),
  pieceJointe: z.string().optional(),
});

export const listDepensesSchema = z.object({
  categorie: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
  startDate: z.date().or(z.string().datetime()).optional(),
  endDate: z.date().or(z.string().datetime()).optional(),
});

// ============ DOCUMENTS SCHEMAS ============

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  description: z.string().optional(),
  categoryId: z.number().int().positive(),
  status: z.enum(["pending", "in-progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.date().or(z.string().datetime()).optional(),
  fileUrl: z.string().url().optional(),
  fileKey: z.string().optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().int().nonnegative().optional(),
});

export const updateDocumentSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  status: z.enum(["pending", "in-progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.date().or(z.string().datetime()).optional(),
});

export const listDocumentsSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  status: z.enum(["pending", "in-progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
  isArchived: z.boolean().optional(),
});

// ============ MEMBERS SCHEMAS ============

export const createMemberSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  function: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
});

export const updateMemberSchema = z.object({
  id: z.number().int().positive(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  function: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
});

export const listMembersSchema = z.object({
  status: z.enum(["active", "inactive", "pending"]).optional(),
  role: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
});

// ============ CATEGORIES SCHEMAS ============

export const createCategorySchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

// ============ PAGINATION SCHEMAS ============

export const paginationSchema = z.object({
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// ============ RESPONSE SCHEMAS ============

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
  });

export type CreateCotisationInput = z.infer<typeof createCotisationSchema>;
export type UpdateCotisationInput = z.infer<typeof updateCotisationSchema>;
export type ListCotisationsInput = z.infer<typeof listCotisationsSchema>;

export type CreateDonInput = z.infer<typeof createDonSchema>;
export type ListDonsInput = z.infer<typeof listDonsSchema>;

export type CreateDepenseInput = z.infer<typeof createDepenseSchema>;
export type ListDepensesInput = z.infer<typeof listDepensesSchema>;

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type ListDocumentsInput = z.infer<typeof listDocumentsSchema>;

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type ListMembersInput = z.infer<typeof listMembersSchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
