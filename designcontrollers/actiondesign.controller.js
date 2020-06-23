const async = require('async');
const _ = require('lodash');
const db = require('../models');
const { Op } = require("sequelize");


function creatAction(data, callback) {
    db.UssdAction.create(data);
    callback({status: "00", message: "Ussd Short Code created successfully"})
}

function deleteAllActions(callback) {
    db.UssdAction.destroy({where:{id:{[Op.gt]: -1}}})
        .then(function () {
            callback();
        });
}

function UssdAction(actionName,menuId,pluginName,actionType,appId){
    const self = this;
    self.appId=appId;
    self.menuId=menuId;
    self.actionName=actionName;
    self.inheritsPlugin = pluginName;
    self.actionCode =null;
    self.actionType = actionType;
    self.save = function () {
        let code = self.actionCode.toString();
        const data = {
            appId : self.appId,
            menuId  : self.menuId,
            actionType:self.actionType,
            inheritsPlugin  : self.inheritsPlugin,
            code : code,
            actionName:self.actionName
        };
        creatAction(data,function () {
            console.log(`Action for ${self.menuId}--for plugin---${self.inheritsPlugin}--- saved `)
        })
    };
}



function ActionDesignFactory(){
    const actions=[];

    return {
        createNew : function (actionName,menuId,pluginName,actionType,appId){
            const action = new UssdAction(actionName,menuId,pluginName,actionType,appId);
            actions.push(action);
            return action;
        } ,
        saveAllActions : function () {
            actions.forEach(function (m) {
                m.save();
            })
        }
    }
}

module.exports = {
    creatAction,
    UssdAction,
    deleteAllActions,
    ActionDesignFactory
 };