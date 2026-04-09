import { eq, and, like, desc, asc, sql, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { 
  InsertUser, users, 
  categories, InsertCategory, Category,
  documents, InsertDocument, Document,
  documentNotes, InsertDocumentNote,
  members, InsertMember,
  documentPermissions, InsertDocumentPermission,
  activityLogs, InsertActivityLog,
  cotisations, InsertCotisation,
  dons, InsertDon,
  depenses, InsertDepense,
  transactions, InsertTransaction,
  emailTemplates, InsertEmailTemplate, EmailTemplate,
  emailHistory, InsertEmailHistory, EmailHistory,
  emailRecipients, InsertEmailRecipient, EmailRecipient,
  appSettings, InsertAppSetting, AppSetting,
  crmContacts, InsertCrmContact, CrmContact,
  crmActivities, InsertCrmActivity, CrmActivity,
  adhesionPipeline, InsertAdhesionPipeline, AdhesionPipeline,
  crmReports, InsertCrmReport, CrmReport,
  crmEmailIntegration, InsertCrmEmailIntegration, CrmEmailIntegration,
  globalSettings, InsertGlobalSettings, GlobalSettings,
  usersLocal, InsertUserLocal, UserLocal,
  userSessions, InsertUserSession, UserSession
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

const schema = {
  users,
  categories,
  documents,
  documentNotes,
  members,
  documentPermissions,
  activityLogs,
  cotisations,
  dons,
  depenses,
  transactions,
  emailTemplates,
  emailHistory,
  emailRecipients,
  appSettings,
  crmContacts,
  crmActivities,
  adhesionPipeline,
  crmReports,
  crmEmailIntegration,
  usersLocal,
  userSessions,
  globalSettings
};

export async function getDb() {
  if (_db) return _db;

  if (process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL!, { schema, mode: 'default' }) as any;
      console.log("[Database] Connected successfully");
      return _db;
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return null;
}

// ============ USER FUNCTIONS ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ CATEGORY FUNCTIONS ============
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0];
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(data);
  return { id: result[0].insertId, ...data };
}

export async function seedDefaultCategories() {
  const db = await getDb();
  if (!db) return;
  try {
    const existing = await db.select().from(categories);
    if (existing.length > 0) return;
  } catch (error) {
    console.warn("[Database] Error checking categories:", error);
    return;
  }
  const defaultCategories: InsertCategory[] = [
    { name: "Documents Juridiques", slug: "juridique", description: "Statuts, règlements, autorisations", color: "#e76f51", icon: "scale", sortOrder: 1 },
    { name: "Gouvernance et Pilotage", slug: "gouvernance", description: "Feuille de route, organigramme, PV", color: "#2d7a4f", icon: "users", sortOrder: 2 },
    { name: "Documents Opérationnels", slug: "operationnel", description: "Projets, rapports, planning", color: "#f4a261", icon: "clipboard", sortOrder: 3 },
    { name: "Documents Financiers", slug: "financier", description: "Budget, comptabilité, audits", color: "#264653", icon: "wallet", sortOrder: 4 },
    { name: "Ressources Humaines", slug: "rh", description: "Membres, bénévoles, contrats", color: "#9c89b8", icon: "user-check", sortOrder: 5 },
    { name: "Communication", slug: "communication", description: "Logo, brochures, réseaux sociaux", color: "#00b4d8", icon: "megaphone", sortOrder: 6 },
    { name: "Financement", slug: "financement", description: "Demandes, partenariats, subventions", color: "#e9c46a", icon: "hand-coins", sortOrder: 7 },
  ];
  await db.insert(categories).values(defaultCategories);
}

