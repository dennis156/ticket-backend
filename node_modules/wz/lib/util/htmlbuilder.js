// generator: wizzi-lab-artifatcs/lib/js/module/gen/main.js, utc time: Thu, 15 Oct 2015 19:03:47 GMT
var md = module.exports = {};
var WAIT_ATTR = 1;
var WAIT_TEXT = 2;
// HtmlBuilder class
HtmlBuilder = function() {
    this.stm = [];
    this.indentValue = 0;
    this.length = 0;
    this.line = '';
    this.state = WAIT_TEXT;
    this.lfPending = false;
    this.noLF = false;
}
HtmlBuilder.prototype.setNoLF = function(value) {
    this.noLF = value;
}
HtmlBuilder.prototype.openTag = function(tag, options) {
    options = options || {};
    if (this.state === WAIT_ATTR) {
        this.write('>');
    }
    if (options.inline) {
        this.write('<' + tag);
    }
    else {
        if (this.lfPending) {
            this.w();
        }
        this.write('<' + tag);
        this.indent();
    }
    this.state = WAIT_ATTR;
}
HtmlBuilder.prototype.writeAttribute = function(name, value) {
    if (value === null || typeof value === 'undefined') {
        this.write(' ' + name);
    }
    else {
        this.write(' ' + name + '="' + value + '"');
    }
}
HtmlBuilder.prototype.writeText = function(text) {
    if ((text || '').length > 0) {
        if (this.state === WAIT_ATTR) {
            this.write('>');
            this.state = WAIT_TEXT;
        }
        this.write(text);
    }
}
HtmlBuilder.prototype.writePrettySpaces = function(num) {
    this.openTag('span', { inline: true });
    this.writeAttribute('class', 'pnl');
    this.writeSpaces(num);
    this.closeTag('span', { inline: true });
}
HtmlBuilder.prototype.writePrettySpan = function(text, clazz) {
    this.openTag('span', { inline: true });
    this.writeAttribute('class', clazz);
    this.writeText(text);
    this.closeTag('span', { inline: true });
}
HtmlBuilder.prototype.writeSpaces = function(num) {
    this.writeText(spaces(num));
}
HtmlBuilder.prototype.closeTag = function(tag, options) {
    options = options || {};
    if (options.inline) {
        if (this.state === WAIT_ATTR) {
            this.write(' />');
        }
        else {
            this.write('</' + tag + '>');
        }
    }
    else {
        if (this.state === WAIT_ATTR) {
            this.write(' />');
            this.lfPending = true;
        }
        else {
            this.w();
            this.deindent();
            this.w('</' + tag + '>');
        }
    }
    this.state = WAIT_TEXT;
}
HtmlBuilder.prototype.w = function(text) {
    if (this.noLF) {
        this.write(text);
        return ;
    }
    var ind = spaces(this.indentValue * 4);
    this.stm.push(ind + this.line + (text || ''));
    this.line = '';
    this.length++;
}
HtmlBuilder.prototype.write = function(text) {
    this.line += text || '';
}
HtmlBuilder.prototype.indent = function() {
    this.indentValue++;
}
HtmlBuilder.prototype.deindent = function() {
    this.indentValue = Math.max(0, this.indentValue -1);
}
HtmlBuilder.prototype.toLines = function() {
    return this.stm;
}
HtmlBuilder.prototype.toText = function() {
    if (this.line.length > 0) {
        this.w();
    }
    return this.stm.join('\n');
}

function spaces(num) {
    return Array(num + 1).join(" ");
}
md.HtmlBuilder = HtmlBuilder;
