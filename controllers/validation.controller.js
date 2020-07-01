const async = require('async');
const _ = require('lodash');
const db = require('../models');


function handleInputValidation(menu, inRequest, session,callback){

    db.InputValidation.findAll({where:{menuId:menu.uniqueId,appId:session.appId}})
        .then(function (inputValidations) {
             async.each(inputValidations, function(validation, done) {
                const validationFunc =validationTypeFunctions[validation.validationMethod];
                let onValidateCallback = function (valid, message) {
                    if(!valid){
                        if(message){
                            validation.errorMessage = message;
                        }
                    }
                };
                const isValid = validationFunc(inRequest.input,validation.validationCode,session,onValidateCallback);
                if(isValid){
                    return  done()
                }
                done(validation.errorMessage);
            },
            function(err) {
              if(err){
                 return  callback(err);
              }
              return callback();
            });
        });
}

 const validationTypeFunctions = {
    isAlpha: function(input,validationCode){
        return  input.match(/^[a-z]+$/i) !== null;
    },
    isNumeric: function(input,validationCode){
        return _.isNumber(input);
    },
    isMobile: function(input,validationCode){
        return input.match(/((233)|0)\d{9}/i) !== null;
    },
    gte: function(input,validationCode){
        if(_.isNumber(input) &&  _.isNumber(validationCode)){
            const n = Number(input);
            if(n >= Number(validationCode )){
                return true;
            }
        }
        return false;
    },
    gt:function(input,validationCode){
        if(_.isNumber(input) &&  _.isNumber(validationCode)){
            const n = Number(input);
            if(n > Number(validationCode )){
                return true;
            }
        }
        return false;
    },
    lte: function(input,validationCode){
        if(_.isNumber(input) &&  _.isNumber(validationCode)){
            const n = Number(input);
            if(n <= Number(validationCode )){
                return true;
            }
        }
        return false;
    },
    lt: function(input,validationCode){
        if(_.isNumber(input) &&  _.isNumber(validationCode)){
            const n = Number(input);
            if(n < Number(validationCode )){
                return true;
            }
        }
        return false;
    },
    eq: function(input,validationCode){
        return _.isEqual(validationCode,input);
    },
    ne: function(input,validationCode){
        return !_.isEqual(validationCode,input);
    },
    valueIn: function(input,validationCode){
        const arr=validationCode.split(/[,;]/);
        if(arr.length){
            return arr.indexOf(input) >-1
        }
        return false;
    },
    valueNotIn: function(input,validationCode){
        const arr=validationCode.split(/[,;]/);
        if(arr.length){
            return arr.indexOf(input) <-1
        }
        return false;
    },
    startsWith: function(input,validationCode){
        return  _.startsWith(input,validationCode);
     },
    endsWith: function(input,validationCode){
       return  _.endsWith(input,validationCode);
     },
    regexp: function(input,validationCode){
        const regex = new RegExp(validationCode);
        return regex.test(input) ;
     },
    notRegexp: function(input,validationCode){
        const regex = new RegExp(validationCode);
        return regex.test(input) === false ;
    },
    between: function(input,validationCode){
        if(_.isNumber(input)){
          const arr =validationCode.split(/[,;]/);
            const mInput = Number(input);
            if(arr.length === 2){
                if(_.isNumber(arr[0]) && _.isNumber(arr[1])){
                    if(mInput > Number(arr[0]) && mInput < Number(arr[1])){
                        return true;
                    }
                }
            }
         }
        return false;
    },
    notBetween: function(input,validationCode){
        if(_.isNumber(input)){
            const arr =validationCode.split(/[,;]/);
            const mInput = Number(input);
            if(arr.length === 2){
                if(!(_.isNumber(arr[0]) && _.isNumber(arr[1]))){
                    if(mInput > Number(arr[0]) && mInput < Number(arr[1])){
                        return true;
                    }
                }
            }
        }
        return false;
    },
    contains: function(input,validationCode){
        if(!_.isEmpty(validationCode)){
            return input.indexOf(validationCode) > -1;
        }
        return false;
    },
    javascript: function(input,validationCode,session,onValidateCallback){
        let validationFunc =null;
        const actionCode = `validationFunc = ${validationCode}`;
        eval(actionCode);
        if(validationFunc && _.isFunction(validationFunc)){
            const validationResult = validationFunc(input,session);
            if(_.isObject(validationResult)){
                if(!validationResult.valid){
                    onValidateCallback(validationResult.valid,validationResult.errorMessage);
                }
            }
            return validationResult.valid;
        }
        return false;
    }
};


module.exports = {
    handleInputValidation,
    validationTypeFunctions

};