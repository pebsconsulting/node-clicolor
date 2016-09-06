"use strict";

import { EMPTY_PEN, Pen } from "../../src/pen";

import "should";
import "source-map-support/register";

describe("Pen", () => {
  it("bold", () => {
    Pen.make({ bold: true }).render(EMPTY_PEN).should.eql("\u001b[1m");
    EMPTY_PEN.render(Pen.make({ bold: true })).should.eql("\u001b[22m");
  });

  it("underline", () => {
    Pen.make({ underline: true }).render(EMPTY_PEN).should.eql("\u001b[4m");
    EMPTY_PEN.render(Pen.make({ underline: true })).should.eql("\u001b[24m");
  });

  it("italic", () => {
    Pen.make({ italic: true }).render(EMPTY_PEN).should.eql("\u001b[3m");
    EMPTY_PEN.render(Pen.make({ italic: true })).should.eql("\u001b[23m");
  });

  it("colors", () => {
    Pen.make({ color: "#f00" }).render(EMPTY_PEN).should.eql("\u001b[38;5;9m");
    Pen.make({ color: "#888" }).render(EMPTY_PEN).should.eql("\u001b[38;5;102m");
    Pen.make({ backgroundColor: "#f00" }).render(EMPTY_PEN).should.eql("\u001b[48;5;9m");
    Pen.make({ backgroundColor: "#888" }).render(EMPTY_PEN).should.eql("\u001b[48;5;102m");
    Pen.make({ color: "red", backgroundColor: "blue" }).render(EMPTY_PEN).should.eql("\u001b[48;5;12m\u001b[38;5;9m");
    EMPTY_PEN.render(Pen.make({ color: "red", backgroundColor: "blue" })).should.eql("\u001b[49m\u001b[39m");
  });

  it("merge", () => {
    const pen1 = Pen.make({ color: "red", underline: true });
    const pen2 = Pen.make({ bold: true });
    const pen3 = Pen.make({ color: "blue", bold: true });
    pen1.merge(pen2).toString().should.eql("Pen(color=red, bold, underline)");
    pen2.merge(pen1).toString().should.eql("Pen(color=red, bold, underline)");
    pen1.merge(pen3).toString().should.eql("Pen(color=blue, bold, underline)");
    pen3.merge(pen1).toString().should.eql("Pen(color=red, bold, underline)");
    pen2.merge(pen3).toString().should.eql("Pen(color=blue, bold)");
    pen3.merge(pen2).toString().should.eql("Pen(color=blue, bold)");
  });

  it("format", () => {
    const f = Pen.format({
      error: { color: "red", bold: true },
      timestamp: { color: "cyan" }
    });

    Array.from(f.keys()).sort().should.eql([ "error", "timestamp" ]);
    f.get("error").toString().should.eql("Pen(color=red, bold)");
    f.get("timestamp").toString().should.eql("Pen(color=cyan)");
  });
});
