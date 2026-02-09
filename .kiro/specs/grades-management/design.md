# Design Document: Grades Management

## Overview

The Grades Management feature provides a complete workflow for grade entry, submission, and approval. It includes automatic grade calculation and strict authorization controls.

## API Endpoints

### 1. Enter/Update Grade
```
POST /api/grades
PUT /api/grades/:gradeId
```

**Request Body:**
```json
{
  "section_id": 1,
  "student_id": "212480201",
  "attendance": 8.5,
  "midterm": 7.0,
  "final": 8.0
}
```

**Success Response (200/201):**
```json
{
  "message": "Nhập điểm thành công",
  "data": {
    "grade_id": 1,
    "section_id": 1,
    "student_id": "212480201",
    "attendance": 8.5,
    "midterm": 7.0,
    "final": 8.0,
    "total_10": 7.75,
    "total_4": 3.0,
    "grade_char": "B",
    "status": "DRAFT"
  }
}
```

### 2. Get Grades for Section
```
GET /api/lecturers/:lecturerId/sections/:sectionId/grades
```

**Success Response (200):**
```json
[
  {
    "grade_id": 1,
    "student_id": "212480201",
    "full_name": "Trần Thị Em",
    "attendance": 8.5,
    "midterm": 7.0,
    "final": 8.0,
    "total_10": 7.75,
    "total_4": 3.0,
    "grade_char": "B",
    "status": "DRAFT"
  }
]
```

### 3. Submit Grades for Approval
```
POST /api/lecturers/:lecturerId/sections/:sectionId/grades/submit
```

**Success Response (200):**
```json
{
  "message": "Gửi bảng điểm để duyệt thành công",
  "data": {
    "section_id": 1,
    "total_students": 45,
    "grades_submitted": 45,
    "status": "SUBMITTED"
  }
}
```

### 4. Approve Grades (Admin)
```
POST /api/admin/sections/:sectionId/grades/approve
```

**Success Response (200):**
```json
{
  "message": "Phê duyệt bảng điểm thành công",
  "data": {
    "section_id": 1,
    "grades_approved": 45,
    "status": "APPROVED"
  }
}
```

### 5. Reject Grades (Admin)
```
POST /api/admin/sections/:sectionId/grades/reject
```

**Request Body:**
```json
{
  "reason": "Cần kiểm tra lại điểm cuối kỳ"
}
```

### 6. Get Student's Grades
```
GET /api/students/:studentId/grades
```

**Success Response (200):**
```json
[
  {
    "grade_id": 1,
    "section_code": "TIN01-HK1-2024",
    "subject_name": "Lập trình cơ bản",
    "credits": 3,
    "lecturer_name": "Thầy Nguyễn Văn A",
    "semester": "HK1",
    "academic_year": "2024-2025",
    "attendance": 8.5,
    "midterm": 7.0,
    "final": 8.0,
    "total_10": 7.75,
    "total_4": 3.0,
    "grade_char": "B"
  }
]
```

## Grade Calculation Logic

### Formula
```javascript
total_10 = (attendance * 0.1) + (midterm * 0.3) + (final * 0.6)
```

### Grade Scale Conversion

```javascript
function calculateGrades(attendance, midterm, final) {
  // Calculate total_10
  const total_10 = Math.round(
    (attendance * 0.1 + midterm * 0.3 + final * 0.6) * 100
  ) / 100;
  
  // Calculate total_4 and grade_char
  let total_4, grade_char;
  
  if (total_10 >= 8.5) {
    total_4 = 4.0;
    grade_char = 'A';
  } else if (total_10 >= 8.0) {
    total_4 = 3.5;
    grade_char = 'B+';
  } else if (total_10 >= 7.0) {
    total_4 = 3.0;
    grade_char = 'B';
  } else if (total_10 >= 6.5) {
    total_4 = 2.5;
    grade_char = 'C+';
  } else if (total_10 >= 5.5) {
    total_4 = 2.0;
    grade_char = 'C';
  } else if (total_10 >= 5.0) {
    total_4 = 1.5;
    grade_char = 'D+';
  } else if (total_10 >= 4.0) {
    total_4 = 1.0;
    grade_char = 'D';
  } else {
    total_4 = 0.0;
    grade_char = 'F';
  }
  
  return { total_10, total_4, grade_char };
}
```

## Workflow State Machine

```
DRAFT ──────────> SUBMITTED ──────────> APPROVED
  ^                   |
  |                   |
  └───────────────────┘
       (reject)
```

**State Transitions:**
- DRAFT → SUBMITTED: Lecturer submits grades
- SUBMITTED → APPROVED: Admin approves grades
- SUBMITTED → DRAFT: Admin rejects grades
- APPROVED: Final state (no further changes)

## Authorization Rules

| Action | Who Can Do It | Conditions |
|--------|---------------|------------|
| Enter/Update Grade | Lecturer | Must be assigned to section, Grade status = DRAFT |
| View Section Grades | Lecturer | Must be assigned to section |
| Submit Grades | Lecturer | Must be assigned to section, All grades complete |
| Approve Grades | Admin | Grade status = SUBMITTED |
| Reject Grades | Admin | Grade status = SUBMITTED |
| View Own Grades | Student | Grade status = APPROVED |

## Database Queries

### Insert/Update Grade with Calculation

```sql
INSERT INTO grades (
  section_id, student_id, attendance, midterm, final,
  total_10, total_4, grade_char, status
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DRAFT')
ON CONFLICT (section_id, student_id)
DO UPDATE SET
  attendance = EXCLUDED.attendance,
  midterm = EXCLUDED.midterm,
  final = EXCLUDED.final,
  total_10 = EXCLUDED.total_10,
  total_4 = EXCLUDED.total_4,
  grade_char = EXCLUDED.grade_char,
  status = 'DRAFT'
RETURNING *
```

### Submit Grades (Bulk Update)

```sql
UPDATE grades
SET status = 'SUBMITTED'
WHERE section_id = $1 AND status = 'DRAFT'
```

### Approve Grades (Bulk Update)

```sql
UPDATE grades
SET status = 'APPROVED'
WHERE section_id = $1 AND status = 'SUBMITTED'
```

## Validation Rules

### Grade Entry
1. Lecturer must be assigned to section
2. Student must be enrolled in section
3. Grade values must be 0-10
4. Grade status must be DRAFT
5. All three components required for submission

### Grade Submission
1. All enrolled students must have grades
2. All grade components must be complete
3. Current status must be DRAFT

### Grade Approval
1. Current status must be SUBMITTED
2. Only admin can approve

## Error Handling

| Error | HTTP Code | Message |
|-------|-----------|---------|
| Not authorized | 403 | "You are not assigned to this course section" |
| Grade locked | 403 | "Cannot modify grades with status: SUBMITTED/APPROVED" |
| Incomplete grades | 400 | "All students must have complete grades before submission" |
| Invalid status | 400 | "Grades must be in SUBMITTED status to approve" |
| Invalid grade value | 400 | "Grade values must be between 0 and 10" |
