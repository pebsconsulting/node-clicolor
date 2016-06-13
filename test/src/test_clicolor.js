"use strict";

import clicolor from "../../lib/clicolor";
import { roundToPrecision } from "../../lib/magnitude";
import StatusUpdater from "../../lib/status";

import "should";
import "source-map-support/register";

describe("clicolor", () => {
  it("color styles", () => {
    const cli = clicolor({
      useColor: true,
      styles: {
        crazy: "4d4",
        error: "fdd"
      }
    });
    cli.color("crazy", "hi").toString().should.eql("\u001b[38;5;77mhi\u001b[39m");
    cli.color("error", "hi").toString().should.eql("\u001b[38;5;224mhi\u001b[39m");
    cli.color("dim", "hi").toString().should.eql("\u001b[38;5;102mhi\u001b[39m");
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

  it("underline", () => {
    const cli = clicolor();
    cli.underline("hi").toString().should.eql("\u001b[4mhi\u001b[24m");
    cli.underline("hi", "there").toString().should.eql("\u001b[4mhithere\u001b[24m");
  });

  it("nested spans", () => {
    const cli = clicolor();
    const inner = cli.color("blue", "blueness", cli.underline("time"));
    const inner2 = cli.backgroundColor("gray", inner, cli.underline("!"));
    cli.backgroundColor("red", "what? ", inner2, " ok!").toString().should.eql(
      "\u001b[48;5;9mwhat? " +
      "\u001b[48;5;8m\u001b[38;5;12mblueness\u001b[4mtime\u001b[39m!" +
      "\u001b[48;5;9m\u001b[24m ok!\u001b[49m"
    );
  });

  it("format", () => {
    const cli = clicolor();

    cli.format({ color: "blue" }, "green").toString().should.eql("\u001b[38;5;12mgreen\u001b[39m");
    cli.format({ backgroundColor: "red", padLeft: 10 }, "green").toString().should.eql(
      "     \u001b[48;5;9mgreen\u001b[49m"
    );
    cli.format([
      { color: "brown", padRight: 10 },
      { color: "orange" }
    ], "wut?", "ok").toString().should.eql("\u001b[38;5;124mwut?\u001b[39m      \u001b[38;5;214mok\u001b[39m");
    cli.format([
      { color: "yellow", backgroundColor: "gray", padLeft: 15 },
      { backgroundColor: "dim" }
    ], "things are", " crazy").toString().should.eql(
      "     \u001b[48;5;8m\u001b[38;5;11mthings are\u001b[48;5;102m\u001b[39m crazy\u001b[49m"
    );

    const myFormat = [
      { color: "cyan" },
      { color: "blue", padLeft: 4 },
      { color: "cyan" }
    ];
    cli.format(myFormat, "Downloading launch codes (", 23, ")").toString().should.eql(
      "\u001b[38;5;14mDownloading launch codes (\u001b[39m  \u001b[38;5;12m23\u001b[38;5;14m)\u001b[39m"
    );
  });
});
