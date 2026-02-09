const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/grades/pending', adminController.getPendingGrades);
router.post('/sections/:sectionId/grades/approve', adminController.approveGrades);
router.post('/sections/:sectionId/grades/reject', adminController.rejectGrades);

module.exports = router;

// Academic requests routes
router.get('/academic-requests/pending', adminController.getPendingRequests);
router.get('/academic-requests', adminController.getAllRequests);
router.post('/academic-requests/:requestId/approve', adminController.approveRequest);
router.post('/academic-requests/:requestId/reject', adminController.rejectRequest);
