const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');
const pool = require('../config/db');

const authUnified = async (req, res, next) => {
  console.log('--- Auth Unified Started ---');
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found');
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }

    const token = authHeader.substring(7);
    let userId = null;

    // === Step 1: JWT ===
    try {
      console.log('🔍 Checking JWT...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      userId = decoded.user_id;
      console.log('✅ JWT OK, user_id:', userId);
    } catch (jwtError) {
      console.log('ℹ️ JWT failed, checking Firebase...');
      
      // === Step 2: Firebase ===
      try {
        const decodedFirebase = await admin.auth().verifyIdToken(token);
        const email = decodedFirebase.email;
        console.log('✅ Firebase verified email:', email);
        
        console.log('🔍 Querying DB for email...');
        const userByEmail = await pool.query(
          'SELECT user_id FROM users WHERE email = $1 AND is_active = TRUE',
          [email]
        );
        console.log('📊 DB Query result rows:', userByEmail.rows.length);
        
        if (userByEmail.rows.length === 0) {
          console.log('❌ User not found in DB');
          return res.status(401).json({ success: false, message: 'User không tồn tại' });
        }
        
        userId = userByEmail.rows[0].user_id;
        console.log('✅ Found user_id from Firebase:', userId);
      } catch (firebaseError) {
        console.error('❌ Both Auth failed.');
        return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
      }
    }

    // === Step 3: Fetch Full User ===
    console.log('🔍 Fetching full user data for ID:', userId);
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1 AND is_active = TRUE', [userId]);
    
    if (result.rows.length === 0) {
      console.log('❌ Final user check failed');
      return res.status(401).json({ success: false, message: 'User không tồn tại' });
    }

    const user = result.rows[0];
    console.log('✅ User found:', user.email);
    
    if (user.role === 'STUDENT') {
      const studentResult = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [user.user_id]);
      if (studentResult.rows.length > 0) {
        user.student_id = studentResult.rows[0].student_id;
        console.log('✅ Student ID attached:', user.student_id);
      }
    }
    
    req.user = user;
    console.log('--- Auth Unified Success ---');
    next();
    
  } catch (error) {
    console.error('💥 CRITICAL AUTH ERROR:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server xác thực' });
  }
};

module.exports = authUnified;
