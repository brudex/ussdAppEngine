"use strict";

module.exports = function(sequelize, DataTypes) {
  const UssdAction = sequelize.define("UssdAction", {
    appId: DataTypes.STRING,
    menuId: DataTypes.STRING,
    actionName: DataTypes.STRING, //user defined action name e.g. getUser Details, send Sms
    code: DataTypes.TEXT,
    actionType: DataTypes.STRING, //pre or post
    inheritsPlugin : DataTypes.STRING,
    },{
  });
  return UssdAction;
};
