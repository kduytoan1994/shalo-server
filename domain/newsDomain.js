/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const newsDB = require('../database/news');
const auth = require('../authenticate/authenticate');
const userDB = require('../database/users');
const tourDB = require('../database/tour');
const commentDB = require('../database/comment');
const notifyDomain = require('../domain/notifyDomain');
const sender = require('../fcmSender/sender');
const fs = require('fs');
function result(res, success, des, code, data) {
    res({ message: { success: success, description: des, code: code }, data: data });
}

exports.likeNews = (content, newsId) =>
    new Promise((res, rej) => {
        var mUser;
        if (!content || !newsId) {
            result(rej, "0", 'Missing field', 200, {});
        } else {
            auth.checkToken(content)
                .then(token => {
                    return userDB.user.findById(token.userId);
                })
                .then(user => {
                    mUser = user;
                    return newsDB.news.findById(newsId);
                })
                .then(news => {
                    var index = news.likes.indexOf(mUser._id);
                    if (index === -1) {
                        news.likes.push(mUser._id);
                        news.save((err) => {
                            if (err) {
                                rej(result(rej, "0", 'save', 500, err));
                            }
                        });
                        if (String(news.creator) !== String(mUser._id)) {
                            tourDB.tour.findById(news.tour)
                                .then(tour => {
                                    notifyDomain.createNotify(news.creator, "like_news", 8, mUser._id, mUser.avatarUri, mUser.name, tour._id, tour.name, tour.creator, tour.posterUri, news._id, 0, news.likes.length);
                                    //send notification like post
                                    var payload = sender.setPayLoad("like_news", "8", String(mUser._id), mUser.avatarUri, mUser.name, String(tour._id), tour.name, String(tour.creator), tour.posterUri, String(news._id), "0", String(news.likes.length));
                                    sender.sendMessage('user_' + String(news.creator), payload)
                                        .then(response => { console.log(response); })
                                        .catch(err => { console.log(err); });
                                })
                                .catch(err => result(rej, "0", "find tour", "404", err));
                        }
                        result(res, "1", 'Like', 200, {});
                    } else {
                        news.likes.remove(mUser._id);
                        news.save((err) => {
                            if (err) {
                                result(rej, "0", 'err', 500, {});
                            }
                        });
                        if (String(news.creator) !== String(mUser._id)) {
                            notifyDomain.deleteNotifyLikeNews(news.creator, news._id, 8);
                        }
                        result(res, "1", 'disLike', 200, {});
                    }
                })
                .catch(err => result(rej, "0", "error", "404", err));
        }
    });
exports.createNews = (content, token_content, tourId, listImage) =>
    new Promise((resolve, reject) => {
        var mNewPost;
        var mUser;
        auth.checkToken(token_content)
            .then(token => {
                return userDB.user.findById(token.userId);
            })
            .then(user => {
                mUser = user;
                var time = new Date().getTime();
                var newPost = new newsDB.news({
                    content: content,
                    creator: user._id,
                    time: time,
                    tour: tourId
                });
                var len = listImage.length;
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        var img = listImage[i]['filename'];
                        var name = time + '' + i + img;
                        var newPath = './public/images/' + time + i + img;
                        fs.rename('./public/images/' + img, newPath, err => {
                            if (err) {
                                reject(err);
                            }
                        });
                        newPost.pictureUri.push(name);
                    }
                }
                newPost.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                mNewPost = newPost;
                return tourDB.tour.findById(tourId);
            })
            .then(tour => {
                tour.news.push(mNewPost._id);
                tour.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                var content_summary = mNewPost.pictureUri.length + '';
                var len = tour.userAccepted.length;
                for (var i = 0; i < len; i++) {
                    if (String(tour.userAccepted[i]) !== String(mNewPost.creator)) {
                        notifyDomain.createNotify(tour.userAccepted[i], content_summary, 7, mUser._id, mUser.avatarUri, mUser.name, tour.id, tour.name, tour.creator, tour.posterUri, mNewPost._id, 0, mNewPost.likes.length);
                        //send notification create news
                        var payload = sender.setPayLoad(content_summary, "7", String(mUser._id), String(mUser.avatarUri), mUser.name, String(tour._id), tour.name, String(tour.creator), tour.posterUri, String(mNewPost._id), "0", String(mNewPost.likes.length));
                        sender.sendMessage('user_' + String(tour.userAccepted[i]), payload)
                            .then(response => { console.log(response); })
                            .catch(err => { console.log(err); });
                    }
                }
                resolve({ newsId: mNewPost._id });
            })
            .catch(err => {
                reject(err);
            });
    });
