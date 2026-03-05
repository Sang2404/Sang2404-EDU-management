-- Migration: Fix Faculty and Major delete constraints
-- Ngày tạo: 2026-03-05
-- Mục đích: Cho phép xóa Khoa và Ngành

-- 1. Sửa constraint của lecturers.faculty_id
ALTER TABLE lecturers 
DROP CONSTRAINT IF EXISTS lecturers_faculty_id_fkey;

ALTER TABLE lecturers 
ADD CONSTRAINT lecturers_faculty_id_fkey 
FOREIGN KEY (faculty_id) REFERENCES faculties(faculty_id) 
ON DELETE SET NULL;  -- Khi xóa khoa, set faculty_id của giảng viên = NULL

-- 2. Sửa constraint của classes.major_id
ALTER TABLE classes 
DROP CONSTRAINT IF EXISTS classes_major_id_fkey;

ALTER TABLE classes 
ADD CONSTRAINT classes_major_id_fkey 
FOREIGN KEY (major_id) REFERENCES majors(major_id) 
ON DELETE SET NULL;  -- Khi xóa ngành, set major_id của lớp = NULL

-- Kiểm tra kết quả
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (ccu.table_name = 'faculties' OR ccu.table_name = 'majors')
ORDER BY tc.table_name;
