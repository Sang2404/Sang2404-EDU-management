const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'student_management',
  password: '123456',
  port: 5432,
});

async function importData() {
  try {
    const fileName = process.argv[2];
    
    if (!fileName) {
      console.log('❌ Vui lòng cung cấp tên file SQL');
      console.log('   Cách dùng: node server/import_data.js <tên_file.sql>\n');
      
      // Liệt kê các file có sẵn
      const dbDir = path.join(__dirname, '../database');
      const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.sql'));
      
      if (files.length > 0) {
        console.log('📋 Các file SQL có sẵn:');
        files.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
      }
      
      process.exit(1);
    }

    const filePath = path.join(__dirname, '../database', fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Không tìm thấy file: ${fileName}`);
      process.exit(1);
    }

    console.log(`📥 Đang import file: ${fileName}...\n`);

    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);

    console.log('✅ Import dữ liệu thành công!\n');

    // Hiển thị thống kê
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM faculties) as faculties,
        (SELECT COUNT(*) FROM majors) as majors,
        (SELECT COUNT(*) FROM lecturers) as lecturers,
        (SELECT COUNT(*) FROM students) as students,
        (SELECT COUNT(*) FROM subjects) as subjects,
        (SELECT COUNT(*) FROM course_sections) as sections,
        (SELECT COUNT(*) FROM schedules) as schedules,
        (SELECT COUNT(*) FROM grades) as grades
    `);

    console.log('📊 Thống kê dữ liệu:');
    console.table(stats.rows[0]);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

importData();
