"use strict";
const utils = require("../../utils");
const resthandler = require("../../utils/resthandler");
const logger = require("../../logger");
const env = process.env.NODE_ENV || "test";
const appConfig = require('../../config/config.json')[env];
const gameConfiguration = require('./game.configurations');
const ApiToken = appConfig.nlaConfig.payment.Token;
const ApiKey = appConfig.nlaConfig.payment.Key;
const ServiceUrl = appConfig.nlaConfig.payment.ServerUrl;
const CollaboratorCode = appConfig.nlaConfig.payment.CollaboratorCode;

let PaymentGameCode_super6590 = "011";
const PaymentGameCode_VAG90 = "017";
const PaymentGameCode_SUPER6 = "018";

function makePrepaymentRequest(amount,gameCode,reference,mobile,network,callback) {
    let bankCode = 1;
    console.log("Mobile Network >>>",network);
    switch(network.toUpperCase()) {
        case "MTN_GH_DIRECT" : 
        case "MTN_GH" : 
        case "MTN" : 
           bankCode =1;
            break;
        case "VODAFONE_GH" :
        case "MESIKA_VODAFONE_GH" :
        case "VODAFONE" :
        case "VODA" :
            bankCode =2;
            break;
        case "AIRTEL-TIGO_GH" :
        case "AIRTEL-TIGO" :
        case "AIRTEL_GH" :
        case "TIGO_GH" :
        case "AIRTEL" :
        case "MESIKA_TIGO_GH" :
        case "TIGO" : 
            bankCode =3;
            break;
    }
    var payload =
    {
        "token": ApiToken,
        "timestamp": utils.timeStamp(),
        "collaboratorCode": CollaboratorCode,
        "tsn": reference,
        "gameCode": gameCode,
        "amount": amount,
        "transTime": Date.now(),
        "channel": 4,
        "client" :mobile,
        "bankCode" : bankCode ,
        "voucher" :"" 
    };
    const config = getHeaders(payload,"SaleTicketPrePayment");
    console.log('The payload for prepayment >>',payload);
    logger.info('The payload prepayment >>'+JSON.stringify(payload));
    logger.info('The config prepayment >>'+JSON.stringify(config));
    resthandler.doPost(payload,config,function(error,result){
        console.log("Response prepayment from api >>",result);
        logger.info("Response prepayment from api >>"+JSON.stringify(result));
        if(error){
            return callback("Error making prepayment request");
        }      
       return callback(null,payload ,result);
    });
}

function checkPrepaymentRequestStatus(reference,callback){
    var payload =  {
        "token": ApiToken,
        "timestamp": utils.timeStamp(),
        "collaboratorCode": CollaboratorCode,
        "tsn": reference, 
        "transMode" : 1
    };
    const config = getHeaders(payload,"/SaleTicketStatus");
    console.log('The payload for checkpaymentstatus >>',payload);
    logger.info('The payload checkpaymentstatus >>'+JSON.stringify(payload));
    resthandler.doPost(payload,config,function(error,result){
        console.log("Response checkpaymentstatus from api >>",result);
        logger.info("Response checkpaymentstatus from api >>"+JSON.stringify(result));
        if(error){
            return callback("Error making checkpaymentstatus request");
        }      
       return callback(null,result);
    });
}

function getHeaders(payload,endpoint){
    let data = ApiKey +  JSON.stringify(payload);
    logger.info("Data for sha1 >>>",data);
    const sig = utils.getSha1(data.trim());
    logger.info("Request signature for "+endpoint,sig);
    let url = ServiceUrl;
    if(endpoint){
        url = ServiceUrl + endpoint
    }
    let config = {
        url : url,
        headers : { Signature : sig } 
    };
    return config;
 }
 

 function sendGameInfoToNlaOnline(gameRequest,paymentRequest,resthandler,callback){
    logger.info('Sending game information >>>');
    const payload = {};
    payload.token=paymentRequest.token;
    payload.timestamp = gameRequest.timestamp;
    payload.amount = paymentRequest.amount;
    payload.ticketNo=gameRequest.orderNo;
    payload.client = paymentRequest.client;
    payload.collaboratorCode =paymentRequest.collaboratorCode;
    payload.tsn= paymentRequest.tsn;
    payload.gameCode= paymentRequest.gameCode;
    payload.transTime =paymentRequest.transTime;
    payload.channel =paymentRequest.channel;
    payload.bankCode = paymentRequest.bankCode;
    let betNumbers=''; 
    console.log('The Game Mark is >>>'+gameRequest.GameCode);  
    console.log('The config Game Mark is >>>'+gameConfiguration.gameMarks.super6);
    if(gameRequest.gameMark===gameConfiguration.gameMarks.vagLotto){ //Vag GameCode
         betNumbers = gameRequest.betlines[0].codeStr.replace("+","-");
    }else{
        let codestrArr =gameRequest.betlines[0].codeStr.split("-");
        betNumbers = codestrArr[1].replace("+","-");
    }
    let betLine =  {
        "optionCode": gameRequest.betlines[0].subType + gameRequest.betlines[0].betType,
        "optionName": "Standard Bet",
        "amount": gameRequest.betlines[0].lineAmount,
        "betNumbers": betNumbers,
        "extendedInfo": null
    };  
    payload.betLines =[betLine];
    const config = getHeaders(payload,'SaleTicket');
    logger.info('sending Game to super6 payload>>>',payload);
    logger.info('sending Game to super6 config >>>',config);
    console.log('final payload to nlaonline >>>',JSON.stringify(payload));
    console.log('final config to nlaonline >>>',JSON.stringify(config));
    resthandler.doPost(payload,config, function(error,result){
        console.log("Response from sendGameInfoToNlaOnline >>",result);
        logger.info("Response from sendGameInfoToNlaOnline >>",result);
        gameRequest.NlaSaveResponse = JSON.stringify(result);     
        if(error){
            logger.error('Service error',error);         
            if(callback){
                return callback(null,payload,error);
            } 
        }       
        if(callback)
            return callback(null,payload,result);
    });
 }
 

 

module.exports = {
    makePrepaymentRequest,
    checkPrepaymentRequestStatus,
    PaymentGameCode_super6590,
    PaymentGameCode_VAG90,
    PaymentGameCode_SUPER6,
    sendGameInfoToNlaOnline
};




