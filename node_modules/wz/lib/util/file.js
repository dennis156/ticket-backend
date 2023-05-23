/*
 * wizzi
 * http://wizzijs.com/
 *
 * Copyright (c) 2015 "Tremal-nike" Stefano Bassoli
 * Licensed under the MIT license.
 * https://github.com/wizzijs/wizzi/blob/master/LICENSE-MIT
 */

// Node libs
var fs = require('fs');
var path = require('path');

// External libs
var _ = require('lodash');
var iconv = require('iconv-lite');
var glob = require('glob');

// Wizzi libs
var util = require('./util');
var verify = require('./verify');

// The module to be exported.
var md = module.exports = {};

var pathSeparatorRe = /[\/\\]/g;

// * Copyright (c) 2014 "Cowboy" Ben Alman
// * Licensed under the MIT license.
// The default file encoding to use.
md.defaultEncoding = 'utf8';
// Whether to preserve the BOM on md.read rather than strip it.
md.preserveBOM = false;
// Windows?
var win32 = process.platform === 'win32';
// Normalize \\ paths to / paths.
md.unixifyPath = function (filepath) {
    if (win32) {
        return filepath.replace(/\\/g, '/');
    } else {
        return filepath;
    }
};
// Read a file, return its contents.
md.read = function (filepath, options) {
    if (!options) { options = {}; }
    var contents;
    // grunt.verbose.write('Reading ' + filepath + '...');
    //try {
        contents = fs.readFileSync(String(filepath));
        // If encoding is not explicitly null, convert from encoded buffer to a
        // string. If no encoding was specified, use the default.
        if (options.encoding !== null) {
            contents = iconv.decode(contents, options.encoding || md.defaultEncoding);
            // Strip any BOM that might exist.
            if (!md.preserveBOM && contents.charCodeAt(0) === 0xFEFF) {
                contents = contents.substring(1);
            }
        }
        // grunt.verbose.ok();
        return contents;
    //} catch (e) {
    //    // grunt.verbose.error();
    //    console.log(e);
    //    throw util.error('Unable to read "' + filepath + '" file (Error code: ' + e.code + ').', e);
    //}
};

// * Copyright (c) 2014 "Cowboy" Ben Alman
// * Licensed under the MIT license.
// Read a file, parse its contents, return an object.
md.readJSON = function (filepath, options) {
    var src = md.read(filepath, options);
    var result;
    // grunt.verbose.write('Parsing ' + filepath + '...');
    try {
        result = JSON.parse(src);
        // grunt.verbose.ok();
        return result;
    } catch (e) {
        // grunt.verbose.error();
        throw util.error('Unable to parse "' + filepath + '" file (' + e.message + ').', e);
    }
};

md.readFile = function (filepath, cb) {
    fs.readFile(filepath, function (err, data) {
        if (err) cb(err);
        cb(null, data);
    });
}

md.readLines = function (filepath, options) {
    var contents = md.read(filepath, options);
    return md.splitLines(contents);
}

md.splitLines = function (contents) {
    var i,
        l = contents.length,
        result = [],
        line = [],
        ch,
        chprev;

    for (i = 0; i < l; i++) {
        chprev = ch;
        ch = contents[i];
        if ((ch === '\n' && chprev !== '\r') ||
            (ch === '\r' && chprev !== '\n')) {
            result.push(line.join(''));
            line = [];
        } else if ((ch === '\n' && chprev === '\r') ||
            (ch === '\r' && chprev === '\n')) {
        } else {
            line.push(ch);
        }
    }

    if (line.length > 0) result.push(line.join(''));
    //console.log('splitLines', contents, result.join('\n'));
    return result;
}

md.openWrite = function (filepath, cb) {
    if (md.exists(filepath)) {
        fs.unlink(filepath, function (err) {
            if (err) throw err;
            stream = fs.createWriteStream(filepath);
            cb(null, stream);
        });
    } else {
        md.mkpath(filepath);
        stream = fs.createWriteStream(filepath);
        cb(null, stream);
    }
}

