const logger = require("../logger");
const newline = '\r\n';
function translateIn(req,callback){
    var body = req.body;
    var session = {};
    session.sessionId = body.session_id;
    session.startTime  = new Date();
    session.mobile = body.msisdn;
    session.network = body.network_id;
    session.sequence = 1;
    session.input = body.userdata;
    if(!body.session_mode){
        body.session_mode ='start';
    }
    session.isFirstDial = body.session_mode.toLowerCase() == 'start'; 
    if(session.isFirstDial){
        session.requestType ="initiation";
        session.serviceCode = body.userdata; 
    }else{
        session.requestType = "continue";
    }
    session.expired = false;   
    callback(session);
}

function translateOut(responseData,initialRequest){
    logger.info("Translating out request ",responseData); 
 
 var outResp ={};
    if(responseData.error){
        outResp.session_mode = 'continue';
        outResp.text = responseData.errorMessage;
    }else{
        if(responseData.responseType === 'end'){
            outResp.session_mode = 'end';
        }else{
            outResp.session_mode = 'continue';
        }
        outResp.text = removeInvalidIUssdCharacters(responseData.responseMessage);
    }
    if(initialRequest){
        outResp.session_id=initialRequest.session_id;
        outResp.msisdn = initialRequest.msisdn;
    }
    logger.info('Final Response>>>',outResp);
    return outResp;
}

function removeInvalidIUssdCharacters(text){
    let resultText='';
    resultText =  text.replace(/\%/g,'');
    resultText =  resultText.replace(/&/g,' and ');
    resultText =  resultText.replace(/'/g,'');
    resultText =  resultText.replace(/\//g,' ');
    resultText =  resultText.replace(/\$/g,'');
    return resultText;
}


module.exports = {
    telco: "mesika",
    actions: {
        translateInRequest: translateIn,
        translateOutRequest:translateOut
    }
};


