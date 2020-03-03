const Post = require('../models/post');
const User = require('../models/user');
const Hashtag = require('../models/hashtag');


const uuidv4 = require('uuid/v4');

const base64Img = require('base64-img');

const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

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

    let date = new Date();

    if (!status) {
        return responseErrorMessage(res, 400, 'Error! Status was not defined');
    }

    let condition = {
        status: status,
        event_time: {
            [Op.gte]: date
        }
    };

    if(status === 'all') {
        condition = {
                status: {
                    [Op.ne]: 'deleted'
                },
                event_time: {
                    [Op.gte]: date
                }
        };
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
      .then(postNumber => {
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
                ['event_time', 'ASC']
            ]
         })
        })
        .then(result => {
            let posts = [];

            for(let post of result){
                const user = {
                    email: post.dataValues.user_.dataValues.email
                }
                post.dataValues.post_image = base64Img.base64Sync(post.dataValues.post_image);
                posts.push({
                    postId: post.dataValues.id,
                    eventName: post.dataValues.event_name,
                    postStatus: post.dataValues.status,
                    postImage: post.dataValues.post_image,
                    eventLocation: post.dataValues.event_location,
                    eventTime: post.dataValues.event_time,
                    postUpdatedAt: post.dataValues.updatedAt,
                    user: user,
                    hashtag: post.dataValues.hashtag_.dataValues
                });
            }
            res.send({
                responseCode: 200,
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
                    },
                    status: status
                }
            })
        })
        .catch(err => {
            console.log(err);
            return responseErrorMessage(res, 500, 'Error. Cannot fetch posts!');
        });
}

exports.getApprovedPosts = (req, res) => {
    const filter = req.query.filter;
    const value = req.query.value;
    const page = +req.query.page || 1;
    const fromDate = req.query.fDate;
    const toDate = req.query.tDate;

    let date = new Date();

    let condition = {
        status: 'approved',
        event_time: {
            [Op.gte]: date
        }
    };

    let userCondition = {};
    let hashtagCondition = {};

    let totalPosts;

    if (filter === 'all') {

        condition = {
            status: 'approved',
            event_time: {
                [Op.gte]: date
            }
        };

    } else if (filter === 'location'){

        condition = {
            status: 'approved',
            event_location: {
                [Op.iLike]: `%${value}%`
            },
            event_time: {
                [Op.gte]: date
            }
        };

    } else if (filter === 'username') {

        userCondition = {
            name: {
                [Op.iLike]: `%${value}%`
            }
        }

    } else if (filter === 'email') {

        userCondition = {
            email: {
                [Op.iLike]: `%${value}%`
            }
        }

    } else if (filter === 'hashtag') {
        hashtagCondition = {
            name: {
                [Op.iLike]: `%${value}%`
            }
        }
    }

    if(fromDate && toDate){

        condition.event_time = {
            [Op.between]: [fromDate, toDate]
        }

    }
    else if (fromDate) {

        condition.event_time = {
            [Op.gte]: fromDate
        }

    } else if(toDate) (

        condition.event_time = {
            [Op.lte]: toDate
        }

    )

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
      .then(postNumber => {
         totalPosts = postNumber;
         return Post.findAll({
            include: [{
                model: User,
                where: userCondition
            },
            {
                model: Hashtag,
                where: hashtagCondition
            }],
            where: condition,
            limit: ITEMS_PER_PAGE,
            offset: (page - 1) * ITEMS_PER_PAGE,
            order: [
                ['event_time', 'ASC']
            ]
        })
      })
        .then(result => {
        let posts = [];
        for(let post of result){
            const user = {
                email: post.dataValues.user_.dataValues.email
            }
            post.dataValues.post_image = base64Img.base64Sync(post.dataValues.post_image);
            posts.push({
                postId: post.dataValues.id,
                eventName: post.dataValues.event_name,
                postStatus: post.dataValues.status,
                postImage: post.dataValues.post_image,
                eventLocation: post.dataValues.event_location,
                eventTime: post.dataValues.event_time,
                postUpdatedAt: post.dataValues.updatedAt,
                user: user,
                hashtag: post.dataValues.hashtag_.dataValues
            });
        }

        return res.send({
            responseCode: 200,
            data: {
                posts: posts,
                message: 'Posts was fetched successfully!',
                filterData: {
                    filter: filter,
                    value: value
                },  
                date: {
                    fromDate: fromDate,
                    toDate: toDate
                },
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
        return responseErrorMessage(res, 400, 'Error. Cannot fetch posts!');
    });
}

exports.getPost = (req, res) => {
    const postId = req.query.postId;
    const userRole = req.query.userRole;
    let condition = { id: postId };

    if (!postId) {
        return responseErrorMessage(res, 400, 'Error occurred!');
    }

    Post
     .findOne({ where: condition})
     .then(post => {

        if(!post) {
            return responseErrorMessage(res, 400, 'Error occurred!');
        }

        if ((userRole === 'user' || !userRole) && post.dataValues.status !== 'approved') {
            return responseErrorMessage(res, 400, 'Error occurred!');
        }

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
                        eventTime: post.dataValues.event_time,
                        postCreatedAt: post.dataValues.createdAt,
                        postUpdatedAt: post.dataValues.updatedAt,
                        user: userData,
                        hashtag: hashtagData
                    };

                    return res.send({
                        responseCode: 200,
                        data: {
                            post: postData,
                            message: 'Post was fetched successfully!'
                        }
                    });
                })
                .catch(err => {
                    return responseErrorMessage(res, 500, 'Error occurred');
                })
         }) 
         .catch(err => {
            return responseErrorMessage(res, 500, 'Error occurred');
        });
     })
    .catch(err => {
        return responseErrorMessage(res, 500, 'Error occurred');
    });

}


