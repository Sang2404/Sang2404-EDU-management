const express = require('express');
const router = express.Router();
const gradesController = require('../controllers/gradesController');
const authMobile = require('../middleware/authMobile');

// Add logging middleware
router.use((req, res, next) => {
  console.log('DEBUG: Grades route accessed:', req.method, req.path, req.body);
  next();
});

router.post('/', gradesController.enterGrade);
router.post('/submit', gradesController.submitGradesForApproval);
router.get('/section/:sectionId', gradesController.getGradesBySection);
router.get('/students/:studentId', gradesController.getStudentGrades);

// Mobile app route
router.get('/student', authMobile, gradesController.getStudentGradesMobile);

module.exports = router;
