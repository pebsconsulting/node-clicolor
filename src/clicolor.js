"use strict";

import antsy from "antsy";
import Span from "./span";
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
    this._plaintext = !process.stdout.isTTY;
    this._quiet = false;
    this._updater = new StatusUpdater({ width: this.screenWidth() });
  }

  useColor(x) {
    this._plaintext = !x;
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

  _span(options, ...spans) {
    options.plaintext = this._plaintext;
    return new Span(options, ...spans);
  }

  paint(...spans) {
    return this._span({}, ...spans);
  }

  color(colorName, ...spans) {
    return this._span({ color: colorName }, ...spans);
  }

  backgroundColor(colorName, ...spans) {
    return this._span({ backgroundColor: colorName }, ...spans);
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

  padLeft(count, ...spans) {
    const span = this._span({}, ...spans);
    if (count > span.length) {
      return this._span({}, spaces(count - span.length), ...spans);
    }
    return span;
  }

  padRight(count, ...spans) {
    const span = this._span({}, ...spans);
    if (count > span.length) {
      return this._span({}, ...spans, spaces(count - span.length));
    }
    return span;
  }

  format(formatters, ...spans) {
    if (!Array.isArray(formatters)) formatters = [ formatters ];
    const formattedSpans = formatters.map((formatter, i) => {
      let span = spans[i];
      const backgroundColor = formatter.bgColor || formatter.backgroundColor;
      if (formatter.backgroundColor || formatter.color) {
        span = this._span({
          color: formatter.color,
          backgroundColor: formatter.backgroundColor
        }, span);
      }
      if (formatter.padLeft) span = this.padLeft(formatter.padLeft, span);
      if (formatter.padRight) span = this.padRight(formatter.padRight, span);
      return span;
    });
    return this._span({}, ...formattedSpans);
  }
}

const TEN_SPACES = "          ";
function spaces(n) {
  return (n <= 10) ? TEN_SPACES.slice(0, n) : TEN_SPACES + spaces(n - 10);
}

export const clicolor = () => new CliColor();
