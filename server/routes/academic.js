const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');

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

module.exports = router;
