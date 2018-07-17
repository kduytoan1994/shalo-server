/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const scheduleDB = require('../database/schedule');
const tourDB = require('../database/tour');
const mongoose = require('mongoose');

exports.createSchedule = (tour, time, content) =>
    new Promise((resolve, reject) => {
        tourDB.tour.findOne({_id: tour})
                .then(tour => {
                    var newSchedule = new scheduleDB.schedule({
                        time: time,
                        content: content,
                        tour: tour
                    }, err => {
                        if (err) {
                            reject(err);
                        }
                    });
                    newSchedule.save(err => {
                        if (err) {
                            reject(err);
                        }
                    });
                    tour.schedule.push(newSchedule._id);
                    tour.save(err => {
                        if (err)
                            reject(err);
                    });
                    resolve({id:newSchedule._id,time:newSchedule.time,content:newSchedule.content});

                })
                .catch(err => reject(err));
    });
exports.updateSchedule = (scheduleId, time, content) =>
    new Promise((resolve, reject) => {
        scheduleDB.schedule.findOneAndUpdate({_id: scheduleId}, {$set: {time: time, content: content}},{new :true})
                .then(schedule => {
                    resolve(schedule);
                })
                .catch(err => {
                    reject(err);
                });
    });
exports.deleteSchedule = (scheduleId) =>
    new Promise((resolve, reject) => {
        scheduleDB.schedule.findOneAndRemove({_id: scheduleId})
                .then(schedule => {
                    resolve(schedule);
                })
                .catch(err => {
                    reject(err);
                });
    });