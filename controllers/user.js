const User = require('../models/user');
const Role = require('../models/role');
const roles = require('../enums/role.enum');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const secret_key = require('../config/secret_key');

const uuidv4 = require('uuid/v4');

const base64Img = require('base64-img');

const passport = require('passport');

const userStatus = require('../enums/user-status.enum');

sessionDuration = 3600 * 12; //12 hours

lengthOfGeneratedPassword = 8;
charsetOfGeneratedPassword = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: process.env.SEND_GRID_API_KEY
    }
}));

exports.postCreateUser = (req, res, next) => {
    let email = req.body.email;
    if (email) {
        return;
    }
    let password;
    if (req.body.password) {
        password = req.body.password;
    } else {
        password = generatePassword();
    }
    if (!email || !password) {
        return responseCreateUser(res, 400, false, 'Please fill in fields');
    }
    let newUser = new User({
        email: email,
        password: password
    });
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            newUser.password = hash;
            const registrationToken = uuidv4();
            User.create({
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                status: userStatus.NEW,
                registration_token: registrationToken
            }).then(user => {
                let userRole;
                if (req.body.userRole) {
                    userRole = req.body.userRole;
                } else {
                    userRole = roles.USER;
                }
                Role.create({
                    id: user.dataValues.id,
                    role: userRole
                })
                    .then(result => {
                        console.log('User was successfully created!');
                        console.log(newUser.email);
                        transporter.sendMail({
                            to: newUser.email,
                            from: process.env.EVENTS_PLACE_EMAIL_ADDRESS,
                            subject: 'Account activation',
                            html: `
                            Hello!
                            Your account was successfully created!
                            To activate your account follow the link below:
                            <br>
                            <a href="http://localhost:4200/activation-page?rtoken=${registrationToken}">
                                localhost:4200/activation-page?rtoken=${registrationToken}
                            </a>
                            `
                        })
                            .then(result => {
                                console.log(result);
                                
                            })
                            .catch(err => {
                                console.log(err);
                            });
                            return responseCreateUser(res, 200, true, 'User was successfully created!');
                    })
                    .catch(err => {
                        console.log(err.errors[0].message);
                        return responseCreateUser(res, 400, false, err.errors[0].message);
                    });
            }).catch(err => {
                console.log(err.errors[0].message);
                return responseCreateUser(res, 400, false, err.errors[0].message);
            });
        });
    });

};

exports.postCheckRegistrationToken = (req, res, next) => {
    console.log(req.body);
    token = req.body.registrationToken;
    User
     .findOne({where: {registration_token: token}})
     .then(user => {
        user
         .update({
            status: userStatus.ACTIVATED,
            registration_token: ''
        })
         .then(result => {
            return res.send({
                responseCod: 400,
                data: {
                    isActivated: true,
                    message: 'Account was successfully activated!'
                }
            });
         })
         .catch(err => {
            console.log(err);
            return res.send({
               responseCod: 400,
               data: {
                   isActivated: false,
                   message: 'Error occurred! Try again.'
               }
           });
         });
     })
     .catch(err => {
         console.log(err);
         return res.send({
            responseCod: 400,
            data: {
                isActivated: false,
                message: 'Error occurred! Try again.'
            }
        });
     })
}

exports.postLoginUser = (req, res, next) => {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return responseLogin(res, 400, false, err);
        }
        if (!user) { 
            console.log('Bad credentials');
            return responseLogin(res, 401, false, 'Wrong password or login');
        } else {
            Role
            .findOne({where: {user_id: user.id}})
            .then(role => {
                profileImage = user.profile_image;
                if (profileImage) {
                    profileImage = base64Img.base64Sync(profileImage);
                } else {
                    profileImage = '';
                }
                const userData = {
                    id: user.id,
                    email: user.email,
                    profileImage: profileImage,
                    role: role.dataValues
                };

                req.login(user, {session: false}, (err) => {
                    if (err) {
                        responseErrorMessage(res, 400, err);
                    }
                    const userJWT = {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    };
                    const token = jwt.sign(userJWT, secret_key, {
                        expiresIn: sessionDuration
                    });
                    jwt.verify(token, secret_key, function (err, data) {
                        console.log(err, data);
                    });
                    //  console.log(token);
                    res.send({
                        responseCode: 400,
                        data: {
                            loggedIn: true,
                            message: 'User successfully logged in!',
                            user: userData,
                            token: 'Bearer ' + token,
                            tokenExpiresIn: sessionDuration
                        }
                    });
                });
            })
            .catch(err => {
                console.log(err);
                return responseLogin(res, 400, false, err);
            });
        }
        // createSendToken(req.user, res);
      })(req, res, next);
};

module.exports.getLogout = (req, res) => {
    console.log('Logging out');
    req.logout();
    res.send({
        responseCod: 400,
        data: {
            loggedOut: true,
            message: 'Successfully logged out!'
        }
    });
};

