const express = require('express');
const router = express.Router();
const lecturersController = require('../controllers/lecturersController');

router.get('/:lecturerId/sections', lecturersController.getLecturerSections);
router.get('/:lecturerId/sections/:sectionId', lecturersController.getLecturerSectionDetails);
router.get('/:lecturerId/sections/:sectionId/grades', lecturersController.getSectionGrades);
router.post('/:lecturerId/sections/:sectionId/grades/submit', lecturersController.submitGrades);
router.get('/:lecturerId/statistics', lecturersController.getLecturerStatistics);

module.exports = router;
