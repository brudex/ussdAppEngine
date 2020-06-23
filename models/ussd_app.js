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
        utilsFile : DataTypes.STRING
    }, {
    });
    return UssdApp;
};
