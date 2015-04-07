"use strict";

const antsy = require("antsy");

class CliColor {
  constructor() {
    this._useColor = process.stdout.isTTY;
    this._quiet = false;
  }

  useColor(x) {
    this._useColor = x;
  }

  quiet(x) {
    this._quiet = x;
  }

  display(...message) {
    const text = (message.length == 1 ? message[0] : this.paint(...message)).toString();
    process.stdout.write(text + "\n");
  }

  displayNotice(...message) {
    const text = (message.length == 1 ? message[0] : this.paint(...message)).toString();
    if (!this._quiet) process.stderr.write(text + "\n");
  }

  displayError(...message) {
    this.display(this.color(STYLES.error, "ERROR"), ": ", ...message);
  }

  displayWarning(...message) {
    this.display(this.color(STYLES.warning, "WARNING"), ": ", ...message);
  }

  paint(...spans) {
    return new Span(null, spans, this._useColor);
  }

  color(colorName, ...spans) {
    return new Span(colorName, spans, this._useColor);
  }
}


const STYLES = {
  dim: "888",
  timestamp: "0cc",
  error: "c00",
  warning: "f60"
};


class Span {
  constructor(color, spans, _useColor) {
    this.color = color;
    this.spans = spans;
    this._useColor = _useColor;
  }

  toString() {
    let escOn = "", escOff = "";
    if (this.color && this._useColor) {
      switch (this.color) {
        case "underline":
          escOn = "\u001b[4m";
          escOff = "\u001b[24m";
          break;
        default:
          const c = antsy.get_color(STYLES[this.color] != null ? STYLES[this.color] : this.color);
          escOn = "\u001b[38;5;" + c + "m";
          escOff = "\u001b[39m";
      }
    }
    return escOn + this.spans.map((span) => span.toString()).join(escOn) + escOff;
  }
}


exports.cli = () => new CliColor();

// allow the styles to be changed:
exports.STYLES = STYLES;
