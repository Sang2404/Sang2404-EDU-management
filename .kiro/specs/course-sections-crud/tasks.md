# Implementation Plan: Course Sections CRUD Operations

## Overview

This implementation plan adds Read, Update, and Delete operations for course sections to complete the CRUD functionality.

## Tasks

- [ ] 1. Implement Get All Course Sections
  - [ ] 1.1 Create `getAllCourseSections` function in academicController.js
    - Build SQL query with LEFT JOINs for subjects, lecturers, users
    - Add COUNT for enrolled students
    - Support optional filtering by semester and academic_year
    - Return array of course sections with complete information
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 1.2 Add GET route in academic.js
    - Add `router.get('/course-sections', academicController.getAllCourseSections);`
    - _Requirements: 1.1_

- [ ] 2. Implement Get Single Course Section
  - [ ] 2.1 Create `getCourseSectionById` function in academicController.js
    - Extract section_id from params
    - Query with JOINs for complete information
    - Return 404 if not found
    - Return complete course section details
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 2.2 Add GET route with ID parameter in academic.js
    - Add `router.get('/course-sections/:id', academicController.getCourseSectionById);`
    - _Requirements: 2.1_

- [ ] 3. Implement Update Course Section
  - [ ] 3.1 Create `updateCourseSection` function in academicController.js
    - Extract section_id from params and request body
    - Check if course section exists (return 404 if not)
    - Validate all fields (reuse validation logic from create)
    - Check subject exists if subject_id is being updated
    - Check teacher exists if teacher_id is being updated
    - Check duplicate section_code (excluding current record)
    - Update course section with parameterized query
    - Return updated data
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  
  - [ ] 3.2 Add PUT route in academic.js
    - Add `router.put('/course-sections/:id', academicController.updateCourseSection);`
    - _Requirements: 3.1_

- [ ] 4. Implement Delete Course Section
  - [ ] 4.1 Create `deleteCourseSection` function in academicController.js
    - Extract section_id from params
    - Check if course section exists (return 404 if not)
    - Check if students are enrolled (optional: prevent deletion or allow cascade)
    - Delete course section
    - Return success message
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 4.2 Add DELETE route in academic.js
    - Add `router.delete('/course-sections/:id', academicController.deleteCourseSection);`
    - _Requirements: 4.1_

- [ ] 5. Testing
  - [ ] 5.1 Test Get All Course Sections
    - Test without filters
    - Test with semester filter
    - Test with academic_year filter
    - Test with both filters
    - Test empty result
  
  - [ ] 5.2 Test Get Single Course Section
    - Test with valid ID
    - Test with non-existent ID (404)
    - Test with invalid ID format
  
  - [ ] 5.3 Test Update Course Section
    - Test successful update
    - Test update with non-existent ID (404)
    - Test update with invalid data (400)
    - Test update with duplicate section_code (409)
    - Test update with non-existent subject (400)
    - Test update with non-existent teacher (400)
  
  - [ ] 5.4 Test Delete Course Section
    - Test successful deletion
    - Test delete with non-existent ID (404)
    - Test delete with enrolled students (if applicable)

- [ ] 6. Create test script and documentation
  - [ ] 6.1 Create test_course_sections_crud.js
  - [ ] 6.2 Update COURSE_SECTIONS_API_GUIDE.md with new endpoints

## Notes

- All operations follow the same error handling patterns as the Create operation
- Update operation reuses validation logic from Create
- Delete operation should consider business rules about enrolled students
- All queries use parameterized statements for SQL injection prevention
