import mysql from "mysql2/promise";

async function updateGroupResponsables() {
  try {
    console.log("Mise à jour des responsables des groupes...");
    
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    
    // Récupérer les IDs des groupes et des premiers membres
    const [groups] = await connection.execute("SELECT id, name FROM member_groups ORDER BY id LIMIT 4");
    const [members] = await connection.execute("SELECT id FROM members ORDER BY id LIMIT 4");
    
    if (Array.isArray(groups) && Array.isArray(members) && groups.length > 0 && members.length > 0) {
      // Assigner un membre responsable à chaque groupe
      for (let i = 0; i < Math.min(groups.length, members.length); i++) {
        const group = groups[i] as any;
        const member = members[i] as any;
        
        await connection.execute(
          "UPDATE member_groups SET responsableMemberId = ? WHERE id = ?",
          [member.id, group.id]
        );
        console.log(`✓ Groupe "${group.name}" assigné au membre ID ${member.id}`);
      }
    }

    await connection.end();
    console.log("\n✅ Responsables des groupes mis à jour avec succès!");
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

updateGroupResponsables();
