const TaskFlow = require('./taskflowdesign.controller').TaskFlow;



/**************Job to get Available draws*********/
const taskFlow = new TaskFlow('super6', 'getAvailableDraws');
taskFlow.description = "Get Available draws and store in memory";
const getAvailableDraws = taskFlow.newFlowItem('drawEventInfo','restapi');
getAvailableDraws.actionCode = function (utils,appConfig,_) {
    const _GameApiToken = appConfig.nlaConfig.cncp.Token;
    const _GameApiKey = appConfig.nlaConfig.cncp.Key;
    this.method  = 'post';
    this.url = appConfig.nlaConfig.cncp.ServerUrl;
    const gameMark ='T55X6';
    this.payload = {"messengerId":utils.getRandomReference(),"token": _GameApiToken,"timestamp": utils.timeStamp(),"transType":31003,"gameMark":gameMark,"drawNo":0};
    let data = _GameApiKey + JSON.stringify(this.payload);
    const sig = utils.getSha1(data.trim());
    this.addHeader('Signature',sig);
};

const saveToMemoryDb = taskFlow.newFlowItem('saveToMemDb','javascript');
saveToMemoryDb.actionCode = function (utils,appConfig,_) {
    let drawEvent = this.actionResults.drawEventInfo;
    console.log('The drawEvent'+JSON.stringify(drawEvent));
    let data = {drawNo:0};
    if(drawEvent.drawNo){
        data.drawNo = drawEvent.drawNo;
    }
    this.memDb.saveObject('drawEvent',data);
};


taskFlow.runSchedule.runNow().runAtMinuteTimeIntervals(2);
taskFlow.save();
