var async = require('async');
 var utils = require("../../utils");
var logger = require("../../logger");
var db = require("../../models");
var env = process.env.NODE_ENV || "test";
const appConfig =  require('../../config/config.json')[env];
const ServiceUrl =  appConfig.nlaConfig.cncp.ServerUrl;//  
const _GameApiToken = appConfig.nlaConfig.cncp.Token;;
const _GameApiKey = appConfig.nlaConfig.cncp.Key;
const paymentProcessing = require('./payment.processing');
const gameConfiguration = require('./game.configurations');
var __OrderNumberIncrement = 0;
const gameMarks = gameConfiguration.gameMarks;
const ProcessStatus = gameConfiguration.ProcessStatus;
const GameOptions = gameConfiguration.GameOptions;


function processGameRequest(gameRequest, callback) {
    let inputData = JSON.parse(gameRequest.GameData);
    let gameOption = inputData.mainMenu;
    if(['1','2'].indexOf(gameOption) === -1){
        gameRequest.ProcessStatus = gameConfiguration.ProcessStatus.Failed;
        return callback (null);
    }
    let gameData = {
        mobile: inputData.mobile,
        network: inputData.network,
        directOption:  inputData.directOption,
        gameOption: gameOption,
        numberToPlay : inputData.numberToPlay,
        betAmount : inputData.amountToPay,
        confirmAmount :  '1'
    };
    const _Mobile = gameData.mobile;
    const _Network = gameData.network;
    var payload = {};
    const _Reference = utils.getRandomReference();
    const _OrderNumber = generateOrderNumber();
    var _GameMark ='';
    let drawEvent = gameConfiguration.getDrawEventByGameOption(gameData.gameOption);
    _GameMark = drawEvent.gameMark;
    if(gameData.gameOption === GameOptions.NLA590) { //NLA 590 
        payload = buildNla590Payload(gameData,_GameMark, _Reference, _OrderNumber); 
    }
    else if (gameData.gameOption === GameOptions.VAGLOTTO) { //Vag lotto
        payload = buildVagLottoPayload(gameData,_GameMark, _Reference, _OrderNumber);
    }
    async.waterfall([ 
        function(done){
            const betAmount = (Math.round(payload.amount))/100;
            gameRequest.GameCode =_GameMark;
            gameRequest.GameRequest = JSON.stringify(payload);
            gameRequest.TransId =_Reference;
            gameRequest.Amount = betAmount;
            gameRequest.OrderNumber =_OrderNumber;
            gameRequest.RetryCount =0;
            gameRequest.save();
            done(null,gameRequest);
        },
        function (gameReq, topdone) {
            let paymentGameCode = "";
            if(_GameMark === gameMarks.vagLotto) {
                paymentGameCode = paymentProcessing.PaymentGameCode_VAG90;
            }
            else {
                paymentGameCode = paymentProcessing.PaymentGameCode_NLA590;
            }
            paymentProcessing.makePrepaymentRequest(payload.amount, paymentGameCode, _Reference, _Mobile, _Network, function (err, req, resp) {
                if (err) {
                    return logger.info("Error processing payment");
                }
                gameReq.PaymentRequest = JSON.stringify(req);
                gameReq.PaymentResponse = JSON.stringify(resp);
                logger.info('makePrepaymentRequest result>>>'+JSON.stringify(resp));
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
                    gameReq.ProcessStatus = ProcessStatus.PendingPayment;
                    gameReq.save();
                }
                topdone();
            });

        } ],function(){
            callback(_Reference);
        });
}

function buildVagLottoPayload(gameData,_GameMark,_Reference, _OrderNumber) {
    logger.info('Makeing supposed to be Vag Lotto  gameOption is>>> ' + gameData.gameOption);
    const _Mobile = gameData.mobile;
    const _Network = gameData.network;
    var betType ='';
    var subType = '';
    var directOption = parseInt(gameData.directOption);
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
    const stakeAmount = Number(gameData.betAmount);
    var total_betCount = calculateBetCount(stakeNos, subType, betType, stakeAmount);
    const totalAmount = Math.round(total_betCount[0]);
    const betNumber = total_betCount[1];
    const betTimes = total_betCount[2];
    let payload = {
        "messengerId": _Reference,
        "token": "1001",
        "timestamp": utils.timeStamp(),
        "transType": "31004",
        "orderNo": _OrderNumber,
        "gameMark": _GameMark,
        "drawNo": gameConfiguration.DrawEventInfo.vagLotto.drawNo,
        "amount": totalAmount,
        "client": _Mobile,
        "channel": 4,
        "extend": gameData.lottoComp,
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
    logger.info("Payload for Vag lotto request >>", payload);
    return payload;
}

function buildNla590Payload(gameData,_GameMark,_Reference, _OrderNumber) {
    const _Mobile = gameData.mobile;
    const _Network = gameData.network;
    let computResult = computeSubTypeBetType(gameData);
    var stakeNos = computResult.stakeNos;
    var codeStr = computResult.codeStr;
    let stakeAmount = computResult.stakeAmount;
    var betType = computResult.betType;
    var subType = computResult.subType;
    var total_betCount = calculateBetCount(stakeNos, subType, betType, stakeAmount);
    const totalAmount = Math.round(total_betCount[0]);
    const betNumber = total_betCount[1];
    const betTimes = total_betCount[2];
    var payload = {
        "messengerId": _Reference,
        "token": "1001",
        "timestamp": utils.timeStamp(),
        "transType": "31004",
        "orderNo": _OrderNumber,
        "gameMark": _GameMark,
        "drawNo": gameConfiguration.DrawEventInfo.nla590.drawNo,
        "amount": totalAmount,
        "client": _Mobile,
        "channel": 4,
        "extend": gameData.lottoComp,
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
    logger.info("Payload for Vag lotto request >>", payload);
    return payload;
}



function computeSubTypeBetType(gameData) {
    const directOption = parseInt(gameData.directOption);
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
    return { stakeNos, codeStr, stakeAmount, subType, betType };
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
    let sql ="select max(id) 'maxId' from dbo.[GameRequests]"
    db.sequelize.query(sql,{type: db.sequelize.QueryTypes.SELECT})
    .then(function(items){
         if(items.length){
            console.log('Teh max id is >>'+items[0].maxId)
            __OrderNumberIncrement = items[0].maxId;
        }
    })
}
 
function setDayOfTheWeek(dayOWeek){
  __DayOfTheWeek=dayOWeek;
}

 
module.exports = {
    processGameRequest,
    makeGameRequest,
    gameMarks,
    ProcessStatus,
    resetOrderNumberCounter,
    computeSubTypeBetType,
    calculateBetCount,
    setDayOfTheWeek,
    generateOrderNumber 
};