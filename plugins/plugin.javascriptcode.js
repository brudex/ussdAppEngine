const async = require('async');
const _ = require('lodash');
 const logger = require("../logger");
const menuController = require('../controllers/menu.controller');

/**available methods include
*available fields
*self.menu.headerText, self.menu.displayText, self the menu.footerText
*terminate(), goto(menuId)
*/
 function JavascriptCodePlugin(utilsFile){
    const self = this;
    self.err = null;
    self.actionResponse=null;
    self.retMenu = null;
    const utils = {};
    utils._ = _;
    utils.logger= logger;


    function goto(userDefinedMenuName){
        menuController.getMenuByUniqueId(self.menu.appId,userDefinedMenuName,function (retMenu) {
            self.retMenu = retMenu;
        })
    }

    function terminate(){
        self.menu.terminate = true;
    }

    this.execute = function(callback){
        console.log('actionFactory result after execute >>>'+this.actionName +">>"+JSON.stringify(this.menu));
        callback(self.err, self.actionResponse, self.retMenu)
    }
}

module.exports = {
    pluginName: "javascript",
    plugin: JavascriptCodePlugin
};


