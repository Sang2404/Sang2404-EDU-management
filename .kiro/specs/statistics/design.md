# Statistics & Reports API - Design

## Architecture

### Controllers
1. **statisticsController.js** - Admin statistics endpoints

### Routes
1. **statistics.js** - Statistics routes (admin only)

## API Design

### 1. System Overview
**GET /api/admin/statistics/overview**

Response (200):
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
  "lecturers": { "total": 20 },
  "subjects": { "total": 45 },
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

### 2. Student Statistics
**GET /api/admin/statistics/students**

Query Parameters:
- `faculty_id`: Filter by faculty (optional)
- `major_id`: Filter by major (optional)

Response (200):
```json
{
  "gpa_distribution": [
    { "range": "3.60-4.00", "label": "Xuất sắc", "count": 15, "percentage": 11.7 },
    { "range": "3.20-3.59", "label": "Giỏi", "count": 30, "percentage": 23.4 }
  ],
  "by_faculty": [
    { "faculty_id": "IET", "faculty_name": "Viện Điện tử", "count": 80 }
  ],
  "by_major": [
    { "major_id": "7480201", "major_name": "Công nghệ thông tin", "count": 60 }
  ],
  "top_students": [
    { "student_id": "212480201", "full_name": "Nguyễn Văn A", "gpa": 3.85, "class_name": "D21HT01" }
  ],
  "total_students": 128
}
```

### 3. Course Statistics
**GET /api/admin/statistics/courses**

Query Parameters:
- `semester`: Filter by semester (optional)
- `academic_year`: Filter by academic year (optional)
- `subject_id`: Filter by subject (optional)

Response (200):
```json
{
  "by_semester": [
    { "semester": "HK1", "academic_year": "2024-2025", "count": 25, "total_students": 500 }
  ],
  "enrollment": {
    "total_students": 1200,
    "total_sections": 60,
    "average_per_section": 20.0,
    "total_capacity": 2400,
    "capacity_utilization": 50.0
  },
  "by_subject": [
    { "subject_id": "TIN01", "subject_name": "Lập trình Web", "sections": 3, "students": 105, "avg_students": 35.0 }
  ],
  "most_enrolled": [
    { "section_id": 1, "section_code": "WEB-01", "subject_name": "Lập trình Web", "enrolled": 40, "capacity": 40, "utilization": 100.0 }
  ],
  "least_enrolled": [
    { "section_id": 5, "section_code": "DB-02", "subject_name": "Cơ sở dữ liệu", "enrolled": 5, "capacity": 40, "utilization": 12.5 }
  ]
}
```

### 4. Grade Statistics
**GET /api/admin/statistics/grades**

Query Parameters:
- `semester`: Filter by semester (optional)
- `academic_year`: Filter by academic year (optional)
- `subject_id`: Filter by subject (optional)

Response (200):
```json
{
  "distribution": [
    { "grade": "A", "label": "Xuất sắc", "count": 120, "percentage": 15.5 },
    { "grade": "B+", "label": "Giỏi", "count": 150, "percentage": 19.4 }
  ],
  "by_subject": [
    { "subject_id": "TIN01", "subject_name": "Lập trình Web", "average_grade": 7.5, "total_students": 105, "pass_rate": 92.4 }
  ],
  "by_semester": [
    { "semester": "HK1", "academic_year": "2024-2025", "average_grade": 7.2, "total_grades": 500, "pass_rate": 88.0 }
  ],
  "overall": {
    "average_grade": 7.3,
    "total_grades": 1500,
    "pass_rate": 85.5,
    "total_passed": 1283,
    "total_failed": 217
  }
}
```

### 5. Request Statistics
**GET /api/admin/statistics/requests**

Query Parameters:
- `start_date`: Filter from date (optional, format: YYYY-MM-DD)
- `end_date`: Filter to date (optional, format: YYYY-MM-DD)

Response (200):
```json
{
  "by_type": [
    { "type": "REVIEW", "type_display": "Phúc khảo điểm", "count": 25, "percentage": 62.5 },
    { "type": "RESERVE", "type_display": "Bảo lưu", "count": 10, "percentage": 25.0 }
  ],
  "by_status": [
    { "status": "PENDING", "status_display": "Đang chờ xử lý", "count": 8, "percentage": 20.0 },
    { "status": "APPROVED", "status_display": "Đã phê duyệt", "count": 20, "percentage": 50.0 }
  ],
  "trends": [
    { "month": "2024-01", "count": 5 },
    { "month": "2024-02", "count": 8 }
  ],
  "processing_time": {
    "average_hours": 84.5,
    "average_days": 3.5,
    "median_hours": 48.0,
    "median_days": 2.0,
    "processed_count": 32
  },
  "total_requests": 40
}
```

