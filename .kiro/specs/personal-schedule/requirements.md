# Personal Schedule API - Requirements

## Overview
API endpoints to retrieve personal schedules for students and lecturers based on their enrolled/assigned course sections.

## User Stories

### US-1: Student Views Personal Schedule
**As a** student  
**I want to** view my personal class schedule  
**So that** I know when and where my classes are

**Acceptance Criteria:**
- Student can retrieve their schedule by student ID
- Schedule shows all enrolled course sections
- Each entry includes: subject name, lecturer name, day, time periods, room, semester, academic year
- Schedule is ordered by day and time
- Day names are in Vietnamese

### US-2: Lecturer Views Teaching Schedule
**As a** lecturer  
**I want to** view my teaching schedule  
**So that** I know when and where I need to teach

**Acceptance Criteria:**
- Lecturer can retrieve their schedule by lecturer ID
- Schedule shows all assigned course sections
- Each entry includes: subject name, day, time periods, room, semester, academic year, enrollment count
- Schedule is ordered by day and time
- Day names are in Vietnamese

## API Endpoints

### 1. Get Student Schedule
- **Endpoint:** GET /api/schedules/student/:studentId
- **Auth:** Required (student or admin)
- **Response:** Array of schedule entries

### 2. Get Lecturer Schedule
- **Endpoint:** GET /api/schedules/lecturer/:lecturerId
- **Auth:** Required (lecturer or admin)
- **Response:** Array of schedule entries

## Data Requirements

### Student Schedule Response
```json
{
  "schedule_id": 1,
  "section_id": 1,
  "subject_id": 1,
  "subject_name": "Lập trình Web",
  "lecturer_name": "Nguyễn Văn A",
  "day_of_week": 2,
  "day_name": "Thứ 2",
  "start_period": 1,
  "end_period": 3,
  "room": "A101",
  "semester": 1,
  "academic_year": "2024-2025",
  "section_code": "WEB-01"
}
```

### Lecturer Schedule Response
```json
{
  "schedule_id": 1,
  "section_id": 1,
  "subject_id": 1,
  "subject_name": "Lập trình Web",
  "day_of_week": 2,
  "day_name": "Thứ 2",
  "start_period": 1,
  "end_period": 3,
  "room": "A101",
  "semester": 1,
  "academic_year": "2024-2025",
  "section_code": "WEB-01",
  "max_capacity": 40,
  "enrolled_count": 35
}
```

## Business Rules

1. **Student Schedule:**
   - Only shows schedules for sections the student is enrolled in
   - Ordered by day of week, then start period
   - Includes lecturer information

2. **Lecturer Schedule:**
   - Only shows schedules for sections the lecturer is assigned to
   - Includes enrollment statistics (capacity vs enrolled)
   - Ordered by day of week, then start period

3. **Day Mapping:**
   - 2: Thứ 2 (Monday)
   - 3: Thứ 3 (Tuesday)
   - 4: Thứ 4 (Wednesday)
   - 5: Thứ 5 (Thursday)
   - 6: Thứ 6 (Friday)
   - 7: Thứ 7 (Saturday)
   - 8: Chủ nhật (Sunday)

## Validation Rules

1. Student ID must exist in students table
2. Lecturer ID must exist in lecturers table
3. Return empty array if no schedules found

## Error Handling

- 500: Database error
- Empty array: No schedules found (not an error)
