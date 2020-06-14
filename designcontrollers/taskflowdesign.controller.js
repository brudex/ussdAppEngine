const db = require('../models');
const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const { Op } = require("sequelize");


function createTask(data, callback) {
    db.UssdTaskFlow.create(data);
    callback({status: "00", message: "Task Flow created successfully"})
}

function createTaskFlowItem(data, callback) {
    db.UssdTaskFlowItem.create(data);
    callback({status: "00", message: "Task Flow created successfully"})
}


function deleteAllFlows(callback) {
    db.UssdTaskFlow.destroy({where:{id:{[Op.gt]: -1}}}).then(function () {
        db.UssdTaskFlowItem.destroy({where:{id:{[Op.gt]: -1}}})
            .then(function () {
                callback();
            });
    })
}



function TaskFlowItem(taskFlowId,actionName,inheritsPlugin){
    const self = this;
    self.uniqueId= uuidv4();
    self.taskFlowId=taskFlowId;
    self.actionName=actionName;
    self.inheritsPlugin = inheritsPlugin;
    self.actionCode =null;

    self.save = function (index) {
        let code = self.actionCode.toString();
        const data = {
            uniqueId : self.uniqueId,
            taskFlowId  : self.taskFlowId,
            inheritsPlugin  : self.inheritsPlugin,
            code : code,
            actionName:self.actionName,
            index : index
        };
        createTaskFlowItem(data,function () {
            console.log(`Action for ${self.taskFlowId}--for plugin---${self.inheritsPlugin}--- saved `)
        })
    };
}


function TaskFlow(appId,flowName){
    const self = this;
    self.appId= appId;
    self.uniqueId=  uuidv4();
    self.flowName=  flowName;
    self.description ='';
    const flowItems =[];
     self.save = function () {
        const data = {
            appId : self.appId,
            uniqueId  : self.uniqueId,
            flowName  : self.flowName,
            description  : self.description
        };
        data.runSchedule = JSON.stringify(self.runSchedule.getRunProperties());
        createTask(data,function (result) {
            for(let k=0,len=flowItems.length;k<len;k++){
                console.log('Saving Task Item >>'+flowItems[k].actionName);
                flowItems[k].save(k);
            }
            console.log(`TaskFlow ---${result}--- saved `)
        })
    };
    self.newFlowItem = function(actionName,inheritsPlugin) {
         const flowItem={};
         flowItem.actionName=actionName;
         flowItem.taskFlowId=self.uniqueId;
         flowItem.inheritsPlugin = inheritsPlugin;
         const taskFlowItem = new TaskFlowItem(flowItem.taskFlowId,flowItem.actionName,flowItem.inheritsPlugin);
         flowItems.push(taskFlowItem);
         return taskFlowItem;
    };
    self.runSchedule = new RunScheduleBuilder();
}

function RunScheduleBuilder(properties){
    const self= this;
    let runProperties ={};
    runProperties.runNow = false;
    if(properties){
        if(_.isObject(properties)){
            runProperties = properties;
        }else {
            runProperties = JSON.parse(properties);
        }
    }
    self.runNow = function () {
        runProperties.runNow = true;
        return self;
    };
    self.runWeekly = function (dayOfWeek, hour,minute) {
        runProperties.interval = "weekly";
        runProperties.hour = hour;
        runProperties.dayOfWeek = dayOfWeek;
        runProperties.minute = minute;
        return self;
    };
    self.runDailyAtHourAndMinute = function (hour,minute) {
        runProperties.interval = "daily";
        runProperties.hour = hour;
        runProperties.minute = minute;
        return self;
    };
    self.runAtMinuteTimeIntervals =function (minutes) {
        runProperties.interval = "minutes";
        runProperties.minute = minutes;
        return self;
    };
    self.getRunProperties = function(){
        return runProperties;
    };

    self.build = function () {
        let cronString = '';
        const dayOfWeek ={
            '1':'MON',
            '2':'TUE',
            '3':'WED',
            '4':'THU',
            '5':'FRI',
            '6':'SAT',
            '7':'SUN',
        };
        switch (runProperties.interval) {
            case "weekly":
            {
                const day = dayOfWeek[''+runProperties.dayOfWeek];
                cronString = `* ${runProperties.minute} ${runProperties.hour} * * ${day} *`;
                break;
            }
            case "daily":
            {
                cronString = `* ${runProperties.minute} ${runProperties.hour} * * * *`;
                break;
            }
            case "minutes":
            {
                cronString = `0 */${runProperties.minute} * * * *`;
                break;
            }
        }
        return cronString;
    };
}



module.exports = {
    TaskFlow,
    deleteAllFlows,
    RunScheduleBuilder
 };