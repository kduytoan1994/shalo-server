/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global admin_shalo */

const tourDB = require('../database/tour');
const userDB = require('../database/users');
const mongoose = require('mongoose');
const multer = require('multer');
const tokenDB = require('../database/token');
const scheduleDB = require('../database/schedule');
const notifyDomain = require('../domain/notifyDomain');
const authenticate = require('../authenticate/authenticate');
const fs = require('fs');
const sender = require('../fcmSender/sender');
const roadMapDB = require('../database/roadmap');
const categoryDB = require('../database/category');
const memberLocationDomain = require('../domain/memberLocationDomain');
const Q = require('q');

//manage CRUD tour
exports.createTour = (name, description, start_time, end_time, status, token_content, permission, posterUri, vihicle, accommodation, place, schedule, estimateCost, categoryIDs, lat, long) =>
    new Promise((resolve, reject) => {
        console.log('permisson: ' + permission);
        tokenDB.token.findOne({content: token_content})
            .then(token => {
                userDB.user.find({_id: token.userId})
                    .then(users => {
                        if (users.length === 0) {
                            reject('user not found');
                        } else {
                            return users[0];
                        }
                    })
                    .then(user => {
                        var time = new Date().getTime();
                        var newTour = new tourDB.tour({
                            name: name,
                            description: description,
                            start_time: start_time,
                            end_time: end_time,
                            status: status,
                            creator: user._id,
                            permission: permission,
                            posterUri: "",
                            videoUri: "",
                            contentVideo: "",
                            thumbnailUri: "",
                            vihicle: vihicle,
                            accommodation: accommodation,
                            place: place,
                            time: time,
                            schedule: [],
                            lat: lat,
                            long: long,
                            estimateCost: estimateCost,
                            category: []
                        }, err => {
                            reject(err);
                        });
                        for (var i = 0; i < schedule.length; i++) {
                            let newSchedule = new scheduleDB.schedule({
                                time: schedule[i].time,
                                content: schedule[i].content,
                                tour: newTour._id
                            });
                            newSchedule.save(err => {
                                if (err) {
                                    reject(err);
                                }
                            });
                            let id = newSchedule._id;
                            newTour.schedule.push(id);
                        }
                        console.log(categoryIDs.length);
                        for (var j = 0; j < categoryIDs.length; j++) {
                            newTour.category.push(categoryIDs[j]);
                            //add tour to category
                            categoryDB.category.findOne({_id: categoryIDs[i]})
                                .then(category => {
                                    category.tour.push(newTour._id);
                                    category.save(err => {
                                        if (err) {
                                            console.log('1' + err);
                                        }
                                    });

                                })
                                .catch(err => {
                                    console.log('2' + err);
                                });
                        }
                        newTour.userAccepted.push(user._id);
                        newTour.save(err => {
                            if (err) {
                                reject(err);
                            }
                        });
                        user.tourOwner.push(newTour._id);
                        user.tourMember.push(newTour._id);
                        user.save(err => {
                            if (err) {
                                reject(err);
                            }
                        });
                        var len = user.userFollowed.length;
                        for (var i = 0; i < len; i++) {
                            notifyDomain.createNotify(user.userFollowed[i], "tour_from_following", 11, user._id, user.avatarUri, user.name, newTour._id, newTour.name, user._id, newTour.posterUri, null, 0, 0);
                            //send notification to user follow creator
                            var payload = sender.setPayLoad('tour_from_following', '11', String(user.id), user.avatarUri, user.name, String(newTour._id), newTour.name, String(user._id), newTour.posterUri, "", '0', '0');
                            sender.sendMessage('user_' + String(user.userFollowed[i]), payload)
                                .then(response => {
                                    console.log(response)
                                })
                                .catch(err => console.log(err));
                        }
                        resolve({_id: newTour._id});
                    });
            })
            .catch(err => {
                reject(err);
            });
    });
exports.getTourById = (tourId) =>
    new Promise((resolve, reject) => {
        tourDB.tour.findOne({_id: tourId})
            .populate({
                path: 'schedule',
                model: 'schedule',
                select: ('time content')
            })
            .then(tour => {
                resolve(tour);
            })
            .catch(err => reject(err));

    });
exports.getTourOwner = (token_content) =>
    new Promise((resolve, reject) => {
        authenticate.checkToken(token_content)
            .then(token => {
                userDB.user.findOne({_id: token.userId})
                    .populate({
                        path: 'tourOwner',
                        model: 'tour',
                        select: ('name description')
                    })
                    .then(user => resolve(user.tourOwner))
                    .catch(err => reject(err));
            })
            .catch(err => reject("Token invalid"));
    });
exports.updateTour = (tourId, name, description, status, permission, posterUri, start_time, end_time, schedule, vihicle, accommodation, place, estimateCost) =>
    new Promise((resolve, reject) => {
        tourDB.tour.findOneAndUpdate({_id: tourId}, {
            $set: {
                name: name,
                description: description,
                status: status,
                permission: permission,
                posterUri: posterUri,
                start_time: start_time,
                end_time: end_time,
                schedule: schedule,
                vihicle: vihicle,
                accommodation: accommodation,
                place: place,
                estimateCost: estimateCost
            }
        }, {new: true})
            .then(tour => resolve(tour))
            .catch(err => {
                reject(err);
            });
    });
exports.deleteTour = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        authenticate.checkCreatorTourPermission(token_content, tourId)
            .then(tour => {
                tour.remove();
            })
            .then(tourRemoved => resolve(tourRemoved))
            .catch(err => reject(err));
    });

