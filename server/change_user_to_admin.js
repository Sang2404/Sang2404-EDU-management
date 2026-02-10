/**
 * Script để thay đổi user thành ADMIN
 * Chạy: node change_user_to_admin.js
 */

const pool = require('./config/db');

const EMAIL_TO_CHANGE = '2224802010902@student.tdmu.edu.vn';

async function changeToAdmin() {
  try {
    console.log(`\n🔄 Đang thay đổi role của ${EMAIL_TO_CHANGE} thành ADMIN...\n`);

    // Kiểm tra user có tồn tại không
    const checkUser = await pool.query(
      'SELECT user_id, email, username, role FROM users WHERE email = $1',
      [EMAIL_TO_CHANGE]
    );

    if (checkUser.rows.length === 0) {
      console.log('❌ Không tìm thấy user với email này!');
      console.log('💡 User cần đăng nhập ít nhất 1 lần để được tạo trong database.\n');
      process.exit(1);
    }

    const user = checkUser.rows[0];
    console.log('📋 Thông tin user hiện tại:');
    console.log(`   - User ID: ${user.user_id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Role hiện tại: ${user.role}\n`);

    // Thay đổi role thành ADMIN
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING *',
      ['ADMIN', EMAIL_TO_CHANGE]
    );

    if (result.rows.length > 0) {
      console.log('✅ Thay đổi thành công!');
      console.log('📋 Thông tin user sau khi cập nhật:');
      console.log(`   - User ID: ${result.rows[0].user_id}`);
      console.log(`   - Email: ${result.rows[0].email}`);
      console.log(`   - Username: ${result.rows[0].username}`);
      console.log(`   - Role mới: ${result.rows[0].role}`);
      console.log(`   - Full name: ${result.rows[0].full_name}\n`);
      
      console.log('🎉 User này giờ đã là ADMIN!');
      console.log('💡 Đăng xuất và đăng nhập lại để thấy thay đổi.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

changeToAdmin();
