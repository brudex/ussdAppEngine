const async = require('async');
const _ = require('lodash');
const db = require('../models');
const logger = require("../logger");
const appController = require('./app.controller');
const menudesignController = require('./menudesign.controller');
const actiondesignController = require('./actiondesign.controller');


function createSuper6App(callback){
    const app = {
        appId: 'super6',
        appName: 'NLA-SUPER-6',
        description: 'NLA-SUPER-6',
        templateTag: 'default',
        appEngine: 'default',
        shortCode:'*890*6#',
        provider: 'mesika'
    };
    appController.createNewUssdApp(app,function (err, response) {
        if(err){
             console.log(err);
             return callback(err);
        }
        logger.info(response);
        callback()
    })

}



function initializeApp(){
    async.waterfall([function (done) {
        appController.findUssdAppByAppId('super6',function (err,app) {
            if(app){
               return done();
            }
            createSuper6App(function(){
                done()
            });
        })
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
       require('./super6menudesigns');
        done();
    }

    ]);
}



module.exports = {
    initializeApp
};