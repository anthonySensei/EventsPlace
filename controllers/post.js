const Post = require('../models/post');
const User = require('../models/user');
const Hashtag = require('../models/hashtag');

const statuses = require('../enums/status.enum');

exports.getAllPosts = (req, res) => {
    Post
        .findAll({
            include: [{
                model: User
            },
            {
                model: Hashtag
            }]
        })
        .then(result => {
            let posts = [];
            console.log(posts);
            for(let post of result){
                posts.push({
                    postId: post.dataValues.id,
                    description: post.dataValues.description,
                    postStatus: post.dataValues.status,
                    postImage: post.dataValues.post_image,
                    eventLocation: post.dataValues.event_location,
                    eventName: post.dataValues.event_name,
                    postCreatedAt: post.dataValues.createdAt,
                    postUpdatedAt: post.dataValues.updatedAt,
                    user: post.dataValues.user_.dataValues,
                    hashtag: post.dataValues.hashtag_.dataValues
                });
            }
            posts.sort(compareObjectsById);
            res.send({
                responseCode: 500,
                data: {
                    posts: posts,
                    message: 'Posts was fetched successfully!'
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.send({
                responseCode: 500,
                data: {
                    posts: [],
                    message: 'Error. Cannot fetch message!'
                }
            })
        });
}

module.exports.createPost = (req, res) => {
    let newPost = new Post({
        description: req.body.description,
        status: statuses.UNCONFIRMED,
        post_image: req.body.postImage,
        event_name: req.body.eventName,
        event_location: req.body.eventLocation,
        userId: req.body.user.id,
        hashtagId: req.body.hashtag.hashtagId
    });

    newPost
    .save()
    .then(post => {
        console.log('Created');
        res.send({
            responseCode: 500,
            data: {
                postCreated: true,
                message: 'Post was created successfully!'
            }
        });
    })
    .catch((err) => {
        console.log(err.errors[0].message);
        res.send({
            responseCode: 500,
            data: {
                message: 'Error! ' + err.errors[0].message
            }
        });
    });   
}

exports.setPostStatus = (req, res) => {
    console.log(req.body);
    const postId = req.body.postId;
    const newPostStatus = req.body.postStatus;
    Post
     .findOne({ where: { id: postId } })
     .then(post => {
         post.update({
             status: newPostStatus
         })
         .then(result => {
             console.log('Post status was set successfully');
             res.send({
                responseCode: 500,
                data: {
                    postUpdated: true,
                    message: 'Post status was set successfully'
                }
            });
         })
         .catch(err => {
             console.log(err.errors[0].message);
             res.send({
                responseCode: 500,
                data: {
                    message: 'Error! ' + err.errors[0].message
                }
            });
         })
     })
     .catch(err => {
         console.log(err.errors[0].message);
         res.send({
            responseCode: 500,
            data: {
                message: 'Error! ' + err.errors[0].message
            }
        });
     });
}

function compareObjectsById(a, b) {
    // Use toUpperCase() to ignore character casing
    const idA = a.postId;
    const idB = b.postId;
  
    let comparison = 0;
    if (idA > idB) {
      comparison = 1;
    } else if (idA < idB) {
      comparison = -1;
    }
    return comparison;
  }
