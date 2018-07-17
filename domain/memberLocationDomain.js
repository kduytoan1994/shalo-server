const memberLocationDB = require('../database/memberLocation');
const authenticate = require('../authenticate/authenticate');
const roadMapDB = require('../database/roadmap');
const tourDB = require('../database/tour');
exports.createMemLocation = (name, lat, lng, tourId, userId,roadMapId) =>
    new Promise((resolve, reject) => {
        tourDB.tour.findById(tourId)
            .then(tour => {
                return roadMapDB.roadMap.findById(roadMapId);
            })
            .then(roadMap => {
                var newMemLocation = new memberLocationDB.memberLocation({
                    name: name,
                    lat: lat,
                    lng: lng,
                    tour: tourId,
                    user: userId,
                    enableLocation: '0'
                })
                newMemLocation.save(err => {
                    if (err)
                        reject(err);
                })
                roadMap.member.push(newMemLocation._id)
                roadMap.save(err => {
                    if (err)
                        reject(err)
                })
                resolve(newMemLocation);
            })
            .catch(err => {
                reject(err);
            })
    })

exports.updateEnableLocation = (token_content, tourId, enableLocation) =>
    new Promise((resolve, reject) => {
        var mMemberLocation;
        authenticate.checkToken(token_content)
            .then(token => {
                return memberLocationDB.memberLocation.findOneAndUpdate({ user: token.userId, tour: tourId }, {
                    $set: {
                        enableLocation: enableLocation
                    },
                }, { new: true })
            })
            .then(memberLocation => {
                resolve(memberLocation);
            })
            .catch(err => {
                reject(err)
            })
    })
exports.updateMemberLocation = (token_content, tourId, lat, lng) =>
    new Promise((resolve, reject) => {
        authenticate.checkToken(token_content)
            .then(token => {
                return memberLocationDB.memberLocation.findOneAndUpdate({ user: token.userId, tour: tourId }, {
                    $set: {
                        lat: lat,
                        lng: lng
                    },
                }, { new: true })
            })
            .then(memberLocation => {
                console.log('memberLOcation '+memberLocation)
                return memberLocationDB.memberLocation.find({ tour: memberLocation.tour })
            })
            .then(memberLocations => {
                resolve(memberLocations)
            })
            .catch(err => {
                reject(err)
            })
    })
exports.findMemberLocation = (userId, tourId) =>
    new Promise((resolve, reject) => {
        memberLocationDB.memberLocation.findOne({ user: userId, tour: tourId })
            .then(memberLocation => {
                resolve(memberLocation);
            })
            .catch(err => {
                reject(err);
            })
    })
exports.findActiveMember = (token_content, tourId) =>
    new Promise((resolve, reject) => {
        memberLocationDB.memberLocation.find({ tour: tourId, enableLocation: '1' })
            .then(memberLocation => {
                resolve(memberLocation)
            })
            .catch(err => {
                reject(err);
            })
    })