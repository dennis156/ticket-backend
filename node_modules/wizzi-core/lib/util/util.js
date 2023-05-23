'use strict';

// Nodejs libs.
var nodeUtil = require('util');

// The module to be exported.
var util = module.exports = {};

// * Copyright (c) 2014 "Cowboy" Ben Alman
// * Licensed under the MIT license.
// Create a new Error object, with an origError property that will be dumped
// if wizzi was run with the --debug=9 option.
util.error = function (err, origError) {
    if (!nodeUtil.isError(err)) { err = new Error(err); }
    if (origError) { err.origError = origError; }
    return err;
};

