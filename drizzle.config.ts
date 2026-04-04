import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Détecter le type de base de données depuis l'URL
const isSQLite = connectionString.startsWith('sqlite:');
const isMySQL = connectionString.startsWith('mysql:');

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: isSQLite ? "sqlite" : "mysql",
  dbCredentials: isSQLite 
    ? { url: connectionString }
    : { url: connectionString },
});
