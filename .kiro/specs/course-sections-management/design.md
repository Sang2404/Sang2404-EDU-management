# Design Document: Course Sections Management

## Overview

The Course Sections Management feature provides a RESTful API endpoint for creating course sections (lớp học phần) in the student management system. A course section represents a specific instance of a subject being taught by a lecturer in a particular semester and academic year.

This design follows the existing architecture pattern used in the system:
- Express.js for routing and middleware
- PostgreSQL with pg library for database operations
- Controller-based architecture for business logic
- Consistent error handling and HTTP status codes

The feature integrates with existing tables (subjects, lecturers/users) and creates records in the course_sections table with comprehensive validation to ensure data integrity.

## Architecture

### System Context

The course sections management feature operates within the existing student management system architecture:

```
┌─────────────┐
│   Client    │
│ Application │
└──────┬──────┘
       │ HTTP POST /api/academic/course-sections
       ▼
┌─────────────────────────────────────┐
│      Express.js Server              │
│  ┌───────────────────────────────┐  │
│  │  Routes Layer                 │  │
│  │  (academic.js)                │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │  Controller Layer             │  │
│  │  (academicController.js)      │  │
│  │  - Validation Logic           │  │
│  │  - Business Rules             │  │
│  │  - Error Handling             │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │  Database Layer (pg Pool)     │  │
│  └───────────┬───────────────────┘  │
└──────────────┼─────────────────────┘
               ▼
    ┌──────────────────────┐
    │  PostgreSQL Database │
    │  - course_sections   │
    │  - subjects          │
    │  - lecturers         │
    │  - users             │
    └──────────────────────┘
```

### Design Decisions

1. **Validation Strategy**: Perform all validation in the controller before database operations to provide clear error messages and prevent invalid data from reaching the database.

2. **Transaction Management**: Use a single database transaction for the entire operation to ensure atomicity - either all validations pass and the record is created, or nothing is committed.

3. **Error Response Format**: Follow the existing pattern of returning JSON objects with an `error` field for failures and appropriate HTTP status codes.

4. **ID Generation**: Use PostgreSQL's SERIAL type for auto-incrementing section_id rather than requiring clients to provide IDs.

5. **Foreign Key Validation**: Explicitly validate foreign key references (subject_id, teacher_id) before insertion to provide specific error messages rather than relying on database constraint violations.

## Components and Interfaces

### API Endpoint

**POST /api/academic/course-sections**

Creates a new course section with validation.

**Request Body:**
```json
{
  "subject_id": "string",
  "teacher_id": "string", 
  "semester": "string",
  "year": "string",
  "max_students": number,
  "section_code": "string"
}
```

**Success Response (201 Created):**
```json
{
  "message": "Tạo lớp học phần thành công",
  "data": {
    "id": number,
    "subject_id": "string",
    "teacher_id": "string",
    "semester": "string",
    "year": "string",
    "max_students": number,
    "section_code": "string",
    "created_at": "timestamp"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Descriptive error message"
}
```

**Error Response (409 Conflict):**
```json
{
  "error": "Mã lớp học phần đã tồn tại"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Error message"
}
```

### Controller Function

**Function Signature:**
```javascript
exports.createCourseSection = async (req, res) => { ... }
```

**Responsibilities:**
1. Extract and validate request body parameters
2. Validate data types and constraints
3. Check for required fields
4. Verify subject existence
5. Verify teacher existence
6. Check for duplicate section codes
7. Insert new course section record
8. Return success response with created data

### Validation Functions

The controller will implement inline validation logic for:

1. **validateRequiredFields(body)**: Checks that all required fields are present
2. **validateDataTypes(body)**: Ensures correct data types for all fields
3. **validateConstraints(body)**: Validates business rules (e.g., max_students > 0)
4. **checkSubjectExists(subject_id)**: Queries database to verify subject
5. **checkTeacherExists(teacher_id)**: Queries database to verify teacher
6. **checkDuplicateSectionCode(section_code)**: Queries database for existing section code

## Data Models

### Course Section Entity

**Database Table:** `course_sections`

