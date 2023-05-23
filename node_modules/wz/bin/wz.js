#!/usr/bin/env node
// generator: wizzi-lab-artifatcs/lib/js/module/gen/main.js, utc time: Thu, 22 Oct 2015 21:00:41 GMT
var path = require('path');
var util = require('util');
var argv = require('minimist')(process.argv.slice(2));
var file = require('wizzi-core').file;
var log = require('wizzi-core').log(module);
var ProductionManager = require('wizzi-factory').ProductionManager;
var options = require('wizzi-factory').options;
show(process.env);
var cwd = process.cwd();
if (argv._.length > 0) {
    var wfjob = argv._[0];
    var wfjobPath = path.join(cwd, wfjob + '.wfjob.ittf');
    log.info('wfjobPath:', wfjobPath);
    if (file.exists(wfjobPath)) {
        executeProduction(wfjobPath);
    }
    else {
        log.error('wfjob document not found at ', wfjobPath);
    }
}
function show(env) {
    log.info('CLI OPTIONS:', argv);
    log.info('argv._:', argv._);
    log.info('argv._.length:', argv._.length);
    // log.info('Env:', env);
    // log.info('Process:', process);
    log.info('Process.cwd():', process.cwd());
}
function executeProduction(wfjobPath) {
    // create the ProductionManager
    var pman = new ProductionManager(options({
        indentSpaces: 4, 
        basedir: path.dirname(wfjobPath), 
        verbose: 2
    }));
    pman.addWfJob({
        options: {}, 
        wfjob: {
            src: wfjobPath
        }
    });
    pman.run(function(err, result) {
        if (err) {
            return log.error('Error running production: ' + util.inspect(err, { depth: null }));
        }
        log.success('run completed');
        pman.persistToFile(function(err, result) {
            if (err) {
                return log.error('Error persisting production to file: ' + util.inspect(err, { depth: null }));
            }
            log.success('persistToFile completed');
        });
    });
}
