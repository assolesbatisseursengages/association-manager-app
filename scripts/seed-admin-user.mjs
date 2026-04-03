import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcryptjs from "bcryptjs";
import { users, usersLocal, globalSettings } from "../drizzle/schema.ts";
import "dotenv/config";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);

    const adminEmail = "admin@manus.im";
    const adminPassword = "ManusPassword2026!";
    const adminName = "Administrateur Manus";

    console.log(`🔧 Seeding admin user: ${adminEmail}`);

    // 1. Create User in 'users' table
    const userResult = await db.insert(users).values({
      openId: `local_admin_${Date.now()}`,
      name: adminName,
      email: adminEmail,
      loginMethod: "local",
      role: "admin",
    });

    const userId = userResult[0].insertId;
    console.log(`✅ User created with ID: ${userId}`);

    // 2. Create User in 'users_local' table with hashed password
    const passwordHash = await bcryptjs.hash(adminPassword, 10);
    await db.insert(usersLocal).values({
      userId: userId,
      email: adminEmail,
      passwordHash: passwordHash,
      isEmailVerified: true,
    });
    console.log(`✅ Local auth user created with hashed password`);

    // 3. Update Global Settings
    await db.insert(globalSettings).values({
      associationName: "Association Manus",
      seatCity: "Paris",
      folio: "MANUS-2026",
      email: adminEmail,
      website: "https://manus.im",
    }).onDuplicateKeyUpdate({
      set: {
        associationName: "Association Manus",
        email: adminEmail,
      }
    });
    console.log(`✅ Global settings configured`);

    console.log("\n✨ Seeding completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔐 Password: ${adminPassword}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await connection.end();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

main();
