# Implementation Plan: Section Students Management

## Tasks

- [ ] 1. Implement Add Student to Course Section
  - [ ] 1.1 Create `addStudentToSection` function in academicController.js
    - Extract section_id from params and student_id from body
    - Validate student exists
    - Validate section exists and get details
    - Check if section is locked
    - Check current enrollment count
    - Check if section is full
    - Check for duplicate enrollment
    - Insert enrollment record
    - Return success with enrollment data
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 5.1, 5.2, 5.3, 5.4_
  
  - [ ] 1.2 Add POST route
    - Add `router.post('/course-sections/:sectionId/students', academicController.addStudentToSection);`
    - _Requirements: 1.1_

- [ ] 2. Implement Remove Student from Course Section
  - [ ] 2.1 Create `removeStudentFromSection` function
    - Extract section_id and student_id from params
    - Check if enrollment exists
    - Delete enrollment record
    - Return success message
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 2.2 Add DELETE route
    - Add `router.delete('/course-sections/:sectionId/students/:studentId', academicController.removeStudentFromSection);`
    - _Requirements: 2.1_

- [ ] 3. Implement Get Students in Course Section
  - [ ] 3.1 Create `getStudentsInSection` function
    - Extract section_id from params
    - JOIN with students, users, classes tables
    - Order by student_id or full_name
    - Return array of students with details
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 3.2 Add GET route
    - Add `router.get('/course-sections/:sectionId/students', academicController.getStudentsInSection);`
    - _Requirements: 3.1_

- [ ] 4. Implement Get Course Sections for Student
  - [ ] 4.1 Create `getSectionsForStudent` function
    - Extract student_id from params
    - JOIN with course_sections, subjects, lecturers, users tables
    - Order by semester, subject_name
    - Return array of sections with details
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 4.2 Add GET route
    - Add `router.get('/students/:studentId/sections', academicController.getSectionsForStudent);`
    - _Requirements: 4.1_

- [ ] 5. Implement Bulk Add Students
  - [ ] 5.1 Create `bulkAddStudentsToSection` function
    - Extract section_id from params and student_ids array from body
    - Validate section exists and get details
    - Loop through student_ids
    - For each student: validate, check constraints, insert if valid
    - Track successful, failed, and skipped enrollments
    - Return summary with details
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 5.2 Add POST route
    - Add `router.post('/course-sections/:sectionId/students/bulk', academicController.bulkAddStudentsToSection);`
    - _Requirements: 6.1_

- [ ] 6. Testing
  - [ ] 6.1 Create test script
    - Test add student (success)
    - Test add to locked section (400)
    - Test add to full section (400)
    - Test duplicate enrollment (409)
    - Test add non-existent student (400)
    - Test get students in section
    - Test get sections for student
    - Test remove student
    - Test remove non-existent enrollment (404)
    - Test bulk add students

## Notes

- Enrollment constraints are critical for data integrity
- Consider transaction support for bulk operations
- Enrollment timestamp is automatically set by database
- Cascade delete handles cleanup automatically
