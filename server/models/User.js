const { pool } = require('../config/database');

class User {
  // Create users table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await pool.query(query);
      console.log('Users table created or already exists');
    } catch (err) {
      console.error('Error creating users table:', err);
      throw err;
    }
  }

  // Get all users
  static async getAll() {
    try {
      const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows;
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    }
  }

  // Get user by ID
  static async getById(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (err) {
      console.error('Error fetching user by ID:', err);
      throw err;
    }
  }

  // Create new user
  static async create(userData) {
    const { name, email } = userData;
    try {
      const result = await pool.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  // Update user
  static async update(id, userData) {
    const { name, email } = userData;
    try {
      const result = await pool.query(
        'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [name, email, id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }

  // Check if email exists
  static async emailExists(email) {
    try {
      const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      return result.rows.length > 0;
    } catch (err) {
      console.error('Error checking email existence:', err);
      throw err;
    }
  }
}

module.exports = User;