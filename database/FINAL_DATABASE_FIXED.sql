-- Import dữ liệu theo đúng thứ tự Foreign Key
-- Generated from FINAL_DATABASE_BACKUP.sql

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- USERS (6 rows)
INSERT INTO public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) VALUES (93, 'skillsanh@gmail.com', 'ADMIN01', 'ADMIN', 'Quản trị viên Hệ thống', NULL, true, '2026-03-05 15:20:05.626981');
INSERT INTO public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) VALUES (94, 'sinfour503@gmail.com', 'GV001', 'LECTURER', 'TS. Nguyễn Văn Minh', NULL, true, '2026-03-05 15:20:05.626981');
INSERT INTO public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) VALUES (95, '2224802010365@student.tdmu.edu.vn', '2224802010365', 'STUDENT', 'Nguyễn Thị Hương', NULL, true, '2026-03-05 15:20:05.626981');
INSERT INTO public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) VALUES (96, 'trungloptruong123@gmail.com', '2224802010366', 'STUDENT', 'Trần Văn Trung', NULL, true, '2026-03-05 15:20:05.626981');
INSERT INTO public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) VALUES (97, '2224802010902@student.tdmu.edu.vn', 'dangdinhtrung', 'ADMIN', 'Đặng Đình Trung', NULL, true, '2026-03-05 16:01:04.65396');
INSERT INTO public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) VALUES (98, 'trunggiangvien123@gmail.com', 'GV002', 'LECTURER', 'PGS. TS. Trần Văn Trung', NULL, true, '2026-03-05 16:14:37.474957');

-- FACULTIES (1 rows)
INSERT INTO public.faculties (faculty_id, faculty_name, description) VALUES ('IET', 'Viện Kỹ thuật - Công nghệ', 'Đào tạo các ngành kỹ thuật');

-- MAJORS (1 rows)
INSERT INTO public.majors (major_id, faculty_id, major_name, total_credits) VALUES ('7480201', 'IET', 'Công nghệ thông tin', 150);

-- SUBJECTS (20 rows)
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN101', 'Nhập môn Lập trình', 3, 'Học lập trình cơ bản với C/C++');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN102', 'Cấu trúc dữ liệu và Giải thuật', 4, 'Các cấu trúc dữ liệu cơ bản');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN103', 'Cơ sở dữ liệu', 3, 'Thiết kế và quản lý CSDL');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN104', 'Lập trình Web', 3, 'HTML, CSS, JavaScript');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN105', 'Mạng máy tính', 3, 'Kiến trúc mạng và giao thức');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN106', 'Hệ điều hành', 4, 'Quản lý tiến trình, bộ nhớ');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN107', 'Lập trình hướng đối tượng', 3, 'OOP với Java');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN108', 'Phân tích thiết kế hệ thống', 3, 'UML và mô hình hóa');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN109', 'An toàn thông tin', 3, 'Mã hóa và bảo mật');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN110', 'Trí tuệ nhân tạo', 4, 'Machine Learning cơ bản');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN201', 'Lập trình Python nâng cao', 3, 'Lập trình Python cho Data Science');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN202', 'Học máy và Deep Learning', 4, 'Machine Learning và Neural Networks');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN203', 'Xử lý ảnh số', 3, 'Computer Vision cơ bản');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN204', 'Lập trình Mobile', 3, 'Phát triển ứng dụng Android/iOS');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN205', 'Blockchain và Cryptocurrency', 3, 'Công nghệ Blockchain');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN206', 'Cloud Computing', 4, 'AWS, Azure, Google Cloud');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN207', 'DevOps và CI/CD', 3, 'Docker, Kubernetes, Jenkins');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN208', 'Big Data Analytics', 3, 'Hadoop, Spark, Data Mining');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN209', 'IoT và Embedded Systems', 3, 'Internet of Things');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN210', 'Ethical Hacking', 4, 'Penetration Testing và Security');

-- LECTURERS (2 rows)
INSERT INTO public.lecturers (lecturer_id, user_id, faculty_id, degree, phone) VALUES ('GV001', 94, 'IET', 'Tiến sĩ', '0987654321');
INSERT INTO public.lecturers (lecturer_id, user_id, faculty_id, degree, phone) VALUES ('GV002', 98, 'IET', 'Phó Giáo sư - Tiến sĩ', '0934567890');

-- CLASSES (1 rows)
INSERT INTO public.classes (class_id, major_id, advisor_id, class_name, enrollment_year) VALUES ('D22HT01', '7480201', 'GV001', 'ĐH CNTT K14 - Lớp 01', 2022);

-- STUDENTS (2 rows)
INSERT INTO public.students (student_id, user_id, class_id, dob, gender, phone, address, gpa_accumulated, status) VALUES ('2224802010365', 95, 'D22HT01', '2004-05-15', 'Nữ', '0912345678', NULL, 3.25, 'STUDYING');
INSERT INTO public.students (student_id, user_id, class_id, dob, gender, phone, address, gpa_accumulated, status) VALUES ('2224802010366', 96, 'D22HT01', '2004-08-20', 'Nam', '0923456789', NULL, 3.25, 'STUDYING');

