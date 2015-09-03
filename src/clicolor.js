"use strict";

import antsy from "antsy";
import StatusUpdater from "./status";
import { magnitude } from "./magnitude";


export const STYLES = {
  dim: "888",
  timestamp: "0cc",
  error: "c00",
  warning: "f60"
};

class CliColor {
  constructor() {
    this._useColor = process.stdout.isTTY;
    this._quiet = false;
    this._updater = new StatusUpdater({ width: this.screenWidth() });
  }

  useColor(x) {
    this._useColor = x;
  }

  quiet(x) {
    this._quiet = x;
  }

  display(...message) {
    const clear = process.stdout.isTTY ? this._updater.clear() : "";
    const text = (message.length == 1 ? message[0] : this.paint(...message)).toString();
    process.stdout.write(clear + text + "\n");
  }

  displayVerbose(...message) {
    const clear = process.stdout.isTTY ? this._updater.clear() : "";
    const text = (message.length == 1 ? message[0] : this.paint(...message)).toString();
    if (!this._quiet) process.stdout.write(clear + text + "\n");
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

  screenWidth() {
    return (process && process.stdout.isTTY) ? process.stdout.columns : 80;
  }

  toMagnitude(number, base = 1000.0) {
    return magnitude(number, base);
  }

  status(message) {
    if (!process.stdout.isTTY || this._quiet) return;
    process.stdout.write((message && message != "") ? this._updater.update(message) : this._updater.clear());
  }

  backgroundColor(colorName, ...spans) {
    return new Span("bg:" + colorName, spans, this._useColor);
  }

  bgColor(colorName, ...spans) {
    return this.backgroundColor(colorName, ...spans);
  }

  padLeft(count, ...spans) {
    const span = new Span(null, spans, this._useColor);
    const len = span.length;
    if (count > len) {
      span.spans.unshift(spaces(count - len));
    }
    return span;
  }
}

const TEN_SPACES = "          ";
function spaces(n) {
  return (n <= 10) ? TEN_SPACES.slice(0, n) : TEN_SPACES + spaces(n - 10);
}

class Span {
  constructor(color, spans, _useColor) {
    this.color = color;
    this.spans = spans;
    this._useColor = _useColor;
  }

  get length() {
    return this.spans.map(s => s.length).reduce((a, b) => a + b);
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
          let colorName = this.color;
          const match = this.color.match(/^bg:(.*)$/);
          if (match) {
            colorName = match[1];
            const c = antsy.get_color(STYLES[colorName] ? STYLES[colorName] : colorName);
            escOn = (c < 8) ? `\u001b[4${c}m` : `\u001b[48;5;${c}m`;
            escOff = `\u001b[49m`;
          } else {
            const c = antsy.get_color(STYLES[colorName] ? STYLES[colorName] : colorName);
            escOn = (c < 8) ? `\u001b[3${c}m` : `\u001b[38;5;${c}m`;
            escOff = `\u001b[39m`;
          }
          break;
      }
    }
    return escOn + this.spans.map(span => span.toString()).join(escOn) + escOff;
  }
}

export const clicolor = () => new CliColor();
