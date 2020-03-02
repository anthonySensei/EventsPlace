const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

router.post('/registration', authController.postCreateUser);

router.post('/check-registration-token', authController.postCheckRegistrationToken);

router.post('/login', authController.postLoginUser);

router.get('/logout', authController.getLogout);

module.exports = router;