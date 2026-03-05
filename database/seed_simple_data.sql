-- Simple seed data without Vietnamese characters
-- Run after schema creation

TRUNCATE TABLE notifications, academic_requests, grades, schedules, section_students, course_sections, subject_prerequisites, subjects, students, classes, lecturers, majors, faculties, users CASCADE;

ALTER SEQUENCE users_user_id_seq RESTART WITH 1;
ALTER SEQUENCE course_sections_section_id_seq RESTART WITH 1;
ALTER SEQUENCE schedules_schedule_id_seq RESTART WITH 1;
ALTER SEQUENCE grades_grade_id_seq RESTART WITH 1;
ALTER SEQUENCE academic_requests_request_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_notification_id_seq RESTART WITH 1;

-- USERS
INSERT INTO users (email, username, role, full_name, is_active) VALUES
('admin1@tdmu.edu.vn', 'ADMIN01', 'ADMIN', 'Admin User 1', TRUE),
('admin2@tdmu.edu.vn', 'ADMIN02', 'ADMIN', 'Admin User 2', TRUE),
('skillsaanh@gmail.com', 'ADMIN03', 'ADMIN', 'Admin User 3', TRUE),
('lecturer1@tdmu.edu.vn', 'GV001', 'LECTURER', 'Lecturer One', TRUE),
('lecturer2@tdmu.edu.vn', 'GV002', 'LECTURER', 'Lecturer Two', TRUE),
('sinfour503@gmail.com', 'GV003', 'LECTURER', 'Lecturer Three', TRUE),
('student1@student.tdmu.edu.vn', '2224802010001', 'STUDENT', 'Student One', TRUE),
('student2@student.tdmu.edu.vn', '2224802010002', 'STUDENT', 'Student Two', TRUE),
('2224802010365@student.tdmu.edu.vn', '2224802010365', 'STUDENT', 'Student Three', TRUE);

-- FACULTIES
INSERT INTO faculties (faculty_id, faculty_name, description) VALUES
('IET', 'Information Technology', 'IT and Engineering'),
('ECON', 'Economics', 'Business and Economics'),
('LANG', 'Languages', 'Foreign Languages');

-- MAJORS
INSERT INTO majors (major_id, faculty_id, major_name, total_credits) VALUES
('7480201', 'IET', 'Computer Science', 150),
('7340101', 'ECON', 'Business Administration', 140),
('7220201', 'LANG', 'English Language', 130);

-- LECTURERS
INSERT INTO lecturers (lecturer_id, user_id, faculty_id, degree, phone) VALUES
('GV001', (SELECT user_id FROM users WHERE username='GV001'), 'IET', 'Master', '0901234567'),
('GV002', (SELECT user_id FROM users WHERE username='GV002'), 'IET', 'PhD', '0902345678'),
('GV003', (SELECT user_id FROM users WHERE username='GV003'), 'ECON', 'Master', '0903456789');

-- CLASSES
INSERT INTO classes (class_id, major_id, advisor_id, class_name, enrollment_year) VALUES
('D22CNTT01', '7480201', 'GV001', 'CS Class 01', 2022),
('D22CNTT02', '7480201', 'GV002', 'CS Class 02', 2022),
('D22QTKD01', '7340101', 'GV003', 'BA Class 01', 2022);

-- STUDENTS
INSERT INTO students (student_id, user_id, class_id, dob, gender, phone, address, gpa_accumulated, status) VALUES
('2224802010001', (SELECT user_id FROM users WHERE username='2224802010001'), 'D22CNTT01', '2004-01-15', 'Male', '0911111111', 'HCMC', 3.25, 'STUDYING'),
('2224802010002', (SELECT user_id FROM users WHERE username='2224802010002'), 'D22CNTT01', '2004-03-20', 'Female', '0922222222', 'Hanoi', 3.50, 'STUDYING'),
('2224802010365', (SELECT user_id FROM users WHERE username='2224802010365'), 'D22CNTT02', '2004-05-10', 'Male', '0933333333', 'Danang', 3.75, 'STUDYING');

-- SUBJECTS
INSERT INTO subjects (subject_id, subject_name, credits, description) VALUES
('CS101', 'Programming Basics', 3, 'Learn C/C++'),
('CS102', 'Data Structures', 3, 'Arrays, Lists, Trees'),
('CS201', 'Database Systems', 3, 'SQL and DB Design'),
('MATH101', 'Calculus 1', 4, 'Math fundamentals'),
('ENG101', 'English 1', 3, 'Basic English');

-- SUBJECT_PREREQUISITES
INSERT INTO subject_prerequisites (subject_id, prerequisite_id) VALUES
('CS102', 'CS101'),
('CS201', 'CS102');

