"use strict";

import antsy from "antsy";

export default class Span {
  /*
   * options:
   * - plaintext: true if we should avoid sending any terminal codes
   * - color: foreground color
   * - backgroundColor: background color
   * - underline: true to underline
   */
  constructor(options, ...spans) {
    // do at least one level of unpacking, if possible.
    if (spans.length == 1 && (spans[0] instanceof Span)) {
      for (let k in spans[0].options) if (options[k] == null) options[k] = spans[0].options[k];
      spans = spans[0].spans;
    }
    this.options = options;
    this.spans = spans;
    this.length = this.spans.map(s => s.length).reduce((a, b) => a + b);
  }

  // walk the spans, building up a new set that covers the desired slice, not counting ansi codes.
  slice(start, end) {
    if (end == null) end = this.length;
    if (start == null) start = 0;
    if (end < 0) end += this.length;
    if (start < 0) start += this.length;
    if (end < start) throw new Error("No shenanigans");

    const rv = [];
    let i = 0;
    this.spans.forEach(span => {
      // if the whole span is before/after the slice, skip.
      if (i < end && i + span.length >= start) {
        // but if it's wholly contained, move on.
        if (i >= start && i + span.length < end) {
          rv.push(span);
        } else {
          rv.push(span.slice(
            Math.max(start - i, 0),
            Math.min(end - i, span.length)
          ));
        }
      }
      i += span.length;
    });
    return new Span(this.options, ...rv);
  }

  toString(options = {}) {
    const plaintext = this.options.plaintext || options.plaintext;
    if (plaintext) return this.spans.map(span => span.toString({ plaintext })).join("");

    let escOn = "", escOff = "";
    if (this.options.backgroundColor) {
      const c = antsy.get_color(this.options.backgroundColor);
      escOn += (c < 8) ? `\u001b[4${c}m` : `\u001b[48;5;${c}m`;
      escOff += `\u001b[49m`;
    }
    if (this.options.color) {
      const c = antsy.get_color(this.options.color);
      escOn += (c < 8) ? `\u001b[3${c}m` : `\u001b[38;5;${c}m`;
      escOff += `\u001b[39m`;
    }
    if (this.options.underline) {
      escOn += "\u001b[4m";
      escOff += "\u001b[24m";
    }
    return escOn + this.spans.map(span => span.toString()).join(escOn) + escOff;
  }
}
