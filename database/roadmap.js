const db_tools = require('../tools/db_tools');
const mongoose = require('mongoose');
const db = db_tools.getDBConnection();
const roadMapSchema = mongoose.Schema({
    start_point_lat: Number,
    start_point_long: Number,
    end_point_lat: Number,
    end_point_long: Number,
    start_point_name: String,
    end_point_name: String,
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'tour' },
    member: [{ type: mongoose.Schema.Types.ObjectId, ref: 'memberLocation' }],
    specialLocation: [{ type: mongoose.Schema.Types.ObjectId, ref: 'specialLocation' }]

});
roadMapSchema.pre('remove', function (next) {
    var roadMap = this;
    roadMap.model('tour').update(
        { roadMap: roadMap._id },
        { roadMap: null },
        next
    );
});
const roadMap = mongoose.model('roadMap', roadMapSchema);
exports.roadMap = roadMap;