-- COURSE_SECTIONS
INSERT INTO course_sections (subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES
('CS101', 'GV001', 'HK1', '2024-2025', 'A101', 60, 'CS101-01-2425', FALSE),
('CS102', 'GV001', 'HK1', '2024-2025', 'A102', 60, 'CS102-01-2425', FALSE),
('CS201', 'GV002', 'HK2', '2024-2025', 'B201', 50, 'CS201-01-2425', FALSE),
('MATH101', 'GV002', 'HK1', '2024-2025', 'C301', 80, 'MATH101-01-2425', FALSE),
('ENG101', 'GV003', 'HK1', '2024-2025', 'D401', 40, 'ENG101-01-2425', FALSE);

-- SECTION_STUDENTS
INSERT INTO section_students (section_id, student_id) VALUES
(1, '2224802010001'), (2, '2224802010001'), (4, '2224802010001'),
(1, '2224802010002'), (4, '2224802010002'), (5, '2224802010002'),
(1, '2224802010365'), (2, '2224802010365');

-- SCHEDULES
INSERT INTO schedules (section_id, day_of_week, start_period, end_period, room) VALUES
(1, 2, 1, 3, 'A101'), (1, 4, 1, 3, 'A101'),
(2, 3, 4, 6, 'A102'), (2, 5, 4, 6, 'A102'),
(3, 2, 7, 9, 'B201'), (3, 4, 7, 9, 'B201'),
(4, 3, 1, 3, 'C301'), (4, 5, 1, 3, 'C301'), (4, 6, 1, 3, 'C301'),
(5, 2, 4, 6, 'D401'), (5, 4, 4, 6, 'D401');

-- GRADES
INSERT INTO grades (section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES
(1, '2224802010001', 9.0, 8.5, 8.0, 8.25, 4.0, 'A', 'APPROVED'),
(2, '2224802010001', 8.0, 7.5, 7.0, 7.35, 3.0, 'B', 'APPROVED'),
(4, '2224802010001', 7.0, 6.5, 6.0, 6.35, 2.5, 'C+', 'APPROVED'),
(1, '2224802010002', 10.0, 9.5, 9.0, 9.25, 4.0, 'A+', 'APPROVED'),
(4, '2224802010002', 9.0, 8.0, 8.5, 8.40, 4.0, 'A', 'APPROVED'),
(5, '2224802010002', 8.5, 8.0, 7.5, 7.85, 3.5, 'B+', 'APPROVED'),
(1, '2224802010365', 8.0, 7.0, 7.5, 7.40, 3.0, 'B', 'APPROVED'),
(2, '2224802010365', 7.5, 7.0, NULL, NULL, NULL, NULL, 'DRAFT');

-- ACADEMIC_REQUESTS
INSERT INTO academic_requests (student_id, request_type, reason, status, admin_response, created_at) VALUES
('2224802010001', 'REVIEW', 'Request grade review for Math', 'APPROVED', 'Grade is correct', NOW() - INTERVAL '5 days'),
('2224802010002', 'RESERVE', 'Family reasons', 'PENDING', NULL, NOW() - INTERVAL '2 days'),
('2224802010365', 'RETAKE', 'Want to improve grade', 'PENDING', NULL, NOW());

-- NOTIFICATIONS
INSERT INTO notifications (user_id, title, message, is_read, created_at) VALUES
((SELECT user_id FROM users WHERE username='2224802010001'), 'Grade Approved', 'Your grade has been approved', TRUE, NOW() - INTERVAL '3 days'),
((SELECT user_id FROM users WHERE username='2224802010001'), 'Request Processed', 'Your review request approved', FALSE, NOW() - INTERVAL '1 day'),
((SELECT user_id FROM users WHERE username='2224802010002'), 'New Grade', 'New grade for English 1', FALSE, NOW()),
((SELECT user_id FROM users WHERE username='GV001'), 'Reminder', 'Please complete grade entry', FALSE, NOW());

-- Check counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'faculties', COUNT(*) FROM faculties
UNION ALL SELECT 'majors', COUNT(*) FROM majors
UNION ALL SELECT 'lecturers', COUNT(*) FROM lecturers
UNION ALL SELECT 'classes', COUNT(*) FROM classes
UNION ALL SELECT 'students', COUNT(*) FROM students
UNION ALL SELECT 'subjects', COUNT(*) FROM subjects
UNION ALL SELECT 'subject_prerequisites', COUNT(*) FROM subject_prerequisites
UNION ALL SELECT 'course_sections', COUNT(*) FROM course_sections
UNION ALL SELECT 'section_students', COUNT(*) FROM section_students
UNION ALL SELECT 'schedules', COUNT(*) FROM schedules
UNION ALL SELECT 'grades', COUNT(*) FROM grades
UNION ALL SELECT 'academic_requests', COUNT(*) FROM academic_requests
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications;

SELECT email, username, role, full_name FROM users ORDER BY role, username;
