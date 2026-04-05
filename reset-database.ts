import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema";

async function resetDatabase() {
  try {
    console.log("🔄 Réinitialisation de la base de données...");
    
    // Connexion à MySQL
    const connection = await mysql.createConnection({
      host: new URL(process.env.DATABASE_URL!).hostname,
      port: parseInt(new URL(process.env.DATABASE_URL!).port) || 3306,
      user: new URL(process.env.DATABASE_URL!).username,
      password: new URL(process.env.DATABASE_URL!).password,
      database: new URL(process.env.DATABASE_URL!).pathname.substring(1),
      ssl: { rejectUnauthorized: false }
    });
    
    const db = drizzle(connection, { schema, mode: 'planetscale' });
    
    // Supprimer toutes les tables dans le bon ordre
    const tables = [
      'user_sessions', 'user_roles', 'role_permissions', 'permissions',
      'offline_sync_queue', 'widget_templates', 'dashboard_widgets',
      'email_recipients', 'email_history', 'email_templates',
      'crm_email_integration', 'crm_reports', 'crm_activities', 'crm_contacts',
      'notifications', 'news_comments', 'news',
      'transactions', 'depenses', 'dons', 'cotisations',
      'member_history', 'member_statuses', 'member_groups', 'members',
      'document_permissions', 'document_notes', 'documents', 'categories',
      'events', 'campaigns', 'announcements',
      'app_settings', 'app_users', 'global_settings', 'association_info', 'association_settings',
      'users_local', 'users', 'activity_logs'
    ];
    
    for (const table of tables) {
      try {
        await connection.execute(`DROP TABLE IF EXISTS \`${table}\``);
        console.log(`✅ Table ${table} supprimée`);
      } catch (error) {
        console.log(`⚠️  Table ${table} n'existe pas`);
      }
    }
    
    await connection.end();
    console.log("\n✅ Base de données réinitialisée avec succès!");
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

resetDatabase();
