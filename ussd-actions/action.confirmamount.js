var async = require('async');
var utils = require("../utils");
var logger = require("../logger");
var gameRequestProcessing = require("./game.preprocessing.functions");
var inputValidations = require("./action.input.validations");
var gameConfigurations = require("./game.configurations");
const actionName = "confirmAmount";

  
function handleRequest(params,callback){
    console.log('prompt input values >>>',params.inputValues);   
    let response ={};
    let betAmount = params.inputValues.betAmount;
    logger.info("Bet amount received >>",params.inputValues.betAmount);
    logger.info("Bet amount received >>",params.inputValues);
    let retailerValidation = inputValidations.actions.validateRetailer(params);
    if(retailerValidation.error){
        return callback(retailerValidation);
    } 
    if(utils.isNumeric(betAmount)){
        if(Number(betAmount) < 1){
            response.message = `Bet amount must be at least GHS 1`;
            response.responseType = "end"; 
        }else if(Number(betAmount) > gameConfigurations.MAX_PLAY_AMOUNT){
            response.message = `You have exceeded the maximum bet limit`;
            response.responseType = "end"; 
        }else{
            const gameData = {
                mobile:params.sessionData.mobile,
                network:params.sessionData.network,
                directOption:params.inputValues.directOption,
                gameOption: params.inputValues.gameOption,
                numberToPlay : params.inputValues.numberToPlay,
                betAmount : params.inputValues.betAmount,
                machineOption: params.inputValues.machineOption,
                confirmAmount : params.inputValues.confirmAmount,
                lottoComp : params.inputValues.lottoComp
             }
            let amounToPay = calculateTotalAmout(gameData);
            response.message = `NLA 5 90 Please Confirm Your Resultant Stake Amount is GHS${amounToPay} Enter :\r\n1. Confirm\n\r\n2. Cancel\n`;
            response.responseType = "input"; 
        }       
    }else{
        response.message = `Invalid bet amount.`;
        response.responseType = "end"; 
    }
    callback(response); 
}

function calculateTotalAmout(gameData){
    let computResult = gameRequestProcessing.computeSubTypeBetType(gameData);
    var stakeNos = computResult.stakeNos
    let stakeAmount = Number(computResult.stakeAmount);
    let betType = computResult.betType;
    let subType = computResult.subType;
    console.log(`the calculateTotalAmout  bettype ${betType} subtype ${subType}`);
    console.log(`the calculateTotalAmout stakeNos >>`+JSON.stringify(stakeNos));
    console.log(`the calculateTotalAmout stakeAmount >>`+stakeAmount);
    var total_betCount = gameRequestProcessing.calculateBetCount(stakeNos, subType, betType, stakeAmount);
    console.log(`the calculateTotalAmout totalBetcount >>`+JSON.stringify(total_betCount));
    const totalAmount = (Math.round(total_betCount[0]))/100; 
    return totalAmount.toFixed(2);    
 }
 
/*
/* Do whatever u want in this file but make sure u export and implement the following methods
*/
module.exports = {
    actionName: actionName,
    handleRequest: handleRequest,
    calculateTotalAmout
};