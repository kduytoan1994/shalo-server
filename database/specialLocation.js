const db_tools = require('../tools/db_tools');
const mongoose = require('mongoose');
const db = db_tools.getDBConnection();
const specialLocationSchema = mongoose.Schema({
    title: String,
    content: String,
    lat: Number,
    lng: Number,
    imageUri: String,
    roadMap: { type: mongoose.Schema.Types.ObjectId, ref: 'roadMap' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
});
specialLocationSchema.pre('remove', function (next) {
    var specialLocation = this;
    specialLocation.model('roadMap').update(
        {specialLocation: specialLocation._id},
            {$pull: {specialLocation: specialLocation._id}},
            {multi: true},
            next
    );
});
const specialLocation = mongoose.model('specialLocation', specialLocationSchema);
exports.specialLocation = specialLocation;