exports.getListTour = (token_content, type, count, category) =>
    new Promise((resolve, reject) => {
        authenticate.checkToken(token_content)
            .then(token => {
                if (type == 0) {
                    //tour public
                    var query;
                    query = {permission: 0}

                    tourDB.tour.find(query)
                        .populate({
                            path: 'creator',
                            model: 'user',
                            select: ('name avatarUri')
                        })
                        .populate({
                            path: 'schedule',
                            model: 'schedule',
                            select: ('time content')
                        })
                        .populate({
                            path: 'userLiked',
                            model: 'user',
                            select: ('name avatarUri')
                        })
                        .then(tours => {
                            resolve(tours.slice((count - 1) * 10, count * 10 - 1));
                        })
                        .catch(err => reject(err));
                } else {
                    // type=tour followed
                    userDB.user.findOne({_id: token.userId})
                        .then(user => {
                            var listTour = [];
                            var promises = [];
                            for (let i = 0; i < user.followedUser.length; i++) {
                                promises.push(tourDB.tour.find({creator: user.followedUser[i]})
                                    .populate([{
                                            path: 'creator',
                                            model: 'user',
                                            select: ('name avatarUri')
                                        },
                                            {
                                                path: 'userLiked',
                                                model: 'user',
                                                select: ('name avatarUri')
                                            }
                                        ]
                                    )
                                    .exec((err, tours) => {
                                        if (err) {
                                            console.log("tourDomain.followtour " + err)
                                            reject(err);
                                        } else {
                                            for (let j = 0; j < tours.length; j++) {
                                                if (listTour.length < count * 10) {
                                                    listTour.push(tours[j]);
                                                }
                                            }
                                        }
                                    })
                                )
                            }
                            Q.all(promises)
                                .then(() => resolve(listTour.slice((count - 1) * 10, count * 10 - 1)))
                                .catch(err => {
                                    console.log("tourDomain.followtour " + err)
                                    reject(err)
                                })
                        })

                }
            })
            .catch(err => reject("Token invalid " + err));
    });
exports.getListMyTour = (token_content, count, status) =>
    new Promise((resolve, reject) => {
        authenticate.checkToken(token_content)
            .then(token => {
                userDB.user.findOne({_id: token.userId})
                    .populate({
                        path: 'tourMember',
                        model: 'tour',
                        select: ('name description posterUri start_time end_time userLiked status permission place vehicle accommodation estimate_cost creator roadMap'),
                        populate: [{
                            path: 'creator',
                            model: 'user',
                            select: ('name avatarUri')
                        },
                            {
                                path: 'userLiked',
                                model: 'user',
                                select: ('name avatarUri')
                            }
                        ]
                    })
                    .exec((err) => {
                        if (err) {
                            reject(err);
                        }
                    })
                    .then(user => {
                        return (user.tourMember);
                    })
                    .then(tours => {
                        var miliseconds = new Date().getTime();
                        if (status == 0) {//chuan bi di
                            for (var i = 0; i < tours.length; i++) {
                                if (tours[i].start_time < miliseconds) {
                                    tours.splice(i--, 1);
                                }
                            }
                        } else if (status == 1) {//dang di
                            for (var i = 0; i < tours.length; i++) {
                                if (tours[i].start_time >= miliseconds || tours[i].end_time <= miliseconds) {
                                    tours.splice(i--, 1);
                                }
                            }
                        } else {//da di
                            for (var i = 0; i < tours.length; i++) {
                                if (tours[i].end_time > miliseconds) {
                                    tours.splice(i--, 1);
                                }
                            }
                        }
                        resolve(tours.slice((count - 1) * 10, count * 10 - 1));
                    })
                    .catch(err => reject(err));
            })
            .catch(err => reject("Token is invalid"));
    });
exports.getListMyTourByTime = (token_content, userId2, count) =>
    new Promise((resolve, reject) => {
        var now = new Date().getTime();
        var mUser;
        authenticate.checkToken(token_content)
            .then(token => {
                userDB.user.findOne({_id: userId2})
                    .populate({
                        path: 'tourMember',
                        model: 'tour',
                        select: ('name posterUri start_time end_time  creator place'),
                        populate: {
                            path: 'creator',
                            model: 'user',
                            select: ('name avatarUri')
                        }
                    })
                    .exec((err) => {
                        if (err) {
                            reject(err);
                        }
                    })
                    .then(user => {
                        var k = user.tourMember.length;
                        for (var i = 0; i < k; i++) {
                            for (var j = i + 1; j < k; j++) {
                                if (user.tourMember[i].start_time < user.tourMember[j].start_time) {
                                    var temp = user.tourMember[i].start_time;
                                    user.tourMember[i].start_time = user.tourMember[j].start_time;
                                    user.tourMember[j].start_time = temp;
                                }
                            }
                        }
                        resolve(user.tourMember.slice((count - 1) * 10, count * 10 - 1));
                    })
            })
            .catch(err => {
                reject(err);
            })
    });
exports.getTourInfoById = (tourId) =>
    new Promise((resolve, reject) => {
        tourDB.tour.findOne({_id: tourId})
            .populate({
                path: 'creator',
                model: 'user',
                select: ('avatarUri name  userFollowed tourMember')
            })
            .populate({
                path: 'schedule',
                model: 'schedule',
                select: ('time content')
            })
            .then(tour => {
                resolve({
                    name: tour.name,
                    description: tour.description,
                    place: tour.place,
                    vihicle: tour.vihicle,
                    accommodation: tour.accommodation,
                    estimateCost: tour.estimateCost
                    ,
                    start_time: tour.start_time,
                    schedule: tour.schedule,
                    end_time: tour.end_time,
                    number_member: tour.userAccepted.length + 1,
                    creator: {
                        count_tour_creator: tour.creator.tourMember.length, name_creator: tour.creator.name,
                        avatar_creator: tour.creator.avatarUri, count_follow_creator: tour.creator.userFollowed.length
                    },
                    roadMap: tour.roadMap
                });
            })
            .catch(err => reject(err));

    });
