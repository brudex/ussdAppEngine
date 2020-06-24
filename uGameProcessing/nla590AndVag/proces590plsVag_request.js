var async = require('async');
 var utils = require("../utils");
var logger = require("../logger"); 
const gameConfiguration = require('./game.configurations');
const gameRequestProcessing = require('./game.preprocessing.functions');




function processRequests(){
    db.GameRequest.findAll({where:{ProcessStatus :'Queued'}}).then(function (requests) {
        console.log('Found items for processing >>>'+requests.length);
       async.forEach(requests,function (gameRequest,done) {
            if(gameConfiguration.DrawInProgress(data.gameOption)){
                gameRequestProcessing.processGameRequest(gameRequest,function (reference) {
                    console.log('processed Request>>>'+reference);
                    done();
                }); 
            }else{
                logger.info('No Available draws to play. Failing game');
                console.log('No Available draws to play. Failing game');
                gameRequest.ProcessStatus = gameConfiguration.ProcessStatus.Failed;
                gameRequest.save();
                done();
            } 
       },function(err){
           setTimeout(function () {
            processRequests();
           },60*1000);
       });
    });
 }
 
 
 
module.exports = {
    processRequests
      
};