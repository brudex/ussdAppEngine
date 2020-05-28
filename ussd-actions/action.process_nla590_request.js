var async = require('async');
const actionName = "postGameRequest";
var utils = require("../utils");
var logger = require("../logger"); 
const gameConfiguration = require('./game.configurations');
const gameRequestProcessing = require('./game.preprocessing.functions');


function handleRequest(params,callback){
    console.log('Posting input values>>>',params.inputValues);
    const data = {
        mobile:params.sessionData.mobile,
        network:params.sessionData.network,
        directOption:params.inputValues.directOption,
        gameOption: "1",
        numberToPlay : params.inputValues.numberToPlay,
        betAmount : params.inputValues.betAmount,
        machineOption: params.inputValues.machineOption,
        confirmAmount : params.inputValues.confirmAmount
    };
    if(utils.isNumeric(data.confirmAmount) && parseInt(data.confirmAmount)==1){    
        if(gameConfiguration.DrawInProgress(data.gameOption)){
            gameRequestProcessing.processGameRequest(data, function(err,result){
                if(err){
                    return callback(getErrorResponse(err));
                }
                return callback(getCompletedResponse(result));
            });  
        }else{
            return callback(getCompletedResponse("There are no available draws"));
        }        
    }else{
        return callback(getCompletedResponse("Game terminated"));
    }
 }
 
 function getErrorResponse(msg){
    const resp={};
    resp.message = msg;
    resp.error = true;
    resp.responseType = "end";
    return resp;
 }

 function getCompletedResponse(msg){
    const resp={};
    resp.message = msg;
    resp.error = false;
    resp.responseType = "end";
    return resp;
 }
 
    
  

 
module.exports = {
    actionName: actionName,
    handleRequest: handleRequest
      
};