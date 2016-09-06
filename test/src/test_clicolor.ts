"use strict";

import { clicolor, StatusUpdater } from "../../src";

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
    const formats = {
      blue: { color: "blue" },
      red10: { backgroundColor: "red", padLeft: 10 },
      info: { color: "cyan" },
      number: { color: "blue", padLeft: 4 },
      brown: { color: "brown", padRight: 10 }
    };

    cli.format(formats, "<blue>green</blue>").toString().should.eql("\u001b[38;5;12mgreen\u001b[39m");
    cli.format(formats, "<red10>green</red10>").toString().should.eql("\u001b[48;5;9m     green\u001b[49m");
    cli.format(formats, "ok, <blue>stop</blue>!").toString().should.eql("ok, \u001b[38;5;12mstop\u001b[39m!");
    cli.format(formats, "ok, <blue>stop <red10>ack</red10></blue>!").toString().should.eql(
      "ok, \u001b[38;5;12mstop \u001b[48;5;9m       ack\u001b[49m\u001b[39m!"
    );

    cli.format(formats, "<brown>wut?</brown><blue>ok</blue>").toString().should.eql(
      "\u001b[38;5;124mwut?      \u001b[38;5;12mok\u001b[39m"
    );
    cli.format(formats, "<info>Downloading launch codes (<number>23</number>)</info>").toString().should.eql(
      "\u001b[38;5;14mDownloading launch codes (\u001b[38;5;12m  23\u001b[38;5;14m)\u001b[39m"
    );

    cli.format(formats, "\\<blue>ok").toString().should.eql("\\<blue>ok");
  });
});
