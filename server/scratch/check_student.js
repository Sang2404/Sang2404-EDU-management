const pool = require('../config/db');
require('dotenv').config();

async function checkStudent() {
  try {
    const userId = 95;
    const result = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [userId]);
    console.log(`User ID 95 student_id: ${result.rows.length > 0 ? result.rows[0].student_id : 'NULL'}`);
    process.exit(0);
  } catch (err) {
    console.error('Error checking student:', err);
    process.exit(1);
  }
}

checkStudent();
