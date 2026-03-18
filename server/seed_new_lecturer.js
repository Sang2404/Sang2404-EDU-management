const pool = require('./config/db');

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('👨‍🏫 Cập nhật/Tạo giảng viên: trunggiangvien123@gmail.com');
        
        // 1. Xóa dữ liệu cũ nếu có
        await client.query(`
            DELETE FROM lecturers WHERE user_id = (SELECT user_id FROM users WHERE email='trunggiangvien123@gmail.com')
        `);
        
        // 2. Cập nhật user
        await client.query(`
            INSERT INTO users (email, username, role, full_name) 
            VALUES ('trunggiangvien123@gmail.com', 'GV002', 'LECTURER', 'PGS. TS. Trần Văn Trung')
            ON CONFLICT (email) DO UPDATE SET username = 'GV002', role = 'LECTURER', full_name = 'PGS. TS. Trần Văn Trung'
        `);

        // 3. Liên kết vào bảng lecturers
        await client.query(`
            INSERT INTO lecturers (lecturer_id, user_id, faculty_id, degree, phone) 
            VALUES ('GV002', 
                    (SELECT user_id FROM users WHERE email='trunggiangvien123@gmail.com'), 
                    'IET', 
                    'Phó Giáo sư - Tiến sĩ', 
                    '0934567890')
        `);

        console.log('📚 Tạo 10 môn học mới cho giảng viên này...');
        const newSubjects = [
            ['TIN201', 'Lập trình Python nâng cao', 3, 'Lập trình Python cho Data Science'],
            ['TIN202', 'Học máy và Deep Learning', 4, 'Machine Learning và Neural Networks'],
            ['TIN203', 'Xử lý ảnh số', 3, 'Computer Vision cơ bản'],
            ['TIN204', 'Lập trình Mobile', 3, 'Phát triển ứng dụng Android/iOS'],
            ['TIN205', 'Blockchain và Cryptocurrency', 3, 'Công nghệ Blockchain'],
            ['TIN206', 'Cloud Computing', 4, 'AWS, Azure, Google Cloud'],
            ['TIN207', 'DevOps và CI/CD', 3, 'Docker, Kubernetes, Jenkins'],
            ['TIN208', 'Big Data Analytics', 3, 'Hadoop, Spark, Data Mining'],
            ['TIN209', 'IoT và Embedded Systems', 3, 'Internet of Things'],
            ['TIN210', 'Ethical Hacking', 4, 'Penetration Testing và Security']
        ];

        for (const [sid, name, credits, desc] of newSubjects) {
            await client.query(`
                INSERT INTO subjects (subject_id, subject_name, credits, description) 
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (subject_id) DO NOTHING
            `, [sid, name, credits, desc]);
        }

        console.log('📖 Tạo 10 lớp học phần (HK2 2024-2025) do GV002 giảng dạy...');
        const sections = [];
        for (let i = 0; i < newSubjects.length; i++) {
            const [subjectId] = newSubjects[i];
            const sectionCode = `${subjectId}-01`;
            
            const result = await client.query(`
                INSERT INTO course_sections (subject_id, lecturer_id, semester, academic_year, section_code, max_capacity, room_default, is_locked) 
                VALUES ($1, 'GV002', 'HK2', '2024-2025', $2, 60, $3, false)
                ON CONFLICT (section_code) DO NOTHING
                RETURNING section_id
            `, [subjectId, sectionCode, `B${201 + i}`]);
            
            if (result.rows.length > 0) {
                sections.push(result.rows[0].section_id);
            }
        }

        console.log('✍️ Đăng ký sinh viên trungloptruong123@gmail.com vào 10 lớp...');
        const studentId = '2224802010366'; // ID của trungloptruong123@gmail.com
        
        for (const sectionId of sections) {
            await client.query(`
                INSERT INTO section_students (section_id, student_id) 
                VALUES ($1, $2)
                ON CONFLICT (section_id, student_id) DO NOTHING
            `, [sectionId, studentId]);
        }

        console.log('📅 Tạo thời khóa biểu cho 10 lớp mới...');
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
            `, [sections[i], dayOfWeek, startPeriod, endPeriod, `B${201 + i}`]);
        }

        console.log('📊 Tạo điểm cho sinh viên (10 môn ở trạng thái DRAFT để GV002 có thể chấm)...');
        // Tạo 10 bản ghi điểm ở trạng thái DRAFT
        // GV002 sẽ có thể nhập điểm cho sinh viên này
        for (const sectionId of sections) {
            await client.query(`
                INSERT INTO grades (section_id, student_id, status) 
                VALUES ($1, $2, 'DRAFT')
                ON CONFLICT (section_id, student_id) DO NOTHING
            `, [sectionId, studentId]);
        }

        console.log('🔔 Tạo thông báo cho giảng viên mới...');
        await client.query(`
            INSERT INTO notifications (user_id, title, message, is_read) 
            VALUES ((SELECT user_id FROM users WHERE email='trunggiangvien123@gmail.com'), 
                    'Chào mừng Giảng viên', 
                    'Bạn có 10 lớp học phần đang giảng dạy trong HK2 2024-2025', 
                    false)
        `);

        await client.query('COMMIT');
        
        console.log('\n✅ HOÀN TẤT! Dữ liệu giảng viên mới đã được tạo:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👨‍🏫 GIẢNG VIÊN: trunggiangvien123@gmail.com');
        console.log('   - Mã GV: GV002');
        console.log('   - Họ tên: PGS. TS. Trần Văn Trung');
        console.log('   - Giảng dạy: 10 lớp học phần (HK2 2024-2025)');
        console.log('   - Môn học: Python, ML, Computer Vision, Mobile, Blockchain...');
        console.log('');
        console.log('👨‍🎓 SINH VIÊN LIÊN QUAN: trungloptruong123@gmail.com');
        console.log('   - MSSV: 2224802010366');
        console.log('   - Đã đăng ký: 10 lớp của GV002');
        console.log('   - Điểm: 10 môn ở trạng thái DRAFT (chưa chấm)');
        console.log('   - GV002 có thể nhập điểm cho sinh viên này');
        console.log('');
        console.log('📋 CHỨC NĂNG CÓ THỂ TEST:');
        console.log('   ✓ Xem danh sách lớp học phần');
        console.log('   ✓ Xem danh sách sinh viên trong lớp');
        console.log('   ✓ Nhập điểm cho sinh viên (10 môn)');
        console.log('   ✓ Gửi bảng điểm để duyệt');
        console.log('   ✓ Xem thời khóa biểu giảng dạy');
        console.log('   ✓ Xem thống kê lớp học');
        console.log('   ✓ Quản lý điểm danh');
        console.log('   ✓ Xuất báo cáo điểm');
        console.log('   ✓ Xem thông báo');
        console.log('   ✓ Cập nhật thông tin cá nhân');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
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
