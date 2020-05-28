const async = require('async');
const _ = require('lodash');
const telco = require('../telco-translators');
const platForm = require('./platform-language');
const logger = require("../logger");
const db = require('../models');


function handleProviderRequest(req, res) {
    const translatorName = req.params['provider'];
    const translator = telco.translator[translatorName];
    async.waterfall([
        function ( done) {
            translator.translateInRequest(req,function(engineLanguage){
                logger.info('EngineLanguage >>>',engineLanguage);
                done(null, engineLanguage);
            });
        },
        function (engineLanguage, done) {
           logger.info('Handling request to engine >>>');
           platForm.handleRequest(engineLanguage,null,function(response){
               logger.info('Response from engine >>>');
                done(null,response)
            });
        },
        function (response, done) {
            logger.info('Translating out response >>>');
            const telcoLanguage = translator.translateOutRequest(response,req.body);
            logger.info('Response Translated as >>>',telcoLanguage);
            res.send(telcoLanguage);
            done();
        }
    ]);
}


function getErrorResponse(msg) {
    return {
        responseType: "end",
        responseMessage: msg,
        sessionId: '',
        error : true,
    };
}


function handleAppRequest(req, res) {
    console.log('Request received,>>',JSON.stringify(req.body));
    let translator =null;
    async.waterfall([
        function (done) {
            db.UssdApp.findOne({where:{appId:req.params.appId}})
                .then(function (ussdApp) {
                    if(ussdApp){
                         return done(null,ussdApp)
                     }
                     res.json(getErrorResponse('Invalid Ussd shortcode or application'));
                }).catch(function (error) {
                   res.json(getErrorResponse('Invalid Ussd shortcode or application'));
                });
        },
        function (ussdApp, done) {
            const translatorName = ussdApp.provider;
            translator = telco.translator[translatorName];
            translator.translateInRequest(req,function(engineLanguage){
                logger.info('EngineLanguage >>>',engineLanguage);
                done(null, engineLanguage,ussdApp);
            });
        },
        function (engineLanguage,ussdApp, done) {
           logger.info('Handling request to engine >>>');
           platForm.handleRequest(engineLanguage,ussdApp,function(response){
               logger.info('Response from engine >>>');
                done(null,response)
            });
        },
        function (response, done) {
            logger.info('Translating out response >>>');
            const telcoLanguage = translator.translateOutRequest(response,req.body);
            logger.info('Response Translated as >>>',telcoLanguage);
            res.send(telcoLanguage);
            done();
        }
    ],function (err) {

    });
}



module.exports = {
    handleProviderRequest,
    handleAppRequest
};