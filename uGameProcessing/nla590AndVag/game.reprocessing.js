"use strict";
var resthandler = require("../../utils/resthandler");
var logger = require("../../logger");
var db = require("../../models");
const async = require('async');
const utils = require('../../utils');
var gameRequestProcessing = require("./game.preprocessing.functions");
var gameConfiguration = require("./game.configurations");
const paymentProcessing = require('./payment.processing');
const smsHandler = require('./sms.api.handler');
const ProcessStatus = gameConfiguration.ProcessStatus;
 
function reProcessGamesWithOrderNumbers(array){
    async.each(array,function(item,done){
        db.GameRequest.findOne({where:{ OrderNumber : item}})
        .then(function(row){
            if(row)
                processPaidGameRequest(row,function(){
                    logger.info('Completed >>'+row.dataValues);
                    done();
                }); 
        })
    }) 
    
}


function reProcessPaidGames(){
    setTimeout(function(){
        db.GameRequest.findAll({where:{
            ProcessStatus:gameRequestProcessing.ProcessStatus.PaymentSuccess
        },limit:1000 })
        .then(function(rows){
            async.forEach(rows,function(row,done){
                processPaidGameRequest(row,done);
             },function(err){
                reProcessPaidGames();
             }) 
        }) 
    },60*1000);
} 
 
function processPaidGameRequest(gameRequest,completedCallback){
    if(gameRequest.RetryCount==null){
        gameRequest.RetryCount =0;
    }
    gameRequest.RetryCount +=1;
    let payload = JSON.parse(gameRequest.GameRequest);
    const _Reference = utils.getRandomReference();
    const _OrderNumber = gameRequestProcessing.generateOrderNumber();
    logger.info('GameRequest payload >>>',JSON.stringify(payload));
    payload.messengerId = _Reference;
    payload.orderNo=_OrderNumber;
    gameRequest.OrderNumber = _OrderNumber;
    gameRequest.TransId= _Reference;
    async.waterfall([  
        function(done){
            logger.info('payment Result befor game request>>');
            logger.info('Processing makeGameRequest ');
            gameRequestProcessing.makeGameRequest(resthandler,payload,function(err,result){
                if(err){
                    logger.info(err);
                    return  done(true);
                }
                logger.info("makeGameRequest result>>",result);
                let paymentRequest= gameRequest.getPaymentRequest();
                let mGameRequest = gameRequest.getGameRequest();
                return done(null,result,mGameRequest,paymentRequest); 
            });
        },
        function (result,mGameRequest,paymentRequest,done){
            let mobile;
            if(paymentRequest){
                  mobile = paymentRequest.client;
            }else{
                  mobile = gameRequest.Mobile;
            }
            gameRequest.GameResponse = JSON.stringify(result);
            let drawEvent = gameConfiguration.getDrawEvent(gameRequest.GameCode);
            let gameData = JSON.parse(gameRequest.GameData);
            if(result && result.responseCode==0){
                gameRequest.ProcessMessage = result.responseMsg;
                gameRequest.ProcessStatus = gameRequestProcessing.ProcessStatus.Completed;  
                gameRequest.save(); 
                logger.info("Sending sms>>>"+mobile);
                smsHandler.sendGameRequestSms(drawEvent,gameData,gameRequest.Amount,result.orderNo, mobile); 
                paymentProcessing.sendGameInfoToNlaOnline(mGameRequest,paymentRequest,resthandler,function(err,saveRequest,saveResult){
                    gameRequest.NlaSaveRequest = JSON.stringify(saveRequest);
                    gameRequest.NlaSaveResponse = JSON.stringify(saveResult);
                    gameRequest.save();
                });
            }else{
                gameRequest.ProcessMessage = result.responseMsg;
                if(gameRequest.RetryCount>=5){
                    gameRequest.ProcessStatus = gameRequestProcessing.ProcessStatus.Failed;  
                }
                gameRequest.save();
            } 
            return done(null,`Completed ${gameRequest.TransId}`);
        }
],function(err,result){
    logger.info('Processing Result >>'+result);
    completedCallback();
}) 
}
   
module.exports = {
    reProcessGamesWithOrderNumbers,
    reProcessPaidGames
};
