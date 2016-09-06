"use strict";

import { span } from "../../src/span";
import { Pen } from "../../src/pen";

import "should";
import "source-map-support/register";

describe("Span", () => {
  it("spans", () => {
    span(Pen.make({ color: "green" }), "kermit").toString().should.eql("\u001b[32mkermit\u001b[39m");
    span(Pen.make(), "it's so ", span(Pen.make({ color: "c00" }), "easy"), "!").toString().should.eql(
      "it's so \u001b[38;5;160measy\u001b[39m!"
    );

    span(Pen.make({ color: "green" }), "kermit").toString(false).should.eql("kermit");
    span(Pen.make(), "it's so ", span(Pen.make({ color: "c00" }), "easy"), "!").toString(false).should.eql(
      "it's so easy!"
    );
  });

  it("slice", () => {
    const mess = span(Pen.make(),
      span(Pen.make({ color: "red" }), "abcde"),
      span(Pen.make({ color: "orange" }), "fghij"),
      span(Pen.make({ color: "yellow" }), "klmno"),
      span(Pen.make({ color: "green" }), "pqrst"),
      span(Pen.make({ color: "blue" }), "uvwxy")
    );
    const rendered = [
      [ "\u001b[38;5;9m", "abcde" ],
      [ "\u001b[38;5;214m", "fghij" ],
      [ "\u001b[38;5;11m", "klmno" ],
      [ "\u001b[32m", "pqrst" ],
      [ "\u001b[38;5;12m", "uvwxy" ]
    ];
    function patch(...segments: number[][]): string {
      return segments.map(s => rendered[s[0]][0] + rendered[s[0]][1].slice(s[1], s[2])).join("") + "\u001b[39m";
    }

    mess.slice().toString().should.eql(mess.toString());
    mess.slice(1).toString().should.eql(patch([ 0, 1 ], [ 1 ], [ 2 ], [ 3 ], [ 4 ]));
    mess.slice(0, -1).toString().should.eql(patch([ 0 ], [ 1 ], [ 2 ], [ 3 ], [ 4, 0, 4 ]));
    mess.slice(0, 4).toString().should.eql(patch([ 0, 0, 4 ]));
    mess.slice(0, 5).toString().should.eql(patch([ 0 ]));
    mess.slice(0, 6).toString().should.eql(patch([ 0 ], [ 1, 0, 1 ]));
    mess.slice(6, 8).toString().should.eql(patch([ 1, 1, 3 ]));
    mess.slice(6, 14).toString().should.eql(patch([ 1, 1 ], [ 2, 0, 4 ]));
    mess.slice(-19, -11).toString().should.eql(patch([ 1, 1 ], [ 2, 0, 4 ]));
    mess.slice(-2).toString().should.eql(patch([ 4, 3 ]));
  });

  it("pad", () => {
    span(Pen.make({ padLeft: 5 }), "a", "bc").toString().should.eql("  abc");
    span(Pen.make({ padRight: 5 }), "a", "bc").toString().should.eql("abc  ");
    span(Pen.make({ padLeft: 5 }), "a", span(Pen.make({ color: "red" }), "bc")).toString(false).should.eql("  abc");
  });
});
