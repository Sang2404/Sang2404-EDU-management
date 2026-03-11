const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/grades/pending', adminController.getPendingGrades);
router.post('/sections/:sectionId/grades/approve', adminController.approveGrades);
router.post('/sections/:sectionId/grades/reject', adminController.rejectGrades);
router.post('/grades/bulk-approve', adminController.bulkApproveGrades);
router.post('/grades/bulk-reject', adminController.bulkRejectGrades);

module.exports = router;

// Academic requests routes
router.get('/academic-requests/pending', adminController.getPendingRequests);
router.get('/academic-requests', adminController.getAllRequests);
router.post('/academic-requests/:requestId/approve', adminController.approveRequest);
router.post('/academic-requests/:requestId/reject', adminController.rejectRequest);

// Bulk import routes
router.post('/import/users', adminController.bulkImportUsers);
router.post('/import/subjects', adminController.bulkImportSubjects);
router.post('/import/course-sections', adminController.bulkImportCourseSections);
router.post('/import/schedules', adminController.bulkImportSchedules);
router.post('/import/faculties', adminController.bulkImportFaculties);
