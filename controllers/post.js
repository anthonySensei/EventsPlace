const Post = require('../models/post');
const User = require('../models/user');
const Hashtag = require('../models/hashtag');


const uuidv4 = require('uuid/v4');

const base64Img = require('base64-img');

const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: process.env.SEND_GRID_API_KEY
    }
}));

const statuses = require('../enums/status.enum');

const ITEMS_PER_PAGE = 8;


exports.getAllPosts = (req, res) => {
    const status = req.query.status;
    const page = +req.query.page || 1;

    let condition = {status: status};


    if(status === 'all') {
        condition = {};
    }

    let totalPosts;

    Post
      .count({
        include: [{
            model: User
        },
        {
            model: Hashtag
        }],
        where: condition,
    })
      .then(function(postNumber) {
         totalPosts = postNumber;
         return Post.findAll({
            include: [{
                model: User
            },
            {
                model: Hashtag
            }],
            where: condition,
            limit: ITEMS_PER_PAGE,
            offset: (page-1) * ITEMS_PER_PAGE,
            order: [
                ['id', 'ASC']
            ]
         })
        })
        .then(result => {
            let posts = [];
            for(let post of result){
                post.dataValues.post_image = base64Img.base64Sync(post.dataValues.post_image);
                posts.push({
                    postId: post.dataValues.id,
                    postStatus: post.dataValues.status,
                    postImage: post.dataValues.post_image,
                    eventLocation: post.dataValues.event_location,
                    postUpdatedAt: post.dataValues.updatedAt,
                    hashtag: post.dataValues.hashtag_.dataValues
                });
            }

            posts.sort(compareObjectsById);
            res.send({
                responseCode: 500,
                data: {
                    posts: posts,
                    message: 'Posts was fetched successfully!',
                    paginationData: {
                        currentPage: page,
                        hasNextPage: ITEMS_PER_PAGE * page < totalPosts,
                        hasPreviousPage: page > 1,
                        nextPage: page + 1,
                        previousPage: page - 1,
                        lastPage: Math.ceil(totalPosts / ITEMS_PER_PAGE)
                    }
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

module.exports.getApprovedPosts = (req, res) => {
    const filter = req.query.filter;
    const value = req.query.value;
    const page = +req.query.page || 1;

    let condition = {status: 'approved'};;
    let userCondition = {};
    let hashtagCondition = {};

    let totalPosts;

    if (filter === 'all') {
        condition = {status: 'approved'};
    } else if (filter === 'location'){
        condition = {
            status: 'approved',
            event_location: value
        };
    } else if (filter === 'username') {
        userCondition = {
            name: value
        }
    } else if (filter === 'email') {
        userCondition = {
            email: value
        }
    } else if (filter === 'hashtag') {
        hashtagCondition = {
            name: value
        }
    }

    Post
      .count({
        include: [{
            model: User,
            where: userCondition
        },
        {
            model: Hashtag,
            where: hashtagCondition
        }],
        where: condition
    })
      .then(function(postNumber) {
          totalPosts = postNumber;
         return Post.findAll({
            include: [{
                model: User,
                where: userCondition
            },
            {
                model: Hashtag
            }],
            where: condition,
            limit: ITEMS_PER_PAGE,
            offset: (page - 1) * ITEMS_PER_PAGE,
            order: [
                ['id', 'ASC']
            ]
        })
      })
        .then(result => {
        let posts = [];
        for(let post of result){
            post.dataValues.post_image = base64Img.base64Sync(post.dataValues.post_image);
            posts.push({
                postId: post.dataValues.id,
                postStatus: post.dataValues.status,
                postImage: post.dataValues.post_image,
                eventLocation: post.dataValues.event_location,
                postUpdatedAt: post.dataValues.updatedAt,
                hashtag: post.dataValues.hashtag_.dataValues
            });
        }

        posts.sort(compareObjectsById);
        return res.send({
            responseCode: 500,
            data: {
                posts: posts,
                message: 'Posts was fetched successfully!',
                paginationData: {
                    currentPage: page,
                    hasNextPage: ITEMS_PER_PAGE * page < totalPosts,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(totalPosts / ITEMS_PER_PAGE)
                }
            }
        });
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

module.exports.getPost = (req, res) => {
    postId = req.query.postId;
    console.log(postId);
    Post
     .findOne({ where: { id: postId }})
     .then(post => {
        User
         .findOne({ where: { id: post.dataValues.userId}})
         .then(user => {
            userData = {
                name: user.dataValues.name,
                email: user.dataValues.email
            };
            Hashtag.findOne({ where: { id: post.dataValues.hashtagId }})
                .then(hashtag => {
                    post.dataValues.post_image = base64Img.base64Sync(post.dataValues.post_image);
                    hashtagData = {
                        name: hashtag.dataValues.name
                    }
                    postData = {
                        postId: post.dataValues.id,
                        postStatus: post.dataValues.status,
                        postImage: post.dataValues.post_image,
                        description: post.dataValues.description,
                        eventName: post.dataValues.event_name,
                        eventLocation: post.dataValues.event_location,
                        postCreatedAt: post.dataValues.createdAt,
                        postUpdatedAt: post.dataValues.updatedAt,
                        user: userData,
                        hashtag: hashtagData
                    };
                    console.log('Post was fetched successfully!');
                    res.send({
                        responseCode: 500,
                        data: {
                            post: postData,
                            message: 'Post was fetched successfully!'
                        }
                    });
                })
                .catch(err => {
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
            return res.send({
                responseCode: 500,
                data: {
                    message: 'Error! ' + err.errors[0].message
                }
            });
        });
     })
    .catch(err => {
        console.log(err);
        return res.send({
            responseCode: 500,
            data: {
                message: 'Error! ' + err
            }
        });
    });

}


module.exports.createPost = (req, res) => {
    const imageBase64 = req.body.base64;
    postData = JSON.parse(req.body.post_data);
    const filepath = base64Img.imgSync(imageBase64, '../images/', uuidv4());

    let newPost = new Post({
        description: postData.description,
        status: statuses.UNCONFIRMED,
        post_image: filepath,
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

module.exports.updatePost = (req, res) => {
    const imageBase64 = req.body.base64;
    postData = JSON.parse(req.body.post_data);
    const postId = postData.id;
    const filepath = base64Img.imgSync(imageBase64, '../images/', uuidv4());

    Post
      .findOne({ where: { id: postId } })
      .then(post => {
          post
            .update({
                description: postData.description,
                status: statuses.UNCONFIRMED,
                post_image: filepath,
                event_name: postData.eventName,
                event_location: postData.eventLocation,
                userId: postData.user.id,
                hashtagId: postData.hashtag.hashtagId
            })
            .then(post => {
                console.log('Created');
                res.send({
                    responseCode: 500,
                    data: {
                        postUpdated: true,
                        message: 'Post was updated successfully!'
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
        //        from: process.env.EVENTS_PLACE_EMAIL_ADDRESS,
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
