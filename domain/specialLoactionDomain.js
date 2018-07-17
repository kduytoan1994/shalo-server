const roadMapDB = require('../database/roadmap');
const specialLocationDB = require('../database/specialLocation');
const tokenDB = require('../database/token');
const authenticate = require('../authenticate/authenticate');
const sender = require('../fcmSender/sender');
const userDB = require('../database/users');
const Q = require('q');
const fs = require('fs');
const TAG = "specialLocationDomain ";
const memberLocationDomain = require('../domain/memberLocationDomain');
exports.createSpLocation = (token_content, roadMapId, title, content, lat, lng, image) =>
    new Promise((resolve, reject) => {
        var mRoadMap;
        var mUserId;
        var newSpLocation;
        var mImageUri = '';
        authenticate.checkToken(token_content)
            .then(token => {
                mUserId = token.userId;
                return roadMapDB.roadMap.findById(roadMapId)
            })
            .then(roadMap => {
                mRoadMap = roadMap;
                return authenticate.checkTourMemberPermission(token_content, roadMap.tour);
            })
            .then(tour => {
                newSpLocation = new specialLocationDB.specialLocation({
                    title: title,
                    content: content,
                    lat: lat,
                    lng: lng,
                    roadMap: roadMapId,
                    creator: mUserId
                });
                var time = new Date().getTime();
                if (image != null) {
                    console.log('image not null')
                    var img = image[0]['filename'];
                    var name = time + '' + img;
                    var newPath = './public/images/' + time + img;
                    fs.rename('./public/images/' + img, newPath, err => {
                        if (err) {
                            reject(err);
                        }
                    });
                    mImageUri = name;
                    newSpLocation.imageUri = name;
                }
                newSpLocation.save(err => {
                    if (err) {
                        reject(err)
                    }
                });
                mRoadMap.specialLocation.push(newSpLocation._id);
                mRoadMap.save(err => {
                    if (err) {
                        reject(err)
                    }
                });
                return memberLocationDomain.findActiveMember(token_content, tour._id);
            })
            .then(memberLocations => {
                var payload = { data: { "typeNotify":"16",_id: String(newSpLocation._id), title: newSpLocation.title, image: mImageUri, content: newSpLocation.content, lat: String(newSpLocation.lat), lng: String(newSpLocation.lng) } };
                var promises = [];
                for (var i = 0; i < memberLocations.length; i++) {
                    promises.push(sender.sendMessage('user_' + memberLocations[i].user, payload)
                        .then(response => {
                            console.log(response);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    )
                }
                Q.all(promises)
                    .then(() => {
                        resolve({ _id: newSpLocation._id })
                    })
                    .catch(err => {
                        console.log(err);
                        reject(err);
                    })
            })
            .catch(err => {
                if (err) {
                    reject(err);
                }
            })
    })
exports.updateSpLocation = (token_content, tourId, specialLocationId, title, content, lat, lng) =>
    new Promise((resolve, reject) => {
        var mSpecialLocation;
        var mImageUri = '';
        specialLocationDB.specialLocation.findOneAndUpdate({ _id: specialLocationId }, {
            $set: {
                title: title,
                content: content,
                lat: lat,
                lng: lng
            }
        })
            .then(specialLocation => {
                mSpecialLocation = specialLocation;
                if (mSpecialLocation.imageUri != null) {
                    mImageUri = mSpecialLocation.imageUri;
                }
                return memberLocationDomain.findActiveMember(token_content, tourId);
            })
            .then(memberLocations => {
                var payload = { data: {"typeNotify":"17", _id: String(mSpecialLocation._id), title: mSpecialLocation.title, image: mImageUri, content: mSpecialLocation.content, lat: String(mSpecialLocation.lat), lng: String(mSpecialLocation.lng) } };
                var promises = [];
                for (var i = 0; i < memberLocations.length; i++) {
                    promises.push(sender.sendMessage('user_' + memberLocations[i].user, payload)
                        .then(response => {
                            console.log(response);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    )
                }
                Q.all(promises)
                    .then(() => {
                        resolve({ _id: mSpecialLocation._id })
                    })
                    .catch(err => {
                        console.log(err);
                        reject(err);
                    })
            })
            .catch(err => {
                reject(err);
            })
    })
exports.deleteSpLocation = (token_content, specialLocationId, tourId) =>
    new Promise((resolve, reject) => {
        var mSpecialLocation;
        var mImageUri='';
        specialLocationDB.specialLocation.findOneAndRemove({ _id: specialLocationId })
            .then(specialLocation => {
                mSpecialLocation = specialLocation;
                if (mSpecialLocation.imageUri != null) {
                    mImageUri = mSpecialLocation.imageUri;
                }
                return memberLocationDomain.findActiveMember(token_content, tourId);
            })
            .then(memberLocations => {
                var payload = { data: { "typeNotify":"18",_id: String(mSpecialLocation._id), title: mSpecialLocation.title, image: mImageUri, content: mSpecialLocation.content, lat: String(mSpecialLocation.lat), lng: String(mSpecialLocation.lng) } };
                var promises = [];
                for (var i = 0; i < memberLocations.length; i++) {
                    promises.push(sender.sendMessage('user_' + memberLocations[i].user, payload)
                        .then(response => {
                            console.log(response);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    )
                }
                Q.all(promises)
                    .then(() => {
                        resolve({ _id: mSpecialLocation._id })
                    })
                    .catch(err => {
                        console.log(err);
                        reject(err);
                    })
            })
            .catch(err => {
                reject(err);
            })
    })