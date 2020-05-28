"use strict";

module.exports = function(sequelize, DataTypes) {
  const InputValidation = sequelize.define("InputValidation", {
    appId: DataTypes.STRING,
    menuId: DataTypes.STRING,
    description: DataTypes.STRING,
    validationMethod: DataTypes.STRING,
    validationCode: DataTypes.TEXT,
    errorMessage: DataTypes.STRING,
  },{
  });
  return InputValidation;
};
