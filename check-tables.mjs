import mysql from 'mysql2/promise';

async function checkTables() {
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
  };

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('Connected to the database.');

    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in the database:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
  } catch (error) {
    console.error('Error checking tables:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

checkTables();
