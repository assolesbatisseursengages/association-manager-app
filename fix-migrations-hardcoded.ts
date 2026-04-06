import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

async function fixMigrations() {
  const connectionString = "mysql://2KDAnvQY5XeF1D3.root:qCJLu5DsDW2iMahc@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/association_manager?ssl=true";
  
  let connection;
  try {
    // Parser l'URL pour la connexion SSL
    const url = new URL(connectionString);
    const sslConfig = url.searchParams.get('ssl') === 'true' ? { rejectUnauthorized: false } : undefined;
    
    connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      ssl: sslConfig
    });
    console.log("🔧 Connexion à la base de données réussie");

    // Créer les tables manquantes avec IF NOT EXISTS
    const tables = [
      `CREATE TABLE IF NOT EXISTS \`projects\` (
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
      )`,
      
      `CREATE TABLE IF NOT EXISTS \`project_members\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`projectId\` int NOT NULL,
        \`userId\` int NOT NULL,
        \`role\` varchar(100) DEFAULT 'member',
        \`joinedAt\` timestamp DEFAULT now(),
        PRIMARY KEY (\`id\`)
      )`,
      
      `CREATE TABLE IF NOT EXISTS \`project_expenses\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`projectId\` int NOT NULL,
        \`description\` varchar(255) NOT NULL,
        \`amount\` decimal(10, 2) NOT NULL,
        \`category\` varchar(100),
        \`date\` timestamp DEFAULT now(),
        \`createdBy\` int,
        PRIMARY KEY (\`id\`)
      )`,
      
      `CREATE TABLE IF NOT EXISTS \`project_history\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`projectId\` int NOT NULL,
        \`action\` varchar(100) NOT NULL,
        \`changedBy\` int,
        \`changedAt\` timestamp DEFAULT now(),
        \`details\` text,
        PRIMARY KEY (\`id\`)
      )`,
      
      `CREATE TABLE IF NOT EXISTS \`tasks\` (
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
      )`,
      
      `CREATE TABLE IF NOT EXISTS \`budgets\` (
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
      )`,
      
      `CREATE TABLE IF NOT EXISTS \`budget_lines\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`budgetId\` int NOT NULL,
        \`lineNumber\` int NOT NULL,
        \`description\` varchar(255) NOT NULL,
        \`amount\` decimal(12, 2) NOT NULL,
        \`category\` varchar(100),
        PRIMARY KEY (\`id\`)
      )`,
      
      `CREATE TABLE IF NOT EXISTS \`invoices\` (
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
      )`
    ];

    // Exécuter chaque création de table séparément
    for (const sql of tables) {
      try {
        await connection.execute(sql);
        console.log("✅ Table créée avec succès");
      } catch (error: any) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log("⚠️ Table existe déjà");
        } else {
          console.error("❌ Erreur création table:", error.message);
        }
      }
    }
    
    console.log("✅ Tables créées avec succès !");
    console.log("🎉 Migration terminée !");

  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
  } finally {
    if (connection) await connection.end();
  }
}

fixMigrations().catch(console.error);
