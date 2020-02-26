const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');

const passport = require('passport');

router.post('/registration', userController.postCreateUser);

router.post('/check-registration-token', userController.postCheckRegistrationToken);

router.post('/login', userController.postLoginUser);

router.get('/logout', userController.getLogout);

router.get('/my-account', passport.authenticate('jwt', {session: false}), userController.getUser);

router.post('/my-account', passport.authenticate('jwt', {session: false}), userController.postUpdateUserData);

router.post('/my-account/update-profile-image', passport.authenticate('jwt', {session: false}), userController.postUpdateProfileImage);

module.exports = router;
