/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var userDB = require('../database/users');
var tourDB = require('../database/tour');

exports.searchUserByRegex = (digits) =>
    new Promise((resolve, reject) => {
        console.log('digits: ' + digits);
        userDB.user.find({ name: { $regex: '^' + digits, $options: 'i' } }, { _id: 1, name: 1 })
            .limit(5)
            .then(user => {
                resolve(user);
            })
            .catch(err => {
                reject(err);
            });
    });

exports.searchTourByRegex = (digits) =>
    new Promise((resolve, reject) => {
        console.log('digits: ' + digits);
        tourDB.tour.find({ name: { $regex: '^' + digits, $options: 'i' } }, { _id: 1, name: 1 })
            .limit(5)
            .then(tour => {
                resolve(tour);
            })
            .catch(err => {
                reject(err);
            });
    });
exports.searchPlaceByRegex = (digits) => {
    new Promise((resolve, reject) => {
        tourDB.tour.find({ place: { $regex: '^' + digits, $options: 'i' } }, { _id: 1, name: 1, place: 1 })
            .limit(5)
            .then(tour => {
                resolve(tour);
            })
            .catch(err => {
                reject(err);
            });
    })
}
exports.searchUserFullText = (name, count) =>
    new Promise((resolve, reject) => {
        userDB.user.find({ $text: { $search: name } }, { _id: 1, name: 1, avatarUri: 1, score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } })
            .then(user => {
                resolve(user.slice((count - 1) * 10, count * 10 - 1));
            })
            .catch(err => {
                reject(err);
            });
    });
exports.searchTourFullText = (name, count) =>
    new Promise((resolve, reject) => {
        tourDB.tour.find({ $text: { $search: name } }, { _id: 1, name: 1, place: 1, posterUri: 1, creator: 1, score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } })
            .then(tour => {
                resolve(tour.slice((count - 1) * 10, count * 10 - 1));
            })
            .catch(err => {
                reject(err);
            });
    });

