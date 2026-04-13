import mysql from "mysql2/promise";

async function testDirectDatabase() {
  console.log("🔍 Test direct de la base de données...");
  
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
    
    console.log("✅ Connexion à la base de données réussie");
    
    // Vérifier les tables principales
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'association_manager' ORDER BY TABLE_NAME`
    ) as any;
    
    console.log("Tables dans la base de données:");
    tables.forEach((table: any) => {
      console.log(`- ${table.TABLE_NAME}`);
    });
    
    // Vérifier l'utilisateur admin
    const [users] = await connection.execute(
      `SELECT id, name, email, role FROM users WHERE email = 'admin@batisseurs-engages.fr' LIMIT 1`
    ) as any;
    
    if (users.length > 0) {
      console.log("✅ Utilisateur admin trouvé:", users[0]);
      
      // Vérifier l'authentification locale
      const [localUsers] = await connection.execute(
        `SELECT userId, email, passwordHash, hashedPassword FROM users_local WHERE userId = ? LIMIT 1`,
        [users[0].id]
      ) as any;
      
      if (localUsers.length > 0) {
        console.log("✅ Authentification locale trouvée:", {
          userId: localUsers[0].userId,
          email: localUsers[0].email,
          hasPasswordHash: !!localUsers[0].passwordHash,
          hasHashedPassword: !!localUsers[0].hashedPassword
        });
      } else {
        console.log("❌ Aucune authentification locale trouvée pour l'admin");
      }
    } else {
      console.log("❌ Utilisateur admin non trouvé");
    }
    
    // Vérifier les dernières erreurs dans les logs (si table existe)
    try {
      const [logs] = await connection.execute(
        `SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT 5`
      ) as any;
      
      if (logs.length > 0) {
        console.log("Derniers logs d'audit:");
        logs.forEach((log: any) => {
          console.log(`- ${log.createdAt}: ${log.action} par user ${log.userId}`);
        });
      }
    } catch (e) {
      console.log("Table audit_logs non disponible");
    }
    
  } catch (error) {
    console.error("❌ Erreur de base de données:", error);
  } finally {
    if (connection) await connection.end();
  }
}

testDirectDatabase();
