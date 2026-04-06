import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Parse the DATABASE_URL to extract SSL configuration
const url = new URL(connectionString);
const sslParam = url.searchParams.get("ssl");
const sslConfig = sslParam === "true" ? { rejectUnauthorized: false } : undefined;

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
    // Conditionally add SSL configuration
    ...(sslConfig ? { ssl: sslConfig } : {}),
  },
});
