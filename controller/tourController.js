/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var tourDomain = require('../domain/tourDomain');
var memberLocationDomain = require('../domain/memberLocationDomain')

function successRes(res, data, description, code) {
    res.json({message: {success: "1", description: description, code: code}, data: data});
}

function errorRes(res, err, description, code) {
    res.json({message: {success: "0", description: description, code: code}, data: err});
}

function updateOrRemoveRes(res, description, code) {
    res.json({message: {success: "1", description: description, code: code}});
}

function updateOrRemoveError(res, description, code) {
    res.json({message: {success: "0", description: description, code: code}});
}

const fs = require('fs');
exports.createTour = (req, res) => {
    var name = req.body.name;
    var description = req.body.description;
    var token = req.header('header-shalo');
    var posterUri = req.body.posterUri;
    var start_time = req.body.start_time;
    var end_time = req.body.end_time;
    var status = req.body.status;
    var permission = req.body.permission;
    var schedule = req.body.schedule;
    var vihicle = req.body.vihicle;
    var accommodation = req.body.accommodation;
    var place = req.body.place;
    var estimateCost = req.body.estimateCost;
    var categoryIDs = req.body.categoryIDs;
    var lat = req.body.lat;
    var long = req.body.long;

    tourDomain.createTour(name, description, start_time, end_time, status, token, permission, posterUri, vihicle, accommodation, place, schedule, estimateCost, categoryIDs, lat, long)
        .then(result => successRes(res, result, "", 201))
        .catch(err => errorRes(res, err, "", 500));
};
exports.getTourById = (req, res) => {
    var tourId = req.params.tourId;
    tourDomain.getTourById(tourId)
        .then(result => successRes(res, result, "", 200))
        .catch(err => errorRes(res, err, "", 500));
};
exports.getTourInfoById = (req, res) => {
    var tourId = req.params.tourId;
    tourDomain.getTourInfoById(tourId)
        .then(result => successRes(res, result, "", 200))
        .catch(err => errorRes(res, err, "", 500));
};
exports.getTourOwner = (req, res) => {
    var token_content = req.header('header-shalo');
    tourDomain.getTourOwner(token_content)
        .then(result => successRes(res, result, "", 200))
        .catch(err => errorRes(res, err, "", 500));
};
exports.updateTour = (req, res) => {
    var tourId = req.body._id;
    var name = req.body.name;
    var description = req.body.description;
    var status = req.body.status;
    var permission = req.body.permission;
    var posterUri = req.body.posterUri;
    var start_time = req.body.start_time;
    var end_time = req.body.end_time;
    var schedule = req.body.schedule;
    var vihicle = req.body.vihicle;
    var accommodation = req.body.accommodation;
    var place = req.body.place;
    var estimateCost = req.body.estimateCost;

    tourDomain.updateTour(tourId, name, description, status, permission, posterUri, start_time, end_time, schedule, vihicle, accommodation, place, estimateCost)
        .then(result => updateOrRemoveRes(res, "", 202))
        .catch(err => updateOrRemoveError(res, "", 500));
};
exports.deleteTour = (req, res) => {
    var tourId = req.params.tourId;
    var token_content = req.header('header-shalo');
    tourDomain.deleteTour(token_content, tourId)
        .then(result => updateOrRemoveRes(res, "", 203))
        .catch(err => updateOrRemoveError(res, "", 500));
};
exports.ex = (req, res) => {
    var tourId = req.params.tourId;
    tourDomain.ex(tourId, 'av')
        .then(result => successRes(res, result, "", 201))
        .catch(err => errorRes(res, err, "", 500));
};
exports.getListTour = (req, res) => {
    var token_content = req.header('header-shalo');
    var type = req.params.type;
    var count = parseInt(req.params.count);
    var category = req.body.category;
    tourDomain.getListTour(token_content, type, count, category)
        .then(result => successRes(res, result, "", 200))
        .catch(err => errorRes(res, err, "", 500));
};
exports.getTourInfoById = (req, res) => {
    var tourId = req.params.tourId;
    tourDomain.getTourInfoById(tourId)
        .then(result => successRes(res, result, "", 200))
        .catch(err => errorRes(res, err, "", 500));
};
exports.getListMyTour = (req, res) => {
    var token_content = req.header('header-shalo');
    var count = parseInt(req.params.count);
    var status = req.params.status;

    tourDomain.getListMyTour(token_content, count, status)
        .then(result => successRes(res, result, "", 200))
        .catch(err => errorRes(res, err, "", 500));
};
exports.getListMyTourByTime = (req, res) => {
    var token_content = req.header('header-shalo');
    var userId2 = req.body.userId2;
    var count = parseInt(req.params.count);
    tourDomain.getListMyTourByTime(token_content, userId2, count)
        .then(result => successRes(res, result, "", 200))
        .catch(err => errorRes(res, err, "", 500));
}
exports.followTour = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.params._id;
    tourDomain.followTour(token_content, tourId)
        .then(result => successRes(res, result, "", 200))
        .catch(err => errorRes(res, err, "", 500));
};
exports.unfollowTour = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.params._id;
    tourDomain.unfollowTour(token_content, tourId)
        .then(result => successRes(res, result, "", 200))
        .catch(err => errorRes(res, err, "", 500));
};
exports.uploadImage = (req, res) => {
    var token_content = req.header('header-shalo');
    var poster = req.files;
    var tourId = req.body.tourId;
    tourDomain.uploadImage(token_content, tourId, poster)
        .then(result => updateOrRemoveRes(res, "Upload successfully!", 201))
        .catch(err => errorRes(res, err, 'Upload failed', 500));
};
exports.uploadVideo = (req, res) => {
    var token_content = req.header('header-shalo');
    var video = req.files;
    var tourId = req.body.tourId;
    var contentVideo = req.body.contentVideo;
    tourDomain.uploadVideo(token_content, tourId, video, contentVideo)
        .then(result => successRes(res, result, "Upload successfully!", 201))
        .catch(err => errorRes(res, err, 'Upload failed', 500));
};
exports.likeTour = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body._id;
    tourDomain.likeTour(token_content, tourId)
        .then(result => {
            updateOrRemoveRes(res, result, 202);
        })
        .catch(err => {
            console.log(err);
            updateOrRemoveError(res, err, 500);
        });
};
exports.getNewsOfTour = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.params.tourId;
    tourDomain.getListNewsOfTour(token_content, tourId)
        .then(result => {
            successRes(res, result, "", 200);
        })
        .catch(err => {
            errorRes(res, err, "", 500);
        });
};
exports.inviteNewMember = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    var userId = req.body.userId;
    tourDomain.inviteNewMember(token_content, tourId, userId)
        .then(result => successRes(res, result, "invite success", 201))
        .catch(err => errorRes(res, err, "invite failed!", 500));
};
exports.getTourMember = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.params.tourId;
    tourDomain.getTourMember(token_content, tourId)
        .then(result => successRes(res, result, "", 200))
        .catch(err => errorRes(res, err, "", 500));
};
exports.acceptJoinTour = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    tourDomain.acceptJoinTour(token_content, tourId)
        .then(result => updateOrRemoveRes(res, "", 200))
        .catch(err => updateOrRemoveError(res, "", 500));
};
exports.rejectJoinTour = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    tourDomain.rejectJoinTour(token_content, tourId)
        .then(result => updateOrRemoveRes(res, "", 200))
        .catch(err => updateOrRemoveError(res, "", 500));
};
exports.removeTourMember = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    var userId = req.body.userId;
    tourDomain.removeMember(token_content, tourId, userId)
        .then(result => updateOrRemoveRes(res, "remove success", 201))
        .catch(err => updateOrRemoveError(res, "remove failed!", 500));
};
exports.leaveTour = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    tourDomain.leaveTours(token_content, tourId)
        .then(result => updateOrRemoveRes(res, "remove success", 201))
        .catch(err => updateOrRemoveError(res, "remove failed!", 500));
};
exports.requestJoinTour = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    tourDomain.requestJoinTour(token_content, tourId)
        .then(result => updateOrRemoveRes(res, "request success", 201))
        .catch(err => updateOrRemoveError(res, "request failed!", 500));
};
exports.acceptUser = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    var userId = req.body.userId;
    tourDomain.acceptUser(token_content, userId, tourId)
        .then(result => successRes(res, result, "accept success", 201))
        .catch(err => errorRes(res, err, "accept failed!", 500));
};
exports.rejectUser = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    var userId = req.body.userId;
    tourDomain.rejectUser(token_content, userId, tourId)
        .then(result => updateOrRemoveRes(res, "accept success", 201))
        .catch(err => updateOrRemoveError(res, "accept failed!", 500));
};
exports.getAllMember = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.params.tourId;
    tourDomain.getAllMember(token_content, tourId)
        .then(result => successRes(res, result, "", 200))
        .catch(err => errorRes(res, err, "", 500));
};
exports.removeInvited = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    var userId = req.body.userId;
    tourDomain.removeInvited(token_content, tourId, userId)
        .then(result => updateOrRemoveRes(res, "remove success", 201))
        .catch(err => updateOrRemoveError(res, "remove failed", 500));
};
exports.searchUserByPhone = (req, res) => {
    var token_content = req.header('header-shalo');
    var phone = req.body.phone;
    tourDomain.searchUserByPhone(token_content, phone)
        .then(result => successRes(res, result, '', 200))
        .catch(err => errorRes(res, err, '', 500));
};
exports.getAllImageTour = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.params.tourId;
    tourDomain.getAllImageTour(token_content, tourId)
        .then(result => successRes(res, result, "", 200))
        .catch(err => {
            errorRes(res, err, "", 500);
        });
};
exports.checkuser = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    console.log('header: ' + token_content + " tourId: " + tourId);
    tourDomain.checkuser(token_content, tourId)
        .then(result => successRes(res, result, "", 201))
        .catch(err => errorRes(res, err, "", 500));
};
exports.checkMember = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    tourDomain.checkMember(token_content, tourId)
        .then(result => successRes(res, result, "", 201))
        .catch(err => errorRes(res, err, "", 500));
};
exports.createRoadMap = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    tourDomain.createRoadMap(token_content, tourId)
        .then(result => {
            updateOrRemoveRes(res, result, 201)
        })
        .catch(err => {
            updateOrRemoveError(res, err, 500)
        })
}
exports.updateRoadMap = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    var start_point_lat = req.body.start_point_lat;
    var start_point_long = req.body.start_point_lng;
    var end_point_lat = req.body.end_point_lat;
    var end_point_long = req.body.end_point_lng;
    var start_point_name = req.body.start_point_name;
    var end_point_name = req.body.end_point_name;
    tourDomain.updateRoadMap(token_content, tourId, start_point_lat, start_point_long, end_point_lat, end_point_long, start_point_name, end_point_name)
        .then(result => {
            res.json({success: '1'})
        })
        .catch(err => {
            console.log(err)
            res.json({success: '0'})
        })
}
exports.updateCurrentLocation = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    var lat = req.body.lat;
    var lng = req.body.lng;
    tourDomain.updateCurrentLocation(token_content, tourId, lat, lng)
        .then(result => {
            successRes(res, result, "success", 202);
        })
        .catch(err => {
            errorRes(res, err, "err", 500);
        })
}
exports.updateEnableLocation = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    var enableLocation = req.body.enableLocation;
    memberLocationDomain.updateEnableLocation(token_content, tourId, enableLocation)
        .then(memberLocation => {
            updateOrRemoveRes(res, "success", 202)
        })
        .catch(err => {
            updateOrRemoveError(res, "err", 500)
        })
}
exports.getRoadMapInfo = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    tourDomain.getRoadMapInfo(token_content, tourId)
        .then(result => {
            successRes(res, result, "success", 200);
        })
        .catch(err => {
            errorRes(res, err, "err", 500);
        })
}
exports.streamvideo = (req, res) => {
    var name = req.params.name;
    var path = './public/videos/' + name;
    const stat = fs.statSync(path)
    console.log(stat)
    const fileSize = stat.size
    const range = req.headers.range
    console.log('range: ' + range)

    if (range) {
        console.log('1');
        const parts = range.replace(/bytes=/, "").split("-")
        console.log("parts: " + parts);
        const start = parseInt(parts[0], 10)
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize - 1
        console.log('start: ' + start + ' end ' + end);
        const chunksize = (end - start) + 1
        const file = fs.createReadStream(path, {start, end})
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'
        }

        res.writeHead(206, head)
        file.pipe(res)
    } else {
        console.log('2')
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4'
        }
        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
    }
}
exports.getTourOfCategory = (req, res) => {
    var header = req.header('header-shalo');
    var count = parseInt(req.params.count);
    var categoryId = req.params.categoryId;

    tourDomain.getTourOfCategory(header, count, categoryId)
        .then(result => {
            successRes(res, result, "", 200);
        })
        .catch(err => {
            errorRes(res, err, "fail to load data!", 400);
        })
}
exports.showall = (req,res)=>{
    tourDomain.showall()
        .then(result=>{
            res.json(result);
        })
        .catch(err=>{
            res.json(err);
        })
}