// ============ DOCUMENT FUNCTIONS ============
export async function getAllDocuments(filters?: {
  categoryId?: number;
  status?: string;
  priority?: string;
  search?: string;
  isArchived?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.categoryId) conditions.push(eq(documents.categoryId, filters.categoryId));
  if (filters?.status) conditions.push(eq(documents.status, filters.status as "pending" | "in-progress" | "completed"));
  if (filters?.priority) conditions.push(eq(documents.priority, filters.priority as "low" | "medium" | "high" | "urgent"));
  if (filters?.search) conditions.push(or(like(documents.title, `%${filters.search}%`), like(documents.description, `%${filters.search}%`)));
  if (filters?.isArchived !== undefined) conditions.push(eq(documents.isArchived, filters.isArchived));
  else conditions.push(eq(documents.isArchived, false));

  if (conditions.length > 0) return db.select().from(documents).where(and(...conditions)).orderBy(desc(documents.updatedAt));
  return db.select().from(documents).where(eq(documents.isArchived, false)).orderBy(desc(documents.updatedAt));
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return result[0];
}

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documents).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateDocument(id: number, data: Partial<InsertDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(documents).set(data).where(eq(documents.id, id));
  return getDocumentById(id);
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documents).where(eq(documents.id, id));
}

export async function getDocumentStats() {
  const db = await getDb();
  if (!db) return { total: 0, completed: 0, inProgress: 0, pending: 0, urgent: 0 };

  const [stats] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      completed: sql<number>`COUNT(CASE WHEN ${documents.status} = 'completed' THEN 1 END)`,
      inProgress: sql<number>`COUNT(CASE WHEN ${documents.status} = 'in-progress' THEN 1 END)`,
      pending: sql<number>`COUNT(CASE WHEN ${documents.status} = 'pending' THEN 1 END)`,
      urgent: sql<number>`COUNT(CASE WHEN ${documents.priority} = 'urgent' THEN 1 END)`,
    })
    .from(documents)
    .where(eq(documents.isArchived, false));

  return {
    total: Number(stats?.total ?? 0),
    completed: Number(stats?.completed ?? 0),
    inProgress: Number(stats?.inProgress ?? 0),
    pending: Number(stats?.pending ?? 0),
    urgent: Number(stats?.urgent ?? 0),
  };
}

export async function seedDefaultDocuments() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(documents).limit(1);
  if (existing.length > 0) return;
  const cats = await getAllCategories();
  if (cats.length === 0) return;
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));
  const defaultDocs: InsertDocument[] = [
    { title: "Statuts de l'association", description: "Version validée et conforme", categoryId: catMap["juridique"], priority: "urgent", status: "pending" },
    { title: "Règlement intérieur", description: "Règles de fonctionnement interne", categoryId: catMap["juridique"], priority: "urgent", status: "pending" },
    { title: "Autorisation de fonctionner", description: "Ministère de l'Intérieur", categoryId: catMap["juridique"], priority: "urgent", status: "pending" },
    { title: "PV de l'AG constitutive", description: "Procès-verbal de création", categoryId: catMap["juridique"], priority: "high", status: "pending" },
    { title: "Liste du Bureau Exécutif", description: "Noms, fonctions et contacts", categoryId: catMap["juridique"], priority: "high", status: "pending" },
    { title: "Feuille de route stratégique", description: "Vision 1-3 ans", categoryId: catMap["gouvernance"], priority: "urgent", status: "pending" },
    { title: "Plan d'actions annuel", description: "Actions de l'année", categoryId: catMap["gouvernance"], priority: "urgent", status: "pending" },
    { title: "Organigramme", description: "Structure organisationnelle", categoryId: catMap["gouvernance"], priority: "urgent", status: "pending" },
    { title: "Fiches de fonctions", description: "Rôles et responsabilités", categoryId: catMap["gouvernance"], priority: "high", status: "pending" },
    { title: "Note institutionnelle", description: "Présentation 2-3 pages", categoryId: catMap["operationnel"], priority: "urgent", status: "pending" },
    { title: "Portfolio des projets", description: "Projets réalisés", categoryId: catMap["operationnel"], priority: "urgent", status: "pending" },
    { title: "Budget annuel", description: "Budget de fonctionnement", categoryId: catMap["financier"], priority: "urgent", status: "pending" },
    { title: "Registre des membres", description: "Liste complète des membres", categoryId: catMap["rh"], priority: "high", status: "pending" },
    { title: "Logo officiel", description: "Identité visuelle", categoryId: catMap["communication"], priority: "high", status: "pending" },
    { title: "Dossier de demande de financement", description: "Template pour bailleurs", categoryId: catMap["financement"], priority: "urgent", status: "pending" },
  ];
  await db.insert(documents).values(defaultDocs);
}

