-- Update data to Vietnamese with proper diacritics
-- Encoding: UTF-8

-- USERS
UPDATE users SET full_name = 'Nguyễn Văn Admin' WHERE username = 'ADMIN01';
UPDATE users SET full_name = 'Trần Thị Quản Trị' WHERE username = 'ADMIN02';
UPDATE users SET full_name = 'Quản trị viên 3' WHERE username = 'ADMIN03';
UPDATE users SET full_name = 'Nguyễn Văn Giảng' WHERE username = 'GV001';
UPDATE users SET full_name = 'Trần Thị Hương' WHERE username = 'GV002';
UPDATE users SET full_name = 'Lê Văn Minh' WHERE username = 'GV003';
UPDATE users SET full_name = 'Phạm Văn An' WHERE username = '2224802010001';
UPDATE users SET full_name = 'Hoàng Thị Bình' WHERE username = '2224802010002';
UPDATE users SET full_name = 'Nguyễn Văn Sinh Viên' WHERE username = '2224802010365';

-- FACULTIES
UPDATE faculties SET 
    faculty_name = 'Viện Kỹ thuật - Công nghệ',
    description = 'Đào tạo các ngành kỹ thuật và công nghệ'
WHERE faculty_id = 'IET';

UPDATE faculties SET 
    faculty_name = 'Khoa Kinh tế',
    description = 'Đào tạo các ngành kinh tế và quản trị'
WHERE faculty_id = 'ECON';

UPDATE faculties SET 
    faculty_name = 'Khoa Ngoại ngữ',
    description = 'Đào tạo các ngành ngoại ngữ'
WHERE faculty_id = 'LANG';

-- MAJORS
UPDATE majors SET major_name = 'Công nghệ thông tin' WHERE major_id = '7480201';
UPDATE majors SET major_name = 'Quản trị kinh doanh' WHERE major_id = '7340101';
UPDATE majors SET major_name = 'Ngôn ngữ Anh' WHERE major_id = '7220201';

-- CLASSES
UPDATE classes SET class_name = 'ĐH CNTT K22 - Lớp 01' WHERE class_id = 'D22CNTT01';
UPDATE classes SET class_name = 'ĐH CNTT K22 - Lớp 02' WHERE class_id = 'D22CNTT02';
UPDATE classes SET class_name = 'ĐH QTKD K22 - Lớp 01' WHERE class_id = 'D22QTKD01';

-- LECTURERS
UPDATE lecturers SET degree = 'Thạc sĩ' WHERE lecturer_id IN ('GV001', 'GV003');
UPDATE lecturers SET degree = 'Tiến sĩ' WHERE lecturer_id = 'GV002';

-- STUDENTS
UPDATE students SET gender = 'Nam' WHERE student_id IN ('2224802010001', '2224802010365');
UPDATE students SET gender = 'Nữ' WHERE student_id = '2224802010002';

-- SUBJECTS
UPDATE subjects SET 
    subject_name = 'Lập trình căn bản',
    description = 'Học lập trình C/C++'
WHERE subject_id = 'CS101';

UPDATE subjects SET 
    subject_name = 'Cấu trúc dữ liệu',
    description = 'Học về mảng, danh sách, cây, đồ thị'
WHERE subject_id = 'CS102';

UPDATE subjects SET 
    subject_name = 'Cơ sở dữ liệu',
    description = 'Học SQL và thiết kế CSDL'
WHERE subject_id = 'CS201';

UPDATE subjects SET 
    subject_name = 'Toán cao cấp 1',
    description = 'Giải tích và đại số'
WHERE subject_id = 'MATH101';

UPDATE subjects SET 
    subject_name = 'Tiếng Anh 1',
    description = 'Tiếng Anh cơ bản'
WHERE subject_id = 'ENG101';

-- ACADEMIC REQUESTS
UPDATE academic_requests SET 
    reason = 'Em xin phúc khảo môn Toán cao cấp 1 vì em nghĩ điểm thi cao hơn',
    admin_response = 'Đã kiểm tra lại, điểm chính xác'
WHERE request_id = 1;

UPDATE academic_requests SET 
    reason = 'Em xin bảo lưu học kỳ 2 vì lý do gia đình'
WHERE request_id = 2;

UPDATE academic_requests SET 
    reason = 'Em muốn học lại môn Cấu trúc dữ liệu để cải thiện điểm'
WHERE request_id = 3;

-- NOTIFICATIONS
UPDATE notifications SET 
    title = 'Điểm đã được duyệt',
    message = 'Điểm môn Lập trình căn bản của bạn đã được duyệt'
WHERE notification_id = 1;

UPDATE notifications SET 
    title = 'Yêu cầu phúc khảo đã được xử lý',
    message = 'Yêu cầu phúc khảo môn Toán cao cấp 1 của bạn đã được phê duyệt'
WHERE notification_id = 2;

UPDATE notifications SET 
    title = 'Điểm mới',
    message = 'Bạn có điểm mới cho môn Tiếng Anh 1'
WHERE notification_id = 3;

UPDATE notifications SET 
    title = 'Nhắc nhở nhập điểm',
    message = 'Vui lòng hoàn thành nhập điểm cho lớp CS102-01-2425'
WHERE notification_id = 4;

-- Verify results
SELECT 'USERS' as info;
SELECT username, full_name FROM users ORDER BY role, username;

SELECT 'FACULTIES' as info;
SELECT faculty_id, faculty_name FROM faculties;

SELECT 'SUBJECTS' as info;
SELECT subject_id, subject_name FROM subjects;

SELECT 'NOTIFICATIONS' as info;
SELECT notification_id, title FROM notifications;
