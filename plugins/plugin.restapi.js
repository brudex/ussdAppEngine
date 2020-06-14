const _ = require('lodash');
const logger = require("../logger");
const resthandler = require('../utils/resthandler');




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
    utils.logger= logger;
    self.payload = null;
    self.method = 'GET'; //POST,PUT,GET
    const requestheaders = {};

    self.addHeader = function (key,value) {
        requestheaders[key]=value;
    };

    self.addBasicAuthentication = function (userName,password) {
        let buff = new Buffer(`${userName}:${password}`);
        let base64data = buff.toString('base64');
        requestheaders['Authorization']= 'Basic '+base64data;
    };

    self.addJsonHeaders = function () {
        requestheaders['Content-Type'] ='application/json';
    };

    this.execute = function(callback){
        console.log('Called execute restapi');
         if(_.isEmpty(self.method)){
             return callback('Invalid request method');
         }
        if(self.method.toUpperCase()==='GET'){
            let config= {headers:requestheaders};
            resthandler.doGet(self.url,config,function (error, responseBody) {
                console.log('actionFactory after execute >>>'+this.actionName +">>"+JSON.stringify(responseBody));
                self.err = error;
                self.actionResponse = responseBody;
                self.retMenu = null;
                callback(self.err, self.actionResponse, self.retMenu)
            })
        }else if(self.method.toUpperCase()==='POST'){
            console.log('Called post in restapi');
            let config= {headers:requestheaders,url:self.url};
            console.log('The config >>>'+JSON.stringify(config));
            resthandler.doPost(self.payload,config,function (error, responseBody) {
                console.log('actionFactory after execute >>>'+this.actionName +">>"+JSON.stringify(responseBody));
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


