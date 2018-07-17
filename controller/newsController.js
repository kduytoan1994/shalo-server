/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const newsDomain = require('../domain/newsDomain');
function success(res, data, description, code) {
    res.json({message: {success: "1", descrpiton: description, code: code}, data: data});
}
function error(res, err, description, code) {
    res.json({message: {success: "0", descrpiton: description, code: code}, data: err});
}

exports.likeNews = (req, res) => {
    var userToken = req.header('header-shalo');
    var newsId = req.params.newsId;
    newsDomain.likeNews(userToken, newsId)
            .then(result => res.json(result))
            .catch(err => res.json(err));
};
exports.createNews = (req, res) => {
    var contentNews = req.body.content;
    var userToken = req.header('header-shalo');
    var tourId = req.body.tourId;
    var listImage = req.files;
    newsDomain.createNews(contentNews, userToken, tourId, listImage)
            .then(result => success(res,result," ",201))
            .catch(err =>error(res,err,"",500));

};

exports.deleteNews = (req, res) => {
    var token_content = req.header('header-shalo');
    var newsId = req.params.newsId;
    newsDomain.deleteNews(token_content, newsId)
            .then(result => success(res, result, result, 204))
            .catch(err => error(res, err, err, 500));
};
exports.updateNews = (req, res) => {
    var token_content = req.header('header-shalo');
    var newsId = req.body.newsId;
    var content = req.body.content;
    var listimage=req.files;
    newsDomain.updateNews(token_content, newsId, content,listimage)
            .then(result => success(res, result, result, 202))
            .catch(err => error(res, err, err, 500));
};
exports.deleteImageNews=(req,res)=>{
    var token_content=req.header('header-shalo');
    var pictureUri=req.body.imageUri;
    var newsId=req.body.newsId;
    newsDomain.deleteImageNews(token_content,pictureUri,newsId)
            .then(result => success(res, result, result, 203))
            .catch(err => error(res, err, err, 500));
};
exports.createComment = (req, res) => {
    var token_content = req.header('header-shalo');
    var newsId = req.body.newsId;
    var content = req.body.content;
    newsDomain.createComment(token_content, newsId, content)
            .then(result => success(res, result, "", 201))
            .catch(err => error(res, err, "", 500));
};
exports.getListComment = (req, res) => {
    var token_content = req.header('header-shalo');
    var newsId = req.params.newsId;
    newsDomain.getListComment(token_content, newsId)
            .then(result => success(res, result, "", 200))
            .catch(err => error(res, err, "", 500));
};

exports.deleteComment = (req, res) => {
    var token_content = req.header('header-shalo');
    var commentId = req.params.commentId;
    console.log(token_content + "---" + commentId);
    newsDomain.deleteComment(token_content, commentId)
            .then(result => res.json(result))
            .catch(err => res.json(err));
};