# Design Document: Section Students Management

## Overview

The Section Students Management feature provides APIs for enrolling and managing students in course sections. This is a critical feature for class roster management.

## API Endpoints

### 1. Add Student to Course Section
```
POST /api/academic/course-sections/:sectionId/students
```

**Request Body:**
```json
{
  "student_id": "212480201"
}
```

**Success Response (201):**
```json
{
  "message": "Thêm sinh viên vào lớp thành công",
  "data": {
    "section_id": 1,
    "student_id": "212480201",
    "registered_at": "2024-02-08T10:30:00.000Z"
  }
}
```

**Error Responses:**
- 400: Student/Section not found, Section locked, Section full
- 409: Student already enrolled

### 2. Remove Student from Course Section
```
DELETE /api/academic/course-sections/:sectionId/students/:studentId
```

**Success Response (200):**
```json
{
  "message": "Xóa sinh viên khỏi lớp thành công"
}
```

### 3. Get Students in Course Section
```
GET /api/academic/course-sections/:sectionId/students
```

**Success Response (200):**
```json
[
  {
    "student_id": "212480201",
    "full_name": "Trần Thị Em",
    "email": "sinhvien@gmail.com",
    "class_id": "D21HT01",
    "class_name": "ĐH CNTT K13 - Lớp 01",
    "registered_at": "2024-02-08T10:30:00.000Z"
  }
]
```

### 4. Get Course Sections for Student
```
GET /api/academic/students/:studentId/sections
```

**Success Response (200):**
```json
[
  {
    "section_id": 1,
    "section_code": "TIN01-HK1-2024",
    "subject_id": "TIN01",
    "subject_name": "Lập trình cơ bản",
    "credits": 3,
    "lecturer_name": "Thầy Nguyễn Văn A",
    "semester": "HK1",
    "academic_year": "2024-2025",
    "room_default": "A101",
    "registered_at": "2024-02-08T10:30:00.000Z"
  }
]
```

### 5. Bulk Add Students to Course Section
```
POST /api/academic/course-sections/:sectionId/students/bulk
```

**Request Body:**
```json
{
  "student_ids": ["212480201", "212480202", "212480203"]
}
```

**Success Response (200):**
```json
{
  "message": "Đã thêm 3 sinh viên vào lớp",
  "summary": {
    "total": 3,
    "successful": 2,
    "failed": 1,
    "skipped": 0
  },
  "details": {
    "successful": ["212480201", "212480202"],
    "failed": [
      {
        "student_id": "212480203",
        "reason": "Student does not exist"
      }
    ],
    "skipped": []
  }
}
```

## Validation Logic

### Add Student Validation

1. **Check student exists:**
```sql
SELECT student_id FROM students WHERE student_id = $1
```

2. **Check section exists and get details:**
```sql
SELECT section_id, max_capacity, is_locked FROM course_sections WHERE section_id = $1
```

3. **Check if section is locked:**
```javascript
if (section.is_locked) {
  return 400: "Course section is locked"
}
```

4. **Check current enrollment count:**
```sql
SELECT COUNT(*) FROM section_students WHERE section_id = $1
```

5. **Check if full:**
```javascript
if (enrolledCount >= section.max_capacity) {
  return 400: "Course section is full"
}
```

6. **Check duplicate enrollment:**
```sql
SELECT * FROM section_students WHERE section_id = $1 AND student_id = $2
```

7. **Insert enrollment:**
```sql
INSERT INTO section_students (section_id, student_id) VALUES ($1, $2)
RETURNING *
```

## Database Schema

Already exists in schema.sql:
```sql
CREATE TABLE section_students (
    section_id INT REFERENCES course_sections(section_id) ON DELETE CASCADE,
    student_id VARCHAR(20) REFERENCES students(student_id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (section_id, student_id)
);
```

## Implementation Notes

1. Enrollment timestamp is automatically set by database
2. Cascade delete ensures cleanup when section or student is deleted
3. Composite primary key prevents duplicate enrollments at database level
4. Bulk operations should be transactional (all or nothing) - optional enhancement
5. Consider adding enrollment status (ENROLLED, WITHDRAWN, COMPLETED) - future enhancement
