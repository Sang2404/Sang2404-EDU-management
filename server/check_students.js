const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'student_management',
  password: '123456',
  port: 5432,
});

async function checkStudents() {
  try {
    // Lấy tất cả sinh viên
    const result = await pool.query(
      "SELECT COUNT(*) as total FROM students"
    );
    
    console.log('Tổng sinh viên:', result.rows[0].total);
    
    // Lấy 10 sinh viên đầu
    const students = await pool.query(
      "SELECT student_id, user_id FROM students LIMIT 10"
    );
    
    console.log('\n10 sinh viên đầu:');
    students.rows.forEach(row => {
      console.log(`- ${row.student_id}`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

checkStudents();
