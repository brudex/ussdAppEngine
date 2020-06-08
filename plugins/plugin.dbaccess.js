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
        if(_.isEmpty(self.tableName)){
            return callback('Error: Table Name not specified')
        }
        if(_.isEmpty(self.query)) {
            return callback('Error: Invalid query')
        }

        if(_.isString(self.query)){
          db.sequelize.query(self.query,db.sequelize.QueryTypes.SELECT).then(function (result) {
              self.actionResponse  = result;
              self.retMenu = null;
              return callback(null,self.actionResponse,self.retMenu);
          })

        }else if(_.isObject(self.query)){
            db[self.tableName].query(self.query,db.sequelize.QueryTypes.SELECT).then(function (result) {
                self.actionResponse  = result;
                self.retMenu = null;
                return callback(null,self.actionResponse,self.retMenu);
            })
        }
    }
}

module.exports = {
    pluginName: "dbaccess",
    plugin: DbAccessPlugin
};


