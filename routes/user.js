const express = require('express');
const router = express.Router();

const User = require('../models/user');
const userController = require('../controllers/user');


const passport = require('passport');

router.post('/registration', userController.postCreateUser);

router.post('/login', userController.postLoginUser);

router.get('/logout', userController.getLogout);

router.get('/my-account', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.send('My account');
});

router.post('/my-account', userController.postUpdateUserData);

router.post('/my-account/update-profile-image', userController.postUpdateProfileImage);

module.exports = router;
