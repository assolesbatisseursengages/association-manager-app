import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

async function updateTableStructure() {
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

    // Mettre à jour la structure des tables existantes
    const updates = [
      // Mettre à jour la table users
      `ALTER TABLE \`users\` 
       ADD COLUMN IF NOT EXISTS \`lastSignedIn\` timestamp DEFAULT now(),
       ADD COLUMN IF NOT EXISTS \`loginMethod\` varchar(64) DEFAULT 'local',
       MODIFY COLUMN \`role\` enum('admin', 'gestionnaire', 'lecteur') DEFAULT 'lecteur' NOT NULL`,
      
      // Mettre à jour la table users_local
      `ALTER TABLE \`users_local\`
       ADD COLUMN IF NOT EXISTS \`isEmailVerified\` boolean DEFAULT false,
       ADD COLUMN IF NOT EXISTS \`emailVerificationToken\` varchar(255),
       ADD COLUMN IF NOT EXISTS \`emailVerificationTokenExpiry\` timestamp,
       ADD COLUMN IF NOT EXISTS \`passwordResetToken\` varchar(255),
       ADD COLUMN IF NOT EXISTS \`passwordResetTokenExpiry\` timestamp,
       ADD COLUMN IF NOT EXISTS \`lastLoginAt\` timestamp`,
      
      // Ajouter les tables user_sessions si elles n'existent pas
      `CREATE TABLE IF NOT EXISTS \`user_sessions\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`userId\` int NOT NULL,
        \`token\` varchar(255) NOT NULL UNIQUE,
        \`userAgent\` text,
        \`ipAddress\` varchar(45),
        \`expiresAt\` timestamp NOT NULL,
        \`createdAt\` timestamp DEFAULT now(),
        PRIMARY KEY (\`id\`)
      )`,
      
      // Ajouter la table global_settings si elle n'existe pas
      `CREATE TABLE IF NOT EXISTS \`global_settings\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`associationName\` varchar(255) DEFAULT 'Les Batisseurs Engages' NOT NULL,
        \`seatCity\` varchar(255) DEFAULT 'Ndjamena-tchad' NOT NULL,
        \`folio\` varchar(100) DEFAULT '10512' NOT NULL,
        \`email\` varchar(320) DEFAULT 'contact.lesbatisseursengages@gmail.com' NOT NULL,
        \`website\` varchar(500) DEFAULT 'www.lesbatisseursengage.com' NOT NULL,
        \`phone\` varchar(20),
        \`logo\` text,
        \`description\` text,
        \`updatedBy\` int,
        \`updatedAt\` timestamp DEFAULT now() ON UPDATE now(),
        \`createdAt\` timestamp DEFAULT now(),
        PRIMARY KEY (\`id\`)
      )`
    ];

    // Exécuter chaque mise à jour séparément
    for (const sql of updates) {
      try {
        await connection.execute(sql);
        console.log("✅ Mise à jour réussie");
      } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_BAD_NULL_ERROR') {
          console.log("⚠️ Champ existe déjà ou erreur mineure");
        } else {
          console.error("❌ Erreur mise à jour:", error.message);
        }
      }
    }
    
    console.log("✅ Structure des tables mise à jour !");
    console.log("🎉 Mise à jour terminée !");

  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour:", error);
  } finally {
    if (connection) await connection.end();
  }
}

updateTableStructure().catch(console.error);
