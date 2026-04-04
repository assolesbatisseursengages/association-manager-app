import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    console.log("🔍 Test de connexion à TiDB...");
    
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL n'est pas défini");
    }
    
    console.log(`📍 URL de connexion: ${connectionString}`);
    
    const connection = await mysql.createConnection(connectionString);
    console.log("✅ Connexion réussie !");
    
    // Tester la base de données
    const [rows] = await connection.execute("SELECT DATABASE() as current_db");
    console.log(`📊 Base de données actuelle: ${(rows as any)[0].current_db}`);
    
    // Lister les tables
    const [tables] = await connection.execute("SHOW TABLES");
    console.log(`📋 Tables trouvées: ${(tables as any[]).length}`);
    (tables as any[]).forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    console.log("✅ Test terminé avec succès !");
    
  } catch (error) {
    console.error("❌ Erreur de connexion:", error);
  }
}

testConnection();
