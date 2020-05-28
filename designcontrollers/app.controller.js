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


function clearUssdMenuItems(data, res) {
    console.log("Deletting ussd flows >>", data);
    db.UssdMenu.destroy({where: {appId: data}})
        .then(function (flow) {
            res.json({status: "00", message: "Menu items successfully deleted"});
     });
}

function listUssdFlowForApp(data, res) {
    console.log("The data received for list ussd flows >>>> ");
    console.log(data);
    var appId = data;
    var menuItems = [];
    async.waterfall([function (done) {
        db.UssdMenu.findAll({where: {appId: appId}})  //get ussd menuItems by id
            .then(function (flows) {
                logger.info("Found ussd flows >>>>> ", flows.length);
                done(null, flows);
            })
    }, function (flows, done) {
        flows.forEach(function (item) {
            menuItems.push(item.dataValues); //get only json data without all the functions
        });
        done(null);
    }], function () {
        return res.json({status: "00", list: menuItems})
    });
}

function saveUssdFlow(data, res) {
    console.log("Saving ussd flow >>>>");
    console.log(data);
    var modifiedItems = [];
    var menuFlow = data.menuFlow;
    var menuItems = data.menuItems;
    var levelTree = '0';
    var appId = data.appId;
    traverse(levelTree, menuFlow);
    function traverse(str, menuFlow) {
        for (var p = 0, len = menuFlow.length; p < len; p++) {
            var obj = menuFlow[p];
            var item = _.find(menuItems, { 'uniqueId': obj.id });
            item.parentFlowId = str;
            item.flowId = str + '-' + item.returnValue;
            item.appId = appId;

            if(item.id){
                delete item.id;
            }
            modifiedItems.push(item);
            if (obj.children) {
                console.log('Iterating chidren');
                console.log('Children are >>');
                console.log(obj.children);
                console.log("Passing Str of value >>>" + str);
                console.log('Traversing childreing of >>' + obj.id);
                console.log('Traversing childreing of >>' + item.displayItem);
                traverse(item.flowId, obj.children);
            }
        }
    }

    async.waterfall([
        function (done) {
            db.UssdMenu.destroy({where: {appId: appId}}).then(function () {
                done(null);
            });
        },
        function (done) {
            db.UssdMenu.bulkCreate(modifiedItems).then(function () {
                done(null);
            })
        }, function () {
            return res.json({status: "00", message: "Menu Items Succesfully saved"})
        }
    ]);

}



module.exports = {
    createNewUssdApp,
    findUssdAppByAppId,
    deleteUssdAppByAppId,
    deleteAllSessions
 };