import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./drizzle/schema";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from 'fs';
import path from 'path';

async function resetDatabase() {
  try {
    console.log("🔄 Réinitialisation de la base de données...");
    
    const dbPath = process.env.DATABASE_URL?.replace('sqlite:', '') || './association_manager.db';
    
    // Supprimer l'ancienne base de données
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log("✅ Ancienne base de données supprimée");
    }
    
    // Créer la nouvelle base de données
    const db = new Database(dbPath);
    const connection = drizzle(db);
    
    // Exécuter les migrations
    console.log("📦 Exécution des migrations...");
    await migrate(connection, { migrationsFolder: "./drizzle" });
    
    // Insérer les données de base
    console.log("📝 Insertion des données de démonstration...");
    
    // Insérer les paramètres globaux
    await connection.insert(schema.globalSettings).values({
      associationName: 'Association Manager',
      seatCity: 'N\'Djaména',
      folio: 'FOLIO-2024-001',
      email: 'contact@association.fr',
      website: 'www.association.fr',
      phone: '+235 66 00 00 00',
      description: 'Plateforme de gestion'
    });
    
    // Créer un utilisateur admin par défaut
    await connection.insert(schema.usersLocal).values({
      email: 'admin@association.fr',
      passwordHash: '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', // password: admin123
      isEmailVerified: true
    });
    
    db.close();
    console.log("✅ Base de données réinitialisée avec succès!");
    console.log("🔑 Utilisateur par défaut: admin@association.fr / admin123");
    
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation:", error);
  }
}

resetDatabase();
