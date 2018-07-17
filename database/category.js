/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const db_tools=require('../tools/db_tools');
const mongoose=require('mongoose');
const db=db_tools.getDBConnection();

const categorySchema=mongoose.Schema({
   name                 :String,
   tour                 :[{type:mongoose.Schema.Types.ObjectId,ref:'tour'}],
   tag                  :[{type:String}]
});
const category=mongoose.model('category',categorySchema);
exports.category=category;

