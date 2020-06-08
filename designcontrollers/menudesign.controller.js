const async = require('async');
const _ = require('lodash');
const db = require('../models');
const logger = require("../logger");
const uuidv4 = require('uuid/v4');
const { Op } = require("sequelize");


function createMenu(data, callback) {
    db.UssdMenu.create(data);
    callback({status: "00", message: "Ussd Short Code created successfully"})
}

function countMenusForAppId(appId, callback) {
    db.UssdMenu.count({where:{appId:appId}})
        .then(function (count) {
            console.log(`the count is >>>`+count);
            callback(count);
        });
}


function deleteAllMenus(callback) {
    db.UssdMenu.destroy({where:{id:{[Op.gt]: -1}}})
        .then(function () {
            callback();//SELECT TOP (1000) [id]
        });
}




function Menu(headerText,userDefinedName){
    const self = this;
    self.appId='super6';
    self.uniqueId=  uuidv4();
    self.isFirst =false;
    self.headerText='';
    if(headerText){
        self.headerText= headerText;
    }
    self.userDefinedName ='';
    self.inputHolder ='';
    if(userDefinedName){
        self.userDefinedName=userDefinedName;
        self.inputHolder = userDefinedName;
    }
    self.displayText='';
    self.footerText='';
    self.allowGoBack =true;
    self.goBackInputIndicator ='0';
    self.parentMenuId ='';
    let switchOperations =[];
    let listItems =[];
    self.terminate = false;
    self.save = function () {
        if(listItems.length){
            self.displayText += '\n'+ listItems.join('\n');
        }
        const data = {
            appId : self.appId,
            uniqueId  : self.uniqueId,
            isFirst  : self.isFirst,
            displayText  : self.displayText,
            headerText  : self.headerText,
            footerText  : self.footerText,
            userDefinedName : self.userDefinedName,
            inputHolder   : self.inputHolder,
            allowGoBack : self.allowGoBack,
            goBackInputIndicator: self.goBackInputIndicator,
            switchOperations  : JSON.stringify(switchOperations),
            terminate : self.terminate,
            parentMenuId : self.parentMenuId
        };

        createMenu(data,function () {
            console.log(`Menu ---${self.displayText}--- saved `)
        })
    };
    self.switchOperation = {
        IfInput : function (operator,compareValue) {
            return {
                goto : function (menuId) {
                    const data = {
                        action: 'goto',
                        actionParam : menuId,
                        operator : operator, //eq,ge,gt,ge,le,lt,
                        compareVal : compareValue

                    };
                    switchOperations.push(data);
                },
                terminate : function () {
                    const data = {
                        action: 'terminate',
                        actionParam : '',
                        operator : operator, //eq,ge,gt,ge,le,lt,
                        compareVal : compareValue
                    };
                    switchOperations.push(data);
                }
            }
        }
    };
    self.addListItem = function (key,value) {
        listItems.push(`${key} ${value}`);
    };
    self.setParent = function (parentMenuId) {
        self.parentMenuId= parentMenuId;
    }

}



module.exports = {
    createMenu,
    Menu,
    deleteAllMenus
 };