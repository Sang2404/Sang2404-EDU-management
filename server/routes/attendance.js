const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Create attendance record
router.post('/', attendanceController.createAttendance);

// Get attendance for a section
router.get('/section/:sectionId', attendanceController.getSectionAttendance);

// Get attendance for a specific student in a section
router.get('/section/:sectionId/student/:studentId', attendanceController.getStudentAttendance);

// Get attendance summary for a section
router.get('/section/:sectionId/summary', attendanceController.getAttendanceSummary);

// Update attendance record
router.put('/:attendanceId', attendanceController.updateAttendance);

// Delete attendance record
router.delete('/:attendanceId', attendanceController.deleteAttendance);

// Bulk create/update attendance
router.post('/bulk/update', attendanceController.bulkUpdateAttendance);

module.exports = router;
