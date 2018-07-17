/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const scheduleDomain = require('../domain/scheduleDomain');
const mongoose = require('mongoose');

function successRes(res,data,description,code){
    res.json({message:{success:"1",descrpiton:description,code: code},data:data});
}
function errorRes(res,err,description,code){
    res.json({message:{success:"0",descrpiton:description,code:code},data:err});
}
function updateOrRemoveRes(res,err,description,code){
    res.json({message:{success:"1",descrpiton:description,code:code}});
}
function updateOrRemoveError(res,err,description,code){
    res.json({message:{success:"0",descrpiton:description,code:code}});
}
exports.createSchedule = (req, res) => {
    var tour = req.body.tour;
    var time = req.body.time;
    var content = req.body.content;

    scheduleDomain.createSchedule(tour, time, content)
            .then(result=>successRes(res,result,"",201))
            .catch(err=>errorRes(res,err,"",500));
};
exports.updateSchedule=(req,res)=>{
    var scheduleId=req.body.scheduleId;
    var time=req.body.time;
    var content=req.body.content;
    
    scheduleDomain.updateSchedule(scheduleId,time,content)
            .then(result=>updateOrRemoveRes(res,result,"",203))
            .catch(err=>updateOrRemoveError(res,err,"",500));
};
exports.removeSchedule=(req,res)=>{
    var scheduleId=req.params.scheduleId;
    
    scheduleDomain.deleteSchedule(scheduleId)
            .then(result=>updateOrRemoveRes(res,result,"",204))
            .catch(err=>updateOrRemoveError(res,err,"Cannot remove schedule",500));
};