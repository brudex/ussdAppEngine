const async = require('async');
const _ = require('lodash');
const db = require('../models');
const logger = require("../logger");
const uuidv4 = require('uuid/v4');
const { Op } = require("sequelize");
const validationTypeFunctions = require('../controllers/validation.controller').validationTypeFunctions;
const ValidationOperators = Object.keys(validationTypeFunctions);


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

function saveInputValidation(data,callback) {
    db.InputValidation.create(data);
    if(callback)
        callback({status: "00", message: "InputValidation created successfully"})
}



function Menu(headerText,userDefinedName,appId){
    const self = this;
    self.appId= appId;
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
    let inputValidations = [];
    self.terminate = false;
    self.save = function () {
        if(listItems.length){
            if(self.displayText.length >10 ){
                self.displayText += '\n'+ listItems.join('\n');
            }else{
                self.displayText +=  listItems.join('\n');
            }
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
            console.log(`Menu ---${self.displayText}--- saved `);
            inputValidations.forEach(function (inputValidation) {
                inputValidation.save();
            })
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
    self.addText = function (text) {
        listItems.push(text);
    };
    self.setParent = function (parentMenuId) {
        self.parentMenuId = parentMenuId;
    };
    self.validateInput =  function () {
        const validation =  new InputValidation(self.appId,self.uniqueId);
        inputValidations.push(validation);
        return validation.createNew();
    }

}


function MenuDesignFactory(){
    const menus=[];
    return {
        createNew : function (headerText,userDefinedName,appId){
            const menu = new Menu(headerText,userDefinedName,appId);
            menus.push(menu);
            return menu;
        } ,
        saveAllMenus : function () {
            menus.forEach(function (m) {
                m.save();
            })
        }

    }
}



function InputValidation(appId,menuId){
    const self = this;
    self.description = '';
    const validationModel ={appId:appId,menuId:menuId};
    let retModel ={};
    self.createNew = function(){
          retModel =  {
            operation : function(validationType,compareValue){
                validationModel.validationMethod = validationType;
                validationModel.validationCode = compareValue;
                return retModel;
            },
            validationFunction :null,
            errorMessage:  function (errorMsg) {
                validationModel.errorMessage = errorMsg;
            }
        };
        return retModel;
    };
    self.save = function () {
       validationModel.description =self.description;
       if(retModel.validationFunction){
           validationModel.validationCode = retModel.validationFunction.toString();
           validationModel.validationMethod ='javascript';
       }
       saveInputValidation(validationModel);
    }

}


module.exports = {
    createMenu,
    Menu,
    MenuDesignFactory,
    deleteAllMenus
 };