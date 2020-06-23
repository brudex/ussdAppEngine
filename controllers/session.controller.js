const _ = require('lodash');
const utils = require('../utils');
const db = require('../models');
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
     let userSession = new UssdUserSession(inRequest,ussdapp);
     const data = userSession.toJson();
     data.shortCode = inRequest.input;
     db.UssdSession.create(data) ;
     callback(userSession);
}

function getCurrentSession(inRequest,callback){
   db.UssdSession.findOne({where :{sessionId:inRequest.sessionId,mobile:inRequest.mobile}})
       .then(function (sessionData) {
           ussdAppController.getUssdAppByAppId(sessionData.appId,function (err,ussdapp) {
               let userSession = new UssdUserSession(sessionData,ussdapp);
               callback(userSession);
           });
       });
}


function UssdUserSession(data,ussdApp){
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
        let input = inRequest.input.trim();
        console.log('Input is  '+input);
        self[data.inputHolder]=inRequest.input;
        if(utils.isNumeric(input)){
            console.log('Input is numeric '+input);
            if(_.isInteger(Number(input))){
                 this.peekMenuStack(function (result) {
                    let menuResponse=null;
                    if(result){
                        menuResponse = result.menuResponse;
                        data.selectedOption= extractSelectedOptionText(menuResponse,inRequest.input);
                        self[data.inputHolder+'Label']=data.selectedOption;
                    }
                    db.UssdUserInput.create(data);
                });
            }else{
                db.UssdUserInput.create(data);
            }
        }else{
            db.UssdUserInput.create(data);
        }
    };

    this.getAllUserInput = function (callback) {
        db.UssdUserInput.findAll({where:{appId:this.appId,sessionUuid:this.sessionUuid}})
            .then(function (inputs) {
                let obj = {};
                 inputs.forEach(function (item) {
                    if(item.selectedOption){
                        obj[item.inputHolder+'Label']=item.selectedOption;
                    }
                    obj[item.inputHolder]=item.input;
                });
                self.inputs = Object.assign(self.inputs,obj);
                if(callback){
                    callback(self.inputs);
                }
            })
    };

    this.deleteLastInput = function () {
        const sql = 'declare @id int;\n' +
            `select top 1 @id=id from UssdUserInputs where  appId='${self.appId}' and sessionUuid='${self.sessionUuid}' order by id desc;\n` +
            'delete from UssdUserInputs where id=@id\n';
        console.log('Executing query >>>'+sql);
        db.sequelize.query(sql,db.sequelize.QueryTypes.DELETE);
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
               console.log('The last menu ID found is >>>'+JSON.stringify(row));
                if(row.length){
                  return  callback(row[0].menuId);
               }
               return callback();
           });
    };

    this.getUssdAppName = function () {
        return self.appName;
    };

    this.pushToMenuStack = function (menuId,response) {
        const data = {
            appId:self.appId,
            sessionUuid: self.sessionUuid,
            menuResponse :response,
            menuId: menuId
        };
        db.UssdSequenceStack.create(data);
    };
    this.peekMenuStack = function (callback) {
        const sql =  `select top 1 menuId,menuResponse from UssdSequenceStacks where appId='${self.appId}' and sessionUuid='${self.sessionUuid}' order by id desc\n`;
        db.sequelize.query(sql,{type:db.Sequelize.QueryTypes.SELECT})
            .then(function (row) {
                 if(row.length){
                    let data ={menuId:row[0].menuId,menuResponse:row[0].menuResponse};
                    return  callback(data);
                }
                return callback();
            });
     };
    this.popFromMenuStack  = function (callback) {
        const sql = 'declare @id int;\n' +
            `select top 1 @id=id from UssdSequenceStacks where  appId='${self.appId}' and sessionUuid='${self.sessionUuid}' order by id desc;`+
            'delete from UssdSequenceStacks where id=@id\n';
        db.sequelize.query(sql).then(function () {
            if(callback){
                callback();
            }
        }).catch(function () {
            callback();
        });
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

    function extractSelectedOptionText(response,input){
        console.log("extractSelectedOptionText >>"+input);
        let text =response;
        let retVal = null;
        const pattern = `(\n|$)(${input})\\s(.+)(\\n|\\r|$)`;
        const reOptions = new RegExp(pattern);
        const matchObj = reOptions.exec(text);
        if(matchObj){
            retVal = matchObj[3];
        }
        return retVal;
    }
    if(self.sessionUuid){
        this.getAllUserInput();
    }
}


module.exports= {
    getNewOrCurrentSession,
    getNewOrCurrentSessionForApp
};