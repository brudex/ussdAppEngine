const TaskFlow = require('../../designcontrollers/taskflowdesign.controller').TaskFlow;
const AppId = 'nlavag';

/**************Job to get Available draws*********/
const taskFlow = new TaskFlow(AppId, 'get590AvailableDraws');
taskFlow.description = "Get Available draws and store in memory";

const getAvailableDrawsVag = taskFlow.newFlowItem('drawEventInfoVag','restapi');
getAvailableDrawsVag.actionCode = function (utils,appConfig,_) {
    const _GameApiToken = appConfig.nlaConfig.cncp.Token;
    const _GameApiKey = appConfig.nlaConfig.cncp.Key;
    this.method  = 'post';
    this.url = appConfig.nlaConfig.cncp.ServerUrl;
    const gameMark ='T90X5';
    this.payload = {"messengerId":utils.getRandomReference(),"token": _GameApiToken,"timestamp": utils.timeStamp(),"transType":31003,"gameMark":gameMark,"drawNo":0};
    let data = _GameApiKey + JSON.stringify(this.payload);
    const sig = utils.getSha1(data.trim());
    this.addHeader('Signature',sig);
};

const saveToMemoryDb = taskFlow.newFlowItem('saveToMemDb','javascript');
saveToMemoryDb.actionCode = function (utils,appConfig,_) {
    let drawEventVag = this.actionResults.drawEventInfoVag;
    console.log('The drawEventVag'+JSON.stringify(drawEventVag));
    let data = {drawEventVag:0};
    if(drawEventVag.drawNo){
        data.drawEventVag = drawEventVag.drawNo;
    }
    this.memDb.saveObject('drawEvent',data);
};

taskFlow.runSchedule.runNow().runAtMinuteTimeIntervals(2);
taskFlow.save();
