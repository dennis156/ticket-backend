// The module to be exported.
var path = require('path');

var md = module.exports = {};

md.isDefined = function (test) {
    return !(typeof test === 'undefined');
}

md.isObject = function (test) {
    if (test === null || typeof test === 'undefined') return false;
    var getType = {};
    return getType.toString.call(test) === '[object Object]';
}

md.isArray = function (test) {
    if (test === null || typeof test === 'undefined') return false;
    var getType = {};
    return getType.toString.call(test) === '[object Array]';
}

md.isString = function (test) {
    return test !== null && typeof test === 'string'
}

md.isEmpty = function (test) {
    return test == null || typeof test !== 'string' || test.length == 0;
}

md.isNotEmpty = function (test) {
    return test != null && typeof test === 'string' && test.length > 0;
}

md.isNumber = function (test) {
    return !md.isArray(test) && (test - parseFloat(test) + 1) >= 0
}

// http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
md.isFunction = function (functionToCheck) {
    if (functionToCheck === null || typeof functionToCheck === 'undefined') return false;
    var getType = {};
    return getType.toString.call(functionToCheck) === '[object Function]';
}

md.isAbsolutePath = function (test) {
    return (path.resolve(test) == path.normalize(test));
}

// TODO verify.implementsInterface(test, iface) would be a lot better
md.isArtifact = function (test) {
    if (!md.isDefined(test)) return false;
    if (test === null) return false;
    if (!md.isFunction(test.generate)) return false;
    if (!md.isFunction(test.toFile)) return false;
    if (!md.isFunction(test.generateToFile)) return false;
    return true;
}

md.getInterfaceMessage = function () {
    return "generate(...), toFile(...), generateToFile(...)";
}

md.startsWith = function (str, prefix) {
    return str.indexOf(prefix) === 0;
}

md.endsWith = function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

md.unquote = function (str) {
    if (md.isString(str) === false) return str;
    if (str.length < 2) return str;
    if ((str.substr(0, 1) === "'" && str.substr(-1, 1) === "'") ||
        (str.substr(0, 1) === "\"" && str.substr(-1, 1) === "\""))
        return str.substr(1, str.length - 2);
    else
        return str;
}

md.capitalize = function (str) {
    if (md.isEmpty(str)) return str;
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}

/*
    Escape function (for node value)
*/
md.escape = function escape(value) {
    if (typeof value === 'undefined') return "null";
    else if (typeof value === 'string') {
        return "\"" + md.replaceAll(md.replaceAll(value, "\\", "\\\\"), '"', '\\"') + "\"";
    }
    else return value;
}
md.escapename = function escape(value) {
    if (typeof value === 'string') {
        return md.replaceAll(md.replaceAll(value, "\\", "\\\\"), '"', '\\"');
    }
    else return value;
}
md.replaceAll = function (string, find, replace) {
    if (typeof string === 'undefined' || string == null) return string;
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

/*
   Html escape
*/
md.htmlEscape = function escape(value) {
    if (md.isEmpty(value)) return value;
    value = md.replaceAll(value, '<', '&lt;');
    value = md.replaceAll(value, '>', '&gt;');
    return value;
}