```sql
CREATE TABLE course_sections (
    id SERIAL PRIMARY KEY,
    subject_id VARCHAR(20) NOT NULL REFERENCES subjects(subject_id),
    teacher_id VARCHAR(20) NOT NULL REFERENCES lecturers(lecturer_id),
    semester VARCHAR(10) NOT NULL,
    year VARCHAR(9) NOT NULL,
    max_students INT NOT NULL CHECK (max_students > 0),
    section_code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Note:** The existing database schema uses `section_id` as the primary key name and different column names. The implementation will adapt to the existing schema:
- Use `section_id` instead of `id`
- Use `lecturer_id` instead of `teacher_id` 
- Use `semester` and `academic_year` instead of separate `semester` and `year`
- Use `max_capacity` instead of `max_students`

**Adjusted Table Structure (matching existing schema):**
```sql
CREATE TABLE course_sections (
    section_id SERIAL PRIMARY KEY,
    subject_id VARCHAR(20) REFERENCES subjects(subject_id),
    lecturer_id VARCHAR(20) REFERENCES lecturers(lecturer_id),
    semester VARCHAR(10) NOT NULL,
    academic_year VARCHAR(9) NOT NULL,
    room_default VARCHAR(50),
    max_capacity INT DEFAULT 60,
    is_locked BOOLEAN DEFAULT FALSE
);
```

**API Request/Response Mapping:**
- API uses `teacher_id` → Maps to database `lecturer_id`
- API uses `year` → Maps to database `academic_year`
- API uses `max_students` → Maps to database `max_capacity`
- API uses `section_code` → Need to add this column to database schema

### Related Entities

**Subject Entity:**
```sql
CREATE TABLE subjects (
    subject_id VARCHAR(20) PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    credits INT NOT NULL CHECK (credits > 0),
    description TEXT
);
```

**Lecturer Entity:**
```sql
CREATE TABLE lecturers (
    lecturer_id VARCHAR(20) PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    faculty_id VARCHAR(10) REFERENCES faculties(faculty_id),
    degree VARCHAR(50),
    phone VARCHAR(15)
);
```

### Validation Rules

1. **Required Fields:**
   - subject_id: Must be present and non-empty
   - teacher_id: Must be present and non-empty
   - semester: Must be present and non-empty
   - year: Must be present and non-empty
   - max_students: Must be present
   - section_code: Must be present and non-empty

2. **Data Type Constraints:**
   - subject_id: String (VARCHAR)
   - teacher_id: String (VARCHAR)
   - semester: String (VARCHAR)
   - year: String (VARCHAR)
   - max_students: Integer
   - section_code: String (VARCHAR)

3. **Business Rules:**
   - max_students must be greater than 0
   - section_code cannot be only whitespace
   - subject_id must reference an existing subject
   - teacher_id must reference an existing lecturer
   - section_code must be unique across all course sections


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Successful Course Section Creation

*For any* valid course section data (with existing subject_id, existing teacher_id, unique section_code, positive max_students, and all required fields), when the API creates a course section, the database should contain a record with that data, including a generated ID and creation timestamp, and the API should return this complete data with HTTP status 201.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Subject Existence Validation

*For any* course section creation request, if the subject_id does not reference an existing subject in the subjects table, the API should reject the request with an error message indicating the subject does not exist and HTTP status 400.

**Validates: Requirements 2.1, 2.2**

### Property 3: Teacher Existence Validation

*For any* course section creation request, if the teacher_id does not reference an existing lecturer in the lecturers table, the API should reject the request with an error message indicating the teacher does not exist and HTTP status 400.

**Validates: Requirements 3.1, 3.2**

### Property 4: Section Code Uniqueness

*For any* existing course section with a given section_code, attempting to create another course section with the same section_code should be rejected with an error message indicating the section code is already in use and HTTP status 409.

**Validates: Requirements 4.1, 4.2**

### Property 5: Required Fields Validation

*For any* course section creation request missing one or more required fields (subject_id, teacher_id, semester, year, max_students, or section_code), the API should reject the request with an error message indicating which field is required and HTTP status 400.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**

### Property 6: Max Students Positive Constraint

*For any* course section creation request where max_students is less than or equal to zero, the API should reject the request with an error message indicating max_students must be a positive integer and HTTP status 400.

**Validates: Requirements 6.1**

### Property 7: Section Code Non-Empty Constraint

*For any* course section creation request where section_code is an empty string or contains only whitespace characters, the API should reject the request with an error message indicating section_code cannot be empty and HTTP status 400.

**Validates: Requirements 6.2**

### Property 8: Error Response Format

*For any* validation failure in course section creation, the API should return a JSON response containing an error message field with a descriptive error message.

**Validates: Requirements 8.1**

## Error Handling

### Validation Error Handling

The controller implements a validation pipeline that checks conditions in the following order:

1. **Required Fields Check**: Verify all required fields are present
2. **Data Type Check**: Verify correct data types for all fields
3. **Constraint Check**: Verify business rules (max_students > 0, section_code not empty)
4. **Foreign Key Check**: Verify subject and teacher exist
5. **Uniqueness Check**: Verify section_code is unique

Each validation step returns immediately upon failure with an appropriate error message and HTTP status code.

### Error Response Structure

All error responses follow this format:

```json
{
  "error": "Descriptive error message in Vietnamese or English"
}
```

### HTTP Status Code Mapping

- **201 Created**: Course section successfully created
- **400 Bad Request**: Validation failure (missing fields, invalid data types, constraint violations, non-existent foreign keys)
- **409 Conflict**: Duplicate section_code
- **500 Internal Server Error**: Unexpected database or server errors

### Database Error Handling

Database operations are wrapped in try-catch blocks. If a database error occurs:
1. Log the error for debugging
2. Return a generic error message to the client
3. Return HTTP status 500

### Transaction Rollback

Although the current implementation uses individual queries, the design supports future enhancement to use database transactions. If any validation fails after the transaction begins, the transaction should be rolled back to maintain data consistency.

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

### Property-Based Testing

**Library**: Use `fast-check` for JavaScript/Node.js property-based testing

**Configuration**: Each property test should run a minimum of 100 iterations to ensure comprehensive input coverage

**Test Tagging**: Each property test must include a comment tag referencing the design document property:
```javascript
// Feature: course-sections-management, Property 1: Successful Course Section Creation
```

**Property Test Coverage**:

1. **Property 1 Test**: Generate random valid course section data (with pre-seeded subjects and teachers), create course sections, verify database contains records and API returns complete data
   - Tag: `Feature: course-sections-management, Property 1: Successful Course Section Creation`

2. **Property 2 Test**: Generate random subject_ids (mix of valid and invalid), attempt to create course sections, verify that invalid subject_ids are rejected with appropriate error
   - Tag: `Feature: course-sections-management, Property 2: Subject Existence Validation`

3. **Property 3 Test**: Generate random teacher_ids (mix of valid and invalid), attempt to create course sections, verify that invalid teacher_ids are rejected with appropriate error
   - Tag: `Feature: course-sections-management, Property 3: Teacher Existence Validation`

4. **Property 4 Test**: Create a course section with a random section_code, then attempt to create another with the same code, verify rejection with 409 status
   - Tag: `Feature: course-sections-management, Property 4: Section Code Uniqueness`

5. **Property 5 Test**: Generate course section data with randomly missing required fields, verify rejection with appropriate error messages
   - Tag: `Feature: course-sections-management, Property 5: Required Fields Validation`

6. **Property 6 Test**: Generate random max_students values (including negative, zero, and positive), verify that only positive values are accepted
   - Tag: `Feature: course-sections-management, Property 6: Max Students Positive Constraint`

7. **Property 7 Test**: Generate random section_codes (including empty strings and whitespace-only strings), verify that empty/whitespace codes are rejected
   - Tag: `Feature: course-sections-management, Property 7: Section Code Non-Empty Constraint`

8. **Property 8 Test**: Generate various invalid inputs that trigger different validation failures, verify all error responses contain an error field
   - Tag: `Feature: course-sections-management, Property 8: Error Response Format`

### Unit Testing

**Unit Test Coverage**:

1. **Successful Creation Example**: Test creating a course section with valid data
2. **Missing Subject Example**: Test with non-existent subject_id returns 400
3. **Missing Teacher Example**: Test with non-existent teacher_id returns 400
4. **Duplicate Section Code Example**: Test duplicate section_code returns 409
5. **Missing Required Field Example**: Test missing subject_id returns 400
6. **Zero Max Students Example**: Test max_students = 0 returns 400
7. **Negative Max Students Example**: Test max_students = -1 returns 400
8. **Empty Section Code Example**: Test section_code = "" returns 400
9. **Whitespace Section Code Example**: Test section_code = "   " returns 400
10. **Multiple Validation Errors Example**: Test request with multiple errors returns appropriate error message

### Integration Testing

Integration tests should verify:
1. End-to-end API request/response flow
2. Database record creation and retrieval
3. Interaction with existing subjects and lecturers tables
4. Error handling across the full stack

### Test Database Setup

Tests should use a separate test database with:
1. Pre-seeded subjects for foreign key validation tests
2. Pre-seeded lecturers for foreign key validation tests
3. Cleanup between tests to ensure isolation
4. Transaction rollback after each test to maintain clean state
