const admin = require('../config/firebase');
const pool = require('../config/db');

exports.login = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Cần có Token' });
  }

  try {
    // 1. Xác thực Token với Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('✅ Email đã xác thực từ Token:', decodedToken.email);
    const { email } = decodedToken;

    // 2. Kiểm tra xem người dùng có tồn tại trong cơ sở dữ liệu không
    const userQuery = 'SELECT * FROM users WHERE email = $1 AND is_active = TRUE';
    const result = await pool.query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        message: 'Không được phép. Tài khoản không tồn tại hoặc chưa kích hoạt. Vui lòng liên hệ Admin.' 
      });
    }

    const user = result.rows[0];

    // 3. Trả về thông tin người dùng
    res.json({
      message: 'Đăng nhập thành công',
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        username: user.username,
        avatar_url: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(401).json({ message: 'Xác thực đăng nhập thất bại', error: error.message });
  }
};
