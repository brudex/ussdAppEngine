"use strict";
 module.exports = function(sequelize, DataTypes) {
    const UssdSequenceStack = sequelize.define("UssdSequenceStack", {
        appId: DataTypes.STRING,
        sessionUuid: DataTypes.STRING,
        menuId: DataTypes.STRING,

    }, {
    });
    return UssdSequenceStack;
};