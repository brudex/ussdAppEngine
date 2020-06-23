"use strict";
const async = require('async');
const cron = require('node-cron');
const ussdAppController = require('./ussd_app.controller');
const RunSchedulerBuilder = require('../designcontrollers/taskflowdesign.controller').RunScheduleBuilder;
const loadUtilityFiles = require('./utility_files.controller').loadUtilityFiles;

/*for multiple apps getAll apps
*
*/
ussdAppController.getAllUssdApps(function (err,ussdapps) {
    async.each(ussdapps,function (ussdapp,topdone) {
        loadUtilityFiles(ussdapp.appId);
        async.waterfall([function (done) {
            ussdapp.getTaskFlows(function (taskFlows) {
                done(null,taskFlows)
            })
        },function (taskFlows, done) {
            async.each(taskFlows,function (taskFlow,innerCb) {
                const runSch = new RunSchedulerBuilder(taskFlow.runSchedule);
                const cronTab = runSch.build();
                console.log('Cron tab expression >>>'+cronTab);
                if(runSch.getRunProperties().runNow){
                    console.log('Executing flow items');
                    taskFlow.executeFlowItems();
                }
                cron.schedule(cronTab, () => {
                    console.log(`Running ${taskFlow.description} >>`);
                    taskFlow.executeFlowItems();
                });
                innerCb();
            },done)
        }],function (err) {
            topdone();
        })
    })
});




