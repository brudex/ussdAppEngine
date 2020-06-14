"use strict";

module.exports = function(sequelize, DataTypes) {
  var GameRequest = sequelize.define("GameRequest", {
    Mobile:DataTypes.STRING,
    Amount :DataTypes.DECIMAL,
    GameData : DataTypes.TEXT,
    GameRequest: DataTypes.TEXT,
    GameResponse: DataTypes.TEXT,
    PaymentRequest: DataTypes.TEXT,
    PaymentResponse: DataTypes.TEXT,
    NlaSaveRequest :DataTypes.TEXT,
    NlaSaveResponse : DataTypes.TEXT,
    GameCode: DataTypes.STRING,
    PaymentStatus: DataTypes.INTEGER,
    ProcessStatus: DataTypes.STRING,
    ProcessMessage : DataTypes.STRING,
    OrderNumber: DataTypes.STRING,
    TransId: DataTypes.STRING,
    RetryCount: DataTypes.INTEGER,
  },
  {
      instanceMethods: {
        getPaymentRequest : function(){
          return JSON.parse(this.PaymentRequest);
        },
        getGameRequest : function(){
          return JSON.parse(this.GameRequest);
        } 
      }

  });
  return GameRequest;
};