exports.uploadImage = (token_content, tourId, poster) =>
    new Promise((resolve, reject) => {
        authenticate.checkCreatorTourPermission(token_content, tourId)
            .then(tour => {
                var imagename = poster[0]['filename'];
                var hashname = String(new Date().getTime()) + imagename;
                var uri = './public/images/' + hashname;
                fs.rename('./public/images/' + imagename, uri, function (err) {
                    if (err) {
                        reject(err);
                    }
                });
                var oldUri = tour.posterUri;
                tourDB.tour.findOneAndUpdate({_id: tourId}, {$set: {posterUri: hashname}}, {new: true})
                    .then(tour => {
                        fs.unlink(oldUri, err => {
                            if (err) {
                                reject(err);
                            }
                        });
                        resolve(tour);
                    })
                    .catch(err => {
                        reject(err);
                    });
            })
            .catch(err => {
                reject(err);
            });
    });
exports.uploadVideo = (token_content, tourId, video, contentVideo) =>
    new Promise((resolve, reject) => {
        authenticate.checkCreatorTourPermission(token_content, tourId)
            .then(tour => {
                var videoname = video[0]['filename'];
                var thumbnail = video[1]['filename'];
                var dTime = new Date().getTime();
                var hashname = String(dTime) + videoname;
                var uri = './public/videos/' + hashname;
                console.log('videonames: ' + videoname + ' thumbnail ' + thumbnail);
                fs.rename('./public/videos/' + videoname, uri, function (err) {
                    if (err) {
                        reject(err);
                    }
                });

                var oldUri;
                if (tour.videoUri !== null && tour.videoUri !== '')
                    oldUri = tour.videoUri;

                var hashThumbnail = String(dTime) + thumbnail;
                var uriThumb = './public/videos/' + hashThumbnail;
                fs.rename('./public/videos/' + thumbnail, uriThumb, function (err) {
                    if (err) {
                        reject(err);
                        console.log('error upload video!');
                    }
                });
                var oldUriThumb;
                if (tour.thumbnailUri !== null && tour.thumbnailUri !== '')
                    oldUriThumb = tour.thumbnailUri;

                tourDB.tour.findOneAndUpdate({_id: tourId}, {
                    $set: {
                        videoUri: hashname,
                        contentVideo: contentVideo,
                        timeVideo: dTime,
                        thumbnailUri: hashThumbnail
                    }
                }, {new: true})
                    .populate({
                        path: 'creator',
                        model: 'user',
                        select: ('avatarUri name')
                    })
                    .populate({
                        path: 'userLiked',
                        model: 'user',
                        select: ('avatarUri name ')
                    })
                    .then(tour => {
                        fs.unlink('./public/videos/' + oldUri, err => {
                            if (err) {
                                reject(err);
                            }
                        });
                        fs.unlink('./public/videos/' + oldUriThumb, err => {
                            if (err) {
                                reject('error unlink');
                            }
                        });
                        resolve({
                            _id: tour._id,
                            name: tour.name,
                            description: tour.description,
                            start_time: tour.start_time,
                            end_time: tour.end_time,
                            status: tour.status,
                            creator: tour.creator,
                            permission: tour.permission,
                            posterUri: tour.posterUri,
                            vihicle: tour.vihicle,
                            accommodation: tour.accommodation,
                            place: tour.place,
                            userLiked: tour.userLiked
                        });
                    })
                    .catch(err => {
                        reject(err);
                    });
            })
            .catch(err => {
                reject(err);
            });
    });
exports.getListNewsOfTour = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        authenticate.checkToken(token_content)
            .then(token => {
                tourDB.tour.findOne({_id: tourId}, {news: 1, creator: 1, posterUri: 1, userAccepted: 1})
                    .populate({
                        path: 'news',
                        model: 'news',
                        select: ('creator time content comments likes pictureUri'),
                        populate: [{
                            path: 'creator',
                            model: 'user',
                            select: ('name avatarUri')
                        },
                            {
                                path: 'likes',
                                model: 'user',
                                select: ('name avatarUri')
                            }
                        ]
                    })
                    .populate({
                        path: 'creator',
                        model: 'user',
                        select: ('name avatarUri')
                    })
                    .then(tour => {
                        if (null === tour.videoUri) {
                            resolve({
                                _id: tour._id,
                                tourOwner: tour.creator,
                                posterUri: tour.posterUri,
                                videoUri: '',
                                contentVideo: '',
                                timeVideo: '',
                                thumbnailUri: '',
                                news: tour.news
                            });
                        } else {
                            resolve({
                                _id: tour._id,
                                tourOwner: tour.creator,
                                posterUri: tour.posterUri,
                                videoUri: tour.videoUri,
                                contentVideo: tour.contentVideo,
                                timeVideo: tour.timeVideo,
                                thumbnailUri: tour.thumbnailUri,
                                news: tour.news
                            });
                        }

                    })
                    .catch(err => {
                        reject(err);
                    });
            });
    });

