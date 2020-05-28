const async = require('async');
const _ = require('lodash');
const db = require('../models');
const logger = require("../logger");


function getUssdAppByShortCode(shortCode,callback){
    db.UssdApp.findOne({where:{shortCode:shortCode}})
        .then(function (ussdpp) {
            if(ussdpp){
                return callback(null,ussdpp)
            }
            callback("Invalid short. Please check and dial again");
        })

 }

function getUssdAppByAppId(appId){
    db.UssdApp.findOne({where:{appId:appId}})
        .then(function (ussdpp) {
            if(ussdpp){
                return callback(null,ussdpp)
            }
            callback("Invalid short. Please check and dial again");
        })
}

 function getUssdAppByName(appName){
     db.UssdApp.findOne({where:{appName:appName}})
         .then(function (ussdpp) {
             if(ussdpp){
                 return callback(null,ussdpp)
             }
             callback("Invalid short. Please check and dial again");
         })
}

 
module.exports = {
    getUssdAppByShortCode,
    getUssdAppByName,
    getUssdAppByAppId
};