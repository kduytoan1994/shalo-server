/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const db_tools = require('../tools/db_tools');
const mongoose = require('mongoose');
const db = db_tools.getDBConnection();
const scheduleSchema = mongoose.Schema({
    time: Number,
    title: String,
    content: String,
    tour: {type: mongoose.Schema.Types.ObjectId, ref: 'tour'}
});
scheduleSchema.pre('remove', function (next) {
    var schedule = this;
    schedule.model('tour').update(
            {schedule: schedule._id},
            {$pull: {schedule: schedule._id}},
            {multi: true},
            next
            );
});
const schedule = mongoose.model('schedule', scheduleSchema);
exports.schedule = schedule;
