const specialLocationDomain = require('../domain/specialLoactionDomain');
function success(res, data, description, code) {
    res.json({ message: { success: "1", descrpiton: description, code: code }, data: data });
}
function error(res, err, description, code) {
    res.json({ message: { success: "0", descrpiton: description, code: code }, error: error });
}
exports.createSpLocation = (req, res) => {
    var token_content = req.header('header-shalo');
    var roadMapId = req.body.roadMapId;
    var title = req.body.title;
    var content = req.body.content;
    var lat = req.body.lat;
    var lng = req.body.lng;
    var image = req.files;
    specialLocationDomain.createSpLocation(token_content, roadMapId, title, content, lat, lng, image)
        .then(result => {
            success(res, result, "", 201);
        })
        .catch(err => {
            error(res, err, "", 500);
        })
}
exports.updateSpLocation = (req, res) => {
    var token_content = req.header('header-shalo');
    var specialLocationId = req.body.specialLocationId;
    var title = req.body.title;
    var tourId = req.body.tourId;
    var content = req.body.content;
    var lat = req.body.lat;
    var lng = req.body.lng;
    specialLocationDomain.updateSpLocation(token_content, tourId, specialLocationId, title, content, lat, lng)
        .then(result => {
            success(res, result, "", 202);
        })
        .catch(err => {
            error(res, err, "", 500);
        })
}
exports.deleteSpLocation = (req, res) => {
    var token_content = req.header('header-shalo');
    var specialLocationId = req.body.specialLocationId;
    var tourId = req.body.tourId;
    specialLocationDomain.deleteSpLocation(token_content, specialLocationId, tourId)
        .then(result => {
            res.json({ message: { success: "1", descrpiton: "", code: 203 } });
        })
        .catch(err => {
            res.json({ message: { success: "0", descrpiton: "delete error", code: 500 } });
        })
}