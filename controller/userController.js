/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var userDomain = require('../domain/userDomain');

exports.loginUser = (req, res) => {
    var phone = req.body.phone;
    var password = req.body.password;
    var anyToken = req.body.anonymousToken;
    var registrationToken = req.body.registrationToken;
    console.log('phone: ' + phone + ' pass ' + password + ' anytoken ' + anyToken + ' registrationTOken ' + registrationToken);
    userDomain.loginUser(phone, password, anyToken, registrationToken)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};
exports.createAny = (req, res) => {
    userDomain.Any()
        .then(result => res.json(result))
        .catch(err => res.json(err));
};
exports.register = (req, res) => {
    var phone = req.body.phone;
    var name = req.body.name;
    var pass = req.body.password;
    var anyToken = req.body.anonymousToken;
    var registrationToken = req.body.registrationToken;
    userDomain.register(phone, name, pass, anyToken, registrationToken)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};

exports.forgetPassword = (req, res) => {
    var phone = req.body.phone;
    var pass = req.body.password;
    var anyToken = req.header('header-shalo');
    userDomain.forgetPassword(phone, pass, anyToken)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};

exports.changePassword = (req, res) => {
    var token = req.body.token;
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    userDomain.changePassword(token, newPassword, oldPassword)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};
exports.removeUser = (req, res) => {
    var phone = req.body.phone;
    userDomain.removeUser(phone)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};
exports.uploadImage = (req, res) => {
    var imageName = req.files[0]['filename'];
    var phone = req.params.phone;
    userDomain.saveImage(phone, imageName)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};
exports.getAvatarByPhone = (req, res) => {
    var phone = req.params.phone;
    userDomain.getAvatarByPhone(phone)
        .then(result => {
            res.writeHead(200, {'Content-Type': 'image/png'});
            res.end(result);
        })
        .catch(err => res.json(err));
};
exports.getImageByUri = (req, res) => {
    var uri = req.params.uri;
    userDomain.getImageByUri(uri)
        .then(result => {
            res.writeHead(200, {'Content-Type': 'image/png'});
            res.end(result);
        })
        .catch(err => res.json(err));
};
exports.getVideoByUri = (req, res) => {
    var uri = req.params.uri;
    userDomain.getVideoByUri(uri)
        .then(result => {
            res.writeHead(200, {'Content-Type': 'video/mp4'});
            res.end(result);
        })
        .catch(err => res.json(err));
};
exports.logOut = (req, res) => {
    var token = req.header('header-shalo');
    var registrationToken = req.body.registrationToken;
    userDomain.logOut(token, registrationToken)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};

exports.changePhone = (req, res) => {
    var token = req.header('header-shalo');
    var newPhone = req.body.newPhone;
    console.log(token + '--' + newPhone);
    userDomain.changePhone(token, newPhone)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};
exports.changeInfo = (req, res) => {
    var token = req.header('header-shalo');
    var name = req.body.name;
    var birthDay = req.body.birthDay;
    var address = req.body.address;
    var gender = req.body.gender;
    userDomain.changeUserInfo(token, name, birthDay, address, gender)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};
exports.getUser = (req, res) => {
    var token = req.header('header-shalo');
    var ids = req.params.id;
    userDomain.getUserByToken(token, ids)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};

exports.getListFollowedUser = (req, res) => {
    var index = req.params.index;
    var userId1 = req.body.userId1;
    var userId2 = req.body.userId2;
    //    console.log(userId1 + "--" + userId2 +"--" + index);
    userDomain.getListFollowed(userId1, userId2, index)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};
exports.getListUserFollowed = (req, res) => {
    var index = req.params.index;
    var userId1 = req.body.userId1;
    var userId2 = req.body.userId2;
    userDomain.getListUserFollowed(userId1, userId2, index)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};
exports.getListTourCreateByUser = (req, res) => {
    var token = req.header('header-shalo');
    var index = req.params.index;
    userDomain.getListTourCreateByUser(token, index)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};

exports.getListLikeTour = (req, res) => {
    var token = req.header('header-shalo');
    var index = req.params.index;
    userDomain.getListTourLikeByUser(token, index)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};
exports.followUser = (req, res) => {
    var token = req.header('header-shalo');
    var userId = req.params.userId;
    userDomain.followUser(token, userId)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};
exports.unFollowUser = (req, res) => {
    var token = req.header('header-shalo');
    var userId = req.params.userId;
    userDomain.unFollowUserByToken(token, userId)
        .then(result => res.json(result))
        .catch(err => res.json(err));
};
exports.addFCMToken = (req, res) => {
    var token_content = req.header('header-shalo');
    var fcmtoken = req.body.fcmtoken;
    userDomain.addFCMToken(token_content, fcmtoken)
        .then(result => res.json({success: 1, description: result, code: 201}))
        .catch(err => res.json({success: 0, description: err, code: 500}));
};
exports.updateFCMToken = (req, res) => {
    var token_content = req.header('header-shalo');
    var fcmtoken = req.body.fcmtoken;
    var oldtoken = req.body.oldtoken;
    userDomain.updateFCMToken(token_content, oldtoken, fcmtoken)
        .then(result => res.json({success: 1, description: result, code: 201}))
        .catch(err => res.json({success: 0, description: err, code: 500}));
};
exports.deleteFCMToken = (req, res) => {
    var token_content = req.header('header-shalo');
    var fcmtoken = req.body.fcmtoken;
    userDomain.deleteFCMToken(token_content, fcmtoken)
        .then(result => res.json({success: 1, description: result, code: 201}))
        .catch(err => res.json({success: 0, description: err, code: 500}));
};
exports.getAllImage = (req, res) => {
    var token_content = req.header('header-shalo');
    var id = req.params.id;
    userDomain.getAllImage(token_content, id)
        .then(result => {
            res.json(result)
        })
        .catch(err => {
            res.json(err)
        })
}
exports.updateCoverImage = (req, res) => {
    var token_content = req.header('header-shalo');
    var image = req.files;
    userDomain.updateCoverImage(token_content, image)
        .then(result => res.json({
            success: 1,
            description: "update cover image successfully",
            image: result,
            code: 201
        }))
        .catch(err => {
            res.json(err);
        })
}
exports.showall = (req, res) => {
    userDomain.showall()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            res.json(err);
        })
}