//like and follow tour
exports.followTour = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        var id;
        authenticate.checkToken(token_content)
            .then(token => {
                return userDB.user.findById(token.userId);
            })
            .then(user => {
                user.tourFollowed.push(tourId);
                user.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                id = user._id;
                return tourDB.tour.findById(tourId);
            })
            .then(tour => {
                if (tour.userFollowed.map(String).includes(String(id))) {
                    reject("Aready followed this tour");
                } else {
                    tour.userFollowed.push(id);
                    tour.save(err => {
                        if (err) {
                            reject(err);
                        }
                    });
                    var payload = sender.setPayLoad("like tour", "0", String(mUser._id), mUser.avatarUri, mUser.name, String(tour._id), tour.name, String(tour.creator), tour.posterUri, "", "0", String(tour.userLiked.length));
                    var topic = 'user_' + String(tour.creator);

                    //send notification to creator
                    sender.sendMessage(topic, payload)
                        .then(response => {
                            console.log("Successfully sent message:", response);
                        })
                        .catch(error => {
                            console.log("Error sending message:", error);
                        });
                    resolve(tour);
                }
            });
    });
exports.unfollowTour = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        var id;
        authenticate.checkToken(token_content)
            .then(token => {
                return userDB.user.findById(token.userId);
            })
            .then(user => {
                user.tourFollowed.push(tourId);
                user.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                id = user._id;
                return tourDB.tour.findById(tourId);
            })
            .then(tour => {
                if (!tour.userFollowed.map(String).includes(String(id))) {
                    reject("Have not followed!");
                } else {
                    tour.userFollowed.remove(id);
                    tour.save(err => {
                        if (err) {
                            reject(err);
                        }
                    });
                    resolve(tour);
                }
            });
    });
exports.likeTour = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        var mUser;
        var like;
        authenticate.checkToken(token_content)
            .then(token => {
                return userDB.user.findById(token.userId);
            })
            .then(user => {
                mUser = user;

                if (!user.tourLiked.map(String).includes(String(tourId))) {
                    user.tourLiked.push(tourId);
                    like = true;
                    user.save(err => {
                        if (err) {
                            reject(err);
                        }
                    });
                    return tourDB.tour.findById(tourId);
                } else {
                    like = false;
                    user.tourLiked.remove(tourId);
                    user.save(err => {
                        if (err) {
                            reject(err);
                        }
                    });
                    return tourDB.tour.findById(tourId);
                }
            })
            .then(tour => {
                if (like == true) {
                    console.log('like');
                    tour.userLiked.push(mUser._id);
                } else {
                    console.log('unlike');
                    tour.userLiked.remove(mUser._id);
                }
                tour.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                if (String(tour.creator) !== String(mUser._id)) {
                    if (like == true) {
                        notifyDomain.createNotify(tour.creator, "like tour", 0, mUser._id, mUser.avatarUri, mUser.name, tour._id, tour.name, tour.creator, tour.posterUri, "", 0, tour.userLiked.length);
                        var payload = sender.setPayLoad("like tour", "0", String(mUser._id), mUser.avatarUri, mUser.name, String(tour._id), tour.name, String(tour.creator), tour.posterUri, "", "0", tour.userLiked.length.toString());
                        var topic = 'user_' + String(tour.creator);

                        // send notification to creator
                        sender.sendMessage(topic, payload)
                            .then(response => {
                                console.log("Successfully sent message:", response);
                            })
                            .catch(error => {
                                console.log("Error sending message:", error);
                            });
                    }
                    resolve('Like successfully!');
                } else {
                    resolve('Like successfully!');
                }
            })
            .catch(err => {
                reject(err);
            });
    });

//manage member
exports.inviteNewMember = (token_content, tourId, userId) =>
    new Promise((resolve, reject) => {
        var mTour;
        authenticate.checkCreatorTourPermission(token_content, tourId)
            .then(tour => {
                mTour = tour;
                return checkStatusTourAndUser(userId, tourId);
            })
            .then(result => {
                if (result === '5') {
                    mTour.userInvited.push(userId);
                    mTour.save(err => {
                        if (err) {
                            reject(err);
                        }
                    });
                    return userDB.user.findById(userId);
                } else {
                    reject('Cannot invite this user!');
                }
            })
            .then(user => {
                user.tourInvited.push(mTour._id);
                user.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                userDB.user.findById(mTour.creator)
                    .then(tmpUser => {
                        notifyDomain.createNotify(userId, "invite_to_tour", 4, tmpUser._id, tmpUser.avatarUri, tmpUser.name, mTour._id, mTour.name, mTour.creator, mTour.posterUri, null, 0, 0);

                        //send notification to invited one
                        var payload = sender.setPayLoad('invite_to_tour', "4", String(tmpUser._id), tmpUser.avatarUri, tmpUser.name, String(mTour._id), mTour.name, String(mTour.creator), mTour.posterUri, "", '0', '0');
                        sender.sendMessage(('user_' + userId), payload)
                            .then(response => {
                                console.log(response)
                            })
                            .catch(err => console.log(err));
                    })
                    .catch(err => reject(err));
                resolve({member: [{_id: user._id, name: user.name, avatarUri: user.avatarUri}]});
            })
            .catch(err => {
                if (err) {
                    reject(err);
                }
            });
    });
exports.getTourMember = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        var mToken;
        authenticate.checkToken(token_content)
            .then(token => {
                mToken = token;
                return tourDB.tour.findById(tourId)
                    .populate({
                        path: 'userAccepted',
                        model: 'user',
                        select: ('name avatarUri')
                    });
            })
            .then(tour => {
                resolve({member: tour.userAccepted});
            })
            .catch(err => {
                reject(err);
            });
    });