## Controller Functions

### statisticsController.js

```javascript
exports.getOverview = async (req, res) => {
  // 1. Count users (total, active, by role)
  // 2. Count students (total, by status)
  // 3. Count lecturers
  // 4. Count subjects
  // 5. Count sections (total, current semester)
  // 6. Get current semester info
  // 7. Return combined statistics
}

exports.getStudentStatistics = async (req, res) => {
  // 1. Get filters (faculty_id, major_id)
  // 2. Calculate GPA distribution with ranges
  // 3. Count students by faculty
  // 4. Count students by major
  // 5. Get top 10 students by GPA
  // 6. Return statistics
}

exports.getCourseStatistics = async (req, res) => {
  // 1. Get filters (semester, academic_year, subject_id)
  // 2. Count sections by semester
  // 3. Calculate enrollment statistics
  // 4. Group by subject
  // 5. Get most/least enrolled sections
  // 6. Return statistics
}

exports.getGradeStatistics = async (req, res) => {
  // 1. Get filters (semester, academic_year, subject_id)
  // 2. Calculate grade distribution (A-F)
  // 3. Calculate average by subject
  // 4. Calculate average by semester
  // 5. Calculate overall statistics
  // 6. Return statistics
}

exports.getRequestStatistics = async (req, res) => {
  // 1. Get date filters (start_date, end_date)
  // 2. Count by type
  // 3. Count by status
  // 4. Calculate trends by month
  // 5. Calculate processing time (avg, median)
  // 6. Return statistics
}
```

## SQL Queries

### System Overview

```sql
-- Users
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as active,
  COUNT(*) FILTER (WHERE is_active = false) as inactive,
  COUNT(*) FILTER (WHERE role = 'ADMIN') as admin_count,
  COUNT(*) FILTER (WHERE role = 'LECTURER') as lecturer_count,
  COUNT(*) FILTER (WHERE role = 'STUDENT') as student_count
FROM users;

-- Students by status
SELECT 
  status,
  COUNT(*) as count
FROM students
GROUP BY status;

-- Current semester sections
SELECT 
  semester,
  academic_year,
  COUNT(*) as count
FROM course_sections
GROUP BY semester, academic_year
ORDER BY academic_year DESC, semester DESC
LIMIT 1;
```

### Student Statistics

```sql
-- GPA distribution
SELECT 
  CASE 
    WHEN gpa_accumulated >= 3.6 THEN '3.60-4.00'
    WHEN gpa_accumulated >= 3.2 THEN '3.20-3.59'
    WHEN gpa_accumulated >= 2.5 THEN '2.50-3.19'
    WHEN gpa_accumulated >= 2.0 THEN '2.00-2.49'
    ELSE '0.00-1.99'
  END as range,
  COUNT(*) as count
FROM students
GROUP BY range
ORDER BY range DESC;

-- Top students
SELECT 
  s.student_id,
  u.full_name,
  s.gpa_accumulated as gpa,
  c.class_name
FROM students s
JOIN users u ON s.user_id = u.user_id
JOIN classes c ON s.class_id = c.class_id
ORDER BY s.gpa_accumulated DESC
LIMIT 10;
```

### Course Statistics

```sql
-- Enrollment statistics
SELECT 
  COUNT(DISTINCT cs.section_id) as total_sections,
  COUNT(DISTINCT ss.student_id) as total_students,
  ROUND(AVG(student_count), 2) as average_per_section,
  SUM(cs.max_capacity) as total_capacity,
  ROUND((COUNT(DISTINCT ss.student_id)::numeric / SUM(cs.max_capacity)) * 100, 1) as capacity_utilization
FROM course_sections cs
LEFT JOIN section_students ss ON cs.section_id = ss.section_id;

-- Most enrolled sections
SELECT 
  cs.section_id,
  cs.section_code,
  sub.subject_name,
  COUNT(ss.student_id) as enrolled,
  cs.max_capacity as capacity,
  ROUND((COUNT(ss.student_id)::numeric / cs.max_capacity) * 100, 1) as utilization
FROM course_sections cs
JOIN subjects sub ON cs.subject_id = sub.subject_id
LEFT JOIN section_students ss ON cs.section_id = ss.section_id
GROUP BY cs.section_id, sub.subject_name
ORDER BY enrolled DESC
LIMIT 10;
```

