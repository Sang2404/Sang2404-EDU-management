# Statistics & Reports API - Requirements

## Overview
Comprehensive statistics and reporting APIs for administrators to monitor system performance, student progress, and academic metrics. Provides data for dashboards, charts, and reports.

## User Stories

### US-1: Admin Views System Overview
**As an** admin  
**I want to** view overall system statistics  
**So that** I can monitor the system at a glance

**Acceptance Criteria:**
- Total counts: users, students, lecturers, subjects, sections
- Current semester statistics
- Active vs inactive users
- Single endpoint for dashboard overview

### US-2: Admin Views Student Statistics
**As an** admin  
**I want to** view student performance statistics  
**So that** I can identify trends and issues

**Acceptance Criteria:**
- GPA distribution (ranges: 3.6-4.0, 3.2-3.59, 2.5-3.19, 2.0-2.49, <2.0)
- Student status breakdown (studying, reserved, graduated, dropped)
- Students by faculty/major
- Top performing students

### US-3: Admin Views Course Statistics
**As an** admin  
**I want to** view course section statistics  
**So that** I can monitor enrollment and capacity

**Acceptance Criteria:**
- Sections by semester/academic year
- Enrollment statistics (total, average, capacity utilization)
- Sections by subject
- Most/least enrolled sections

### US-4: Admin Views Grade Statistics
**As an** admin  
**I want to** view grade distribution statistics  
**So that** I can analyze academic performance

**Acceptance Criteria:**
- Grade distribution by letter grade (A, B+, B, C+, C, D+, D, F)
- Grade distribution by subject
- Grade distribution by semester
- Average grades by subject

### US-5: Admin Views Request Statistics
**As an** admin  
**I want to** view academic request statistics  
**So that** I can monitor request volume and processing

**Acceptance Criteria:**
- Requests by type (REVIEW, RESERVE, RETAKE)
- Requests by status (PENDING, APPROVED, REJECTED)
- Request trends over time
- Average processing time

### US-6: Lecturer Views Own Statistics
**As a** lecturer  
**I want to** view my teaching statistics  
**So that** I can track my workload and student performance

**Acceptance Criteria:**
- Total sections taught
- Total students taught
- Average grade in my sections
- Grade distribution in my sections

## API Endpoints

### Admin Statistics
1. **GET /api/admin/statistics/overview** - System overview
2. **GET /api/admin/statistics/students** - Student statistics
3. **GET /api/admin/statistics/courses** - Course section statistics
4. **GET /api/admin/statistics/grades** - Grade statistics
5. **GET /api/admin/statistics/requests** - Academic request statistics

### Lecturer Statistics
6. **GET /api/lecturers/:lecturerId/statistics** - Already implemented in Task 18

## Data Models

### System Overview Response
```json
{
  "users": {
    "total": 150,
    "active": 145,
    "inactive": 5,
    "by_role": {
      "ADMIN": 2,
      "LECTURER": 20,
      "STUDENT": 128
    }
  },
  "students": {
    "total": 128,
    "by_status": {
      "STUDYING": 120,
      "RESERVED": 5,
      "GRADUATED": 2,
      "DROPPED": 1
    }
  },
  "lecturers": {
    "total": 20
  },
  "subjects": {
    "total": 45
  },
  "sections": {
    "total": 60,
    "current_semester": 25
  },
  "current_semester": {
    "semester": "HK1",
    "academic_year": "2024-2025"
  }
}
```

### Student Statistics Response
```json
{
  "gpa_distribution": [
    { "range": "3.60-4.00", "label": "Xuất sắc", "count": 15 },
    { "range": "3.20-3.59", "label": "Giỏi", "count": 30 },
    { "range": "2.50-3.19", "label": "Khá", "count": 45 },
    { "range": "2.00-2.49", "label": "Trung bình", "count": 25 },
    { "range": "0.00-1.99", "label": "Yếu", "count": 13 }
  ],
  "by_faculty": [
    { "faculty_id": "IET", "faculty_name": "Viện Điện tử", "count": 80 },
    { "faculty_id": "KTTC", "faculty_name": "Khoa Tài chính", "count": 48 }
  ],
  "by_major": [
    { "major_id": "7480201", "major_name": "Công nghệ thông tin", "count": 60 }
  ],
  "top_students": [
    { "student_id": "212480201", "full_name": "Nguyễn Văn A", "gpa": 3.85 }
  ]
}
```

