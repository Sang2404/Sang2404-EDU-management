const pool = require('../config/db');
require('dotenv').config();

async function verifyData() {
  try {
    const studentId = '2224802010365';
    
    console.log(`--- Verifying Data for Student: ${studentId} ---`);
    
    // 1. Basic Info
    const info = await pool.query(`
      SELECT u.full_name, s.gpa_accumulated, c.class_name
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN classes c ON s.class_id = c.class_id
      WHERE s.student_id = $1
    `, [studentId]);
    console.log('Basic Info:', info.rows[0]);

    // 2. Grades
    // Correct schema based on aiChatService.js: grades -> course_sections -> subjects
    const grades = await pool.query(`
      SELECT sub.subject_name, g.total_10, g.grade_char
      FROM grades g
      JOIN course_sections cs ON g.section_id = cs.section_id
      JOIN subjects sub ON cs.subject_id = sub.subject_id
      WHERE g.student_id = $1
    `, [studentId]);
    
    console.log('\n--- Grades List ---');
    grades.rows.forEach(g => {
      console.log(`- ${g.subject_name}: ${g.total_10} (${g.grade_char})`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

verifyData();
