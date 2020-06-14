"use strict";
const actionPostGameRequest = require("./game.preprocessing.functions");
const super6Processing = require("./process_super6_request");
const gameConfiguratoin = require("./game.configurations");
const gameReprocessing = require("./game.reprocessing");
const cron = require('node-cron');



//gameProcessing.processingPendingPayments();
actionPostGameRequest.resetOrderNumberCounter();
gameConfiguratoin.CheckAvailableDraws();
super6Processing.processSuper6Requests();
//gameReprocessing.reProcessPaidGames();



cron.schedule('0 0 19 * * *', () => {
    console.log('Running gameRequestProcessing.resetOrderNumberCounter>>');
    //setDayOfTheWeek();
    actionPostGameRequest.resetOrderNumberCounter();
});


