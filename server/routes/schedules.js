const express = require('express');
const router = express.Router();
const schedulesController = require('../controllers/schedulesController');

router.get('/student/:studentId', schedulesController.getStudentSchedule);
router.get('/lecturer/:lecturerId', schedulesController.getLecturerSchedule);

module.exports = router;