// ============ NOTES FUNCTIONS ============
export async function getNotesByDocumentId(documentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documentNotes).where(eq(documentNotes.documentId, documentId)).orderBy(desc(documentNotes.createdAt));
}

export async function createNote(data: InsertDocumentNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documentNotes).values(data);
  return { id: result[0].insertId, ...data };
}

export async function deleteNote(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documentNotes).where(eq(documentNotes.id, id));
}

// ============ MEMBERS FUNCTIONS ============
export async function getAllMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(members).orderBy(asc(members.lastName));
}

export async function getMemberById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
  return result[0];
}

export async function createMember(data: InsertMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(members).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateMember(id: number, data: Partial<InsertMember>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(members).set(data).where(eq(members.id, id));
  return getMemberById(id);
}

export async function deleteMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(members).where(eq(members.id, id));
}

// ============ ACTIVITY LOG FUNCTIONS ============
export async function logActivity(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(data);
}

export async function getRecentActivity(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

// ============ COTISATIONS ============
export async function createCotisation(data: InsertCotisation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(cotisations).values(data);
}

export async function getCotisations() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(cotisations);
}

export async function getCotisationsByMember(memberId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(cotisations).where(eq(cotisations.memberId, memberId));
}

export async function updateCotisation(id: number, data: Partial<InsertCotisation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(cotisations).set(data).where(eq(cotisations.id, id));
}

// ============ DONS ============
export async function createDon(data: InsertDon) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(dons).values(data);
}

export async function getDons() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(dons);
}

// ============ DÉPENSES ============
export async function createDepense(data: InsertDepense) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(depenses).values(data);
}

export async function getDepenses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(depenses);
}

// ============ TRANSACTIONS ============
export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(transactions).values(data);
}

export async function getTransactions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(transactions);
}

