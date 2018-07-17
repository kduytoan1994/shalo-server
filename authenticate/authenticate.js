/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var tokenDB = require('../database/token');
var tourDB = require('../database/tour');
var userDB = require('../database/users');
var newsDB = require('../database/news');
var notifyDomain = require('../domain/notifyDomain');

exports.createNewToken = (content, userId) =>
    new Promise((resolve, reject) => {

        var newToken = new tokenDB.token({
            userId: userId,
            content: content
        }, err => {
            if (err) {
                reject(err);
            }
        });
        newToken.save()
            .then(token => {
                resolve(token);
            })
            .catch(err => reject(err));
    });

exports.checkToken = (content) =>
    new Promise((resolve, reject) => {
        tokenDB.token.findOne({content: content})
            .then(token => {
                resolve(token);
            })
            .catch(err => reject(err));
    });
exports.checkUserByToken = (content, userId) =>
    new Promise((resolve, reject) => {
        tokenDB.token.findOne({content: content})
            .then(token => {
                if (token.userId !== userId) {
                    reject("No permission!");
                } else {
                    resolve(token);
                }
            })
            .catch(err => rej(err));

    });
exports.getUserByToken = (content) =>
    new Promise((resolve, reject) => {
        tokenDB.token.findOne({content: content})
            .then(token => {
                return userDB.user.findById(token.userId);
            })
            .then(user => {
                console.log('user: ' + user)
                resolve(user);
            })
            .catch(err => {
                reject(err);
            })
    })
exports.checkCreatorTourPermission = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        var u;
        tokenDB.token.findOne({content: token_content})
            .then(token => {
                return userDB.user.findById(token.userId);
            })
            .then(user => {
                u = user;
                return tourDB.tour.findById(tourId);
            })
            .then(tour => {
                if (String(tour.creator) == String(u._id)) {
                    resolve(tour);

                } else {
                    reject('No permission')
                }
            })
            .catch(err => {
                console.log("err");
                reject(err);
            });
    });
exports.checkTourMemberPermission = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        var u;
        tokenDB.token.findOne({content: token_content})
            .then(token => {
                return userDB.user.findById(token.userId);
            })
            .then(user => {
                u = user;
                return tourDB.tour.findOne({_id: tourId});
            })
            .then(tour => {
                if (tour.userAccepted.map(String).includes(String(u._id))) {
                    resolve(tour);
                } else {
                    reject('No Permission');
                }
            })
            .catch(err => {
                reject(err);
            });
    });

exports.checkNewsPermission = (token_content, newsId) =>
    new Promise((resolve, reject) => {
        var mToken;
        var mNews;
        tokenDB.token.findOne({content: token_content})
            .then(token => {
                mToken = token;
                return newsDB.news.findOne({_id: newsId});
            })
            .then(news => {
                mNews = news;
                if (String(news.creator) === String(mToken.userId)) {
                    resolve(mNews);
                } else {
                    return tourDB.tour.findOne({_id: news.tour});
                }
            })
            .then(tour => {
                if (String(mToken.userId) === String(tour.creator)) {
                    notifyDomain.createNotify(mNews.creator, "admin_delete_post", 9, tour.creator, tour._id, mNews._id, 0);
                    resolve(mNews);
                } else {
                    reject('No Permission');
                }
            })
            .catch(err => {
                reject(err);
            });
    });
exports.deleteToken = (content) =>
    new Promise((res, rej) => {
        tokenDB.token.findOneAndRemove({content: content})
            .then(token => {
                console.log('delete token');
                res(token);
            })
            .catch(err => rej(err));
    });
exports.showAllToken = () =>
    new Promise((resolve, reject) => {
        tokenDB.token.find({})
            .then(tokens => {
                resolve(tokens);
            })
            .catch(err => {
                reject(err);
            })
    })