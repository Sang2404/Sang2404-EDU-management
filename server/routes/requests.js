const express = require('express');
const router = express.Router();
const requestsController = require('../controllers/requestsController');
const authMobile = require('../middleware/authMobile');

// Mobile app routes
router.get('/', authMobile, requestsController.getStudentRequestsMobile);
router.post('/', authMobile, requestsController.createRequestMobile);

// Admin routes
router.get('/students/:studentId', requestsController.getStudentRequests);

module.exports = router;
