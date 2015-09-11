"use strict";

import Span from "../../lib/span";

import "should";
import "source-map-support/register";

describe("Span", () => {
  it("spans", () => {
    new Span({ color: "green" }, "kermit").toString().should.eql("\u001b[32mkermit\u001b[39m");
    new Span({}, "it's so ", new Span({ color: "c00" }, "easy"), "!").toString().should.eql(
      "it's so \u001b[38;5;160measy\u001b[39m!"
    );

    new Span({ color: "green", plaintext: true }, "kermit").toString().should.eql("kermit");
    new Span({ plaintext: true }, "it's so ", new Span({ color: "red" }, "easy"), "!").toString().should.eql(
      "it's so easy!"
    );
  });

  it("slice", () => {
    const mess = new Span({},
      new Span({ color: "red" }, "abcde"),
      new Span({ color: "orange" }, "fghij"),
      new Span({ color: "yellow" }, "klmno"),
      new Span({ color: "green" }, "pqrst"),
      new Span({ color: "blue" }, "uvwxy")
    );
    const rendered = [
      [ "\u001b[38;5;9m", "abcde", "\u001b[39m" ],
      [ "\u001b[38;5;214m", "fghij", "\u001b[39m" ],
      [ "\u001b[38;5;11m", "klmno", "\u001b[39m" ],
      [ "\u001b[32m", "pqrst", "\u001b[39m" ],
      [ "\u001b[38;5;12m", "uvwxy", "\u001b[39m" ]
    ];
    function patch(...segments) {
      return segments.map(s => rendered[s[0]][0] + rendered[s[0]][1].slice(s[1], s[2]) + rendered[s[0]][2]).join("");
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
});
