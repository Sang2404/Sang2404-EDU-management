# Statistics & Reports API - Implementation Tasks

## Task 1: Create Statistics Controller ✅
- [ ] Create `server/controllers/statisticsController.js`
- [ ] Implement helper functions:
  - [ ] `getGPALabel(range)` - Vietnamese GPA labels
  - [ ] `getGradeLabel(grade)` - Vietnamese grade labels
  - [ ] `getRequestTypeDisplay(type)` - Request type labels
  - [ ] `getStatusDisplay(status)` - Status labels

## Task 2: Implement System Overview ✅
- [ ] Implement `getOverview` function:
  - [ ] Count total users, active, inactive
  - [ ] Count users by role (ADMIN, LECTURER, STUDENT)
  - [ ] Count students by status
  - [ ] Count lecturers
  - [ ] Count subjects
  - [ ] Count sections (total and current semester)
  - [ ] Get current semester info
  - [ ] Return combined statistics

## Task 3: Implement Student Statistics ✅
- [ ] Implement `getStudentStatistics` function:
  - [ ] Get optional filters (faculty_id, major_id)
  - [ ] Calculate GPA distribution with 5 ranges
  - [ ] Add Vietnamese labels to ranges
  - [ ] Calculate percentages
  - [ ] Count students by faculty
  - [ ] Count students by major
  - [ ] Get top 10 students by GPA
  - [ ] Return statistics

## Task 4: Implement Course Statistics ✅
- [ ] Implement `getCourseStatistics` function:
  - [ ] Get optional filters (semester, academic_year, subject_id)
  - [ ] Count sections by semester
  - [ ] Calculate enrollment statistics:
    - [ ] Total students
    - [ ] Total sections
    - [ ] Average per section
    - [ ] Total capacity
    - [ ] Capacity utilization percentage
  - [ ] Group sections by subject
  - [ ] Get top 10 most enrolled sections
  - [ ] Get top 10 least enrolled sections
  - [ ] Return statistics

## Task 5: Implement Grade Statistics ✅
- [ ] Implement `getGradeStatistics` function:
  - [ ] Get optional filters (semester, academic_year, subject_id)
  - [ ] Calculate grade distribution (A-F)
  - [ ] Add Vietnamese labels
  - [ ] Calculate percentages
  - [ ] Calculate average grade by subject
  - [ ] Calculate pass rate by subject
  - [ ] Calculate average grade by semester
  - [ ] Calculate overall statistics:
    - [ ] Average grade
    - [ ] Total grades
    - [ ] Pass rate
    - [ ] Total passed/failed
  - [ ] Return statistics

## Task 6: Implement Request Statistics ✅
- [ ] Implement `getRequestStatistics` function:
  - [ ] Get optional date filters (start_date, end_date)
  - [ ] Count requests by type
  - [ ] Add Vietnamese labels
  - [ ] Calculate percentages
  - [ ] Count requests by status
  - [ ] Calculate trends by month
  - [ ] Calculate processing time:
    - [ ] Average hours and days
    - [ ] Median hours and days
    - [ ] Processed count
  - [ ] Return statistics

## Task 7: Create Statistics Routes ✅
- [ ] Create `server/routes/statistics.js`
- [ ] Add GET `/overview` route → getOverview
- [ ] Add GET `/students` route → getStudentStatistics
- [ ] Add GET `/courses` route → getCourseStatistics
- [ ] Add GET `/grades` route → getGradeStatistics
- [ ] Add GET `/requests` route → getRequestStatistics
- [ ] Export router

## Task 8: Register Routes ✅
- [ ] Open `server/server.js`
- [ ] Import statistics routes
- [ ] Register `/api/admin/statistics` route
- [ ] Verify routes work

## Task 9: Create Test Script ✅
- [ ] Create `server/test_statistics.js`
- [ ] Test 1: Get system overview
- [ ] Test 2: Get student statistics
- [ ] Test 3: Get student statistics with filters
- [ ] Test 4: Get course statistics
- [ ] Test 5: Get course statistics with filters
- [ ] Test 6: Get grade statistics
- [ ] Test 7: Get grade statistics with filters
- [ ] Test 8: Get request statistics
- [ ] Test 9: Get request statistics with date range
- [ ] Test 10: Verify percentages and calculations
- [ ] Add instructions for running tests

## Task 10: Documentation ✅
- [ ] Create implementation summary
- [ ] Document all endpoints
- [ ] Add usage examples
- [ ] Update roadmap

## Validation Checklist

### Functionality
- [ ] All 5 statistics endpoints work
- [ ] Filters work correctly
- [ ] Vietnamese labels displayed
- [ ] Percentages calculated correctly
- [ ] Averages calculated correctly
- [ ] Empty data handled gracefully

### Data Accuracy
- [ ] Counts match database
- [ ] Percentages sum to 100 (or close)
- [ ] Averages are correct
- [ ] Pass rates are correct
- [ ] Processing times are reasonable

### Performance
- [ ] Queries are efficient
- [ ] No N+1 query problems
- [ ] Aggregate functions used
- [ ] Indexes in place
- [ ] Response time < 1 second

### Error Handling
- [ ] Invalid filters handled
- [ ] Division by zero handled
- [ ] NULL values handled
- [ ] Empty results handled
- [ ] Proper error messages
