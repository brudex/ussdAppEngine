const async = require('async');
const _ = require('lodash');
 const logger = require("../logger");
 const RestApiPlugin = require('./plugin.restapi').plugin;


 function RestCallIteratorPlugin(){
    const self = this;
    self.err = null;
    self.actionResponse=null;
    self.retMenu = null;
    const utils = {};
    utils._ = _;
    utils.logger= logger;
    self.callList = [];

    self.newRestCall = function(url,method){
        const restcall ={basicAuth :null,headers:[],url:url,method:method};
        const builder =  {
            basicAuth: function (userName,password) {
                restcall.basicAuth.userName=userName;
                restcall.basicAuth.password = password;
                return builder;
            },
            addHeader: function (key,value) {
                restcall.headers.push({key:key,value :value});
                return builder;
            },
            setMethod : function (method){
                restcall.method = method;
                return builder;
            },
            setPayload : function (payload){
                restcall.payload = payload;
                return builder;
            },
            save : function () {
                self.callList.push(restcall);
            }
        };
        return builder;
    };
    this.execute = function(callback){
        const resultList =[];
        let index =0;
        async.each(self.callList,function (call,cb) {
           const restplugin = new RestApiPlugin();
           index+=1;
           restplugin.actionName = 'RestIterator_' +index +'-' +self.actionName;
           restplugin.payload= call.payload;
           restplugin.url=call.url;
           restplugin.method  = call.method;
           call.headers.forEach(function (header) {
                restplugin.addHeader(header.key,header.value);
           });
           if(call.basicAuth){
               restplugin.addBasicAuthentication(call.basicAuth.userName,call.basicAuth.password)
           }
           restplugin.addJsonHeaders();
           restplugin.execute(function (err,response) {
               console.log('Called execute in restiterator with payload >>'+JSON.stringify(restplugin.payload));
               if(err){
                  console.log('Rest api error'+err);
                  return  cb('There was and error'+err);
               }
               console.log('Called execute response >>'+JSON.stringify(response));
               resultList.push(response);
               cb();
           })
        },function (err) {
            self.retMenu = null;
            callback(err, resultList, self.retMenu)
        });
    }
}

module.exports = {
    pluginName: "restIterator",
    plugin: RestCallIteratorPlugin
};


