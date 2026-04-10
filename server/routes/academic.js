const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const authMobile = require('../middleware/authMobile');

// Admin routes (existing)
router.get('/faculties', academicController.getAllFaculties);
router.post('/faculties', academicController.createFaculty);
router.put('/faculties/:id', academicController.updateFaculty);
router.delete('/faculties/:id', academicController.deleteFaculty);

router.get('/faculties/:facultyId/majors', academicController.getMajorsByFaculty);
router.post('/majors', academicController.createMajor);
router.put('/majors/:id', academicController.updateMajor);
router.delete('/majors/:id', academicController.deleteMajor);

router.get('/subjects', academicController.getAllSubjects);
router.post('/subjects', academicController.createSubject);
router.put('/subjects/:id', academicController.updateSubject);
router.delete('/subjects/:id', academicController.deleteSubject);

router.get('/course-sections', academicController.getAllCourseSections);
router.get('/course-sections/:id', academicController.getCourseSectionById);
router.post('/course-sections', academicController.createCourseSection);
router.put('/course-sections/:id', academicController.updateCourseSection);
router.delete('/course-sections/:id', academicController.deleteCourseSection);

router.get('/course-sections/:sectionId/students-with-grades', academicController.getStudentsWithGrades);
router.get('/course-sections/:sectionId/students', academicController.getStudentsInSection);
router.post('/course-sections/:sectionId/students', academicController.addStudentToSection);
router.post('/course-sections/:sectionId/students/bulk', academicController.bulkAddStudentsToSection);
router.delete('/course-sections/:sectionId/students/:studentId', academicController.removeStudentFromSection);

router.get('/students/:studentId/sections', academicController.getSectionsForStudent);

// Mobile app routes (protected with JWT)
router.get('/student-schedule', authMobile, academicController.getStudentSchedule);
router.get('/student-courses', authMobile, academicController.getStudentCourses);
router.get('/student-sections', authMobile, academicController.getStudentSections);

module.exports = router;
