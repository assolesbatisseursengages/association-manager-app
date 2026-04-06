import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';

async function ensureAdminUser() {
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

    // Check if admin user already exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM users_local WHERE email = ?',
      ['admin@batisseurs-engages.fr']
    );

    if (existingUsers.length > 0) {
      console.log('Admin user already exists.');
      return;
    }

    // Hash the admin password
    const hashedPassword = await bcryptjs.hash('Admin123!', 10);

    // Create admin user in users table
    const [userResult] = await connection.query(
      'INSERT INTO users (openId, email, loginMethod, name) VALUES (?, ?, ?, ?)',
      [`local_admin@batisseurs-engages.fr_${Date.now()}`, 'admin@batisseurs-engages.fr', 'local', 'admin']
    );

    const userId = userResult.insertId;

    // Create local auth entry
    await connection.query(
      'INSERT INTO users_local (userId, email, passwordHash, isEmailVerified) VALUES (?, ?, ?, ?)',
      [userId, 'admin@batisseurs-engages.fr', hashedPassword, true]
    );

    // Set admin role
    await connection.query(
      'UPDATE users SET role = ? WHERE id = ?',
      ['admin', userId]
    );

    console.log('Admin user created successfully: admin@batisseurs-engages.fr');
  } catch (error) {
    console.error('Error ensuring admin user:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

ensureAdminUser();
