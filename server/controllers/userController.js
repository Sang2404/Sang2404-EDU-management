const pool = require('../config/db');

// Get All Users (with pagination)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM users';
    let params = [];
    let countQuery = 'SELECT COUNT(*) FROM users';
    
    if (role) {
      query += ' WHERE role = $1';
      countQuery += ' WHERE role = $1';
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    
    // Total count
    const countResult = await pool.query(countQuery, role ? [role] : []);
    const totalUsers = parseInt(countResult.rows[0].count);

    // Fetch users
    const result = await pool.query(query, [...params, limit, offset]);

    res.json({
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: parseInt(page),
      users: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create User (Admin Only)
exports.createUser = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Start Transaction

    const { email, username, role, full_name, additional_info } = req.body;
    // additional_info: { student_id, class_id, dob, ... } OR { lecturer_id, faculty_id, degree, ... }

    // 1. Insert into users table
    const userInsertQuery = `
      INSERT INTO users (email, username, role, full_name) 
      VALUES ($1, $2, $3, $4) 
      RETURNING user_id
    `;
    const userRes = await client.query(userInsertQuery, [email, username, role, full_name]);
    const userId = userRes.rows[0].user_id;

    // 2. Insert into specific tables based on role
    if (role === 'STUDENT') {
      const { student_id, class_id, dob, gender, phone, address } = additional_info || {};
      const studentQuery = `
        INSERT INTO students (student_id, user_id, class_id, dob, gender, phone, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      // Use username as student_id if not provided separately
      await client.query(studentQuery, [student_id || username, userId, class_id, dob, gender, phone, address]);
    
    } else if (role === 'LECTURER') {
      const { lecturer_id, faculty_id, degree, phone } = additional_info || {};
      const lecturerQuery = `
        INSERT INTO lecturers (lecturer_id, user_id, faculty_id, degree, phone)
        VALUES ($1, $2, $3, $4, $5)
      `;
      // Use username as lecturer_id if not provided separately
      await client.query(lecturerQuery, [lecturer_id || username, userId, faculty_id, degree, phone]);
    }

    await client.query('COMMIT'); // Commit Transaction
    res.status(201).json({ message: 'User created successfully', userId });

  } catch (error) {
    await client.query('ROLLBACK'); // Rollback on error
    console.error('Create User Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, username, role, full_name, is_active } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (username !== undefined) {
      updates.push(`username = $${paramCount++}`);
      values.push(username);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    if (full_name !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(full_name);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'User updated successfully', 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { userId } = req.params;

    // Check if user exists
    const checkQuery = 'SELECT * FROM users WHERE user_id = $1';
    const checkResult = await client.query(checkQuery, [userId]);

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    const user = checkResult.rows[0];

    // Delete from role-specific tables first (CASCADE will handle this, but explicit is better)
    if (user.role === 'STUDENT') {
      await client.query('DELETE FROM students WHERE user_id = $1', [userId]);
    } else if (user.role === 'LECTURER') {
      await client.query('DELETE FROM lecturers WHERE user_id = $1', [userId]);
    }

    // Delete from users table
    await client.query('DELETE FROM users WHERE user_id = $1', [userId]);

    await client.query('COMMIT');
    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete User Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};
