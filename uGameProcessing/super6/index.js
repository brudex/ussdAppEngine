"use strict";
const actionPostGameRequest = require("./game.preprocessing.functions");
const super6Processing = require("./process_super6_request");
const gameConfiguratoin = require("./game.configurations");
const gameReprocessing = require("./game.reprocessing");
const gameProcessing = require("./game.processing");
const cron = require('node-cron');

actionPostGameRequest.resetOrderNumberCounter();
gameConfiguratoin.CheckAvailableDraws(function () {
    super6Processing.processSuper6Requests();
});

gameProcessing.processingPendingPayments();
gameReprocessing.reProcessPaidGames();



cron.schedule('0 0 19 * * *', () => {
    console.log('Running gameRequestProcessing.resetOrderNumberCounter>>');
    actionPostGameRequest.resetOrderNumberCounter();
});


