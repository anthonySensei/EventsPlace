const Post = require('../models/post');
const User = require('../models/user');
const Hashtag = require('../models/hashtag');

const base64Img = require('base64-img');

const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: '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'
    }
}));

const statuses = require('../enums/status.enum');


exports.getAllPosts = (req, res) => {
    Post
        .findAll({
            include: [{
                model: User
            },
            {
                model: Hashtag
            }],
        })
        .then(result => {
            let posts = [];
            console.log(posts);
            for(let post of result){
                post.dataValues.post_image = base64Img.base64Sync(post.dataValues.post_image);
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

            //*Important

            // base64 = posts[0].postImage;
            // const filepath = base64Img.imgSync(base64, '../images/', 'hello');
            // console.log('Filepath: ' + filepath);

            //*

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
    const image = req.file;
    if (!image) {
        res.send({
            responseCode: 500,
            data: {
                postCreated: false,
                message: 'Incorrect type of file.'
            }
        });
    }

    console.log(image);
    const imagePath = image.path;
    postData = JSON.parse(req.body.post_data);

    





    let newPost = new Post({
        description: postData.description,
        status: statuses.UNCONFIRMED,
        post_image:image.path,
        event_name: postData.eventName,
        event_location: postData.eventLocation,
        userId: postData.user.id,
        hashtagId: postData.hashtag.hashtagId
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
    const postId = req.body.postId;
    const newPostStatus = req.body.postStatus;
    const userEmail = req.body.user.email;
    let reason = req.body.reason;
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
           if (!reason) {
               reason = 'Thanks for your post!';
           } else {
               reason = 'Reason: ' + reason;
           }
        //    transporter.sendMail({
        //        to: userEmail,
        //        from: 'noreply@eventsplace.com',
        //        subject: 'Post decision',
        //        html: `Hello! Your post was ${newPostStatus}. ${reason}`
        //    })
        //    .then(result => {
        //        console.log(result);
        //    })
        //    .catch(err => {
        //        console.log(err);
        //    });
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
