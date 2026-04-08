import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
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

  // 1. Essai OAuth Manus (cookie de session)
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    user = null;
  }

  // 2. Fallback : session locale via header Authorization ou cookie session_token
  if (!user) {
    try {
      // Chercher le token dans le header Authorization: Bearer <token>
      // ou dans le cookie session_token (posé par le frontend au login)
      let sessionToken: string | undefined;

      const authHeader = opts.req.headers["authorization"];
      if (authHeader?.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }

      if (!sessionToken) {
        // Cookie posé par le frontend : document.cookie = "session_token=xxx"
        const cookieHeader = opts.req.headers.cookie ?? "";
        const match = cookieHeader.match(/session_token=([^;]+)/);
        if (match) sessionToken = match[1];
      }

      if (sessionToken) {
        const session = await getUserSessionByToken(sessionToken);
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
      console.error("[Auth] Local session fallback error:", error);
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
