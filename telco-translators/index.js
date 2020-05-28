"use strict";
const fs        = require("fs");
const path      = require("path");
const controllers      = {};
fs.readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {      
        var controller = require(path.join(__dirname, file));
        controllers[controller.telco] = controller.actions; 
    });
module.exports = {
    translator: controllers
};