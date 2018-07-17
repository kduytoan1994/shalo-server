/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const db_tools=require('../tools/db_tools');
const mongoose=require('mongoose');
const db=db_tools.getDBConnection();
const newsSchema=mongoose.Schema({
    content                 :String,
    time                    :Number,
    creator                 :{type:mongoose.Schema.Types.ObjectId,ref:'user'},
    tour                    :{type:mongoose.Schema.Types.ObjectId,ref:'tour'},
    comments                :[{type:mongoose.Schema.Types.ObjectId,ref:'comment'}],
    likes                   :[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
    pictureUri              :[{type:String}]
});
newsSchema.pre('remove', function (next) {
    var news = this;
    news.model('tour').update(
            {news: news._id},
            {$pull: {news: news._id}},
            {multi: true},
            next
            );
});
const news=mongoose.model('news',newsSchema);
exports.news=news;

