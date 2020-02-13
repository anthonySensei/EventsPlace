const express = require('express');
const router = express.Router();

const postController = require('../controllers/post');

router.get('/posts', postController.getAllPosts);

router.post('/create-post', postController.createPost);

router.post('/set-status', postController.setPostStatus);



module.exports = router;