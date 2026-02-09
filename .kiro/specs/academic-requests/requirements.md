# Academic Requests Management - Requirements

## Overview
System for managing student academic requests including grade reviews (phúc khảo), course retention (bảo lưu), and retake requests. Includes student submission, admin review, and status tracking.

## User Stories

### US-1: Student Submits Academic Request
**As a** student  
**I want to** submit an academic request (grade review, retention, retake)  
**So that** I can request administrative actions on my academic records

**Acceptance Criteria:**
- Student can create a request with type, reason, and optional grade reference
- Request types: REVIEW (phúc khảo), RESERVE (bảo lưu), RETAKE (học lại)
- Reason is required (minimum length validation)
- Initial status is PENDING
- Student receives confirmation

### US-2: Student Views Own Requests
**As a** student  
**I want to** view my request history  
**So that** I can track the status of my submissions

**Acceptance Criteria:**
- Student can view all their requests
- Each request shows: type, reason, status, admin response, dates
- Requests ordered by creation date (newest first)
- Includes related grade/section information if applicable

### US-3: Admin Views Pending Requests
**As an** admin  
**I want to** view all pending requests  
**So that** I can review and process them

**Acceptance Criteria:**
- Admin can view all PENDING requests
- Includes student information
- Ordered by creation date (oldest first for FIFO processing)
- Can filter by request type

### US-4: Admin Approves Request
**As an** admin  
**I want to** approve a request  
**So that** I can grant the student's request

**Acceptance Criteria:**
- Admin can approve PENDING requests
- Must provide response message
- Status changes to APPROVED
- Updated timestamp recorded

### US-5: Admin Rejects Request
**As an** admin  
**I want to** reject a request  
**So that** I can deny requests with explanation

**Acceptance Criteria:**
- Admin can reject PENDING requests
- Must provide reason for rejection
- Status changes to REJECTED
- Updated timestamp recorded

## API Endpoints

### Student Endpoints
1. **POST /api/academic-requests** - Create new request
2. **GET /api/academic-requests/students/:studentId** - Get student's requests

### Admin Endpoints
3. **GET /api/admin/academic-requests/pending** - Get pending requests
4. **GET /api/admin/academic-requests** - Get all requests (with filters)
5. **POST /api/admin/academic-requests/:requestId/approve** - Approve request
6. **POST /api/admin/academic-requests/:requestId/reject** - Reject request

## Data Models

### Request Types (Enum)
- **REVIEW**: Phúc khảo điểm (Grade review)
- **RESERVE**: Bảo lưu (Course retention/leave of absence)
- **RETAKE**: Học lại (Retake course)

### Request Status (Enum)
- **PENDING**: Đang chờ xử lý
- **APPROVED**: Đã phê duyệt
- **REJECTED**: Đã từ chối

### Academic Request Object
```json
{
  "request_id": 1,
  "student_id": "212480201",
  "student_name": "Nguyễn Văn A",
  "request_type": "REVIEW",
  "reason": "Em xin phúc khảo điểm môn Lập trình Web...",
  "grade_id": 5,
  "section_code": "WEB-01",
  "subject_name": "Lập trình Web",
  "status": "PENDING",
  "admin_response": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## Business Rules

### Request Creation
1. Student must be enrolled in the system
2. Reason must be at least 20 characters
3. For REVIEW type, grade_id should be provided (optional but recommended)
4. Initial status is always PENDING

### Request Processing
1. Only PENDING requests can be approved/rejected
2. Admin response is required for approval/rejection
3. Once approved/rejected, status cannot be changed
4. Updated timestamp is automatically set

### Authorization
1. Students can only view/create their own requests
2. Only admins can approve/reject requests
3. Admins can view all requests

## Validation Rules

### Create Request
- `student_id`: Required, must exist in students table
- `request_type`: Required, must be REVIEW, RESERVE, or RETAKE
- `reason`: Required, minimum 20 characters
- `grade_id`: Optional, must exist if provided

### Approve/Reject Request
- `request_id`: Required, must exist
- `admin_response`: Required, minimum 10 characters
- Request must be in PENDING status

## Database Schema Enhancement

The existing `academic_requests` table needs a new column:

```sql
ALTER TABLE academic_requests 
ADD COLUMN grade_id INT REFERENCES grades(grade_id) ON DELETE SET NULL;
```

This allows linking grade review requests to specific grades.

## Error Handling

- 400: Invalid input (missing fields, validation errors)
- 403: Unauthorized (student accessing other's requests)
- 404: Request not found, student not found, grade not found
- 409: Conflict (trying to process non-PENDING request)
- 500: Database error

## Vietnamese Messages

### Request Types
- REVIEW: "Phúc khảo điểm"
- RESERVE: "Bảo lưu"
- RETAKE: "Học lại"

### Status
- PENDING: "Đang chờ xử lý"
- APPROVED: "Đã phê duyệt"
- REJECTED: "Đã từ chối"

### Success Messages
- Create: "Gửi yêu cầu thành công"
- Approve: "Phê duyệt yêu cầu thành công"
- Reject: "Từ chối yêu cầu thành công"