### Grade Statistics

```sql
-- Grade distribution
SELECT 
  grade_char as grade,
  COUNT(*) as count,
  ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM grades WHERE status = 'APPROVED')) * 100, 1) as percentage
FROM grades
WHERE status = 'APPROVED'
GROUP BY grade_char
ORDER BY 
  CASE grade_char
    WHEN 'A' THEN 1
    WHEN 'B+' THEN 2
    WHEN 'B' THEN 3
    WHEN 'C+' THEN 4
    WHEN 'C' THEN 5
    WHEN 'D+' THEN 6
    WHEN 'D' THEN 7
    WHEN 'F' THEN 8
  END;

-- Average by subject
SELECT 
  sub.subject_id,
  sub.subject_name,
  ROUND(AVG(g.total_10), 2) as average_grade,
  COUNT(g.grade_id) as total_students,
  ROUND((COUNT(*) FILTER (WHERE g.total_10 >= 4.0)::numeric / COUNT(*)) * 100, 1) as pass_rate
FROM grades g
JOIN course_sections cs ON g.section_id = cs.section_id
JOIN subjects sub ON cs.subject_id = sub.subject_id
WHERE g.status = 'APPROVED'
GROUP BY sub.subject_id, sub.subject_name
ORDER BY average_grade DESC;
```

### Request Statistics

```sql
-- By type
SELECT 
  request_type as type,
  COUNT(*) as count,
  ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM academic_requests)) * 100, 1) as percentage
FROM academic_requests
GROUP BY request_type;

-- Processing time
SELECT 
  ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600), 1) as average_hours,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as median_hours,
  COUNT(*) as processed_count
FROM academic_requests
WHERE status IN ('APPROVED', 'REJECTED');

-- Trends by month
SELECT 
  TO_CHAR(created_at, 'YYYY-MM') as month,
  COUNT(*) as count
FROM academic_requests
GROUP BY month
ORDER BY month;
```

## Helper Functions

### GPA Label Mapper
```javascript
const getGPALabel = (range) => {
  const labels = {
    '3.60-4.00': 'Xuất sắc',
    '3.20-3.59': 'Giỏi',
    '2.50-3.19': 'Khá',
    '2.00-2.49': 'Trung bình',
    '0.00-1.99': 'Yếu'
  };
  return labels[range] || '';
};
```

### Grade Label Mapper
```javascript
const getGradeLabel = (grade) => {
  const labels = {
    'A': 'Xuất sắc',
    'B+': 'Giỏi',
    'B': 'Giỏi',
    'C+': 'Khá',
    'C': 'Khá',
    'D+': 'Trung bình',
    'D': 'Trung bình',
    'F': 'Yếu'
  };
  return labels[grade] || '';
};
```

## Performance Optimization

### Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_students_gpa ON students(gpa_accumulated);
CREATE INDEX IF NOT EXISTS idx_grades_status ON grades(status);
CREATE INDEX IF NOT EXISTS idx_grades_section ON grades(section_id);
CREATE INDEX IF NOT EXISTS idx_sections_semester ON course_sections(semester, academic_year);
CREATE INDEX IF NOT EXISTS idx_requests_created ON academic_requests(created_at);
```

### Caching Strategy
- Cache overview statistics for 5 minutes
- Cache student statistics for 10 minutes
- Cache grade statistics for 15 minutes
- Invalidate cache on data changes

## Error Handling

- Return empty arrays/objects for no data
- Handle division by zero (capacity utilization)
- Handle NULL values in calculations
- Proper error messages for invalid filters

## Testing Strategy

### Test Cases
1. Get overview with data
2. Get overview with empty database
3. Get student statistics with filters
4. Get course statistics by semester
5. Get grade statistics by subject
6. Get request statistics with date range
7. Verify percentages sum to 100
8. Verify averages are correct
9. Test with NULL values
10. Test performance with large datasets