-- COURSE_SECTIONS (20 rows)
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (29, 'TIN101', 'GV001', 'HK2', '2025-2026', 'A101', 60, 'TIN101-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (30, 'TIN102', 'GV001', 'HK2', '2025-2026', 'A102', 60, 'TIN102-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (31, 'TIN103', 'GV001', 'HK2', '2025-2026', 'A103', 60, 'TIN103-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (32, 'TIN104', 'GV001', 'HK2', '2025-2026', 'A104', 60, 'TIN104-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (33, 'TIN105', 'GV001', 'HK2', '2025-2026', 'A105', 60, 'TIN105-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (34, 'TIN106', 'GV001', 'HK2', '2025-2026', 'A106', 60, 'TIN106-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (35, 'TIN107', 'GV001', 'HK2', '2025-2026', 'A107', 60, 'TIN107-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (36, 'TIN108', 'GV001', 'HK2', '2025-2026', 'A108', 60, 'TIN108-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (37, 'TIN109', 'GV001', 'HK2', '2025-2026', 'A109', 60, 'TIN109-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (38, 'TIN110', 'GV001', 'HK2', '2025-2026', 'A110', 60, 'TIN110-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (39, 'TIN201', 'GV002', 'HK2', '2025-2026', 'B201', 60, 'TIN201-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (40, 'TIN202', 'GV002', 'HK2', '2025-2026', 'B202', 60, 'TIN202-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (41, 'TIN203', 'GV002', 'HK2', '2025-2026', 'B203', 60, 'TIN203-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (42, 'TIN204', 'GV002', 'HK2', '2025-2026', 'B204', 60, 'TIN204-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (43, 'TIN205', 'GV002', 'HK2', '2025-2026', 'B205', 60, 'TIN205-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (44, 'TIN206', 'GV002', 'HK2', '2025-2026', 'B206', 60, 'TIN206-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (45, 'TIN207', 'GV002', 'HK2', '2025-2026', 'B207', 60, 'TIN207-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (46, 'TIN208', 'GV002', 'HK2', '2025-2026', 'B208', 60, 'TIN208-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (47, 'TIN209', 'GV002', 'HK2', '2025-2026', 'B209', 60, 'TIN209-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (48, 'TIN210', 'GV002', 'HK2', '2025-2026', 'B210', 60, 'TIN210-01', false);

-- SECTION_STUDENTS (30 rows)
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (29, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (29, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (30, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (30, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (31, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (31, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (32, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (32, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (33, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (33, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (34, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (34, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (35, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (35, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (36, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (36, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (37, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (37, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (38, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (38, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (39, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (40, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (41, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (42, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (43, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (44, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (45, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (46, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (47, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (48, '2224802010366', '2026-03-05 16:21:13.518255');

-- SCHEDULES (20 rows)
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (30, 29, 2, 1, 5, 'A101');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (32, 31, 3, 1, 5, 'A103');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (34, 33, 4, 1, 5, 'A105');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (36, 35, 5, 1, 5, 'A107');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (38, 37, 6, 1, 5, 'A109');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (31, 30, 2, 6, 10, 'A102');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (33, 32, 3, 6, 10, 'A104');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (35, 34, 4, 6, 10, 'A106');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (37, 36, 5, 6, 10, 'A108');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (39, 38, 6, 6, 10, 'A110');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (40, 39, 2, 1, 5, 'B201');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (42, 41, 3, 1, 5, 'B203');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (44, 43, 4, 1, 5, 'B205');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (46, 45, 5, 1, 5, 'B207');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (48, 47, 6, 1, 5, 'B209');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (41, 40, 2, 6, 10, 'B202');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (43, 42, 3, 6, 10, 'B204');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (45, 44, 4, 6, 10, 'B206');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (47, 46, 5, 6, 10, 'B208');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (49, 48, 6, 6, 10, 'B210');

-- GRADES (30 rows)
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (66, 29, '2224802010365', 9.50, 8.50, 9.00, 8.90, 3.70, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (67, 30, '2224802010365', 8.00, 7.50, 8.00, 7.80, 3.30, 'B+', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (68, 31, '2224802010365', 9.00, 9.50, 9.00, 9.10, 4.00, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (69, 32, '2224802010365', 7.00, 6.50, 7.00, 6.80, 3.00, 'B', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (70, 33, '2224802010365', 8.50, 8.00, 8.50, 8.30, 3.50, 'B+', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (71, 34, '2224802010365', 9.00, 8.50, 9.50, 9.00, 4.00, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (72, 35, '2224802010365', 7.50, 7.00, 7.50, 7.30, 3.00, 'B', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (75, 38, '2224802010365', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (76, 29, '2224802010366', 9.50, 8.50, 9.00, 8.90, 3.70, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (77, 30, '2224802010366', 8.00, 7.50, 8.00, 7.80, 3.30, 'B+', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (78, 31, '2224802010366', 9.00, 9.50, 9.00, 9.10, 4.00, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (79, 32, '2224802010366', 7.00, 6.50, 7.00, 6.80, 3.00, 'B', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (80, 33, '2224802010366', 8.50, 8.00, 8.50, 8.30, 3.50, 'B+', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (81, 34, '2224802010366', 9.00, 8.50, 9.50, 9.00, 4.00, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (82, 35, '2224802010366', 7.50, 7.00, 7.50, 7.30, 3.00, 'B', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (85, 38, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (74, 37, '2224802010365', 9.00, 9.00, 9.00, 9.00, 4.00, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (84, 37, '2224802010366', 9.00, 9.00, 9.00, 9.00, 4.00, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (73, 36, '2224802010365', 8.00, 8.50, 8.00, 8.10, 3.50, 'B+', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (83, 36, '2224802010366', 8.00, 8.50, 8.00, 8.10, 3.50, 'B+', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (86, 39, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (87, 40, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (88, 41, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (89, 42, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (90, 43, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (91, 44, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (92, 45, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (93, 46, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (94, 47, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (95, 48, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');

-- ACADEMIC_REQUESTS (7 rows)
INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (8, '2224802010365', 'REVIEW', 'Xin phúc khảo môn Cơ sở dữ liệu vì điểm thi không phù hợp với bài làm', 'PENDING', NULL, '2026-03-05 15:20:05.626981', '2026-03-05 15:20:05.626981', NULL);
INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (9, '2224802010365', 'RESERVE', 'Xin bảo lưu học kỳ 2 do lý do gia đình', 'APPROVED', 'Yêu cầu đã được chấp thuận', '2026-03-05 15:20:05.626981', '2026-03-05 15:20:05.626981', NULL);
INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (10, '2224802010365', 'RETAKE', 'Xin học lại môn Mạng máy tính để cải thiện điểm', 'REJECTED', 'Yêu cầu không đủ điều kiện', '2026-03-05 15:20:05.626981', '2026-03-05 15:20:05.626981', NULL);
INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (11, '2224802010366', 'REVIEW', 'Xin phúc khảo môn Cơ sở dữ liệu vì điểm thi không phù hợp với bài làm', 'PENDING', NULL, '2026-03-05 15:20:05.626981', '2026-03-05 15:20:05.626981', NULL);
INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (12, '2224802010366', 'RESERVE', 'Xin bảo lưu học kỳ 2 do lý do gia đình', 'APPROVED', 'Yêu cầu đã được chấp thuận', '2026-03-05 15:20:05.626981', '2026-03-05 15:20:05.626981', NULL);
INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (13, '2224802010366', 'RETAKE', 'Xin học lại môn Mạng máy tính để cải thiện điểm', 'REJECTED', 'Yêu cầu không đủ điều kiện', '2026-03-05 15:20:05.626981', '2026-03-05 15:20:05.626981', NULL);
INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (14, '2224802010366', 'REVIEW', '12312333333333333333333333', 'PENDING', NULL, '2026-03-05 15:40:40.907152', '2026-03-05 15:40:40.907152', 84);

-- NOTIFICATIONS (10 rows)
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (10, 93, 'Chào mừng Admin', 'Bạn đã đăng nhập với quyền Quản trị viên', true, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (11, 94, 'Chào mừng Giảng viên', 'Bạn có 10 lớp học phần đang giảng dạy', false, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (12, 94, 'Nhắc nhở nhập điểm', 'Còn 1 lớp chưa hoàn thành nhập điểm', false, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (13, 95, 'Chào mừng Sinh viên', 'Bạn đã đăng ký 10 môn học kỳ này', true, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (14, 95, 'Điểm mới', 'Có 2 môn học đang chờ duyệt điểm', false, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (15, 95, 'Yêu cầu học vụ', 'Yêu cầu phúc khảo của bạn đang được xử lý', false, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (16, 96, 'Chào mừng Sinh viên', 'Bạn đã đăng ký 10 môn học kỳ này', true, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (17, 96, 'Điểm mới', 'Có 2 môn học đang chờ duyệt điểm', false, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (18, 96, 'Yêu cầu học vụ', 'Yêu cầu phúc khảo của bạn đang được xử lý', false, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (19, 98, 'Chào mừng Giảng viên', 'Bạn có 10 lớp học phần đang giảng dạy trong HK2 2024-2025', false, '2026-03-05 16:21:13.518255');

-- Reset sequences
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('course_sections_section_id_seq', (SELECT MAX(section_id) FROM course_sections));
SELECT setval('schedules_schedule_id_seq', (SELECT MAX(schedule_id) FROM schedules));
SELECT setval('grades_grade_id_seq', (SELECT MAX(grade_id) FROM grades));
SELECT setval('academic_requests_request_id_seq', (SELECT MAX(request_id) FROM academic_requests));
SELECT setval('notifications_notification_id_seq', (SELECT MAX(notification_id) FROM notifications));

-- Import completed!
