import bcrypt from "bcrypt";
import mysql from "mysql2/promise";

async function testManualLogin() {
  console.log("Test manuel de connexion...");
  
  const connectionString = "mysql://2KDAnvQY5XeF1D3.root:qCJLu5DsDW2iMahc@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/association_manager?ssl=true";
  
  let connection;
  try {
    // Connexion à la base
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
    
    // Récupérer l'utilisateur local
    const [localUsers] = await connection.execute(
      `SELECT * FROM users_local WHERE email = 'admin@batisseurs-engages.fr' LIMIT 1`
    ) as any;
    
    if (localUsers.length === 0) {
      console.log("Utilisateur local non trouvé");
      return;
    }
    
    const localUser = localUsers[0];
    console.log("Utilisateur local trouvé:", {
      userId: localUser.userId,
      email: localUser.email,
      hasPasswordHash: !!localUser.passwordHash,
      hasHashedPassword: !!localUser.hashedPassword,
      passwordHashLength: localUser.passwordHash?.length,
      hashedPasswordLength: localUser.hashedPassword?.length
    });
    
    // Tester le mot de passe
    const testPassword = "Admin123!";
    let isValid = false;
    
    if (localUser.hashedPassword) {
      try {
        isValid = await bcrypt.compare(testPassword, localUser.hashedPassword);
        console.log("Test avec hashedPassword:", isValid);
      } catch (e) {
        console.log("Erreur test hashedPassword:", e);
      }
    }
    
    if (!isValid && localUser.passwordHash) {
      try {
        isValid = await bcrypt.compare(testPassword, localUser.passwordHash);
        console.log("Test avec passwordHash:", isValid);
      } catch (e) {
        console.log("Erreur test passwordHash:", e);
      }
    }
    
    if (isValid) {
      console.log("Mot de passe valide! Création d'une session de test...");
      
      // Créer une session de test
      const token = "test-session-" + Date.now();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      
      await connection.execute(
        `INSERT INTO user_sessions (userId, token, expiresAt, createdAt) VALUES (?, ?, ?, NOW())`,
        [localUser.userId, token, expiresAt]
      );
      
      console.log("Session de test créée avec token:", token);
      
      // Test de la session
      const [session] = await connection.execute(
        `SELECT * FROM user_sessions WHERE token = ? LIMIT 1`,
        [token]
      ) as any;
      
      if (session.length > 0) {
        console.log("Session trouvée:", {
          userId: session[0].userId,
          token: session[0].token,
          expiresAt: session[0].expiresAt
        });
      }
      
    } else {
      console.log("Mot de passe invalide");
    }
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    if (connection) await connection.end();
  }
}

testManualLogin();
