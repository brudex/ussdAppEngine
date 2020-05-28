var async = require('async');
var utils = require("../utils");
var logger = require("../logger");
var gameConfigurations = require("./game.configurations");
const actionName = "checkDrawAvailableVag";

  
function handleRequest(params,callback){
    let response ={};
    const drawNo = gameConfigurations.DrawEventInfo.vagLotto.drawNo;
    console.log('The gameConfigurations.DrawEventInfo.vagLotto.drawNo is >>>>')
    if(drawNo==0){ 
        response.message = `No available draws at the moment. Please try again later`;
        response.responseType = "end"; 
        logger.info('No available draws ending ussd session');
    }else{
        response.responseType = "input"; 
        //response.replacePlaceHolders = replacePlaceHolders;
    } 
    callback(response); 
}

function replacePlaceHolders(array){
    let list =[];
    const drawNo = ''+gameConfigurations.DrawEventInfo.vagLotto.drawNo;
    array.forEach(function(item){
        let replaced = stringFormat(item,[drawNo])
        list.push(replaced);
    });
    return list;
}
 
function stringFormat(str, arr) {
    return str.replace(
        /\{([0-9]+)\}/g,
        function (_, index) { return arr[index]; });
  }
/*
/* Do whatever u want in this file but make sure u export and implement the following methods
*/
module.exports = {
    actionName: actionName,
    handleRequest: handleRequest
};