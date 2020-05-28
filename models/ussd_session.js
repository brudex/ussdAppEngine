"use strict";
module.exports = function(sequelize, DataTypes) {
    var UssdSession = sequelize.define("UssdSession", {
        appId: DataTypes.STRING,
        sessionId: DataTypes.STRING,
        uuid :DataTypes.STRING,
        mobile:DataTypes.STRING,
        network:DataTypes.STRING, //network operator(mtn,airtel etc)
        // sequence:DataTypes.INTEGER,
        // processedAsSingle:DataTypes.BOOLEAN,
        // flowId :DataTypes.STRING,
        // input:DataTypes.STRING,
        // inputHolder : DataTypes.STRING,
        // returnValue : DataTypes.STRING,
        requestType:DataTypes.STRING, //Initiation, Response, Timeout, Release
        expiryDate :DataTypes.DATE
    },{

    });
    return UssdSession;
};
