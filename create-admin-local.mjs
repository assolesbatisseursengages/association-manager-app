import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function createAdminLocal() {
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

    // Hash the password
    const password = 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Password hashed for: ${password}`);

    // Check if user 1 already has a local auth entry
    const [existing] = await connection.query('SELECT * FROM users_local WHERE userId = 1');
    
    if (existing.length > 0) {
      console.log('User 1 already has a local auth entry. Updating...');
      await connection.query(
        'UPDATE users_local SET passwordHash = ? WHERE userId = 1',
        [hashedPassword]
      );
      console.log('Updated users_local for user 1');
    } else {
      console.log('Creating new local auth entry for user 1...');
      await connection.query(
        'INSERT INTO users_local (userId, email, passwordHash) VALUES (?, ?, ?)',
        [1, 'admin@batisseurs-engages.fr', hashedPassword]
      );
      console.log('Created users_local entry for user 1');
    }

    // Verify the entry was created
    const [verify] = await connection.query('SELECT userId, email FROM users_local WHERE userId = 1');
    console.log('Verification - users_local entry for user 1:');
    console.log(JSON.stringify(verify, null, 2));

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

createAdminLocal();
