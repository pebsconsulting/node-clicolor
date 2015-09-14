"use strict";

import Span from "./span";
import StatusUpdater from "./status";
import { magnitude } from "./magnitude";


const DEFAULT_STYLES = {
  dim: "888",
  timestamp: "0cc",
  warning: "f60",
  error: "c00"
};

class CliColor {
  constructor(options = {}) {
    this._plaintext = !process.stdout.isTTY;
    this._quiet = false;
    this._updater = new StatusUpdater({
      width: options.width || this.screenWidth(),
      frequency: options.frequency
    });
    if (options.useColor != null) this.useColor(options.useColor);
    if (options.quiet != null) this.quiet(options.quiet);

    this.styles = {};
    for (let k in DEFAULT_STYLES) this.styles[k] = DEFAULT_STYLES[k];
    for (let k in (options.styles || {})) this.styles[k] = options.styles[k];
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
    this.display(this.color(this.styles.error, "ERROR"), ": ", ...message);
  }

  displayWarning(...message) {
    this.display(this.color(this.styles.warning, "WARNING"), ": ", ...message);
  }

  _span(options, ...spans) {
    options.plaintext = this._plaintext;
    return new Span(options, ...spans);
  }

  paint(...spans) {
    return this._span({}, ...spans);
  }

  color(colorName, ...spans) {
    if (this.styles[colorName]) colorName = this.styles[colorName];
    return this._span({ color: colorName }, ...spans);
  }

  backgroundColor(colorName, ...spans) {
    if (this.styles[colorName]) colorName = this.styles[colorName];
    return this._span({ backgroundColor: colorName }, ...spans);
  }

  underline(...spans) {
    return this._span({ underline: true }, ...spans);
  }

  screenWidth() {
    return (process && process.stdout.isTTY) ? process.stdout.columns : 80;
  }

  toMagnitude(number, base = 1000.0) {
    return magnitude(number, base);
  }

  status(...message) {
    if (!process.stdout.isTTY || this._quiet) return;
    if (message.length == 0) {
      this._updater.clear();
      return;
    }
    process.stdout.write(this._updater.update(this.paint(...message)));
  }

  padLeft(length, ...spans) {
    const span = this._span({}, ...spans);
    if (length > span.length) {
      return this._span({}, spaces(length - span.length), ...spans);
    }
    return span;
  }

  padRight(length, ...spans) {
    const span = this._span({}, ...spans);
    if (length > span.length) {
      return this._span({}, ...spans, spaces(length - span.length));
    }
    return span;
  }

  format(formatters, ...spans) {
    if (!Array.isArray(formatters)) formatters = [ formatters ];
    const formattedSpans = formatters.map((formatter, i) => {
      let span = spans[i];
      if (Array.isArray(span)) span = this.paint(...span);
      if (formatter.color) span = this.color(formatter.color, span);
      if (formatter.backgroundColor) span = this.backgroundColor(formatter.backgroundColor, span);
      if (formatter.underline) span = this.underline(span);
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

const clicolor = options => new CliColor(options);
export default clicolor;
