"use strict";
const _ = require('lodash');
const fs = require('fs');
const ussdappUtilityFiles = {};



function loadUtilityFiles(appId){
    const path = __dirname+ `/../uAppUtilityFiles/${appId}/index.js`;
    try {
        console.log('AppUtils path is >>>'+path);
        if (fs.existsSync(path)) {
            console.log('AppUtils path found >>>');
            const utilityFunctions = require(path);
            ussdappUtilityFiles[appId]=utilityFunctions;
        }
    } catch(err) {
        console.error(`Error loading utility files for ${appId}`+err);
    }

}

function GetUtilityFunctions(appId){
   return ussdappUtilityFiles[appId];

}


module.exports = {
    loadUtilityFiles,
    GetUtilityFunctions
};

