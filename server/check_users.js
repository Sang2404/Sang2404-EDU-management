const pool = require('./config/db');

async function checkUsers() {
  try {
    console.log('🔍 Checking users table...\n');
    
    const result = await pool.query('SELECT user_id, email, username, role, full_name, is_active FROM users ORDER BY user_id');
    
    if (result.rows.length === 0) {
      console.log('❌ No users found in database!');
      console.log('📝 You need to run database/schema.sql in pgAdmin');
    } else {
      console.log(`✅ Found ${result.rows.length} users:\n`);
      result.rows.forEach(user => {
        console.log(`ID: ${user.user_id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Username: ${user.username}`);
        console.log(`Role: ${user.role}`);
        console.log(`Full Name: ${user.full_name}`);
        console.log(`Active: ${user.is_active}`);
        console.log('---');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('does not exist')) {
      console.log('\n📝 The users table does not exist!');
      console.log('You need to run database/schema.sql in pgAdmin:');
      console.log('1. Open pgAdmin 4');
      console.log('2. Connect to PostgreSQL');
      console.log('3. Right-click on "student_management" database');
      console.log('4. Select "Query Tool"');
      console.log('5. Open file: database/schema.sql');
      console.log('6. Click Execute (F5)');
    }
    process.exit(1);
  }
}

checkUsers();
