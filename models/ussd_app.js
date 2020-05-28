"use strict";
module.exports = function(sequelize, DataTypes) {
    var UssdApp = sequelize.define("UssdApp", {
        appId: DataTypes.STRING,
        appName: DataTypes.STRING,
        description: DataTypes.STRING,
        templateTag: DataTypes.STRING, //todo in future modify to indicate if shortcode contains variables to be extracted
        appEngine: DataTypes.STRING,
        shortCode: DataTypes.STRING,
        provider: DataTypes.STRING,
        // actionId: DataTypes.STRING,
        // actionType: DataTypes.STRING,
        ///terminate: DataTypes.BOOLEAN,
        // headerText: DataTypes.STRING,
        // footerText : DataTypes.STRING
    }, {
    });
    return UssdApp;
};
