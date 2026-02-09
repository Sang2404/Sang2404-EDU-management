const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

router.get('/overview', statisticsController.getOverview);
router.get('/students', statisticsController.getStudentStatistics);
router.get('/courses', statisticsController.getCourseStatistics);
router.get('/grades', statisticsController.getGradeStatistics);
router.get('/requests', statisticsController.getRequestStatistics);

module.exports = router;
