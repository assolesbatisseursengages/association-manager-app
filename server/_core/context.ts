import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
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
    // Try local session token from header first
    const headerToken = opts.req.headers["x-session-token"];
    const token = Array.isArray(headerToken) ? headerToken[0] : headerToken;

    if (token) {
      const session = await db.getUserSessionByToken(token);
      if (session) {
        const database = await db.getDb();
        if (database) {
          const rows = await database
            .select()
            .from(users)
            .where(eq(users.id, session.userId))
            .limit(1);
          user = rows[0] ?? null;
        }
      }
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