module.exports.getUser = (req, res) => {
    const email = req.query.email;
    console.log(req.headers);

    if (!email) {
        return responseErrorMessage(res, 400, 'Invalid email');
    }

    User
        .findOne({where: {email: email}})
        .then(user => {
            Role
                .findOne({where: {user_id: user.dataValues.id}})
                .then(role => {
                    if (user.dataValues.profile_image) {
                        user.dataValues.profile_image = base64Img.base64Sync(user.dataValues.profile_image);
                    } else {
                        user.dataValues.profile_image = '';
                    }
                    userData = {
                        id: user.dataValues.id,
                        name: user.dataValues.name,
                        email: user.dataValues.email,
                        profileImage: user.dataValues.profile_image,
                        role: role.dataValues
                    }
                    res.send({
                        responseCode: 400,
                        data: {
                            message: 'User was successfully fetched!',
                            user: userData
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                    return responseErrorMessage(res, 400, err);
                });
        })
        .catch(err => {
            console.log(err);
            return responseErrorMessage(res, 400, err);
        });
}

module.exports.postUpdateUserData = (req, res) => {
    console.log('Updating data');
    const userId = req.body.user.id;
    if (!userId) {
        console.log('Error');
        return responseErrorMessage(res, 400, 'Error')
    }
    User
        .findOne({where: {user_id: userId}})
        .then(user => {
            if (req.body.changeData.changePassword) {
                console.log('Changing password');
                const oldPassword = req.body.passwordObject.oldPassword;
                if (!oldPassword) {
                    console.log('Old password is empty');
                    return responseUpdateUserData(res, 400, false, 'Old password is empty');
                }
                if (bcrypt.compareSync(oldPassword, user.dataValues.password)) {
                    console.log('Match');
                    const newPassword = req.body.passwordObject.newPassword;
                    const retypeNewPassword = req.body.passwordObject.retypeNewPassword;
                    if (!newPassword || !retypeNewPassword) {
                        console.log('New password is empty')
                        return responseUpdateUserData(res, 400, false, 'Password is empty');
                    }
                    if (newPassword === retypeNewPassword) {
                        let newPassword = req.body.passwordObject.newPassword;
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newPassword, salt, (err, hash) => {
                                newPassword = hash;
                                if(!bcrypt.compareSync(oldPassword, newPassword)) {
                                    user.update({
                                        password: newPassword
                                    }).then(result => {
                                        console.log('Password was successfully changed!');
                                        return responseChangeUserPassword(res, 400, true, 'Password was successfully changed!');
                                    }).catch(err => {
                                        console.log('Password was not saved');
                                        return responseChangeUserPassword(res, 400, false, 'Password was not saved');
                                    });
                                } else {
                                    console.log('Old password equel to new password');
                                    return responseChangeUserPassword(res, 400, false, 'Password was not change. Old password equel to new password');
                                }
                            });
                        });
                    } else {
                        console.log('Passwords are different');
                        return responseChangeUserPassword(res, 400, false, 'Passwords are different!');
                    }
                } else {
                    console.log('Not match');
                    return responseChangeUserPassword(res, 400, false, 'Wrong old password!');
                }
            } else if (req.body.changeData.changeInfo) {
                const email = req.body.user.email;
                const name = req.body.user.name;
                if (!email || !name) {
                    return responseUpdateUserData(res, 400, false, 'Error');
                }
                user.update({
                    email: email,
                    name: name
                })
                    .then(result => {
                        return responseUpdateUserData(res, 400, true, 'Info successfully changed!');
                    })
                    .catch(err => {
                        return responseUpdateUserData(res, 400, false, err);
                    });
            }
        })
        .catch(err => {
            return responseUpdateUserData(res, 400, false, err);
        });
}

module.exports.postUpdateProfileImage = (req, res) => {
    const profileImageBase64 = req.body.base64;
    const user = JSON.parse(req.body.user);
    if (!profileImageBase64 || !user) {
        return responseUpdateUserData(res, 400, false, 'Error');
    }
    // console.log(user);
    const profileImagePath = base64Img.imgSync(profileImageBase64, '../images/profile', uuidv4());

    User
        .findOne({where: {user_id: user.id}})
        .then(user => {
            user
                .update({
                    profile_image: profileImagePath
                })
                .then(result => {
                    console.log('Profile image successfully changed!');
                    return responseUpdateProfileImage(res, 400, true, 'Profile image successfully changed!');
                })
                .catch(err => {
                    return responseUpdateProfileImage(res, 400, false, err.errors[0].message);
                });
        })
        .catch(err => {
            console.log(err.errors[0].message);
            return responseUpdateProfileImage(res, 400, false, err.errors[0].message);
        });

}

function generatePassword() {
    let length = lengthOfGeneratedPassword,
        charset = charsetOfGeneratedPassword,
        retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

function responseCreateUser(response, responseCode, isCreated, message) {
    response.send({
        responseCode: responseCode,
        data: {
            created: isCreated,
            message: message
        }
    });
}

function responseLogin(response, responseCode, isLoggedIn, message) {
    response.send({
        responseCode: responseCode,
        data: {
            created: isLoggedIn,
            message: message
        }
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

function responseUpdateProfileImage(response, responseCode, isUpdated, message) {
    response.send({
        responseCode: responseCode,
        data: {
            created: isUpdated,
            message: message
        }
    });
}

function responseUpdateUserData(response, responseCode, isUpdated, message) {
    response.send({
        responseCod: responseCode,
        data: {
            changedUserInfo: isUpdated,
            message: message
        }
    });
}

function responseChangeUserPassword(response, responseCode, isChanged, message) {
    response.send({
        responseCod: responseCode,
        data: {
            passwordChanged: isChanged,
            message: message
        }
    });
}