// Write a md.
md.write = function (filepath, contents, options) {
    if (!options) { options = {}; }
    // Create path, if necessary.
    md.mkpath(filepath);
    try {
        // If contents is already a Buffer, don't try to encode it. If no encoding
        // was specified, use the default.
        if (!Buffer.isBuffer(contents)) {
            contents = iconv.encode(contents, options.encoding || md.defaultEncoding);
        }
        // Actually write md.
        fs.writeFileSync(filepath, contents);
        return true;
    } catch (ex) {
        ex.message = 'Writing file ' + filepath + '.\n' + ex.message;
        throw ex;
        //  throw util.error('Unable to write "' + filepath + '" file (Error code: ' + e.code + ').', e);
    }
};

md.mkpath = function(filepath) {
    var dir = path.dirname(filepath);
    md.mkdir(dir);
}

// * Copyright (c) 2014 "Cowboy" Ben Alman
// * Licensed under the MIT license.
// Like mkdir -p. Create a directory and any intermediary directories.
md.mkdir = function (dirpath, mode) {
    // if (grunt.option('no-write')) { return; }
    // Set directory mode in a strict-mode-friendly way.
    if (mode == null) {
        mode = parseInt('0777', 8) & (~process.umask());
    }
    dirpath.split(pathSeparatorRe).reduce(function (parts, part) {
        parts += part + '/';
        var subpath = path.resolve(parts);
        if (!md.exists(subpath)) {
            try {
                fs.mkdirSync(subpath, mode);
            } catch (e) {
                throw util.error('Unable to create directory "' + subpath + '" (Error code: ' + e.code + ').', e);
            }
        }
        return parts;
    }, '');
};


md.copy = function (src, dest) {
    md.mkpath(dest);
    var srcStream = fs.createReadStream(src);
    var destStream = fs.createWriteStream(dest);
    srcStream.pipe(destStream);
}

md.getFiles = function (path_string) {
    if (md.isDirectory(path_string)) {
        var files = [];
        var relPath = [];
        md._appendFiles(path_string, files, relPath);
        return files;
    } else if (md.exists(path_string)) {
        return [path_string];
    } else {
        return [];
    }
}
md._appendFiles = function (path_string, files, relPath) {
    var dir = fs.readdirSync(path_string); // No check must exists or bug
    dir.forEach(function (item) {
        var filePath = path.join(path_string, item);
        if (md.isDirectory(filePath)) {
            var newRelPath = relPath.slice(0);
            newRelPath.push(item);
            md._appendFiles(filePath, files, newRelPath);
        } else {
            files.push(path.join(relPath.join('/'), item));
        }
    });
}

md.getGlobbedFiles = function (globPatterns, removeRoot) {
    // For context switching
    var _this = this;

    // URL paths regex
    var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    var output = [];

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob 
    if (verify.isArray(globPatterns)) {
        globPatterns.forEach(function (globPattern) {
            output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
        });
    } else if (verify.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            var files = glob.sync(globPatterns);
            console.log('globPatterns ', globPatterns, 'files', files.length);
            if (removeRoot) {
                files = files.map(function (file) {
                    if (_.isArray(removeRoot)) {
                        for (var i in removeRoot) {
                            file = file.replace(removeRoot[i], '');
                        }
                    }
                    else {
                        file = file.replace(removeRoot, '');
                    }
                    return file;
                });
            }
            output = _.union(output, files);
        }
    }

    return output;
};

md.exists = function (filepath) {
    return verify.isString(filepath) ? fs.existsSync(filepath) : false;
};

// http://stackoverflow.com/questions/15630770/node-js-check-if-path-is-file-or-directory
md.isDirectory = function (path_string) {
    try
    {
        return fs.lstatSync(path_string).isDirectory()
    } catch (ex) { }
    return false;
}

md.isFile = function (path_string) {
    try {
        return fs.lstatSync(path_string).isFile()
    } catch (ex) { }
    return false;
}

md.delete = function (filepath, callback) {
    if (!md.exists(filepath)) {
        if (callback) callback(null, null);
        return;
    }
    fs.unlink(filepath, function (err) {
        if (err) {
            if (callback) callback(err);
            else throw new Error(err);
        }
        else
            if (callback) callback(null, null);
    });
}




