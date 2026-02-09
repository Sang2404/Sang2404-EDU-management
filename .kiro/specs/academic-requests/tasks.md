# Academic Requests Management - Implementation Tasks

## Task 1: Database Migration ✅
- [ ] Create migration file `add_grade_id_to_requests.sql`
- [ ] Add `grade_id` column to `academic_requests` table
- [ ] Add indexes for performance
- [ ] Test migration

## Task 2: Create Requests Controller ✅
- [ ] Create `server/controllers/requestsController.js`
- [ ] Implement helper functions:
  - [ ] `getRequestTypeDisplay(type)`
  - [ ] `getStatusDisplay(status)`
- [ ] Implement `createRequest` function:
  - [ ] Validate input fields
  - [ ] Check student exists
  - [ ] Check grade exists (if provided)
  - [ ] Insert request with PENDING status
  - [ ] Return created request
- [ ] Implement `getStudentRequests` function:
  - [ ] Query requests with LEFT JOIN to grades/sections/subjects
  - [ ] Add display names
  - [ ] Order by created_at DESC
  - [ ] Return requests array

## Task 3: Extend Admin Controller ✅
- [ ] Open `server/controllers/adminController.js`
- [ ] Implement `getPendingRequests` function:
  - [ ] Get optional type filter
  - [ ] Query PENDING requests with student info
  - [ ] LEFT JOIN to grades/sections/subjects
  - [ ] Add display names
  - [ ] Order by created_at ASC (FIFO)
  - [ ] Return requests
- [ ] Implement `getAllRequests` function:
  - [ ] Get filters (status, type, student_id)
  - [ ] Build dynamic WHERE clause
  - [ ] Query with student info
  - [ ] Add display names
  - [ ] Return requests
- [ ] Implement `approveRequest` function:
  - [ ] Validate admin_response (min 10 chars)
  - [ ] Check request exists and is PENDING
  - [ ] Update status to APPROVED
  - [ ] Update admin_response and updated_at
  - [ ] Return updated request
- [ ] Implement `rejectRequest` function:
  - [ ] Validate admin_response (min 10 chars)
  - [ ] Check request exists and is PENDING
  - [ ] Update status to REJECTED
  - [ ] Update admin_response and updated_at
  - [ ] Return updated request

## Task 4: Create Requests Routes ✅
- [ ] Create `server/routes/requests.js`
- [ ] Add POST `/` route → createRequest
- [ ] Add GET `/students/:studentId` route → getStudentRequests
- [ ] Export router

## Task 5: Extend Admin Routes ✅
- [ ] Open `server/routes/admin.js`
- [ ] Add GET `/academic-requests/pending` route → getPendingRequests
- [ ] Add GET `/academic-requests` route → getAllRequests
- [ ] Add POST `/academic-requests/:requestId/approve` route → approveRequest
- [ ] Add POST `/academic-requests/:requestId/reject` route → rejectRequest

## Task 6: Register Routes ✅
- [ ] Open `server/server.js`
- [ ] Import requests routes
- [ ] Register `/api/academic-requests` route
- [ ] Verify admin routes already registered

## Task 7: Create Test Script ✅
- [ ] Create `server/test_academic_requests.js`
- [ ] Test 1: Create request with grade_id
- [ ] Test 2: Create request without grade_id
- [ ] Test 3: Create request with invalid student (404)
- [ ] Test 4: Create request with short reason (400)
- [ ] Test 5: Get student requests
- [ ] Test 6: Get pending requests (admin)
- [ ] Test 7: Get all requests with filters (admin)
- [ ] Test 8: Approve request
- [ ] Test 9: Reject request
- [ ] Test 10: Try to approve already processed request (409)
- [ ] Add instructions for running tests

## Task 8: Documentation ✅
- [ ] Create implementation summary
- [ ] Document all endpoints
- [ ] Add usage examples
- [ ] Update roadmap

## Validation Checklist

### Functionality
- [ ] Students can create requests
- [ ] Students can view their own requests
- [ ] Admins can view pending requests
- [ ] Admins can view all requests with filters
- [ ] Admins can approve requests
- [ ] Admins can reject requests
- [ ] Display names in Vietnamese
- [ ] Proper error handling

### Data Integrity
- [ ] Foreign key constraints work
- [ ] Status transitions validated
- [ ] Timestamps updated correctly
- [ ] NULL handling for optional fields

### Security
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] Proper error messages (no sensitive data)

### Performance
- [ ] Indexes created
- [ ] Efficient queries with JOINs
- [ ] No N+1 query problems
