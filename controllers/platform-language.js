const async = require('async');
const _ = require('lodash');
const logger = require("../logger");
const sessionHandler = require("./session.controller");
const appEngines = require("../appengines/index");

function handleRequest(inRequest,ussdapp, callback) {
    async.waterfall([
        function (done) {
          if(ussdapp){
              sessionHandler.getNewOrCurrentSessionForApp(inRequest,ussdapp, function (err, session) {
                  if (err) {
                      return callback(getErrorResponse(err,inRequest));
                  }
                  done(null, session, session.ussdApp);
              });
          }else {
              sessionHandler.getNewOrCurrentSession(inRequest, function (err, session) {
                  if (err) {
                      return callback(getErrorResponse(err,inRequest));
                  }
                  done(null, session, session.ussdApp);
              });
          }

        },
        function (session, ussdApp, done) {
            let engineName = ussdApp.appEngine;
            console.log('engineName >>>'+engineName);
            console.log('engineName >>>'+ JSON.stringify(Object.keys(appEngines)));
            const engine = appEngines[engineName];
            engine.handleRequest(inRequest, session, ussdApp, function (response) {
                logger.info('Response from engine >>>',response);
                done(null, response);
            });
        },
        function (response, done) {
            callback(getCompletedResponse(response));
            return done();
        }
    ]);
}

function getErrorResponse(msg,inRequest) {
    return {
        responseType: "end",
        responseMessage: msg,
        sessionId: inRequest.sessionId
    };
}


function getCompletedResponse(response) {
    let endContinue = "continue";
    if(response.terminate){
        endContinue = "end";
    }
    return {
        responseType: endContinue,
        responseMessage: response.displayText,
        sessionId: response.sessionId,
     };
}


const inRequest = {
    sessionId: "",
    startTime: new Date(),
    mobile: "",
    network: "",
    sequence: "",
    input: "",
    isFirstDial: true
};


const engineResponse = {
    responseType: "",
    responseMessage: "",
    sessionId: ""
};

module.exports = {
    handleRequest: handleRequest
};