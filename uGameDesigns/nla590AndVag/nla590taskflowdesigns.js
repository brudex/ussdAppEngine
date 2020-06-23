const TaskFlow = require('../../designcontrollers/taskflowdesign.controller').TaskFlow;
const AppId = 'nla590AndVag';

/**************Job to get Available draws*********/
const taskFlow = new TaskFlow(AppId, 'get590AvailableDraws');
taskFlow.description = "Get Available draws and store in memory";
const getAvailableDraws590 = taskFlow.newFlowItem('drawEventInfo590','restIterator');
getAvailableDraws590.actionCode = function (utils,appConfig,_) {
    const _GameApiToken = appConfig.nlaConfig.cncp.Token;
    const _GameApiKey = appConfig.nlaConfig.cncp.Key;
    const method  = 'post';
    const url = appConfig.nlaConfig.cncp.ServerUrl;
    const gameMarks = [
            "N90X5_SUN",
            "N90X5_MON",
            "N90X5_TUE",
            "N90X5_WED",
            "N90X5_THU",
            "N90X5_FRI",
            "N90X5_SAT"
    ];
    for(let k=0,len=gameMarks.length;k<len;k++){
        const gameMark =gameMarks[k];
        const payload = {"messengerId":utils.getRandomReference(),"token": _GameApiToken,"timestamp": utils.timeStamp(),"transType":31003,"gameMark":gameMark,"drawNo":0};
        let data = _GameApiKey + JSON.stringify(payload);
        const sig = utils.getSha1(data.trim());
        this.newRestCall(url,method).setPayload(payload).addHeader('Signature',sig).save();
    }
};

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
    let drawEvent590 = this.actionResults.drawEventInfo590;
    let drawEventVag = this.actionResults.drawEventInfoVag;
    console.log('The drawEvent590'+JSON.stringify(drawEvent590));
    console.log('The drawEventVag'+JSON.stringify(drawEventVag));
    let data = {drawEvent590:0,drawEventVag:0};
    if(drawEvent590.length){
        for(let k=0,len=drawEvent590.length;k<len;k++){
            if(drawEvent590[k].drawNo){
                data.drawEvent590 = drawEvent590[k].drawNo;
                break;
            }
        }
    }
    if(drawEventVag.drawNo){
        data.drawEventVag = drawEventVag.drawNo;
    }
    this.memDb.saveObject('drawEvent',data);
 };


taskFlow.runSchedule.runNow().runAtMinuteTimeIntervals(2);
taskFlow.save();
