/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const db_tools=require('../tools/db_tools');
const mongoose=require('mongoose');
const db=db_tools.getDBConnection();
const estimateCostSchema=mongoose.Schema({
   unit:Number,
   tranfer: Number,
   food: Number,
   hotel:Number,
   other: Number,
   tour :{type:mongoose.Schema.Types.ObjectId,ref:'tour'}
})
const estimateCost=mongoose.model('estimateCost',estimateCost);
exports.estimateCost=estimateCost;

