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
        console.log('🔄 Starting database reset and account update...\n');

        // Step 1: Delete old demo accounts
        console.log('🗑️  Deleting old demo accounts...');
        await pool.query(`
            DELETE FROM users 
            WHERE email IN (
                'admin.demo@gmail.com', 
                'giangvien.demo@gmail.com', 
                'sinhvien.cuaban@gmail.com',
                'skillsanh@gmail.com'
            )
        `);
        console.log('✅ Old accounts deleted\n');

        // Step 2: Insert new Admin
        console.log('👤 Creating Admin account...');
        await pool.query(`
            INSERT INTO users (email, username, role, full_name, is_active) 
            VALUES ('skillsaanh@gmail.com', 'ADMIN01', 'ADMIN', 'Quản trị viên', true)
            ON CONFLICT (email) DO UPDATE 
            SET username = 'ADMIN01', role = 'ADMIN', full_name = 'Quản trị viên', is_active = true
        `);
        console.log('✅ Admin account created\n');

        // Step 3: Ensure faculty exists
        console.log('🏢 Ensuring faculty exists...');
        await pool.query(`
            INSERT INTO faculties (faculty_id, faculty_name, description) 
            VALUES ('IET', 'Viện Kỹ thuật - Công nghệ', 'Viện đào tạo về kỹ thuật và công nghệ')
            ON CONFLICT (faculty_id) DO NOTHING
        `);
        console.log('✅ Faculty ready\n');

        // Step 4: Insert new Lecturer
        console.log('👨‍🏫 Creating Lecturer account...');
        
        // First, delete old lecturer if exists
        await pool.query(`DELETE FROM lecturers WHERE lecturer_id = 'GV001'`);
        
        // Insert/update user
        await pool.query(`
            INSERT INTO users (email, username, role, full_name, is_active) 
            VALUES ('sinfour503@gmail.com', 'GV001', 'LECTURER', 'Nguyễn Văn A', true)
            ON CONFLICT (email) DO UPDATE 
            SET username = 'GV001', role = 'LECTURER', full_name = 'Nguyễn Văn A', is_active = true
        `);
        
        // Insert lecturer record
        await pool.query(`
            INSERT INTO lecturers (lecturer_id, user_id, faculty_id, degree, phone) 
            VALUES (
                'GV001', 
                (SELECT user_id FROM users WHERE email = 'sinfour503@gmail.com'), 
                'IET', 
                'Thạc sĩ', 
                '0987654321'
            )
        `);
        console.log('✅ Lecturer account created\n');

        // Step 5: Ensure major and class exist
        console.log('📚 Ensuring major and class exist...');
        await pool.query(`
            INSERT INTO majors (major_id, faculty_id, major_name, total_credits) 
            VALUES ('7480201', 'IET', 'Công nghệ thông tin', 150)
            ON CONFLICT (major_id) DO NOTHING
        `);
        
        await pool.query(`
            INSERT INTO classes (class_id, major_id, advisor_id, class_name, enrollment_year) 
            VALUES ('D22HT01', '7480201', 'GV001', 'ĐH CNTT K14 - Lớp 01', 2022)
            ON CONFLICT (class_id) DO NOTHING
        `);
        console.log('✅ Major and class ready\n');

        // Step 6: Insert new Student
        console.log('👨‍🎓 Creating Student account...');
        
        // First, delete old student if exists
        await pool.query(`DELETE FROM students WHERE student_id = '2224802010365'`);
        
        // Insert/update user
        await pool.query(`
            INSERT INTO users (email, username, role, full_name, is_active) 
            VALUES ('2224802010365@student.tdmu.edu.vn', '2224802010365', 'STUDENT', 'Nguyễn Văn B', true)
            ON CONFLICT (email) DO UPDATE 
            SET username = '2224802010365', role = 'STUDENT', full_name = 'Nguyễn Văn B', is_active = true
        `);
        
        // Insert student record
        await pool.query(`
            INSERT INTO students (student_id, user_id, class_id, dob, gender, status, gpa_accumulated) 
            VALUES (
                '2224802010365', 
                (SELECT user_id FROM users WHERE email = '2224802010365@student.tdmu.edu.vn'), 
                'D22HT01', 
                '2004-01-01', 
                'Nam',
                'STUDYING',
                0.0
            )
        `);
        console.log('✅ Student account created\n');

        console.log('═══════════════════════════════════════════════════════════════════════════');
        console.log('✅ All accounts updated successfully!\n');

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
            console.log(`   Email:     ${user.email}`);
            console.log(`   Username:  ${user.username}`);
            console.log(`   Full Name: ${user.full_name}`);
            console.log(`   Active:    ${user.is_active ? '✓' : '✗'}`);
            if (user.role_id) {
                console.log(`   ${user.role === 'LECTURER' ? 'Lecturer' : 'Student'} ID: ${user.role_id}`);
            }
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════════════════════════════');
        console.log('\n✨ You can now login with these accounts using Google Sign-in!\n');
        console.log('📝 Login credentials:');
        console.log('   🔑 Admin:    skillsaanh@gmail.com');
        console.log('   🔑 Lecturer: sinfour503@gmail.com');
        console.log('   🔑 Student:  2224802010365@student.tdmu.edu.vn');
        console.log('');

    } catch (e) {
        console.error('❌ Error:', e.message);
        console.error(e);
    } finally {
        pool.end();
    }
};

run();
