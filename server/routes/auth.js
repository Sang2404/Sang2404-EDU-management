const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMobile = require('../middleware/authMobile');

router.post('/login', authController.login);
router.post('/login-mobile', authController.loginMobile);
router.get('/verify', authMobile, authController.verifyToken);

module.exports = router;
