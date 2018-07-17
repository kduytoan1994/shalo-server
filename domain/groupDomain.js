/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const userDB = require('../database/users');

exports.makeGroup = (filter) => {
    new Promise((resolve, reject) => {
        var listUser = [];
        userDB.user.find(filter)
                .then(users => {
                    listUser = users;
                    resolve(listUser);
                })
                .catch(err => {
                    reject(err);
                });
    });
};
