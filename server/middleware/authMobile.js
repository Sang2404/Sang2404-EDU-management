const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authMobile = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Token không hợp lệ' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const userQuery = 'SELECT * FROM users WHERE user_id = $1 AND is_active = TRUE';
    const result = await pool.query(userQuery, [decoded.user_id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'User không tồn tại' 
      });
    }

    const user = result.rows[0];
    
    // Get additional info based on role
    if (user.role === 'STUDENT') {
      const studentQuery = 'SELECT student_id FROM students WHERE user_id = $1';
      const studentResult = await pool.query(studentQuery, [user.user_id]);
      if (studentResult.rows.length > 0) {
        user.student_id = studentResult.rows[0].student_id;
      }
    } else if (user.role === 'LECTURER') {
      const lecturerQuery = 'SELECT lecturer_id FROM lecturers WHERE user_id = $1';
      const lecturerResult = await pool.query(lecturerQuery, [user.user_id]);
      if (lecturerResult.rows.length > 0) {
        user.lecturer_id = lecturerResult.rows[0].lecturer_id;
      }
    }
    
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Token không hợp lệ' 
    });
  }
};

module.exports = authMobile;