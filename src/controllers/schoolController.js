const { query } = require('../db');

const createSchool = async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'School name is required' });
    }
    const result = await query(
      'INSERT INTO schools (name, address) VALUES ($1, $2) RETURNING *',
      [name, address || null]
    );
    res.status(201).json({
      message: 'School created successfully',
      school: result.rows[0],
    });
  } catch (error) {
    console.error('Create school error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSchools = async (req, res) => {
  try {
    const result = await query('SELECT id, name, address FROM schools');
    res.json({ schools: result.rows });
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createSchool,
  getSchools,
}; 