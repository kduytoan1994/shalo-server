/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var request=require('request');
exports.sendNotificationToUser=( message, onSuccess) =>{  
  request({
//        url: 'http://107.113.186.155:3000/search/tour/fulltext',
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'key=' + 'AAAAW1pXsnY:APA91bFCHHNtEAVrPRYGKZJzw0RyXjXvfLieRpFy8qB1PDLs_pa_Rgutv6ZgS5ajLmmA7vChvMdkyciFJrrmcDTyXD5E9Yq9v0A4w1lCAaviiwjNJrs6ONMx8T9n42jj96o4zXZwGddi'
        },
        body: JSON.stringify({
//            keyword:"Ha",
//            count:"1"
            notification: {
                title: "message",
                body: "xxx"
            },
            to: "eoriOOAYK60:APA91bHfzdaojHxHMvMDe8l-OvasH5g2MU5Zbb9ubjhbrWsFy7DC8x7tb_ImBiSz_H5K4NlOaEQAcWOH4GujyP64S_6qLN9YW6BRs4xs7uHZhRIUrDQ0mvUYToCOTfACpsYteaV5K4bY"
        })
    }, function (error, response, body) {
//    if (response.statusCode >= 400) {
//      console.error('HTTP Error: ' + response.statusCode + ' - ' + response.statusMessage);
//    } else {
        onSuccess();
//    }
        console.log('response' + String(response) + ' error:' + error + ' body:' + body);
    });
};

