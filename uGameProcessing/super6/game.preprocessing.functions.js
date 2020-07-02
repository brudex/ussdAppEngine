var async = require('async');
var utils = require("../../utils");
var logger = require("../../logger");
var db = require("../../models");
var env = process.env.NODE_ENV || "test";
const appConfig =  require('../../config/config.json')[env];
const ServiceUrl =  appConfig.nlaConfig.cncp.ServerUrl;//  
const _GameApiToken = appConfig.nlaConfig.cncp.Token;
const _GameApiKey = appConfig.nlaConfig.cncp.Key;
const paymentProcessing = require('./payment.processing');
const gameConfiguration = require('./game.configurations');
var __OrderNumberIncrement = 0;
const gameMarks = gameConfiguration.gameMarks;
const ProcessStatus = gameConfiguration.ProcessStatus;


function processGameRequest(gameRequest, callback) {
    let gameData = JSON.parse(gameRequest.GameData);
    const _Mobile = gameData.mobile;
    const _Network = gameData.network;
    const _Reference = utils.getRandomReference();
    const _OrderNumber = generateOrderNumber();
    let _GameMark ='';
    let drawEvent = gameConfiguration.getDrawEventByGameOption();
    _GameMark = drawEvent.gameMark;
    const payload = buildSuper6Payload(gameData,_GameMark, _Reference, _OrderNumber);
    console.log('Super 6 payload>>'+JSON.stringify(payload));

    async.waterfall([ 
        function(done){
            const betAmount = (Math.round(payload.amount))/100;
            gameRequest.GameCode =_GameMark;
            gameRequest.GameRequest = JSON.stringify(payload);
            gameRequest.TransId =_Reference;
            gameRequest.Amount = betAmount;
            gameRequest.OrderNumber =_OrderNumber;
            gameRequest.save();
            done(null,gameRequest)
        },
        function (gameReq, topdone) {
            let paymentGameCode =  paymentProcessing.PaymentGameCode_SUPER6;

                        paymentProcessing.makePrepaymentRequest(payload.amount, paymentGameCode, _Reference, _Mobile, _Network, function (err, req, resp) {
                            if (err) {
                                return topdone("Error processing payment");
                            }
                            gameReq.PaymentRequest = JSON.stringify(req);
                            gameReq.PaymentResponse = JSON.stringify(resp);
                            if (resp && (resp.responseCode === 1 || resp.responseCode === 0 )) {
                                if (resp.transStatus === 0 ) {
                                    gameReq.PaymentStatus = resp.transStatus;
                                    gameReq.ProcessStatus = ProcessStatus.PendingPayment;
                                    gameReq.save();
                                }
                                else if(resp.transStatus === 1) {
                                    gameReq.PaymentStatus = resp.transStatus;
                                    gameReq.ProcessStatus = ProcessStatus.Failed;
                                    gameReq.save(); 
                                }
                                else if(resp.transStatus === 2) {
                                    gameReq.PaymentStatus = resp.transStatus;
                                    gameReq.ProcessStatus = ProcessStatus.PendingPayment;
                                    gameReq.save(); 
                                }
                            }
                            else {
                                gameReq.PaymentStatus = resp.transStatus;
                                gameReq.ProcessStatus = ProcessStatus.Failed;
                                gameReq.save(); 
                            }
                            return topdone();
                        }); 



        } ],function (err) {
        callback(err,_Reference);
    });
}

function buildSuper6Payload(gameData,_GameMark,_Reference, _OrderNumber) {
    const _Mobile = gameData.mobile;
    const _Network = gameData.network;
    let betType ='';
    let subType = '';
    var directOption = parseInt(gameData.mainMenu);
    switch (directOption) {
        case 1:
            subType = "T55X6_1";
            betType = "DS";
            break;
        case 2:
            subType = "T55X6_2";
            betType = "DS";
            break;
        case 3:
            subType = "T55X6_3";
            betType = "DS";
            break;
        case 4:
            subType = "T55X6_4";
            betType = "DS";
            break;
        case 5:
            subType = "T55X6_5";
            betType = "DS";
            break;
        case 6:
            subType = "T55X6_6";
            betType = "DS";
            break;
        default:
            subType = "T55X6_1";
            betType = "DS";
            break;
    }
    console.log('The gameData is >>> '+JSON.stringify(gameData));
    let stakeNos =[];
    if(gameData.pick5chooseNumber){
          stakeNos = gameData.pick5chooseNumber.split(' ');
    }
    const codeStr = stakeNos.join('+');
    const stakeAmount = Number(gameData.amount);
    const total_betCount = calculateBetCount(stakeNos, subType, betType, stakeAmount);
    const totalAmount = Math.round(total_betCount[0]);
    const betNumber = total_betCount[1];
    const betTimes = total_betCount[2];
    const payload = {
        "messengerId": _Reference,
        "token": "1001",
        "timestamp": utils.timeStamp(),
        "transType": "31004",
        "orderNo": _OrderNumber,
        "gameMark": _GameMark,
        "drawNo": gameConfiguration.getDrawEventByGameOption().drawNo,//todo gameConfiguration.DrawEventInfo.super6.drawNo,
        "amount": totalAmount,
        "client": _Mobile,
        "channel": 4,
        "extend": 1,
        "betlines": [
            {
                "betNumber": betNumber,
                "subType": subType,
                "betType": betType,
                "codeStr": codeStr,
                "lineAmount": totalAmount,
                "betTimes": betTimes,
                "flag": 1
            }
        ]
    };
    logger.info("Payload for Super 6 request >>", payload);
    return payload;
}



