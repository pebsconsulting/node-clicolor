import { EMPTY_PEN, Pen } from "./pen";
import { spaces } from "./status";

export type Spans = Array<Span | string>;

export class Span {
  length: number;

  constructor(public pen: Pen, public spans: Spans) {
    // do at least one level of unpacking, if possible.
    while (spans.length == 1) {
      const onlySpan = spans[0];
      if (onlySpan instanceof Span) {
        pen = pen.merge(onlySpan.pen);
        spans = onlySpan.spans;
      } else {
        break;
      }
    }
    this.length = this.spans.length == 0 ? 0 : this.spans.map(s => s.length).reduce((a, b) => a + b);
  }

  // walk the spans, building up a new set that covers the desired slice, not counting ansi codes.
  slice(start: number = 0, end: number = this.length): Span {
    if (end < 0) end += this.length;
    if (start < 0) start += this.length;
    if (end < start) throw new Error("No shenanigans");

    const rv: Spans = [];
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
    return new Span(this.pen, rv);
  }

  /*
   * - active: styles that have actually had codes emitted for them
   * - currentPen: currently-active styles, even if no codes have been emitted yet
   */
  private render(buffer: string[], active: Pen, currentPen: Pen, emitCodes: boolean): Pen {
    const pen = currentPen.merge(this.pen);
    this.spans.forEach(span => {
      if (span instanceof Span) {
        active = span.render(buffer, active, pen, emitCodes);
      } else if (span.length > 0) {
        if (emitCodes) buffer.push(pen.render(active));
        active = pen;
        buffer.push(span);
      }
    });
    return active;
  }

  toString(emitCodes: boolean = true): string {
    const buffer: string[] = [];
    const active = this.render(buffer, EMPTY_PEN, EMPTY_PEN, emitCodes);
    if (emitCodes) buffer.push(EMPTY_PEN.render(active));
    return buffer.join("");
  }
}

export function span(pen: Pen, ...spans: Spans): Span {
  const rv = new Span(pen, spans);
  if (pen.padding != null) {
    if (pen.padding < 0 && -pen.padding > rv.length) {
      return new Span(pen, ([ spaces(-pen.padding - rv.length) ] as Spans).concat(spans));
    } else if (pen.padding > 0 && pen.padding > rv.length) {
      return new Span(pen, spans.concat([ spaces(pen.padding - rv.length) ]));
    }
  }
  return rv;
}
