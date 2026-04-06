import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

async function fixAdminPassword() {
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

    // Hasher le mot de passe correctement
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    console.log("🔑 Nouveau hash généré:", hashedPassword.substring(0, 20) + "...");

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
    }

  } catch (error) {
    console.error("❌ Erreur lors de la correction:", error);
  } finally {
    if (connection) await connection.end();
  }
}

fixAdminPassword().catch(console.error);
