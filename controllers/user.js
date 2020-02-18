const User = require('../models/user');
const Role = require('../models/role');
const roles = require('../enums/role.enum');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret_key = require('../config/secret_key');

const uuidv4 = require('uuid/v4');

const base64Img = require('base64-img');




exports.postCreateUser =  (req, res, next) => {
    let password;
    if (req.body.password) {
        password = req.body.password;
    } else {
        password = generatePassword();
    }
    console.log(password);
    console.log('User creation!');
    let newUser = new User({
        email: req.body.email,
        password: password
    });
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            newUser.password = hash;
            User.create({
                name: newUser.name,
                email: newUser.email,
                password: newUser.password
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
                    // console.log(user);
                    user.dataValues.profile_image = base64Img.base64Sync(user.dataValues.profile_image);
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
        }
    }) 
    .catch(err => console.log(err));

}

module.exports.postUpdateProfileImage = (req, res) => {
    const profileImageBase64 = req.body.base64;
    const user = JSON.parse(req.body.user);
    // console.log(user);
    const profileImagePath = base64Img.imgSync(profileImageBase64, '../images/profile', uuidv4());

    User
      .findOne({ where: { user_id: user.id } })
      .then(user => {
          user
            .update({
                profile_image: profileImagePath
            })
            .then(result => {
                console.log('Profile image successfully changed!');
                return res.send({
                    responseCod: 400,
                    data: {
                         changedUserInfo: true,
                         message: 'Info successfully changed!'
                    }
                });
            })
            .catch(err => {
                console.log(err.errors[0].message);
                res.send({
                    responseCod: 400,
                    data: {
                         passwordChanged: false,
                         message: err.errors[0].message
                    }
                }); 
            });
      })
      .catch(err => {
        console.log(err.errors[0].message);
        res.send({
            responseCod: 400,
            data: {
                 passwordChanged: false,
                 message: err.errors[0].message
            }
        });
      });

}

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}