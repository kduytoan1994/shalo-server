/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const db_tools = require('../tools/db_tools');
const mongoose = require('mongoose');

const db = db_tools.getDBConnection();

const tokenSchema = mongoose.Schema({
    userId:String,
    content: String
});
const token = mongoose.model('token', tokenSchema);
exports.token = token;

