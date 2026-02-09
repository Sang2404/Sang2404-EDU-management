# Implementation Plan: Lecturer Sections

## Tasks

- [ ] 1. Create lecturers controller
  - [ ] 1.1 Create `server/controllers/lecturersController.js`
    - Import pool and helper functions
    - _Requirements: All_

- [ ] 2. Implement Get Lecturer's Sections
  - [ ] 2.1 Create `getLecturerSections` function
    - Extract lecturer_id from params
    - Extract semester and academic_year from query
    - Query sections with enrolled count
    - For each section, fetch schedules
    - Add day names to schedules
    - Return array of sections with schedules
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ] 2.2 Add GET route in lecturers router
    - Create `server/routes/lecturers.js`
    - Add `router.get('/:lecturerId/sections', lecturersController.getLecturerSections);`
    - _Requirements: 1.1_

- [ ] 3. Implement Get Lecturer's Section Details
  - [ ] 3.1 Create `getLecturerSectionDetails` function
    - Extract lecturer_id and section_id from params
    - Query section details
    - Verify lecturer is assigned to section (403 if not)
    - Fetch enrolled students
    - Fetch schedules with day names
    - Return complete section details
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ] 3.2 Add GET route
    - Add `router.get('/:lecturerId/sections/:sectionId', lecturersController.getLecturerSectionDetails);`
    - _Requirements: 2.1_

- [ ] 4. Implement Get Lecturer Statistics
  - [ ] 4.1 Create `getLecturerStatistics` function
    - Extract lecturer_id from params
    - Extract semester and academic_year from query
    - Query total sections, total students, average class size
    - Query sections grouped by subject
    - Get lecturer name
    - Return statistics object
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ] 4.2 Add GET route
    - Add `router.get('/:lecturerId/statistics', lecturersController.getLecturerStatistics);`
    - _Requirements: 3.1_

- [ ] 5. Register lecturers routes in server.js
  - [ ] 5.1 Import and register routes
    - Add `const lecturersRoutes = require('./routes/lecturers');`
    - Add `app.use('/api/lecturers', lecturersRoutes);`

- [ ] 6. Testing
  - [ ] 6.1 Create test script
    - Test get lecturer's sections (no filter)
    - Test get lecturer's sections (with filters)
    - Test get section details (success)
    - Test get section details (not assigned - 403)
    - Test get section details (not found - 404)
    - Test get lecturer statistics

## Notes

- Reuse getDayName helper from academicController
- Consider caching for frequently accessed data
- Authorization middleware should be added in future
- Statistics queries may be expensive for lecturers with many sections
