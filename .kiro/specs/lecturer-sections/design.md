# Design Document: Lecturer Sections

## Overview

The Lecturer Sections feature provides APIs for lecturers to view and manage their teaching assignments. This is essential for lecturers to access their class rosters and teaching schedules.

## API Endpoints

### 1. Get Lecturer's Course Sections
```
GET /api/lecturers/:lecturerId/sections
GET /api/lecturers/:lecturerId/sections?semester=HK1
GET /api/lecturers/:lecturerId/sections?academic_year=2024-2025
GET /api/lecturers/:lecturerId/sections?semester=HK1&academic_year=2024-2025
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
    "semester": "HK1",
    "academic_year": "2024-2025",
    "max_capacity": 60,
    "enrolled_count": 45,
    "room_default": "A101",
    "is_locked": false,
    "schedules": [
      {
        "day_of_week": 2,
        "day_name": "Thứ 2",
        "start_period": 1,
        "end_period": 3,
        "room": "A101"
      }
    ]
  }
]
```

### 2. Get Lecturer's Section Details
```
GET /api/lecturers/:lecturerId/sections/:sectionId
```

**Success Response (200):**
```json
{
  "section_id": 1,
  "section_code": "TIN01-HK1-2024",
  "subject_id": "TIN01",
  "subject_name": "Lập trình cơ bản",
  "credits": 3,
  "semester": "HK1",
  "academic_year": "2024-2025",
  "max_capacity": 60,
  "enrolled_count": 45,
  "room_default": "A101",
  "is_locked": false,
  "students": [
    {
      "student_id": "212480201",
      "full_name": "Trần Thị Em",
      "email": "student@gmail.com",
      "class_name": "ĐH CNTT K13 - Lớp 01"
    }
  ],
  "schedules": [
    {
      "day_of_week": 2,
      "day_name": "Thứ 2",
      "start_period": 1,
      "end_period": 3,
      "room": "A101"
    }
  ]
}
```

**Error Response (403):**
```json
{
  "error": "You are not assigned to this course section"
}
```

### 3. Get Lecturer Statistics
```
GET /api/lecturers/:lecturerId/statistics
GET /api/lecturers/:lecturerId/statistics?semester=HK1&academic_year=2024-2025
```

**Success Response (200):**
```json
{
  "lecturer_id": "GV001",
  "full_name": "Thầy Nguyễn Văn A",
  "semester": "HK1",
  "academic_year": "2024-2025",
  "statistics": {
    "total_sections": 5,
    "total_students": 250,
    "average_class_size": 50,
    "sections_by_subject": [
      {
        "subject_name": "Lập trình cơ bản",
        "section_count": 2,
        "student_count": 100
      }
    ]
  }
}
```

## Implementation Details

### Query for Lecturer's Sections

```sql
SELECT 
  cs.section_id,
  cs.section_code,
  cs.subject_id,
  s.subject_name,
  s.credits,
  cs.semester,
  cs.academic_year,
  cs.max_capacity,
  cs.room_default,
  cs.is_locked,
  COUNT(DISTINCT ss.student_id) as enrolled_count
FROM course_sections cs
JOIN subjects s ON cs.subject_id = s.subject_id
LEFT JOIN section_students ss ON cs.section_id = ss.section_id
WHERE cs.lecturer_id = $1
  AND ($2::text IS NULL OR cs.semester = $2)
  AND ($3::text IS NULL OR cs.academic_year = $3)
GROUP BY cs.section_id, s.subject_name, s.credits
ORDER BY cs.academic_year DESC, cs.semester, s.subject_name
```

### Query for Section Schedules

```sql
SELECT 
  schedule_id,
  day_of_week,
  start_period,
  end_period,
  room
FROM schedules
WHERE section_id = $1
ORDER BY day_of_week, start_period
```

### Query for Section Students

```sql
SELECT 
  st.student_id,
  u.full_name,
  u.email,
  c.class_name
FROM section_students ss
JOIN students st ON ss.student_id = st.student_id
JOIN users u ON st.user_id = u.user_id
LEFT JOIN classes c ON st.class_id = c.class_id
WHERE ss.section_id = $1
ORDER BY st.student_id
```

### Query for Lecturer Statistics

```sql
SELECT 
  COUNT(DISTINCT cs.section_id) as total_sections,
  COUNT(DISTINCT ss.student_id) as total_students,
  AVG(student_counts.count) as average_class_size
FROM course_sections cs
LEFT JOIN section_students ss ON cs.section_id = ss.section_id
LEFT JOIN (
  SELECT section_id, COUNT(*) as count
  FROM section_students
  GROUP BY section_id
) student_counts ON cs.section_id = student_counts.section_id
WHERE cs.lecturer_id = $1
  AND ($2::text IS NULL OR cs.semester = $2)
  AND ($3::text IS NULL OR cs.academic_year = $3)
```

## Helper Functions

### getDayName(day_of_week)
Reuse existing helper function from schedules controller.

### attachSchedulesToSections(sections)
For each section, fetch and attach schedules with day names.

## Security Considerations

1. **Authorization Check:** Verify lecturer_id matches the requesting user (future enhancement)
2. **Section Access:** Verify lecturer is assigned to section before showing details
3. **Data Privacy:** Only show student information for lecturer's own sections
