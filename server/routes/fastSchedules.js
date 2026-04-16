const express = require('express');
const router = express.Router();
const FastScheduleController = require('../controllers/fastScheduleController');

// 🚀 Ultra-fast schedule routes
router.get('/', FastScheduleController.getSchedules);
router.post('/', FastScheduleController.createSchedule);
router.put('/:id', FastScheduleController.updateSchedule);
router.delete('/:id', FastScheduleController.deleteSchedule);

// Bulk operations
router.post('/bulk', FastScheduleController.bulkCreate);

// Statistics
router.get('/stats', FastScheduleController.getStats);

module.exports = router;