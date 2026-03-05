-- ============================================================================
-- SEED SAMPLE DATA - Dữ liệu mẫu để kiểm tra
-- Chạy file này sau khi đã tạo schema
-- ============================================================================

-- Xóa dữ liệu cũ (nếu có)
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE academic_requests CASCADE;
TRUNCATE TABLE grades CASCADE;
TRUNCATE TABLE schedules CASCADE;
TRUNCATE TABLE section_students CASCADE;
TRUNCATE TABLE course_sections CASCADE;
TRUNCATE TABLE subject_prerequisites CASCADE;
TRUNCATE TABLE subjects CASCADE;
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE classes CASCADE;
TRUNCATE TABLE lecturers CASCADE;
TRUNCATE TABLE majors CASCADE;
TRUNCATE TABLE faculties CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset sequences
ALTER SEQUENCE users_user_id_seq RESTART WITH 1;
ALTER SEQUENCE course_sections_section_id_seq RESTART WITH 1;
ALTER SEQUENCE schedules_schedule_id_seq RESTART WITH 1;
ALTER SEQUENCE grades_grade_id_seq RESTART WITH 1;
ALTER SEQUENCE academic_requests_request_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_notification_id_seq RESTART WITH 1;

-- ============================================================================
-- 1. USERS (3 Admin, 3 Lecturers, 3 Students)
-- ============================================================================
INSERT INTO users (email, username, role, full_name, is_active) VALUES
-- Admins
('admin1@tdmu.edu.vn', 'ADMIN01', 'ADMIN', 'Nguyễn Văn Admin', TRUE),
('admin2@tdmu.edu.vn', 'ADMIN02', 'ADMIN', 'Trần Thị Quản Trị', TRUE),
('skillsaanh@gmail.com', 'ADMIN03', 'ADMIN', 'Quản trị viên 3', TRUE),

-- Lecturers
('lecturer1@tdmu.edu.vn', 'GV001', 'LECTURER', 'Nguyễn Văn Giảng', TRUE),
('lecturer2@tdmu.edu.vn', 'GV002', 'LECTURER', 'Trần Thị Hương', TRUE),
('sinfour503@gmail.com', 'GV003', 'LECTURER', 'Lê Văn Minh', TRUE),

-- Students
('student1@student.tdmu.edu.vn', '2224802010001', 'STUDENT', 'Phạm Văn An', TRUE),
('student2@student.tdmu.edu.vn', '2224802010002', 'STUDENT', 'Hoàng Thị Bình', TRUE),
('2224802010365@student.tdmu.edu.vn', '2224802010365', 'STUDENT', 'Nguyễn Văn Sinh Viên', TRUE);

-- ============================================================================
-- 2. FACULTIES (3 khoa)
-- ============================================================================
INSERT INTO faculties (faculty_id, faculty_name, description) VALUES
('IET', 'Viện Kỹ thuật - Công nghệ', 'Đào tạo các ngành kỹ thuật và công nghệ'),
('ECON', 'Khoa Kinh tế', 'Đào tạo các ngành kinh tế và quản trị'),
('LANG', 'Khoa Ngoại ngữ', 'Đào tạo các ngành ngoại ngữ');

-- ============================================================================
-- 3. MAJORS (3 ngành)
-- ============================================================================
INSERT INTO majors (major_id, faculty_id, major_name, total_credits) VALUES
('7480201', 'IET', 'Công nghệ thông tin', 150),
('7340101', 'ECON', 'Quản trị kinh doanh', 140),
('7220201', 'LANG', 'Ngôn ngữ Anh', 130);

-- ============================================================================
-- 4. LECTURERS (3 giảng viên)
-- ============================================================================
INSERT INTO lecturers (lecturer_id, user_id, faculty_id, degree, phone) VALUES
('GV001', (SELECT user_id FROM users WHERE username='GV001'), 'IET', 'Thạc sĩ', '0901234567'),
('GV002', (SELECT user_id FROM users WHERE username='GV002'), 'IET', 'Tiến sĩ', '0902345678'),
('GV003', (SELECT user_id FROM users WHERE username='GV003'), 'ECON', 'Thạc sĩ', '0903456789');

