const async = require('async');
const _ = require('lodash');
const db = require('../models');
const logger = require("../logger");
const GetMemoryDb = require('./memorystore.controller').GetMemoryDbStore;
const taskFlowController = require('./taskflow.controller');


function getUssdAppByShortCode(shortCode,callback){
    db.UssdApp.findOne({where:{shortCode:shortCode}})
        .then(function (ussdpp) {
            if(ussdpp){
                let app = new UssdApp(ussdpp);
                return callback(null,app)
            }
            callback("Invalid short. Please check and dial again");
        })

 }

function getUssdAppByAppId(appId,callback){
    db.UssdApp.findOne({where:{appId:appId}})
        .then(function (ussdpp) {
            if(ussdpp){
                let app = new UssdApp(ussdpp);
                return callback(null,app)
            }
            callback("Invalid short. Please check and dial again");
        })
}


function getAllUssdApps(callback){
    db.UssdApp.findAll({})
        .then(function (ussdpps) {
            const apps =[];
            ussdpps.forEach(function (ussdpp) {
                let app = new UssdApp(ussdpp);
                apps.push(app);
            });
            if(apps.length){
                return callback(null,apps)
            }
            callback("No apps found");
        })
}

 function getUssdAppByName(appName){
     db.UssdApp.findOne({where:{appName:appName}})
         .then(function (ussdpp) {
             if(ussdpp){
                 let app = new UssdApp(ussdpp);
                 return callback(null,app)
             }
             callback("Invalid short. Please check and dial again");
         })
}



function UssdApp(data){
    let self = this;
    self.appId = data.appId;
    self.description = data.description;
    self.templateTag = data.templateTag;
    self.appEngine = data.appEngine;
    self.shortCode = data.shortCode;
    self.provider = data.provider;
    self.memDb = GetMemoryDb(self.appId);


    self.getTaskFlows = function (callback) {
        taskFlowController.getTaskFlowsByAppId(self.appId,function (taskFlows) {
            callback(taskFlows);
        })
    }

}

module.exports = {
    getUssdAppByShortCode,
    getUssdAppByName,
    getUssdAppByAppId,
    getAllUssdApps
};