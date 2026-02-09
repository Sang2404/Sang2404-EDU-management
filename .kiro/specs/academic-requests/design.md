# Academic Requests Management - Design

## Architecture

### Controllers
1. **requestsController.js** - Student-facing endpoints
2. **adminController.js** - Admin endpoints (extend existing)

### Routes
1. **requests.js** - Student routes
2. **admin.js** - Admin routes (extend existing)

## Database Migration

### Add grade_id Column
```sql
-- File: database/migrations/add_grade_id_to_requests.sql
ALTER TABLE academic_requests 
ADD COLUMN grade_id INT REFERENCES grades(grade_id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_academic_requests_student ON academic_requests(student_id);
CREATE INDEX idx_academic_requests_status ON academic_requests(status);
CREATE INDEX idx_academic_requests_grade ON academic_requests(grade_id);
```

## API Design

### 1. Create Academic Request
**POST /api/academic-requests**

Request Body:
```json
{
  "student_id": "212480201",
  "request_type": "REVIEW",
  "reason": "Em xin phúc khảo điểm môn Lập trình Web vì...",
  "grade_id": 5
}
```

Response (201):
```json
{
  "message": "Gửi yêu cầu thành công",
  "data": {
    "request_id": 1,
    "student_id": "212480201",
    "request_type": "REVIEW",
    "reason": "Em xin phúc khảo điểm...",
    "grade_id": 5,
    "status": "PENDING",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Get Student Requests
**GET /api/academic-requests/students/:studentId**

Response (200):
```json
[
  {
    "request_id": 1,
    "request_type": "REVIEW",
    "request_type_display": "Phúc khảo điểm",
    "reason": "Em xin phúc khảo...",
    "status": "PENDING",
    "status_display": "Đang chờ xử lý",
    "admin_response": null,
    "grade_id": 5,
    "section_code": "WEB-01",
    "subject_name": "Lập trình Web",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### 3. Get Pending Requests (Admin)
**GET /api/admin/academic-requests/pending**

Query Parameters:
- `type`: Filter by request type (optional)

Response (200):
```json
[
  {
    "request_id": 1,
    "student_id": "212480201",
    "student_name": "Nguyễn Văn A",
    "student_email": "student@gmail.com",
    "request_type": "REVIEW",
    "request_type_display": "Phúc khảo điểm",
    "reason": "Em xin phúc khảo...",
    "grade_id": 5,
    "section_code": "WEB-01",
    "subject_name": "Lập trình Web",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### 4. Get All Requests (Admin)
**GET /api/admin/academic-requests**

Query Parameters:
- `status`: Filter by status (optional)
- `type`: Filter by request type (optional)
- `student_id`: Filter by student (optional)

Response: Same as pending requests but includes all statuses

### 5. Approve Request (Admin)
**POST /api/admin/academic-requests/:requestId/approve**

Request Body:
```json
{
  "admin_response": "Yêu cầu của bạn đã được phê duyệt. Điểm sẽ được xem xét lại."
}
```

Response (200):
```json
{
  "message": "Phê duyệt yêu cầu thành công",
  "data": {
    "request_id": 1,
    "status": "APPROVED",
    "admin_response": "Yêu cầu của bạn đã được phê duyệt...",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

### 6. Reject Request (Admin)
**POST /api/admin/academic-requests/:requestId/reject**

Request Body:
```json
{
  "admin_response": "Yêu cầu của bạn không được chấp nhận vì không đủ căn cứ."
}
```

Response (200):
```json
{
  "message": "Từ chối yêu cầu thành công",
  "data": {
    "request_id": 1,
    "status": "REJECTED",
    "admin_response": "Yêu cầu của bạn không được chấp nhận...",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

## Controller Functions

### requestsController.js
```javascript
exports.createRequest = async (req, res) => {
  // 1. Validate input
  // 2. Check student exists
  // 3. Check grade exists (if provided)
  // 4. Insert request
  // 5. Return created request
}

exports.getStudentRequests = async (req, res) => {
  // 1. Get studentId from params
  // 2. Query requests with LEFT JOIN to grades/sections/subjects
  // 3. Add display names for type and status
  // 4. Order by created_at DESC
  // 5. Return requests
}
```

### adminController.js (extend)
```javascript
exports.getPendingRequests = async (req, res) => {
  // 1. Get optional type filter
  // 2. Query PENDING requests with student info
  // 3. LEFT JOIN to grades/sections/subjects
  // 4. Add display names
  // 5. Order by created_at ASC (FIFO)
  // 6. Return requests
}

exports.getAllRequests = async (req, res) => {
  // 1. Get filters (status, type, student_id)
  // 2. Build dynamic WHERE clause
  // 3. Query with student info
  // 4. LEFT JOIN to grades/sections/subjects
  // 5. Add display names
  // 6. Order by created_at DESC
  // 7. Return requests
}

exports.approveRequest = async (req, res) => {
  // 1. Get requestId and admin_response
  // 2. Validate admin_response (min 10 chars)
  // 3. Check request exists and is PENDING
  // 4. Update status to APPROVED
  // 5. Update admin_response and updated_at
  // 6. Return updated request
}

exports.rejectRequest = async (req, res) => {
  // 1. Get requestId and admin_response
  // 2. Validate admin_response (min 10 chars)
  // 3. Check request exists and is PENDING
  // 4. Update status to REJECTED
  // 5. Update admin_response and updated_at
  // 6. Return updated request
}
```

## Helper Functions

### Display Name Mappers
```javascript
const getRequestTypeDisplay = (type) => {
  const types = {
    'REVIEW': 'Phúc khảo điểm',
    'RESERVE': 'Bảo lưu',
    'RETAKE': 'Học lại'
  };
  return types[type] || type;
};

const getStatusDisplay = (status) => {
  const statuses = {
    'PENDING': 'Đang chờ xử lý',
    'APPROVED': 'Đã phê duyệt',
    'REJECTED': 'Đã từ chối'
  };
  return statuses[status] || status;
};
```

## SQL Queries

### Create Request
```sql
INSERT INTO academic_requests (
  student_id, request_type, reason, grade_id, status
) VALUES ($1, $2, $3, $4, 'PENDING')
RETURNING *
```

### Get Student Requests
```sql
SELECT 
  ar.request_id,
  ar.request_type,
  ar.reason,
  ar.status,
  ar.admin_response,
  ar.grade_id,
  ar.created_at,
  ar.updated_at,
  cs.section_code,
  s.subject_name
FROM academic_requests ar
LEFT JOIN grades g ON ar.grade_id = g.grade_id
LEFT JOIN course_sections cs ON g.section_id = cs.section_id
LEFT JOIN subjects s ON cs.subject_id = s.subject_id
WHERE ar.student_id = $1
ORDER BY ar.created_at DESC
```

### Get Pending Requests (Admin)
```sql
SELECT 
  ar.request_id,
  ar.student_id,
  u.full_name as student_name,
  u.email as student_email,
  ar.request_type,
  ar.reason,
  ar.grade_id,
  ar.created_at,
  cs.section_code,
  s.subject_name
FROM academic_requests ar
JOIN students st ON ar.student_id = st.student_id
JOIN users u ON st.user_id = u.user_id
LEFT JOIN grades g ON ar.grade_id = g.grade_id
LEFT JOIN course_sections cs ON g.section_id = cs.section_id
LEFT JOIN subjects s ON cs.subject_id = s.subject_id
WHERE ar.status = 'PENDING'
ORDER BY ar.created_at ASC
```

### Approve/Reject Request
```sql
UPDATE academic_requests
SET status = $1, admin_response = $2, updated_at = CURRENT_TIMESTAMP
WHERE request_id = $3 AND status = 'PENDING'
RETURNING *
```

## Validation Logic

### Create Request
1. Required fields: student_id, request_type, reason
2. request_type must be: REVIEW, RESERVE, or RETAKE
3. reason minimum length: 20 characters
4. student_id must exist in students table
5. grade_id must exist in grades table (if provided)

### Approve/Reject Request
1. Required fields: admin_response
2. admin_response minimum length: 10 characters
3. request_id must exist
4. Request status must be PENDING
5. Return 409 if status is not PENDING

## Error Messages

### Vietnamese Error Messages
```javascript
const errorMessages = {
  STUDENT_NOT_FOUND: 'Không tìm thấy sinh viên',
  GRADE_NOT_FOUND: 'Không tìm thấy điểm',
  REQUEST_NOT_FOUND: 'Không tìm thấy yêu cầu',
  INVALID_TYPE: 'Loại yêu cầu không hợp lệ',
  REASON_TOO_SHORT: 'Lý do phải có ít nhất 20 ký tự',
  RESPONSE_TOO_SHORT: 'Phản hồi phải có ít nhất 10 ký tự',
  NOT_PENDING: 'Chỉ có thể xử lý yêu cầu đang chờ',
  REQUIRED_FIELD: 'Trường bắt buộc'
};
```

## Testing Strategy

### Test Cases
1. Create request with all fields
2. Create request without grade_id
3. Create request with invalid student_id (404)
4. Create request with invalid grade_id (404)
5. Create request with short reason (400)
6. Get student requests (empty and with data)
7. Get pending requests (admin)
8. Get all requests with filters (admin)
9. Approve request (success)
10. Reject request (success)
11. Try to approve already processed request (409)
12. Try to approve with short response (400)

## Security Considerations

1. **Authorization**: Add middleware to verify:
   - Students can only access their own requests
   - Only admins can approve/reject
   
2. **Input Sanitization**: Trim and sanitize text inputs

3. **SQL Injection**: Use parameterized queries

4. **Rate Limiting**: Consider limiting request creation per student

## Future Enhancements

1. Email notifications when request is processed
2. File attachments for supporting documents
3. Request history/audit log
4. Bulk approval for admins
5. Request categories/subcategories
6. Deadline tracking for processing
