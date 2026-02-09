const express = require('express');
const router = express.Router();
const requestsController = require('../controllers/requestsController');

router.post('/', requestsController.createRequest);
router.get('/students/:studentId', requestsController.getStudentRequests);

module.exports = router;
