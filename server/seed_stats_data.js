const pool = require('./config/db');

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Cleaning up existing data...');
        // Cascade delete all relevant tables
        await client.query('TRUNCATE users, faculties, majors, lecturers, classes, students, subjects, course_sections, section_students, grades, schedules, academic_requests, notifications CASCADE');

        console.log('Seeding Faculties...');
        const faculties = [
            ['CNTT', 'Công nghệ Thông tin', 'Khoa Công nghệ Thông tin'],
            ['KTDN', 'Kinh tế Doanh nghiệp', 'Khoa Kinh tế Doanh nghiệp'],
            ['NN', 'Ngoại ngữ', 'Khoa Ngoại ngữ'],
            ['DL', 'Du lịch', 'Khoa Du lịch'],
            ['Y', 'Y học', 'Khoa Y học']
        ];
        for (const f of faculties) {
            await client.query('INSERT INTO faculties (faculty_id, faculty_name, description) VALUES ($1, $2, $3)', f);
        }

        console.log('Seeding Majors...');
        const majors = [
            ['7480201', 'CNTT', 'Công nghệ thông tin'],
            ['7480202', 'CNTT', 'An toàn thông tin'],
            ['7340101', 'KTDN', 'Quản trị kinh doanh'],
            ['7340102', 'KTDN', 'Kế toán'],
            ['7220201', 'NN', 'Ngôn ngữ Anh']
        ];
        for (const m of majors) {
            await client.query('INSERT INTO majors (major_id, faculty_id, major_name) VALUES ($1, $2, $3)', m);
        }

        console.log('Seeding Users (Admin, Lecturers, Students)...');
        const users = [
            ['skillsaanh@gmail.com', 'ADMIN01', 'ADMIN', 'Quản trị viên'],
            ['gv01@edu.vn', 'GV001', 'LECTURER', 'Nguyễn Văn A'],
            ['gv02@edu.vn', 'GV002', 'LECTURER', 'Trần Thị B'],
            ['gv03@edu.vn', 'GV003', 'LECTURER', 'Lê Văn C'],
            ['gv04@edu.vn', 'GV004', 'LECTURER', 'Phạm Hoàng D'],
            ['gv05@edu.vn', 'GV005', 'LECTURER', 'Đỗ Thùy E']
        ];
        // Generate 15 students
        for (let i = 1; i <= 15; i++) {
            const id = 2224000 + i;
            users.push([`sv${i}@student.edu.vn`, `${id}`, 'STUDENT', `Sinh viên ${i}`]);
        }

        for (const u of users) {
            await client.query('INSERT INTO users (email, username, role, full_name) VALUES ($1, $2, $3::user_role, $4)', u);
        }

        console.log('Seeding Lecturers...');
        const lecturersData = [
            ['GV001', 'gv01@edu.vn', 'CNTT', 'Tiến sĩ'],
            ['GV002', 'gv02@edu.vn', 'CNTT', 'Thạc sĩ'],
            ['GV003', 'gv03@edu.vn', 'KTDN', 'Tiến sĩ'],
            ['GV004', 'gv04@edu.vn', 'NN', 'Thạc sĩ'],
            ['GV005', 'gv05@edu.vn', 'KTDN', 'Thạc sĩ']
        ];
        for (const l of lecturersData) {
            await client.query(`
                INSERT INTO lecturers (lecturer_id, user_id, faculty_id, degree) 
                VALUES ($1, (SELECT user_id FROM users WHERE email=$2), $3, $4)
            `, l);
        }

        console.log('Seeding Classes...');
        const classes = [
            ['D22HT01', '7480201', 'GV001', 'ĐH CNTT 22-01', 2022],
            ['D22AT01', '7480202', 'GV002', 'ĐH ATTT 22-01', 2022],
            ['D22QT01', '7340101', 'GV003', 'ĐH QTKD 22-01', 2022],
            ['D22KT01', '7340102', 'GV005', 'ĐH Kế Toán 22-01', 2022]
        ];
        for (const c of classes) {
            await client.query('INSERT INTO classes (class_id, major_id, advisor_id, class_name, enrollment_year) VALUES ($1, $2, $3, $4, $5)', c);
        }

        console.log('Seeding Students...');
        for (let i = 1; i <= 15; i++) {
            const student_id = `${2224000 + i}`;
            const class_id = i <= 5 ? 'D22HT01' : (i <= 8 ? 'D22AT01' : (i <= 12 ? 'D22QT01' : 'D22KT01'));
            await client.query(`
                INSERT INTO students (student_id, user_id, class_id, dob, gender, status) 
                VALUES ($1, (SELECT user_id FROM users WHERE username=$2), $3, '2004-01-01', $4, 'STUDYING'::student_status)
            `, [student_id, student_id, class_id, i % 2 === 0 ? 'Nữ' : 'Nam']);
        }

        console.log('Seeding Subjects...');
        const subjects = [
            ['TIN01', 'Lập trình C', 3],
            ['TIN02', 'Cấu trúc dữ liệu', 4],
            ['TIN03', 'Cơ sở dữ liệu', 3],
            ['TOAN01', 'Toán Cao Cấp', 4],
            ['ENG01', 'Tiếng Anh 1', 2],
            ['QT01', 'Quản trị học', 3],
            ['KT01', 'Nguyên lý kế toán', 3]
        ];
        for (const sub of subjects) {
            await client.query('INSERT INTO subjects (subject_id, subject_name, credits) VALUES ($1, $2, $3)', sub);
        }

        console.log('Seeding Course Sections...');
        const sections = [
            ['TIN01', 'GV001', 'HK1', '2024-2025', 'TIN01-01', 50, 'A101'],
            ['TIN02', 'GV001', 'HK1', '2024-2025', 'TIN02-01', 40, 'A201'],
            ['TIN03', 'GV002', 'HK1', '2024-2025', 'TIN03-01', 45, 'A301'],
            ['TOAN01', 'GV002', 'HK1', '2024-2025', 'TOAN01-01', 60, 'B101'],
            ['QT01', 'GV003', 'HK1', '2024-2025', 'QT01-01', 50, 'C101'],
            ['KT01', 'GV005', 'HK1', '2024-2025', 'KT01-01', 40, 'D101']
        ];
        for (const sec of sections) {
            await client.query(`
                INSERT INTO course_sections (subject_id, lecturer_id, semester, academic_year, section_code, max_capacity, room_default) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, sec);
        }

        console.log('Seeding Students into Sections (Enrollment)...');
        for (let i = 1; i <= 15; i++) {
            const sid = `${2224000 + i}`;
            await client.query('INSERT INTO section_students (section_id, student_id) VALUES ((SELECT section_id FROM course_sections WHERE section_code=\'TOAN01-01\'), $1)', [sid]);

            if (i <= 8) {
                await client.query('INSERT INTO section_students (section_id, student_id) VALUES ((SELECT section_id FROM course_sections WHERE section_code=\'TIN01-01\'), $1)', [sid]);
                await client.query('INSERT INTO section_students (section_id, student_id) VALUES ((SELECT section_id FROM course_sections WHERE section_code=\'TIN02-01\'), $1)', [sid]);
            } else {
                await client.query('INSERT INTO section_students (section_id, student_id) VALUES ((SELECT section_id FROM course_sections WHERE section_code=\'QT01-01\'), $1)', [sid]);
                await client.query('INSERT INTO section_students (section_id, student_id) VALUES ((SELECT section_id FROM course_sections WHERE section_code=\'KT01-01\'), $1)', [sid]);
            }
        }

        console.log('Seeding Grades...');
        const enrollments = await client.query('SELECT section_id, student_id FROM section_students');

        for (const row of enrollments.rows) {
            const att = (Math.random() * 2 + 8).toFixed(1);
            const mid = (Math.random() * 5 + 5).toFixed(1);
            const fin = (Math.random() * 6 + 4).toFixed(1);

            const total10 = parseFloat((att * 0.1 + mid * 0.3 + fin * 0.6).toFixed(2));
            let char = 'F';
            let total4 = 0.0;

            if (total10 >= 8.5) { char = 'A'; total4 = 4.0; }
            else if (total10 >= 7.0) { char = 'B'; total4 = 3.0; }
            else if (total10 >= 5.5) { char = 'C'; total4 = 2.0; }
            else if (total10 >= 4.0) { char = 'D'; total4 = 1.0; }
            else { char = 'F'; total4 = 0.0; }

            await client.query(`
                INSERT INTO grades (section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'APPROVED'::grade_status)
            `, [row.section_id, row.student_id, att, mid, fin, total10, total4, char]);
        }

        console.log('Seeding Schedules...');
        const schedules = [
            ['TIN01-01', 2, 1, 3, 'A101'],
            ['TIN02-01', 2, 4, 6, 'A201'],
            ['TIN03-01', 3, 1, 3, 'A301'],
            ['TOAN01-01', 4, 1, 4, 'B101'],
            ['QT01-01', 5, 1, 3, 'C101'],
            ['KT01-01', 6, 1, 3, 'D101']
        ];
        for (const sch of schedules) {
            await client.query(`
                INSERT INTO schedules (section_id, day_of_week, start_period, end_period, room) 
                VALUES ((SELECT section_id FROM course_sections WHERE section_code=$1), $2, $3, $4, $5)
            `, sch);
        }

        await client.query('COMMIT');
        console.log('Database seeded with consistent statistical data successfully!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error seeding database:', e);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