exports.createPost = (req, res) => {
    const imageBase64 = req.body.base64;
    if(!imageBase64) {
        return responseErrorMessage(res, 400, 'Image is required');
    }

    postData = JSON.parse(req.body.post_data);

    if(!postData) {
        return responseErrorMessage(res, 400, 'Fields are required');
    }

    const filepath = base64Img.imgSync(imageBase64, '../images/', uuidv4());

    if (postData.user.role.role === 'admin') {
        status = statuses.APPROVED
    } else { 
        status = statuses.UNCONFIRMED;
    }

    let newPost = new Post({
        description: postData.description,
        status: status,
        post_image: filepath,
        event_name: postData.eventName,
        event_location: postData.eventLocation,
        event_time: postData.eventTime,
        userId: postData.user.id,
        hashtagId: postData.hashtag.hashtagId
    });

    newPost
    .save()
    .then(post => {
        res.send({
            responseCode: 200,
            data: {
                postCreated: true,
                message: 'Post was created successfully!'
            }
        });
    })
    .catch((err) => {
        return responseErrorMessage(res, 500, 'Error occurred');
    });   
}

exports.getHashtag = (req, res) => {
    Hashtag
        .findAll({
            where: { 
                id: {
                   [Op.notIn]:[1]
                }
            },
            order: [
                ['name', 'ASC']
            ],
        })
        .then(result => {
            const hashtags = [];
            for (hashtag of result) {
                hashtags.push({
                    hashtagId: hashtag.dataValues.id,
                    name: hashtag.dataValues.name
                });
            }
            return res.send({
                responseCode: 200,
                data: {
                    hashtags: hashtags,
                    message: 'Hashtags was fetched successfully!'
                }
            });
        })
        .catch(err => {
            return responseErrorMessage(res, 500, 'Error occurred');
        });
}

exports.updatePost = (req, res) => {
    const imageBase64 = req.body.base64;
    let updateObj;
    const postData = JSON.parse(req.body.post_data);
    const postId = postData.id;
    let status;

    if (postData.user.role.role === 'admin') {
        status = statuses.APPROVED
    } else { 
        status = statuses.UNCONFIRMED;
    }

    if (!postData || !postId) {
        return responseErrorMessage(res, 400, 'Field are required!');
    }

    if (imageBase64) {
        const filePath = base64Img.imgSync(imageBase64, '../images/', uuidv4());
        updateObj = {
            description: postData.description,
            status: status,
            post_image: filePath,
            event_name: postData.eventName,
            event_location: postData.eventLocation, 
            userId: postData.user.id,
            hashtagId: postData.hashtag.hashtagId
        }
    } else {
        updateObj = {
            description: postData.description,
            status: status,
            event_name: postData.eventName,
            event_location: postData.eventLocation,
            userId: postData.user.id,
            hashtagId: postData.hashtag.hashtagId
        }
    }

    Post
      .findOne({ where: { id: postId } })
      .then(post => {
          post
            .update(updateObj)
            .then(post => {
                res.send({
                    responseCode: 200,
                    data: {
                        postUpdated: true,
                        message: 'Post was updated successfully!'
                    }
                });
            })
            .catch(err => {
                return responseErrorMessage(res, 400, 'Error occurred!');
            });   
      })
      .catch(err => {
        return responseErrorMessage(res, 400, 'Error occurred!');
      }); 
}

exports.setPostStatus = (req, res) => {
    const postId = req.body.postId;
    const newPostStatus = req.body.postStatus;
    const userEmail = req.body.user.email;
    let reason = req.body.reason || 'Bad content';

    if (!postId || !newPostStatus || !userEmail || !reason) {
        console.log(error);
        return responseErrorMessage(res, 400, 'Error occurred!');
    }

    Post
     .findOne({ where: { id: postId } })
     .then(post => {
         post.update({
             status: newPostStatus
         })
         .then(result => {
            res.send({
               responseCode: 200,
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

           transporter.sendMail({
               to: userEmail,
               from: process.env.EVENTS_PLACE_EMAIL_ADDRESS,
               subject: 'Post decision',
               html: `Hello! Your post was ${newPostStatus}. ${reason}`
           })
           .then()
           .catch(err => {
               console.log(err);
                return responseErrorMessage(res, 500, 'Email was not sent!');
           });
         })
         .catch(err => {
            console.log(err);
            return responseErrorMessage(res, 500, 'Error occurred!');
         })
     })
     .catch(err => {
        console.log(err);
        return responseErrorMessage(res, 500, 'Error occurred!');
     });
}

function responseErrorMessage(response, responseCode, message) {
    response.send({
        responseCode: responseCode,
        data: {
            message: message
        }
    });
}

