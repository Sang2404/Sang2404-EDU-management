# Requirements Document - Grades Management

## Introduction

This document specifies the requirements for the Grades Management feature, which allows lecturers to enter, update, and submit grades for students, and administrators to approve grades.

## Glossary

- **Grade**: A record of a student's performance in a course section
- **Grade_Status**: The approval state of grades (DRAFT, SUBMITTED, APPROVED)
- **Grade_Components**: Individual grade parts (attendance, midterm, final)
- **Grade_Calculation**: Computed grades (total_10, total_4, grade_char)

## Requirements

### Requirement 1: Enter/Update Grades

**User Story:** As a lecturer, I want to enter and update grades for students in my course sections, so that I can record their performance.

#### Acceptance Criteria

1. WHEN a lecturer provides grade data for a student, THE API SHALL create or update the grade record
2. THE API SHALL validate that the lecturer is assigned to the course section
3. THE API SHALL validate that the student is enrolled in the course section
4. THE API SHALL validate grade values are between 0 and 10
5. THE API SHALL allow partial grade entry (e.g., only attendance)
6. THE API SHALL automatically calculate total_10, total_4, and grade_char based on components
7. THE API SHALL set status to DRAFT for new/updated grades
8. WHEN grade entry is successful, THE API SHALL return HTTP status code 200 or 201

### Requirement 2: Get Grades for Course Section

**User Story:** As a lecturer, I want to view all grades for a course section, so that I can see the complete grade sheet.

#### Acceptance Criteria

1. WHEN a lecturer requests grades for a section, THE API SHALL return all student grades
2. THE API SHALL include student information (student_id, full_name)
3. THE API SHALL include all grade components and calculated grades
4. THE API SHALL include grade status
5. THE API SHALL order by student_id
6. THE API SHALL verify lecturer is assigned to the section
7. WHEN the request is successful, THE API SHALL return HTTP status code 200

### Requirement 3: Submit Grades for Approval

**User Story:** As a lecturer, I want to submit grades for approval, so that they can be reviewed and finalized.

#### Acceptance Criteria

1. WHEN a lecturer submits grades for a section, THE API SHALL change status from DRAFT to SUBMITTED
2. THE API SHALL validate that all enrolled students have grades entered
3. THE API SHALL validate that all grade components are complete
4. THE API SHALL verify lecturer is assigned to the section
5. IF validation fails, THEN THE API SHALL return HTTP status code 400 with details
6. WHEN submission is successful, THE API SHALL return HTTP status code 200

### Requirement 4: Approve Grades (Admin)

**User Story:** As an administrator, I want to approve submitted grades, so that they become official and visible to students.

#### Acceptance Criteria

1. WHEN an administrator approves grades for a section, THE API SHALL change status from SUBMITTED to APPROVED
2. THE API SHALL validate that grades are in SUBMITTED status
3. THE API SHALL prevent further modifications to APPROVED grades
4. WHEN approval is successful, THE API SHALL return HTTP status code 200

### Requirement 5: Reject Grades (Admin)

**User Story:** As an administrator, I want to reject submitted grades, so that lecturers can make corrections.

#### Acceptance Criteria

1. WHEN an administrator rejects grades for a section, THE API SHALL change status from SUBMITTED back to DRAFT
2. THE API SHALL optionally include a rejection reason
3. WHEN rejection is successful, THE API SHALL return HTTP status code 200

### Requirement 6: Get Student's Grades

**User Story:** As a student, I want to view my grades, so that I can see my academic performance.

#### Acceptance Criteria

1. WHEN a student requests their grades, THE API SHALL return all APPROVED grades
2. THE API SHALL include course section details (subject name, semester, lecturer)
3. THE API SHALL include all grade components and calculated grades
4. THE API SHALL NOT show DRAFT or SUBMITTED grades to students
5. THE API SHALL order by academic year and semester
6. WHEN the request is successful, THE API SHALL return HTTP status code 200

### Requirement 7: Grade Calculation Rules

**User Story:** As a system, I want to automatically calculate final grades, so that grading is consistent and accurate.

#### Acceptance Criteria

1. THE API SHALL calculate total_10 using formula: (attendance * 0.1) + (midterm * 0.3) + (final * 0.6)
2. THE API SHALL calculate total_4 based on total_10 scale
3. THE API SHALL assign grade_char based on total_10 scale
4. THE API SHALL round calculated grades to 2 decimal places
5. THE API SHALL recalculate grades whenever components are updated

**Grade Scale:**
- A: 8.5 - 10 (total_4: 4.0)
- B+: 8.0 - 8.4 (total_4: 3.5)
- B: 7.0 - 7.9 (total_4: 3.0)
- C+: 6.5 - 6.9 (total_4: 2.5)
- C: 5.5 - 6.4 (total_4: 2.0)
- D+: 5.0 - 5.4 (total_4: 1.5)
- D: 4.0 - 4.9 (total_4: 1.0)
- F: 0 - 3.9 (total_4: 0.0)

### Requirement 8: Validate Grade Modifications

**User Story:** As a system, I want to prevent unauthorized grade modifications, so that grade integrity is maintained.

#### Acceptance Criteria

1. THE API SHALL allow grade modifications only when status is DRAFT
2. THE API SHALL prevent modifications to SUBMITTED grades (except by admin rejection)
3. THE API SHALL prevent modifications to APPROVED grades
4. THE API SHALL verify lecturer authorization for grade entry
5. WHEN unauthorized modification is attempted, THE API SHALL return HTTP status code 403

### Requirement 9: Return Appropriate HTTP Status Codes

**User Story:** As a client application developer, I want the API to return appropriate HTTP status codes, so that I can handle different scenarios correctly.

#### Acceptance Criteria

1. WHEN grade entry is successful, THE API SHALL return HTTP status code 200 or 201
2. WHEN validation fails, THE API SHALL return HTTP status code 400
3. WHEN authorization fails, THE API SHALL return HTTP status code 403
4. WHEN a resource is not found, THE API SHALL return HTTP status code 404
5. WHEN an unexpected server error occurs, THE API SHALL return HTTP status code 500
