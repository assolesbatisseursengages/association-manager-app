import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema";

async function seedData() {
  try {
    console.log("Chargement des données de démonstration...");
    
    // Connexion à MySQL
    const connection = await mysql.createConnection({
      host: new URL(process.env.DATABASE_URL!).hostname,
      port: parseInt(new URL(process.env.DATABASE_URL!).port) || 3306,
      user: new URL(process.env.DATABASE_URL!).username,
      password: new URL(process.env.DATABASE_URL!).password,
      database: new URL(process.env.DATABASE_URL!).pathname.substring(1),
      ssl: { rejectUnauthorized: false }
    });
    
    const db = drizzle(connection, { schema, mode: 'planetscale' });
    
    // Insérer les catégories
    await db.insert(schema.categories).values([
      { name: 'Légal', slug: 'legal', description: 'Documents légaux et statuts', color: '#e74c3c', icon: 'file-text', sortOrder: 1 },
      { name: 'Gouvernance', slug: 'governance', description: 'Procès-verbaux et assemblées', color: '#3498db', icon: 'users', sortOrder: 2 },
      { name: 'Financier', slug: 'financial', description: 'Rapports financiers et budgets', color: '#2ecc71', icon: 'dollar-sign', sortOrder: 3 },
      { name: 'Projets', slug: 'projects', description: 'Plans et rapports de projets', color: '#f39c12', icon: 'briefcase', sortOrder: 4 }
    ]).onConflictDoNothing();
    console.log("✓ Catégories chargées");

    // Insérer les membres
    await db.insert(schema.members).values([
      { firstName: 'Ousmane', lastName: 'Mahamat', email: 'ousmane@association.fr', phone: '+235 66 00 11 22', role: 'Président', function: 'Direction', status: 'active' },
      { firstName: 'Aïcha', lastName: 'Abdoulaye', email: 'aicha@association.fr', phone: '+235 62 22 33 44', role: 'Trésorier', function: 'Finances', status: 'active' },
      { firstName: 'Khalil', lastName: 'Hassan', email: 'khalil@association.fr', phone: '+235 61 33 44 55', role: 'Secrétaire', function: 'Administration', status: 'active' },
      { firstName: 'Zainab', lastName: 'Ibrahim', email: 'zainab@association.fr', phone: '+235 65 44 55 66', role: 'Membre', function: 'Bénévole', status: 'active' }
    ]).onConflictDoNothing();
    console.log("✓ Membres chargés");

    // Insérer les contacts CRM
    await db.insert(schema.crmContacts).values([
      { firstName: 'Mahamat', lastName: 'Alamine', email: 'mahamat@mairie.td', phone: '+235 66 12 34 56', company: 'Mairie de N\'Djaména', position: 'Adjoint', source: 'official', status: 'active' },
      { firstName: 'Fatima', lastName: 'Hassan', email: 'fatima@minplan.td', phone: '+235 62 45 67 89', company: 'Ministère du Plan', position: 'Responsable', source: 'official', status: 'active' }
    ]).onConflictDoNothing();
    console.log("✓ Contacts CRM chargés");

    // Insérer les paramètres globaux
    await db.insert(schema.globalSettings).values({
      associationName: 'Association Manager',
      seatCity: 'N\'Djaména',
      folio: 'FOLIO-2024-001',
      email: 'contact@association.fr',
      website: 'www.association.fr',
      phone: '+235 66 00 00 00',
      description: 'Plateforme de gestion'
    }).onConflictDoNothing();
    console.log("✓ Paramètres globaux chargés");

    await connection.end();
    console.log("\n✅ Données de démonstration chargées avec succès!");
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

// seedData(); // Désactivé temporairement - cause des erreurs 500
