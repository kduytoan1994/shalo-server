/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const userDB = require('../database/users');
const tourDB = require('../database/tour');
const authenticate = require('../authenticate/authenticate');
function result(res, success, des, code, data) {
    res({message: {success: success, description: des, code: code}, data: data});
}
const rs = require("randomstring");
exports.deleteNotifyAcceptJoin = (userId, tourId, typeNotify) =>
    new Promise((res, rej) => {
        userDB.user.findById(userId)
                .then(user => {
                    var len = user.notifications.length;
                    console.log('deleteNotifyAcceptJoin: ' + typeNotify);
                    for (var i = 0; i < len; i++) {
                        if (String(user.notifications[i].tour_id) === String(tourId) && user.notifications[i].typeNotify === typeNotify) {
                            user.notifications.remove(user.notifications[i]);
                            user.save(err => {
                                if (err) {
                                    console.log("deleteNotifyAcceptJoin err: " + typeNotify);
                                    rej(err);
                                }
                            });
                            break;
                        }
                    }
                    res(user);
                })
                .catch(err => rej(err));
    });
exports.deleteNotifyLikeNews = (userId, newsId, typeNotify) =>
    new Promise((res, rej) => {
        userDB.user.findById(userId)
                .then(user => {
                    var len = user.notifications.length;
                    for (var i = 0; i < len; i++) {
                        if (String(user.notifications[i].news_id) === String(newsId) && user.notifications[i].typeNotify === typeNotify) {
                            user.notifications.remove(user.notifications[i]);
                            user.save((err) => {
                                if (err) {
                                    console.log("deleteNotifyLike err: " + typeNotify);
                                    rej(err);
                                }
                            });
                            break;
                        }
                    }
                    res(user);
                })
                .catch(err => rej(err));
    });
exports.deleteNotifyLikeTour = (userId, tourId, typeNotify) =>
    new Promise((res, rej) => {
        userDB.user.findById(userId)
                .then(user => {
                    var len = user.notifications.length;
                    for (var i = 0; i < len; i++) {
                        if (String(user.notifications[i].tour_id) === String(tourId) && user.notifications[i].typeNotify === typeNotify) {
                            user.notifications.remove(user.notifications[i]);
                            user.save(err => {
                                if (err) {
                                    console.log("deleteNotifyLikeTour err: " + typeNotify);
                                    rej(err);
                                }
                            });
                            break;
                        }
                    }
                    res(user);
                })
                .catch(err => rej(err));
    });
exports.deleteNotifyFollow = (user, userId2, typeNotify) =>
    new Promise((res, rej) => {
        var len = user.notifications.length;
        for (var i = 0; i < len; i++) {
            if (String(user.notifications[i].id_user) === String(userId2) && user.notifications[i].typeNotify === typeNotify) {
                user.notifications.remove(user.notifications[i]);
                user.save(err => {
                    console.log("deleteNotifyFollow err");
                    rej(err);
                });
                break;
            }
        }
        res(user);
    });

exports.createNotify = (mId, content, typeNotify, id_user, avatar_user, name_user, tour_id, tour_name, tour_creator, avatar_tour, news_id, result_request, number_like_post) =>
    new Promise((res, rej) => {
        userDB.user.findOne({_id: mId})
                .then(user => {
                    var time = new Date().getTime();
                    var id = rs.generate({length: 32}) + '' + time;
                    var notify1 = {
                        notifyId: id,
                        content_summary: content,
                        typeNotify: typeNotify,
                        status: 0,//chua doc
                        time: time,
                        number_like_post: number_like_post,
                        id_user: id_user,
                        avatar_user: avatar_user,
                        name_user: name_user,
                        tour_id: tour_id,
                        tour_name: tour_name,
                        tour_creator: tour_creator,
                        avatar_tour: avatar_tour,
                        news_id: news_id,
                        result_request: result_request
                    };

                    user.notifications.push(notify1);
                    user.save(err => {
                        if (err) {
                            console.log("err: createNotify " + err);
                            rej(err);
                        }
                    });
                    res(user.notifications.length);
                })
                .catch(err => {
                    rej(err);
                });
    });

