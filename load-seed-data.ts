import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./drizzle/schema";
import Database from "better-sqlite3";

async function seedData() {
  try {
    console.log("Chargement des données de démonstration...");
    
    const db = new Database(process.env.DATABASE_URL!.replace('sqlite:', ''));
    const connection = drizzle(db);
    
    // Insérer les catégories
    await connection.insert(schema.categories).values([
      { name: 'Légal', slug: 'legal', description: 'Documents légaux et statuts', color: '#e74c3c', icon: 'file-text', sortOrder: 1 },
      { name: 'Gouvernance', slug: 'governance', description: 'Procès-verbaux et assemblées', color: '#3498db', icon: 'users', sortOrder: 2 },
      { name: 'Financier', slug: 'financial', description: 'Rapports financiers et budgets', color: '#2ecc71', icon: 'dollar-sign', sortOrder: 3 },
      { name: 'Projets', slug: 'projects', description: 'Plans et rapports de projets', color: '#f39c12', icon: 'briefcase', sortOrder: 4 }
    ]).onConflictDoNothing();
    console.log("✓ Catégories chargées");

    // Insérer les membres
    await connection.insert(schema.members).values([
      { firstName: 'Ousmane', lastName: 'Mahamat', email: 'ousmane@association.fr', phone: '+235 66 00 11 22', role: 'Président', function: 'Direction', status: 'active' },
      { firstName: 'Aïcha', lastName: 'Abdoulaye', email: 'aicha@association.fr', phone: '+235 62 22 33 44', role: 'Trésorier', function: 'Finances', status: 'active' },
      { firstName: 'Khalil', lastName: 'Hassan', email: 'khalil@association.fr', phone: '+235 61 33 44 55', role: 'Secrétaire', function: 'Administration', status: 'active' },
      { firstName: 'Zainab', lastName: 'Ibrahim', email: 'zainab@association.fr', phone: '+235 65 44 55 66', role: 'Membre', function: 'Bénévole', status: 'active' }
    ]).onConflictDoNothing();
    console.log("✓ Membres chargés");

    // Insérer les contacts CRM
    await connection.insert(schema.crmContacts).values([
      { firstName: 'Mahamat', lastName: 'Alamine', email: 'mahamat@mairie.td', phone: '+235 66 12 34 56', company: 'Mairie de N\'Djaména', position: 'Adjoint', source: 'official', status: 'active' },
      { firstName: 'Fatima', lastName: 'Hassan', email: 'fatima@minplan.td', phone: '+235 62 45 67 89', company: 'Ministère du Plan', position: 'Responsable', source: 'official', status: 'active' }
    ]).onConflictDoNothing();
    console.log("✓ Contacts CRM chargés");

    // Insérer les paramètres globaux
    await connection.insert(schema.globalSettings).values({
      associationName: 'Association Manager',
      seatCity: 'N\'Djaména',
      folio: 'FOLIO-2024-001',
      email: 'contact@association.fr',
      website: 'www.association.fr',
      phone: '+235 66 00 00 00',
      description: 'Plateforme de gestion'
    }).onConflictDoNothing();
    console.log("✓ Paramètres globaux chargés");

    db.close();
    console.log("\n✅ Données de démonstration chargées avec succès!");
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

seedData();
