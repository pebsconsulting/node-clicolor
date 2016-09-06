import { get_color } from "antsy";

export interface PenDescription {
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
  padLeft?: number;
  padRight?: number;
}

export type Format = Map<string, Pen>;

export class Pen {
  constructor(
    // name of desired foregroud & background color, if any.
    public color?: string,
    public backgroundColor?: string,

    // true if we should bold, underline, or italic
    public bold?: boolean,
    public underline?: boolean,
    public italic?: boolean,

    // remember left (negative) or right padding for "format"
    public padding?: number,
  ) {
    // nothing.
  }

  toString(): string {
    const flags: string[] = [];
    if (this.color) flags.push(`color=${this.color}`);
    if (this.backgroundColor) flags.push(`backgroundColor=${this.backgroundColor}`);
    if (this.bold) flags.push("bold");
    if (this.underline) flags.push("underline");
    if (this.italic) flags.push("italic");
    if (this.padding != null) flags.push(`pad=${this.padding}`);
    return `Pen(${flags.join(", ")})`;
  }

  copy(): Pen {
    return new Pen(this.color, this.backgroundColor, this.bold, this.underline, this.italic, this.padding);
  }

  merge(other: Pen): Pen {
    const rv = this.copy();
    if (other.color != null) rv.color = other.color;
    if (other.backgroundColor != null) rv.backgroundColor = other.backgroundColor;
    if (other.bold != null) rv.bold = other.bold;
    if (other.underline != null) rv.underline = other.underline;
    if (other.italic != null) rv.italic = other.italic;
    if (other.padding != null) rv.padding = other.padding;
    return rv;
  }

  // render any differences between this pen and the "active" pen.
  render(active: Pen): string {
    let out = "";

    if (active.backgroundColor != this.backgroundColor) {
      if (!this.backgroundColor) {
        out += `\u001b[49m`;
      } else {
        const c = get_color(this.backgroundColor);
        out += (c < 8) ? `\u001b[4${c}m` : `\u001b[48;5;${c}m`;
      }
    }

    if (active.color != this.color) {
      if (!this.color) {
        out += `\u001b[39m`;
      } else {
        const c = get_color(this.color);
        out += (c < 8) ? `\u001b[3${c}m` : `\u001b[38;5;${c}m`;
      }
    }

    if (active.bold != this.bold) {
      out += this.bold ? "\u001b[1m" : "\u001b[22m";
    }

    if (active.underline != this.underline) {
      out += this.underline ? "\u001b[4m" : "\u001b[24m";
    }

    if (active.italic != this.italic) {
      out += this.italic ? "\u001b[3m" : "\u001b[23m";
    }

    return out;
  }

  static make(options: PenDescription = {}): Pen {
    return new Pen(
      options.color,
      options.backgroundColor,
      options.bold,
      options.underline,
      options.italic,
      options.padLeft != null ? -options.padLeft : options.padRight
    );
  }

  static format(descriptors: { [key: string]: PenDescription }): Format {
    const rv = new Map<string, Pen>();
    for (const k in descriptors) rv.set(k, Pen.make(descriptors[k]));
    return rv;
  }
}


export const EMPTY_PEN = Pen.make();
