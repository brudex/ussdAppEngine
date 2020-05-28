"use strict";
module.exports = function(sequelize, DataTypes) {
    var UssdUserInput = sequelize.define("UssdUserInput", {
        appId: DataTypes.STRING,
        sessionId: DataTypes.STRING,
        sessionUuid : DataTypes.STRING,
        sequence:DataTypes.INTEGER,
        inputHolder : DataTypes.STRING,
        input:DataTypes.STRING
     },{

    });
    return UssdUserInput;
};
