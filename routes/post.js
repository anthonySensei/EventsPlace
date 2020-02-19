const express = require('express');
const router = express.Router();

const postController = require('../controllers/post');

router.get('/posts', postController.getAllPosts);

router.get('/post-details', postController.getPost);

router.post('/create-post', postController.createPost);

router.post('/set-status', postController.setPostStatus);



module.exports = router;