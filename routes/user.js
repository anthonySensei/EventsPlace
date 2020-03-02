const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');

const passport = require('passport');

router.get('/my-account', passport.authenticate('jwt', {session: false}), userController.getUser);

router.post('/my-account', passport.authenticate('jwt', {session: false}), userController.postUpdateUserData);

router.post('/my-account/update-profile-image', passport.authenticate('jwt', {session: false}), userController.postUpdateProfileImage);

module.exports = router;
