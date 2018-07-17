/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global admin_shalo */

var auth = require('../authenticate/authenticate');
exports.setPayLoad = (content, typeNotify, id_user, avatar_user, name_user, tour_id, tour_name, tour_creator, avatar_tour, news_id, result_request, number_like_post) => {
    var time_ = new Date().getTime();
    var time = time_.toString();
    console.log("new_id: "+news_id);
    var mAvatarTour='';
    if(avatar_tour!=null){
        mAvatarTour=avatar_tour;
    }
    var payload = {
        data: {
            content_summary: content,
            typeNotify: typeNotify,
            status: "0",
            time: time,
            number_like_post: number_like_post,
            id_user: id_user,
            avatar_user: mAvatarTour,
            name_user: name_user,
            tour_id: tour_id,
            tour_name: tour_name,
            tour_creator: tour_creator,
            avatar_tour: avatar_tour,
            news_id: news_id,
            result_request: result_request
        }
    };
    return payload;
};
exports.sendMessage = (topic, payload) =>
    new Promise((resolve, reject) => {
        admin_shalo.messaging().sendToTopic(topic, payload)
            .then(response => {
                console.log('response: '+response);
                resolve(response);
            })
            .catch(err => {
                reject(err);
            });
    });

exports.subscribeTopic = (token_content, extra, registerToken) =>
    new Promise((resolve, reject) => {
        auth.checkToken(token_content)
            .then(token => {
                console.log('user_' + String(token.userId));
                return admin_shalo.messaging().subscribeToTopic(registerToken, extra + String(token.userId));
            })
            .then(response => {
                resolve(response);
            })
            .catch(err => {
                reject(err);
            });
    });
exports.unSubcribeTopic = (token_content,extra, registerToken) =>
    new Promise((resolve, reject) => {
        auth.checkToken(token_content)
            .then(token => {
                return admin_shalo.messaging().unsubscribeFromTopic(registerToken, extra + String(token.userId));
            })
            .then(response => {
                resolve(response);
            })
            .catch(err => {
                reject(err);
            });
    });

