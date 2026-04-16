const pool = require('../config/db');
require('dotenv').config();

async function checkUsers() {
  try {
    const result = await pool.query('SELECT email, role, full_name, user_id FROM users');
    console.log('--- Database Users ---');
    result.rows.forEach(u => console.log(`[ID:${u.user_id}] [${u.role}] ${u.email} (${u.full_name})`));
    console.log('----------------------');
    process.exit(0);
  } catch (err) {
    console.error('Error checking users:', err);
    process.exit(1);
  }
}

checkUsers();