-- ============================================================================
-- 5. CLASSES (3 lớp)
-- ============================================================================
INSERT INTO classes (class_id, major_id, advisor_id, class_name, enrollment_year) VALUES
('D22CNTT01', '7480201', 'GV001', 'ĐH CNTT K22 - Lớp 01', 2022),
('D22CNTT02', '7480201', 'GV002', 'ĐH CNTT K22 - Lớp 02', 2022),
('D22QTKD01', '7340101', 'GV003', 'ĐH QTKD K22 - Lớp 01', 2022);

-- ============================================================================
-- 6. STUDENTS (3 sinh viên)
-- ============================================================================
INSERT INTO students (student_id, user_id, class_id, dob, gender, phone, address, gpa_accumulated, status) VALUES
('2224802010001', (SELECT user_id FROM users WHERE username='2224802010001'), 'D22CNTT01', '2004-01-15', 'Nam', '0911111111', 'TP.HCM', 3.25, 'STUDYING'),
('2224802010002', (SELECT user_id FROM users WHERE username='2224802010002'), 'D22CNTT01', '2004-03-20', 'Nữ', '0922222222', 'Hà Nội', 3.50, 'STUDYING'),
('2224802010365', (SELECT user_id FROM users WHERE username='2224802010365'), 'D22CNTT02', '2004-05-10', 'Nam', '0933333333', 'Đà Nẵng', 3.75, 'STUDYING');

-- ============================================================================
-- 7. SUBJECTS (5 môn học)
-- ============================================================================
INSERT INTO subjects (subject_id, subject_name, credits, description) VALUES
('CS101', 'Lập trình căn bản', 3, 'Học lập trình C/C++'),
('CS102', 'Cấu trúc dữ liệu', 3, 'Học về mảng, danh sách, cây, đồ thị'),
('CS201', 'Cơ sở dữ liệu', 3, 'Học SQL và thiết kế CSDL'),
('MATH101', 'Toán cao cấp 1', 4, 'Giải tích và đại số'),
('ENG101', 'Tiếng Anh 1', 3, 'Tiếng Anh cơ bản');

-- ============================================================================
-- 8. SUBJECT_PREREQUISITES (2 môn tiên quyết)
-- ============================================================================
INSERT INTO subject_prerequisites (subject_id, prerequisite_id) VALUES
('CS102', 'CS101'),  -- Cấu trúc dữ liệu cần học Lập trình căn bản trước
('CS201', 'CS102');  -- Cơ sở dữ liệu cần học Cấu trúc dữ liệu trước

