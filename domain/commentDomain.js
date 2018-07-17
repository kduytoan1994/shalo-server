/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const newsDB = require('../database/news');
const auth = require('../authenticate/authenticate');
const userDB = require('../database/users');
const tourDB = require('../database/tour');
const fs = require('fs');
function result(res, success, des, code, data) {
    res({message: {success: success, description: des, code: code}, data: data});
}