exports.acceptJoinTour = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        var mUser;
        var mTour;
        authenticate.checkToken(token_content)
            .then(token => {
                return userDB.user.findById(token.userId);
            })
            .then(user => {
                mUser = user;
                return checkStatusTourAndUser(user._id, tourId);
            })
            .then(result => {
                if (result === '4') {
                    mUser.tourInvited.remove(tourId);
                    mUser.tourMember.push(tourId);
                    mUser.save(err => {
                        if (err) {
                            reject(err);
                        }
                    });
                    return (tourDB.tour.findById(tourId));
                } else {
                    reject('tour not invite you!');
                }
            })
            .then(tour => {
                mTour = tour;
                tour.userInvited.remove(mUser._id);
                tour.userAccepted.push(mUser._id);
                tour.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                notifyDomain.deleteNotifyAcceptJoin(mUser._id, tour._id, 4);
                notifyDomain.createNotify(tour.creator, "response_request_invite_tour", 6, mUser._id, mUser.avatarUri, mUser.name, tour._id, tour.name, tour.creator, tour.posterUri, null, 1, 0);

                //send notification to tour creator
                var payload = sender.setPayLoad('response_request_invite_tour', "6", String(mUser._id), mUser.avatarUri, mUser.name, String(tour._id), tour.name, String(tour.creator), tour.posterUri, "", '1', '0');
                sender.sendMessage('user_' + String(tour.creator), payload)
                    .then(response => {
                        console.log(response)
                    })
                    .catch(err => console.log(err));
                if (tour.roadMap != null) {
                    return roadMapDB.roadMap.findById(tour.roadMap);
                } else {
                    resolve(tour.userAccepted);
                }
            })
            .then(roadMap => {
                memberLocationDomain.createMemLocation(mUser.name, '0', '0', mTour._id, mUser._id)
                    .then(memberLocation => {
                        resolve(mTour.userAccepted);
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
            .catch(err => {
                if (err) {
                    reject(err);
                }
            });
    });
exports.rejectJoinTour = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        var mUser;
        authenticate.checkToken(token_content)
            .then(token => {
                return userDB.user.findById(token.userId);
            })
            .then(user => {
                mUser = user;
                return checkStatusTourAndUser(user._id, tourId);
            })
            .then(result => {
                if (result == '4') {
                    mUser.tourInvited.remove(tourId);
                    mUser.tourRejected.push(tourId);
                    mUser.save(err => {
                        if (err) {
                            reject(err);
                        }
                    });
                    return (tourDB.tour.findById(tourId));
                } else {
                    reject('tour not invite you!');
                }
            })
            .then(tour => {
                tour.userInvited.remove(mUser._id);
                tour.userRejected.push(mUser._id);
                tour.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                notifyDomain.deleteNotifyAcceptJoin(mUser._id, tour._id, 4);
                notifyDomain.createNotify(tour.creator, "response_request_invite_tour", 6, mUser._id, mUser.avatarUri, mUser.name, tour._id, tour.name, tour.creator, tour.posterUri, null, 0, 0);

                //send notification to creator
                var payload = sender.setPayLoad('reject_join_tour', "6", String(mUser._id), mUser.avatarUri, mUser.name, String(tour._id), tour.name, String(tour.creator), tour.posterUri, "", '0', '0');
                sender.sendMessage('user_' + tour.creator)
                    .then(response => {
                        console.log(response)
                    })
                    .catch(err => console.log(err));
                resolve(tour.userRejected);
            })
            .catch(err => {
                if (err) {
                    reject(err);
                }
            });
    });
exports.removeMember = (token_content, tourId, userId) =>
    new Promise((resolve, reject) => {
        var mTour;
        authenticate.checkCreatorTourPermission(token_content, tourId)
            .then(tour => {
                mTour = tour;
                return userDB.user.findOne({_id: userId});
            })
            .then(user => {
                mTour.userAccepted.remove(user._id);
                mTour.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                user.tourMember.remove(mTour._id);
                user.save(err => {
                    if (err) {
                        reject(err);
                    }
                });

                resolve(mTour.userAccepted);
            })
            .catch(err => {
                reject(err);
            });
    });
exports.leaveTours = (token_content, tourId, registrationToken) =>
    new Promise((res, rej) => {
        var mUser;
        authenticate.checkToken(token_content)
            .then(token => {
                return userDB.user.findById(token.userId);
            })
            .then(user => {
                mUser = user;
                return checkStatusTourAndUser(user._id, tourId);
            })
            .then(result => {
                if (result === '2') {
                    return tourDB.tour.findById(tourId);
                } else {
                    rej("err");
                }
            })
            .then(tour => {
                tour.userAccepted.remove(mUser._id);
                tour.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                mUser.tourMember.remove(tour._id);
                mUser.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                notifyDomain.createNotify(tour.creator, "leave_tour’ ", 3, mUser._id, mUser.avatarUri, mUser.name, tour._id, tour.name, tour.creator, tour.posterUri, null, 0, 0);
                //send notification to creator
                var payload = sender.setPayLoad('leave_tour', "3", String(mUser._id), mUser.avatarUri, mUser.name, String(tour._id), tour.name, String(tour.creator), tour.posterUri, "", '0', '0');
                sender.sendMessage('user_' + String(tour.creator), payload)
                    .then(response => {
                        console.log(response)
                    })
                    .catch(err => console.log(err));
                res(tour.userAccepted);
            })
            .catch(err => {
                rej(err);
            });
    });
