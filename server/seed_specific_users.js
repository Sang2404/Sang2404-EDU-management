const pool = require('./config/db');

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('🧹 Xóa dữ liệu cũ...');
        await client.query('TRUNCATE users, faculties, majors, lecturers, classes, students, subjects, course_sections, section_students, grades, schedules, academic_requests, notifications CASCADE');

        console.log('👤 Tạo 3 tài khoản chính...');
        
        // 1. ADMIN
        await client.query(`
            INSERT INTO users (email, username, role, full_name) 
            VALUES ('skillsanh@gmail.com', 'ADMIN01', 'ADMIN', 'Quản trị viên Hệ thống')
        `);

        // 2. GIẢNG VIÊN
        await client.query(`
            INSERT INTO users (email, username, role, full_name) 
            VALUES ('sinfour503@gmail.com', 'GV001', 'LECTURER', 'TS. Nguyễn Văn Minh')
        `);

        // 3. SINH VIÊN 1
        await client.query(`
            INSERT INTO users (email, username, role, full_name) 
            VALUES ('2224802010365@student.tdmu.edu.vn', '2224802010365', 'STUDENT', 'Nguyễn Thị Hương')
        `);

        // 4. SINH VIÊN 2
        await client.query(`
            INSERT INTO users (email, username, role, full_name) 
            VALUES ('trungloptruong123@gmail.com', '2224802010366', 'STUDENT', 'Trần Văn Trung')
        `);

        console.log('🏫 Tạo Khoa & Ngành...');
        await client.query(`
            INSERT INTO faculties (faculty_id, faculty_name, description) 
            VALUES ('IET', 'Viện Kỹ thuật - Công nghệ', 'Đào tạo các ngành kỹ thuật')
        `);

        await client.query(`
            INSERT INTO majors (major_id, faculty_id, major_name, total_credits) 
            VALUES ('7480201', 'IET', 'Công nghệ thông tin', 150)
        `);

        console.log('👨‍🏫 Liên kết Giảng viên...');
        await client.query(`
            INSERT INTO lecturers (lecturer_id, user_id, faculty_id, degree, phone) 
            VALUES ('GV001', 
                    (SELECT user_id FROM users WHERE email='sinfour503@gmail.com'), 
                    'IET', 
                    'Tiến sĩ', 
                    '0987654321')
        `);

        console.log('🎓 Tạo Lớp hành chính...');
        await client.query(`
            INSERT INTO classes (class_id, major_id, advisor_id, class_name, enrollment_year) 
            VALUES ('D22HT01', '7480201', 'GV001', 'ĐH CNTT K14 - Lớp 01', 2022)
        `);

        console.log('👨‍🎓 Liên kết 2 Sinh viên...');
        const students = [
            ['2224802010365', '2224802010365@student.tdmu.edu.vn', '2004-05-15', 'Nữ', '0912345678'],
            ['2224802010366', 'trungloptruong123@gmail.com', '2004-08-20', 'Nam', '0923456789']
        ];

        for (const [sid, email, dob, gender, phone] of students) {
            await client.query(`
                INSERT INTO students (student_id, user_id, class_id, dob, gender, phone, status, gpa_accumulated) 
                VALUES ($1, 
                        (SELECT user_id FROM users WHERE email=$2), 
                        'D22HT01', 
                        $3, 
                        $4, 
                        $5, 
                        'STUDYING', 
                        3.25)
            `, [sid, email, dob, gender, phone]);
        }

        console.log('📚 Tạo 10 môn học...');
        const subjects = [
            ['TIN101', 'Nhập môn Lập trình', 3, 'Học lập trình cơ bản với C/C++'],
            ['TIN102', 'Cấu trúc dữ liệu và Giải thuật', 4, 'Các cấu trúc dữ liệu cơ bản'],
            ['TIN103', 'Cơ sở dữ liệu', 3, 'Thiết kế và quản lý CSDL'],
            ['TIN104', 'Lập trình Web', 3, 'HTML, CSS, JavaScript'],
            ['TIN105', 'Mạng máy tính', 3, 'Kiến trúc mạng và giao thức'],
            ['TIN106', 'Hệ điều hành', 4, 'Quản lý tiến trình, bộ nhớ'],
            ['TIN107', 'Lập trình hướng đối tượng', 3, 'OOP với Java'],
            ['TIN108', 'Phân tích thiết kế hệ thống', 3, 'UML và mô hình hóa'],
            ['TIN109', 'An toàn thông tin', 3, 'Mã hóa và bảo mật'],
            ['TIN110', 'Trí tuệ nhân tạo', 4, 'Machine Learning cơ bản']
        ];

        for (const [sid, name, credits, desc] of subjects) {
            await client.query(`
                INSERT INTO subjects (subject_id, subject_name, credits, description) 
                VALUES ($1, $2, $3, $4)
            `, [sid, name, credits, desc]);
        }

        console.log('📖 Tạo 10 lớp học phần (HK1 2024-2025)...');
        const sections = [];
        for (let i = 0; i < subjects.length; i++) {
            const [subjectId, subjectName] = subjects[i];
            const sectionCode = `${subjectId}-01`;
            
            const result = await client.query(`
                INSERT INTO course_sections (subject_id, lecturer_id, semester, academic_year, section_code, max_capacity, room_default, is_locked) 
                VALUES ($1, 'GV001', 'HK1', '2024-2025', $2, 60, $3, false)
                RETURNING section_id
            `, [subjectId, sectionCode, `A${101 + i}`]);
            
            sections.push(result.rows[0].section_id);
        }

        console.log('✍️ Đăng ký 2 sinh viên vào TẤT CẢ 10 lớp học phần...');
        for (const sectionId of sections) {
            for (const [sid] of students) {
                await client.query(`
                    INSERT INTO section_students (section_id, student_id) 
                    VALUES ($1, $2)
                `, [sectionId, sid]);
            }
        }

        console.log('📅 Tạo thời khóa biểu cho 10 lớp...');
        const scheduleData = [
            [2, 1, 5],   // Thứ 2, tiết 1-5 (sáng)
            [2, 6, 10],  // Thứ 2, tiết 6-10 (chiều)
            [3, 1, 5],   // Thứ 3, tiết 1-5 (sáng)
            [3, 6, 10],  // Thứ 3, tiết 6-10 (chiều)
            [4, 1, 5],   // Thứ 4, tiết 1-5 (sáng)
            [4, 6, 10],  // Thứ 4, tiết 6-10 (chiều)
            [5, 1, 5],   // Thứ 5, tiết 1-5 (sáng)
            [5, 6, 10],  // Thứ 5, tiết 6-10 (chiều)
            [6, 1, 5],   // Thứ 6, tiết 1-5 (sáng)
            [6, 6, 10]   // Thứ 6, tiết 6-10 (chiều)
        ];

        for (let i = 0; i < sections.length; i++) {
            const [dayOfWeek, startPeriod, endPeriod] = scheduleData[i];
            await client.query(`
                INSERT INTO schedules (section_id, day_of_week, start_period, end_period, room) 
                VALUES ($1, $2, $3, $4, $5)
            `, [sections[i], dayOfWeek, startPeriod, endPeriod, `A${101 + i}`]);
        }

        console.log('📊 Tạo điểm cho 2 sinh viên (GIỐNG HỆT NHAU)...');
        // Cả 2 sinh viên sẽ có điểm giống hệt nhau
        const gradeData = [
            // 7 môn đã APPROVED (có điểm đầy đủ)
            [9.5, 8.5, 9.0, 8.9, 3.7, 'A', 'APPROVED'],
            [8.0, 7.5, 8.0, 7.8, 3.3, 'B+', 'APPROVED'],
            [9.0, 9.5, 9.0, 9.1, 4.0, 'A', 'APPROVED'],
            [7.0, 6.5, 7.0, 6.8, 3.0, 'B', 'APPROVED'],
            [8.5, 8.0, 8.5, 8.3, 3.5, 'B+', 'APPROVED'],
            [9.0, 8.5, 9.5, 9.0, 4.0, 'A', 'APPROVED'],
            [7.5, 7.0, 7.5, 7.3, 3.0, 'B', 'APPROVED'],
            // 2 môn SUBMITTED (chờ duyệt)
            [8.0, 8.5, 8.0, 8.1, 3.5, 'B+', 'SUBMITTED'],
            [9.0, 9.0, 9.0, 9.0, 4.0, 'A', 'SUBMITTED'],
            // 1 môn DRAFT (chưa nhập xong)
            [null, null, null, null, null, null, 'DRAFT']
        ];

        for (const [sid] of students) {
            for (let i = 0; i < sections.length; i++) {
                const [att, mid, fin, t10, t4, gChar, status] = gradeData[i];
                
                if (status === 'DRAFT') {
                    await client.query(`
                        INSERT INTO grades (section_id, student_id, status) 
                        VALUES ($1, $2, $3::grade_status)
                    `, [sections[i], sid, status]);
                } else {
                    await client.query(`
                        INSERT INTO grades (section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::grade_status)
                    `, [sections[i], sid, att, mid, fin, t10, t4, gChar, status]);
                }
            }
        }

        console.log('📝 Tạo yêu cầu học vụ cho 2 sinh viên...');
        // Mỗi sinh viên có 3 yêu cầu với các trạng thái khác nhau
        const requestTypes = [
            ['REVIEW', 'Xin phúc khảo môn Cơ sở dữ liệu vì điểm thi không phù hợp với bài làm', 'PENDING'],
            ['RESERVE', 'Xin bảo lưu học kỳ 2 do lý do gia đình', 'APPROVED'],
            ['RETAKE', 'Xin học lại môn Mạng máy tính để cải thiện điểm', 'REJECTED']
        ];

        for (const [sid] of students) {
            for (const [type, reason, status] of requestTypes) {
                const adminResponse = status === 'APPROVED' 
                    ? 'Yêu cầu đã được chấp thuận' 
                    : status === 'REJECTED' 
                    ? 'Yêu cầu không đủ điều kiện' 
                    : null;

                await client.query(`
                    INSERT INTO academic_requests (student_id, request_type, reason, status, admin_response) 
                    VALUES ($1, $2::request_type, $3, $4::request_status, $5)
                `, [sid, type, reason, status, adminResponse]);
            }
        }

        console.log('🔔 Tạo thông báo cho 3 tài khoản...');
        const notifications = [
            ['skillsanh@gmail.com', 'Chào mừng Admin', 'Bạn đã đăng nhập với quyền Quản trị viên', true],
            ['sinfour503@gmail.com', 'Chào mừng Giảng viên', 'Bạn có 10 lớp học phần đang giảng dạy', false],
            ['sinfour503@gmail.com', 'Nhắc nhở nhập điểm', 'Còn 1 lớp chưa hoàn thành nhập điểm', false],
            ['2224802010365@student.tdmu.edu.vn', 'Chào mừng Sinh viên', 'Bạn đã đăng ký 10 môn học kỳ này', true],
            ['2224802010365@student.tdmu.edu.vn', 'Điểm mới', 'Có 2 môn học đang chờ duyệt điểm', false],
            ['2224802010365@student.tdmu.edu.vn', 'Yêu cầu học vụ', 'Yêu cầu phúc khảo của bạn đang được xử lý', false],
            ['trungloptruong123@gmail.com', 'Chào mừng Sinh viên', 'Bạn đã đăng ký 10 môn học kỳ này', true],
            ['trungloptruong123@gmail.com', 'Điểm mới', 'Có 2 môn học đang chờ duyệt điểm', false],
            ['trungloptruong123@gmail.com', 'Yêu cầu học vụ', 'Yêu cầu phúc khảo của bạn đang được xử lý', false]
        ];

        for (const [email, title, message, isRead] of notifications) {
            await client.query(`
                INSERT INTO notifications (user_id, title, message, is_read) 
                VALUES ((SELECT user_id FROM users WHERE email=$1), $2, $3, $4)
            `, [email, title, message, isRead]);
        }

        await client.query('COMMIT');
        
        console.log('\n✅ HOÀN TẤT! Dữ liệu đã được tạo thành công:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👤 ADMIN: skillsanh@gmail.com');
        console.log('👨‍🏫 GIẢNG VIÊN: sinfour503@gmail.com');
        console.log('   - Giảng dạy: 10 lớp học phần');
        console.log('   - Đã nhập điểm: 9/10 lớp (1 lớp còn DRAFT)');
        console.log('');
        console.log('👨‍🎓 SINH VIÊN 1: 2224802010365@student.tdmu.edu.vn');
        console.log('👨‍🎓 SINH VIÊN 2: trungloptruong123@gmail.com');
        console.log('   - Đăng ký: 10 môn học');
        console.log('   - Điểm đã duyệt: 7 môn');
        console.log('   - Điểm chờ duyệt: 2 môn');
        console.log('   - Điểm chưa nhập: 1 môn');
        console.log('   - Yêu cầu học vụ: 3 (PENDING, APPROVED, REJECTED)');
        console.log('   - GPA tích lũy: 3.25');
        console.log('   - Thông báo: 3 tin nhắn');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📌 LƯU Ý: 2 sinh viên có DỮ LIỆU GIỐNG HỆT NHAU');
        
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ LỖI:', e.message);
        console.error(e.stack);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
