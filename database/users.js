/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const db_tools = require('../tools/db_tools');
const mongoose = require('mongoose');

const db = db_tools.getDBConnection();

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    avatarUri: String,
    coverImage:String,
    birthday: Number,
    address: String,
    gender: {type: Number, default: 1},
    type: Number,
    followedUser: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}], //nguoi minh follow
    userFollowed: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}], //nguoi follow minh
    phoneNumber: {type: String, unique: 'true'},
    imageUri : [{type: String}],
    tourLiked: [{type: mongoose.Schema.Types.ObjectId, ref: 'tour'}],
    tourOwner: [{type: mongoose.Schema.Types.ObjectId, ref: 'tour'}], //nhung tour làm owner
    tourMember: [{type: mongoose.Schema.Types.ObjectId, ref: 'tour'}], //nhung tour lam member
    tourFollowed: [{type: mongoose.Schema.Types.ObjectId, ref: 'tour'}], //nhung tour dang follow
    tourPending: [{type: mongoose.Schema.Types.ObjectId, ref: 'tour'}], //nhung tour dang register
    tourRejected: [{type: mongoose.Schema.Types.ObjectId, ref: 'tour'}], //nhung tour da bi reject
    tourInvited: [{type: mongoose.Schema.Types.ObjectId, ref: 'tour'}],
    notifications: [{
            notifyId: String,
            content_summary: String,
            typeNotify: Number, // type of notification 0 - 11
            // 0 ‘like_tour’ 1 ‘follow_user 2 ‘request_join_tour’ 3 ‘leave_tour’ 4 ‘invite_to_tour 
            // 5 ‘response_request_join_tour’ 6 ‘response_request_invite_tour’ 
            // 7 ‘new_post_of_tour’ 8 ‘like_post’ 9 ‘admin_delete_post’ 10 ‘comment_post’ 11 ‘tour_from_following’
            status: Number, //did user read notification or not 
            time: Number,
            number_like_post: Number,
            id_user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'}, //user follow self
            avatar_user: String,
            name_user: String,
            tour_id: {type: mongoose.Schema.Types.ObjectId, ref: 'tour'},
            tour_creator: String,
            tour_name: String,
            avatar_tour: String,
            news_id: {type: mongoose.Schema.Types.ObjectId, ref: 'news'},
            result_request: Number
        }]
});
userSchema.index({name:"text"});
const user = mongoose.model('user', userSchema);
exports.user = user;


