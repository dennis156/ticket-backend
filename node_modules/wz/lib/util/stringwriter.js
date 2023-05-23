'use strict';

var StringWriter = function (text) {
    this.buffer = [];
    if (text) this.buffer.push(text);
}

StringWriter.prototype.write = function (text) {
    this.buffer.push(text);
}

StringWriter.prototype.toString = function () {
    return this.buffer.join('');
}

module.exports = StringWriter;