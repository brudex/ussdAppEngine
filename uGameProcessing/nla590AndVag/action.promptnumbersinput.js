var async = require('async');
var utils = require("../utils");
var logger = require("../logger");
var inputValidations = require("./action.input.validations");
const actionName = "promptNumbersInput";

  
function handleRequest(params,callback){
    logger.info('prompt input values >>>',params.inputValues);  
    let response ={};
     
     if(params.inputValues.gameOption==="1"){ //NLA 590
        response.responseType = "input";
        let playOption = 0;
        if(utils.isNumeric(params.inputValues.directOption)){
            playOption = parseInt(params.inputValues.directOption);
        }
        let originalMachine='';
        params.inputValues.machineOption=1       
        response.message = "Invalid play option selected. Enter from 1 to 10";
        response.error = false;
        switch(playOption){
            case 1 :
                  response.message = `NLA 5 90 - You have Selected Direct1.\nEnter 1 number to play\n(Eg. 20 )`
                break;
            case 2 :
                response.message = `NLA 5 90 - You have Selected Direct2.\nEnter 2 numbers to play\n(Eg. 20 30 )`;
                break;
            case 3 :
                 response.message = `NLA 5 90 - You have Selected Direct3.\nEnter 3 numbers to play\n(Eg. 20 30 40 )`;
                break;
            case 4 :
                response.message = `NLA 5 90 - You have Selected Direct4.\nEnter 4 numbers to play\n(Eg. 20 30 40 50 )`;
                break;
            case 5 :
                 response.message = `NLA 5 90 - You have Selected Direct5.\nEnter 5 numbers to play\n(Eg. 20 30 40 50 60 )`;
                break;
            case 6 :
                response.message = `NLA 5 90 - You have Selected Perm2.\nEnter a minimum of 3 numbers to play (Eg 20 30 40).`;
                break;
            case 7 :
                response.message = `NLA 5 90 - You have Selected Perm3.\nEnter a minimum of 4 numbers to play\n(Eg. 20 30 40 )`;
                break;
            case 8 :
                response.message = `NLA 5 90 - You have Selected Perm 4. Enter a minimum of 5 numbers to play.  (Eg 20 30 40 50 60 )`;
                break;
            case 9 :
                response.message = `NLA 5 90 - You have Selected Perm5.\nEnter a minimum 6 numbers to play\n(Eg. 20 30 40 50 60 )`;
                break;
            case 10 :
                response.message = `NLA 5 90 - You have Selected Banker1.\nEnter 1 number to play\n(Eg. 20 )`;
                break;
            default:
                response.error=true;
        }
    }else if(params.inputValues.gameOption === "2"){
        response.responseType = "input";
        response.error = false;
        logger.info("The machine option is >>>",params.inputValues.machineOption);
        logger.info("The machine option is >>>",params.inputValues);
        let playOption = 0;
        if(!isNaN(params.inputValues.directOption) && params.inputValues.directOption!=null){
            playOption = parseInt(params.inputValues.directOption);
        }
        switch(playOption){
            case 1 :
                response.message = `VAG 590 Morning - You have Selected Direct1.\nEnter 1 number to play\n(Eg. 20 )`
              break;
          case 2 :
              response.message = `VAG 590 Morning - You have Selected Direct2.\nEnter 2 numbers to play\n(Eg. 20 30 )`;
              break;
          case 3 :
               response.message = `VAG 590 Morning - You have Selected Direct3.\nEnter 3 numbers to play\n(Eg. 20 30 40 )`;
              break;
          case 4 :
              response.message = `VAG 590 Morning - You have Selected Direct4.\nEnter 4 numbers to play\n(Eg. 20 30 40 50 )`;
              break;
          case 5 :
               response.message = `VAG 590 Morning - You have Selected Direct5.\nEnter 5 numbers to play\n(Eg. 20 30 40 50 60 )`;
              break;
          case 6 :
              response.message = `VAG 590 Morning - You have Selected Perm2.\nEnter a minimum of 3 numbers to play (Eg 20 30 40).`;
              break;
          case 7 :
              response.message = `VAG 590 Morning - You have Selected Perm3.\nEnter a minimum of 4 numbers to play\n(Eg. 20 30 40 )`;
              break;
          case 8 :
              response.message = `VAG 590 Morning - You have Selected Perm 4. Enter a minimum of 5 numbers to play.  (Eg 20 30 40 50 60 )`;
              break;
          case 9 :
              response.message = `VAG 590 Morning - You have Selected Perm5.\nEnter a minimum 6 numbers to play\n(Eg. 20 30 40 50 60 )`;
              break;
          case 10 :
              response.message = `VAG 590 Morning - You have Selected Banker1.\nEnter 1 number to play\n(Eg. 20 )`;
              break;
          default:
              response.error=true
        }
    }else{
        response.responseType = "end";
        response.error = true;
        response.message = "Invalid Option"
    }
    logger.info("Response to promptNumbersInput >>",response);
    logger.info("Response to promptNumbersInput message >>",response.message);
    callback(response);
     
}

  
   
/*
/* Do whatever u want in this file but make sure u export and implement the following methods
*/
module.exports = {
    actionName: actionName,
    handleRequest: handleRequest
};