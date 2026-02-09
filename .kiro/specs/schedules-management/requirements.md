# Requirements Document - Schedules Management

## Introduction

This document specifies the requirements for the Schedules Management feature in the student management system. Schedules define when and where course sections meet (day of week, time periods, room).

## Glossary

- **Schedule**: A specific meeting time for a course section (e.g., Monday periods 1-3 in room A101)
- **Day_of_week**: Day when class meets (2=Monday, 3=Tuesday, ..., 8=Sunday)
- **Period**: Class period (1-15, typically 1 period = 45 minutes)
- **Course_Section**: The class that the schedule belongs to

## Requirements

### Requirement 1: Create Schedule

**User Story:** As an administrator, I want to create schedules for course sections, so that students and teachers know when and where classes meet.

#### Acceptance Criteria

1. WHEN an administrator provides valid schedule data (section_id, day_of_week, start_period, end_period, room), THE API SHALL create a new schedule record
2. THE API SHALL validate that section_id references an existing course section
3. THE API SHALL validate that day_of_week is between 2 and 8 (Monday to Sunday)
4. THE API SHALL validate that start_period and end_period are between 1 and 15
5. THE API SHALL validate that start_period is less than end_period
6. WHEN a schedule is successfully created, THE API SHALL return HTTP status code 201
7. THE API SHALL return the complete schedule data including generated ID

### Requirement 2: Get Schedules by Course Section

**User Story:** As an administrator or teacher, I want to view all schedules for a course section, so that I can see the complete timetable for that class.

#### Acceptance Criteria

1. WHEN requesting schedules for a course section, THE API SHALL return all schedules for that section
2. THE API SHALL order schedules by day_of_week and start_period
3. THE API SHALL return an empty array if no schedules exist
4. WHEN the request is successful, THE API SHALL return HTTP status code 200

### Requirement 3: Get Schedule by ID

**User Story:** As an administrator, I want to view a specific schedule, so that I can see its details.

#### Acceptance Criteria

1. WHEN requesting a schedule by ID, THE API SHALL return the complete schedule details
2. IF the schedule does not exist, THEN THE API SHALL return HTTP status code 404
3. WHEN the request is successful, THE API SHALL return HTTP status code 200

### Requirement 4: Update Schedule

**User Story:** As an administrator, I want to update schedule information, so that I can correct errors or make changes.

#### Acceptance Criteria

1. WHEN an administrator provides valid updated data, THE API SHALL update the schedule
2. THE API SHALL validate all fields similar to the create operation
3. IF the schedule does not exist, THEN THE API SHALL return HTTP status code 404
4. WHEN validation fails, THE API SHALL return HTTP status code 400
5. WHEN the update is successful, THE API SHALL return HTTP status code 200

### Requirement 5: Delete Schedule

**User Story:** As an administrator, I want to delete schedules, so that I can remove incorrect or cancelled class times.

#### Acceptance Criteria

1. WHEN an administrator requests to delete a schedule, THE API SHALL remove it from the database
2. IF the schedule does not exist, THEN THE API SHALL return HTTP status code 404
3. WHEN the deletion is successful, THE API SHALL return HTTP status code 200

### Requirement 6: Get Student Schedule

**User Story:** As a student, I want to view my personal timetable, so that I know when and where my classes are.

#### Acceptance Criteria

1. WHEN a student requests their schedule, THE API SHALL return all schedules for course sections they are enrolled in
2. THE API SHALL include course section details (subject name, lecturer name, room)
3. THE API SHALL order schedules by day_of_week and start_period
4. WHEN the request is successful, THE API SHALL return HTTP status code 200

### Requirement 7: Get Lecturer Schedule

**User Story:** As a lecturer, I want to view my teaching schedule, so that I know when and where I need to teach.

#### Acceptance Criteria

1. WHEN a lecturer requests their schedule, THE API SHALL return all schedules for course sections they teach
2. THE API SHALL include course section details (subject name, room, enrolled count)
3. THE API SHALL order schedules by day_of_week and start_period
4. WHEN the request is successful, THE API SHALL return HTTP status code 200

### Requirement 8: Validate Schedule Conflicts

**User Story:** As an administrator, I want the system to prevent schedule conflicts, so that rooms and teachers are not double-booked.

#### Acceptance Criteria

1. WHEN creating or updating a schedule, THE API SHALL check for room conflicts (same room, same day, overlapping periods)
2. WHEN creating or updating a schedule, THE API SHALL check for lecturer conflicts (same lecturer, same day, overlapping periods)
3. IF a conflict is detected, THEN THE API SHALL return HTTP status code 409 with a descriptive error message
4. THE API SHALL allow the same room/lecturer at different times

### Requirement 9: Return Appropriate HTTP Status Codes

**User Story:** As a client application developer, I want the API to return appropriate HTTP status codes, so that I can handle different scenarios correctly.

#### Acceptance Criteria

1. WHEN a schedule is successfully created, THE API SHALL return HTTP status code 201
2. WHEN a request is successful, THE API SHALL return HTTP status code 200
3. WHEN a resource is not found, THE API SHALL return HTTP status code 404
4. WHEN validation fails, THE API SHALL return HTTP status code 400
5. WHEN a conflict is detected, THE API SHALL return HTTP status code 409
6. WHEN an unexpected server error occurs, THE API SHALL return HTTP status code 500
