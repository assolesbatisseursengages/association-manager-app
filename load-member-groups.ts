import mysql from "mysql2/promise";

async function loadMemberGroups() {
  try {
    console.log("Chargement des groupes de membres...");
    
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    
    // Insérer les groupes
    await connection.execute(`
      INSERT IGNORE INTO member_groups (name, slug, description, location, email, phone, status, createdAt, updatedAt) VALUES
      ('N\'Djaména', 'ndjamena', 'Siège principal de l\'association', 'N\'Djaména, Tchad', 'ndjamena@association.fr', '+235 66 00 11 22', 'active', NOW(), NOW()),
      ('Moundou', 'moundou', 'Antenne locale de Moundou', 'Moundou, Tchad', 'moundou@association.fr', '+235 62 33 44 55', 'active', NOW(), NOW()),
      ('Cameroun', 'cameroun', 'Représentation au Cameroun', 'Yaoundé, Cameroun', 'cameroun@association.fr', '+237 67 88 99 00', 'active', NOW(), NOW()),
      ('Abéché', 'abeche', 'Antenne de l\'Est', 'Abéché, Tchad', 'abeche@association.fr', '+235 63 55 66 77', 'active', NOW(), NOW())
    `);
    console.log("✓ Groupes chargés");

    await connection.end();
    console.log("\n✅ Groupes de membres chargés avec succès!");
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

loadMemberGroups();
