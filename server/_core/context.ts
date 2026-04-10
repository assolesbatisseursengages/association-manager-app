/**
 * CONTEXT tRPC UNIFIÉ
 *
 * Lit le token depuis :
 * 1. Header x-session-token (envoyé par main.tsx via localStorage)
 * 2. Cookie session_token (fallback HttpOnly)
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
    // 1. Header x-session-token (priorité — envoyé par le frontend)
    let token: string | undefined =
      opts.req.headers["x-session-token"] as string | undefined;

    // 2. Fallback cookie session_token
    if (!token) {
      const cookieHeader = opts.req.headers.cookie ?? "";
      const match = cookieHeader.match(/session_token=([^;]+)/);
      token = match?.[1];
    }

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