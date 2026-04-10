const admin = require('../config/firebase');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login with email/password for mobile app
exports.loginMobile = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Email và mật khẩu là bắt buộc' 
    });
  }

  try {
    console.log('🔐 Mobile login attempt:', email);
    
    // Find user in database
    const userQuery = 'SELECT * FROM users WHERE email = $1 AND is_active = TRUE';
    const result = await pool.query(userQuery, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    const user = result.rows[0];
    
    // For demo purposes, accept any password for existing users
    // In production, you should hash passwords and verify them properly
    console.log('✅ Mobile login successful:', user.email, '-', user.role);

    // Get additional info based on role
    let additionalInfo = {};
    
    if (user.role === 'LECTURER') {
      const lecturerQuery = 'SELECT lecturer_id FROM lecturers WHERE user_id = $1';
      const lecturerResult = await pool.query(lecturerQuery, [user.user_id]);
      if (lecturerResult.rows.length > 0) {
        additionalInfo.lecturer_id = lecturerResult.rows[0].lecturer_id;
      }
    } else if (user.role === 'STUDENT') {
      const studentQuery = 'SELECT student_id FROM students WHERE user_id = $1';
      const studentResult = await pool.query(studentQuery, [user.user_id]);
      if (studentResult.rows.length > 0) {
        additionalInfo.student_id = studentResult.rows[0].student_id;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token: token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        username: user.username,
        avatar_url: user.avatar_url,
        ...additionalInfo
      }
    });

  } catch (error) {
    console.error('❌ Mobile login error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

exports.verifyToken = async (req, res) => {
  // If we reach here, the authMobile middleware has already verified the token
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      user_id: req.user.user_id,
      email: req.user.email,
      full_name: req.user.full_name,
      role: req.user.role
    }
  });
};

exports.login = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Cần có Token' });
  }

  try {
    // 1. Xác thực Token với Firebase
    console.log('🔐 Đang xác thực token...');
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('✅ Email đã xác thực từ Token:', decodedToken.email);
    const { email } = decodedToken;

    // 2. Kiểm tra xem người dùng có tồn tại trong cơ sở dữ liệu không
    console.log('🔍 Đang tìm user trong database:', email);
    const userQuery = 'SELECT * FROM users WHERE email = $1 AND is_active = TRUE';
    const result = await pool.query(userQuery, [email]);
    console.log('📊 Kết quả tìm kiếm:', result.rows.length, 'user(s)');

    if (result.rows.length === 0) {
      console.log('❌ User không tồn tại hoặc chưa kích hoạt');
      return res.status(401).json({ 
        message: 'Không được phép. Tài khoản không tồn tại hoặc chưa kích hoạt. Vui lòng liên hệ Admin.',
        email: email
      });
    }

    const user = result.rows[0];
    console.log('✅ Đăng nhập thành công:', user.email, '-', user.role);

    // 3. Lấy thêm thông tin lecturer_id hoặc student_id nếu cần
    let additionalInfo = {};
    
    if (user.role === 'LECTURER') {
      const lecturerQuery = 'SELECT lecturer_id FROM lecturers WHERE user_id = $1';
      const lecturerResult = await pool.query(lecturerQuery, [user.user_id]);
      if (lecturerResult.rows.length > 0) {
        additionalInfo.lecturer_id = lecturerResult.rows[0].lecturer_id;
      }
    } else if (user.role === 'STUDENT') {
      const studentQuery = 'SELECT student_id FROM students WHERE user_id = $1';
      const studentResult = await pool.query(studentQuery, [user.user_id]);
      if (studentResult.rows.length > 0) {
        additionalInfo.student_id = studentResult.rows[0].student_id;
      }
    }

    // 4. Trả về thông tin người dùng
    res.json({
      message: 'Đăng nhập thành công',
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        username: user.username,
        avatar_url: user.avatar_url,
        ...additionalInfo
      }
    });

  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error.message);
    console.error('Stack:', error.stack);
    res.status(401).json({ message: 'Xác thực đăng nhập thất bại', error: error.message });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Get user info
    const userQuery = 'SELECT user_id, username, email, full_name, role FROM users WHERE user_id = $1';
    const userResult = await pool.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get additional info based on role
    if (user.role === 'STUDENT') {
      const studentQuery = 'SELECT student_id FROM students WHERE user_id = $1';
      const studentResult = await pool.query(studentQuery, [userId]);
      if (studentResult.rows.length > 0) {
        user.student_id = studentResult.rows[0].student_id;
      }
    } else if (user.role === 'LECTURER') {
      const lecturerQuery = 'SELECT lecturer_id FROM lecturers WHERE user_id = $1';
      const lecturerResult = await pool.query(lecturerQuery, [userId]);
      if (lecturerResult.rows.length > 0) {
        user.lecturer_id = lecturerResult.rows[0].lecturer_id;
      }
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: error.message });
  }
};