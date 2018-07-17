/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var searchDomain = require('../domain/searchDomain');
function successRes(res, data, description, code) {
    res.json({ message: { success: "1", description: description, code: code }, data: data });
}
function errorRes(res, err, description, code) {
    res.json({ message: { success: "0", description: description, code: code }, data: err });
}
exports.searchUserByRegex = (req, res) => {
    var digits = req.body.keyword;
    searchDomain.searchUserByRegex(digits)
        .then(result => {
            successRes(res, result, '', 200);
        })
        .catch(err => {
            errorRes(res, err, '', 500);
        });
};
exports.searchTourByRegex = (req, res) => {
    var digits = req.body.keyword;
    searchDomain.searchTourByRegex(digits)
        .then(result => {
            successRes(res, result, '', 200);
        })
        .catch(err => {
            errorRes(res, err, '', 500);
        });
};

exports.searchPlaceByRegex = (req, res) => {
    var digits = req.body.keyword;
    searchDomain.searchPlaceByRegex(digits)
        .then(result => {
            successRes(res, result, '', 200);
        })
        .catch(err => {
            errorRes(res, err, '', 500);
        });
};

exports.searchUserFullText = (req, res) => {
    var name = req.body.keyword;
    var count = req.body.count;
    searchDomain.searchUserFullText(name, count)
        .then(result => {
            successRes(res, result, '', 200);
        })
        .catch(err => {
            errorRes(res, err, '', 500);
        });
};
exports.searchTourFullText = (req, res) => {
    var name = req.body.keyword;
    var count = req.body.count;
    searchDomain.searchTourFullText(name, count)
        .then(result => {
            successRes(res, result, '', 200);
        })
        .catch(err => {
            errorRes(res, err, '', 500);
        });
}
    ;