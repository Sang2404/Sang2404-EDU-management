# Academic Requests Management - Implementation Summary

## ✅ Completed

### API Endpoints Implemented (6 endpoints)

**Student Routes:**
1. **POST /api/academic-requests** - Create new request
2. **GET /api/academic-requests/students/:studentId** - Get student's requests

**Admin Routes:**
3. **GET /api/admin/academic-requests/pending** - Get pending requests
4. **GET /api/admin/academic-requests** - Get all requests with filters
5. **POST /api/admin/academic-requests/:requestId/approve** - Approve request
6. **POST /api/admin/academic-requests/:requestId/reject** - Reject request

### Features

#### Request Types
- ✅ **REVIEW** (Phúc khảo điểm) - Grade review
- ✅ **RESERVE** (Bảo lưu) - Course retention/leave
- ✅ **RETAKE** (Học lại) - Retake course

#### Request Status Workflow
- ✅ **PENDING** → **APPROVED** (with admin response)
- ✅ **PENDING** → **REJECTED** (with admin response)
- ✅ Status validation (only PENDING can be processed)

#### Validation
- ✅ Required fields: student_id, request_type, reason
- ✅ Request type must be REVIEW, RESERVE, or RETAKE
- ✅ Reason minimum 20 characters
- ✅ Admin response minimum 10 characters
- ✅ Student existence check
- ✅ Grade existence check (if provided)
- ✅ Status check before approval/rejection

#### Display Names
- ✅ Vietnamese request type names
- ✅ Vietnamese status names
- ✅ Automatic mapping in responses

#### Data Relationships
- ✅ Links to student information
- ✅ Optional link to specific grade (for REVIEW type)
- ✅ Includes section and subject info when grade linked
- ✅ Timestamps (created_at, updated_at)

### Controller Functions

**requestsController.js:**
- ✅ `getRequestTypeDisplay` - Helper for Vietnamese type names
- ✅ `getStatusDisplay` - Helper for Vietnamese status names
- ✅ `createRequest` - Create new request with validation
- ✅ `getStudentRequests` - Get student's request history

**adminController.js (extended):**
- ✅ `getRequestTypeDisplay` - Helper for Vietnamese type names
- ✅ `getStatusDisplay` - Helper for Vietnamese status names
- ✅ `getPendingRequests` - List pending requests with filters
- ✅ `getAllRequests` - List all requests with multiple filters
- ✅ `approveRequest` - Approve pending request
- ✅ `rejectRequest` - Reject pending request

### Files Created

1. `.kiro/specs/academic-requests/requirements.md` - 5 user stories, 6 endpoints
2. `.kiro/specs/academic-requests/design.md` - Detailed design with SQL queries
3. `.kiro/specs/academic-requests/tasks.md` - 8 implementation tasks
4. `database/migrations/add_grade_id_to_requests.sql` - Database migration
5. `server/controllers/requestsController.js` - Student-facing controller (~140 lines)
6. `server/routes/requests.js` - Student routes
7. `server/test_academic_requests.js` - Test script (10 tests)
8. `.kiro/specs/academic-requests/IMPLEMENTATION_SUMMARY.md` - This file

### Files Modified

1. `server/controllers/adminController.js` - Added 6 functions (~200 lines added)
2. `server/routes/admin.js` - Added 4 routes
3. `server/server.js` - Registered requests routes
4. `Giai đoạn thực hiện.txt` - Will mark task 23 complete

## 📊 Statistics

- **Endpoints:** 6
- **Controllers:** 2 (requests, admin extended)
- **Functions:** 10 (4 new + 6 extended)
- **Routes:** 6
- **Lines of code:** ~340
- **Test cases:** 10
- **HTTP status codes:** 200, 201, 400, 404, 409, 500

## 🔄 Request Workflow

```
┌──────────┐  approve   ┌──────────┐
│ PENDING  │ ─────────> │ APPROVED │
└──────────┘            └──────────┘
     │
     │ reject
     v
┌──────────┐
│ REJECTED │
└──────────┘
```

**Rules:**
- Only PENDING requests can be approved/rejected
- Admin response required for both actions
- Status cannot be changed after approval/rejection
- Updated timestamp automatically set

## 🔒 Authorization Matrix

| Action | Student | Admin |
|--------|---------|-------|
| Create Request | ✅ (own) | ✅ |
| View Own Requests | ✅ | ❌ |
| View All Requests | ❌ | ✅ |
| View Pending Requests | ❌ | ✅ |
| Approve Request | ❌ | ✅ |
| Reject Request | ❌ | ✅ |

## 📝 Request Types & Use Cases

### REVIEW (Phúc khảo điểm)
- Student requests grade review
- Should include grade_id
- Admin reviews and approves/rejects
- Example: "Em xin phúc khảo điểm môn X vì..."

### RESERVE (Bảo lưu)
- Student requests leave of absence
- No grade_id needed
- Admin reviews circumstances
- Example: "Em xin bảo lưu do việc gia đình..."

