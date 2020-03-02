const User = require('../models/user');
const Role = require('../models/role');

const bcrypt = require('bcryptjs');

const uuidv4 = require('uuid/v4');

const base64Img = require('base64-img');


exports.getUser = (req, res) => {
    const email = req.query.email;

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
                        responseCode: 200,
                        data: {
                            message: 'User was successfully fetched!',
                            user: userData
                        }
                    });
                })
                .catch(err => {
                    return responseErrorMessage(res, 400, err);
                });
        })
        .catch(err => {
            return responseErrorMessage(res, 400, err);
        });
}

exports.postUpdateUserData = (req, res) => {
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

exports.postUpdateProfileImage = (req, res) => {
    const profileImageBase64 = req.body.base64;
    const user = JSON.parse(req.body.user);

    if (!profileImageBase64 || !user) {
        return responseUpdateUserData(res, 400, false, 'Error');
    }

    const profileImagePath = base64Img.imgSync(profileImageBase64, '../images/profile', uuidv4());

    User
        .findOne({where: {user_id: user.id}})
        .then(user => {
            user
                .update({
                    profile_image: profileImagePath
                })
                .then(result => {
                    return responseUpdateProfileImage(res, 200, true, 'Profile image successfully changed!');
                })
                .catch(err => {
                    return responseUpdateProfileImage(res, 400, false, err.errors[0].message);
                });
        })
        .catch(err => {
            return responseUpdateProfileImage(res, 500, false, err.errors[0].message);
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
