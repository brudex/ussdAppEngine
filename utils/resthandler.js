"use strict";
const request = require('request');
const doPost = function (payload,config,callback) {
    const options = {
        url: config.url,
        headers: config.headers,
        json: true,
        body: payload,
        method: "POST"
    };
    request(options, function(error, response, body){
        if(error){
            console.log(error);
        }
        console.log("Response headers are >>> ");
        console.log(body);
        callback(error,body);
    });
};


const doGet = function (url,config,callback) {
    const options = {
        url: url,
        json: true,
        method: "GET",
        headers:config.headers
    };
    request(options, function(error, response, body){
        console.log(error);
        console.log(body);
        callback(error,body);
    });
};

module.exports = {
    doPost: doPost,
    doGet: doGet
};




