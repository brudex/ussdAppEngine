var async = require('async');
var utils = require("../../utils");
const _restHandler  = require("../../utils/resthandler");
var logger = require("../../logger");
var env = process.env.NODE_ENV || "test";
const appConfig =  require('../../config/config.json')[env];
const ServiceUrl =  appConfig.nlaConfig.cncp.ServerUrl;//  
const _GameApiToken = appConfig.nlaConfig.cncp.Token;;
const _GameApiKey = appConfig.nlaConfig.cncp.Key;

const GameOptions = {
    NLA590:"1",
    VAGLOTTO:"2"    
};

var DrawEventInfo = {
    super6 : {
       drawNo:0,
       gameMark:"T55X6",
       noDrawMessage:"There are no draws at the moment",
       startTime :"",
       stopTime :"",
       gameTitle :"Super 6",
       paymentCode :""
    }
};

const ProcessStatus = {
    Queued :  "Queued",
    PendingPayment : "PendingPayment",
    PaymentSuccess :  "PaymentSuccess",
    Completed : "Completed",
    Failed :  "Failed"
};




var MAX_PLAY_AMOUNT=1000;
const gameMarks = {
    vagLotto :"T90X5",
    nla590 : "N90X5",
    super6 : "T55X6",
    nla590_day : {
        "0" :"N90X5_SUN",
        "1" :"N90X5_MON",
        "2" :"N90X5_TUE",
        "3" :"N90X5_WED",
        "4" :"N90X5_THU",
        "5" :"N90X5_FRI",
        "6" :"N90X5_SAT",
    }
     
};

function CheckAvailableDraws(callback) {

    async.parallel([
    function(done){
        var _GameMark = gameMarks.super6;
        makeDrawEnquiry(_GameMark, _restHandler, function (err, result) {
            if (err) {
                logger.info('makeDrawEnquiry error>>>'+_GameMark,err) ;
              return   done();
            }
            logger.info("Result from makeDrawEnquiry>>"+_GameMark, result);
            if (result) {
                logger.info("Result responseCode makeDrawEnquiry>>" +_GameMark + result.responseCode);
                if (result && result.responseCode === 0) {
                    if (result.drawNo) {
                        DrawEventInfo.super6.drawNo = result.drawNo;
                        DrawEventInfo.super6.startTime =result.startTime;
                        DrawEventInfo.super6.stopTime =result.stopTime;
                        DrawEventInfo.super6.gameMark =result.gameMark;
                        DrawEventInfo.super6.gameTitle =  "Super 6 Event No. "+result.drawNo;
                        logger.info('The DrawEventInfo Super6>>'+JSON.stringify(DrawEventInfo));
                        console.log('The DrawEventInfo Super6>>'+JSON.stringify(DrawEventInfo));
                        if(callback){
                            callback(DrawEventInfo,"super6");
                        }
                    }else{
                        DrawEventInfo.super6.drawNo =0;
                    }
                }else if(result.token){
                    DrawEventInfo.super6.drawNo=0;
                }
            }
          return done();
        });
    }])

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

 function makeDrawEnquiry(gameMark,resthandler,callback){
    const payload = {"messengerId":utils.getRandomReference(),"token": _GameApiToken,"timestamp": utils.timeStamp(),"transType":31003,"gameMark":gameMark,"drawNo":0};
     const config = getHeaders(payload);
    console.log('The headers >>',config);
    console.log('The draw enquiry >>',JSON.stringify(payload));
    logger.info('The draw enquiry >>',JSON.stringify(payload));
    resthandler.doPost(payload,config,function(error,result){
        console.log("makeDrawEnquiry Response from api >>",result);
        logger.info("makeDrawEnquiry >>",result);
        if(error){
            return callback("Error making draw enquiry request");
        }      
       return callback(null,result);
    });
 } 

 function translateDirectOption(gameOption,directOption){
     let response ={};
     var playOption=parseInt(directOption);
     if(gameOption == GameOptions.NLA590){ //NLA 590        
        switch(playOption){
            case 1 :
                  response.message = `Direct1`;
                break;
            case 2 :
                response.message = `Direct2`;
                break;
            case 3 :
                 response.message = `Direct3`;
                break;
            case 4 :
                response.message = `Direct4`;
                break;
            case 5 :
                 response.message = `Direct5`;
                break;
            case 6 :
                response.message = `Perm2`;
                break;
            case 7 :
                response.message = `Perm3`;
                break;
            case 8 :
                response.message = `Perm`;
                break;
            case 9 :
                response.message = `Perm5`;
                break;
            case 10 :
                response.message = `Banker1`;
                break; 
            default:
                response.error=true
               
        }        
       
    }else if(gameOption == GameOptions.VAGLOTTO){
       
         switch(playOption){
            case 1 :
                 response.message = `Direct1`;
                break;
            case 2 :
                response.message = `Direct2 `;
                break;
            case 3 :
                 response.message = `Direct3`;
                break;
            case 4 :
                response.message = `Direct4`;
                break;
            case 5 :
                 response.message = `Direct5`;
                break;
            case 6 :
                response.message = `Perm2`;
                break;
            case 7 :
                response.message = `Perm3`;
                break;
            case 8 :
                response.message = `Perm4`;
                break;
            case 9 :
                response.message = `Perm5`;
                break;
            case 10 :
                response.message = `Banker1`;
                break;
        } 
    }
    return response.message;
}
 

 function DrawInProgress(gameOption){
     var stopTime = "";
     let gameName ="";
     if(gameOption===GameOptions.NLA590){
        stopTime = DrawEventInfo.nla590.stopTime;
        gameName = "NLA590";
     }else{
        stopTime = DrawEventInfo.vagLotto.stopTime;
        gameName = "vagLotto";
     }
     console.log('The stopTime>>>'+stopTime);
     let currentTime = utils.timeStamp();
     logger.info(`DrawTimes ${gameName} stopTime ${stopTime} currentTime ${currentTime}`)
     console.log('The currentTime>>>'+currentTime);
     if(stopTime.length > 0){
        if(Number(stopTime) >= Number(currentTime)){
            return true;
        }
     }
     return false; 
 }

 function getDrawEventByGameOption(){
     return DrawEventInfo.super6;
}

 function getDrawEvent(gameMark){
        if(gameMark.indexOf("N90X5")>-1){
            return DrawEventInfo.nla590;
        }else if(gameMark.indexOf("T90X5")>-1){
            return DrawEventInfo.vagLotto;
        } 
 }
 
module.exports = {
    DrawEventInfo,
    gameMarks,
    ProcessStatus,
    MAX_PLAY_AMOUNT,
    CheckAvailableDraws,
    DrawInProgress,
    getDrawEvent,
    getDrawEventByGameOption,
    GameOptions,
    translateDirectOption
     
};