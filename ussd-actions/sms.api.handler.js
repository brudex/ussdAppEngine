var utils = require("../utils");
var logger = require("../logger");
var resthandler = require("../utils/resthandler");
var gameConfiguration = require("./game.configurations");
  
function getHeaders(message,mobile,referenceID){   
     const endpoint = encodeURI(`${mobile}/${message}/${referenceID}`);  
     let url ='https://tek.azure-api.net/ghtp/nlasms/'+endpoint;
     let config = {
        url : url,
        headers : { Key : '0201aefef8e8403880e66a15ce91a52d' } 
     };
    return config;
 }
  
function sendSms(message,mobile,callback){
    // HTTP request (POST)
    // POST https://tek.azure-api.net/ghtp/nlasms/{mobile#}/{message}/{referenceID}
    // Header
    // Key: 0201aefef8e8403880e66a15ce91a52d
    // Eg. https://tek.azure-api.net/ghtp/nlasms/233209230512/Hello test message /10000000001154
    var referenceID = utils.generateTransId();
    const config = getHeaders(message,mobile,referenceID);
    logger.info('The header for send ms >>'+JSON.stringify(config));
    resthandler.doPost({},config,function(error,result){
        console.log("Response send sms >>",result);
        logger.info("Response send sms >>"+JSON.stringify(result)); 
        if(callback){
            callback();
        }
    }); 
}


function sendGameRequestSms(drawEvent,gameData,amount,orderNo,mobile){
    logger.info('Sending sms message>>>'+mobile);
    var directOption = gameConfiguration.translateDirectOption(gameData.gameOption, gameData.directOption);
    var numbersPlayed = gameData.numberToPlay;
    var gameTitle = drawEvent.gameTitle;
    numbersPlayed = numbersPlayed.replace("codeStr","");
    let smsMsg='';
    logger.info("The draw gameMark >>>"+drawEvent.gameMark);
    smsMsg =`SUPER 6 Official USSD game ticket: ${orderNo}. Your bet: ${directOption}, ${numbersPlayed} Cost: GHS ${amount} has been entered for ${gameTitle}. Thanks.`;
    smsMsg = utils.removeInvalidIUssdCharacters(smsMsg);
    logger.info('Sending sms >>>'+smsMsg);
    sendSms(smsMsg,mobile);
}


 

function sendGameRequestFailed(gameName,mobile){
    logger.info('Sending sms message>>>'+mobile);
    const smsMsg =`Thank you for playing ${gameName}.  Your request is pending processing.`;
    sendSms(smsMsg,mobile);
}
 
module.exports = {
    sendGameRequestSms: sendGameRequestSms,
    sendGameRequestFailed: sendGameRequestFailed
 };