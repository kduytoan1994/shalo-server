/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const db_tools = require('../tools/db_tools');
const mongoose = require('mongoose');
const db = db_tools.getDBConnection();
const tourSchema = mongoose.Schema({
    name: String,
    description: String,
    start_time: Number,
    end_time: Number,
    status: Number,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, //nguoi tao tour
    permission: Number,
    posterUri: String,
    timeCreate: Number,
    videoUri: String,
    contentVideo: String,
    timeVideo: Number,
    thumbnailUri: String,
    place: String,
    vihicle: String,
    accommodation: String,
    lat: { type: Number, default: 0 },
    long: { type: Number, default: 0 },
    schedule: [{ type: mongoose.Schema.Types.ObjectId, ref: 'schedule' }],
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'flightTicker' },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'hotel' },
    estimateCost: { unit: Number, transfer: String, food: String, hotel: String, other: String, totalCost: String },
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category' }],
    userLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    userFollowed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    news: [{ type: mongoose.Schema.Types.ObjectId, ref: 'news' }],
    userAccepted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    userRejected: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    userPending: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    userInvited: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    roadMap: { type: mongoose.Schema.Types.ObjectId, ref: 'roadMap' }
});
tourSchema.pre('remove', function (next) {
    var tour = this;
    tour.model('user').update(
        { tourOwner: tour._id },
        { $pull: { tourOwner: tour._id } },
        { multi: true },
        next
    );
});
tourSchema.pre('remove', function (next) {
    var tour = this;
    tour.model('schedule').remove(
        { tour: tour._id },
        next
    );
});
tourSchema.pre('remove', function (next) {
    var tour = this;
    tour.model('roadMap').remove(
        { tour: tour._id },
        next
    );
});
tourSchema.pre('remove', function (next) {
    var tour = this;
    tour.model('news').remove(
        { tour: tour._id },
        next
    );
});
tourSchema.index({ name: "text", place: "text" });
const tour = mongoose.model('tour', tourSchema);
exports.tour = tour;

