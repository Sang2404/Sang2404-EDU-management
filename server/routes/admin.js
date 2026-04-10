const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Grade management routes
router.get('/grades/pending', adminController.getPendingGrades);
router.get('/sections/:sectionId/grades/status', adminController.checkGradeStatus);
router.post('/sections/:sectionId/grades/approve', adminController.approveGrades);
router.post('/sections/:sectionId/grades/reject', adminController.rejectGrades);
router.post('/grades/bulk-approve', adminController.bulkApproveGrades);
router.post('/grades/bulk-reject', adminController.bulkRejectGrades);

// Academic requests routes
router.get('/academic-requests/pending', adminController.getPendingRequests);
router.get('/academic-requests', adminController.getAllRequests);
router.post('/academic-requests/:requestId/approve', adminController.approveRequest);
router.post('/academic-requests/:requestId/reject', adminController.rejectRequest);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// Bulk import routes
router.post('/import/users', adminController.bulkImportUsers);
router.post('/import/subjects', adminController.bulkImportSubjects);
router.post('/import/course-sections', adminController.bulkImportCourseSections);
router.post('/import/faculties', adminController.bulkImportFaculties);

module.exports = router;
