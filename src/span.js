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
      options = merge(spans[0].options, options);
      spans = spans[0].spans;
    }
    this.options = options;
    this.spans = spans.filter(s => s != null).map(s => (s instanceof Span) ? s : s.toString());
    this.length = this.spans.length == 0 ? 0 : this.spans.map(s => s.length).reduce((a, b) => a + b);
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

  /*
   * - active: styles that have actually had codes emitted for them
   * - currentPen: currently-active styles, even if no codes have been emitted yet
   */
  render(buffer = [], active = {}, currentPen = {}) {
    const pen = merge(currentPen, this.options);
    this.spans.forEach(span => {
      if (span instanceof Span) {
        span.render(buffer, active, pen);
      } else {
        const s = span.toString();
        if (s.length > 0) {
          buffer.push(renderPen(active, pen));
          buffer.push(s);
        }
      }
    });
  }

  toString(options = {}) {
    const buffer = [], active = {};
    this.render(buffer, active, options);
    buffer.push(renderPen(active, {}));
    return buffer.join("");
  }
}

function renderPen(active, pen) {
  if (pen.plaintext) return "";

  let out = "";

  if (active.backgroundColor != pen.backgroundColor) {
    if (!pen.backgroundColor) {
      out += `\u001b[49m`;
    } else {
      const c = antsy.get_color(pen.backgroundColor);
      out += (c < 8) ? `\u001b[4${c}m` : `\u001b[48;5;${c}m`;
    }
    active.backgroundColor = pen.backgroundColor;
  }

  if (active.color != pen.color) {
    if (!pen.color) {
      out += `\u001b[39m`;
    } else {
      const c = antsy.get_color(pen.color);
      out += (c < 8) ? `\u001b[3${c}m` : `\u001b[38;5;${c}m`;
    }
    active.color = pen.color;
  }

  if (active.underline != pen.underline) {
    out += pen.underline ? "\u001b[4m" : "\u001b[24m";
    active.underline = pen.underline;
  }

  return out;
}

// treat the objects as immutable, and generate a new object with them merged, in order.
function merge(...objects) {
  const rv = {};
  objects.forEach(obj => {
    for (const k in obj) rv[k] = obj[k];
  });
  return rv;
}
