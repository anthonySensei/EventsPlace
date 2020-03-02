const User = require('../models/user');
const Role = require('../models/role');
const roles = require('../enums/role.enum');

const jwt = require('jsonwebtoken');
const secret_key = require('../config/secret_key');

const uuidv4 = require('uuid/v4');

const bcrypt = require('bcryptjs');

const passport = require('passport');

const userStatus = require('../enums/user-status.enum');

const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const base64Img = require('base64-img');

const sessionDuration = 3600 * 12;

const lengthOfGeneratedPassword = 8;
const charsetOfGeneratedPassword = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: process.env.SEND_GRID_API_KEY
    }
}));

exports.postLoginUser = (req, res, next) => {
    passport.authenticate('local', function(err, user) {
        if (err) {
            return responseLogin(res, 401, false, err);
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
                        responseErrorMessage(res, 401, err);
                    }
                    const userJWT = {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    };
                    const token = jwt.sign(userJWT, secret_key, {
                        expiresIn: sessionDuration
                    });
                    jwt.verify(token, secret_key);
                    res.send({
                        responseCode: 200,
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
                return responseLogin(res, 401, false, err);
            });
        }
      })(req, res, next);
};

exports.getLogout = (req, res) => {

    req.logout();
    res.send({
        responseCod: 200,
        data: {
            loggedOut: true,
            message: 'Successfully logged out!'
        }
    });
};

exports.postCreateUser = (req, res, next) => {
    let creatingUserByAdmin = false;
    let email = req.body.email;


    let password;
    if (req.body.password) {
        password = req.body.password;
    } else {
        password = generatePassword();
        creatingUserByAdmin = true;
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
            const userPass = newUser.password;
            newUser.password = hash;
            const registrationToken = uuidv4();
            let status;
            if (creatingUserByAdmin) {
                status = userStatus.ACTIVATED
            } else {
                status = userStatus.NEW
            }
            User.create({
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                status: status,
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
                        let passwordMessage;
                        let loginLink;
                        let activationMessage;
                        if (creatingUserByAdmin) {
                            passwordMessage = `
                             <p style="text-decoration: none">Login: ${newUser.email}.</p>
                             <p>Password: ${userPass}.</p>
                             <p>Change password after login</p>`
                            loginLink =  `To login to your account follow the link below:
                            <br>
                            <a href="http://localhost:4200/login">
                                localhost:4200/login
                            </a>`;
                        } else {
                            activationMessage =`
                            To activate your account follow the link below:
                            <br>
                            <a href="http://localhost:4200/activation-page?rtoken=${registrationToken}">
                                localhost:4200/activation-page?rtoken=${registrationToken}
                            </a>`;
                        }
                        transporter.sendMail({
                            to: newUser.email,
                            from: process.env.EVENTS_PLACE_EMAIL_ADDRESS,
                            subject: 'Account activation',
                            html: `
                            Hello!
                            Your account was successfully created!
                            ${passwordMessage ? passwordMessage : ''}
                            ${activationMessage ? activationMessage : loginLink}
                            `
                        })
                            .then()
                            .catch(err => {
                                return responseCreateUser(res, 500, true, 'Email was not sent!');
                            });
                            return responseCreateUser(res, 200, true, 'User was successfully created!');
                    })
                    .catch(err => {
                        console.log(err)
                        return responseCreateUser(res, 500, false, 'Error occurred');
                    });
            }).catch(err => {
                return responseCreateUser(res, 500, false, 'Email address already in use');
            });
        });
    });

};

exports.postCheckRegistrationToken = (req, res, next) => {
    token = req.body.registrationToken;

    if (!token) {
        return responseActivateUser(res, 400, false, 'Token is required');
    }

    User
     .findOne({where: {registration_token: token}})
     .then(user => {
        user
         .update({
            status: userStatus.ACTIVATED,
            registration_token: ''
        })
         .then(result => {
            return responseActivateUser(res, 200, true, 'Account was successfully activated!');
         })
         .catch(err => {
            return responseActivateUser(res, 400, false, 'User with this token doesn\'t exist.');
         });
     })
     .catch(err => {
        return responseActivateUser(res, 400, false, 'Error occurred! Try again.');
     })
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

function responseActivateUser(response, responseCode, isActivated, message) {
    response.send({
        responseCode: responseCode,
        data: {
            isActivated: isActivated,
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