-- Migration: Update user accounts to new emails
-- Date: 2024
-- Description: Update admin, lecturer, and student accounts with new email addresses

-- Step 1: Update or insert Admin account
INSERT INTO users (email, username, role, full_name, is_active) 
VALUES ('skillsaanh@gmail.com', 'ADMIN01', 'ADMIN', 'Quản trị viên', true)
ON CONFLICT (email) DO UPDATE 
SET username = 'ADMIN01', role = 'ADMIN', full_name = 'Quản trị viên', is_active = true;

-- Step 2: Update or insert Lecturer account
-- First, insert/update user
INSERT INTO users (email, username, role, full_name, is_active) 
VALUES ('sinfour503@gmail.com', 'GV001', 'LECTURER', 'Nguyễn Văn A', true)
ON CONFLICT (email) DO UPDATE 
SET username = 'GV001', role = 'LECTURER', full_name = 'Nguyễn Văn A', is_active = true;

-- Ensure faculty exists
INSERT INTO faculties (faculty_id, faculty_name, description) 
VALUES ('IET', 'Viện Kỹ thuật - Công nghệ', 'Viện đào tạo về kỹ thuật và công nghệ')
ON CONFLICT (faculty_id) DO NOTHING;

-- Insert or update lecturer record
INSERT INTO lecturers (lecturer_id, user_id, faculty_id, degree, phone) 
VALUES (
    'GV001', 
    (SELECT user_id FROM users WHERE email = 'sinfour503@gmail.com'), 
    'IET', 
    'Thạc sĩ', 
    '0987654321'
)
ON CONFLICT (lecturer_id) DO UPDATE 
SET user_id = (SELECT user_id FROM users WHERE email = 'sinfour503@gmail.com'),
    faculty_id = 'IET',
    degree = 'Thạc sĩ',
    phone = '0987654321';

-- Step 3: Update or insert Student account
-- First, insert/update user
INSERT INTO users (email, username, role, full_name, is_active) 
VALUES ('2224802010365@student.tdmu.edu.vn', '2224802010365', 'STUDENT', 'Nguyễn Văn B', true)
ON CONFLICT (email) DO UPDATE 
SET username = '2224802010365', role = 'STUDENT', full_name = 'Nguyễn Văn B', is_active = true;

-- Ensure major exists
INSERT INTO majors (major_id, faculty_id, major_name, total_credits) 
VALUES ('7480201', 'IET', 'Công nghệ thông tin', 150)
ON CONFLICT (major_id) DO NOTHING;

-- Ensure class exists
INSERT INTO classes (class_id, major_id, advisor_id, class_name, enrollment_year) 
VALUES ('D22HT01', '7480201', 'GV001', 'ĐH CNTT K14 - Lớp 01', 2022)
ON CONFLICT (class_id) DO NOTHING;

-- Insert or update student record
INSERT INTO students (student_id, user_id, class_id, dob, gender, phone, status, gpa_accumulated) 
VALUES (
    '2224802010365', 
    (SELECT user_id FROM users WHERE email = '2224802010365@student.tdmu.edu.vn'), 
    'D22HT01', 
    '2004-01-01', 
    'Nam',
    NULL,
    'STUDYING',
    0.0
)
ON CONFLICT (student_id) DO UPDATE 
SET user_id = (SELECT user_id FROM users WHERE email = '2224802010365@student.tdmu.edu.vn'),
    class_id = 'D22HT01',
    dob = '2004-01-01',
    gender = 'Nam',
    status = 'STUDYING';

-- Step 4: Clean up old demo accounts (optional - comment out if you want to keep them)
-- DELETE FROM users WHERE email IN ('admin.demo@gmail.com', 'giangvien.demo@gmail.com', 'sinhvien.cuaban@gmail.com', 'skillsanh@gmail.com');

-- Verify the changes
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
ORDER BY u.role;
