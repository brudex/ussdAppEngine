const async = require('async');
const _ = require('lodash');
const db = require('../models');
const logger = require("../logger");
const dateFns = require('date-fns');
const addMinutes = dateFns.addMinutes;
const uuidv4 = require('uuid/v4');
const ussdAppController = require('./ussd_app.controller');


//todo assign unique url to every ussd app
function getNewOrCurrentSession(inRequest,callback){
     if(inRequest.isFirstDial){
         ussdAppController.getUssdAppByShortCode(inRequest.input,function(err,ussdapp){
             if(err){
                return callback(err);
             }
            createSession(inRequest,ussdapp,function(session){
                return callback(null,session)
            });
         })
     }else{
         getCurrentSession(inRequest,function(session){
             return callback(null,session)
         });
     }
 }

//todo assign unique url to every ussd app
function getNewOrCurrentSessionForApp(inRequest,ussdapp,callback){
    if(inRequest.isFirstDial){
        createSession(inRequest,ussdapp,function(session){
            return callback(null,session)
        });
    }else{
        getCurrentSession(inRequest,function(session){
            return callback(null,session)
        });
    }
}

 function createSession(inRequest,ussdapp,callback){
      // var session = {
     //    sessionId : inRequest.sessionId,
     //    appId : app.appId,
     //    inputHolder : '0',
     //    input : '0',
     //    requestType : '0',
     //    mobile : '0',
     //    network : '0',

     let userSession = new UsssdUserSession(inRequest,ussdapp);
     const data = userSession.toJson();
     data.shortCode = inRequest.input;
     db.UssdSession.create(data) ;
     callback(userSession);
}

function getCurrentSession(inRequest,callback){
   db.UssdSession.findOne({where :{sessionId:inRequest.sessionId,mobile:inRequest.mobile}})
       .then(function (sessionData) {
           db.UssdApp.findOne({where:{appId:sessionData.appId}})
               .then(function (ussdapp) {
                   let userSession = new UsssdUserSession(sessionData,ussdapp);
                   callback(userSession);
               })
       });
}


function UsssdUserSession(data,ussdApp){
    let self = this;
    self.sessionId= data.sessionId;
    self.appId = ussdApp.appId;
    self.mobile = data.mobile;
    self.network = data.network;
    self.sessionUuid = data.uuid;
    self.appName = ussdApp.appName;
    self.appId = ussdApp.appId;
    self.ussdApp = ussdApp;
    self.shortCode = data.shortCode;
    self.menuEnv = {};
    self.inputs = {};

    this.saveUserInput = function (inRequest,menu) {
        let data = {
            appId : self.appId,
            sessionId : self.sessionId,
            sessionUuid : self.sessionUuid,
            input : inRequest.input,
            inputHolder: menu.inputHolder
        };
        console.log('Saving user input>>'+JSON.stringify(data));
        db.UssdUserInput.create(data);
    };
    this.getAllUserInput = function (callback) {
        db.UssdUserInput.findAll({where:{appId:this.appId,sessionUuid:this.sessionUuid}})
            .then(function (inputs) {
                let obj ={};
                inputs.forEach(function (item) {
                    obj[item.inputHolder]=item.input;
                });
                self.inputs = Object.assign(self.inputs,obj);
                if(callback){
                    callback(self.inputs);
                }
            })
    };
    this.deleteLastInput = function () {
        const sql = 'declare @id int\n' +
            `select top 1 @id=id from UssdUserInput where  appId='${self.appId}' and sessionUuid='${self.sessionUuid}' order by id desc\n` +
            'delete from UssdUserInput where id=@id\n';
        db.sequelize.query(sql);
    };
    this.setMenuEnvVariable =function (vName,value) {  //actions return results which can saved and replaced in text before response
        console.log('actionFactory Setting menuEnv'+vName + ">>"+value);
        self.menuEnv[vName]=value;
    };
    this.getEnvVariables =function () {  //actions return results which can saved and replaced in text before response
       return self.menuEnv;
    };
    this.setSessionValue =function (inputName,value) {  //set values which can access during the lifetime of this ussd session
        let data = {
            appId : self.appId,
            sessionId : self.sessionId,
            sessionUuid : self.sessionUuid,
            input : value,
            inputHolder: inputName
        };
        self.inputs[inputName]=value;
        db.UssdUserInput.create(data);
    };

    this.getLastMenuId = function (callback) {
       const sql =  `select top 1 menuId from UssdSequenceStacks where appId='${self.appId}' and sessionUuid='${self.sessionUuid}' order by id desc\n`;
       db.sequelize.query(sql,{type:db.Sequelize.QueryTypes.SELECT})
           .then(function (row) {
                if(row.length){
                  return  callback(row[0].menuId);
               }
               return callback();
           });
    };

    this.getUssdAppName = function () {
        return self.appName;
    };
    this.pushToMenuStack = function (menuId) {
        const data = {
            appId:self.appId,
            sessionUuid: self.sessionUuid,
            menuId: menuId
        };
        db.UssdSequenceStack.create(data);
    };
    this.popFromMenuStack = function () {
        const sql = 'declare @id int\n' +
            `select top 1 @id=id from UssdSequenceStacks where  appId='${self.appId}' and sessionUuid='${self.sessionUuid}' order by id desc\n` +
            'delete from UssdUserInput where id=@id\n';
        db.sequelize.query(sql);
     };
    this.getUssdApp = function (callback) {
        if(self.ussdApp){
           return callback(self.ussdApp);
        }
        db.UssdApp.findOne({where:{appId:self.appId}})
            .then(function (ussdapp) {
                 callback(ussdapp);
            })
    };
    this.toJson = function(){
        const session = {
            sessionId : data.sessionId,
            appId : self.appId,
            requestType : self.requestType,
            mobile : self.mobile,
            network : self.network,
            uuid : uuidv4(),
            expiryDate : addMinutes(new Date(),2)
         };
        self.sessionUuid = session.uuid;
        return session;
    };

    this.getAllUserInput();

}


module.exports= {
    getNewOrCurrentSession,
    getNewOrCurrentSessionForApp
};