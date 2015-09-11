"use strict";

import { clicolor } from "../../lib/clicolor";
import { roundToPrecision } from "../../lib/magnitude";
import StatusUpdater from "../../lib/status";

import "should";
import "source-map-support/register";

describe("clicolor", () => {
  it("spans", () => {
    const cli = clicolor();
    cli.useColor(true);
    cli.color("green", "kermit").toString().should.eql("\u001b[32mkermit\u001b[39m");
    cli.paint("it's so ", cli.color("error", "easy"), "!").toString().should.eql(
      "it's so \u001b[38;5;160measy\u001b[39m!"
    );

    cli.useColor(false);
    cli.color("green", "kermit").toString().should.eql("kermit");
    cli.paint("it's so ", cli.color("error", "easy"), "!").toString().should.eql(
      "it's so easy!"
    );
  });

  it("slice", () => {
    const cli = clicolor();
    cli.useColor(true);
    const mess = cli.paint(
      cli.color("red", "abcde"),
      cli.color("orange", "fghij"),
      cli.color("yellow", "klmno"),
      cli.color("green", "pqrst"),
      cli.color("blue", "uvwxy")
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

  it("roundToPrecision", () => {
    roundToPrecision(123, 1).should.eql(100);
    roundToPrecision(123, 2).should.eql(120);
    roundToPrecision(123, 3).should.eql(123);
    roundToPrecision(123, 1, "ceil").should.eql(200);
    roundToPrecision(123, 2, "ceil").should.eql(130);
    roundToPrecision(123, 3, "ceil").should.eql(123);
    roundToPrecision(0, 3).should.eql(0);
  });

  it("toMagnitude", () => {
    const cli = clicolor();
    cli.toMagnitude(0).should.eql("0");
    cli.toMagnitude(1).should.eql("1");
    cli.toMagnitude(109).should.eql("109");
    cli.toMagnitude(999).should.eql("999");

    cli.toMagnitude(1000, 1024.0).should.eql("1000");
    cli.toMagnitude(1001, 1024.0).should.eql("1001");
    cli.toMagnitude(1024, 1024.0).should.eql("1K");
    cli.toMagnitude(1075, 1024.0).should.eql("1K");
    cli.toMagnitude(1076, 1024.0).should.eql("1.1K");
    cli.toMagnitude(1000).should.eql("1K");
    cli.toMagnitude(1024).should.eql("1K");
    cli.toMagnitude(1075).should.eql("1.1K");

    cli.toMagnitude(9999, 1024.0).should.eql("9.8K");
    cli.toMagnitude(12345, 1024.0).should.eql("12K");
    cli.toMagnitude(123456, 1024.0).should.eql("121K");
    cli.toMagnitude(1024000, 1024.0).should.eql("1000K");
    cli.toMagnitude(1234567, 1024.0).should.eql("1.2M");
    cli.toMagnitude(74449000, 1024.0).should.eql("71M");

    cli.toMagnitude(Math.pow(2, 32), 1024.0).should.eql("4G");
    cli.toMagnitude(Math.pow(2, 64), 1024.0).should.eql("16E");
    cli.toMagnitude(Math.pow(10, 10)).should.eql("10G");
    cli.toMagnitude(Math.pow(10, 20)).should.eql("100E");
  });

  it("status line", () => {
    const s = new StatusUpdater({ width: 16, frequency: 100 });
    s.update("porky").should.eql("\r               \rporky");
    s.update("porky").should.eql("");
    s.update("wut?").should.eql("");
    s.lastUpdate -= 100;
    s.update().should.eql("\r               \rwut?");
    s.clear().should.eql("\r               \r");
    s.clear().should.eql("");
  });

  it("padLeft", () => {
    const cli = clicolor();
    cli.padLeft(5, "hi").toString().should.eql("   hi");
    cli.padLeft(10, "hi", "there").toString().should.eql("   hithere");
    cli.padLeft(20, "hi", "there").toString().should.eql("             hithere");
    cli.padLeft(20, cli.color("red", "hello"), "copter").toString().should.eql(
      "         \u001b[38;5;9mhello\u001b[39mcopter"
    );
  });

  it("padRight", () => {
    const cli = clicolor();
    cli.padRight(5, "hi").toString().should.eql("hi   ");
    cli.padRight(10, "hi", "there").toString().should.eql("hithere   ");
    cli.padRight(20, "hi", "there").toString().should.eql("hithere             ");
    cli.padRight(20, cli.color("red", "hello"), "copter").toString().should.eql(
      "\u001b[38;5;9mhello\u001b[39mcopter         "
    );
  });

  it("format", () => {
    const cli = clicolor();
    cli.format({ color: "blue" }, "green").toString().should.eql("\u001b[38;5;12mgreen\u001b[39m");
    cli.format({ bgColor: "red", padLeft: 10 }, "green").toString().should.eql("     \u001b[48;5;9mgreen\u001b[49m");
    cli.format([
      { color: "brown", padRight: 10 },
      { color: "orange" }
    ], "wut?", "ok").toString().should.eql("\u001b[38;5;124mwut?\u001b[39m      \u001b[38;5;214mok\u001b[39m");
  });
});
