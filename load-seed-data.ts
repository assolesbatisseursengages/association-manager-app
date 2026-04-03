import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./drizzle/schema";
import mysql from "mysql2/promise";

async function seedData() {
  try {
    console.log("Chargement des données de démonstration...");
    
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    
    // Insérer les catégories
    await connection.execute(`
      INSERT IGNORE INTO categories (name, slug, description, color, icon, sortOrder, createdAt) VALUES
      ('Légal', 'legal', 'Documents légaux et statuts', '#e74c3c', 'file-text', 1, NOW()),
      ('Gouvernance', 'governance', 'Procès-verbaux et assemblées', '#3498db', 'users', 2, NOW()),
      ('Financier', 'financial', 'Rapports financiers et budgets', '#2ecc71', 'dollar-sign', 3, NOW()),
      ('Projets', 'projects', 'Plans et rapports de projets', '#f39c12', 'briefcase', 4, NOW())
    `);
    console.log("✓ Catégories chargées");

    // Insérer les membres
    await connection.execute(`
      INSERT IGNORE INTO members (firstName, lastName, email, phone, role, function, status, joinedAt, createdAt, updatedAt) VALUES
      ('Ousmane', 'Mahamat', 'ousmane@association.fr', '+235 66 00 11 22', 'Président', 'Direction', 'active', NOW(), NOW(), NOW()),
      ('Aïcha', 'Abdoulaye', 'aicha@association.fr', '+235 62 22 33 44', 'Trésorier', 'Finances', 'active', NOW(), NOW(), NOW()),
      ('Khalil', 'Hassan', 'khalil@association.fr', '+235 61 33 44 55', 'Secrétaire', 'Administration', 'active', NOW(), NOW(), NOW()),
      ('Zainab', 'Ibrahim', 'zainab@association.fr', '+235 65 44 55 66', 'Membre', 'Bénévole', 'active', NOW(), NOW(), NOW())
    `);
    console.log("✓ Membres chargés");

    // Insérer les cotisations
    await connection.execute(`
      INSERT IGNORE INTO cotisations (memberId, montant, dateDebut, dateFin, statut, datePayment, notes, createdAt, updatedAt) VALUES
      (1, 50000.00, '2024-01-01', '2024-12-31', 'payée', '2024-01-15', 'Cotisation annuelle 2024', NOW(), NOW()),
      (2, 30000.00, '2024-01-01', '2024-12-31', 'payée', '2024-01-20', 'Cotisation annuelle 2024', NOW(), NOW()),
      (3, 15000.00, '2024-01-01', '2024-12-31', 'payée', '2024-02-01', 'Cotisation annuelle 2024', NOW(), NOW()),
      (4, 15000.00, '2024-01-01', '2024-12-31', 'en attente', NULL, 'Cotisation annuelle 2024', NOW(), NOW())
    `);
    console.log("✓ Cotisations chargées");

    // Insérer les dons
    await connection.execute(`
      INSERT IGNORE INTO dons (montant, donateur, dateReception, statut, notes, createdAt, updatedAt) VALUES
      (500000.00, 'Dubois Trading SARL', '2024-01-10', 'reçu', 'Don pour aide urgence', NOW(), NOW()),
      (200000.00, 'Banque du Tchad', '2024-02-05', 'reçu', 'Don pour projet formation', NOW(), NOW()),
      (100000.00, 'Particulier', '2024-03-01', 'en attente', 'Don pour projet centre', NOW(), NOW())
    `);
    console.log("✓ Dons chargés");

    // Insérer les contacts CRM
    await connection.execute(`
      INSERT IGNORE INTO crm_contacts (firstName, lastName, email, phone, company, position, source, status, lastContactDate, createdAt, updatedAt) VALUES
      ('Mahamat', 'Alamine', 'mahamat@mairie.td', '+235 66 12 34 56', 'Mairie de N\'Djaména', 'Adjoint', 'official', 'active', NOW(), NOW(), NOW()),
      ('Fatima', 'Hassan', 'fatima@minplan.td', '+235 62 45 67 89', 'Ministère du Plan', 'Responsable', 'official', 'active', NOW(), NOW(), NOW())
    `);
    console.log("✓ Contacts CRM chargés");

    // Insérer les projets
    await connection.execute(`
      INSERT IGNORE INTO projects (name, description, startDate, endDate, status, budget, progress, createdAt, updatedAt) VALUES
      ('Lutte contre les inondations 2024', 'Projet d\'aide d\'urgence', '2024-02-01', '2024-12-31', 'in_progress', 1500000.00, 45, NOW(), NOW()),
      ('Centre de Formation', 'Création d\'un centre de formation', '2024-03-01', '2025-06-30', 'planned', 2500000.00, 15, NOW(), NOW())
    `);
    console.log("✓ Projets chargés");

    // Insérer les paramètres globaux
    await connection.execute(`
      INSERT IGNORE INTO global_settings (associationName, seatCity, folio, email, website, phone, description, createdAt, updatedAt) VALUES
      ('Association Manager', 'N\'Djaména', 'FOLIO-2024-001', 'contact@association.fr', 'www.association.fr', '+235 66 00 00 00', 'Plateforme de gestion', NOW(), NOW())
    `);
    console.log("✓ Paramètres globaux chargés");

    await connection.end();
    console.log("\n✅ Données de démonstration chargées avec succès!");
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

seedData();
