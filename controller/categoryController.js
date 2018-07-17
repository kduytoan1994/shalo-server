/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var categoryDomain = require('../domain/categoryDomain');

function success(res, data, description, code) {
    res.json({message: {success: "1", descrpiton: description, code: code}, data: data});
}

function error(res, err, description, code) {
    res.json({message: {success: "0", descrpiton: description, code: code}, data: err});
}
var auth = require('../authenticate/authenticate')

exports.addCategory = (req, res) => {
    var name = req.body.name;
    categoryDomain.addCategory(name)
        .then(result => {
            success(res, result, 'create successfully!', 201);
        })
        .catch(err => {
            error(res, err, '', 500);
        });
};
exports.getAllCategory = (req, res) => {
    categoryDomain.getAllCategory()
        .then(result => {
            success(res, result, '', 200);
        })
        .catch(err => {
            error(res, err, '', 500);
        });
};
exports.addTourToCategory = (req, res) => {
    var token_content = req.header('header-shalo');
    var tourId = req.body.tourId;
    var categoryId = req.body.categoryId;
    categoryDomain.addTourToCategory(token_content, tourId, categoryId)
        .then(result => {
            success(res, result, '', 200);
        })
        .catch(err => {
            error(res, err, '', 500);
        });
};
exports.deleteCategory = (req, res) => {
    var categoryId = req.params.categoryId;
    categoryDomain.deleteCategory(categoryId)
        .then(result => {
            res.json(result)
        })
        .catch(err => {
            res.json(err)
        })
};
exports.checkToken  = (req, res) =>{
    var token_content = req.header('header-shalo');
    auth.checkToken(token_content)
        .then(result=>{
            res.json(result);
        })
        .catch(err=>{
            res.json(err);
        })
}
exports.showAllToken = (req,res)=>{
    auth.showAllToken()
        .then(result=>{
            res.json(result);
        })
        .catch(err=>{
            res.json(err);
        })
}