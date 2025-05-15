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

const migrations = async () => {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');

    console.log('Starting migrations...');

    // Create enum type for user roles if it doesn't exist
    try {
      await client.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE user_role AS ENUM ('admin', 'client');
          END IF;
        END $$;
      `);
      console.log('✓ User role enum created or already exists');
    } catch (error) {
      console.error('Error creating user role enum:', error.message);
      throw error;
    }

    // Create schools table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS schools (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✓ Schools table created successfully');
    } catch (error) {
      console.error('Error creating schools table:', error.message);
      throw error;
    }

    // Create users table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role user_role NOT NULL,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) NOT NULL,
          school_id INTEGER REFERENCES schools(id),
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✓ Users table created successfully');
    } catch (error) {
      console.error('Error creating users table:', error.message);
      throw error;
    }

    // Create password reset tokens table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✓ Password reset tokens table created successfully');
    } catch (error) {
      console.error('Error creating password reset tokens table:', error.message);
      throw error;
    }

    // Create default admin user if not exists
    try {
      const defaultAdmin = await client.query(
        'SELECT id FROM users WHERE email = $1',
        ['admin@example.com']
      );

      if (defaultAdmin.rows.length === 0) {
        // Hash the default password
        const salt = 10;
        const defaultPassword = await bcrypt.hash('admin123', salt);
        
        await client.query(
          `INSERT INTO users (email, password, role, first_name, last_name)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, email, role, first_name, last_name`,
          ['admin@example.com', defaultPassword, 'admin', 'System', 'Admin']
        );
        console.log('✓ Default admin user created successfully');
      } else {
        console.log('✓ Default admin user already exists');
      }
    } catch (error) {
      console.error('Error handling default admin user:', error.message);
      throw error;
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('✓ All migrations completed successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed. Rolling back changes.');
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

// Run migrations
migrations().catch((error) => {
  console.error('Unhandled error during migration:', error);
  process.exit(1);
}); 