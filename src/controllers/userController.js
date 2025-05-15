const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { validationResult } = require('express-validator');

const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      password,
      role,
      firstName,
      lastName,
      schoolId,
    } = req.body;

    // Check if email already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = parseInt(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password, role, first_name, last_name, school_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role, first_name, last_name, school_id`,
      [email, hashedPassword, role, firstName, lastName, schoolId]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      firstName,
      lastName,
      schoolId,
      active,
    } = req.body;

    const result = await query(
      `UPDATE users
       SET first_name = $1,
           last_name = $2,
           school_id = $3,
           active = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, role, first_name, last_name, school_id, active`,
      [firstName, lastName, schoolId, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE users SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { schoolId } = req.query;
    let users;

    if (schoolId) {
      users = await query(
        'SELECT id, email, role, first_name, last_name, school_id, active FROM users WHERE school_id = $1',
        [schoolId]
      );
    } else {
      users = await query(
        'SELECT id, email, role, first_name, last_name, school_id, active FROM users'
      );
    }

    res.json({ users: users.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
}; 