exports.requestJoinTour = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        var mUser;
        authenticate.checkToken(token_content)
            .then(token => {
                return userDB.user.findById(token.userId);
            })
            .then(user => {
                mUser = user;
                return checkStatusTourAndUser(user._id, tourId);
            })
            .then(result => {
                console.log("result: " + result);
                if (result == '5') {
                    mUser.tourPending.push(tourId);
                    mUser.save(err => {
                        if (err) {
                            reject(err);
                        }
                    });
                    return tourDB.tour.findById(tourId);
                } else {
                    reject('Can not request to join this tour');
                }
            })
            .then(tour => {
                tour.userPending.push(mUser._id);
                tour.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                notifyDomain.createNotify(tour.creator, "request join tour", 2, mUser._id, mUser.avatarUri, mUser.name, tour._id, tour.name, tour.creator, tour.posterUri, null, 0, 0);

                //send notification to creator
                var payload = sender.setPayLoad('request join tour', "2", String(mUser._id), mUser.avatarUri, mUser.name, String(tour._id), tour.name, String(tour.creator), tour.posterUri, "", "0", "0");
                console.log("aaa")
                sender.sendMessage('user_' + String(tour.creator), payload)
                    .then(response => {
                        console.log(response)
                    })
                    .catch(err => console.log(err));

                resolve(tour.userPending);
            })
            .catch(err => {
                reject(err);
            });
    });
exports.acceptUser = (token_content, userId, tourId) =>
    new Promise((resolve, reject) => {
        var mTour;
        authenticate.checkCreatorTourPermission(token_content, tourId)
            .then(tour => {
                mTour = tour;
                return checkStatusTourAndUser(userId, tourId);
            })
            .then(result => {
                if (result === '1') {
                    mTour.userAccepted.push(userId);
                    mTour.userPending.remove(userId);
                    mTour.save(err => {
                        if (err) {
                            reject(err);
                        }
                    });
                    return userDB.user.findById(userId);
                } else {
                    reject('user not request this tour!');
                }
            })
            .then(user => {
                user.tourPending.remove(mTour._id);
                user.tourMember.push(mTour._id);
                user.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                userDB.user.findById(mTour.creator)
                    .then(tmpUser => {
                        notifyDomain.deleteNotifyAcceptJoin(userId, mTour._id, 2);
                        notifyDomain.createNotify(userId, "response_request_join_tour", 5, tmpUser._id, tmpUser.avatarUri, tmpUser.name, mTour._id, mTour.name, mTour.creator, mTour.posterUri, null, 1, 0);

                        //send notification to user
                        var payload = sender.setPayLoad("response_request_join_tour", "5", String(tmpUser._id), tmpUser.avatarUri, tmpUser.name, String(mTour._id), mTour.name, String(mTour.creator), mTour.posterUri, "", "1", "0")
                        sender.sendMessage('user_' + String(userId), payload)
                            .then(response => {
                                console.log(response);
                            })
                            .catch(err => {
                                console.log(err);
                            });
                        if (mTour.roadMap == null) {
                            resolve({member: [{_id: user._id, name: user.name, avatarUri: user.avatarUri}]});
                        } else {
                            return roadMapDB.roadMap.findById(mTour.roadMap);
                        }
                    })
                    .then(roadMap => {
                        memberLocationDomain.createMemLocation(mUser.name, '0', '0', mTour._id, mUser._id)
                            .then(memberLocation => {
                                resolve(mTour.userAccepted);
                            })
                            .catch(err => {
                                reject(err);
                            })
                    })
                    .catch(err => {
                        if (err) {
                            reject(err);
                        }
                    });
            })
            .catch(err => {
                if (err) {
                    reject(err);
                }
            });
    });
exports.rejectUser = (token_content, userId, tourId) =>
    new Promise((resolve, reject) => {
        var mTour;
        authenticate.checkCreatorTourPermission(token_content, tourId)
            .then(tour => {
                mTour = tour;
                return checkStatusTourAndUser(userId, tourId);
            })
            .then(result => {
                if (result == '1') {
                    mTour.userRejected.push(userId);
                    mTour.userPending.remove(userId);
                    mTour.save(err => {
                        if (err) {
                            reject(err);
                        }
                    });
                    return userDB.user.findById(userId);
                } else {
                    reject('user not request this tour!');
                }
            })
            .then(user => {
                user.tourPending.remove(mTour._id);
                user.tourRejected.push(mTour._id);
                user.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                userDB.user.findById(mTour.creator)
                    .then(tmpUser => {
                        notifyDomain.deleteNotifyAcceptJoin(userId, mTour._id, 2);
                        notifyDomain.createNotify(userId, "response_request_join_tour", 5, tmpUser._id, tmpUser.avatarUri, tmpUser.name, mTour._id, mTour.name, mTour.creator, mTour.posterUri, null, 0, 0);
                        //send notification to user
                        var payload = sender.setPayLoad("response_request_join_tour", "5", String(tmpUser._id), tmpUser.avatarUri, tmpUser.name, String(mTour._id), mTour.name, String(mTour.creator), mTour.posterUri, "", "0", "0")
                        sender.sendMessage('user_' + String(userId), payload)
                            .then(response => {
                                console.log(response);
                            })
                            .catch(err => {
                                console.log(err);
                            });

                        resolve(user.tourMember);
                    })
                    .catch(err => reject(err));
            })
            .catch(err => {
                if (err) {
                    reject(err);
                }
            });
    });
exports.getAllMember = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        authenticate.checkCreatorTourPermission(token_content, tourId)
            .then(tour => {
                return tourDB.tour.findById(tour._id)
                    .populate({
                        path: 'userAccepted',
                        model: 'user',
                        select: ('name avatarUri')
                    })
                    .populate({
                        path: 'userPending',
                        model: 'user',
                        select: ('name avatarUri')
                    })
                    .populate({
                        path: 'userRejected',
                        model: 'user',
                        select: ('name avatarUri')
                    })
                    .populate({
                        path: 'userInvited',
                        model: 'user',
                        select: ('name avatarUri')
                    });
            })
            .then(tour => {
                resolve({
                    member: tour.userAccepted,
                    userPending: tour.userPending,
                    userRejected: tour.userRejected,
                    userInvited: tour.userInvited
                });
            })
            .catch(err => {
                reject(err);
            });
    });

