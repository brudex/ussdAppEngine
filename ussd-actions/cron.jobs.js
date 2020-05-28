"use strict";
var logger = require("../logger");
var db = require("../models");
var actionPostGameRequest = require("./game.preprocessing.functions");
var gameProcessing = require("./game.processing");
var gameReprocessing = require("./game.reprocessing");
var gameConfiguration = require("./game.configurations");
const paymentProcessing = require('./payment.processing');
var cron = require('node-cron');
var __DayOfTheWeek=0;
  
 
function resetGameTitles(eventInfo,gameType){
    let  title = "NLA 5/90 Special";
    if(eventInfo){
        if (gameType=="nla590"){
            title=eventInfo.nla590.gameTitle;
            if(title){         
               db.UssdMenu.update({displayText:title},{where :{flowId:'0-1',appId:"NLAUssd"}});
            }
        }
        if(gameType=="vagLotto"){
            title=eventInfo.vagLotto.gameTitle + "\nEnter 1 to continue";
            if(title){
               db.UssdMenu.update({displayText:title},{where :{flowId:'0-1',appId:"VagMorning"}});
            }
        }
         paymentProcessing.PaymentGameCode_NLA590 = eventInfo.nla590.paymentCode;
    } 
   
} 

function setDayOfTheWeek(){
    var mydate = new Date();
    var dayOfWeek =mydate.getDay();
    var h = mydate.getHours();
    if(h >= 17){
        dayOfWeek+=1;
        if(dayOfWeek>6){
            dayOfWeek=0;
        }
    } 
    __DayOfTheWeek=dayOfWeek;
    console.log('The day of the week is >>'+__DayOfTheWeek);
    logger.info('The day of the week is >>'+__DayOfTheWeek);
    actionPostGameRequest.setDayOfTheWeek(dayOfWeek);
    return dayOfWeek;
}


setDayOfTheWeek();
gameConfiguration.CheckAvailableDraws(resetGameTitles); 
actionPostGameRequest.resetOrderNumberCounter();
gameProcessing.processingPendingPayments();
gameReprocessing.reProcessPaidGames();


cron.schedule('0 */2 * * * *', () => {
    console.log('Running processingPendingPayments>>');
    gameProcessing.processingPendingPayments();
    gameReprocessing.reProcessPaidGames();
});

cron.schedule('0 */1 * * * *', () => {
    console.log('Running CheckAvailableDraws>>');
    console.log('Running resetGameTitles on callback>>');
    gameConfiguration.CheckAvailableDraws(function(drawEventInfo,gameType){
        console.log('Running resetGameTitles >>');
        resetGameTitles(drawEventInfo,gameType);
    });
});

cron.schedule('0 0 19 * * *', () => {
    console.log('Running gameRequestProcessing.resetOrderNumberCounter>>');
    setDayOfTheWeek();
    actionPostGameRequest.resetOrderNumberCounter();
 });


