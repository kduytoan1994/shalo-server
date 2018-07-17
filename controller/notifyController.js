/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const notifyDomain = require('../domain/notifyDomain');
exports.getListNotify = (req, res) => {
    var content = req.header('header-shalo');
    var numberPage = req.params.numberPage;
    notifyDomain.getListNotify(content, numberPage)
            .then(result => res.json(result))
            .catch(err => res.json(err));
};

exports.markNotifyRead = (req, res) => {
    var content = req.header('header-shalo');
    var notifyId = req.params.notifyId;
    notifyDomain.markNotifyRead(content, notifyId)
            .then(result => res.json(result))
            .catch(err => res.json(err));
};
exports.markNotifyToNotRead = (req, res) => {
    var content = req.header('header-shalo');
    var notifyId = req.params.notifyId;
    notifyDomain.markNotifyToNotRead(content, notifyId)
            .then(result => res.json(result))
            .catch(err => res.json(err));
};
exports.markAllRead = (req, res) => {
    var content = req.header('header-shalo');
    notifyDomain.markAllRead(content)
            .then(result => res.json(result))
            .catch(err => res.json(err));
};

exports.deleteAllRead = (req, res) => {
    var content = req.header('header-shalo');
    notifyDomain.deleteAllRead(content)
            .then(result => res.json(result))
            .catch(err => res.json(err));
};