exports.removeInvited = (token_content, tourId, userId) =>
    new Promise((resolve, reject) => {
        authenticate.checkCreatorTourPermission(token_content, tourId)
            .then(tour => {
                tour.userInvited.remove(userId);
                tour.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                return userDB.user.findById(userId);
            })
            .then(user => {
                user.tourInvited.remove(tourId);
                user.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                resolve(user._id);
            })
            .catch(err => {
                if (err) {
                    reject(err);
                }
            });
    });
exports.searchUserByPhone = (token_content, phone) =>
    new Promise((resolve, reject) => {
        authenticate.checkToken(token_content)
            .then(token => {
                return userDB.user.find({phoneNumber: phone});
            })
            .then(users => {
                if (users.length == 0) {
                    resolve('');
                } else {
                    resolve({member: [{_id: users[0]._id, name: users[0].name, avatarUri: users[0].avatarUri}]});
                }
            })
            .catch(err => {
                if (err) {
                    reject(err);
                }
            });
    });
exports.checkuser = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        var u;
        authenticate.checkToken(token_content)
            .then(token => {
                return userDB.user.findById(token.userId);
            })
            .then(user => {
                u = user;
                return tourDB.tour.findById(tourId);
            })
            .then(tour => {
                if (String(tour.creator) == String(u._id)) {
                    resolve('1');
                } else if (String(tour.userAccepted).includes(String(u._id))) {
                    resolve('2');
                } else if (String(tour.userInvited).includes(String(u._id))) {
                    resolve('3');
                } else {
                    resolve('4');
                }
            })
            .catch(err => {
                reject(err);
            });
    });

exports.getAllImageTour = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        authenticate.checkTourMemberPermission(token_content, tourId)
            .then(tour => {
                return tourDB.tour.findById(tourId)
                    .populate({
                        path: 'news',
                        model: 'news',
                        select: ('pictureUri')
                    });
            })
            .then(tour => {
                var listImage = [];
                if (tour.posterUri != null && tour.posterUri != '') {
                    listImage.push(tour.posterUri);
                }
                var count = tour.news.length;
                for (var i = 0; i < count; i++) {
                    var images = tour.news[i].pictureUri;
                    for (var j = 0; j < images.length; j++) {
                        if (fs.existsSync('./public/images/' + images[j]))
                            listImage.push(images[j]);
                    }
                }
                resolve(listImage);
            })
            .catch(err => {
                reject(err);
            });
    });
exports.checkMember = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        authenticate.checkTourMemberPermission(token_content, tourId)
            .then(tour => {
                resolve({result: "true"});
            })
            .catch(err => {
                reject({result: "false"});
            });
    });

exports.createRoadMap = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        var mTour;
        authenticate.checkCreatorTourPermission(token_content, tourId)
            .then(tour => {
                mTour = tour;
                if (mTour.roadMap == null) {
                    return userDB.user.findById(tour.creator);
                } else {
                    reject('roadmap has been created for the tour')
                }
            })
            .then(user => {
                // user.save(err => {
                //     if (err)
                //         reject(err);
                // });
                //create new road map
                var roadMap = new roadMapDB.roadMap({
                    start_point_lat: 0,
                    start_point_long: 0,
                    end_point_lat: 0,
                    end_point_long: 0,
                    start_point_name: "",
                    end_point_name: "",
                    tour: mTour._id,
                    member: []
                });
                roadMap.save(err => {
                    if (err)
                        reject(err);
                })
                //save to tour
                mTour.roadMap = roadMap._id;

                mTour.save(err => {
                    if (err)
                        reject(err);
                })
                //create memberlocation list
                var promises = [];
                for (var i = 0; i < mTour.userAccepted.length; i++) {
                    promises.push(
                        userDB.user.findOne({_id: mTour.userAccepted[i]})
                            .then(users => {
                                memberLocationDomain.createMemLocation(users.name, roadMap.start_point_lat, roadMap.start_point_long, mTour._id, users._id, mTour.roadMap)
                                    .then(memberLocation => {
                                        if (String(memberLocation.user) == String(mTour.creator)) {
                                            memberLocation.enableLocation = '1';
                                            memberLocation.save(err => {
                                                if (err)
                                                    reject(err)
                                            })
                                        }
                                        console.log('memlocation: ' + memberLocation)
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    })
                            })
                    );
                }
                Q.all(promises)
                    .then(() => {
                        return memberLocationDomain.findMemberLocation(user._id, mTour._id);
                    })
                    .catch(err => {
                        reject(err)
                    });
            })
            .then(memberLocation => {
                resolve(memberLocation)
            })
            .catch(err => {
                reject(err);
            })
    })
