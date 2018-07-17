/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var userController = require('./controller/userController');
var tourController = require('./controller/tourController');
var scheduleController = require('./controller/scheduleController');
var newsController = require('./controller/newsController');
var notifyController = require('./controller/notifyController');
var path = require('path');
var categoryController = require('./controller/categoryController');
var searchController = require('./controller/searchController');
var specialLocationController = require('./controller/specialLocationController');

const multer = require('multer');
const storageImage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/images');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
var uploadImage = multer({
    storage: storageImage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'));
        }
        callback(null, true);
    }
});
const storageVideo = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/videos');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
var uploadVideo = multer({
    storage: storageVideo,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.mp4' && ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only video are allowed'));
        }
        callback(null, true);
    }
});

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.json('Welcome to shalo!')
    })

    //manage user
    app.post('/login', userController.loginUser);
    app.get('/creatAnonymous', userController.createAny);
    app.post('/register', userController.register);
    app.put('/changePassword', userController.changePassword);
    app.put('/forgetPassword', userController.forgetPassword);
    //    app.post('/removeUser', userController.removeUser);
    app.post('/uploadAvatar/:phone', uploadImage.any(), userController.uploadImage);
    app.get('/getAvatar/:phone', userController.getAvatarByPhone);
    app.get('/getImageByUri/:uri', userController.getImageByUri);
    app.get('/tour/video/:uri', userController.getVideoByUri);
    app.post('/logout', userController.logOut);
    app.post('/user/changePhone', userController.changePhone);
    app.post('/user/changeInfo', userController.changeInfo);
    app.get('/user/:id', userController.getUser);
    app.post('/user/following/:index', userController.getListFollowedUser);
    app.post('/user/followed/:index', userController.getListUserFollowed);
    app.get('/user/tourCreateByUser/:index', userController.getListTourCreateByUser);
    app.get('/user/usersLikeTour/:index', userController.getListLikeTour);
    app.post('/user/followUser/:userId', userController.followUser);
    app.put('/user/unFollowUser/:userId', userController.unFollowUser);
    app.get('/user/news/images/:id', userController.getAllImage);
    app.post('/user/coverImage', uploadImage.any(), userController.updateCoverImage);

    app.put('/likeNews/:newsId', newsController.likeNews);
    app.post('/news', uploadImage.any(), newsController.createNews);
    app.delete('/tour/news/:newsId', newsController.deleteNews);
    app.put('/tour/news', uploadImage.any(), newsController.updateNews);
    app.get('/followtour/:_id', tourController.followTour);
    app.get('/unfollowtour/:_id', tourController.unfollowTour);
    app.post('/tour/news/comment', newsController.createComment);
    app.get('/tour/news/comment/:newsId', newsController.getListComment);
    app.delete('/tour/news/comment/delete/:commentId', newsController.deleteComment);
    app.post('/tour/news/deleteImage', newsController.deleteImageNews);

    app.post('/tour', tourController.createTour);
    app.get('/tour/:tourId', tourController.getTourById);
    app.get('/tourOwner', tourController.getTourOwner);
    app.put('/tour', tourController.updateTour);
    app.delete('/tour/:tourId', tourController.deleteTour);
    app.post('/listtour/:type/:count', tourController.getListTour);
    app.post('/schedule', scheduleController.createSchedule);
    app.get('/tourinfo/:tourId', tourController.getTourInfoById);
    app.get('/listMyTour/:count/:status', tourController.getListMyTour);
    app.post('/tour/listMyTourByTime/:count', tourController.getListMyTourByTime);
    app.post('/tour/image', uploadImage.any(), tourController.uploadImage);
    app.put('/schedule', scheduleController.updateSchedule);
    app.delete('/schedule/:scheduleId', scheduleController.removeSchedule);
    app.post('/liketour', tourController.likeTour);
    app.get('/tour/listNews/:tourId', tourController.getNewsOfTour);
    app.post('/tour/invite', tourController.inviteNewMember);//admin invite 
    app.get('/tour/tourMember/:tourId', tourController.getTourMember);
    app.post('/tour/acceptJoin', tourController.acceptJoinTour);
    app.post('/tour/rejectJoin', tourController.rejectJoinTour);
    app.post('/tour/removeMember', tourController.removeTourMember);
    app.post('/tour/leaveTour', tourController.leaveTour);
    app.post('/tour/requestJoin', tourController.requestJoinTour);
    app.post('/tour/acceptUser', tourController.acceptUser);
    app.post('/tour/rejectUser', tourController.rejectUser);
    app.get('/tour/getAllMember/:tourId', tourController.getAllMember);
    app.post('/tour/removeInvited', tourController.removeInvited);
    app.post('/tour/searchUser', tourController.searchUserByPhone);
    app.get('/tour/allimages/:tourId', tourController.getAllImageTour);
    app.get('/video/:name', tourController.streamvideo);
    app.get('/tour/tourofcategory/:categoryId/:count', tourController.getTourOfCategory);

    // notify
    app.get('/notify/:numberPage', notifyController.getListNotify);
    app.put('/notify/mark_as_read/:notifyId', notifyController.markNotifyRead);
    app.put('/notify/mark_as_not_read/:notifyId', notifyController.markNotifyToNotRead);
    app.put('/notify/mark_all_read', notifyController.markAllRead);
    app.put('/notify/delete_all_read', notifyController.deleteAllRead);
    app.post('/tour/checkuser', tourController.checkuser);
    app.post('/user/addFCMToken', userController.addFCMToken);
    app.post('/user/updateFCMToken', userController.updateFCMToken);
    app.post('/user/deleteFCMToken', userController.deleteFCMToken);
    app.post('/tour/video', uploadVideo.any(), tourController.uploadVideo);
    app.post('/tour/checkMember', tourController.checkMember);

    //category
    app.post('/tour/category', categoryController.addCategory);
    app.get('/category', categoryController.getAllCategory);
    app.post('/category/addTour', categoryController.addTourToCategory);
    app.get('/category/delete/:categoryId', categoryController.deleteCategory);
    app.post('/token/checktoken', categoryController.checkToken);
    //search
    app.post('/search/user/regex', searchController.searchUserByRegex);
    app.post('/search/tour/regex', searchController.searchTourByRegex);
    app.post('/search/place/regex', searchController.searchPlaceByRegex);
    app.post('/search/user/fulltext', searchController.searchUserFullText);
    app.post('/search/tour/fulltext', searchController.searchTourFullText);

    //road map
    app.post('/tour/roadmap', tourController.createRoadMap);
    app.put('/tour/roadmap', tourController.updateRoadMap);
    app.put('/user/location', tourController.updateCurrentLocation);
    app.post('/tour/roadmapinfo', tourController.getRoadMapInfo);
    app.put('/tour/enableLocation', tourController.updateEnableLocation);

    //special location
    app.post('/tour/roadmap/speciallocation', uploadImage.any(), specialLocationController.createSpLocation);
    app.put('/tour/roadmap/speciallocation', specialLocationController.updateSpLocation);
    app.post('/tour/delete/speciallocation', specialLocationController.deleteSpLocation);

    app.get('/token/showall', categoryController.showAllToken);
    app.get('/user/check/showall', userController.showall);
    app.get('/tour/check/showall', tourController.showall);
};

