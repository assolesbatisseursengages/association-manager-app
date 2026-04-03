import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlFile = path.join(__dirname, '../drizzle/migrations_clean.sql');

async function runMigrations() {
  if (!fs.existsSync(sqlFile)) {
    console.error('❌ SQL file not found:', sqlFile);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlFile, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📋 Found ${statements.length} SQL statements`);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'test',
    });

    console.log('✅ Connected to database');

    let success = 0;
    let errors = 0;

    for (let i = 0; i < statements.length; i++) {
      try {
        await connection.execute(statements[i]);
        success++;
        console.log(`[${i + 1}/${statements.length}] ✅`);
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          success++;
          console.log(`[${i + 1}/${statements.length}] ✅ (already exists)`);
        } else {
          errors++;
          console.log(`[${i + 1}/${statements.length}] ❌ ${error.message}`);
        }
      }
    }

    await connection.end();

    console.log(`\n📊 Summary: ${success} successful, ${errors} failed`);
    process.exit(errors === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigrations();
