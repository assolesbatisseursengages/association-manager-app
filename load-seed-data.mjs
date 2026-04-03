import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./drizzle/schema.ts";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL, { schema });

async function seedData() {
  try {
    console.log("Chargement des données de démonstration...");
    
    // Insérer les catégories
    const categories = await db.insert(schema.categories).values([
      { name: 'Légal', slug: 'legal', description: 'Documents légaux et statuts', color: '#e74c3c', icon: 'file-text', sortOrder: 1 },
      { name: 'Gouvernance', slug: 'governance', description: 'Procès-verbaux et assemblées', color: '#3498db', icon: 'users', sortOrder: 2 },
      { name: 'Financier', slug: 'financial', description: 'Rapports financiers et budgets', color: '#2ecc71', icon: 'dollar-sign', sortOrder: 3 },
      { name: 'Projets', slug: 'projects', description: 'Plans et rapports de projets', color: '#f39c12', icon: 'briefcase', sortOrder: 4 },
    ]).catch(e => console.log("Catégories déjà existantes ou erreur:", e.message));

    console.log("✓ Catégories chargées");

    // Insérer les membres
    const members = await db.insert(schema.members).values([
      { firstName: 'Ousmane', lastName: 'Mahamat', email: 'ousmane@association.fr', phone: '+235 66 00 11 22', role: 'Président', function: 'Direction', status: 'active' },
      { firstName: 'Aïcha', lastName: 'Abdoulaye', email: 'aicha@association.fr', phone: '+235 62 22 33 44', role: 'Trésorier', function: 'Finances', status: 'active' },
      { firstName: 'Khalil', lastName: 'Hassan', email: 'khalil@association.fr', phone: '+235 61 33 44 55', role: 'Secrétaire', function: 'Administration', status: 'active' },
      { firstName: 'Zainab', lastName: 'Ibrahim', email: 'zainab@association.fr', phone: '+235 65 44 55 66', role: 'Membre', function: 'Bénévole', status: 'active' },
    ]).catch(e => console.log("Membres déjà existants ou erreur:", e.message));

    console.log("✓ Membres chargés");

    // Insérer les cotisations
    const cotisations = await db.insert(schema.cotisations).values([
      { memberId: 1, montant: '50000.00', dateDebut: new Date('2024-01-01'), dateFin: new Date('2024-12-31'), statut: 'payée', datePayment: new Date('2024-01-15'), notes: 'Cotisation annuelle 2024' },
      { memberId: 2, montant: '30000.00', dateDebut: new Date('2024-01-01'), dateFin: new Date('2024-12-31'), statut: 'payée', datePayment: new Date('2024-01-20'), notes: 'Cotisation annuelle 2024' },
      { memberId: 3, montant: '15000.00', dateDebut: new Date('2024-01-01'), dateFin: new Date('2024-12-31'), statut: 'payée', datePayment: new Date('2024-02-01'), notes: 'Cotisation annuelle 2024' },
      { memberId: 4, montant: '15000.00', dateDebut: new Date('2024-01-01'), dateFin: new Date('2024-12-31'), statut: 'en attente', notes: 'Cotisation annuelle 2024' },
    ]).catch(e => console.log("Cotisations déjà existantes ou erreur:", e.message));

    console.log("✓ Cotisations chargées");

    // Insérer les dons
    const dons = await db.insert(schema.dons).values([
      { montant: '500000.00', donateur: 'Dubois Trading SARL', dateReception: new Date('2024-01-10'), statut: 'reçu', notes: 'Don pour aide urgence' },
      { montant: '200000.00', donateur: 'Banque du Tchad', dateReception: new Date('2024-02-05'), statut: 'reçu', notes: 'Don pour projet formation' },
      { montant: '100000.00', donateur: 'Particulier', dateReception: new Date('2024-03-01'), statut: 'en attente', notes: 'Don pour projet centre' },
    ]).catch(e => console.log("Dons déjà existants ou erreur:", e.message));

    console.log("✓ Dons chargés");

    // Insérer les contacts CRM
    const contacts = await db.insert(schema.crmContacts).values([
      { firstName: 'Mahamat', lastName: 'Alamine', email: 'mahamat@mairie.td', phone: '+235 66 12 34 56', company: 'Mairie de N\'Djaména', position: 'Adjoint', source: 'official', status: 'active', lastContactDate: new Date() },
      { firstName: 'Fatima', lastName: 'Hassan', email: 'fatima@minplan.td', phone: '+235 62 45 67 89', company: 'Ministère du Plan', position: 'Responsable', source: 'official', status: 'active', lastContactDate: new Date() },
    ]).catch(e => console.log("Contacts déjà existants ou erreur:", e.message));

    console.log("✓ Contacts CRM chargés");

    // Insérer les projets
    const projects = await db.insert(schema.projects).values([
      { name: 'Lutte contre les inondations 2024', description: 'Projet d\'aide d\'urgence', startDate: new Date('2024-02-01'), endDate: new Date('2024-12-31'), status: 'in_progress', budget: '1500000.00', progress: 45 },
      { name: 'Centre de Formation', description: 'Création d\'un centre de formation', startDate: new Date('2024-03-01'), endDate: new Date('2025-06-30'), status: 'planned', budget: '2500000.00', progress: 15 },
    ]).catch(e => console.log("Projets déjà existants ou erreur:", e.message));

    console.log("✓ Projets chargés");

    // Insérer les paramètres globaux
    const settings = await db.insert(schema.globalSettings).values([
      { associationName: 'Association Manager', seatCity: 'N\'Djaména', folio: 'FOLIO-2024-001', email: 'contact@association.fr', website: 'www.association.fr', phone: '+235 66 00 00 00', description: 'Plateforme de gestion' }
    ]).catch(e => console.log("Paramètres déjà existants ou erreur:", e.message));

    console.log("✓ Paramètres globaux chargés");

    console.log("\n✅ Données de démonstration chargées avec succès!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors du chargement des données:", error);
    process.exit(1);
  }
}

seedData();
