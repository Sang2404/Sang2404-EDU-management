const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// TODO: Add middleware to check if requester is ADMIN

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);

module.exports = router;
