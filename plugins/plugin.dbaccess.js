const async = require('async');
const _ = require('lodash');
const db = require('../models');
const logger = require("../logger");
const menuController = require('../controllers/menu.controller');
const validationController = require('../controllers/validation.controller');

//todo implement plugin for dbaccess
function DbAccessPlugin(){

}

module.exports = {
    pluginName: "dbaccess",
    plugin: DbAccessPlugin
};


