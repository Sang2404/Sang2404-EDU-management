-- Migration: Add grade_id column to academic_requests table
-- This allows linking grade review requests to specific grades

-- Add grade_id column with foreign key constraint
ALTER TABLE academic_requests 
ADD COLUMN grade_id INT REFERENCES grades(grade_id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_academic_requests_student ON academic_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_requests_status ON academic_requests(status);
CREATE INDEX IF NOT EXISTS idx_academic_requests_grade ON academic_requests(grade_id);

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'academic_requests'
ORDER BY ordinal_position;
