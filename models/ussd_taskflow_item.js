"use strict";

module.exports = function(sequelize, DataTypes) {
  const UssdTaskFlowItem = sequelize.define("UssdTaskFlowItem", {
    uniqueId: DataTypes.STRING,
    taskFlowId: DataTypes.STRING,
    actionName: DataTypes.STRING, //user defined action name e.g. getUser Details, send Sms
    code: DataTypes.TEXT,
    inheritsPlugin : DataTypes.STRING,
    index :DataTypes.INTEGER
    },{
  });
  return UssdTaskFlowItem;
};
