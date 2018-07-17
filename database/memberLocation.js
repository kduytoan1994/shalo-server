const db_tools = require('../tools/db_tools');
const mongoose = require('mongoose');
const db = db_tools.getDBConnection();
const memberLocationSchema = mongoose.Schema({
    name: String,
    lat: Number,
    lng: Number,
    enableLocation: String,
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'tour' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
});
const memberLocation = mongoose.model('memberLocation', memberLocationSchema);
exports.memberLocation = memberLocation;