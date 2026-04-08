/**
 * CONTEXT tRPC UNIFIÉ
 *
 * Authentification : cookie HttpOnly session_token uniquement.
 * Plus de fallback OAuth ni de localStorage.
 * Le cookie est posé par auth.login / auth.register (HttpOnly, SameSite=Lax).
 */

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserSessionByToken, getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const cookieHeader = opts.req.headers.cookie ?? "";
    const match = cookieHeader.match(/session_token=([^;]+)/);
    const token = match?.[1];

    if (token) {
      const session = await getUserSessionByToken(token);
      if (session) {
        const db = await getDb();
        if (db) {
          const result = await db
            .select()
            .from(users)
            .where(eq(users.id, session.userId))
            .limit(1);
          user = result[0] ?? null;
        }
      }
    }
  } catch (error) {
    console.error("[Auth] Context error:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
