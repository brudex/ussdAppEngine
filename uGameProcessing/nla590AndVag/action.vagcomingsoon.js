var async = require('async');
var utils = require("../utils");
var logger = require("../logger");
var inputValidations = require("./action.input.validations");
const actionName = "vagRedirect";

  
function handleRequest(params,callback){
    logger.info('prompt input values >>>',params.inputValues);  
    let response ={}; 
    response.responseType = "end";
    response.message = 'Please dial *890*5# to play VAG 5 90 Morning. Thank you '
    response.error = true;    
    callback(response); 
}

  
   
/*
/* Do whatever u want in this file but make sure u export and implement the following methods
*/
module.exports = {
    actionName: actionName,
    handleRequest: handleRequest
};