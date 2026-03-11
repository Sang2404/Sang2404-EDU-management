const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Kết nối trực tiếp
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'student_management',
  password: '123456',
  port: 5432,
});

async function addTestData() {
  try {
    console.log('🔄 Đang thêm dữ liệu test...\n');
    
    const sqlFile = path.join(__dirname, '../database/seed_test_grades.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Dữ liệu test đã thêm thành công!\n');
    
    // Kiểm tra lớp học phần
    const sectionResult = await pool.query(
      "SELECT section_id, section_code, subject_id, lecturer_id FROM course_sections WHERE section_code = 'TESTCS101.01'"
    );
    
    if (sectionResult.rows.length > 0) {
      console.log('📊 Kiểm tra dữ liệu:');
      console.log('✅ Lớp học phần:', sectionResult.rows[0].section_code);
      
      // Kiểm tra sinh viên
      const studentResult = await pool.query(
        "SELECT COUNT(*) as count FROM section_students ss JOIN course_sections cs ON ss.section_id = cs.section_id WHERE cs.section_code = 'TESTCS101.01'"
      );
      console.log('✅ Sinh viên:', studentResult.rows[0].count, 'người');
      
      // Kiểm tra điểm
      const gradeResult = await pool.query(
        "SELECT COUNT(*) as count, status FROM grades g JOIN course_sections cs ON g.section_id = cs.section_id WHERE cs.section_code = 'TESTCS101.01' GROUP BY status"
      );
      console.log('✅ Điểm:');
      gradeResult.rows.forEach(row => {
        console.log('   -', row.count, 'điểm với status:', row.status);
      });
    }
    
    console.log('\n🎯 Tài khoản test:');
    console.log('   Giảng viên: gvtest@gmail.com (GVTEST)');
    console.log('   Sinh viên: svtest1@gmail.com - svtest5@gmail.com');
    console.log('\n📖 Xem hướng dẫn: HUONG_DAN_THEM_DU_LIEU_TEST.md');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addTestData();