-- ============================================================================
-- 9. COURSE_SECTIONS (5 lớp học phần)
-- ============================================================================
INSERT INTO course_sections (subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES
('CS101', 'GV001', 'HK1', '2024-2025', 'A101', 60, 'CS101-01-2425', FALSE),
('CS102', 'GV001', 'HK1', '2024-2025', 'A102', 60, 'CS102-01-2425', FALSE),
('CS201', 'GV002', 'HK2', '2024-2025', 'B201', 50, 'CS201-01-2425', FALSE),
('MATH101', 'GV002', 'HK1', '2024-2025', 'C301', 80, 'MATH101-01-2425', FALSE),
('ENG101', 'GV003', 'HK1', '2024-2025', 'D401', 40, 'ENG101-01-2425', FALSE);

-- ============================================================================
-- 10. SECTION_STUDENTS (Gán sinh viên vào lớp học phần)
-- ============================================================================
INSERT INTO section_students (section_id, student_id) VALUES
-- Sinh viên 1 đăng ký 3 môn
(1, '2224802010001'),  -- CS101
(2, '2224802010001'),  -- CS102
(4, '2224802010001'),  -- MATH101

-- Sinh viên 2 đăng ký 3 môn
(1, '2224802010002'),  -- CS101
(4, '2224802010002'),  -- MATH101
(5, '2224802010002'),  -- ENG101

-- Sinh viên 3 đăng ký 2 môn
(1, '2224802010365'),  -- CS101
(2, '2224802010365');  -- CS102

-- ============================================================================
-- 11. SCHEDULES (Lịch học cho các lớp học phần)
-- ============================================================================
INSERT INTO schedules (section_id, day_of_week, start_period, end_period, room) VALUES
-- CS101: Thứ 2 và Thứ 4
(1, 2, 1, 3, 'A101'),   -- Thứ 2, tiết 1-3
(1, 4, 1, 3, 'A101'),   -- Thứ 4, tiết 1-3

-- CS102: Thứ 3 và Thứ 5
(2, 3, 4, 6, 'A102'),   -- Thứ 3, tiết 4-6
(2, 5, 4, 6, 'A102'),   -- Thứ 5, tiết 4-6

-- CS201: Thứ 2 và Thứ 4
(3, 2, 7, 9, 'B201'),   -- Thứ 2, tiết 7-9
(3, 4, 7, 9, 'B201'),   -- Thứ 4, tiết 7-9

-- MATH101: Thứ 3, Thứ 5, Thứ 6
(4, 3, 1, 3, 'C301'),   -- Thứ 3, tiết 1-3
(4, 5, 1, 3, 'C301'),   -- Thứ 5, tiết 1-3
(4, 6, 1, 3, 'C301'),   -- Thứ 6, tiết 1-3

-- ENG101: Thứ 2 và Thứ 4
(5, 2, 4, 6, 'D401'),   -- Thứ 2, tiết 4-6
(5, 4, 4, 6, 'D401');   -- Thứ 4, tiết 4-6

-- ============================================================================
-- 12. GRADES (Điểm cho sinh viên)
-- ============================================================================
INSERT INTO grades (section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES
-- Sinh viên 1
(1, '2224802010001', 9.0, 8.5, 8.0, 8.25, 4.0, 'A', 'APPROVED'),   -- CS101: 8.25
(2, '2224802010001', 8.0, 7.5, 7.0, 7.35, 3.0, 'B', 'APPROVED'),   -- CS102: 7.35
(4, '2224802010001', 7.0, 6.5, 6.0, 6.35, 2.5, 'C+', 'APPROVED'),  -- MATH101: 6.35

-- Sinh viên 2
(1, '2224802010002', 10.0, 9.5, 9.0, 9.25, 4.0, 'A+', 'APPROVED'), -- CS101: 9.25
(4, '2224802010002', 9.0, 8.0, 8.5, 8.40, 4.0, 'A', 'APPROVED'),   -- MATH101: 8.40
(5, '2224802010002', 8.5, 8.0, 7.5, 7.85, 3.5, 'B+', 'APPROVED'),  -- ENG101: 7.85

-- Sinh viên 3 (1 môn đã duyệt, 1 môn chưa duyệt)
(1, '2224802010365', 8.0, 7.0, 7.5, 7.40, 3.0, 'B', 'APPROVED'),   -- CS101: 7.40
(2, '2224802010365', 7.5, 7.0, NULL, NULL, NULL, NULL, 'DRAFT');   -- CS102: Chưa nhập xong

-- ============================================================================
-- 13. ACADEMIC_REQUESTS (Yêu cầu học vụ)
-- ============================================================================
INSERT INTO academic_requests (student_id, request_type, reason, status, admin_response, created_at) VALUES
-- Yêu cầu đã xử lý
('2224802010001', 'REVIEW', 'Em xin phúc khảo môn Toán cao cấp 1 vì em nghĩ điểm thi cao hơn', 'APPROVED', 'Đã kiểm tra lại, điểm chính xác', NOW() - INTERVAL '5 days'),
('2224802010002', 'RESERVE', 'Em xin bảo lưu học kỳ 2 vì lý do gia đình', 'PENDING', NULL, NOW() - INTERVAL '2 days'),

-- Yêu cầu mới
('2224802010365', 'RETAKE', 'Em muốn học lại môn Cấu trúc dữ liệu để cải thiện điểm', 'PENDING', NULL, NOW());

-- ============================================================================
-- 14. NOTIFICATIONS (Thông báo)
-- ============================================================================
INSERT INTO notifications (user_id, title, message, is_read, created_at) VALUES
-- Thông báo cho sinh viên 1
((SELECT user_id FROM users WHERE username='2224802010001'), 
 'Điểm đã được duyệt', 
 'Điểm môn Lập trình căn bản của bạn đã được duyệt', 
 TRUE, NOW() - INTERVAL '3 days'),

((SELECT user_id FROM users WHERE username='2224802010001'), 
 'Yêu cầu phúc khảo đã được xử lý', 
 'Yêu cầu phúc khảo môn Toán cao cấp 1 của bạn đã được phê duyệt', 
 FALSE, NOW() - INTERVAL '1 day'),

-- Thông báo cho sinh viên 2
((SELECT user_id FROM users WHERE username='2224802010002'), 
 'Điểm mới', 
 'Bạn có điểm mới cho môn Tiếng Anh 1', 
 FALSE, NOW()),

-- Thông báo cho giảng viên
((SELECT user_id FROM users WHERE username='GV001'), 
 'Nhắc nhở nhập điểm', 
 'Vui lòng hoàn thành nhập điểm cho lớp CS102-01-2425', 
 FALSE, NOW());

-- ============================================================================
-- HOÀN THÀNH
-- ============================================================================

-- Kiểm tra số lượng dữ liệu
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'faculties', COUNT(*) FROM faculties
UNION ALL
SELECT 'majors', COUNT(*) FROM majors
UNION ALL
SELECT 'lecturers', COUNT(*) FROM lecturers
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'subjects', COUNT(*) FROM subjects
UNION ALL
SELECT 'subject_prerequisites', COUNT(*) FROM subject_prerequisites
UNION ALL
SELECT 'course_sections', COUNT(*) FROM course_sections
UNION ALL
SELECT 'section_students', COUNT(*) FROM section_students
UNION ALL
SELECT 'schedules', COUNT(*) FROM schedules
UNION ALL
SELECT 'grades', COUNT(*) FROM grades
UNION ALL
SELECT 'academic_requests', COUNT(*) FROM academic_requests
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- Hiển thị thông tin tài khoản test
SELECT 
    email, 
    username, 
    role, 
    full_name 
FROM users 
ORDER BY role, username;

COMMIT;

-- ============================================================================
-- HƯỚNG DẪN SỬ DỤNG
-- ============================================================================
-- 1. Chạy file này trong pgAdmin hoặc psql:
--    psql -U postgres -d student_management -f database/seed_sample_data.sql
--
-- 2. Đăng nhập với các tài khoản:
--    Admin: admin1@tdmu.edu.vn, admin2@tdmu.edu.vn, skillsaanh@gmail.com
--    Lecturer: lecturer1@tdmu.edu.vn, lecturer2@tdmu.edu.vn, sinfour503@gmail.com
--    Student: student1@student.tdmu.edu.vn, student2@student.tdmu.edu.vn, 2224802010365@student.tdmu.edu.vn
--
-- 3. Dữ liệu mẫu bao gồm:
--    - 3 Admin, 3 Lecturers, 3 Students
--    - 3 Faculties, 3 Majors, 3 Classes
--    - 5 Subjects, 5 Course Sections
--    - Schedules, Grades, Requests, Notifications
-- ============================================================================
