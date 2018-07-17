/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global admin_shalo */

const userDB = require('../database/users');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const auth = require('../authenticate/authenticate');
const rs = require("randomstring");
const notifyDomain = require('../domain/notifyDomain');
const fcmTokenDB = require('../database/fcmAdminToken');
const sender = require('../fcmSender/sender');
function result(res, success, des, code, data) {
    res({ message: { success: success, description: des, code: code }, data: data });
}
exports.loginUser = (phone, password, anyContent, registrationToken) =>
    new Promise((res, rej) => {
        var mAnyToken, mNewToken;
        if (!password || !phone || !anyContent) {
            result(rej, '0', 'Missing field', 200, {});
        } else {
            auth.checkToken(anyContent)
                .then(anyToken => {
                    mAnyToken = anyToken;
                    return userDB.user.findOne({ phoneNumber: phone });
                })
                .then(user => {
                    if (bcrypt.compareSync(password, user.password)) {
                        var content = rs.generate({ length: 64 });
                        return auth.createNewToken(content, user._id);
                    } else {
                        result(rej, '0', 'Password not right !', 404, {});
                    }
                })
                .then(newToken => {
                    mNewToken = newToken;

                    return userDB.user.findById(newToken.userId);
                })
                .then(user => {
                    userDB.user.findByIdAndRemove(mAnyToken.userId, (err) => {
                        if (err) {
                            console.log('err')
                            result(rej, '0', 'remove anyuser err', 500, err);
                        } else {
                            sender.subscribeTopic(mNewToken.content, 'user_', registrationToken)
                                .then(response => {
                                    console.log(response);
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                            auth.deleteToken(mAnyToken.content)
                                .then(token => {
                                })
                                .catch(err => {

                                });
                            result(res, '1', 'login success', 200, { token: mNewToken.content, _id: user._id, name: user.name, avatar: user.avatarUri });
                        }
                    });
                })
                .catch(err => result(rej, '0', 'anytoken or phone error', err));
        }
    });

exports.Any = () =>
    new Promise((res, rej) => {
        const salt = bcrypt.genSaltSync(10);
        var date = new Date();
        var name = date.getTime().toString() + rs.generate({ length: 12, charset: 'numeric' });
        const hash = bcrypt.hashSync(name, salt);
        var newAny = userDB.user({
            name: name,
            phoneNumber: name,
            password: hash,
            type: 0
        });
        newAny.save()
            .then(userAny => {
                var token = rs.generate({ length: 64 });
                auth.createNewToken(token, userAny._id)
                    .then(token => res({ message: { success: "1", description: '', code: 200 }, data: { token: token.content } }))
                    .catch(err => rej(err));
            })
            .catch(err => rej({ message: { success: "0", description: 'Server internal error !', code: 500 }, data: err })
            );
    });

exports.register = (phone, name, pass, anyToken, registrationToken) =>
    new Promise((res, rej) => {
        if (!phone || !name || !pass || !anyToken) {
            rej({ message: { success: "0", description: 'Missing field', code: 200 }, data: {} });

        } else {
            auth.checkToken(anyToken)
                .then(token => {
                    if (token !== null) {
                        userDB.user.findById(token.userId)
                            .then(userAny => {
                                if (userAny !== null) {
                                    const salt = bcrypt.genSaltSync(10);
                                    const hash = bcrypt.hashSync(pass, salt);
                                    var newUser = userDB.user({
                                        name: name,
                                        phoneNumber: phone,
                                        password: hash,
                                        avatarUri: "",
                                        type: 1,
                                        enableLocation: "0"
                                    });
                                    newUser.save()
                                        .then(user => {

                                            var content = rs.generate({ length: 64 });
                                            auth.createNewToken(content, user._id)
                                                .then(newToken => {
                                                    //subcribe user to topic
                                                    sender.subscribeTopic(newToken.content, 'user_', registrationToken)
                                                        .then(response => {
                                                            console.log(response);
                                                        })
                                                        .catch(err => {
                                                            console.log(err);
                                                        })
                                                    //delete token any
                                                    auth.deleteToken(token.content)
                                                        .then(token => {
                                                            console.log(token);
                                                        })
                                                        .catch(err => {
                                                            console.log(err)
                                                        })
                                                    userDB.user.deleteOne({ _id: userAny._id })
                                                        .then(result => { console.log('delete userAny') })
                                                        .catch(err => { console.log(err) });
                                                    //response to client
                                                    res({ message: { success: "1", description: '', code: 200 }, data: { token: newToken.content, _id: user._id } });
                                                })
                                                .catch(err => rej(err));
                                        })
                                        .catch(err => {
                                            if (err.code === 11000) {
                                                rej({ message: { success: "0", description: 'Duplicate !', code: 500 }, data: err });
                                            } else {
                                                rej({ message: { success: "0", description: 'Server internal error !', code: 500 }, data: err });
                                            }
                                        });
                                } else {
                                    rej({ message: { success: "0", description: 'userAny not exist', code: 200 }, data: {} });
                                }
                            })
                            .catch(err => rej({ message: { success: "0", description: 'Server internal error !', code: 500 }, data: err })
                            );
                    } else {
                        rej({ message: { success: "0", description: 'token not exist', code: 200 }, data: {} });
                    }
                })
                .catch(err => rej(err));
        }
    });
exports.forgetPassword = (phone, pass, anyToken) =>
    new Promise((res, rej) => {
        if (!phone || !pass || !anyToken) {
            rej({ message: { success: "0", description: 'Missing field', code: 200 }, data: {} });
        } else {
            auth.checkToken(anyToken)
                .then(token1 => {
                    token = token1;
                    return userDB.user.findById(token.userId);
                })
                .then(userAny1 => {
                    userAny = userAny1;
                    return userDB.user.findOne({ phoneNumber: phone });
                })
                .then(user1 => {
                    user = user1;
                    if (user == null) {
                        rej({ message: { success: "0", description: 'telephone not registed', code: 200 }, data: {} });
                    } else {
                        const salt = bcrypt.genSaltSync(10);
                        const hash = bcrypt.hashSync(pass, salt);
                        user.password = hash;
                        return user.save();
                    }
                })
                .then(user => {
                    content = rs.generate({ length: 64 });
                    console.log(content + " " + user._id);
                    return auth.createNewToken(content, user._id);

                })
                .then(newToken => {
                    userAny.remove();
                    auth.deleteToken(token.content)
                        .then(token => {
                            console.log(token);
                        })
                        .catch(err => {
                            console.log(err)
                        })
                    res({ message: { success: "1", description: '', code: 200 }, data: { token: content, _id: user._id, name: user.name, avatar: user.avatarUri } })
                })
                .catch(err => rej({ message: { success: "0", description: 'Server internal error !', code: 500 }, data: err }));
        }
    });


exports.changePassword = (content, newPassword, oldPassword) =>
    new Promise((res, rej) => {
        if (!content || !newPassword) {
            rej({ message: { success: "0", description: 'Missing field', code: 200 }, data: {} });
        } else {
            auth.checkToken(content)
                .then(token => {
                    if (token !== null) {
                        userDB.user.findById(token.userId)
                            .then(user => {
                                if (bcrypt.compareSync(oldPassword, user.password)) {
                                    var salt = bcrypt.genSaltSync(10);
                                    var hash = bcrypt.hashSync(newPassword, salt);
                                    user.password = hash;
                                    user.save()
                                        .then(user => res({ message: { success: "1", description: '', code: 200 }, data: { token: token.content, name: user.name } }))
                                        .catch(err => rej({ message: { success: "0", description: 'Server internal error !', code: 500 }, data: err }));
                                    ;
                                } else {
                                    rej({ message: { success: "0", description: 'Password not right !', code: 200 }, data: {} });
                                }
                            })
                            .catch(err => rej({ message: { success: "0", description: 'Server internal error !', code: 500 }, data: err }));
                    } else {
                        rej({ message: { success: "0", description: 'token not exist', code: 200 }, data: {} });
                    }
                })
                .catch(err => rej(err));
        }
    });
exports.addFCMToken = (token_content, fcmtoken) =>
    new Promise((resolve, reject) => {
        auth.checkToken(token_content)
            .then(token => {
                console.log('11')
                var newFCMToken = new fcmTokenDB.fcmToken({
                    userId: token.userId,
                    fcmtoken: fcmtoken
                });
                newFCMToken.save(err => {
                    if (err) {
                        reject(err);
                    }
                    ;
                });
                console.log('12')
                return sender.subscribeTopicUser(token_content, fcmtoken);
            })
            .then(response => {
                resolve(response);
            })
            .catch(err => {
                console.log(err)
                reject(err);
            });
    });
exports.updateFCMToken = (token_content, oldToken, refreshToken) =>
    new Promise((resolve, reject) => {
        sender.subcribeTopic(token_content, refreshToken)
            .then(response => {
                return sender.unSubcribeTopicUser(token_content, oldToken);
            })
            .then(response => {
                return fcmTokenDB.fcmToken.findOneAndUpdate({ fcmtoken: oldToken }, { $set: { fcmtoken: refreshToken } }, { new: true });
            })
            .then(fcmtoken => {
                resolve(fcmtoken);
            })
            .catch(err => {
                reject(err);
            });
    });
exports.deleteFCMToken = (token_content, oldToken) =>
    new Promise((resolve, reject) => {
        sender.unSubcribeTopicUser(token_content, oldToken)
            .then(response => {
                console.log(String(response));
                return fcmTokenDB.fcmToken.findOneAndRemove({ fcmtoken: oldToken });
            })
            .then(fcmtoken => {
                resolve(fcmtoken);
            })
            .catch(err => {
                reject(err);
            });
    });

exports.removeUser = (phone) =>
    new Promise((res, rej) => {
        if (!phone) {
            rej({ message: { success: "0", description: 'Missing field', code: 200 }, data: {} });
        } else {
            userDB.user.findOneAndRemove({ phoneNumber: phone })
                .then(user => {
                    if (user) {
                        res({ message: { success: "1", description: '', code: 200 }, data: {} });
                    } else {
                        rej({ message: { success: "0", description: 'Phone is not exist', code: 200 }, data: {} });
                    }
                })
                .catch(err => rej({ message: { success: "0", description: 'Server internal error !', code: 500 }, data: err }));
        }
    });

exports.saveImage = (phone, imageName) =>
    new Promise((res, rej) => {
        if (!phone || !imageName) {
            if (imageName) {
                fs.unlink('./public/images/' + imageName, function (err) {
                    if (err) {
                        throw err;
                    }
                });
            }
            rej({ message: { success: "0", description: 'Missing field', code: 404 }, data: {} });
        } else {
            var name = phone + "_" + imageName;
            var uri = './public/images/' + name;
            fs.rename('./public/images/' + imageName, uri, function (err) {
                if (err) {
                    rej({ message: { success: "0", description: 'Server internal error !', code: 500 }, data: err });
                }
            });
            userDB.user.findOneAndUpdate({ phoneNumber: phone }, { $set: { avatarUri: name } }, { new: true })
                .then(user => res({ message: { success: "1", description: '', code: 200 }, data: user.avatarUri }))
                .catch(err => rej({ message: { success: "0", description: 'Server internal error !', code: 500 }, data: err }));
        }
    });

exports.getAvatarByPhone = (phone) =>
    new Promise((res, rej) => {
        if (!phone) {
            rej({ message: { success: "0", description: 'Missing field', code: 200 }, data: {} });
        } else {
            userDB.user.findOne({ phoneNumber: phone })
                .then(user => {
                    if (user === null) {
                        rej({ message: "sfdsf" });
                    } else {
                        console.log(user.avatarUri);
                        let img = fs.readFileSync("." + user.avatarUri);
                        res(img);
                    }
                })
                .catch(err => rej(err));
        }
    });

exports.getImageByUri = (uri) =>
    new Promise((res, rej) => {
        if (!uri) {
            rej({ message: { success: "0", description: 'Missing field', code: 200 }, data: {} });
        } else {
            if (!fs.existsSync("./public/images/" + uri)) {
                rej({ message: { success: "0", description: 'Uri not exist !', code: 200 }, data: {} });
            } else {
                let img = fs.readFileSync("./public/images/" + uri);
                res(img);
            }
        }
    });
exports.getVideoByUri = (uri) =>
    new Promise((response, reject) => {
        if (!uri) {
            reject({ message: { success: "0", description: 'Missing field', code: 200 }, data: {} });
        } else {
            if (!fs.existsSync("./public/videos/" + uri)) {
                rej({ message: { success: "0", description: 'Uri not exist !', code: 200 }, data: {} });
            } else {
                let video = fs.readFileSync("./public/videos/" + uri);
                res(video);
            }
        }
    })
exports.logOut = (content, registrationToken) =>
    new Promise((res, rej) => {
        if (!content) {
            result(rej, '0', 'no token', 404, {});
        } else {
            auth.checkToken(content)
                .then(token => {
                    sender.unSubcribeTopic(content, 'user_', registrationToken)
                        .then(response => {
                            console.log(response);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    const salt = bcrypt.genSaltSync(10);
                    var date = new Date();
                    var name = date.getTime().toString() + rs.generate({ length: 12, charset: 'numeric' });
                    const hash = bcrypt.hashSync(name, salt);
                    var newAny = userDB.user({
                        name: name,
                        phoneNumber: name,
                        password: hash,
                        type: 0
                    });
                    newAny.save()
                        .then(userAny => {
                            auth.deleteToken(token.content)
                                .then(token => {
                                })
                                .catch(err => {

                                });
                            var tokenContent = rs.generate({ length: 64 });
                            return auth.createNewToken(tokenContent, userAny._id)

                        })
                        .then(anyToken => result(res, '1', 'logout success', 200, { token: anyToken.content }))
                        .catch(err => result(rej, '0', 'server error', 500, err));
                })
                .catch(err => result(rej, '0', 'token error', 404, err));
        }
    });
exports.changePhone = (content, newPhone) =>
    new Promise((res, rej) => {
        if (!content || !newPhone) {
            rej({ message: { success: "0", description: 'Missing field', code: 200 }, data: {} });
        } else {
            auth.checkToken(content)
                .then(token => {
                    if (token !== null) {
                        userDB.user.findByIdAndUpdate(token.userId, { $set: { phoneNumber: newPhone } }, { new: true })
                            .then(user => result(res, "1", "", 200, {}))
                            .catch(err => result(rej, "0", "Server error", 500, err));
                    } else {
                        result(rej, "0", "User is not exist !", 404, {});
                    }
                })
                .catch(err => result(rej, "0", "", 404, err));
        }
    });

exports.changeUserInfo = (content, name, birthDay, address, gender) =>
    new Promise((res, rej) => {
        if (!content || !name || !birthDay || !address || !gender) {
            rej({ message: { success: "0", description: 'Missing field', code: 200 }, data: {} });
        } else {
            auth.checkToken(content)
                .then(token => {
                    userDB.user.findByIdAndUpdate(token.userId, { $set: { name: name, birthday: birthDay, address: address, gender: gender } }, { new: true })
                        .then(user => result(res, "1", "", 200, { _id: user._id, name: user.name, avatar: user.avatarUri }
                        ))
                        .catch(err => result(rej, "0", "Server error", 500, err));
                })
                .catch(err => result(rej, "0", "Server error", 404, err));
        }
    });
exports.getUserByToken = (content, ids) =>
    new Promise((res, rej) => {
        var mUser;
        if (!content) {
            result(rej, '0', 'Missing field', 404, {});
        } else {
            auth.checkToken(content)
                .then(token => {
                    userDB.user.findById(ids)
                        .then(user => {
                            mUser = user;
                            return userDB.user.findById(token.userId);
                        })
                        .then(self => {
                            var isFollow = 0;
                            if (self.followedUser.indexOf(mUser._id) !== -1) {
                                isFollow = 1;
                            }
                            result(res, "1", "", 200,
                                {
                                    name: mUser.name, phoneNumber: mUser.phoneNumber, avatar: mUser.avatarUri, address: mUser.address,coverImage: mUser.coverImage,
                                    gender: mUser.gender, followedUser: mUser.followedUser.length, userFollowed: mUser.userFollowed.length, birthDay: mUser.birthday,
                                    tourLiked: mUser.tourLiked.length, numberTour: (mUser.tourOwner.length + mUser.tourMember.length), isFollow: isFollow
                                });
                        })
                        .catch(err => result(rej, "0", "Server error", 500, err));
                })
                .catch(err => result(rej, "0", "Server error", 500, err));
        }
    });
exports.getListFollowed = (userId1, userId2, index) =>
    new Promise((res, rej) => {
        if (!userId1 || !userId2 || !index) {
            result(rej, '0', 'Missing field', 404, {});
        } else {
            userDB.user.findById(userId1)
                .populate({
                    path: 'followedUser',
                    model: 'user',
                    select: ('name avatarUri address userFollowed'),
                    populate: {
                        path: 'userFollowed',
                        match: { '_id': { $gte: userId2 } },
                        model: 'user',
                        select: ('_id')
                    }
                })
                .then(user => {
                    var start = index * 10;
                    var end = start + 9;
                    var len = user.followedUser.length;
                    if (len > start) {
                        if (len > end) {
                            result(res, '1', '', 200, user.followedUser.slice(start, end));
                        } else {
                            result(res, '1', '', 200, user.followedUser.slice(start, len));
                        }
                    } else {
                        result(rej, "1", "Not item", 200, []);
                    }

                })
                .catch(err => result(rej, "0", "find user by id error", 500, err));
        }
    });

exports.getListUserFollowed = (userId1, userId2, index) =>
    new Promise((res, rej) => {
        if (!userId1 || !userId2 || !index) {
            result(rej, '0', 'Missing field', 404, {});
        } else {
            userDB.user.findById(userId1)
                .populate({
                    path: 'userFollowed',
                    model: 'user',
                    select: ('name avatarUri address userFollowed'),
                    populate: {
                        path: 'userFollowed',
                        match: { '_id': { $gte: userId2 } },
                        model: 'user',
                        select: ('_id')
                    }
                })
                .then(user => {
                    var start = index * 10;
                    var end = start + 9;
                    var len = user.userFollowed.length;
                    if (len > start) {
                        if (len > end) {
                            result(res, '1', '', 200, user.userFollowed.slice(start, end));
                        } else {
                            result(res, '1', '', 200, user.userFollowed.slice(start, len));
                        }
                    } else {
                        result(rej, "1", "Not item", 200, []);
                    }

                })
                .catch(err => result(rej, "0", "find user by id error", 500, err));
        }
    });
exports.getListTourCreateByUser = (content, index) =>
    new Promise((res, rej) => {
        if (!content || !index) {
            result(rej, '0', 'Missing field', 404, {});
        } else {
            auth.checkToken(content)
                .then(token => {
                    return userDB.user.findById(token.userId)
                        .populate({
                            path: 'tourOwner',
                            model: 'tour',
                            select: "name start_time end_time posterUri userLiked"
                        });
                })
                .then(user => {
                    var start = index * 10;
                    var end = start + 9;
                    var len = user.tourOwner.length;
                    if (len > start) {
                        if (len > end) {
                            res(user.tourOwner.slice(start, end));
                        } else {
                            res(user.tourOwner.slice(start, len));
                        }
                    } else {
                        result(rej, "1", "Not item", 200, {});
                    }
                })
                .catch(err => result(rej, "0", "Server error when auth.checkToken " + content, 500, err));
        }
    });

exports.getListTourLikeByUser = (content, index) =>
    new Promise((res, rej) => {
        if (!content || !index) {
            result(rej, '0', 'Missing field', 404, {});
        } else {
            auth.checkToken(content)
                .then(token => {
                    return userDB.user.findById(token.userId)
                        .populate({
                            path: 'tourLiked',
                            model: 'tour',
                            select: "name creator start_time end_time posterUri userLiked"
                        });
                })
                .then(user => {
                    var start = index * 10;
                    var end = start + 9;
                    var len = user.tourLiked.length;
                    if (len > start) {
                        if (len > end) {
                            res(user.tourLiked.slice(start, end));
                        } else {
                            res(user.tourLiked.slice(start, len));
                        }
                    } else {
                        result(rej, "1", "Not item", 200, {});
                    }
                })
                .catch(err => result(rej, "0", "Server error when auth.checkToken " + content, 500, err));
        }
    });
exports.followUser = (content, userId, registrationToken) =>
    new Promise((res, rej) => {
        var self;
        if (!content || !userId) {
            result(rej, '0', 'Missing field', 404, {});
        } else {
            auth.checkToken(content)
                .then(token => {
                    return userDB.user.findById(token.userId);
                })
                .then(user => {
                    self = user;
                    return userDB.user.findById(userId);
                })
                .then(otherUser => {
                    self.followedUser.push(userId);
                    self.save(err => {
                        if (err) {
                            result(rej, "0", "save err save", 500, err);
                        }
                    });
                    otherUser.userFollowed.push(self._id);
                    otherUser.save(err => {
                        if (err) {
                            result(rej, "0", "save err save", 500, err);
                        }
                    });

                    notifyDomain.createNotify(otherUser._id, "follow_user", 1, self._id, self.avatarUri, self.name, null, null, "", "", null, 0, 0);

                    //send notification
                    var payload = sender.setPayLoad("follow_user", "1", String(self._id), self.avatarUri, self.name, "", "", "", "", "", "0", "0");
                    sender.sendMessage('user_' + userId, payload)
                        .then(response => { console.log(response) })
                        .catch(err => console.log(err));

                    //return
                    result(res, "1", "successfull ", 200, {});
                })
                .catch(err => result(rej, "0", "Server error " + content, 500, err));
        }
    });
exports.unFollowUserByToken = (content, userId, registrationToken) =>
    new Promise((res, rej) => {
        var self;
        if (!content || !userId) {
            result(rej, '0', 'Missing field', 404, {});
        } else {
            auth.checkToken(content)
                .then(token => {
                    return userDB.user.findById(token.userId);
                })
                .then(user => {
                    self = user;
                    return userDB.user.findById(userId);
                })
                .then(otherUser => {
                    self.followedUser.remove(userId);
                    self.save(err => {
                        if (err) {
                            result(rej, "0", " err save followedUser", 500, err);
                        }
                    });
                    otherUser.userFollowed.remove(self._id);
                    otherUser.save(err => {
                        if (err) {
                            result(rej, "0", "err save userFollowed", 500, err);
                        }
                    });
                    notifyDomain.deleteNotifyFollow(otherUser, self._id, 1);
                    result(res, "1", "successfull ", 200, {});
                })
                .catch(err => result(rej, "0", "Server error " + content, 500, err));
        }
    });
exports.ex = () =>
    new Promise((resolve, reject) => {
        var registrationToken = "dzpEQNeBzxsAPA91bHpUPIEhfc04YyUkcYMHegSqWOS4-Khro_Bp8-5fA9aM7tLDqBU39oeuODj0HhFut94alF0Z-wfOqBbuZTie3K2E8vtNAe8xFtan84zHTyhp-t2nvzruBkeqtD2OJtUhx52EjLN";
        var payload = {
            notification: {
                title: "Test notification",
                body: "Test notification"
            },
            data: {
                score: "850",
                time: "2:45"
            }
        };
        var options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        };

        admin_shalo.messaging().sendToDevice(registrationToken, payload, options)
            .then(response => {
                resolve(response);
                console.log("Successfully sent message:", response);
            })
            .catch(error => {
                resolve(error);
                console.log("Error sending message:", error);
            });
    });
exports.getAllImage = (token_content, id) =>
    new Promise((resolve, reject) => {
        auth.getUserByToken(token_content)
            .then(user => {
                return userDB.user.findOne({ _id: id })
            })
            .then(user1 => {
                resolve(user1.imageUri)
            })
            .catch(err => {
                reject(err);
            })
    })

exports.updateCoverImage = (token_content, image) =>
    new Promise((resolve, reject) => {
        auth.getUserByToken(token_content)
            .then(user => {
                var time = new Date().getTime();
                var imageName = image[0]['filename'];
                var name = time + '' + imageName;
                var newPath = './public/images/' + name;
                fs.rename('./public/images/' + imageName, newPath, err => {
                    if (err) {
                        reject(err);
                    }
                });
                if (user.coverImage != null && user.coverImage != '') {
                    fs.unlink('.public/images/' + user.coverImage, err => {
                        if (err) {
                            reject(err);
                        }
                    })
                }
                user.coverImage = name;
                user.save(err => {
                    if (err) {
                        reject(err)
                    }
                })
                resolve(user.coverImage);
            })
            .catch(err => {
                reject(err)
            })
    })
exports.showall = () =>
    new Promise((resolve,reject)=>{
        userDB.user.find({})
            .then(user=>{
                resolve(user)
            })
            .catch(err=>{
                reject(err);
            })
    })
