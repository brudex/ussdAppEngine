const async = require('async');
const db = require('../models');
const logger = require("../logger");
const menuController = require('../controllers/menu.controller');
const actionFactory = require('./action.factory');

/**
 * This function is recursive it will keep redirecting to a new menu so long as the exeCallback embedded returns
 * a new menu.  Action results will return results of pre-actions and they will last for the duration of this execution
 * of current menu scope. To persist results for entire session call session.setSessionValue.
 * inRequest is the latest input received from the client/mobilePhone. Session is the current session which contains a lot of methods and fields
 * for the current session
 * @param menu
 * @param inRequest
 * @param session
 * @param callback
 */
function executePreActionLogic(menu, inRequest, session, callback) {
    //inner function to enable recursion, menu redirection can loop forever
    console.log('Calling executePreActionLogic');
    console.log('executePreActionLogic >>'+ JSON.stringify(inRequest));
    let menuId = menu.uniqueId;
    function exe(menu, inRequest, session, exeCallback) {
        let menuResponse = menu.getResponse(); //get headerText,displayText,footerText for menu
        let executionError = null;
        let menuOveride = null;
        async.waterfall([
            function (done) {
                getAllPreActionsForMenu(menu.uniqueId, function (actions) {
                    done(null, actions)
                })
            },
            function (actions, done) {
                let actionResults = {}; //action results will contain results of preactions executed on menu properties will be userDefined action name
                console.log('actionFactory action items count >>' + actions.length);
                async.eachSeries(actions, function (action, innerCb) {
                    menuOveride = null;
                    const executableAction = actionFactory.createFromPlugin(action,menu, inRequest, session, actionResults);
                    executableAction.initialize();
                    executableAction.execute(function (err, response, retMenu) {
                        if(err) {
                            executionError = err;
                            return innerCb(err);
                        }
                        if(response) { //action response or result of action e.g. rest api response or database call result
                            actionResults[action.actionName] = response;
                            return innerCb();
                        }
                        if(retMenu) { //retMenu returns full menu
                            menuOveride = retMenu;
                            menuId = retMenu.uniqueId;
                            return innerCb(true);
                        }
                        return innerCb();
                    })

                }, function (err) {
                    console.log('executePreActionLogic async.eachSeries completed>>'+err);
                    done(err)
                })
            }
        ], function () {
            menuResponse = menu.getResponse();
            exeCallback(executionError, menuResponse, menuOveride);
        });
    }

    exe(menu, inRequest, session, function (err, response, menu1) {
        if (err) {
            return callback(err)
        }
        if (menu1) {
           return  executePreActionLogic(menu1, inRequest, session, callback)
        }
        if (response) {

            return callback(null, response,menuId)
        }
    })
}


/**
 * This function is not recursive like executePreActionLogic once a menu is returned, execution of all following actions stop.
 * it will keep redirecting to a new menu so long as the exeCallback embedded returns
 * a new menu.  Action results will return results of pre-actions and they will last for the duration of this execution
 * of current menu scope. To persist results for entire session call session.setSessionValue.
 * inRequest is the latest input received from the client/mobilePhone. Session is the current session which contains a lot of methods and fields
 * for the current session
 * @param menu
 * @param inRequest
 * @param session
 * @param callback
 */
function executePostActionLogic(menu, inRequest, session, callback) {
    //inner function to enable recursion,redirection can happen only once for PostAction Logic
    console.log('Calling executePostActionLogic');
    console.log('executePostActionLogic >>'+ JSON.stringify(inRequest));
    function exe(menu, inRequest, session, exeCallback) {
        let menuResponse = null;
        let executionError = null;
        let nextMenu = null;
        async.waterfall([
            function (done) {
                getAllPostActionsForMenu(menu.uniqueId, function (actions) {
                    if(actions.length){
                        done(null, actions);
                    }else{
                        done(true);
                    }
                })
            },
            function (actions, done) {
                let actionResults = {};
                async.eachSeries(actions, function (action, innerCb) {
                    const executableAction = actionFactory.createFromPlugin(action,menu, inRequest, session, actionResults);
                    executableAction.initialize(menu, inRequest, session, actionResults);
                    executableAction.execute(function (err, response, retMenu) {
                        console.log('actionFactory executableAction.execute callback>>'+err);
                        console.log('actionFactory executableAction.execute callback response>>'+JSON.stringify(response));
                        console.log('actionFactory executableAction.execute callback menu>>'+JSON.stringify(retMenu));
                        if (err) {
                            executionError = err;
                            return innerCb(err);
                        }
                        if (response) {
                            actionResults[action.actionName] = response;
                            return innerCb();
                        }
                        if (retMenu) { // if a menu is return
                            nextMenu = retMenu;
                            return innerCb(true);
                        }
                        innerCb();
                    })
                }, function (err) {
                    console.log('executePostActionLogic async.eachSeries completed>>'+err);
                    done(true)
                })
            }
        ], function () {
            console.log('executePostActionLogic nextMenu>>'+JSON.stringify(nextMenu));
            if(nextMenu){
                exeCallback(executionError,menuResponse,nextMenu);
            }else{
                console.log('Returning menu.runSwitchLogic');
                menu.runSwitchLogic(inRequest,function (nextMenu) {
                   console.log('runSwitchLogic next menu result >>>'+ JSON.stringify(nextMenu));
                   menuResponse = menu.getResponse();
                   exeCallback(executionError,menuResponse,nextMenu);
                });
            }
        });
    }

    exe(menu, inRequest, session, function (err, response, menu) {
        console.log('runSwitchLogic 2 next error result >>>'+ JSON.stringify(err));
        console.log('runSwitchLogic 2 next response result >>>'+ JSON.stringify(response));
        console.log('runSwitchLogic 2 next menu result >>>'+ JSON.stringify(menu));
        return callback(err,response,menu);
    })
}

function handleBackOptionSelected(inRequest, session, callback) {
    async.waterfall([
        function (done) {
            session.popFromMenuStack(done);

        },
        function (done) {
             session.getLastMenuId(function (currentMenuId) {
                 console.log('Found Menu Id>>>');
                 session.deleteLastInput();
                 menuController.getMenuByUniqueId(currentMenuId, function (menu) {
                     console.log('Menu returned in callback>>'+menu.uniqueId);
                     done(null, menu);
                 })
            });
        },
        function (menu, done) {
            console.log('calling executePreActionLogic >>>');
            executePreActionLogic(menu, inRequest, session, function (err, response) {
                if (err) {
                    callback(err);
                    return done(true);
                }
                console.log('executePreActionLogic completed >>>'+JSON.stringify(response));
                done(null, response);
            })
        },
        function (response, done) {
            callback(null, response);
            return done(true);
        }
    ])

}

function getAllPreActionsForMenu(menuId, callback) {
    db.UssdAction.findAll({where: {menuId: menuId, actionType: "pre"}})
        .then(function (actions) {
            callback(actions);
        })
}

function getAllPostActionsForMenu(menuId, callback) {
    db.UssdAction.findAll({where: {menuId: menuId, actionType: "post"}})
        .then(function (actions) {
            callback(actions);
        })
}


module["exports"] = {
    executePreActionLogic,
    executePostActionLogic,
    handleBackOptionSelected

};


