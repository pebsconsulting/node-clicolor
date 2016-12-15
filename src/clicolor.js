"use strict";
var pen_1 = require("./pen");
var span_1 = require("./span");
var status_1 = require("./status");
var TAG = /<([^>]+)>/g;
var DEFAULT_STYLES = {
    dim: "888",
    timestamp: "0cc",
    warning: "f60",
    error: "c00"
};
var CliColor = (function () {
    function CliColor(options) {
        if (options === void 0) { options = {}; }
        this._useColor = false;
        this._onTTY = false;
        if (Object.keys(process.stdout.constructor.prototype).indexOf("isTTY") >= 0) {
            this._useColor = true;
            this._onTTY = true;
        }
        this._quiet = false;
        this._updater = new status_1.StatusUpdater({
            width: options.width || this.screenWidth(),
            frequency: options.frequency
        });
        if (options.useColor != null)
            this.useColor(options.useColor);
        if (options.quiet != null)
            this.quiet(options.quiet);
        this.styles = new Map();
        for (var k in DEFAULT_STYLES)
            this.styles.set(k, DEFAULT_STYLES[k]);
        for (var k in (options.styles || {}))
            this.styles.set(k, options.styles[k]);
    }
    CliColor.prototype.useColor = function (x) {
        this._useColor = x;
    };
    CliColor.prototype.quiet = function (x) {
        this._quiet = x;
    };
    CliColor.prototype.isColor = function () {
        return this._useColor;
    };
    CliColor.prototype.isQuiet = function () {
        return this._quiet;
    };
    CliColor.prototype.displayTo = function (stream) {
        var message = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            message[_i - 1] = arguments[_i];
        }
        var clear = this._onTTY ? this._updater.clear() : "";
        var text = this.merge.apply(this, message).toString();
        stream.write(clear + text + "\n");
    };
    CliColor.prototype.display = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        this.displayTo.apply(this, [process.stdout].concat(message));
    };
    CliColor.prototype.displayVerbose = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        if (!this._quiet)
            this.displayTo.apply(this, [process.stdout].concat(message));
    };
    CliColor.prototype.displayError = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        this.displayTo.apply(this, [process.stderr, this.color(this.styles.get("error"), "ERROR"), ": "].concat(message));
    };
    CliColor.prototype.displayWarning = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        this.displayTo.apply(this, [process.stderr, this.color(this.styles.get("warning"), "WARNING"), ": "].concat(message));
    };
    CliColor.prototype.merge = function () {
        var spans = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            spans[_i - 0] = arguments[_i];
        }
        return span_1.span.apply(void 0, [pen_1.EMPTY_PEN].concat(spans));
    };
    CliColor.prototype.color = function (colorName) {
        var spans = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            spans[_i - 1] = arguments[_i];
        }
        if (this.styles.has(colorName))
            colorName = this.styles.get(colorName);
        return span_1.span.apply(void 0, [pen_1.Pen.make({ color: colorName })].concat(spans));
    };
    CliColor.prototype.backgroundColor = function (colorName) {
        var spans = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            spans[_i - 1] = arguments[_i];
        }
        if (this.styles.has(colorName))
            colorName = this.styles.get(colorName);
        return span_1.span.apply(void 0, [pen_1.Pen.make({ backgroundColor: colorName })].concat(spans));
    };
    CliColor.prototype.underline = function () {
        var spans = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            spans[_i - 0] = arguments[_i];
        }
        return span_1.span.apply(void 0, [pen_1.Pen.make({ underline: true })].concat(spans));
    };
    CliColor.prototype.screenWidth = function () {
        return (process && this._onTTY) ? process.stdout.columns : 80;
    };
    CliColor.prototype.status = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i - 0] = arguments[_i];
        }
        if (!this._onTTY || this._quiet)
            return;
        if (message.length == 0) {
            process.stdout.write(this._updater.clear());
            return;
        }
        process.stdout.write(this._updater.update(this.merge.apply(this, message).toString()));
    };
    CliColor.prototype.padLeft = function (length) {
        var spans = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            spans[_i - 1] = arguments[_i];
        }
        var s = this.merge.apply(this, spans);
        if (length > s.length) {
            return this.merge.apply(this, [status_1.spaces(length - s.length)].concat(spans));
        }
        return s;
    };
    CliColor.prototype.padRight = function (length) {
        var spans = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            spans[_i - 1] = arguments[_i];
        }
        var s = this.merge.apply(this, spans);
        if (length > span_1.span.length) {
            return this.merge.apply(this, spans.concat([status_1.spaces(length - s.length)]));
        }
        return s;
    };
    CliColor.prototype.format = function (descriptors, s) {
        var penmap = (descriptors instanceof Map) ? descriptors : pen_1.Pen.format(descriptors);
        var stack = [];
        var lastIndex = 0;
        stack.push({ tag: null, index: 0, buffer: [] });
        var m = TAG.exec(s);
        while (m != null) {
            var tag = m[1], index = m.index;
            if (index == 0 || s[index - 1] != "\\") {
                stack[stack.length - 1].buffer.push(s.slice(lastIndex, index));
                if (tag[0] == "/") {
                    var start_1 = stack.pop();
                    if (start_1.tag == null)
                        throw new Error("Closed tag with no open tag (" + tag + " at " + index + ")");
                    if (start_1.tag != tag.slice(1)) {
                        throw new Error("Mismatched tags: " + start_1.tag + " at " + start_1.index + " vs " + tag + " at " + index);
                    }
                    if (!penmap.has(start_1.tag))
                        throw new Error("Unknown tag descriptor: " + start_1.tag + " at " + start_1.index);
                    var pen = penmap.get(start_1.tag);
                    stack[stack.length - 1].buffer.push(span_1.span.apply(void 0, [pen].concat(start_1.buffer)));
                }
                else {
                    stack.push({ tag: tag, index: index, buffer: [] });
                }
                lastIndex = index + m[0].length;
            }
            m = TAG.exec(s);
        }
        if (stack.length != 1)
            throw new Error("Missing end tag for " + stack[stack.length - 1].tag);
        var start = stack.pop();
        start.buffer.push(s.slice(lastIndex));
        return span_1.span.apply(void 0, [pen_1.EMPTY_PEN].concat(start.buffer));
    };
    return CliColor;
}());
exports.CliColor = CliColor;
function clicolor(options) {
    if (options === void 0) { options = {}; }
    return new CliColor(options);
}
exports.clicolor = clicolor;
