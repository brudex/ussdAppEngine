const loki = require('lokijs');
const MemoryDbStore ={};

function GetMemoryDbStore(appId) {
    if(MemoryDbStore[appId]){
        return MemoryDbStore[appId]
    }
    let memoryDb = new MemoryDb(appId);
    MemoryDbStore[appId] = memoryDb;
    return memoryDb;
}


function MemoryDb(appId){
    const self = this;
    const memDb = new loki(`${appId}.db`);
    self.collections = {};

    self.addCollection = function(collectionName){
        if(collectionName==='default'){
            return;
        }
        self.collections[collectionName] = memDb.addCollection(collectionName);
    };

    self.insert = function (collectionName, value) {
        if(self.collections[collectionName]){
            self.collections[collectionName].insert(value);
            return true;
        }
        return false;
    };
    self.saveObject = function (key, obj) {
        let row = self.collections['default'].findOne({'key': key});
        if(row){
            row.data=obj;
            self.collections['default'].update(row);
        }else{

            self.collections['default'].insert({key:key,data:obj})
        }
    };
    self.getObject = function (key) {
       let row = self.collections['default'].findOne({'key': key});
       if(row){
           return row.data;
       }
       return null;
    };
    self.collections['default'] = memDb.addCollection('default');

}

module.exports = {
    MemoryDb,
    GetMemoryDbStore
};
