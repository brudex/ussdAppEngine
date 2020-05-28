const _ = require('lodash');

const OpFunctions = {
    eq: function(compareValue,input){
        return _.isEqual(compareValue,input);
    },
    ne: function(compareValue,input){
        return !_.isEqual(compareValue,input);
    },
    gte:function(compareValue,input){
        if(_.isNumber(input) &&  _.isNumber(compareValue)){
            const n = Number(input);
            if(n >= Number(compareValue )){
                return true;
            }
        }
        return false;
    },
    gt: function(compareValue,input){
        if(_.isNumber(input) &&  _.isNumber(compareValue)){
            const n = Number(input);
            if(n > Number(compareValue )){
                return true;
            }
        }
        return false;
    },
    lte: function(compareValue,input){
        if(_.isNumber(input) &&  _.isNumber(compareValue)){
            const n = Number(input);
            if(n <= Number(compareValue )){
                return true;
            }
        }
        return false;
    },
    lt: function(compareValue,input){
        if(_.isNumber(input) &&  _.isNumber(compareValue)){
            const n = Number(input);
            if(n < Number(compareValue )){
                return true;
            }
        }
        return false;
    },
    valueIn: function(compareValue,input){
        const arr=compareValue.split(/[,;]/);
        if(arr.length){
            return arr.indexOf(input) >-1
        }
        return false;
    },
    valueNotIn: function(compareValue,input){
        const arr=compareValue.split(/[,;]/);
        if(arr.length){
            return arr.indexOf(input) <-1
        }
        return false;
    },
    startsWith: function(compareValue,input){
        return  _.startsWith(compareValue,input);
    },
    endsWith: function(compareValue,input){
        return  _.endsWith(compareValue,input);
    },
    regexp: function(compareValue,input){
        const regex = new RegExp(compareValue);
        return regex.test(input) ;
    },
    notRegexp: function(compareValue,input){
        const regex = new RegExp(compareValue);
        return regex.test(input) === false ;
    },
    between: function(compareValue,input){
        if(_.isNumber(input)){
            const arr =compareValue.split(/[,;]/);
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
    notBetween: function(compareValue,input){
        if(_.isNumber(input)){
            const arr =compareValue.split(/[,;]/);
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
    contains: function(compareValue,input){
        if(!_.isEmpty(compareValue)){
            return input.indexOf(compareValue) > -1;
        }
        return false;
    },
};

module.exports = OpFunctions;