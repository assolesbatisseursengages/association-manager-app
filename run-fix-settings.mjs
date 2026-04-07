import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

async function runFixSettings() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  const url = new URL(databaseUrl);
  const sslConfig = url.searchParams.get('ssl') === 'true' ? { rejectUnauthorized: false } : undefined;

  const connectionConfig = {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    ssl: sslConfig,
    multipleStatements: true,
  };

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('Connected to the database.');

    const migrationSqlPath = path.join(process.cwd(), 'drizzle', '0004_fix_global_settings.sql');
    const sql = await fs.readFile(migrationSqlPath, 'utf-8');

    console.log('Executing fix settings script...');
    const statements = sql.split(';').filter(s => s.trim() !== '');
    for (const statement of statements) {
      if (statement.trim() !== '') {
        try {
          await connection.query(statement);
        } catch (error) {
          console.warn(`Statement failed: ${statement.trim()}`);
          console.warn(`Error: ${error.message}`);
        }
      }
    }
    console.log('Fix settings script executed successfully.');
  } catch (error) {
    console.error('Error during fix settings:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

runFixSettings();
