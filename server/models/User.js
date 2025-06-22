const { pool } = require('../config/database');

class User {
  // Create users table if it doesn't exist (based on your schema)
  static async createTable() {
    const query = `
      -- Create custom types/enums if they don't exist
      DO $$ BEGIN
        CREATE TYPE user_role_type AS ENUM ('student', 'editor', 'manager', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        role user_role_type DEFAULT 'student',
        profile_data JSONB,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        audit_info JSONB NOT NULL
      );

      -- Create index for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
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
      const result = await pool.query('SELECT * FROM users ORDER BY user_id DESC');
      return result.rows;
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    }
  }

  // Get user by ID
  static async getById(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
      return result.rows[0];
    } catch (err) {
      console.error('Error fetching user by ID:', err);
      throw err;
    }
  }

  // Get user by email
  static async getByEmail(email) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    } catch (err) {
      console.error('Error fetching user by email:', err);
      throw err;
    }
  }

  // Create new user
  static async create(userData) {
    const { 
      email, 
      password_hash, 
      first_name, 
      last_name, 
      phone, 
      role = 'student', 
      profile_data = {},
      audit_info 
    } = userData;

    // Ensure audit_info has created_at
    const auditInfo = {
      created_at: new Date().toISOString(),
      created_by: userData.created_by || null,
      ...audit_info
    };

    try {
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, profile_data, audit_info) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [email, password_hash, first_name, last_name, phone, role, JSON.stringify(profile_data), JSON.stringify(auditInfo)]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  // Update user
  static async update(id, userData) {
    const { 
      email, 
      password_hash, 
      first_name, 
      last_name, 
      phone, 
      role, 
      profile_data,
      is_active,
      updated_by
    } = userData;

    // Build dynamic query based on provided fields
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (password_hash !== undefined) {
      fields.push(`password_hash = $${paramCount++}`);
      values.push(password_hash);
    }
    if (first_name !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(first_name);
    }
    if (last_name !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(last_name);
    }
    if (phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (role !== undefined) {
      fields.push(`role = $${paramCount++}`);
      values.push(role);
    }
    if (profile_data !== undefined) {
      fields.push(`profile_data = $${paramCount++}`);
      values.push(JSON.stringify(profile_data));
    }
    if (is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    // Update audit_info
    const auditInfo = {
      updated_at: new Date().toISOString(),
      updated_by: updated_by || null
    };
    fields.push(`audit_info = jsonb_set(COALESCE(audit_info, '{}'), '{updated_at}', $${paramCount++})`);
    values.push(`"${auditInfo.updated_at}"`);

    if (updated_by) {
      fields.push(`audit_info = jsonb_set(audit_info, '{updated_by}', $${paramCount++})`);
      values.push(`${updated_by}`);
    }

    values.push(id); // Add ID as the last parameter

    try {
      const result = await pool.query(
        `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${paramCount} RETURNING *`,
        values
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }

  // Update last login
  static async updateLastLogin(id) {
    try {
      const result = await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error updating last login:', err);
      throw err;
    }
  }

  // Soft delete user (set is_active to false)
  static async softDelete(id, deleted_by) {
    const auditInfo = {
      deleted_at: new Date().toISOString(),
      deleted_by: deleted_by || null
    };

    try {
      const result = await pool.query(
        `UPDATE users 
         SET is_active = false, 
             audit_info = jsonb_set(
               jsonb_set(COALESCE(audit_info, '{}'), '{deleted_at}', $1), 
               '{deleted_by}', $2
             )
         WHERE user_id = $3 RETURNING *`,
        [`"${auditInfo.deleted_at}"`, auditInfo.deleted_by, id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error soft deleting user:', err);
      throw err;
    }
  }

  // Hard delete user (permanent deletion)
  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }

  // Check if email exists
  static async emailExists(email) {
    try {
      const result = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
      return result.rows.length > 0;
    } catch (err) {
      console.error('Error checking email existence:', err);
      throw err;
    }
  }

  // Get users by role
  static async getByRole(role) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE role = $1 AND is_active = true ORDER BY user_id DESC', [role]);
      return result.rows;
    } catch (err) {
      console.error('Error fetching users by role:', err);
      throw err;
    }
  }

  // Get active users
  static async getActive() {
    try {
      const result = await pool.query('SELECT * FROM users WHERE is_active = true ORDER BY user_id DESC');
      return result.rows;
    } catch (err) {
      console.error('Error fetching active users:', err);
      throw err;
    }
  }

  // Search users by name or email
  static async search(searchTerm) {
    try {
      const result = await pool.query(
        `SELECT * FROM users 
         WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1) 
         AND is_active = true 
         ORDER BY user_id DESC`,
        [`%${searchTerm}%`]
      );
      return result.rows;
    } catch (err) {
      console.error('Error searching users:', err);
      throw err;
    }
  }

  // Get user statistics
  static async getStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE is_active = true) as active_users,
          COUNT(*) FILTER (WHERE role = 'student') as students,
          COUNT(*) FILTER (WHERE role = 'editor') as editors,
          COUNT(*) FILTER (WHERE role = 'manager') as managers,
          COUNT(*) FILTER (WHERE role = 'admin') as admins
        FROM users
      `);
      return result.rows[0];
    } catch (err) {
      console.error('Error fetching user statistics:', err);
      throw err;
    }
  }
}

module.exports = User;