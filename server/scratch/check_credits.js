const pool = require('../config/db');
require('dotenv').config();

async function checkCredits() {
  try {
    const studentId = '2224802010365';
    const query = `
      SELECT 
        s.subject_name,
        s.credits,
        g.total_10,
        g.total_4,
        g.grade_char
      FROM grades g
      JOIN course_sections cs ON g.section_id = cs.section_id
      JOIN subjects s ON cs.subject_id = s.subject_id
      WHERE g.student_id = $1
    `;
    
    const result = await pool.query(query, [studentId]);
    console.log('--- Grades and Credits ---');
    result.rows.forEach(g => {
        console.log(`- ${g.subject_name}: ${g.total_10} (${g.grade_char}), Credits: ${g.credits}, Point4: ${g.total_4}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCredits();
