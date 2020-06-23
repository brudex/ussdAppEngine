const async = require('async');
const db = require('../models');
const _ = require('lodash');
const logicOperators = require('./logic.operators');

function getFirstMenu(ussdApp,callback){
    db.UssdMenu.findOne({where:{isFirst:true,appId:ussdApp.appId}})
        .then(function (menu) {
            if(menu){
                let ussdMenu = new UssdMenuClass(menu);
                return  callback(ussdMenu);
            }
            callback(null)
        });
 }

 function   getCurrentMenu(ussdApp,session,callback){
    session.getLastMenuId(function (lastMenuId) {
        console.log('Last menuId found is >>>'+lastMenuId);
        db.UssdMenu.findOne({where:{uniqueId:lastMenuId}})
            .then(function (menu) {
                if(menu){
                    let ussdMenu = new UssdMenuClass(menu);
                    return  callback(ussdMenu);
                }
                callback(null)
            });
    });

}

function getMenuByUniqueId(menuId,callback){
     db.UssdMenu.findOne({where:{uniqueId:menuId}})
        .then(function (menu) {
            if(menu){
                console.log('Finally found menu');
                let ussdMenu = new UssdMenuClass(menu);
                return  callback(ussdMenu);
            }
            callback(null)
        });
}

function getMenuByUserDefinedName(appId,userDefinedName,callback){
    db.UssdMenu.findOne({where:{appId:appId,userDefinedName:userDefinedName}})
        .then(function (menu) {
            if(menu){
                let ussdMenu = new UssdMenuClass(menu);
                return  callback(ussdMenu);
            }
            callback(null)
        });
}

function getMenuByParentId(menuId,callback){
    db.UssdMenu.findOne({where:{parentMenuId:menuId}})
        .then(function (menu) {
            if(menu){
              let ussdMenu = new UssdMenuClass(menu);
              return  callback(ussdMenu);
            }
           callback(null)
        });
}

/**
 *
 * info: Model for switch Logic to choose nextMenu to go to
 * @type {{gotoMenuId: string, compareVal: string, operator: string}[]}
 */
const swithLogicModel = [{
    action: 'goto',
    actionParam : 'menuId',
    operator : 'eq', //eq,ge,gt,ge,le,lt,
    compareVal : '1'

}];


function UssdMenuClass(menu){
    const self = this;
    self.displayText = menu.displayText;
    self.footerText = menu.footerText;
    self.headerText = menu.headerText;
    self.userDefinedName = menu.userDefinedName;
    self.inputHolder= menu.inputHolder;
    self.goBackInputIndicator = menu.goBackInputIndicator;
    self.displayType = menu.displayType;
    self.uniqueId  = menu.uniqueId;
    self.terminate = menu.terminate;
    self.parentMenuId = menu.parentMenuId;
    self.allowGoBack = menu.allowGoBack;
    const switchOperations = JSON.parse(menu.switchOperations);

   self.runSwitchLogic = function(inRequest,callback){
        for(let k=0,len=switchOperations.length;k<len;k++){
            const operation = switchOperations[k];
            const operatorFunction = logicOperators[operation.operator];
            const isMatch = operatorFunction(operation.compareVal,inRequest.input);
            let nextMenuId ='';
            if(isMatch){
                switch (operation.action) {
                    case 'goto':
                        {
                            nextMenuId = operation.actionParam;
                            console.log('In goto nextMenu goto >>'+ nextMenuId);
                           return  getMenuByUniqueId(nextMenuId,function (nextMenu) {
                                console.log('The nextMenu goto >>'+JSON.stringify(nextMenu));
                                return callback(nextMenu);
                            })
                        }
                    case 'terminate':
                        {
                            self.terminate =true;
                            return  callback();
                        }
                }
            }
        }
        //get the child menu and return it
       getMenuByParentId(self.uniqueId,function (nextMenu) {
           return callback(nextMenu)
       });
   };
   self.getResponse = function () {
       return {
          headerText: self.headerText,
          displayText: self.displayText,
          footerText: self.footerText,
          terminate : self.terminate
       }
   };
   self.goBackOptionSelected = function(inRequest) {
        if(this.allowGoBack) {
            if (!_.isNull(inRequest.input)) {
                if (_.isEqual(this.goBackInputIndicator, inRequest.input)) {
                    return true;
                }

            }
        }
        return false
    }

}


module.exports = {
    getFirstMenu,
    getCurrentMenu,
    getMenuByUniqueId,
    getMenuByUserDefinedName
};