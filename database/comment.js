/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const db_tools = require('../tools/db_tools');
const mongoose = require('mongoose');
const db = db_tools.getDBConnection();
const commentSchema = mongoose.Schema({
    content: String,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    news: {type: mongoose.Schema.Types.ObjectId, ref: 'news'},
    time: Number
});
commentSchema.pre('remove', function (next) {
    var cmt = this;
    cmt.model('news').update(
            {comments: cmt._id},
            {$pull: {comments: cmt._id}},
            {multi: true},
            next
            );
});
const comment = mongoose.model('comment', commentSchema);
exports.comment = comment;

