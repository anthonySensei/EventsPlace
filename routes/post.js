const express = require('express');
const router = express.Router();

const passport = require('passport');

const postController = require('../controllers/post');

router.get('/posts', postController.getApprovedPosts);

router.get('/posts-managing', postController.getAllPosts);

router.get('/post-details', postController.getPost);

router.post('/create-post', passport.authenticate('jwt', {session: false}), postController.createPost);

router.put('/update-post', passport.authenticate('jwt', {session: false}), postController.updatePost);

router.post('/set-status', passport.authenticate('jwt', {session: false}), postController.setPostStatus);

router.get('/hashtags', passport.authenticate('jwt', {session: false}), postController.getHashtag);



module.exports = router;