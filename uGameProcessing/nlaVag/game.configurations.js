const async = require('async');
const utils = require("../../utils");
const _restHandler  = require("../../utils/resthandler")
const logger = require("../../logger");
const env = process.env.NODE_ENV || "test";
const appConfig =  require('../../config/config.json')[env];
const ServiceUrl =  appConfig.nlaConfig.cncp.ServerUrl;
const _GameApiToken = appConfig.nlaConfig.cncp.Token;
const _GameApiKey = appConfig.nlaConfig.cncp.Key;

const GameOptions = {
    NLA590: "1",
    VAGLOTTO: "2"
};

const DrawEventInfo = {
    nla590 : {
       drawNo:0,
       gameMark:"",
       noDrawMessage:"There are no draws at the moment",
       startTime :"",
       stopTime :"",
       gameTitle :"",
       paymentCode :""
    },
    vagLotto :{
        drawNo:0,
        gameMark:"",
        noDrawMessage:"There are no draws at the moment",
        drawEndTime :"",
        startTime :"",
        stopTime :"",
        gameTitle :""
    }  
};

const ProcessStatus = {
    PendingPayment : "PendingPayment",
    PaymentSuccess :  "PaymentSuccess",
    Completed : "Completed",
    Failed :  "Failed"
};

const  NLA590_TITLES = {
    "N90X5_SUN":"NLA 5/90 Monday Special",
    "N90X5_MON":"NLA 5/90 Monday Special",
    "N90X5_TUE":"NLA 5/90 Lucky Tuesday",
    "N90X5_WED":"NLA 5/90 Mid Week",
    "N90X5_THU":"NLA 5/90 Forturne Thursday",
    "N90X5_FRI":"NLA 5/90 Friday Bonanza",
    "N90X5_SAT":"NLA 5/90 National",
};

const NLA590_PAYMENTCODES = {
    "N90X5_SUN" :"011",
    "N90X5_MON" :"011",
    "N90X5_TUE" :"012",
    "N90X5_WED" :"013",
    "N90X5_THU" :"014",
    "N90X5_FRI" :"015",
    "N90X5_SAT" :"016",  
};

const  VAGLOTTO_TITLE = {
    "T90X5": "VAG 590 Morning" 
};


function getNla590GameTitle(gameMark){
    let title = "NLA 5/90 Special";
    if(NLA590_TITLES[gameMark]){
        return NLA590_TITLES[gameMark];
    }
    return title;
}

const MAX_PLAY_AMOUNT=1000;
const gameMarks = {
    vagLotto :"T90X5",
    nla590 : "N90X5",
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
        const _GameMark = gameMarks.vagLotto;
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
                        DrawEventInfo.vagLotto.drawNo = result.drawNo; 
                        DrawEventInfo.vagLotto.startTime =result.startTime;
                        DrawEventInfo.vagLotto.stopTime =result.stopTime;
                        DrawEventInfo.vagLotto.gameMark =result.gameMark;
                        DrawEventInfo.vagLotto.gameTitle = VAGLOTTO_TITLE[result.gameMark] + " Event No. "+result.drawNo; 
                        logger.info('The DrawEventInfo vagLotto>>'+JSON.stringify(DrawEventInfo));
                        console.log('The DrawEventInfo vagLotto>>'+JSON.stringify(DrawEventInfo));
                    }else{
                        DrawEventInfo.vagLotto.drawNo =0;
                    }
                }else if(result.token){
                    DrawEventInfo.vagLotto.drawNo=0;
                }
            } 
          return done();
        });  
    }],function (err) {
        if(callback){
            callback(DrawEventInfo);
        }
    })
    
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
     if(gameOption === GameOptions.NLA590){ //NLA 590
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
                 response.message = `Direct1`
                break;
            case 2 :
                response.message = `Direct2 `
                break;
            case 3 :
                 response.message = `Direct3`
                break;
            case 4 :
                response.message = `Direct4`
                break;
            case 5 :
                 response.message = `Direct5`
                break;
            case 6 :
                response.message = `Perm2`
                break;
            case 7 :
                response.message = `Perm3`
                break;
            case 8 :
                response.message = `Perm4`
                break;
            case 9 :
                response.message = `Perm5`
                break;
            case 10 :
                response.message = `Banker1`
                break;
        } 
    }
    return response.message;
}
 

 function DrawInProgress(gameOption){
     var stopTime = "";
     let gameName ="";
     stopTime = DrawEventInfo.vagLotto.stopTime;
     gameName = "vagLotto";
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

 function getDrawEventByGameOption(gameOption){
     return DrawEventInfo.vagLotto;
}

 function getDrawEvent(gameMark){
     return DrawEventInfo.vagLotto;
 }
 
module.exports = {
    DrawEventInfo,
    CheckAvailableDraws,
    gameMarks,
    ProcessStatus,
    MAX_PLAY_AMOUNT,
    DrawInProgress,
    getDrawEvent,
    getDrawEventByGameOption,
    GameOptions,
    translateDirectOption
     
};