function computeSubTypeBetType(gameData) {
    var directOption = parseInt(gameData.directOption);
    let subType, betType;
    switch (directOption) {
        case 1:
            subType = "Q1";
            betType = "DS";
            break;
        case 2:
            subType = "RX2";
            betType = "DS";
            break;
        case 3:
            subType = "RX3";
            betType = "DS";
            break;
        case 4:
            subType = "RX4";
            betType = "DS";
            break;
        case 5:
            subType = "RX5";
            betType = "DS";
            break;
        case 6:
            subType = "RX2";
            betType = "FS";
            break;
        case 7:
            subType = "RX3";
            betType = "FS";
            break;
        case 8:
            subType = "RX4";
            betType = "FS";
            break;
        case 9:
            subType = "RX5";
            betType = "FS";
            break;
        case 10:
            subType = "RX2";
            betType = "DT";
            break;
    }
    var stakeNos = gameData.numberToPlay.split(' ');
    var codeStr = stakeNos.join('+');
    codeStr = "H-" + codeStr;
     if (gameData.machineOption === "1") {
        codeStr = "H-" + codeStr;
    }
    if (gameData.machineOption === "2") {
        codeStr = "T-" + codeStr;
    } 
    const stakeAmount = Number(gameData.betAmount);
    return { stakeNos, codeStr, stakeAmount, subType, betType, codeStr };
}



 function generateOrderNumber(){
     __OrderNumberIncrement+=1;
    var orderNo = _GameApiToken +  utils.timeStamp(false);
    let orderPad = 24 - orderNo.length;
    orderNo = orderNo + pad(__OrderNumberIncrement,orderPad);
    return orderNo;  
 }

 function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
 }
 
 
 function getHeaders(payload){
    let data = _GameApiKey + JSON.stringify(payload);
    logger.info("Data for sha1 >>>",data);
    const sig = utils.getSha1(data.trim());
    logger.info("Request signature for NLA payload ",sig);
    let config = {
        url : ServiceUrl,
        headers : { Signature : sig } 
    };
    return config;
 }
 
 function makeGameRequest(resthandler,payload,callback){
    const config = getHeaders(payload);
    logger.info('Game request payload >>>',payload);
    logger.info('Game request config >>>',payload);
    resthandler.doPost(payload,config, function(error,result){
        console.log("Response from makeGameRequest api >>",result);
        var response = {};
        if(error){
            logger.error('Service error',error);
            response.message = "Error processing request";
            response.error = true;
            response.responseType = "end";
            return callback(error);
        } 
       return callback(null,result);
    });
 }
 


 function calculateBetCount(codeStr,subType,betType,betAmount){
     let totalAmount =0;
     let betCount =0;
     let betNumber = 1;
     let betTimes = 0;
     if(subType=="Q1" && betType=="DS"){	//"Direct 1"
        codeStr.length = 1;	//Players can only choose 1 number
        betTimes = betAmount/0.01;
        betNumber = 1;
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="Q1" && betType=="FS"){	//"Perm 1"
        codeStr.length > 1;	//Players can choose 2 numbers or more
        betNumber = codeStr.length;
        betTimes = betAmount/0.01;
        totalAmout = betAmount * betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX2" && betType=="DS"){  //Direct 2
        codeStr.length = 2;	//Players can only choose 2 numbers
        betTimes = betAmount/0.01;
        betNumber = 1;
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX2" && betType=="FS"){  //Perm 2
        var n = codeStr.length;
        n > 2;	//Players can choose 3 number2 or more
        betTimes = betAmount/0.01;
        betNumber = n*(n-1)/2;
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX2" && betType=="DT"){  //Banker to Banker
        var n = codeStr.length;
        n = 1;	//Players can choose 1 number
        betTimes = betAmount/0.01;
        betNumber = 89;
        totalAmount = betAmount * betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX3" && betType=="DS"){  //Direct 3
        codeStr.length = 3;	//Players can only choose 3 numbers
        betTimes = betAmount/0.01;
        betNumber = 1;
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX3" && betType=="FS"){  //Perm 3
        var n = codeStr.length;
        n > 3;	//Players can choose 4 numbers or more
        betTimes = betAmount/0.01;
        betNumber = n*(n-1)*(n-2)/(3*2)
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX4" && betType=="DS"){  //Direct 4
        codeStr.length = 4;	//Players can only choose 4 numbers
        betTimes = betAmount/0.01;
        betNumber = 1;
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX4" && betType=="FS"){  //Perm 4
        var n = codeStr.length;
        n > 4;	//Players can choose 5 numbers or more
        betTimes = betAmount/0.01;
        betNumber = n*(n-1)*(n-2)*(n-3)/(4*3*2);
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX5" && betType=="DS"){  //Direct 5
        codeStr.length = 5;	//Players can only choose 5 numbers
        betTimes = betAmount/0.01;
        betNumber = 1;
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX5" && betType=="FS"){  //Perm 5
        var n = codeStr.length;
        n > 5;	//Players can choose 6 numbers or more
        betTimes = betAmount/0.01;
        betNumber = n*(n-1)*(n-2)*(n-3)*(n-4)/(5*4*3*2);
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }
    totalAmount = totalAmount*100;
    return [totalAmount,betNumber,betTimes];
 }

 function resetOrderNumberCounter(){
    let sql ="select max(id) 'maxId' from dbo.[GameRequests]";
    db.sequelize.query(sql,{type: db.sequelize.QueryTypes.SELECT})
    .then(function(items){
         if(items.length){
            console.log('Teh max id is >>'+items[0].maxId);
            __OrderNumberIncrement = items[0].maxId;
        } 
    })
}


 
module.exports = {
    processGameRequest,
    makeGameRequest,
    gameMarks,
    ProcessStatus,
    resetOrderNumberCounter,
    computeSubTypeBetType,
    calculateBetCount,
    generateOrderNumber
};