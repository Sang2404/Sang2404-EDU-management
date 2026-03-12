const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function restoreBackup() {
  try {
    console.log('🔄 Đang khôi phục dữ liệu từ backup...\n');
    
    const backupFile = path.join(__dirname, '../database/edu_management_backup.sql');
    const sql = fs.readFileSync(backupFile, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (stmt) {
        try {
          await pool.query(stmt);
          console.log(`✅ Thực thi câu lệnh ${i + 1}/${statements.length}`);
        } catch (error) {
          console.warn(`⚠️  Lỗi ở câu lệnh ${i + 1}: ${error.message}`);
        }
      }
    }
    
    console.log('\n✅ Khôi phục dữ liệu thành công!\n');
    
    // Check users
    const userResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('📊 Tổng số users:', userResult.rows[0].count);
    
    // List some users
    const usersListResult = await pool.query('SELECT user_id, email, full_name, role FROM users LIMIT 5');
    console.log('\n👥 Danh sách users (5 đầu tiên):');
    usersListResult.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.full_name}) - ${user.role}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khôi phục:', error.message);
    process.exit(1);
  }
}

restoreBackup();
