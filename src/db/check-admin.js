const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sfms_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function checkAdmin() {
  try {
    console.log('Checking database connection...');
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');

    console.log('\nChecking admin user...');
    const result = await pool.query(
      'SELECT id, email, role, first_name, last_name, active FROM users WHERE email = $1',
      ['admin@example.com']
    );

    if (result.rows.length > 0) {
      console.log('\nAdmin user found:');
      console.log(result.rows[0]);
    } else {
      console.log('\nNo admin user found!');
    }

    // Check all users in the database
    console.log('\nAll users in database:');
    const allUsers = await pool.query('SELECT id, email, role, first_name, last_name, active FROM users');
    console.log(allUsers.rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdmin(); 