const async = require('async');
const _ = require('lodash');
const db = require('../models');
const logger = require("../logger");
const menuController = require('../controllers/menu.controller');
const validationController = require('../controllers/validation.controller');

/**available methods include
 *available fields
 *self.menu.headerText, self.menu.displayText, self the menu.footerText
 *Methods : addHeader(key,value), addBasicAuthentication(userName,password),addJsonHeaders
 */
function DbAccessPlugin(){
    const self = this;
    self.err = null;
    self.actionResponse=null;
    self.retMenu = null;
    const utils = {};
    utils._ = _;
    utils.logger = logger;
    self.query = null;
    self.tableName = '';
    self.queryType = ''; //select,update, insert



    this.execute = function(callback){
        if(_.isObject(self.query) && _.isEmpty(self.tableName)){
            return callback('Error: Table Name not specified')
        }
        if(_.isEmpty(self.query)) {
            return callback('Error: Invalid query')
        }

        if(_.isString(self.query)){

            let qType =db.sequelize.QueryTypes.SELECT;
            switch (this.queryType)  {
                case "select":{
                    qType =db.sequelize.QueryTypes.SELECT;
                    break;
                }
                case "insert":{
                    qType =db.sequelize.QueryTypes.INSERT;
                    break;
                }
                case "update":{
                    qType =db.sequelize.QueryTypes.UPDATE;
                    break;
                }
            }

          db.sequelize.query(self.query,qType).then(function (result) {
              self.actionResponse  = result;
              self.retMenu = null;
              return callback(null,self.actionResponse,self.retMenu);
          })

        }else if(_.isObject(self.query)){
            switch (this.queryType)  {
                case "select":{
                   return  db[self.tableName].findAll(self.query).then(function (result) {
                        self.actionResponse  = result;
                        self.retMenu = null;
                        return callback(null,self.actionResponse,self.retMenu);
                    })

                }
                case "insert":{
                   return  db[self.tableName].create(self.query).then(function (result) {
                        self.actionResponse  = result;
                        self.retMenu = null;
                        return callback(null,self.actionResponse,self.retMenu);
                    });

                }
            }

        }
    }
}

module.exports = {
    pluginName: "dbaccess",
    plugin: DbAccessPlugin
};


