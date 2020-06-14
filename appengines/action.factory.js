const async = require('async');
const logger = require("../logger");
const plugins = require('../plugins');
const GetMemoryDbStore = require('../controllers/memorystore.controller').GetMemoryDbStore;


function createActionFromPlugin(action,menu, inRequest, session, actionResults){
  let parentPlugin = plugins[action.inheritsPlugin];
  console.log('Executing action name >>'+action.actionName);
   /*
  * The class will have 2 methods initialize and execute
  * You can override menu response by setting this.headerText, this.displayText, this.footerText
  * */
  class PluginAction extends parentPlugin {
      constructor(menu,inRequest,session,actionResults,action) {
          super();
          this.menu = menu;
          this.session = session;
          this.inRequest = inRequest;
          this.actionName = action.actionName;
          this.actionResults = actionResults;
          this.memDb = GetMemoryDbStore(session.appId);
       }
    }
    //execute method will be in inherited parent
    let initFunc;
    const actionCode = `initFunc = ${action.code}`;
    eval(actionCode);
    PluginAction.prototype.initialize = initFunc;
    return new PluginAction(menu, inRequest, session, actionResults,action)
}



module["exports"] = {
    createFromPlugin : createActionFromPlugin
};


