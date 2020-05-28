"use strict";
const fs        = require("fs");
const path      = require("path");
const controllers      = {};
fs.readdirSync(__dirname)
    .filter(function(file) {
        const isEngineFile = file.indexOf('engine.') >= 0;
        return isEngineFile && (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        const controller = require(path.join(__dirname, file));
        controllers[controller.engineName] = controller;
    });

module.exports = controllers ;