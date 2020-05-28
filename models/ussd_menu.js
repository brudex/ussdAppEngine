"use strict";
const _ = require('lodash');
module.exports = function(sequelize, DataTypes) {
    const UssdMenu = sequelize.define("UssdMenu", {
        appId: DataTypes.STRING,
        uniqueId: DataTypes.STRING,
        parentMenuId: DataTypes.STRING,
        // flowId: DataTypes.STRING,
        isFirst: DataTypes.BOOLEAN,
        displayText: DataTypes.STRING,
        headerText: DataTypes.STRING,
        footerText: DataTypes.STRING,
        // displayType: DataTypes.STRING,
        userDefinedName: DataTypes.STRING,
        // preActionName: DataTypes.STRING,
        // returnValue: DataTypes.STRING,
        inputHolder: DataTypes.STRING,
        allowGoBack : DataTypes.BOOLEAN,
        goBackInputIndicator : DataTypes.STRING,
        // actionId: DataTypes.STRING,
        // terminateOnActionFail: DataTypes.BOOLEAN,
        switchOperations : DataTypes.TEXT,
        // forceTerminate: DataTypes.BOOLEAN,
        // preExecuteAction: DataTypes.BOOLEAN,
        terminate: DataTypes.BOOLEAN
    }, {

        instanceMethods: {

        }


    });
    return UssdMenu;
};