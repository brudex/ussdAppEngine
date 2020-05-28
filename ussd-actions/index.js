"use strict";
const fs  = require("fs");
const path = require("path");
const controllers      = {};
const utils = require("../utils");
const logger = require("../logger");
const db = require("../models");
const env       = process.env.NODE_ENV || "test";
const appConfig = require("../config/config.json")[env];


fs.readdirSync(__dirname)
    .filter(function(file) {
        let isActionFile = file.indexOf('action.') >= 0;
        return isActionFile && (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        const controller = require(path.join(__dirname, file));
        controllers[controller.actionName] = controller.handleRequest;
        if(controller.actions){
            console.log('Actions found>>>');
            Object.keys(controller.actions).forEach(element => {
                console.log('Action name >>>'+element);
                controllers[element] = controller.actions[element];
            });
        }
    });


function handleUssdTransaction (sessionData,inputValues,actionName, callback){
    logger.info('Performing Ussd Transaction   >>>', actionName);
    logger.info('inputValues are  >>>', inputValues);
    logger.info('Session Data is  >>>', sessionData.dataValues);   
    const params ={};
    params.sessionData = sessionData;
    params.inputValues = inputValues;
    params.restHandler = utils.restHandler;
    params.reference = utils.generateTransId();
    params.db = db;
    params.logger = logger;
    params.appConfig = appConfig;
    logger.info('Calling action >>>'+actionName);
    if(controllers[actionName]){
        controllers[actionName](params,function(result){
            logger.info('Ussd Action Result >>>',result);
            callback(result);
        });
    }else{
        logger.info('USSD ACTION '+actionName+" NOT FOUND. CONTINUE EXECUTION");
        console.log('USSD ACTION '+actionName+" NOT FOUND. CONTINUE EXECUTION");
        const response={};
        response.message = null;
        response.responseType = "input"; 
        return callback(response)
    }
   
}



module.exports = {
    handlerRequest: handleUssdTransaction
};