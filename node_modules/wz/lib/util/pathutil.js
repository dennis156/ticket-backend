'use strict';
var util = require('util');
var path = require('path');
var url = require('url');
var verify = require('./verify');

var md = module.exports = {};

md.isFilePath = function (path) {
    if (verify.isString(path)) {
        var protocol = _protocol(url.parse(path).protocol)
        return protocol.length === 1 || protocol === 'file';
    }
    return false;
}

function _protocol(value) {
    return value.substr(-1, 1) === ':'
        ? value.substr(0, value.length - 1)
        : value;
}