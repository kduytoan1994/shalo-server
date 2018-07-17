/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//var ad = require('firebase-admin');
//var serviceAccount = require("./private/testfcn-9bc64-firebase-adminsdk-gnavz-3e19c3060e");
//
//ad.initializeApp({
//    credential: ad.credential.cert(serviceAccount),
//    databaseURL: "https://testfcn-9bc64.firebaseio.com"
//});
//var registrationToken = "fymz672FoQk:APA91bEsbJry8M1pKk2E-__6I4P9wbTmOZRRmYM4t8s8XRnA9cqBHWBn2DdKZ5LXXsB0wKjMFh8AgL32BhLU2wYOUz8uCsmQSzIGYxejq8RlMvujH2yzkV9Cwhl8wp3utAbP8yowYb71";
//var payload = {
//    notification: {
//        title: "Test notification",
//        body: "Test notification"
//    },
//    data: {
//        score: "850",
//        time: "2:45"
//    }
//};
//
//ad.messaging().sendToDevice(registrationToken, payload)
//        .then(response => {
//            console.log("Successfully sent message:", response);
//        })
//        .catch(error => {
//            console.log("Error sending message:", error);
//        });
//var firebase = require('firebase');  
//var request = require('request');
//
//var API_KEY = "FCM_API_KEY";
//
//firebase.initializeApp({  
//  serviceAccount: "account.json",
//  databaseURL: "FIREBASE_DATABASE_URL"
//});
//var ref = firebase.database().ref();
//
//function listenForNotificationRequests() {  
//  var requests = ref.child('notificationRequests');
//  requests.on('child_added', function(requestSnapshot) {
//    var request = requestSnapshot.val();
//    sendNotificationToUser(
//      request.user_id,
//      request.message,
//      function() {
//        requestSnapshot.ref.remove();
//      }
//    );
//  }, function(error) {
//    console.error(error);
//  });
//};
//
//function sendNotificationToUser(userId, message, onSuccess) {  
//  request({
//    url: 'https://fcm.googleapis.com/fcm/send',
//    method: 'POST',
//    headers: {
//      'Content-Type': ' application/json',
//      'Authorization': 'key=' + API_KEY
//    },
//    body: JSON.stringify({
//      notification: {
//        title: message
//      },
//      to: '/topics/user_' + userId
//    })
//  }, function(error, response, body) {
//    if (response.statusCode >= 400) {
//      console.error('HTTP Error: ' + response.statusCode + ' - ' + response.statusMessage);
//    } else {
//      onSuccess();
//    }
//  });
//}

// start listening
//listenForNotificationRequests();  
//var FCM = require('fcm-node');
//var serverKey = "AAAAy0hNvKg:APA91bHHdEhKx5Wgkyin9FcRhHSO-Rm8Naz1rTxm0fiTp_jMj7EoRCegLUUJMgp9va7Ro-V2CGzjvlSSDTE4Pqo5g5XDo11Btx_Qa6EX0X27ymbs8ugVYMCeeRecvej6EHMcfv-upsjD";
////put your server key here
//var fcm = new FCM(serverKey);
////var multipart=require('multipart');
//
//var message = {//this may vary according to the message type (single recipient, multicast, topic, et cetera)
//    to: 'd5pYH-WprBc:APA91bE_uzvYgCrcqxRfxQipHo7TSsI_GDBnLYJZpByDqGDV-BsbRVW1EgivZ4r2uSjjoPoe3oB6bXXLhxawLBk84vMqSXin25G_dxNS6bmE9gzczJgeYJzxqSnxYogimUUX28-JGbg7',
//        collapse_key: 'toan',
//
//    notification: {
//        title: 'Title of your push notification',
//        body: 'Body of your push notification'
//    },
//
//    data: {//you can send only notification or only data(or include both)
//        my_key: 'my value',
//        my_another_key: 'my another value'
//    }
//};
//
//fcm.send(message, function (err, response) {
//    if (err) {
//        console.log("Something has gone wrong!" + err);
//    } else {
//        console.log("Successfully sent with response: ", response);
//    }
//});
var request=require('request');
function sendNotificationToUser( message, onSuccess) {  
  request({
    "rejectUnauthorized": false,
    url: 'https://fcm.googleapis.com/fcm/send',
    method: 'POST',
    headers: {
      'Content-Type': ' application/json',
      'Authorization': 'key=' + 'AAAA61dl7vQ:APA91bF4rKxV58aGuNQxtto6RDmOckPJEiRSH_0qljkYmmv0DE28IzhQaBjguTZpMHPPtXbGDwPG0goJ9eMqm-LIzKMLjXsh-JIzNKctQ_fwe60XJSS87mleNT7WtpypUS827-q0FZGU'
    },
    body: JSON.stringify({
      notification: {
        title: message,
        body: "ahihi"
      },
    to: 'fxRS8lxfBI8:APA91bG11U7V6SzWJOU1_4Sc8emZql54DAfyF5fm7LQRqGARl_iKgHrFG24sdWa24Tz0ypb-nGRwL-Pix08Pb-lqF-DzlhtXdm2xq0ZC2VHIo9Te0lG-XpmT4Uoh5P7qQiFy8llHI4dk'
    })
  }, function(error, response, body) {
//    if (response.statusCode >= 400) {
//      console.error('HTTP Error: ' + response.statusCode + ' - ' + response.statusMessage);
//    } else {
      onSuccess();
//    }
        console.log('response'+String(response)+' error:'+error+' body:'+body);
  });
}
sendNotificationToUser('Hùng kute',function(){
    console.log('xx');
});