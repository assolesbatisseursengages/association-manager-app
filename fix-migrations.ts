import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { join } from "path";

async function fixMigrations() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  let connection;
  try {
    // Parser l'URL pour la connexion SSL
    const url = new URL(process.env.DATABASE_URL);
    const sslConfig = url.searchParams.get('ssl') === 'true' ? { rejectUnauthorized: false } : false;
    
    connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      ssl: sslConfig
    });

    console.log("🔧 Création des tables manquantes avec IF NOT EXISTS...");

    // Lire les migrations existantes
    const migrationPath = join(__dirname, '../drizzle');
    const migrationFiles = [
      '0000_damp_karnak.sql',
      '0001_crazy_jack.sql',
      '0002_wicked_dorothy.sql',
      '0003_loud_burns.sql'
    ];

    for (const file of migrationFiles) {
      try {
        const filePath = join(migrationPath, file);
        if (readFileSync(filePath, 'utf8')) {
          console.log(`✅ Migration ${file} déjà traitée`);
        }
      } catch (error) {
        console.log(`⚠️ Migration ${file} non trouvée`);
      }
    }

    // Créer les tables manquantes avec IF NOT EXISTS
    const tablesSQL = `
      -- Tables de projets
      CREATE TABLE IF NOT EXISTS \`projects\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`description\` text,
        \`startDate\` timestamp,
        \`endDate\` timestamp,
        \`budget\` decimal(12, 2),
        \`status\` enum('planning', 'active', 'on-hold', 'completed', 'cancelled') DEFAULT 'planning',
        \`progress\` int DEFAULT 0,
        \`priority\` enum('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        \`createdBy\` int,
        \`createdAt\` timestamp DEFAULT now(),
        \`updatedAt\` timestamp DEFAULT now() ON UPDATE now(),
        PRIMARY KEY (\`id\`)
      );

      CREATE TABLE IF NOT EXISTS \`project_members\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`projectId\` int NOT NULL,
        \`userId\` int NOT NULL,
        \`role\` varchar(100) DEFAULT 'member',
        \`joinedAt\` timestamp DEFAULT now(),
        PRIMARY KEY (\`id\`)
      );

      CREATE TABLE IF NOT EXISTS \`project_expenses\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`projectId\` int NOT NULL,
        \`description\` varchar(255) NOT NULL,
        \`amount\` decimal(10, 2) NOT NULL,
        \`category\` varchar(100),
        \`date\` timestamp DEFAULT now(),
        \`createdBy\` int,
        PRIMARY KEY (\`id\`)
      );

      CREATE TABLE IF NOT EXISTS \`project_history\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`projectId\` int NOT NULL,
        \`action\` varchar(100) NOT NULL,
        \`changedBy\` int,
        \`changedAt\` timestamp DEFAULT now(),
        \`details\` text,
        PRIMARY KEY (\`id\`)
      );

      CREATE TABLE IF NOT EXISTS \`tasks\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`projectId\` int NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`description\` text,
        \`status\` enum('todo', 'in-progress', 'done', 'cancelled') DEFAULT 'todo',
        \`priority\` enum('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        \`dueDate\` timestamp,
        \`assignedTo\` int,
        \`progress\` int DEFAULT 0,
        \`createdAt\` timestamp DEFAULT now(),
        \`updatedAt\` timestamp DEFAULT now() ON UPDATE now(),
        PRIMARY KEY (\`id\`)
      );

      -- Tables de budgets
      CREATE TABLE IF NOT EXISTS \`budgets\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`description\` text,
        \`year\` int NOT NULL,
        \`totalAmount\` decimal(15, 2) NOT NULL,
        \`categoryId\` int,
        \`createdBy\` int,
        \`status\` enum('draft', 'approved', 'active', 'closed') DEFAULT 'draft',
        \`createdAt\` timestamp DEFAULT now(),
        \`updatedAt\` timestamp DEFAULT now() ON UPDATE now(),
        PRIMARY KEY (\`id\`)
      );

      CREATE TABLE IF NOT EXISTS \`budget_lines\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`budgetId\` int NOT NULL,
        \`lineNumber\` int NOT NULL,
        \`description\` varchar(255) NOT NULL,
        \`amount\` decimal(12, 2) NOT NULL,
        \`category\` varchar(100),
        PRIMARY KEY (\`id\`)
      );

      -- Tables de factures
      CREATE TABLE IF NOT EXISTS \`invoices\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`invoiceNumber\` varchar(100) NOT NULL UNIQUE,
        \`invoiceDate\` timestamp NOT NULL,
        \`dueDate\` timestamp NOT NULL,
        \`totalAmount\` decimal(12, 2) NOT NULL,
        \`paidAmount\` decimal(12, 2) DEFAULT 0,
        \`status\` enum('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
        \`description\` text,
        \`supplierId\` int,
        \`createdBy\` int,
        \`createdAt\` timestamp DEFAULT now(),
        \`updatedAt\` timestamp DEFAULT now() ON UPDATE now(),
        PRIMARY KEY (\`id\`)
      );
    `;

    // Exécuter les créations de tables
    await connection.execute(tablesSQL);
    
    console.log("✅ Tables créées avec succès !");
    console.log("🎉 Migration terminée !");

  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
  } finally {
    if (connection) await connection.end();
  }
}

fixMigrations().catch(console.error);
