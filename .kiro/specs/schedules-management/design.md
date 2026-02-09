# Design Document: Schedules Management

## Overview

The Schedules Management feature provides APIs for creating and managing class schedules. Each schedule defines when and where a course section meets.

## API Endpoints

### 1. Create Schedule
```
POST /api/academic/schedules
```

**Request Body:**
```json
{
  "section_id": 1,
  "day_of_week": 2,
  "start_period": 1,
  "end_period": 3,
  "room": "A101"
}
```

**Success Response (201):**
```json
{
  "message": "Tạo lịch học thành công",
  "data": {
    "schedule_id": 1,
    "section_id": 1,
    "day_of_week": 2,
    "start_period": 1,
    "end_period": 3,
    "room": "A101"
  }
}
```

### 2. Get Schedules by Course Section
```
GET /api/academic/course-sections/:sectionId/schedules
```

**Success Response (200):**
```json
[
  {
    "schedule_id": 1,
    "section_id": 1,
    "day_of_week": 2,
    "day_name": "Thứ 2",
    "start_period": 1,
    "end_period": 3,
    "room": "A101"
  }
]
```

### 3. Get Schedule by ID
```
GET /api/academic/schedules/:id
```

### 4. Update Schedule
```
PUT /api/academic/schedules/:id
```

### 5. Delete Schedule
```
DELETE /api/academic/schedules/:id
```

### 6. Get Student Schedule
```
GET /api/schedules/student/:studentId
```

**Success Response (200):**
```json
[
  {
    "schedule_id": 1,
    "section_id": 1,
    "subject_id": "TIN01",
    "subject_name": "Lập trình cơ bản",
    "lecturer_name": "Thầy Nguyễn Văn A",
    "day_of_week": 2,
    "day_name": "Thứ 2",
    "start_period": 1,
    "end_period": 3,
    "room": "A101",
    "semester": "HK1",
    "academic_year": "2024-2025"
  }
]
```

### 7. Get Lecturer Schedule
```
GET /api/schedules/lecturer/:lecturerId
```

## Validation Rules

### Create/Update Schedule

1. **section_id**: Required, must reference existing course section
2. **day_of_week**: Required, must be integer between 2-8
3. **start_period**: Required, must be integer between 1-15
4. **end_period**: Required, must be integer between 1-15
5. **start_period < end_period**: Required
6. **room**: Optional string

### Conflict Detection

**Room Conflict:**
```sql
SELECT * FROM schedules s
JOIN course_sections cs ON s.section_id = cs.section_id
WHERE s.room = $room
  AND s.day_of_week = $day
  AND cs.semester = $semester
  AND cs.academic_year = $year
  AND s.schedule_id != $currentScheduleId
  AND (
    (s.start_period <= $start AND s.end_period > $start) OR
    (s.start_period < $end AND s.end_period >= $end) OR
    (s.start_period >= $start AND s.end_period <= $end)
  )
```

**Lecturer Conflict:**
```sql
SELECT * FROM schedules s
JOIN course_sections cs ON s.section_id = cs.section_id
WHERE cs.lecturer_id = $lecturerId
  AND s.day_of_week = $day
  AND cs.semester = $semester
  AND cs.academic_year = $year
  AND s.schedule_id != $currentScheduleId
  AND (
    (s.start_period <= $start AND s.end_period > $start) OR
    (s.start_period < $end AND s.end_period >= $end) OR
    (s.start_period >= $start AND s.end_period <= $end)
  )
```

## Helper Functions

### getDayName(day_of_week)
```javascript
const dayNames = {
  2: 'Thứ 2',
  3: 'Thứ 3',
  4: 'Thứ 4',
  5: 'Thứ 5',
  6: 'Thứ 6',
  7: 'Thứ 7',
  8: 'Chủ nhật'
};
return dayNames[day_of_week] || '';
```

## Database Schema

Already exists in schema.sql:
```sql
CREATE TABLE schedules (
    schedule_id SERIAL PRIMARY KEY,
    section_id INT REFERENCES course_sections(section_id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week BETWEEN 2 AND 8),
    start_period INT CHECK (start_period BETWEEN 1 AND 15),
    end_period INT CHECK (end_period BETWEEN 1 AND 15),
    room VARCHAR(50)
);
```

## Implementation Notes

1. Conflict detection is important to prevent double-booking
2. Day names should be added for better UX
3. Student/Lecturer schedules require JOINs across multiple tables
4. Schedules are automatically deleted when course section is deleted (CASCADE)
