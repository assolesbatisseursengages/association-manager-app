import mysql from 'mysql2/promise';

async function checkUsersLocal() {
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

    // Check users_local table
    const [rows] = await connection.query('SELECT * FROM users_local');
    console.log('Users in users_local table:');
    console.log(JSON.stringify(rows, null, 2));

    // Check user_sessions table
    const [sessions] = await connection.query('SELECT * FROM user_sessions');
    console.log('\nSessions in user_sessions table:');
    console.log(JSON.stringify(sessions, null, 2));

    // Check users table
    const [users] = await connection.query('SELECT id, email, name, role FROM users');
    console.log('\nUsers in users table:');
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

checkUsersLocal();
