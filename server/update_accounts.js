const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const run = async () => {
    try {
        console.log('🔄 Starting account update...\n');

        // Read the migration SQL file
        const sqlPath = path.join(__dirname, '../database/migrations/update_user_accounts.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute the migration
        await pool.query(sql);

        console.log('✅ Accounts updated successfully!\n');

        // Verify the accounts
        const result = await pool.query(`
            SELECT 
                u.user_id,
                u.email,
                u.username,
                u.role,
                u.full_name,
                u.is_active,
                CASE 
                    WHEN u.role = 'LECTURER' THEN l.lecturer_id
                    WHEN u.role = 'STUDENT' THEN s.student_id
                    ELSE NULL
                END as role_id
            FROM users u
            LEFT JOIN lecturers l ON u.user_id = l.user_id
            LEFT JOIN students s ON u.user_id = s.user_id
            WHERE u.email IN ('skillsaanh@gmail.com', 'sinfour503@gmail.com', '2224802010365@student.tdmu.edu.vn')
            ORDER BY u.role
        `);

        console.log('📋 Current accounts:');
        console.log('═══════════════════════════════════════════════════════════════════════════\n');
        
        result.rows.forEach(user => {
            console.log(`👤 ${user.role}`);
            console.log(`   Email:    ${user.email}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Full Name: ${user.full_name}`);
            console.log(`   Active:   ${user.is_active ? '✓' : '✗'}`);
            if (user.role_id) {
                console.log(`   ${user.role === 'LECTURER' ? 'Lecturer' : 'Student'} ID: ${user.role_id}`);
            }
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════════════════════════════');
        console.log('\n✨ You can now login with these accounts using Google Sign-in!\n');
        console.log('📝 Login URLs:');
        console.log('   Admin:    skillsaanh@gmail.com');
        console.log('   Lecturer: sinfour503@gmail.com');
        console.log('   Student:  2224802010365@student.tdmu.edu.vn');
        console.log('');

    } catch (e) {
        console.error('❌ Error updating accounts:', e.message);
        console.error(e);
    } finally {
        pool.end();
    }
};

run();
