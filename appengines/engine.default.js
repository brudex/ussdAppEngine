const async = require('async');
const _ = require('lodash');
const Mustache = require('mustache');
const logger = require("../logger");
const menuController = require('../controllers/menu.controller');
const logicController = require('./logiccontroller.default');
const validationController = require('../controllers/validation.controller');


function ResponseHandler (session,callback) {
    const self = this;
    self.session = session;
    const callbackFunc = callback;

    self.sendCompletedResponse = function(response){
        let text ='';
        if(response.headerText){
            text+='\n' +response.headerText;
        }
        if(response.displayText){
            text+='\n' +response.displayText;
        }
        if(response.footerText){
            text+='\n' +response.footerText;
        }
        if(text.indexOf("{") > -1){
            self.session.getAllUserInput(function (inputs) {
                let envVars = self.session.getEnvVariables();
                const model = {session:{inputs:inputs,mobile:session.mobile },env:envVars};
                console.log('Text replacement model',model);
                logger.info('Text replacement model',model);
                const replacedText = Mustache.render(text,model);
                callback(createOutResponse(replacedText,response.terminate));
            })
        }else{
            callbackFunc(createOutResponse(text,response.terminate));
        }
    };

    function createOutResponse(text,terminate){
          if(terminate){
              return {
                  displayText :text,
                  terminate :true,
                  sessionId : self.session.sessionId,
                  mobile : self.session.mobile,
                  network : self.session.network
              }
          }
        return {
            displayText :text,
            terminate :false,
            sessionId : self.session.sessionId,
            mobile : self.session.mobile,
            network : self.session.network
        }
    }

    self.sendErrorResponse = function (text,terminate){
        if(terminate){
           return  callbackFunc(createOutResponse(text,true));
        }
        callbackFunc(createOutResponse(text,false));
    };
}



function handleRequest(inRequest, session, ussdApp, callback) {
    const responseHandler = new ResponseHandler(session,callback);
    async.waterfall([
        function (done) {
            if (inRequest.isFirstDial) {
                console.log('Is first dial found>>>');
                menuController.getFirstMenu(ussdApp, function (menu) {
                    if(menu){
                        console.log('First menu found>>>');
                        logicController.executePreActionLogic(menu, inRequest, session, function (err, response) {
                            if (err) {
                                responseHandler.sendErrorResponse(err);
                                return done(true);
                            }

                            if (response) {
                                session.pushToMenuStack(menu.uniqueId);
                                responseHandler.sendCompletedResponse(response);
                                return done(true);
                            }
                        });
                    }else{
                        console.log('No first menu found>>>');
                        responseHandler.sendErrorResponse("Invalid or no default menu",true);
                        return done(true);
                    }
                })
            }else {
                console.log('Continue dial >>>');
                menuController.getCurrentMenu(ussdApp, session, function (menu) {
                    console.log('The current menu is  >>>'+menu.uniqueId);
                    done(null, menu);
                });
            }
         },
        function (menu, done) {
            if (menu.goBackOptionSelected(inRequest)) {
                console.log('Handling back option selected >>>');
                logicController.handleBackOptionSelected(menu, inRequest, session, function (err, response) {
                    if (err) {
                        return responseHandler.sendErrorResponse(err);
                    }
                    if (response) {

                        return responseHandler.sendCompletedResponse(response);
                    }
                });
            } else {
                console.log('No Back option pressed >>>');
                done(null, menu);
            }
        },
        function (menu, done) {
            console.log('validationController.handleInputValidation >>>');
            validationController.handleInputValidation(menu, inRequest, session, function (errorMsg) {
                if (errorMsg) {
                    return responseHandler.sendCompletedResponse(errorMsg);
                }
                done(null, menu); //no validation errors
            });
        },
        function (menu, done) {
            console.log('logicController.executePostActionLogic >>>');
            logicController.executePostActionLogic(menu, inRequest, session, function (err,response,nextMenu) {
                console.log('logicController.executePostActionLogic Returned >>>'+JSON.stringify(nextMenu));
                if (err) {
                    return responseHandler.sendErrorResponse(err);
                }
                session.saveUserInput(inRequest,menu);
                if (nextMenu) { //nextMenu will be return after executing all actions on current menu
                   return done(null, nextMenu);
                }
                if (response) {
                    session.pushToMenuStack(menu.uniqueId);
                    return responseHandler.sendCompletedResponse(response); //if this is executed the session should end
                }
                return done(true);
            });
        },
        function (menu, done) {
            //menu is now currentMenu
            console.log('logicController.executePreActionLogic >>>');
            logicController.executePreActionLogic(menu, inRequest,session ,function (err, response,menuId) {
                if (err) {
                    return responseHandler.sendErrorResponse(err);
                }
                if (response) {
                    session.pushToMenuStack(menuId);
                    return responseHandler.sendCompletedResponse(response);
                }
                done(null, response, menu);
            });
        }],function (err) {

    });
}


//
//
// function sendDisplayMenu(display, callback) {
//     engineResponse.response.displayMenu = display.displayMenu;
//     engineResponse.response.headerText = display.headerText;
//     engineResponse.response.footerText = display.footerText;
//     engineResponse.sessionData = requestData;
//     engineResponse.error = false;
//     engineResponse.responseType = display.responseType;
//     callback(engineResponse);
// }


module.exports = {
    engineName: "default",
    handleRequest: handleRequest
};


