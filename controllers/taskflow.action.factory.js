const plugins = require('../plugins');


function createActionFromPlugin(action, actionResults,memDb){
  let parentPlugin = plugins[action.inheritsPlugin];
  console.log('Executing action name >>'+action.actionName);
  /*
  * The class will have 2 methods initialize and execute
  *
  * */
  class PluginAction extends parentPlugin {
      constructor(action,actionResults,memoryDatabase) {
          super();
           this.actionName = action.actionName;
           this.actionResults = actionResults;
           this.memDb = memoryDatabase;
       }
    }
    //execute method will be in inherited parent
    let initFunc;
    const actionCode = `initFunc = ${action.code}`;
    eval(actionCode);
    PluginAction.prototype.initialize = initFunc;
    return new PluginAction(action,actionResults,memDb)
}

module["exports"] = {
    createFromPlugin : createActionFromPlugin
};


