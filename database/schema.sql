-- PHẦN 1: KHỞI TẠO CÁC KIỂU DỮ LIỆU (ENUM) & BẢNG HỆ THỐNG

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- 1. Định nghĩa các kiểu dữ liệu cố định (Enum)
CREATE TYPE user_role AS ENUM ('ADMIN', 'LECTURER', 'STUDENT');
CREATE TYPE student_status AS ENUM ('STUDYING', 'RESERVED', 'GRADUATED', 'DROPPED');
CREATE TYPE grade_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED'); -- Quy trình duyệt điểm
CREATE TYPE request_type AS ENUM ('REVIEW', 'RESERVE', 'RETAKE'); -- Phúc khảo, Bảo lưu
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- 2. Bảng Users (QUAN TRỌNG: Dùng cho đăng nhập Google)
-- Không có password, Email là duy nhất để làm Whitelist
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL, -- Email Gmail dùng để định danh
    username VARCHAR(50) UNIQUE, -- Mã hiển thị (MSSV hoặc Mã GV)
    role user_role NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE, -- Admin có thể khóa tài khoản tại đây
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PHẦN 2: DANH MỤC TỔ CHỨC & ĐÀO TẠO
-- 3. Bảng Khoa / Viện
CREATE TABLE faculties (
    faculty_id VARCHAR(10) PRIMARY KEY, -- VD: 'IET', 'KTTC'
    faculty_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 4. Bảng Ngành đào tạo
CREATE TABLE majors (
    major_id VARCHAR(20) PRIMARY KEY, -- VD: '7480201'
    faculty_id VARCHAR(10) REFERENCES faculties(faculty_id) ON DELETE SET NULL,
    major_name VARCHAR(100) NOT NULL,
    total_credits INT DEFAULT 150
);

-- 5. Bảng Giảng viên (Hồ sơ chi tiết)
CREATE TABLE lecturers (
    lecturer_id VARCHAR(20) PRIMARY KEY, -- VD: 'GV001'
    user_id INT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE, -- Link tới email đăng nhập
    faculty_id VARCHAR(10) REFERENCES faculties(faculty_id),
    degree VARCHAR(50), -- Thạc sĩ, Tiến sĩ
    phone VARCHAR(15)
);

-- 6. Bảng Lớp hành chính (Lớp sinh hoạt)
CREATE TABLE classes (
    class_id VARCHAR(20) PRIMARY KEY, -- VD: 'D21HT01'
    major_id VARCHAR(20) REFERENCES majors(major_id),
    advisor_id VARCHAR(20) REFERENCES lecturers(lecturer_id), -- Cố vấn học tập (GVCN)
    class_name VARCHAR(100),
    enrollment_year INT -- Năm nhập học (VD: 2021)
);

-- 7. Bảng Sinh viên (Hồ sơ chi tiết)
CREATE TABLE students (
    student_id VARCHAR(20) PRIMARY KEY, -- VD: '212480201'
    user_id INT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE, -- Link tới email đăng nhập
    class_id VARCHAR(20) REFERENCES classes(class_id),
    dob DATE, -- Ngày sinh
    gender VARCHAR(10),
    phone VARCHAR(15),
    address TEXT,
    gpa_accumulated DECIMAL(4,2) DEFAULT 0.0, -- GPA tích lũy
    status student_status DEFAULT 'STUDYING'
);


-- PHẦN 3: QUẢN LÝ HỌC PHẦN & ĐIỂM SỐ
-- 8. Bảng Môn học (Ngân hàng môn học)
CREATE TABLE subjects (
    subject_id VARCHAR(20) PRIMARY KEY, -- VD: 'TIN01'
    subject_name VARCHAR(100) NOT NULL,
    credits INT NOT NULL CHECK (credits > 0),
    description TEXT
);

-- 9. Bảng Môn tiên quyết (Logic ràng buộc đăng ký)
CREATE TABLE subject_prerequisites (
    subject_id VARCHAR(20) REFERENCES subjects(subject_id),
    prerequisite_id VARCHAR(20) REFERENCES subjects(subject_id), -- Môn phải học trước
    PRIMARY KEY (subject_id, prerequisite_id)
);

-- 10. Bảng Lớp học phần (Mở theo từng kỳ)
CREATE TABLE course_sections (
    section_id SERIAL PRIMARY KEY, -- ID tự tăng (vì mã lớp HP thường dài và đổi liên tục)
    subject_id VARCHAR(20) REFERENCES subjects(subject_id),
    lecturer_id VARCHAR(20) REFERENCES lecturers(lecturer_id), -- GV giảng dạy
    semester VARCHAR(10) NOT NULL, -- VD: 'HK1'
    academic_year VARCHAR(9) NOT NULL, -- VD: '2024-2025'
    room_default VARCHAR(50), -- Phòng học chính
    max_capacity INT DEFAULT 60,
    section_code VARCHAR(50) UNIQUE NOT NULL, -- Mã lớp học phần duy nhất
    is_locked BOOLEAN DEFAULT FALSE -- Khóa lớp không cho đăng ký thêm
);

-- 11. Bảng Danh sách sinh viên trong lớp học phần
CREATE TABLE section_students (
    section_id INT REFERENCES course_sections(section_id) ON DELETE CASCADE,
    student_id VARCHAR(20) REFERENCES students(student_id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (section_id, student_id)
);

-- 12. Bảng Thời khóa biểu chi tiết (1 môn có thể học nhiều buổi/tuần)
CREATE TABLE schedules (
    schedule_id SERIAL PRIMARY KEY,
    section_id INT REFERENCES course_sections(section_id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week BETWEEN 2 AND 8), -- Thứ 2 đến Chủ nhật (8)
    start_period INT CHECK (start_period BETWEEN 1 AND 15), -- Tiết bắt đầu
    end_period INT CHECK (end_period BETWEEN 1 AND 15),     -- Tiết kết thúc
    room VARCHAR(50) -- Phòng học (nếu thay đổi theo buổi)
);

-- 13. Bảng Điểm (Quan trọng nhất)
CREATE TABLE grades (
    grade_id SERIAL PRIMARY KEY,
    section_id INT REFERENCES course_sections(section_id),
    student_id VARCHAR(20) REFERENCES students(student_id),
    
    -- Các cột điểm thành phần
    attendance DECIMAL(4,2) CHECK (attendance BETWEEN 0 AND 10), -- Chuyên cần
    midterm DECIMAL(4,2) CHECK (midterm BETWEEN 0 AND 10),       -- Giữa kỳ
    final DECIMAL(4,2) CHECK (final BETWEEN 0 AND 10),           -- Cuối kỳ
    
    -- Các cột điểm tổng kết (Tính toán bởi Backend/Trigger)
    total_10 DECIMAL(4,2),   -- Hệ 10
    total_4 DECIMAL(4,2),    -- Hệ 4
    grade_char VARCHAR(2),   -- Điểm chữ (A, B+, F...)
    
    -- Trạng thái duyệt điểm
    status grade_status DEFAULT 'DRAFT', -- GV nhập xong phải gửi duyệt (SUBMITTED)
    
    CONSTRAINT unique_student_grade UNIQUE (section_id, student_id)
);

-- PHẦN 4: TIỆN ÍCH & THÔNG BÁO
-- 14. Bảng Yêu cầu học vụ (Phúc khảo / Bảo lưu)
CREATE TABLE academic_requests (
    request_id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id),
    request_type request_type NOT NULL,
    reason TEXT NOT NULL,
    status request_status DEFAULT 'PENDING',
    admin_response TEXT, -- Phản hồi từ nhà trường
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Bảng Thông báo (Push Notification)
-- Lưu lịch sử thông báo để hiển thị lại trên App
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id), -- Người nhận
    title VARCHAR(200),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Bảng Điểm danh (Attendance Tracking)
CREATE TABLE attendances (
    attendance_id SERIAL PRIMARY KEY,
    section_id INT REFERENCES course_sections(section_id) ON DELETE CASCADE,
    student_id VARCHAR(20) REFERENCES students(student_id) ON DELETE CASCADE,
    schedule_id INT REFERENCES schedules(schedule_id) ON DELETE SET NULL,
    week INT CHECK (week BETWEEN 1 AND 16), -- Tuần học (1-16)
    day_of_week INT CHECK (day_of_week BETWEEN 2 AND 8), -- Thứ 2-8
    status VARCHAR(20) DEFAULT 'PRESENT', -- PRESENT, ABSENT, LATE, EXCUSED
    notes TEXT, -- Ghi chú (lý do vắng, v.v.)
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by VARCHAR(20) REFERENCES lecturers(lecturer_id), -- GV ghi danh
    CONSTRAINT unique_attendance UNIQUE (section_id, student_id, week, day_of_week)
);

-- PHẦN 5: DỮ LIỆU MẪU ĐỂ TEST GOOGLE LOGIN (SEED DATA)
-- 1. Tạo Admin
INSERT INTO users (email, username, role, full_name) 
VALUES ('skillsaanh@gmail.com', 'ADMIN01', 'ADMIN', 'Quản trị viên');

-- 2. Tạo Giảng viên (Đã có trong Whitelist)
-- Bước 2.1: Tạo User trước
INSERT INTO users (email, username, role, full_name) 
VALUES ('sinfour503@gmail.com', 'GV001', 'LECTURER', 'Nguyễn Văn A');

-- Bước 2.2: Tạo dữ liệu Khoa
INSERT INTO faculties (faculty_id, faculty_name) VALUES ('IET', 'Viện Kỹ thuật - Công nghệ');

-- Bước 2.3: Link User vào bảng Lecturers
INSERT INTO lecturers (lecturer_id, user_id, faculty_id, degree, phone) 
VALUES ('GV001', (SELECT user_id FROM users WHERE username='GV001'), 'IET', 'Thạc sĩ', '0987654321');

-- 3. Tạo Sinh viên (Đã có trong Whitelist)
INSERT INTO users (email, username, role, full_name) 
VALUES ('2224802010365@student.tdmu.edu.vn', '2224802010365', 'STUDENT', 'Nguyễn Văn B');

-- Bước 3.1: Tạo Ngành & Lớp
INSERT INTO majors (major_id, faculty_id, major_name) VALUES ('7480201', 'IET', 'Công nghệ thông tin');
INSERT INTO classes (class_id, major_id, advisor_id, class_name, enrollment_year) 
VALUES ('D22HT01', '7480201', 'GV001', 'ĐH CNTT K14 - Lớp 01', 2022);

-- Bước 3.2: Link User vào bảng Students
INSERT INTO students (student_id, user_id, class_id, dob, gender, status) 
VALUES ('2224802010365', (SELECT user_id FROM users WHERE username='2224802010365'), 'D22HT01', '2004-01-01', 'Nam', 'STUDYING');