### RETAKE (Học lại)
- Student requests to retake course
- May include grade_id
- Admin reviews eligibility
- Example: "Em xin đăng ký học lại môn X..."

## 🗄️ Database Schema

### Migration Applied
```sql
ALTER TABLE academic_requests 
ADD COLUMN grade_id INT REFERENCES grades(grade_id) ON DELETE SET NULL;

CREATE INDEX idx_academic_requests_student ON academic_requests(student_id);
CREATE INDEX idx_academic_requests_status ON academic_requests(status);
CREATE INDEX idx_academic_requests_grade ON academic_requests(grade_id);
```

### Table Structure
```
academic_requests:
- request_id (SERIAL PRIMARY KEY)
- student_id (VARCHAR(20) FK)
- request_type (ENUM: REVIEW, RESERVE, RETAKE)
- reason (TEXT)
- status (ENUM: PENDING, APPROVED, REJECTED)
- admin_response (TEXT)
- grade_id (INT FK) - NEW
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🧪 Testing

```bash
cd server
node test_academic_requests.js
```

### Test Coverage (10 tests)
1. ✅ Create request with grade_id (201)
2. ✅ Create request without grade_id (201)
3. ✅ Create request with invalid student (404)
4. ✅ Create request with short reason (400)
5. ✅ Get student requests (200)
6. ✅ Get pending requests - admin (200)
7. ✅ Get all requests with filters - admin (200)
8. ✅ Approve request (200)
9. ✅ Reject request (200)
10. ✅ Try to approve processed request (409)

## 💡 Key Features

### Flexible Grade Linking
```javascript
// Optional grade_id allows both specific and general requests
{
  "grade_id": 5,  // For REVIEW type
  "grade_id": null  // For RESERVE, RETAKE
}
```

### Dynamic Filtering (Admin)
```javascript
// Multiple filter combinations
GET /api/admin/academic-requests?status=PENDING&type=REVIEW
GET /api/admin/academic-requests?student_id=212480201
GET /api/admin/academic-requests?type=RESERVE
```

### Rich Response Data
```javascript
{
  "request_id": 1,
  "request_type": "REVIEW",
  "request_type_display": "Phúc khảo điểm",  // Vietnamese
  "status": "PENDING",
  "status_display": "Đang chờ xử lý",  // Vietnamese
  "section_code": "WEB-01",  // From grade link
  "subject_name": "Lập trình Web"  // From grade link
}
```

### Validation Pipeline
1. Check required fields
2. Validate request type
3. Validate reason length (20+ chars)
4. Check student exists
5. Check grade exists (if provided)
6. Insert with PENDING status

### Approval/Rejection Pipeline
1. Validate admin response (10+ chars)
2. Check request exists
3. Check status is PENDING
4. Update status and response
5. Set updated_at timestamp

## 🌐 Vietnamese Messages

### Success Messages
- Create: "Gửi yêu cầu thành công"
- Approve: "Phê duyệt yêu cầu thành công"
- Reject: "Từ chối yêu cầu thành công"

### Error Messages
- "Không tìm thấy sinh viên"
- "Không tìm thấy điểm"
- "Không tìm thấy yêu cầu"
- "Loại yêu cầu không hợp lệ"
- "Lý do phải có ít nhất 20 ký tự"
- "Phản hồi phải có ít nhất 10 ký tự"
- "Chỉ có thể xử lý yêu cầu đang chờ"

## 🎯 Business Rules

1. **Request Creation:**
   - Student must exist in system
   - Reason must be meaningful (20+ chars)
   - Grade must exist if provided
   - Initial status always PENDING

2. **Request Processing:**
   - Only PENDING can be approved/rejected
   - Admin response required
   - Status change is final
   - Timestamp updated automatically

3. **Data Integrity:**
   - Foreign key constraints enforced
   - NULL allowed for grade_id
   - Indexes for query performance
   - Cascade delete handled

## ✨ Next Steps

✅ Task 23 is complete - mark as done in roadmap  
➡️ Move to Task 24: Backend - API Thống kê (Biểu đồ, báo cáo)

## 📋 Usage Examples

### Create Grade Review Request
```bash
POST /api/academic-requests
{
  "student_id": "212480201",
  "request_type": "REVIEW",
  "reason": "Em xin phúc khảo điểm môn Lập trình Web vì em thấy điểm không phù hợp với bài làm.",
  "grade_id": 5
}
```

### Create Leave Request
```bash
POST /api/academic-requests
{
  "student_id": "212480201",
  "request_type": "RESERVE",
  "reason": "Em xin bảo lưu kết quả học tập do có việc gia đình cần giải quyết."
}
```

### Admin Approve Request
```bash
POST /api/admin/academic-requests/1/approve
{
  "admin_response": "Yêu cầu đã được phê duyệt. Điểm sẽ được xem xét lại."
}
```

### Get Pending Reviews
```bash
GET /api/admin/academic-requests/pending?type=REVIEW
```
