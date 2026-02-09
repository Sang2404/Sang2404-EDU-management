const pool = require('./config/db');

async function addEmail() {
  try {
    console.log('🔄 Adding skillsanh@gmail.com to database...\n');
    
    // Check if email already exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['skillsanh@gmail.com']
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Email already exists in database!');
      console.log(checkResult.rows[0]);
      process.exit(0);
    }
    
    // Add new admin user
    const insertResult = await pool.query(
      `INSERT INTO users (email, username, role, full_name, is_active) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      ['skillsanh@gmail.com', 'ADMIN02', 'ADMIN', 'Quản trị viên 2', true]
    );
    
    console.log('✅ Successfully added new admin user:');
    console.log(insertResult.rows[0]);
    console.log('\n🎯 You can now login with: skillsanh@gmail.com');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addEmail();
