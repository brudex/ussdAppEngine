var utils = require("../utils");
var logger = require("../logger");
var gameConfigurations = require("./game.configurations");

function validateRetailerId(params, callback) {
    let retailerId = "" + params.inputValues.lottoComp;
    logger.info('param Input values>>', JSON.stringify(params.inputValues))
    var response = { error: false };
    retailerId = retailerId.trim();
    logger.info('The value of RETAILER ID IS >>' + retailerId);
    if (retailerId === "undefined" || retailerId == "1" || utils.isNumeric(retailerId)) {
        if (utils.isNumeric(retailerId) && retailerId.length == 8) {
            response.message = null;
            response.responseType = "input";
        }
        else if (retailerId === "undefined" || retailerId == "1") {
            response.message = null;
            response.responseType = "input";
        }else {
            response.error = true;
            response.message = `Retailer Id must be 8 digits or enter 1 for none.`;
            response.responseType = "end";
        }
    } else {
        response.error = true;
        response.message = `Retailer Id must be numeric 8 digits or 1 for none.`;
        response.responseType = "end";
    }
    logger.info('validateRetailerId >>', response);
    if (callback) {
        return callback(response);
    } else {
        return response;
    }

}

 
function validatBetNumbers(params, callback) {
    let numberInput = params.inputValues.numberToPlay;
    let betNumbers = numberInput.split(' ');
    let validationErrors = [];
    let duplicateTracker = [];
    var response = {};
    validationErrors = validateDirectPermOptionInput(params);
    if (validationErrors.length == 0) {
        betNumbers.forEach(item => {
            item = item.trim();
            if (!utils.isNumeric(item)) {
                validationErrors.push('Bet numbers must be numeric');

            } else {
                if (Number(item) < 1 || Number(item) > 90) {
                    validationErrors.push("Bet numbers must between 1 and 90")
                }
            }
            if (duplicateTracker.indexOf(item) > -1) {
                validationErrors.push('Duplicate numbers not allowed');
            } else {
                duplicateTracker.push(Number(item));
            }
        });
    }
    if (validationErrors.length) {
        response.message = validationErrors.join('\n\r');
        response.responseType = "end";
    } else {
        response.message = null;
        response.responseType = "input";
    }
    logger.info('validatBetNumbers >>', response);
    callback(response);
}

function validateDirectPermOption(params, callback) {
    var directOption = 999;
    let numberInput = params.inputValues.numberToPlay;
    if (numberInput == null) {
        numberInput = '';
    }
    let validationErrors = [];
    let betNumbers = numberInput.split(' ');
    var response = {};
    if (utils.isNumeric(params.inputValues.directOption)) {
        directOption = parseInt(params.inputValues.directOption);
    } else {
        validationErrors.push('Invalid input for permutation')
    }
    switch (directOption) {
        case 6: //
            if (betNumbers.length < 3) {
                validationErrors.push('Perm 2 needs a minimum of 3 numbers for valid bet. A maximum of 16 numbers.')
            }
            break;
        case 7:
            if (betNumbers.length < 4) {
                validationErrors.push('Perm 3 needs a minimum of 4 numbers for valid bet. A maximum of 16 numbers.')
            }
            break;
        case 8:
            if (betNumbers.length < 5) {
                validationErrors.push('Perm 4 needs a minimum of 5 numbers for valid bet. A maximum of 16 numbers.')
            }
            break;
        case 9:
            if (betNumbers.length < 6) {
                validationErrors.push('Perm 4 needs a minimum of 5 numbers for valid bet. A maximum of 16 numbers.')
            }
            break;
    }
    if (validationErrors.length) {
        response.message = validationErrors.join('\n\r');
        response.responseType = "end";
    } else {
        response.message = null;
        response.responseType = "input";
    }
    logger.info('validateDirectPermOption >>', response);
    callback(response);
}

function validateDirectPermOptionInput(params) {
    var directOption = 999;
    let numberInput = params.inputValues.numberToPlay;
    if (numberInput == null) {
        numberInput = '';
    }
    let validationErrors = [];
    let betNumbers = numberInput.split(' ');
    var response = {};
    if (utils.isNumeric(params.inputValues.directOption)) {
        directOption = parseInt(params.inputValues.directOption);
    } else {
        validationErrors.push('Invalid input for permutation')
    }
    switch (directOption) {
        case 6: //
            if (betNumbers.length < 3) {
                validationErrors.push('Perm 2 needs a minimum of 3 numbers for valid bet. A maximum of 16 numbers.')
            }
            break;
        case 7:
            if (betNumbers.length < 4) {
                validationErrors.push('Perm 3 needs a minimum of 4 numbers for valid bet. A maximum of 16 numbers.')
            }
            break;
        case 8:
            if (betNumbers.length < 5) {
                validationErrors.push('Perm 4 needs a minimum of 5 numbers for valid bet. A maximum of 16 numbers.')
            }
            break;
        case 9:
            if (betNumbers.length < 6) {
                validationErrors.push('Perm 4 needs a minimum of 5 numbers for valid bet. A maximum of 16 numbers.')
            }
            break;
    }
    return validationErrors;
}


function validateMachineOrOriginal(params, callback) {
    var response = {};
    let numberInput = 999;
    let validationErrors = [];
    if (utils.isNumeric(params.inputValues.machineOption)) {
        numberInput = parseInt(params.inputValues.machineOption);
        if (!(numberInput == 1 || numberInput == 2)) {
            validationErrors.push('Invalid input option. Enter 1 or 2');
        }
    } else {
        validationErrors.push('Invalid input option')
    }
    response.error = false;
    if (validationErrors.length) {
        response.error = true;
        response.message = validationErrors.join('\n\r');
        response.responseType = "end";
    } else {
        response.message = null;
        response.responseType = "input";
    }
    logger.info('validateMachineOrOriginal >>', response);
    if (callback) {
        callback(response);
    } else {
        return response;
    }

}


module.exports = {
    actions: {
        'validateRetailer': validateRetailerId,
        "validatBetNumbers": validatBetNumbers,
        "validateMachineOrOriginal": validateMachineOrOriginal,
        "validateDirectPermOption": validateDirectPermOption,
     }
};