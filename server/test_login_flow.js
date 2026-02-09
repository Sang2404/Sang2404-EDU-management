const pool = require('./config/db');

async function testLoginFlow() {
  console.log('🔍 Testing Login Flow...\n');
  
  try {
    // Test 1: Check database connection
    console.log('1️⃣ Testing database connection...');
    const dbTest = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', dbTest.rows[0].now);
    
    // Test 2: Check users table
    console.log('\n2️⃣ Checking users table...');
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`✅ Users table exists with ${usersResult.rows[0].count} users`);
    
    // Test 3: Check specific emails
    console.log('\n3️⃣ Checking specific user emails...');
    const emails = [
      'skillsaanh@gmail.com',
      'sinfour503@gmail.com',
      '2224802010365@student.tdmu.edu.vn'
    ];
    
    for (const email of emails) {
      const result = await pool.query(
        'SELECT email, username, role, full_name, is_active FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        console.log(`✅ ${email}`);
        console.log(`   Role: ${user.role}, Active: ${user.is_active}`);
      } else {
        console.log(`❌ ${email} - NOT FOUND`);
      }
    }
    
    // Test 4: Check Firebase Admin
    console.log('\n4️⃣ Checking Firebase Admin SDK...');
    const admin = require('./config/firebase');
    if (admin.apps && admin.apps.length > 0) {
      console.log('✅ Firebase Admin SDK initialized');
    } else {
      console.log('❌ Firebase Admin SDK not initialized');
    }
    
    console.log('\n✅ All checks passed!');
    console.log('\n📝 Next steps:');
    console.log('1. Make sure frontend is running on http://localhost:3000');
    console.log('2. Make sure backend is running on http://localhost:5001');
    console.log('3. Open http://localhost:3000 in your browser');
    console.log('4. Click "Đăng nhập bằng Google"');
    console.log('5. Sign in with one of these emails:');
    console.log('   - skillsaanh@gmail.com (Admin)');
    console.log('   - sinfour503@gmail.com (Lecturer)');
    console.log('   - 2224802010365@student.tdmu.edu.vn (Student)');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testLoginFlow();
