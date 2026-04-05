import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcryptjs from "bcryptjs";
import { users, usersLocal, globalSettings } from "../drizzle/schema";
import "dotenv/config";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  let connection;
  try {
    // Parser l'URL pour la connexion SSL
    const url = new URL(process.env.DATABASE_URL);
    const sslConfig = url.searchParams.get('ssl') === 'true' ? { rejectUnauthorized: false } : false;
    
    connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      ssl: sslConfig
    });
    
    const db = drizzle(connection, { mode: 'planetscale' });

    const adminEmail = "admin@batisseurs-engages.fr";
    const adminPassword = "Admin123!";
    const adminName = "Administrateur";

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
    console.log(`✅ Global settings configured`);

    console.log("\n✨ Seeding completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔐 Password: ${adminPassword}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Les Bâtisseurs Engagés initialized");

    await connection.end();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

main().catch(console.error);
