const async = require('async');
const _ = require('lodash');
const db = require('../models');
const logger = require("../logger");
const uuidv4 = require('uuid/v4');
const { Op } = require("sequelize");

function createNewUssdApp(data, callback) {
    if(!data.appId){
        data.app = uuidv4();
    }
    db.UssdApp.create(data);
    callback({status: "00", message: "Ussd Short Code created successfully"})
}


function findUssdAppByAppId(appId, callback) {
    db.UssdApp.findOne({where:{appId :appId}}).then(function (app) {
        if(app){
          return  callback(null,app);
        }
        callback('Ussd App not found');
    });
}

function deleteUssdAppByAppId(appId, callback) {
    db.UssdApp.findOne({where:{appId :appId}}).then(function (app) {
        if(app){
            app.destroy();
            return callback(null,"App deleted successfully")
        }
        callback('Ussd App not found');
    });
}


function deleteAllSessions(callback) {
    db.UssdSession.destroy({where:{id:{[Op.gt]: -1}}}).then(function () {
        db.UssdUserInput.destroy({where:{id:{[Op.gt]: -1}}}).then(function () {
            callback();
        })
    });
}


function listAllUssdApps(data, res) {
    db.UssdApp.findAll().then(function (apps) {
        var list = [];
        apps.forEach(function (item) {
            var app = {};
            app.appId = item.appId;
            app.shortCode = item.shortCode;
            app.description = item.description;
            list.push(app);
        });
        var response = {};
        response.status = '00';
        response.data = list;
        res.json(response);
    });
}

function deleteUssdApp(data, res) {
    console.log("finding flows >>", data);
    db.UssdMenu.findOne({where: {appId: data}})
        .then(function (flow) {
            if (flow) {
                res.json({status: "02", message: "This app has existing ussd flows. Delete all flows before deleting this app"})
            } else {
                db.UssdApp.destroy({where: {appId: data}});
                res.json({status: "00", message: "Ussd App successfully deleted"})
            }
    });
}



module.exports = {
    createNewUssdApp,
    findUssdAppByAppId,
    deleteUssdAppByAppId,
    deleteAllSessions
 };