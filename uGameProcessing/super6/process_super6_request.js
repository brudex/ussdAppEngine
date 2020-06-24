var async = require('async');
const actionName = "postVagGameRequest";
var utils = require("../../utils");
var db = require("../../models");
var logger = require("../../logger");
const gameConfiguration = require('./game.configurations');
const gameRequestProcessing = require('./game.preprocessing.functions');


function processSuper6Requests(){
    db.GameRequest.findAll({where:{ProcessStatus :'Queued'}}).then(function (requests) {
        console.log('Found items for processing >>>'+requests.length);
       async.forEach(requests,function (gameRequest,done) {
           gameRequestProcessing.processGameRequest(gameRequest,function (reference) {
               console.log('processSuper6Requests>>>'+reference);
               done();
           });
       },function(err){
           setTimeout(function () {
               processSuper6Requests();
           },60*1000);
       });
    });
 }
 

  

 
module.exports = {
    processSuper6Requests
      
};