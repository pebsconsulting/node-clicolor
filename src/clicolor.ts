"use strict";

import { EMPTY_PEN, Format, Pen, PenDescription } from "./pen";
import { Span, span, Spans } from "./span";
import { spaces, StatusUpdater } from "./status";

const TAG = /<([^>]+)>/g;

const DEFAULT_STYLES = {
  dim: "888",
  timestamp: "0cc",
  warning: "f60",
  error: "c00"
};

export type Options = {
  width?: number,
  frequency?: number,
  useColor?: boolean,
  quiet?: boolean,
  styles?: { [key: string]: string },
};

export class CliColor {
  private _useColor: boolean;
  private _onTTY: boolean;
  private _quiet: boolean;
  private _updater: StatusUpdater;
  public styles: Map<string, string>;

  constructor(options: Options = {}) {
    // node stuffs an extra field on process.stdout without a real interface:
    this._useColor = false;
    this._onTTY = false;
    if (Object.keys(process.stdout.constructor.prototype).indexOf("isTTY") >= 0) {
      this._useColor = true;
      this._onTTY = true;
    }
    this._quiet = false;
    this._updater = new StatusUpdater({
      width: options.width || this.screenWidth(),
      frequency: options.frequency
    });
    if (options.useColor != null) this.useColor(options.useColor);
    if (options.quiet != null) this.quiet(options.quiet);

    this.styles = new Map();
    for (const k in DEFAULT_STYLES) this.styles.set(k, DEFAULT_STYLES[k]);
    if (options.styles) for (const k in options.styles) this.styles.set(k, options.styles[k]);
  }

  useColor(x: boolean): void {
    this._useColor = x;
  }

  quiet(x: boolean): void {
    this._quiet = x;
  }

  isColor(): boolean {
    return this._useColor;
  }

  isQuiet(): boolean {
    return this._quiet;
  }

  displayTo(stream: NodeJS.WritableStream, ...message: Spans): void {
    const clear = this._onTTY ? this._updater.clear() : "";
    const text = this.merge(...message).toString(this._useColor);
    stream.write(clear + text + "\n");
  }

  display(...message: Spans): void {
    this.displayTo(process.stdout, ...message);
  }

  displayVerbose(...message: Spans): void {
    if (!this._quiet) this.displayTo(process.stdout, ...message);
  }

  displayError(...message: Spans): void {
    const color = this.styles.get("error") || DEFAULT_STYLES.error;
    this.displayTo(process.stderr, this.color(color, "ERROR"), ": ", ...message);
  }

  displayWarning(...message: Spans): void {
    const color = this.styles.get("warning") || DEFAULT_STYLES.warning;
    this.displayTo(process.stderr, this.color(color, "WARNING"), ": ", ...message);
  }

  merge(...spans: Spans): Span {
    return span(EMPTY_PEN, ...spans);
  }

  color(colorName: string, ...spans: Spans): Span {
    colorName = this.styles.get(colorName) || colorName;
    return span(Pen.make({ color: colorName }), ...spans);
  }

  backgroundColor(colorName: string, ...spans: Spans): Span {
    colorName = this.styles.get(colorName) || colorName;
    return span(Pen.make({ backgroundColor: colorName }), ...spans);
  }

  underline(...spans: Spans): Span {
    return span(Pen.make({ underline: true }), ...spans);
  }

  screenWidth() {
    return (process && this._onTTY) ? (process.stdout as any).columns : 80;
  }

  status(...message: Spans): void {
    if (!this._onTTY || this._quiet) return;
    if (message.length == 0) {
      process.stdout.write(this._updater.clear());
      return;
    }
    process.stdout.write(this._updater.update(this.merge(...message).toString()));
  }

  padLeft(length: number, ...spans: Spans): Span {
    const s = this.merge(...spans);
    if (length > s.length) {
      return this.merge(spaces(length - s.length), ...spans);
    }
    return s;
  }

  padRight(length: number, ...spans: Spans): Span {
    const s = this.merge(...spans);
    if (length > span.length) {
      return this.merge(...spans, spaces(length - s.length));
    }
    return s;
  }

  format(descriptors: Format | { [key: string]: PenDescription }, s: string): Span {
    const penmap = (descriptors instanceof Map) ? descriptors : Pen.format(descriptors);
    const stack: { tag: string, index: number, buffer: Spans }[] = [];
    let lastIndex = 0;
    const deadItem = { tag: "", index: 0, buffer: [] };
    stack.push(deadItem);

    let m = TAG.exec(s);
    while (m != null) {
      const tag = m[1], index = m.index;
      if (index == 0 || s[index - 1] != "\\") {
        stack[stack.length - 1].buffer.push(s.slice(lastIndex, index));

        if (tag[0] == "/") {
          // end tag
          const start = stack.pop() || deadItem;
          if (start.tag == "") throw new Error(`Closed tag with no open tag (${tag} at ${index})`);
          if (start.tag != tag.slice(1)) {
            throw new Error(`Mismatched tags: ${start.tag} at ${start.index} vs ${tag} at ${index}`);
          }
          if (!penmap.has(start.tag)) throw new Error(`Unknown tag descriptor: ${start.tag} at ${start.index}`);
          const pen = penmap.get(start.tag) || EMPTY_PEN;
          stack[stack.length - 1].buffer.push(span(pen, ...start.buffer));
        } else {
          // start tag
          stack.push({ tag, index, buffer: [] });
        }

        lastIndex = index + m[0].length;
      }

      m = TAG.exec(s);
    }

    if (stack.length != 1) throw new Error(`Missing end tag for ${stack[stack.length - 1].tag}`);
    const start = stack.pop() || deadItem;
    start.buffer.push(s.slice(lastIndex));
    return span(EMPTY_PEN, ...start.buffer);
  }
}


export function clicolor(options: Options = {}): CliColor {
  return new CliColor(options);
}
