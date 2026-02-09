# Design Document: Course Sections CRUD Operations

## Overview

This design document specifies the implementation of Read, Update, and Delete operations for course sections, completing the CRUD functionality. These operations follow the same architectural patterns as the Create operation.

## API Endpoints

### 1. Get All Course Sections
```
GET /api/academic/course-sections
Query Parameters (optional):
  - semester: Filter by semester (e.g., 'HK1')
  - academic_year: Filter by academic year (e.g., '2024-2025')
```

**Success Response (200):**
```json
[
  {
    "section_id": 1,
    "subject_id": "TIN01",
    "subject_name": "Lập trình cơ bản",
    "lecturer_id": "GV001",
    "lecturer_name": "Thầy Nguyễn Văn A",
    "semester": "HK1",
    "academic_year": "2024-2025",
    "max_capacity": 60,
    "section_code": "TIN01-HK1-2024",
    "enrolled_count": 45,
    "is_locked": false
  }
]
```

### 2. Get Single Course Section
```
GET /api/academic/course-sections/:id
```

**Success Response (200):**
```json
{
  "section_id": 1,
  "subject_id": "TIN01",
  "subject_name": "Lập trình cơ bản",
  "credits": 3,
  "lecturer_id": "GV001",
  "lecturer_name": "Thầy Nguyễn Văn A",
  "semester": "HK1",
  "academic_year": "2024-2025",
  "room_default": "A101",
  "max_capacity": 60,
  "section_code": "TIN01-HK1-2024",
  "enrolled_count": 45,
  "is_locked": false
}
```

**Error Response (404):**
```json
{
  "error": "Course section not found"
}
```

### 3. Update Course Section
```
PUT /api/academic/course-sections/:id
```

**Request Body:**
```json
{
  "subject_id": "TIN01",
  "teacher_id": "GV001",
  "semester": "HK1",
  "year": "2024-2025",
  "max_students": 70,
  "section_code": "TIN01-HK1-2024",
  "room_default": "A102",
  "is_locked": false
}
```

**Success Response (200):**
```json
{
  "message": "Cập nhật lớp học phần thành công",
  "data": {
    "section_id": 1,
    "subject_id": "TIN01",
    "teacher_id": "GV001",
    "semester": "HK1",
    "year": "2024-2025",
    "max_students": 70,
    "section_code": "TIN01-HK1-2024",
    "room_default": "A102",
    "is_locked": false
  }
}
```

### 4. Delete Course Section
```
DELETE /api/academic/course-sections/:id
```

**Success Response (200):**
```json
{
  "message": "Xóa lớp học phần thành công"
}
```

**Error Response (404):**
```json
{
  "error": "Course section not found"
}
```

**Error Response (400):**
```json
{
  "error": "Cannot delete course section with enrolled students"
}
```

## Implementation Details

### Controller Functions

1. **getAllCourseSections(req, res)**
   - Extract query parameters (semester, academic_year)
   - Build dynamic SQL query with optional filters
   - Join with subjects and lecturers tables for names
   - Count enrolled students from section_students table
   - Return array of course sections

2. **getCourseSectionById(req, res)**
   - Extract section_id from params
   - Query course section with joins for related data
   - Return 404 if not found
   - Return complete course section details

3. **updateCourseSection(req, res)**
   - Extract section_id from params
   - Validate request body (similar to create)
   - Check if course section exists
   - Validate subject and teacher if being updated
   - Check for duplicate section_code (excluding current record)
   - Update course section
   - Return updated data

4. **deleteCourseSection(req, res)**
   - Extract section_id from params
   - Check if course section exists
   - Check if students are enrolled
   - Delete course section (cascade deletes schedules)
   - Return success message

## Database Queries

### Get All with Filters
```sql
SELECT 
  cs.section_id,
  cs.subject_id,
  s.subject_name,
  cs.lecturer_id,
  CONCAT(u.full_name) as lecturer_name,
  cs.semester,
  cs.academic_year,
  cs.max_capacity,
  cs.section_code,
  cs.room_default,
  cs.is_locked,
  COUNT(ss.student_id) as enrolled_count
FROM course_sections cs
LEFT JOIN subjects s ON cs.subject_id = s.subject_id
LEFT JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
LEFT JOIN users u ON l.user_id = u.user_id
LEFT JOIN section_students ss ON cs.section_id = ss.section_id
WHERE ($1::text IS NULL OR cs.semester = $1)
  AND ($2::text IS NULL OR cs.academic_year = $2)
GROUP BY cs.section_id, s.subject_name, cs.lecturer_id, u.full_name
ORDER BY cs.academic_year DESC, cs.semester, s.subject_name
```

### Update Query
```sql
UPDATE course_sections 
SET subject_id = $1,
    lecturer_id = $2,
    semester = $3,
    academic_year = $4,
    max_capacity = $5,
    section_code = $6,
    room_default = $7,
    is_locked = $8
WHERE section_id = $9
RETURNING *
```

### Delete Query
```sql
DELETE FROM course_sections WHERE section_id = $1
```

## Validation Rules

### Update Operation
- All validation rules from Create operation apply
- Additionally check that section_id exists
- When checking duplicate section_code, exclude current record

### Delete Operation
- Check if course section exists
- Optionally check if students are enrolled (business rule decision)
