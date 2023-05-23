var md = module.exports = {};

md.NodeError = function (message, node) {
    return new md.__NodeError(message, node);
}

md.__NodeError = function (message, node) {
    this.message = message;
    this.node = node;
}

md.__NodeError.prototype.toString = function () {
    var msg = [this.message];
    if (this.node) {
        if (this.node.WmtSourceLineInfo) {
            var info = this.node.WmtSourceLineInfo;
            msg.push(' at row: ' + info.row);
            msg.push(', col: ' + info.col);
            msg.push(', source: ' + info.source);
            msg.push(', in file: ' + 'TODO'); // util.node.getSource(info)
        } else if (this.node.wzSourceLineInfo) {
            var info = this.node.wzSourceLineInfo;
            // console.log('util.error.info', info);
            msg.push(' at row: ' + info.row);
            msg.push(', col: ' + info.col);
            msg.push(', source: ' + info.sourceKey);
            msg.push(', in file: ' + 'TODO'); // util.node.getSource(info)
        }
    }
    return msg.join('');
}

// TODO
md.error = function (message, node) {
    throw new md.__NodeError(message, node);
}


