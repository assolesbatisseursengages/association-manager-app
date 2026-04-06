import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

async function checkAdminUser() {
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

    // Vérifier si l'admin user existe
    const [adminUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      ['admin@batisseurs-engages.fr']
    );
    
    console.log("📊 Admin users trouvés:", adminUsers.length);
    
    if (adminUsers.length === 0) {
      console.log("❌ Aucun admin user trouvé - création en cours...");
      
      // Créer l'admin user
      const [result] = await connection.execute(
        `INSERT INTO users (id, email, role, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?)`,
        [1, 'admin@batisseurs-engages.fr', 'admin', new Date(), new Date()]
      );
      
      console.log("✅ Admin user créé avec ID:", result.insertId);
      
      // Créer le user_local correspondant
      const [localResult] = await connection.execute(
        `INSERT INTO users_local (userId, hashedPassword, createdAt) 
         VALUES (?, ?, ?)`,
        [1, '$2b$10$rQz8ZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', new Date()]
      );
      
      console.log("✅ User local créé avec ID:", localResult.insertId);
      
    } else {
      console.log("✅ Admin user trouvé:", adminUsers[0]);
      
      // Vérifier le mot de passe
      const [localUsers] = await connection.execute(
        'SELECT * FROM users_local WHERE userId = ? LIMIT 1',
        [adminUsers[0].id]
      );
      
      console.log("📊 User local trouvé:", localUsers.length);
      if (localUsers.length > 0) {
        console.log("🔑 Hash du mot de passe:", localUsers[0].hashedPassword?.substring(0, 20) + "...");
      }
    }

  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
  } finally {
    if (connection) await connection.end();
  }
}

checkAdminUser().catch(console.error);
