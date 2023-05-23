var error = require('./error');
var verify = require('./verify');

var md = module.exports = {};

md.parse = function (text, node) {
    if (!verify.isString(text)) return { tokens: [], join: function () { return ''; } };
    var ch,
        l = text.length,
        tokens = [],
        token = { quote: null, text: '', raw: ''};
    for (var i = 0; i < l; i++) {
        ch = text[i];
        if (token.quote != null) {
            if (ch == token.quote) {
                tokens.push(token);
                token = { quote: null, text: '', raw: '' };
            } else {
                token.text += ch;
                token.raw += ch;
            }
        } else if (ch == '"' || ch == '\'') {
            if (token.text.length > 0 && node) error.error("Invalid use of quote inside text", node);
            token.quote = ch;
        } else if (['(', ')', '[', ']', '{', '}'].indexOf(ch) > -1) {
            if (token.text.length > 0) { tokens.push(token); }
            tokens.push({ quote: null, text: ch, raw: ch });
            token = { quote: null, text: '', raw: '' };
        } else if (ch == ' ' || ch == '\t') {
            if (token.text.length > 0) {
                token.raw += ch;
                tokens.push(token);
                token = { quote: null, text: '', raw: '' };
            }
        } else {
            token.text += ch;
            token.raw += ch;
        }
    }
    if (token.text.length > 0) {
        tokens.push(token);
        token = { quote: null, text: '', raw: '' };
    }
    return {
        tokens: tokens,
        length: tokens.length,
        join: function (sep, start) {
            var t = [], startIndex = (start || 0);
            for (var i = startIndex; i < this.tokens.length; i++) {
                if (sep === 'forValue') {
                    var s = this.tokens[i].text;
                    if (['(', ')', '[', ']', '{', '}'].indexOf(s) > -1)
                        t.push(this.tokens[i].text);
                    else
                        t.push(this.tokens[i].text + ' ');
                } else {
                    t.push(this.tokens[i].text);
                }
            }
            if (sep === 'forValue') {
                return t.join('').trim();
            } else {
                return t.join(sep).trim();
            }
        },
        getByPos: function (pos) {
            return pos > this.length ? null : this.tokens[pos - 1];
        },
        matchByPos: function (pos, test) {
            return pos > this.length ? false : this.tokens[pos - 1].text === test;
        },
        name: function () {
            return this.length > 0 ? this.tokens[0].text : null;
        },
        value: function () {
            return this.join('forValue', 1);
        },
        nameValue: function () {
            var ret = { name: '', value: '' };
            if (this.tokens.length >= 2) {
                tk = this.tokens[0];
                ret.name = tk.text;
                for (var i = 1; i < this.tokens.length; i++) {
                    tk = this.tokens[i];
                    ret.value += (tk.quote || '');
                    ret.value += tk.raw;
                    ret.value += tk.quote || '';
                }
            }
            return ret;
        }
    };
}

md.parseInterpolation = function (text, node, handlebar, ng) {
    if (!verify.isString(text)) return { tokens: [], join: function () { return ''; } };

    var openMacro = ng ? '[' : '{';
    var closeMacro = ng ? ']' : '}';

    var ch,
        l = text.length,
        state = 0,
        tokens = [],
        token = { kind: 0, text: ''};

    for (var i = 0; i < l; i++) {
        ch = text[i];
        if (ch == openMacro) {
            if (state === 0) {
                state = 1; // could be a var begin
            } else if (state === 1) {
                // is a var begin
                if (token.text.length > 0) {
                    tokens.push(token);
                }
                token = { kind: 1, text: '' };
                state = 2;
            } else if (state === 2) {
                token.text += ch; // strange char in a var but go on
            } else if (state === 11) {
                token.text += closeMacro; // it was not a var end, restore
                state = 2;
            }
        } else if (ch == closeMacro) {
            if (state === 0) {
                token.text += ch; // go on
            } else if (state === 1) {
                token.text += openMacro; // it was not a var begin, restore
                state = 0;
            } else if (state === 2) {
                state = 11; // could be a var end
            } else if (state === 11) {
                // is a var end
                if (token.text.length > 0) {
                    tokens.push(token);
                }
                token = { kind: 0, text: '' };
                state = 0;
            }
        } else {
            if (state === 1) {
                token.text += openMacro; // it was not a var begin, restore
                state = 0;
            } else if (state === 11) {
                token.text += closeMacro; // it was not a var end, restore
                state = 2;
            }
            token.text += ch;
        }
    }
    if (token.text.length > 0) {
        tokens.push(token);
    }
    return {
        tokens: tokens,
        length: tokens.length,
        join: function () {
            var token, t = [];
            for (var i = 0; i < this.tokens.length; i++) {
                token = this.tokens[i];
                if (t.length > 0) t.push(' + ');
                if (token.kind === 0) {
                    t.push('"' + token.text + '"');
                } else {
                    if (handlebar) {
                        t.push('"{{ ' + token.text + '}}"');
                    } else {
                        t.push(token.text);
                    }
                }
            }
            return t.join('');
        }
    }
}

md.parseNameValue = function (text, node) {
    if (!verify.isString(text)) return { tokens: [], join: function () { return ''; } };
    var ch,
        l = text.length,
        tokens = [],
        token = { quote: null, text: '', raw: '' };
    for (var i = 0; i < l; i++) {
        ch = text[i];
        if (token.quote != null) {
            if (ch == token.quote) {
                tokens.push(token);
                token = { quote: null, text: '', raw: '' };
            } else {
                token.text += ch;
                token.raw += ch;
            }
        } else if (ch == '"' || ch == '\'') {
            if (token.text.length > 0 && node) error.error("Invalid use of quote inside text", node);
            token.quote = ch;
        } else if (ch == ' ' || ch == '\t') {
            if (token.text.length > 0) {
                token.raw += ch;
                tokens.push(token);
                token = { quote: null, text: '', raw: '' };
            }
        } else {
            token.text += ch;
            token.raw += ch;
        }
    }
    if (token.text.length > 0) {
        tokens.push(token);
        token = { quote: null, text: '', raw: '' };
    }
    return {
        tokens: tokens,
        length: tokens.length,
        join: function (sep, start) {
            var t = [], startIndex = (start || 0);
            for (var i = startIndex; i < this.tokens.length; i++) {
                t.push(this.tokens[i].text + ' ');
            }
            return t.join(sep).trim();
        },
        name: function () {
            return this.length > 0 ? this.tokens[0].text : null;
        },
        value: function () {
            return this.join('', 1);
        },
        hasValue: function () {
            return this.length > 1;
        }
    };
}

md.parseNameValueRaw = function (text, node) {
    var name = '', value = '';
    if (verify.isNotEmpty(text)) {
        var ch,
            state = 0,
            l = text.length;
        for (var i = 0; i < l; i++) {
            ch = text[i];
            if (ch == ' ' || ch == '\t') {
                if (state == 0)
                    ;
                else if (state == 1)
                    state = 2;
                else if (state == 2)
                    value += ch;
            } else {
                if (state == 0) {
                    name = ch;
                    state = 1;
                }
                else if (state == 1)
                    name += ch;
                else if (state == 2)
                    value += ch;
            }
        }
    }
    return {
        name: function () { return name; },
        value: function () { return value; },
        hasValue: function () { return value.length > 0; }
    };

}

