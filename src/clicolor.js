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
    if (!this._quiet) process.stderr.write(clear + text + "\n");
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
    return magnitude.magnitude(number, base);
  }

  status(message) {
    if (!process.stdout.isTTY) return;
    process.stdout.write((message && message != "") ? this._updater.update(message) : this._updater.clear());
  }

  backgroundColor(colorName, ...spans) {
    return new Span("bg:" + colorName, spans, this._useColor);
  }

  bgColor(colorName, ...spans) {
    return this.backgroundColor(colorName, ...spans);
  }
}

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
          let colorName = this.color;
          const match = this.color.match(/^bg:(.*)$/);
          if (match) {
            colorName = match[1];
            const c = antsy.get_color(STYLES[colorName] ? STYLES[colorName] : colorName);
            escOn = `\u001b[48;5;${c}m`;
            escOff = `\u001b[49m`;
          } else {
            const c = antsy.get_color(STYLES[colorName] ? STYLES[colorName] : colorName);
            escOn = `\u001b[38;5;${c}m`;
            escOff = `\u001b[39m`;
          }
          break;
      }
    }
    return escOn + this.spans.map(span => span.toString()).join(escOn) + escOff;
  }
}

export const clicolor = () => new CliColor();
