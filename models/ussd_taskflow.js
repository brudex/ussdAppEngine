"use strict";

module.exports = function(sequelize, DataTypes) {
  const UssdTaskFlow = sequelize.define("UssdTaskFlow", {
    appId: DataTypes.STRING,
    uniqueId: DataTypes.STRING,
    flowName: DataTypes.STRING,
    description: DataTypes.STRING,
    runSchedule : DataTypes.STRING,
     },{
  });
  return UssdTaskFlow;
};