### Course Statistics Response
```json
{
  "by_semester": [
    { "semester": "HK1", "academic_year": "2024-2025", "count": 25 }
  ],
  "enrollment": {
    "total_students": 1200,
    "total_sections": 60,
    "average_per_section": 20,
    "capacity_utilization": 75.5
  },
  "by_subject": [
    { "subject_id": "TIN01", "subject_name": "Lập trình Web", "sections": 3, "students": 105 }
  ],
  "most_enrolled": [
    { "section_code": "WEB-01", "subject_name": "Lập trình Web", "enrolled": 40, "capacity": 40 }
  ]
}
```

### Grade Statistics Response
```json
{
  "distribution": [
    { "grade": "A", "count": 120, "percentage": 15.5 },
    { "grade": "B+", "count": 150, "percentage": 19.4 },
    { "grade": "B", "count": 200, "percentage": 25.8 }
  ],
  "by_subject": [
    { "subject_name": "Lập trình Web", "average_grade": 7.5, "total_students": 105 }
  ],
  "by_semester": [
    { "semester": "HK1", "academic_year": "2024-2025", "average_grade": 7.2, "total_grades": 500 }
  ],
  "overall": {
    "average_grade": 7.3,
    "total_grades": 1500,
    "pass_rate": 85.5
  }
}
```

### Request Statistics Response
```json
{
  "by_type": [
    { "type": "REVIEW", "type_display": "Phúc khảo điểm", "count": 25 },
    { "type": "RESERVE", "type_display": "Bảo lưu", "count": 10 },
    { "type": "RETAKE", "type_display": "Học lại", "count": 5 }
  ],
  "by_status": [
    { "status": "PENDING", "status_display": "Đang chờ xử lý", "count": 8 },
    { "status": "APPROVED", "status_display": "Đã phê duyệt", "count": 20 },
    { "status": "REJECTED", "status_display": "Đã từ chối", "count": 12 }
  ],
  "trends": [
    { "month": "2024-01", "count": 5 },
    { "month": "2024-02", "count": 8 }
  ],
  "processing_time": {
    "average_days": 3.5,
    "median_days": 2
  }
}
```

## Business Rules

### System Overview
1. Count all entities in database
2. Filter active users (is_active = true)
3. Determine current semester (most recent academic_year + semester)
4. Count sections for current semester only

### Student Statistics
1. GPA ranges based on Vietnamese education system
2. Include all students regardless of status
3. Top students limited to top 10
4. Faculty/major counts include all students

### Course Statistics
1. Capacity utilization = (enrolled / capacity) * 100
2. Only count APPROVED grades for enrollment
3. Include all semesters in history
4. Most enrolled limited to top 10

### Grade Statistics
1. Only count APPROVED grades
2. Pass rate = grades >= 4.0 (D or better)
3. Distribution by letter grade (A-F)
4. Average calculated from total_10

### Request Statistics
1. Include all requests regardless of status
2. Trends grouped by month
3. Processing time = updated_at - created_at (for processed requests)
4. Average and median processing time

## Query Parameters

### Optional Filters
- `semester`: Filter by semester (e.g., "HK1")
- `academic_year`: Filter by academic year (e.g., "2024-2025")
- `faculty_id`: Filter by faculty
- `major_id`: Filter by major
- `subject_id`: Filter by subject

## Validation Rules

1. All statistics endpoints return data even if empty
2. Percentages rounded to 1 decimal place
3. Averages rounded to 2 decimal places
4. Dates in ISO format
5. Counts always non-negative integers

## Error Handling

- 500: Database error
- Empty arrays/objects: No data available (not an error)

## Performance Considerations

1. Use aggregate functions (COUNT, AVG, SUM)
2. Add indexes on frequently queried columns
3. Consider caching for expensive queries
4. Limit result sets (top 10, etc.)
5. Use efficient JOINs

## Vietnamese Labels

### GPA Ranges
- 3.60-4.00: "Xuất sắc" (Excellent)
- 3.20-3.59: "Giỏi" (Good)
- 2.50-3.19: "Khá" (Fair)
- 2.00-2.49: "Trung bình" (Average)
- 0.00-1.99: "Yếu" (Weak)

### Grade Letters
- A: "Xuất sắc"
- B+, B: "Giỏi"
- C+, C: "Khá"
- D+, D: "Trung bình"
- F: "Yếu"
