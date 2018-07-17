/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global admin_shalo, global, process */

'use strict';

const express = require('express');
const bodyparser = require('body-parser');
const db_tools = require('./tools/db_tools');
const app = express();
const port 	   = process.env.PORT || 8080;
global.admin_shalo = require("firebase-admin");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const serviceAccount = require("./private/sharelocation-e9d02-firebase-adminsdk-vsmay-4c1aec82da");

admin_shalo.initializeApp({
  credential: admin_shalo.credential.cert(serviceAccount),
  databaseURL: "https://sharelocation-e9d02.firebaseio.com"
});

db_tools.DBconnection()
        .then(() => {
            app.use(bodyparser.urlencoded({extended: false}));
            app.use(bodyparser.json({limit: '50mb'}));
            app.use(bodyparser.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
            var server = require('http').createServer(app);
            require('./routes')(app);

            server.listen(port);
            console.log('Server listening on port ${port}');
        })
        .catch(err => {
            console.log('Error: ' + err);
        });

