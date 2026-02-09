const express = require('express');
const router = express.Router();
const gradesController = require('../controllers/gradesController');

router.post('/', gradesController.enterGrade);
router.post('/submit', gradesController.submitGradesForApproval);
router.get('/section/:sectionId', gradesController.getGradesBySection);
router.get('/students/:studentId', gradesController.getStudentGrades);

module.exports = router;
