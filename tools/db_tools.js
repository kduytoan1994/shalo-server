/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var mongoose=require('mongoose');
var config=require('../config/config.json');

var db;

exports.DBconnection=()=>
    new Promise((resolve,reject)=>{
        if(db)
            return db;
        mongoose.Promise=global.Promise;
        const options = {
            useMongoClient: true,
            autoIndex: false // Don't build indexes
            //reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
            //reconnectInterval: 500, // Reconnect every 500ms
            //poolSize: 10, // Maintain up to 10 socket connections
            //// If not connected, return errors immediately rather than waiting for reconnect
            //bufferMaxEntries: 0
        };
        // mongoose.connect('mongodb://kduytoan:toankk123@ds221258.mlab.com:21258/shalo-v1',options)
        mongoose.connect('mongodb://localhost:27017/Shalo-Test_v1')
            .then(()=>{
                console.log('Create db susscessfully!');
                resolve(db);
                })
            .catch(err=>{
                console.log('error creating db connection: ' + err);
                reject(db);
                });                                 
    });


exports.getDBConnection = ()=> {
    if (db) {
        return db;
    }
    console.log('There is no mongo connection');
    return null;
};
