require('dotenv').config({ path: './server/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'student_management',
  password: '123456',
  port: 5432,
});

async function checkAndAddUser() {
  try {
    // Kiểm tra user hiện tại
    console.log('🔍 Kiểm tra users trong database...\n');
    const checkQuery = `
      SELECT user_id, email, full_name, role, is_active 
      FROM users 
      WHERE email LIKE '%skillsanh%' OR email LIKE '%admin%'
      ORDER BY email;
    `;
    const result = await pool.query(checkQuery);
    
    console.log('📋 Danh sách users hiện tại:');
    console.table(result.rows);
    
    // Thêm user skillsanh@gmail.com nếu chưa có
    const email = 'skillsanh@gmail.com';
    const checkExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (checkExist.rows.length === 0) {
      console.log(`\n➕ Thêm user mới: ${email}`);
      const insertQuery = `
        INSERT INTO users (email, full_name, role, username, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const newUser = await pool.query(insertQuery, [
        email,
        'Nguyễn Văn Sánh',
        'ADMIN',
        'skillsanh',
        true
      ]);
      console.log('✅ Đã thêm user mới:');
      console.table(newUser.rows);
    } else {
      console.log(`\n✅ User ${email} đã tồn tại`);
      
      // Đảm bảo user được kích hoạt
      if (!checkExist.rows[0].is_active) {
        await pool.query('UPDATE users SET is_active = TRUE WHERE email = $1', [email]);
        console.log('✅ Đã kích hoạt user');
      }
    }
    
    // Kiểm tra lại sau khi thêm
    console.log('\n📋 Danh sách users sau khi cập nhật:');
    const finalResult = await pool.query(checkQuery);
    console.table(finalResult.rows);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndAddUser();
