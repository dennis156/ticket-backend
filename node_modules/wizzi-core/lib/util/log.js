'use strict'

var util = require('util');
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');

var fileLoggingEnabled = false;

function buildMessage(color, args) {
    if (typeof args !== 'object') return '';
    var msg = '';
    for (var i = 0; i < args.length; i++) {
        if (args[i]) msg += ' ' + util.inspect(args[i]);
    }
    return color(msg);
}

var MyLogger = function (level, stream) {
    this.level = level;
    this.stream = stream || process.stdout;
}
MyLogger.prototype.info = function (id, level, text) {
    // console.log('MyLogger', text);
    var date = new Date;
    var seconds = date.getSeconds();
    var minutes = date.getMinutes();
    var hour = date.getHours();
    this.stream.write(
        hour + ':' + minutes + ':' + seconds + ' ' +
        id +
        ' ' +
        level +
        ' ' +
        text +
        '\n'
    );
}

var Log = function (id, logger) {
    this.id = id;
    this.logger = logger;
    // level 2 all
    // level 1 errors and warning
    // level 0 only errors
    this.level = 2;
}

Log.prototype.setLevel = function (level) {
    this.level = level;
}

Log.prototype.info = function () {
    if (this.level > 1) this.logger.info(this.id, "INFO", buildMessage(chalk.white, arguments));
}

Log.prototype.warn = function () {
    if (this.level > 0) this.logger.info(
        this.id, "WARNING", buildMessage(chalk.yellow, arguments)
        );
}

Log.prototype.error = function () {
    this.logger.info(
        this.id, "ERROR", buildMessage(chalk.red, arguments)
        );
}

Log.prototype.success = function () {
    if (this.level > 1) this.logger.info(
        this.id, "SUCCESS", buildMessage(chalk.green, arguments)
        );
}

var consoleLogger = new MyLogger('debug');

var fileLoggers = {};
function getFileLogger(filename) {
    var dirname = path.dirname(filename);
    if (fileLoggers[dirname]) return fileLoggers[dirname].logger;
    var logfile = path.join(dirname, 'debug.log');
    console.log('creating debug.log for: ', filename.substr(filename.length - 50));
    var stream = fs.createWriteStream(logfile);
    var logger = new MyLogger('debug', stream);
    fileLoggers[dirname] = { logger: logger, stream: stream };
    logFlushSetup();
    return logger;
}

var logFlush_setup = false;

function logFlushSetup(stream) {
    if (logFlush_setup) return;
    logFlush_setup = true;
    var logFlush_flushed = false;
    function exitHandler() {
        if (!logFlush_flushed) {
            for (var k in fileLoggers) {
                fileLoggers[k].stream.end();
                console.log("log. flushed : " + k.substr(k.length - 50))
            };
            logFlush_flushed = true;
        }
        process.exit();
    }
    process.on('exit', function (err) {
        console.log('util.log. Process.exit', err);
        exitHandler();
    });
    process.on('SIGINT', function (err) { //catches ctrl+c event
        console.log('util.log. Received Signal', err);
        exitHandler();
    }); 
    process.on('uncaughtException', function (err) { //catches uncaught exceptions
        console.error("util.log. " + (new Date).toUTCString() + ' uncaughtException:', err.message)
        console.error(err.stack)
        exitHandler();
    }); 
}

module.exports = function (module, options) {
    options = options || {};
    var logger;
    if (fileLoggingEnabled && options.tofile) {
        logger = getFileLogger(module.filename);
    } else {
        logger = consoleLogger;
    }
    return new Log(path.basename(module.filename), logger);
}