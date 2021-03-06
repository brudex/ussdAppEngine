"use strict";
const logger = require("../../logger");
const db = require("../../models");
const async = require('async');
const gameRequestProcessing = require("./game.preprocessing.functions");
const gameConfiguration = require("./game.configurations");
const paymentProcessing = require('./payment.processing');
const ProcessStatus = gameConfiguration.ProcessStatus;


function processingPendingPayments(){
    setTimeout(function(){
        db.GameRequest.findAll({where:{
            ProcessStatus:gameRequestProcessing.ProcessStatus.PendingPayment
        },limit:1000 })
        .then(function(rows){
            async.forEach(rows,function(row,done){
                try {
                    processPendingGameRequest(row,function(){
                        done();
                    });
                }catch (e) {
                    logger.error('There was an error >>',e);
                    done();
                }
             },function(err){
               processingPendingPayments();
             })
        })
    },60*1000);
}


function processPendingGameRequest(gameRequest,completedCallback){
    const payload = JSON.parse(gameRequest.GameRequest);
    logger.info('GameRequest payload >>>',payload);
    async.waterfall([function(done){
        paymentProcessing.checkPrepaymentRequestStatus(gameRequest.TransId,function(err,result){
            if(err){
              logger.info(err);
              return  done(true)
            }
            logger.info("checkPrepaymentRequestStatus result>>" + JSON.stringify(result));
            gameRequest.PaymentResponse = JSON.stringify(result);
            let retryCount = gameRequest.RetryCount;
            if(retryCount==null){
                retryCount=0;
            }
            retryCount +=1;
            gameRequest.RetryCount=retryCount;
             if(result){
                if(result.responseCode === 0){
                    if (result.transStatus === 0 ) {
                        gameRequest.PaymentStatus = result.transStatus;
                        gameRequest.ProcessStatus = ProcessStatus.PaymentSuccess;
                        gameRequest.save();
                        return done(true);
                    }
                    else if (result.transStatus === 1) {
                        gameRequest.PaymentStatus = result.transStatus;
                        gameRequest.ProcessStatus = ProcessStatus.Failed;
                        gameRequest.save();
                        return done(true);
                    }
                    else if(result.transStatus === 2) {
                        gameRequest.PaymentStatus = result.transStatus;
                        gameRequest.ProcessStatus = ProcessStatus.PendingPayment;
                        gameRequest.save();
                        return done(true);
                    }
                }else if(result.responseCode === 10){
                    gameRequest.PaymentStatus = result.transStatus;
                    gameRequest.ProcessStatus = ProcessStatus.Failed;
                    gameRequest.save();
                    return done(true);
                }else{
                    if(retryCount >= 10){
                        gameRequest.PaymentStatus = result.transStatus;
                        gameRequest.ProcessStatus = ProcessStatus.Failed;
                        gameRequest.save();
                    }
                    return done(true);
                }
            }else{
                 if(retryCount >= 10){
                     gameRequest.ProcessStatus = ProcessStatus.Failed;
                     gameRequest.save();
                 }
               return done(true);
            }
        })
    }


],function(err,result){
    logger.info('Processing Result >>'+result);
    completedCallback()
}) 
}
 
 
 
 

 
module.exports = {
    processingPendingPayments
};
