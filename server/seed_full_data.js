const pool = require('./config/db');

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Cleaning up existing data...');
        // Order matters due to FK constraints if not using CASCADE, but CASCADE is easier
        await client.query('TRUNCATE users, faculties, majors, lecturers, classes, students, subjects, course_sections, schedules CASCADE');

        console.log('Seeding Faculties...');
        const faculties = [
            ['CNTT', 'Công nghệ Thông tin', 'Khoa Công nghệ Thông tin'],
            ['KTDN', 'Kinh tế Doanh nghiệp', 'Khoa Kinh tế Doanh nghiệp'],
            ['KTHH', 'Kỹ thuật Hóa học', 'Khoa Kỹ thuật Hóa học'],
            ['NN', 'Ngoại ngữ', 'Khoa Ngoại ngữ'],
            ['DL', 'Du lịch', 'Khoa Du lịch'],
            ['Luat', 'Luật', 'Khoa Luật'],
            ['Y', 'Y học', 'Khoa Y học'],
            ['MT', 'Mỹ thuật', 'Khoa Mỹ thuật'],
            ['KTXD', 'Kỹ thuật Xây dựng', 'Khoa Kỹ thuật Xây dựng'],
            ['GDTC', 'Giáo dục Thể chất', 'Khoa Giáo dục Thể chất']
        ];
        for (const f of faculties) {
            await client.query('INSERT INTO faculties (faculty_id, faculty_name, description) VALUES ($1, $2, $3)', f);
        }

        console.log('Seeding Users...');
        const users = [
            ['skillsaanh@gmail.com', 'ADMIN01', 'ADMIN', 'Quản trị viên'],
            ['gv001@gmail.com', 'GV001', 'LECTURER', 'Nguyễn Văn A'],
            ['gv002@gmail.com', 'GV002', 'LECTURER', 'Trần Thị B'],
            ['gv003@gmail.com', 'GV003', 'LECTURER', 'Lê Văn C'],
            ['sv001@student.tdmu.edu.vn', '2224001', 'STUDENT', 'Phạm Văn D'],
            ['sv002@student.tdmu.edu.vn', '2224002', 'STUDENT', 'Hoàng Thị E'],
            ['sv003@student.tdmu.edu.vn', '2224003', 'STUDENT', 'Vũ Văn F'],
            ['sv004@student.tdmu.edu.vn', '2224004', 'STUDENT', 'Ngô Thị G'],
            ['sv005@student.tdmu.edu.vn', '2224005', 'STUDENT', 'Đỗ Văn H'],
            ['sv006@student.tdmu.edu.vn', '2224006', 'STUDENT', 'Bùi Thị I']
        ];
        for (const u of users) {
            await client.query('INSERT INTO users (email, username, role, full_name) VALUES ($1, $2, $3, $4)', u);
        }

        console.log('Seeding Lecturers...');
        const lecturers = [
            ['GV001', 'gv001@gmail.com', 'CNTT', 'Thạc sĩ', '0987654321'],
            ['GV002', 'gv002@gmail.com', 'KTDN', 'Tiến sĩ', '0912345678'],
            ['GV003', 'gv003@gmail.com', 'NN', 'Thạc sĩ', '0901234567']
        ];
        for (const l of lecturers) {
            await client.query(`
                INSERT INTO lecturers (lecturer_id, user_id, faculty_id, degree, phone) 
                VALUES ($1, (SELECT user_id FROM users WHERE email=$2), $3, $4, $5)
            `, l);
        }

        console.log('Seeding Majors...');
        const majors = [
            ['7480201', 'CNTT', 'Công nghệ thông tin'],
            ['7480202', 'CNTT', 'An toàn thông tin'],
            ['7340101', 'KTDN', 'Quản trị kinh doanh'],
            ['7340102', 'KTDN', 'Kế toán'],
            ['7220201', 'NN', 'Ngôn ngữ Anh'],
            ['7810103', 'DL', 'Quản trị dịch vụ du lịch'],
            ['7380101', 'Luat', 'Luật kinh tế'],
            ['7720101', 'Y', 'Y khoa'],
            ['7210101', 'MT', 'Thiết kế đồ họa'],
            ['7580201', 'KTXD', 'Kỹ thuật xây dựng']
        ];
        for (const m of majors) {
            await client.query('INSERT INTO majors (major_id, faculty_id, major_name) VALUES ($1, $2, $3)', m);
        }

        console.log('Seeding Classes...');
        const classes = [
            ['D22HT01', '7480201', 'GV001', 'ĐH CNTT K14-01', 2022],
            ['D22HT02', '7480201', 'GV001', 'ĐH CNTT K14-02', 2022],
            ['D22QT01', '7340101', 'GV002', 'ĐH QTKD K14-01', 2022],
            ['D22NN01', '7220201', 'GV003', 'ĐH NNA K14-01', 2022],
            ['D22DL01', '7810103', 'GV002', 'ĐH DL K14-01', 2022],
            ['D22LU01', '7380101', 'GV003', 'ĐH Luat K14-01', 2022],
            ['D22YK01', '7720101', 'GV002', 'ĐH Y K14-01', 2022],
            ['D22MT01', '7210101', 'GV003', 'ĐH MT K14-01', 2022],
            ['D22XD01', '7580201', 'GV001', 'ĐH XD K14-01', 2022],
            ['D22TC01', '7480201', 'GV001', 'ĐH TC K14-01', 2022]
        ];
        for (const c of classes) {
            await client.query('INSERT INTO classes (class_id, major_id, advisor_id, class_name, enrollment_year) VALUES ($1, $2, $3, $4, $5)', c);
        }

        console.log('Seeding Students...');
        const students = [
            ['2224001', 'sv001@student.tdmu.edu.vn', 'D22HT01', '2004-01-01', 'Nam'],
            ['2224002', 'sv002@student.tdmu.edu.vn', 'D22HT01', '2004-02-02', 'Nữ'],
            ['2224003', 'sv003@student.tdmu.edu.vn', 'D22QT01', '2004-03-03', 'Nam'],
            ['2224004', 'sv004@student.tdmu.edu.vn', 'D22NN01', '2004-04-04', 'Nữ'],
            ['2224005', 'sv005@student.tdmu.edu.vn', 'D22DL01', '2004-05-05', 'Nam'],
            ['2224006', 'sv006@student.tdmu.edu.vn', 'D22LU01', '2004-06-06', 'Nữ']
        ];
        for (const s of students) {
            await client.query(`
                INSERT INTO students (student_id, user_id, class_id, dob, gender) 
                VALUES ($1, (SELECT user_id FROM users WHERE email=$2), $3, $4, $5)
            `, s);
        }

        console.log('Seeding Subjects...');
        const subjects = [
            ['TIN01', 'Nhập môn Lập trình', 3],
            ['TOAN01', 'Giải tích 1', 4],
            ['TIN02', 'Cấu trúc dữ liệu', 3],
            ['TIN03', 'Cơ sở dữ liệu', 3],
            ['ENG01', 'Tiếng Anh chuyên ngành', 2],
            ['TIN04', 'Mạng máy tính', 3],
            ['TIN05', 'Hệ điều hành', 3],
            ['TIN06', 'Lập trình Web', 3],
            ['TOAN02', 'Đại số tuyến tính', 3],
            ['TIN07', 'An toàn thông tin', 2]
        ];
        for (const sub of subjects) {
            await client.query('INSERT INTO subjects (subject_id, subject_name, credits) VALUES ($1, $2, $3)', sub);
        }

        console.log('Seeding Course Sections...');
        const sections = [
            ['TIN01', 'GV001', 'HK1', '2024-2025', 'TIN01-01', 40, 'A101'],
            ['TIN01', 'GV001', 'HK1', '2024-2025', 'TIN01-02', 40, 'A102'],
            ['TOAN01', 'GV002', 'HK1', '2024-2025', 'TOAN01-01', 50, 'B202'],
            ['TIN02', 'GV001', 'HK1', '2024-2025', 'TIN02-01', 40, 'C301'],
            ['TIN03', 'GV003', 'HK1', '2024-2025', 'TIN03-01', 45, 'D401'],
            ['ENG01', 'GV002', 'HK1', '2024-2025', 'ENG01-01', 30, 'E501'],
            ['TIN04', 'GV003', 'HK1', '2024-2025', 'TIN04-01', 40, 'F601'],
            ['TIN05', 'GV001', 'HK1', '2024-2025', 'TIN05-01', 40, 'G701'],
            ['TIN06', 'GV003', 'HK1', '2024-2025', 'TIN06-01', 35, 'H801'],
            ['TOAN02', 'GV002', 'HK1', '2024-2025', 'TOAN02-01', 50, 'I901']
        ];
        for (const sec of sections) {
            await client.query(`
                INSERT INTO course_sections (subject_id, lecturer_id, semester, academic_year, section_code, max_capacity, room_default) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, sec);
        }

        console.log('Seeding Schedules...');
        const schedules = [
            ['TIN01-01', 2, 1, 3, 'A101'],
            ['TIN01-01', 4, 7, 9, 'A101'],
            ['TIN01-02', 2, 4, 6, 'A102'],
            ['TOAN01-01', 3, 1, 4, 'B202'],
            ['TIN02-01', 5, 1, 3, 'C301'],
            ['TIN03-01', 6, 7, 10, 'D401'],
            ['ENG01-01', 3, 7, 9, 'E501'],
            ['TIN04-01', 4, 1, 3, 'F601'],
            ['TIN05-01', 5, 4, 6, 'G701'],
            ['TIN06-01', 2, 7, 10, 'H801']
        ];
        for (const sch of schedules) {
            await client.query(`
                INSERT INTO schedules (section_id, day_of_week, start_period, end_period, room) 
                VALUES ((SELECT section_id FROM course_sections WHERE section_code=$1), $2, $3, $4, $5)
            `, sch);
        }

        await client.query('COMMIT');
        console.log('Database seeded successfully with 10 rows per major table!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error seeding database:', e);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
