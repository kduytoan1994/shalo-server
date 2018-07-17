/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var tourDB = require('../database/tour');
var categoryDB = require('../database/category');
var authenticate = require('../authenticate/authenticate');

exports.addCategory = (name) =>
    new Promise((resolve, reject) => {
        var newCategory = new categoryDB.category({
            name: name
        });
        newCategory.save(err => {
            if (err) {
                reject(err);
            }
        });
        resolve(newCategory);
    });
exports.addTourToCategory = (token_content, tourId, categoryId) =>
    new Promise((resolve, reject) => {
        authenticate.checkCreatorTourPermission(token_content, tourId)
            .then(tour => {
                return categoryDB.category.findOne({_id: categoryId});
            })
            .then(category => {
                if (!String(category.tour).includes(String(tourId))) {
                    category.tour.push(tourId);
                } else {
                    console.log('Category had this tour aready!')
                }
                category.save(err => {
                    if (err) {
                        reject(err);
                    }
                });
                resolve({tour: category.tour});
            })
            .catch(err => {
                reject(err);
            });
    });
exports.getAllCategory = () =>
    new Promise((resolve, reject) => {
        categoryDB.category.find()
            .then(categories => {
                resolve(categories);
            })
            .catch(err => {
                reject(err);
            });
    });
exports.deleteCategory = (categoryId) =>
    new Promise((resolve, reject) => {
        categoryDB.category.findOneAndRemove({_id: categoryId})
            .then(category => {
                resolve(category);
            })
            .catch(err => {
                reject(err);
            })
    })

//exports.addTagToCategory = (token_content, tags, )