exports.updateRoadMap = (token_content, tourId, start_point_lat, start_point_long, end_point_lat, end_point_long, start_name, end_name) =>
    new Promise((resolve, reject) => {
        var mRoadMap;
        var mTour;
        authenticate.checkCreatorTourPermission(token_content, tourId)
            .then(tour => {
                mTour = tour;
                return roadMapDB.roadMap.findOneAndUpdate({_id: tour.roadMap},
                    {
                        $set:
                            {
                                start_point_lat: start_point_lat,
                                start_point_long: start_point_long,
                                end_point_lat: end_point_lat,
                                end_point_long: end_point_long,
                                start_point_name: start_name,
                                end_point_name: end_name
                            }
                    }, {new: true})
            })
            .then(roadMap => {
                mRoadMap = roadMap;
                return memberLocationDomain.findActiveMember(token_content, tourId);
            })
            .then(memberLocations => {
                var payload = {
                    data: {
                        'typeNotify': '15',
                        '_id': String(mRoadMap._id),
                        'start_point_lat': String(mRoadMap.start_point_lat),
                        "start_point_long": String(mRoadMap.start_point_long),
                        'end_point_lat': String(mRoadMap.end_point_lat),
                        'end_point_long': String(mRoadMap.end_point_long)
                    }
                };
                var promises = [];
                for (var i = 0; i < memberLocations.length; i++) {
                    if (String(memberLocations[i].user) != String(mTour.creator)) {
                        promises.push(sender.sendMessage('user_' + String(memberLocations[i].user), payload)
                            .then(response => {
                                console.log(response);
                            })
                            .catch(err => {
                                console.log(err)
                            })
                        )
                    }
                }
                Q.all(promises)
                    .then(() => {
                        resolve({roadMap: mRoadMap._id});
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
            .catch(err => {
                reject(err);
            })
    })
exports.updateCurrentLocation = (token_content, tourId, lat, lng) =>
    new Promise((resolve, reject) => {
        var mUserId;
        tokenDB.token.findOne({content: token_content})
            .then(token => {
                mUserId = token.userId;
                return authenticate.checkTourMemberPermission(token_content, tourId)
            })
            .then(tour => {
                return memberLocationDomain.updateMemberLocation(token_content, tour._id, lat, lng);
            })
            .then(memberLocation => {
                // var payload = { _id: specialLocation._id, title: specialLocation.title, image: specialLocation.image, content: specialLocation.content, lat: specialLocation.lat, lng: specialLocation.lng };
                resolve(memberLocation);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            })
    })

exports.getRoadMapInfo = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        authenticate.checkTourMemberPermission(token_content, tourId)
            .then(tour => {
                return roadMapDB.roadMap.findOne({_id: tour.roadMap})
                    .populate({
                        path: 'specialLocation',
                        model: 'specialLocation',
                        select: ('title content lat lng roadMap imageUri')
                    })
            })
            .then(roadMap => {
                resolve({
                    road_map: {
                        _id: roadMap._id,
                        start_point_lat: roadMap.start_point_lat,
                        start_point_long: roadMap.start_point_long,
                        end_point_lat: roadMap.end_point_lat,
                        end_point_long: roadMap.end_point_long,
                        start_point_name: roadMap.start_point_name,
                        end_point_name: roadMap.end_point_name
                    }, special_location: roadMap.specialLocation, member: roadMap.member
                })
            })
            .catch(err => {
                reject(err);
            })
    })
exports.showall = () =>
    new Promise((resolve, reject) => {
        tourDB.tour.find({})
            .then(tour => {
                resolve(tour)
            })
            .catch(err => {
                reject(err);
            })
    })
exports.getTourOfCategory = (token_content, count, categoryId) =>
    new Promise((resolve, reject) => {
        authenticate.checkToken(token_content)
            .then(token => {
                return tourDB.tour.find({category: categoryId, permission: 0})
                    .populate({
                        path: 'creator',
                        model: 'user',
                        select: ('name avatarUri')
                    })
                    .populate({
                        path: 'schedule',
                        model: 'schedule',
                        select: ('time content')
                    })
                    .populate({
                        path: 'userLiked',
                        model: 'user',
                        select: ('name avatarUri')
                    })
            })
            .then(tours => {
                resolve(tours.slice((count - 1) * 10, count * 10 - 1))
            })
            .catch(err => {
                reject(err);
            })
    })
// function streamvideo(name,range) {
//     var path = './public/videos/' + name;
//     const stat = fs.statSync(path)
//     console.log(stat)
//     const fileSize = stat.size


//     if (range) {
//         console.log('1');
//         const parts = range.replace(/bytes=/, "").split("-")
//         console.log("parts: " + parts);
//         const start = parseInt(parts[0], 10)
//         const end = parts[1]
//             ? parseInt(parts[1], 10)
//             : fileSize - 1
//         console.log('start: ' + start + ' end ' + end);
//         const chunksize = (end - start) + 1
//         const file = fs.createReadStream(path, { start, end })
//         const head = {
//             'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//             'Accept-Ranges': 'bytes',
//             'Content-Length': chunksize,
//             'Content-Type': 'video/mp4',
//         }

//         res.writeHead(206, head)
//         file.pipe(res)
//     } else {
//         console.log('2')
//         const head = {
//             'Content-Length': fileSize,
//             'Content-Type': 'video/mp4',
//         }
//         res.writeHead(200, head)
//         fs.createReadStream(path).pipe(res)
//     }
// }
function checkStatusTourAndUser(userId, tourId) {
    return new Promise((resolve, reject) => {
        tourDB.tour.findById(tourId)
            .then(tour => {
                console.log('userInvited: ' + String(tour.userInvited.map(String).includes(String(userId))));
                if (tour.userPending.map(String).includes(String(userId))) {
                    resolve('1');
                } else if (tour.userAccepted.map(String).includes(String(userId))) {
                    resolve('2');
                } else if (tour.userRejected.map(String).includes(String(userId))) {
                    resolve('3');
                } else if (tour.userInvited.map(String).includes(String(userId))) {
                    resolve('4');
                } else {
                    resolve('5');
                }
            })
            .catch(err => {
                if (err) {
                    reject(err);
                }
            });
    });
} 