# Implementation Plan: Grades Management

## Tasks

- [ ] 1. Create grades controller
  - [ ] 1.1 Create `server/controllers/gradesController.js`
    - Import pool
    - Add grade calculation helper function
    - _Requirements: All_

- [ ] 2. Implement Grade Calculation Helper
  - [ ] 2.1 Create `calculateGrades` function
    - Calculate total_10 using formula
    - Determine total_4 based on scale
    - Determine grade_char based on scale
    - Round to 2 decimal places
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 3. Implement Enter/Update Grade
  - [ ] 3.1 Create `enterGrade` function
    - Extract section_id, student_id, grade components from body
    - Validate grade values (0-10)
    - Get section details and verify lecturer assignment
    - Check student enrollment
    - Check if existing grade and its status
    - Prevent modification if status is not DRAFT
    - Calculate total_10, total_4, grade_char
    - Insert or update grade with UPSERT
    - Return grade data
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 8.1, 8.4, 8.5_
  
  - [ ] 3.2 Add POST route in grades router
    - Create `server/routes/grades.js`
    - Add `router.post('/', gradesController.enterGrade);`
    - _Requirements: 1.1_

- [ ] 4. Implement Get Grades for Section
  - [ ] 4.1 Add to lecturersController
    - Create `getSectionGrades` function
    - Extract lecturer_id and section_id from params
    - Verify lecturer assignment
    - Query all grades for section with student info
    - Order by student_id
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ] 4.2 Add GET route in lecturers router
    - Add `router.get('/:lecturerId/sections/:sectionId/grades', lecturersController.getSectionGrades);`
    - _Requirements: 2.1_

- [ ] 5. Implement Submit Grades
  - [ ] 5.1 Add to lecturersController
    - Create `submitGrades` function
    - Extract lecturer_id and section_id from params
    - Verify lecturer assignment
    - Check all enrolled students have grades
    - Check all grades have complete components
    - Update all grades status to SUBMITTED
    - Return summary
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ] 5.2 Add POST route in lecturers router
    - Add `router.post('/:lecturerId/sections/:sectionId/grades/submit', lecturersController.submitGrades);`
    - _Requirements: 3.1_

- [ ] 6. Implement Approve Grades (Admin)
  - [ ] 6.1 Create admin controller
    - Create `server/controllers/adminController.js`
    - Create `approveGrades` function
    - Extract section_id from params
    - Validate grades are in SUBMITTED status
    - Update all grades status to APPROVED
    - Return summary
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 6.2 Create admin routes
    - Create `server/routes/admin.js`
    - Add `router.post('/sections/:sectionId/grades/approve', adminController.approveGrades);`
    - _Requirements: 4.1_

- [ ] 7. Implement Reject Grades (Admin)
  - [ ] 7.1 Add to adminController
    - Create `rejectGrades` function
    - Extract section_id and reason from body
    - Update all grades status back to DRAFT
    - Store rejection reason (optional enhancement)
    - Return summary
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 7.2 Add POST route in admin router
    - Add `router.post('/sections/:sectionId/grades/reject', adminController.rejectGrades);`
    - _Requirements: 5.1_

- [ ] 8. Implement Get Student's Grades
  - [ ] 8.1 Add to gradesController
    - Create `getStudentGrades` function
    - Extract student_id from params
    - Query all APPROVED grades for student
    - Include section and subject details
    - Order by academic_year DESC, semester
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 8.2 Add GET route in grades router
    - Add `router.get('/students/:studentId', gradesController.getStudentGrades);`
    - _Requirements: 6.1_

- [ ] 9. Register routes in server.js
  - [ ] 9.1 Import and register grades routes
    - Add `const gradesRoutes = require('./routes/grades');`
    - Add `app.use('/api/grades', gradesRoutes);`
  
  - [ ] 9.2 Import and register admin routes
    - Add `const adminRoutes = require('./routes/admin');`
    - Add `app.use('/api/admin', adminRoutes);`

- [ ] 10. Testing
  - [ ] 10.1 Create test script
    - Test enter grade (success)
    - Test enter grade (not authorized - 403)
    - Test enter grade (invalid value - 400)
    - Test update grade (success)
    - Test update submitted grade (403)
    - Test get section grades
    - Test submit grades (success)
    - Test submit incomplete grades (400)
    - Test approve grades (success)
    - Test approve draft grades (400)
    - Test reject grades
    - Test get student grades (only approved)

## Notes

- Grade calculation must be consistent and accurate
- Authorization checks are critical for data integrity
- Workflow state transitions must be strictly enforced
- Consider adding audit log for grade changes (future enhancement)
- Consider adding rejection reason storage (future enhancement)
