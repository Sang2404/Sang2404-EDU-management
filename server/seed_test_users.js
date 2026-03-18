const pool = require('./config/db');

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Cleaning up existing data...');
        await client.query('TRUNCATE users, faculties, majors, lecturers, classes, students, subjects, course_sections, section_students, grades, schedules, academic_requests, notifications CASCADE');

        console.log('Seeding Core Test Users...');
        // 1. Admin
        await client.query('INSERT INTO users (email, username, role, full_name) VALUES ($1, $2, $3::user_role, $4)',
            ['skillsanh@gmail.com', 'ADMIN01', 'ADMIN', 'Quản trị viên Hệ thống']);

        // 2. Lecturer
        await client.query('INSERT INTO users (email, username, role, full_name) VALUES ($1, $2, $3::user_role, $4)',
            ['sinfour503@gmail.com', 'GV001', 'LECTURER', 'GS. TS. Nguyễn Văn A']);

        // 3. Students (Targets)
        const targetStudents = [
            ['2224802010365@student.tdmu.edu.vn', '2224802010365', 'STUDENT', 'Sinh viên Test 1'],
            ['trungloptruong123@gmail.com', '2024101010', 'STUDENT', 'Sinh viên Test 2']
        ];

        for (const st of targetStudents) {
            await client.query('INSERT INTO users (email, username, role, full_name) VALUES ($1, $2, $3::user_role, $4)', st);
        }

        // Additional students for statistics
        for (let i = 1; i <= 10; i++) {
            const sid = 2224000 + i;
            await client.query('INSERT INTO users (email, username, role, full_name) VALUES ($1, $2, $3::user_role, $4)',
                [`student${i}@example.com`, `${sid}`, 'STUDENT', `Sinh viên mẫu ${i}`]);
        }

        console.log('Seeding Faculties & Majors...');
        await client.query("INSERT INTO faculties (faculty_id, faculty_name) VALUES ('IET', 'Viện Kỹ thuật - Công nghệ')");
        await client.query("INSERT INTO majors (major_id, faculty_id, major_name) VALUES ('7480201', 'IET', 'Công nghệ thông tin')");

        console.log('Linking Lecturer...');
        await client.query(`
            INSERT INTO lecturers (lecturer_id, user_id, faculty_id, degree, phone) 
            VALUES ('GV001', (SELECT user_id FROM users WHERE email='sinfour503@gmail.com'), 'IET', 'Tiến sĩ', '0123456789')
        `);

        console.log('Seeding Classes...');
        await client.query(`
            INSERT INTO classes (class_id, major_id, advisor_id, class_name, enrollment_year) 
            VALUES ('D22HT01', '7480201', 'GV001', 'Lớp CNTT K14-01', 2022)
        `);

        console.log('Linking Target Students...');
        for (const st of targetStudents) {
            await client.query(`
                INSERT INTO students (student_id, user_id, class_id, dob, gender, status) 
                VALUES ($1, (SELECT user_id FROM users WHERE email=$2), 'D22HT01', '2004-01-01', 'Nam', 'STUDYING')
            `, [st[1], st[0]]);
        }

        console.log('Seeding Subjects & Course Sections...');
        const subjects = [
            ['TIN01', 'Nhập môn Lập trình', 3],
            ['TIN02', 'Cấu trúc dữ liệu và Giải thuật', 4],
            ['TIN03', 'Cơ sở dữ liệu', 3],
            ['TIN04', 'Lập trình Web', 3],
            ['TIN05', 'Mạng máy tính', 3]
        ];
        for (const s of subjects) {
            await client.query('INSERT INTO subjects (subject_id, subject_name, credits) VALUES ($1, $2, $3)', s);
            await client.query(`
                INSERT INTO course_sections (subject_id, lecturer_id, semester, academic_year, section_code, max_capacity, room_default) 
                VALUES ($1, 'GV001', 'HK1', '2024-2025', $2, 60, $3)
            `, [s[0], `${s[0]}-01`, `Room-${s[0]}`]);
        }

        console.log('Enrolling Students...');
        const sectionIds = await client.query('SELECT section_id FROM course_sections');
        for (const sec of sectionIds.rows) {
            for (const st of targetStudents) {
                await client.query('INSERT INTO section_students (section_id, student_id) VALUES ($1, $2)', [sec.section_id, st[1]]);
            }
        }

        console.log('Adding Schedules...');
        const weekdays = [2, 3, 4, 5, 6];
        for (let i = 0; i < sectionIds.rows.length; i++) {
            const sec = sectionIds.rows[i];
            await client.query(`
                INSERT INTO schedules (section_id, day_of_week, start_period, end_period, room) 
                VALUES ($1, $2, $3, $4, $5)
            `, [sec.section_id, weekdays[i], 1, 4, `A10${i + 1}`]);
        }

        console.log('Seeding Grades...');
        for (const st of targetStudents) {
            const sid = st[1];
            for (let i = 0; i < sectionIds.rows.length; i++) {
                const sec = sectionIds.rows[i];
                // Make ALL grades the same for both
                const isApproved = i < 4 ? 'APPROVED' : 'DRAFT';
                const scoreAtt = 10;
                const scoreMid = 9;
                const scoreFin = 9;
                const total10 = 9.3;

                await client.query(`
                    INSERT INTO grades (section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) 
                    VALUES ($1, $2, $3, $4, $5, $6, 4.0, 'A', $7::grade_status)
                `, [sec.section_id, sid, scoreAtt, scoreMid, scoreFin, total10, isApproved]);
            }
        }

        console.log('Seeding Academic Requests...');
        for (const st of targetStudents) {
            await client.query(`
                INSERT INTO academic_requests (student_id, request_type, reason, status, admin_response) 
                VALUES ($1, 'REVIEW'::request_type, 'Phúc khảo điểm thi.', 'PENDING', NULL)
            `, [st[1]]);
        }

        console.log('Seeding Notifications...');
        for (const st of targetStudents) {
            await client.query(`
                INSERT INTO notifications (user_id, title, message) 
                VALUES ((SELECT user_id FROM users WHERE email=$1), 'Tin nhắn mới', 'Chào mừng bạn đã gia nhập hệ thống.')
            `, [st[0]]);
        }

        await client.query('COMMIT');
        console.log('SUCCESS: BOTH STUDENTS ARE NOW IDENTICAL.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('ERROR:', e);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