// ============ STATISTIQUES FINANCIÈRES — SQL SUM (plus de reduce JS) ============
export async function getFinancialStats() {
  const db = await getDb();
  if (!db) return null;

  const [cotisationsStats] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${cotisations.montant}), 0)`,
      payees: sql<number>`COUNT(CASE WHEN ${cotisations.statut} = 'payée' THEN 1 END)`,
      enAttente: sql<number>`COUNT(CASE WHEN ${cotisations.statut} = 'en attente' THEN 1 END)`,
      enRetard: sql<number>`COUNT(CASE WHEN ${cotisations.statut} = 'en retard' THEN 1 END)`,
    })
    .from(cotisations);

  const [donsStats] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${dons.montant}), 0)`,
      nombre: sql<number>`COUNT(*)`,
    })
    .from(dons);

  const [depensesStats] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${depenses.montant}), 0)`,
      nombre: sql<number>`COUNT(*)`,
    })
    .from(depenses);

  const totalCotisations = Number(cotisationsStats?.total ?? 0);
  const totalDons = Number(donsStats?.total ?? 0);
  const totalDepenses = Number(depensesStats?.total ?? 0);

  return {
    totalCotisations,
    totalDons,
    totalDepenses,
    solde: totalCotisations + totalDons - totalDepenses,
    cotisationsPayees: Number(cotisationsStats?.payees ?? 0),
    cotisationsEnAttente: Number(cotisationsStats?.enAttente ?? 0),
    cotisationsEnRetard: Number(cotisationsStats?.enRetard ?? 0),
    nombreDons: Number(donsStats?.nombre ?? 0),
    nombreDepenses: Number(depensesStats?.nombre ?? 0),
  };
}

// ============ EMAIL TEMPLATES ============
export async function getEmailTemplates() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
}

export async function getEmailTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
  return result[0];
}

export async function createEmailTemplate(data: InsertEmailTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailTemplates).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateEmailTemplate(id: number, data: Partial<InsertEmailTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(emailTemplates).set(data).where(eq(emailTemplates.id, id));
  return getEmailTemplateById(id);
}

export async function deleteEmailTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
}

// ============ EMAIL HISTORY ============
export async function getEmailHistory(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(emailHistory).orderBy(desc(emailHistory.createdAt)).limit(limit);
}

export async function getEmailHistoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(emailHistory).where(eq(emailHistory.id, id)).limit(1);
  return result[0];
}

export async function createEmailHistory(data: InsertEmailHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailHistory).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateEmailHistory(id: number, data: Partial<InsertEmailHistory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(emailHistory).set(data).where(eq(emailHistory.id, id));
  return getEmailHistoryById(id);
}

// ============ EMAIL RECIPIENTS ============
export async function getEmailRecipients(emailHistoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(emailRecipients).where(eq(emailRecipients.emailHistoryId, emailHistoryId));
}

export async function createEmailRecipient(data: InsertEmailRecipient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailRecipients).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateEmailRecipient(id: number, data: Partial<InsertEmailRecipient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(emailRecipients).set(data).where(eq(emailRecipients.id, id));
}

// ============ APP SETTINGS ============
export async function getAppSetting(key: string): Promise<AppSetting | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
  return result[0];
}

export async function getAllAppSettings(): Promise<AppSetting[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(appSettings);
}

export async function updateAppSetting(key: string, value: string, updatedBy: number, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getAppSetting(key);
  if (existing) {
    await db.update(appSettings).set({ value, description, updatedBy, updatedAt: new Date() }).where(eq(appSettings.key, key));
    return getAppSetting(key);
  } else {
    const result = await db.insert(appSettings).values({ key, value, description, type: "string", updatedBy });
    return { id: result[0].insertId, key, value, description, type: "string", updatedBy, updatedAt: new Date(), createdAt: new Date() };
  }
}

export async function deleteAppSetting(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(appSettings).where(eq(appSettings.key, key));
}

// ============ CRM CONTACTS FUNCTIONS ============
export async function createCrmContact(data: InsertCrmContact): Promise<CrmContact> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(crmContacts).values(data);
  const contact = await db.select().from(crmContacts).where(eq(crmContacts.id, result[0].insertId)).limit(1);
  return contact[0] as CrmContact;
}

export async function getCrmContact(id: number): Promise<CrmContact | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(crmContacts).where(eq(crmContacts.id, id)).limit(1);
  return result[0];
}

export async function listCrmContacts(filters?: { segment?: string; status?: string; search?: string }): Promise<CrmContact[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];
  if (filters?.segment) conditions.push(eq(crmContacts.segment, filters.segment));
  if (filters?.status) conditions.push(eq(crmContacts.status, filters.status as "prospect" | "active" | "inactive" | "archived"));
  if (filters?.search) {
    const term = `%${filters.search}%`;
    conditions.push(or(
      like(crmContacts.firstName, term),
      like(crmContacts.lastName, term),
      like(crmContacts.email, term),
      like(crmContacts.company, term),
    ));
  }

  const query = db.select().from(crmContacts);
  if (conditions.length > 0) return query.where(and(...conditions)) as Promise<CrmContact[]>;
  return query as Promise<CrmContact[]>;
}

export async function updateCrmContact(id: number, data: Partial<InsertCrmContact>): Promise<CrmContact> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(crmContacts).set({ ...data, updatedAt: new Date() }).where(eq(crmContacts.id, id));
  const result = await db.select().from(crmContacts).where(eq(crmContacts.id, id)).limit(1);
  return result[0] as CrmContact;
}

export async function deleteCrmContact(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(crmContacts).where(eq(crmContacts.id, id));
}

// ============ CRM ACTIVITIES FUNCTIONS ============
export async function createCrmActivity(data: InsertCrmActivity): Promise<CrmActivity> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(crmActivities).values(data);
  const activity = await db.select().from(crmActivities).where(eq(crmActivities.id, result[0].insertId)).limit(1);
  return activity[0] as CrmActivity;
}

export async function listCrmActivities(contactId: number): Promise<CrmActivity[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(crmActivities).where(eq(crmActivities.contactId, contactId)) as Promise<CrmActivity[]>;
}

export async function updateCrmActivity(id: number, data: Partial<InsertCrmActivity>): Promise<CrmActivity> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(crmActivities).set({ ...data, updatedAt: new Date() }).where(eq(crmActivities.id, id));
  const result = await db.select().from(crmActivities).where(eq(crmActivities.id, id)).limit(1);
  return result[0] as CrmActivity;
}

export async function deleteCrmActivity(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(crmActivities).where(eq(crmActivities.id, id));
}

// ============ ADHESION PIPELINE FUNCTIONS ============
export async function createAdhesionPipeline(data: InsertAdhesionPipeline): Promise<AdhesionPipeline> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(adhesionPipeline).values(data);
  const pipeline = await db.select().from(adhesionPipeline).where(eq(adhesionPipeline.id, result[0].insertId)).limit(1);
  return pipeline[0] as AdhesionPipeline;
}

export async function updateAdhesionPipeline(id: number, data: Partial<InsertAdhesionPipeline>): Promise<AdhesionPipeline> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adhesionPipeline).set({ ...data, updatedAt: new Date() }).where(eq(adhesionPipeline.id, id));
  const result = await db.select().from(adhesionPipeline).where(eq(adhesionPipeline.id, id)).limit(1);
  return result[0] as AdhesionPipeline;
}

export async function listAdhesionPipeline(stage?: string): Promise<AdhesionPipeline[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (stage) {
    return db.select().from(adhesionPipeline)
      .where(eq(adhesionPipeline.stage, stage as "inquiry" | "application" | "review" | "approved" | "rejected" | "member")) as Promise<AdhesionPipeline[]>;
  }
  return db.select().from(adhesionPipeline) as Promise<AdhesionPipeline[]>;
}

// ============ CRM REPORTS FUNCTIONS ============
export async function createCrmReport(data: InsertCrmReport): Promise<CrmReport> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(crmReports).values(data);
  const report = await db.select().from(crmReports).where(eq(crmReports.id, result[0].insertId)).limit(1);
  return report[0] as CrmReport;
}

export async function listCrmReports(type?: string): Promise<CrmReport[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (type) {
    return db.select().from(crmReports)
      .where(eq(crmReports.type, type as "engagement" | "pipeline" | "activity" | "segment" | "custom")) as Promise<CrmReport[]>;
  }
  return db.select().from(crmReports) as Promise<CrmReport[]>;
}

// ============ CRM EMAIL INTEGRATION FUNCTIONS ============
export async function createCrmEmailIntegration(data: InsertCrmEmailIntegration): Promise<CrmEmailIntegration> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(crmEmailIntegration).values(data);
  const email = await db.select().from(crmEmailIntegration).where(eq(crmEmailIntegration.id, result[0].insertId)).limit(1);
  return email[0] as CrmEmailIntegration;
}

export async function listCrmEmailIntegration(contactId: number): Promise<CrmEmailIntegration[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(crmEmailIntegration).where(eq(crmEmailIntegration.contactId, contactId)) as Promise<CrmEmailIntegration[]>;
}

// ============ GLOBAL SETTINGS ============
export async function getGlobalSettings() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(globalSettings).limit(1);
  return result[0];
}

export async function updateGlobalSettings(data: Partial<InsertGlobalSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getGlobalSettings();
  if (existing) {
    await db.update(globalSettings).set(data).where(eq(globalSettings.id, existing.id));
    return getGlobalSettings();
  } else {
    await db.insert(globalSettings).values(data as InsertGlobalSettings);
    return getGlobalSettings();
  }
}

export async function initializeGlobalSettings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getGlobalSettings();
  if (!existing) {
    await db.insert(globalSettings).values({
      associationName: "Les Bâtisseurs Engagés",
      seatCity: "Siège Social",
      folio: "0001",
      email: "contact@association.fr",
      website: "www.association.fr",
      phone: "",
      logo: null,
      description: "",
    });
  }
  return getGlobalSettings();
}

// ============ INIT ADMIN ============
export async function initializeDefaultAdmin() {
  const db = await getDb();
  if (!db) return;
  try {
    const existing = await getLocalUserByEmail("admin@association.fr");
    if (existing) return;
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.default.hash("Admin123!", 10);
    const localUser = await createLocalUser("admin@association.fr", hashedPassword);
    await db.update(users).set({ role: "admin" }).where(eq(users.id, localUser.userId));
    console.log("[Database] Default admin user created: admin@association.fr");
  } catch (error) {
    console.warn("[Database] Failed to create default admin:", error);
  }
}

// ============ LOCAL AUTH FUNCTIONS ============
export async function createLocalUser(email: string, passwordHash: string, userId?: number): Promise<UserLocal> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    let actualUserId = userId;
    if (!actualUserId) {
      const result = await db.insert(users).values({
        openId: `local_${email}_${Date.now()}`,
        email,
        loginMethod: "local",
        name: email.split("@")[0],
      });
      actualUserId = result[0].insertId as number;
    }
    const result = await db.insert(usersLocal).values({
      userId: actualUserId,
      email,
      passwordHash,
      isEmailVerified: false,
    });
    return {
      id: result[0].insertId as number,
      userId: actualUserId,
      email,
      passwordHash,
      isEmailVerified: false,
      emailVerificationToken: null,
      emailVerificationTokenExpiry: null,
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("[Database] Error creating local user:", error);
    throw error;
  }
}

export async function getLocalUserByEmail(email: string): Promise<UserLocal | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.select().from(usersLocal).where(eq(usersLocal.email, email)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting local user:", error);
    throw error;
  }
}

export async function getLocalUserByUserId(userId: number): Promise<UserLocal | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.select().from(usersLocal).where(eq(usersLocal.userId, userId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting local user by userId:", error);
    throw error;
  }
}

export async function updateLocalUserPassword(userId: number, newPasswordHash: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(usersLocal).set({
      passwordHash: newPasswordHash,
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
    }).where(eq(usersLocal.userId, userId));
  } catch (error) {
    console.error("[Database] Error updating password:", error);
    throw error;
  }
}

export async function updateLastLoginTime(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(usersLocal).set({ lastLoginAt: new Date() }).where(eq(usersLocal.userId, userId));
  } catch (error) {
    console.error("[Database] Error updating last login:", error);
    throw error;
  }
}

export async function createUserSession(userId: number, token: string, userAgent?: string, ipAddress?: string): Promise<UserSession> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const result = await db.insert(userSessions).values({
      userId, token,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      expiresAt,
    });
    return {
      id: result[0].insertId as number,
      userId, token,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      expiresAt,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("[Database] Error creating session:", error);
    throw error;
  }
}

export async function getUserSessionByToken(token: string): Promise<UserSession | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.select().from(userSessions).where(
      and(eq(userSessions.token, token), sql`${userSessions.expiresAt} > NOW()`)
    ).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting session:", error);
    throw error;
  }
}

export async function deleteUserSession(token: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(userSessions).where(eq(userSessions.token, token));
  } catch (error) {
    console.error("[Database] Error deleting session:", error);
    throw error;
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(userSessions).where(sql`${userSessions.expiresAt} < NOW()`);
  } catch (error) {
    console.error("[Database] Error cleaning up sessions:", error);
    throw error;
  }
}