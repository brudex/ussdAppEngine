const async = require('async');
const _ = require('lodash');
const db = require('../models');
const logger = require("../logger");
const resthandler = require('../utils/resthandler');
const menuController = require('../controllers/menu.controller');
const validationController = require('../controllers/validation.controller');


/**available methods include
 *available fields
 *self.menu.headerText, self.menu.displayText, self the menu.footerText
 *Methods : addHeader(key,value), addBasicAuthentication(userName,password),addJsonHeaders
 */
function RestApiPlugin(){
    const self = this;
    self.err = null;
    self.actionResponse=null;
    self.retMenu = null;
    const utils = {};
    self.url ='';
    utils._ = _;
    self.payload = null;
    self.method = 'GET'; //POST,PUT,GET
    const requestheaders = {};

    const addHeader = function (key,value) {
        requestheaders[key]=value;
    };

    const addBasicAuthentication = function (userName,password) {
        let buff = new Buffer(`${userName}:${password}`);
        let base64data = buff.toString('base64');
        requestheaders['Authorization']= 'Basic '+base64data;
    };

    const addJsonHeaders = function () {
        requestheaders['Content-Type'] ='application/json';
    };

    this.execute = function(callback){
         if(_.isEmpty(self.method)){
             return callback('Invalid request method');
         }
        if(self.method.toUpperCase()==='GET'){
            let config= {headers:requestheaders};
            resthandler.doGet(self.url,config,function (error, responseBody) {
                console.log('actionFactory Menu after execute >>>'+this.actionName +">>"+JSON.stringify(responseBody));
                self.err = error;
                self.actionResponse = responseBody;
                self.retMenu = null;
                callback(self.err, self.actionResponse, self.retMenu)
            })
        }else if(self.method.toUpperCase()==='POST'){
            let config= {headers:requestheaders,url:self.url};
            resthandler.doPost(self.payload,config,function (error, responseBody) {
                console.log('actionFactory Menu after execute >>>'+this.actionName +">>"+JSON.stringify(responseBody));
                self.err = error;
                self.actionResponse = responseBody;
                self.retMenu = null;
                callback(self.err, self.actionResponse, self.retMenu)
            })
        }
    }
}

module.exports = {
    pluginName: "restapi",
    plugin: RestApiPlugin
};


