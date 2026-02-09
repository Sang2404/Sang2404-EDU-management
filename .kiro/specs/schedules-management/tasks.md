# Implementation Plan: Schedules Management

## Tasks

- [ ] 1. Create helper function for day names
  - [ ] 1.1 Add getDayName function to controller
    - Map day_of_week (2-8) to Vietnamese day names
    - _Requirements: 2.1, 6.2, 7.2_

- [ ] 2. Implement Create Schedule
  - [ ] 2.1 Create `createSchedule` function in academicController.js
    - Validate required fields
    - Validate day_of_week (2-8)
    - Validate start_period and end_period (1-15)
    - Validate start_period < end_period
    - Check section_id exists
    - Check room conflict
    - Check lecturer conflict
    - Insert schedule
    - Return created data
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 8.1, 8.2, 8.3_
  
  - [ ] 2.2 Add POST route
    - Add `router.post('/schedules', academicController.createSchedule);`
    - _Requirements: 1.1_

- [ ] 3. Implement Get Schedules by Course Section
  - [ ] 3.1 Create `getSchedulesBySection` function
    - Extract section_id from params
    - Query schedules for that section
    - Add day names
    - Order by day_of_week, start_period
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 3.2 Add GET route
    - Add `router.get('/course-sections/:sectionId/schedules', academicController.getSchedulesBySection);`
    - _Requirements: 2.1_

- [ ] 4. Implement Get Schedule by ID
  - [ ] 4.1 Create `getScheduleById` function
    - Extract schedule_id from params
    - Query schedule with section details
    - Return 404 if not found
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 4.2 Add GET route
    - Add `router.get('/schedules/:id', academicController.getScheduleById);`
    - _Requirements: 3.1_

- [ ] 5. Implement Update Schedule
  - [ ] 5.1 Create `updateSchedule` function
    - Check schedule exists
    - Validate all fields
    - Check conflicts (excluding current schedule)
    - Update schedule
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 5.2 Add PUT route
    - Add `router.put('/schedules/:id', academicController.updateSchedule);`
    - _Requirements: 4.1_

- [ ] 6. Implement Delete Schedule
  - [ ] 6.1 Create `deleteSchedule` function
    - Check schedule exists
    - Delete schedule
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 6.2 Add DELETE route
    - Add `router.delete('/schedules/:id', academicController.deleteSchedule);`
    - _Requirements: 5.1_

- [ ] 7. Implement Get Student Schedule
  - [ ] 7.1 Create `getStudentSchedule` function
    - Extract student_id from params
    - JOIN schedules, course_sections, section_students, subjects, lecturers, users
    - Filter by student_id
    - Add day names
    - Order by day_of_week, start_period
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 7.2 Add GET route in new schedules router
    - Create `server/routes/schedules.js`
    - Add `router.get('/student/:studentId', schedulesController.getStudentSchedule);`
    - _Requirements: 6.1_

- [ ] 8. Implement Get Lecturer Schedule
  - [ ] 8.1 Create `getLecturerSchedule` function
    - Extract lecturer_id from params
    - JOIN schedules, course_sections, subjects
    - Filter by lecturer_id
    - Add day names and enrolled count
    - Order by day_of_week, start_period
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 8.2 Add GET route in schedules router
    - Add `router.get('/lecturer/:lecturerId', schedulesController.getLecturerSchedule);`
    - _Requirements: 7.1_

- [ ] 9. Create schedules controller
  - [ ] 9.1 Create `server/controllers/schedulesController.js`
    - Move student/lecturer schedule functions here
    - Keep CRUD operations in academicController

- [ ] 10. Testing
  - [ ] 10.1 Create test script
    - Test create schedule
    - Test validation errors
    - Test conflict detection
    - Test get by section
    - Test update and delete
    - Test student schedule
    - Test lecturer schedule

## Notes

- Conflict detection is critical for preventing double-booking
- Student and lecturer schedules require complex JOINs
- Consider creating separate controller for user-facing schedule endpoints
