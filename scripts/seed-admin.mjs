import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcryptjs from "bcryptjs";
import { users, usersLocal, globalSettings } from "../drizzle/schema.ts";
import "dotenv/config";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);

    const adminEmail = "admin@batisseurs-engages.fr";
    const adminPassword = "Admin123!";
    const adminName = "Administrateur";

    console.log(`Seeding admin user: ${adminEmail}`);

    // 1. Create User in 'users' table
    const userResult = await db.insert(users).values({
      openId: `local_admin_${Date.now()}`,
      name: adminName,
      email: adminEmail,
      loginMethod: "local",
      role: "admin",
    });

    const userId = userResult[0].insertId;

    // 2. Create User in 'users_local' table
    const passwordHash = await bcryptjs.hash(adminPassword, 10);
    await db.insert(usersLocal).values({
      userId: userId,
      email: adminEmail,
      passwordHash: passwordHash,
      isEmailVerified: true,
    });

    // 3. Update Global Settings
    await db.insert(globalSettings).values({
      associationName: "Les Bâtisseurs Engagés",
      seatCity: "N'Djaména",
      folio: "LBE-2026",
      email: adminEmail,
      website: "https://batisseurs-engages.fr",
    }).onDuplicateKeyUpdate({
      set: {
        associationName: "Les Bâtisseurs Engagés",
        email: adminEmail,
      }
    });

    console.log("Seeding completed successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("Les Bâtisseurs Engagés initialized");

    await connection.end();
  } catch (error) {
    console.error("Seeding failed:", error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
