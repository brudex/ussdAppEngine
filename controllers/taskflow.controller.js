const async = require('async');
const db = require('../models');
const _ = require('lodash');
const utils = require('../utils');
const actionFactory = require('./taskflow.action.factory');
const GetMemoryDbStore = require('./memorystore.controller').GetMemoryDbStore;
let env = process.env.NODE_ENV || "test";
const appConfig =  require('../config/config.json')[env];

function getTaskFlowsByAppId(appId,callback){
    db.UssdTaskFlow.findAll({where:{appId:appId}})
        .then(function (taskFlows) {
            const array =[];
            taskFlows.forEach(function (flow) {
                let taskFlowClass = new TaskFlowClass(flow);
                array.push(taskFlowClass);
            });
            callback(array)
        });
 }

function getTaskFlowItems(taskFlowId,callback){
    db.UssdTaskFlowItem.findAll({where:{taskFlowId:taskFlowId},order: [ ['index',  'ASC'] ]})
        .then(function (items) {
            callback(items)
        });
}



function TaskFlowClass(taskFlow){
    const self = this;
    self.appId = taskFlow.appId;
    self.uniqueId = taskFlow.uniqueId;
    self.flowName = taskFlow.flowName;
    self.description = taskFlow.description;
    self.runSchedule = taskFlow.runSchedule;
    self.flowItems = [];
    const memDb =  GetMemoryDbStore(self.appId);

    self.runSchedule = taskFlow.runSchedule;
    function loadTaskFlowItems(callback) {
        if(self.flowItems.length){
            return callback();
        }
        getTaskFlowItems(self.uniqueId,function (items) {
            self.flowItems = items;
            callback();
        })
    }

    self.executeFlowItems = function() {
         async.waterfall([function (done) {
             loadTaskFlowItems(done);
         },
             function (done) {
             let actionResults ={};
                async.eachSeries(self.flowItems,function (flowItem,innerCb) {
                    const executableAction = actionFactory.createFromPlugin(flowItem, actionResults,memDb);
                    executableAction.initialize(utils,appConfig,_);
                    executableAction.execute(function (err, response) {
                         console.log('TaskFlowClass executableAction.execute callback response>>'+JSON.stringify(response));
                         if (err) {
                            return innerCb(err);
                        }
                        if (response) {
                            actionResults[flowItem.actionName] = response;
                            return innerCb();
                        }
                        innerCb();
                    })
                },function () {
                    done();
                })
             }
         ])
    };
}


module.exports = {
    getTaskFlowsByAppId,

};