exports.markNotifyRead = (token_content, notify_id) =>
    new Promise((res, rej) => {
        authenticate.checkToken(token_content)
                .then(token => {
                    userDB.user.findOneAndUpdate({_id: token.userId, 'notifications.notifyId': notify_id}, {'$set': {'notifications.$.status': 1}})
                            .then(user => result(res, notify_id + '', "", 203, {}))
                            .catch(err => result(rej, "0", "find and update user", 404, {}));
                })
                .catch(err => result(rej, "0", "check token", 404, {}));
    });
exports.markNotifyToNotRead = (token_content, notify_id) =>
    new Promise((res, rej) => {
        authenticate.checkToken(token_content)
                .then(token => {
                    userDB.user.findOneAndUpdate({_id: token.userId, 'notifications.notifyId': notify_id}, {'$set': {'notifications.$.status': 0}})
                            .then(user => result(res, notify_id + '', "", 203, {}))
                            .catch(err => result(rej, "0", "find and update user", 404, {}));
                })
                .catch(err => result(rej, "0", "check token", 404, {}));
    });
function addNotifyResult(listNoti, notify) {
    listNoti.push({
        notifyId: notify.notifyId,
        type: notify.typeNotify,
        id_user: notify.id_user,
        name_user: notify.name_user,
        id_tour: notify.tour_id,
        creator_tour: notify.tour_creator,
        name_tour: notify.tour_name,
        avatar_tour: notify.avatar_tour,
        avatar_user: notify.avatar_user,
        date_time: notify.time,
        result_request: notify.result_request,
        content_summary: notify.content_summary,
        number_like_post: notify.number_like_post,
        id_post: notify.news_id,
        status: notify.status
    });
}
;
exports.getListNotify = (token_content, numberPage) =>
    new Promise((res, rej) => {
        authenticate.checkToken(token_content)
                .then(token => {
                    userDB.user.findById(token.userId)
                            .then(user => {
                                var len = user.notifications.length;
                                var listNoti = [];
                                var startItem = len - numberPage * 10 - 1;

                                if (startItem >= 0) {
                                    var lastItem = startItem - 10;
                                    if (lastItem <= 0) {
                                        lastItem = 0;
                                    }
                                    for (var i = startItem; i >= lastItem; i--) {
                                        addNotifyResult(listNoti, user.notifications[i]);
                                    }
                                }
                                result(res, "1", '', 200, listNoti);
                            })
                            .catch(err => result(rej, "0", 'find User', 404, err));
                })
                .catch(err => result(rej, "0", 'Check token', 404, err));
    });

exports.markAllRead = (content) =>
    new Promise((res, rej) => {
        if (content) {
            authenticate.checkToken(content)
                    .then(token => {
                        userDB.user.findById(token.userId)
                                .then(user => {
                                    var len = user.notifications.length;
                                    var listNoti = [];
                                    var lastItem = 9;
                                    for (var i = 0; i < len; i++) {
                                        user.notifications[i].status = 1;
                                        user.save((err) => {
                                            if (err) {
                                                result(res, "0", 'save user error', 404, err);
                                            }
                                        });
                                        if (i <= lastItem) {
                                            addNotifyResult(listNoti, user.notifications[i]);
                                        }
                                    }
                                    result(res, "1", '', 200, listNoti);
                                })
                                .catch(err => result(rej, "0", 'find and update error', 404, err));
                    })
                    .catch(err => result(rej, "0", 'check token error', 404, err));
        } else {
            result(rej, "0", 'Missing field', 404, {});
        }
    });
exports.deleteAllRead = (content) =>
    new Promise((res, rej) => {
        if (content) {
            authenticate.checkToken(content)
                    .then(token => {
                        userDB.user.findById(token.userId)
                                .then(user => {
                                    var len = user.notifications.length;
                                    var listNoti = [];
                                    var numItem = 0;
                                    for (var i = 0; i < len; i++) {
                                        if (user.notifications[i].status === 1) {
                                            user.notifications.splice(user.notifications[i], 1);
                                            user.save((err) => {
                                                if (err)
                                                    result(rej, "0", '', 500, err);
                                            });
                                            i--;
                                            len--;
                                        } else {
                                            if (numItem <= 9) {
                                                addNotifyResult(listNoti, user.notifications[i]);
                                                numItem++;
                                            }
                                        }
                                    }
                                    result(res, "1", '', 200, listNoti);
                                })
                                .catch(err => result(rej, "0", 'findByIdAndUpdater', 404, err));
                    })
                    .catch(err => result(rej, "0", 'check token error', 404, err));
        } else {
            result(rej, "0", 'Missing field', 404, {});
        }
    });