exports.deleteNews = (token_content, newsId) => //nguoi tao tour or tạo news 
    new Promise((resolve, reject) => {
        auth.checkNewsPermission(token_content, newsId)
            .then(news => {
                news.remove();
            })
            .then(newsRemoved => {
                resolve(newsRemoved);
            })
            .catch(err => {
                reject(err);
            });
    });
exports.updateNews = (token_content, newsId, content, listimage) =>
    new Promise((resolve, reject) => {
        auth.checkNewsPermission(token_content, newsId)
            .then(news => {
                if (listimage.length > 0) {
                    for (var i = 0; i < listimage.length; i++) {
                        var imagename = listimage[i]['filename'];
                        var hashname = String(new Date().getTime()) + imagename;
                        var uri = './public/images/' + hashname;
                        fs.rename('./public/images/' + imagename, uri, function (err) {
                            if (err) {
                                reject(err);
                            }
                        });
                        news.pictureUri.push(hashname);
                    }
                }
                news.content = content;
                news.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                resolve(news);
            })
            .catch(err => {
                reject(err);
            });
    });
exports.deleteImageNews = (token_content, pictureUri, newsId) =>
    new Promise((resolve, reject) => {
        auth.checkNewsPermission(token_content, newsId)
            .then(news => {
                news.pictureUri.remove(pictureUri);
                fs.unlink('./public/images/' + pictureUri, err => {
                    if (err) {
                        reject(err);
                    }
                });
                news.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                resolve(news.pictureUri);
            })
            .catch(err => {
                reject(err);
            });
    });
exports.createComment = (token_content, newsId, content) =>
    new Promise((res, rej) => {
        console.log('token_content: ' + token_content);
        var mComment;
        var userId;
        var tmpNews, tmpTour;
        auth.checkToken(token_content)
            .then(token => {
                userId = token.userId;
                var newComment = commentDB.comment({
                    user: token.userId,
                    news: newsId,
                    content: content,
                    time: new Date().getTime()
                });
                newComment.save(err => {
                    if (err) {
                        rej(err);
                    }
                });
                mComment = newComment;
                return newsDB.news.findOne({ _id: newsId });
            })
            .then(news => {
                news.comments.push(mComment._id);
                news.save(err => {
                    if (err)
                        rej(err)
                });

                return newsDB.news.findById(newsId)
                    .populate({
                        path: 'comments',
                        model: 'comment',
                        select: ('time content user'),
                        populate: ({
                            path: 'user',
                            model: 'user',
                            select: ('name avatarUri')
                        })
                    })
                    .then(news1 => {
                        tmpNews = news1;
                        return tourDB.tour.findById(news1.tour);
                    })
                    .then(mTour => {
                        tmpTour = mTour;
                        return userDB.user.findById(userId);
                    })
                    .then(mUser => {
                        if (String(mUser._id) !== String(tmpNews.creator)) {
                            notifyDomain.createNotify(tmpNews.creator, "comment_post’ ", 10, mUser._id, mUser.avatarUri, mUser.name, tmpTour._id, tmpTour.name, tmpTour.creator, tmpTour.posterUri, tmpNews._id, 0, tmpNews.likes.length)
                                .then(result => {
                                    console.log(""+result);
                                })
                                .catch(err => {
                                    console.log("Error create notifi off "+err);
                                })
                            //send notification create news
                            var payload = sender.setPayLoad('comment_post', "10", String(mUser._id), mUser.avatarUri, mUser.name, String(tmpTour._id), tmpTour.name, String(tmpTour.creator), tmpTour.posterUri, String(tmpNews._id), "0", String(tmpNews.likes.length));
                            sender.sendMessage('user_' + String(tmpNews.creator), payload)
                                .then(response => { console.log( response); })
                                .catch(err => { console.log( err); });
                        }
                        res(tmpNews.comments);
                    })
                    .catch(err => rej(err));


            })
            .catch(err => {
                rej(err);
            });
    });
exports.getListComment = (token_content, newsId) =>
    new Promise((res, rej) => {
        auth.checkToken(token_content)
            .then(token => {
                return newsDB.news.findById(newsId)
                    .populate({
                        path: 'comments',
                        model: 'comment',
                        select: ('time content user'),
                        populate: ({
                            path: 'user',
                            model: 'user',
                            select: ('name avatarUri')
                        })
                    });
            })
            .then(news => {
                res(news.comments);
            })
            .catch(err => {
                rej(err);
            });
    });
exports.deleteComment = (token_content, commentId) =>
    new Promise((res, rej) => {
        auth.checkToken(token_content)
            .then(token => {
                return commentDB.comment.findOne({ _id: commentId, user: token.userId });
            })
            .then(comment => {
                comment.remove()
                    .then(comment => result(res, '1', '', '200', []))
                    .catch(err => result(rej, '0', '', '500', err));
            })
            .catch(err => result(rej, '0', '', '500', err));
    });