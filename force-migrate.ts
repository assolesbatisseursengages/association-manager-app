import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './drizzle/schema';
import { migrate } from 'drizzle-orm/mysql2/migrator';

async function forceMigrate() {
  try {
    console.log("🔄 Migration forcée de la base de données...");
    
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL n'est pas défini");
    }
    
    const connection = await mysql.createConnection(connectionString);
    const db = drizzle(connection);
    
    console.log("📦 Exécution des migrations...");
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log("✅ Migration terminée !");
    
    // Vérifier les tables
    const [tables] = await connection.execute("SHOW TABLES");
    console.log(`📋 Tables créées: ${(tables as any[]).length}`);
    (tables as any[]).forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    console.log("✅ Base de données prête !");
    
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
  }
}

forceMigrate();
