const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sfms_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function resetAdmin() {
  try {
    console.log('Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');

    // Hash new password
    console.log('\nHashing password...');
    const salt = 10;
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');

    // Delete existing admin if exists
    console.log('\nRemoving existing admin user...');
    await pool.query('DELETE FROM users WHERE email = $1', ['admin@example.com']);
    console.log('Existing admin user removed');

    // Create new admin user
    console.log('\nCreating new admin user...');
    const result = await pool.query(
      `INSERT INTO users (email, password, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, first_name, last_name`,
      ['admin@example.com', hashedPassword, 'admin', 'System', 'Admin']
    );

    console.log('\nAdmin user created successfully:');
    console.log(result.rows[0]);
    console.log('\nLogin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetAdmin(); 