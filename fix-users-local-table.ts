import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

async function fixUsersLocalTable() {
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

    // Vérifier la structure de la table users_local
    const [structure] = await connection.execute('DESCRIBE users_local') as any;
    console.log("📊 Structure actuelle de users_local:");
    structure.forEach((col: any) => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    // Ajouter les colonnes manquantes
    const updates = [
      `ALTER TABLE users_local ADD COLUMN IF NOT EXISTS hashedPassword VARCHAR(255) NOT NULL DEFAULT ''`,
      `ALTER TABLE users_local ADD COLUMN IF NOT EXISTS isEmailVerified BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE users_local ADD COLUMN IF NOT EXISTS emailVerificationToken VARCHAR(255)`,
      `ALTER TABLE users_local ADD COLUMN IF NOT EXISTS emailVerificationTokenExpiry TIMESTAMP NULL`,
      `ALTER TABLE users_local ADD COLUMN IF NOT EXISTS passwordResetToken VARCHAR(255)`,
      `ALTER TABLE users_local ADD COLUMN IF NOT EXISTS passwordResetTokenExpiry TIMESTAMP NULL`,
      `ALTER TABLE users_local ADD COLUMN IF NOT EXISTS lastLoginAt TIMESTAMP NULL`
    ];

    for (const sql of updates) {
      try {
        await connection.execute(sql);
        console.log("✅ Colonne ajoutée avec succès");
      } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_BAD_FIELD_ERROR') {
          console.log("⚠️ Colonne existe déjà");
        } else {
          console.error("❌ Erreur ajout colonne:", error.message);
        }
      }
    }

    // Hasher et mettre à jour le mot de passe
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    console.log("🔑 Nouveau hash généré");

    // Mettre à jour le mot de passe de l'admin
    const [result] = await connection.execute(
      'UPDATE users_local SET hashedPassword = ? WHERE userId = ?',
      [hashedPassword, 1]
    ) as any;
    
    console.log("✅ Mot de passe admin mis à jour:", result.affectedRows, "lignes affectées");

    // Vérifier la mise à jour
    const [verify] = await connection.execute(
      'SELECT hashedPassword FROM users_local WHERE userId = ? LIMIT 1',
      [1]
    ) as any;
    
    if (verify.length > 0) {
      console.log("✅ Vérification réussie - hash présent:", !!verify[0].hashedPassword);
      console.log("🔑 Hash final:", verify[0].hashedPassword.substring(0, 20) + "...");
    }

  } catch (error) {
    console.error("❌ Erreur lors de la correction:", error);
  } finally {
    if (connection) await connection.end();
  }
}

fixUsersLocalTable().catch(console.error);
