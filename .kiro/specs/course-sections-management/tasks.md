# Implementation Plan: Course Sections Management

## Overview

This implementation plan breaks down the course sections management feature into discrete coding tasks. The feature adds a new API endpoint for creating course sections with comprehensive validation. Tasks are organized to build incrementally, with testing integrated throughout to catch errors early.

## Tasks

- [x] 1. Update database schema to add section_code column
  - Add `section_code VARCHAR(50) UNIQUE NOT NULL` column to course_sections table
  - Create database migration script
  - _Requirements: 1.1, 4.1_

- [ ] 2. Implement core controller function for creating course sections
  - [x] 2.1 Create `createCourseSection` function in academicController.js
    - Extract request body parameters (subject_id, teacher_id, semester, year, max_students, section_code)
    - Map API parameters to database column names (teacher_id → lecturer_id, year → academic_year, max_students → max_capacity)
    - Implement basic structure with try-catch error handling
    - _Requirements: 1.1, 7.4_
  
  - [ ]* 2.2 Write property test for successful course section creation
    - **Property 1: Successful Course Section Creation**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  
  - [ ]* 2.3 Write unit test for successful creation example
    - Test creating a course section with valid data returns 201
    - _Requirements: 1.1, 7.1_

- [ ] 3. Implement required fields validation
  - [x] 3.1 Add validation logic to check all required fields are present
    - Check for subject_id, teacher_id, semester, year, max_students, section_code
    - Return 400 with descriptive error message if any field is missing
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 3.2 Write property test for required fields validation
    - **Property 5: Required Fields Validation**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**
  
  - [ ]* 3.3 Write unit test for missing required field example
    - Test missing subject_id returns 400 with appropriate error message
    - _Requirements: 5.1, 5.7_

- [ ] 4. Implement data type and constraint validation
  - [x] 4.1 Add validation for max_students positive constraint
    - Check that max_students is a number and greater than 0
    - Return 400 with error message if validation fails
    - _Requirements: 6.1, 6.7_
  
  - [x] 4.2 Add validation for section_code non-empty constraint
    - Check that section_code is not empty or only whitespace
    - Trim whitespace and validate length > 0
    - Return 400 with error message if validation fails
    - _Requirements: 6.2, 6.7_
  
  - [ ]* 4.3 Write property test for max students positive constraint
    - **Property 6: Max Students Positive Constraint**
    - **Validates: Requirements 6.1**
  
  - [ ]* 4.4 Write property test for section code non-empty constraint
    - **Property 7: Section Code Non-Empty Constraint**
    - **Validates: Requirements 6.2**
  
  - [ ]* 4.5 Write unit tests for constraint validation examples
    - Test max_students = 0 returns 400
    - Test max_students = -1 returns 400
    - Test section_code = "" returns 400
    - Test section_code = "   " returns 400
    - _Requirements: 6.1, 6.2, 6.7_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement foreign key validation
  - [x] 6.1 Add subject existence validation
    - Query subjects table to verify subject_id exists
    - Return 400 with error message if subject does not exist
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 6.2 Add teacher existence validation
    - Query lecturers table to verify lecturer_id exists
    - Return 400 with error message if teacher does not exist
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 6.3 Write property test for subject existence validation
    - **Property 2: Subject Existence Validation**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ]* 6.4 Write property test for teacher existence validation
    - **Property 3: Teacher Existence Validation**
    - **Validates: Requirements 3.1, 3.2**
  
  - [ ]* 6.5 Write unit tests for foreign key validation examples
    - Test non-existent subject_id returns 400
    - Test non-existent teacher_id returns 400
    - _Requirements: 2.2, 2.3, 3.2, 3.3_

- [ ] 7. Implement section code uniqueness validation
  - [x] 7.1 Add duplicate section code check
    - Query course_sections table to check if section_code already exists
    - Return 409 with error message if section code is already in use
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 7.2 Write property test for section code uniqueness
    - **Property 4: Section Code Uniqueness**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 7.3 Write unit test for duplicate section code example
    - Test duplicate section_code returns 409
    - _Requirements: 4.2, 4.3_

- [ ] 8. Implement database insertion logic
  - [x] 8.1 Add SQL INSERT query for course_sections table
    - Use parameterized query to prevent SQL injection
    - Insert all fields including section_code
    - Use RETURNING clause to get created record with generated ID
    - _Requirements: 1.1, 1.2_
  
  - [x] 8.2 Format and return success response
    - Return 201 status code
    - Return complete course section data including generated ID and timestamp
    - Format response with message and data fields
    - _Requirements: 1.3, 7.1_

- [ ] 9. Implement error response formatting
  - [x] 9.1 Ensure all error responses include error field
    - Standardize error response format across all validation failures
    - Return JSON with error field containing descriptive message
    - _Requirements: 8.1, 8.3_
  
  - [ ]* 9.2 Write property test for error response format
    - **Property 8: Error Response Format**
    - **Validates: Requirements 8.1**
  
  - [ ]* 9.3 Write unit test for multiple validation errors example
    - Test request with multiple errors returns appropriate error message
    - _Requirements: 8.2_

- [ ] 10. Add route for course sections endpoint
  - [x] 10.1 Add POST route in academic.js
    - Add `router.post('/course-sections', academicController.createCourseSection);`
    - Ensure route is properly exported
    - _Requirements: 1.1_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Integration testing and final validation
  - [ ]* 12.1 Write integration tests for end-to-end flow
    - Test complete API request/response cycle
    - Test database record creation and retrieval
    - Test interaction with subjects and lecturers tables
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 12.2 Manual testing with Postman or similar tool
    - Test all success and error scenarios
    - Verify error messages are clear and helpful
    - Verify HTTP status codes are correct
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties across many generated inputs
- Unit tests validate specific examples and edge cases
- The implementation follows the existing codebase patterns (Express.js, pg library, controller-based architecture)
- Database schema needs to be updated to add section_code column before implementation
