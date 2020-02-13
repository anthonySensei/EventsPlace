const User = require('../models/user');
const Role = require('../models/role');
const roles = require('../enums/role.enum');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret_key = require('../config/secret_key');




exports.postCreateUser =  (req, res, next) => {
    console.log('Registration!');
    let newUser = new User({
        email: req.body.email,
        password: req.body.password
    });
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            newUser.password = hash;
            User.create({
                name: newUser.name,
                email: newUser.email,
                password: newUser.password
            }).then(user => {
                Role.create({
                  id: user.dataValues.id,
                  role: roles.USER
                })
                .then(result => {
                    console.log('User was successfully created!');
                    res.send({
                        responseCod: 200,
                        data: {
                             created: true,
                             message: 'User was successfully created!'
                        }
                    });
                })
                .catch(err => {
                    console.log(err.errors[0].message);
                    res.send({
                        responseCod: 400,
                        data: {
                             created: false,
                             message: err.errors[0].message
                        }
                    });
                });
            }).catch(err => {
                console.log(err.errors[0].message);
                res.send({
                    responseCod: 400,
                    data: {
                         created: false,
                         message: err.errors[0].message
                    }
                });
            });
        });
    });

};

exports.postLoginUser = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User
    .findOne({where: {email: email}})
    .then(user => {
        if (!user) {
            console.log('Bad credentials');
            res.send({              
                responseCode: 400,
                data: {
                     loggedIn: false,
                     message: 'Bad credentials'
                }});            
        } else {
            console.log('User was found');
            if(bcrypt.compareSync(password, user.dataValues.password)){
                console.log('Match');
                jwt.sign(user.toJSON(), secret_key, {
                    expiresIn: 3600 * 12
                });
                Role
                 .findOne({ where: {user_id : user.dataValues.id} })
                 .then(role => {
                    user.dataValues.role = role.dataValues; 
                    res.send({
                        responseCode: 400,
                        data: {
                             loggedIn: true,
                             message: 'User successfully logged in!',
                             user: user.dataValues
                        }
                    }); 
                 })
                 .catch(err => {
                    console.log(err.errors[0].message);
                    return res.send({
                        responseCod: 400,
                        data: {
                             loggedIn: false,
                             message: err.errors[0].message
                        }
                    });
                 });
            }else{
                console.log('Not match');
                return res.send({
                    responseCod: 400,
                    data: {
                         loggedIn: false,
                         message: 'Bad credentials!'
                    }
                });
            }
        }
    })
    .catch(err => {
        console.log(err);
    });
};

module.exports.getLogout = (req, res) => {
    console.log('Logging out');
    req.logout();
    res.send({                    
        responseCod: 400,
        data: {
             loggedOut: true,
             message: 'Successfully logged out!'
        }});
};

module.exports.postUpdateUserData = (req, res) => {
    console.log('Updating data');
    User
    .findOne({ where: { user_id: req.body.user.id }})
    .then(user => {
        if(req.body.changeData.changePassword) {
            console.log('Changing password');
            if(bcrypt.compareSync(req.body.passwordObject.oldPassword, user.dataValues.password)){
                console.log('Match');
                if (req.body.passwordObject.newPassword === req.body.passwordObject.retypeNewPassword) {
                    let newPassword = req.body.passwordObject.newPassword;
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newPassword, salt, (err, hash) => {
                            newPassword = hash;
                            user.update({
                                password: newPassword
                            }).then(result => {
                                console.log('Password was successfully changed!');
                                return res.send({
                                    responseCod: 400,
                                    data: {
                                         passwordChanged: true,
                                         message: 'Password was successfully changed!'
                                    }
                                });
                            }).catch(err => {
                                console.log(err.errors[0].message);
                                res.send({
                                    responseCod: 400,
                                    data: {
                                         passwordChanged: false,
                                         message: err.errors[0].message
                                    }
                                });
                            });
                        });
                    });
                } else {
                    console.log('Passwords are different');
                    return res.send({
                        responseCod: 400,
                        data: {
                             passwordChanged: false,
                             message: 'Passwords are different!'
                        }
                    });
                }
            }else{
                console.log('Not match');
                return res.send({
                    responseCod: 400,
                    data: {
                        passwordChanged: false,
                         message: 'Wrong old password!'
                    }
                });
            }
        } else if (req.body.changeData.changeInfo) {
            user.update({
                email: req.body.user.email,
                name: req.body.user.name
            });
            return res.send({
                responseCod: 400,
                data: {
                     changedUserInfo: true,
                     message: 'Info successfully changed!'
                }
            });
        } else if (req.body.changeData.changeImage) {
            console.log('Changing image!');
            return res.send({
                responseCod: 400,
                data: {
                     changedImage: true,
                     message: 'Image successfully changed!'
                }
            });
        }
    }) 
    .catch(err => console.log(err));

}
