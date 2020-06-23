const async = require('async');
const _ = require('lodash');
const db = require('../../models');
const logger = require("../../logger");
const appController = require('../../designcontrollers/app.controller');
const menudesignController = require('../../designcontrollers/menudesign.controller');
const actiondesignController = require('../../designcontrollers/actiondesign.controller');
const taskFlowDesignController = require('../../designcontrollers/taskflowdesign.controller');

const AppId = 'nla590AndVag';
function createSuper6App(callback){
    const app = {
        appId: AppId,
        appName: 'NLA-590_PLUS_VAG',
        description: 'NLA-590_PLUS_VAG',
        templateTag: 'default',
        appEngine: 'default',
        shortCode:'*890*8#',
        provider: 'mesika'
    };
    appController.createNewUssdApp(app,function (err, response) {
        if(err){
            console.log(err);
            return callback(err);
        }
        logger.info(response);
        callback();
    })
}



function initializeApp(){
    async.waterfall([function (done) {
        appController.findUssdAppByAppId(AppId,function (err,app) {
            if(app){
               return done();
            }
            createSuper6App(function(){
                done()
            });
        })
    },
    function (done) {
        taskFlowDesignController.deleteAllFlows(done);
    },
    function (done) {
        menudesignController.deleteAllMenus(done);
    },
    function (done) {
        appController.deleteAllSessions(done);
    },
    function (done) {
        actiondesignController.deleteAllActions(done);
    },
    function (done) {
       require('./nla590menudesigns');
       require('./nla590taskflowdesigns');
        done();
    },
        function (done) {
           setTimeout(function () {
               require('../../controllers/crontasks.controller');
           },5*1000);
             done();
        }

    ]);
}



module.exports = {
    initializeApp
};