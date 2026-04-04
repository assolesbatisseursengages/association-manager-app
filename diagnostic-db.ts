import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

async function diagnosticDatabase() {
  try {
    console.log("🔍 Diagnostic de la base de données SQLite...");
    
    const dbPath = process.env.DATABASE_URL?.replace('sqlite:', '') || './association_manager.db';
    console.log(`📍 Chemin de la base de données: ${dbPath}`);
    
    // Vérifier si le fichier existe
    const exists = fs.existsSync(dbPath);
    console.log(`📁 Fichier de base de données existe: ${exists}`);
    
    if (exists) {
      const stats = fs.statSync(dbPath);
      console.log(`📊 Taille du fichier: ${stats.size} bytes`);
      console.log(`📅 Modifié le: ${stats.mtime}`);
    }
    
    // Tenter de se connecter
    console.log("🔌 Tentative de connexion...");
    const db = new Database(dbPath);
    console.log("✅ Connexion réussie!");
    
    // Lister les tables
    console.log("📋 Tables disponibles:");
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    tables.forEach((table: any) => {
      console.log(`  - ${table.name}`);
    });
    
    // Vérifier les tables essentielles
    const essentialTables = ['users_local', 'global_settings', 'categories'];
    for (const table of essentialTables) {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as any;
      console.log(`📊 ${table}: ${count.count} enregistrements`);
    }
    
    db.close();
    console.log("✅ Diagnostic terminé avec succès!");
    
  } catch (error) {
    console.error("❌ Erreur lors du diagnostic:", error);
  }
}

diagnosticDatabase();
