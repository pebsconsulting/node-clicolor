"use strict";

const clicolor = require("../../lib/clicolor");
const should = require("should");
const util = require("util");

require("source-map-support").install();

describe("clicolor", () => {
  it("spans", () => {
    const cli = clicolor.cli();
    cli.useColor(true);
    cli.color("green", "kermit").toString().should.eql("\u001b[38;5;2mkermit\u001b[39m");
    cli.paint("it's so ", cli.color("error", "easy"), "!").toString().should.eql(
      "it's so \u001b[38;5;160measy\u001b[39m!"
    );

    cli.useColor(false);
    cli.color("green", "kermit").toString().should.eql("kermit");
    cli.paint("it's so ", cli.color("error", "easy"), "!").toString().should.eql(
      "it's so easy!"
    );
  });
});

  //   display.humanize(0).should.eql               "0"
  //   display.humanize(1).should.eql               "1"
  //   display.humanize(109).should.eql             "109"
  //   display.humanize(999).should.eql             "999"
  //   display.humanize(1000).should.eql            "1000"
  //   display.humanize(1001).should.eql            "1001"
  //   display.humanize(1024).should.eql            "1K"
  //   display.humanize(1075).should.eql            "1K"
  //   display.humanize(1076).should.eql            "1.1K"
  //   display.humanize(9999).should.eql            "9.8K"
  //   display.humanize(12345).should.eql           "12K"
  //   display.humanize(123456).should.eql          "121K"
  //   display.humanize(1024000).should.eql         "1000K"
  //   display.humanize(1234567).should.eql         "1.2M"
  //   display.humanize(74449000).should.eql        "71M"
  //   display.humanize(Math.pow(2, 32)).should.eql "4G"
  //   display.humanize(Math.pow(2, 64)).should.eql "16E"
  //
  // it "roundToPrecision", ->
  //   display.roundToPrecision(123, 1).should.eql 100
  //   display.roundToPrecision(123, 2).should.eql 120
  //   display.roundToPrecision(123, 3).should.eql 123
  //   display.roundToPrecision(123, 1, "ceil").should.eql 200
  //   display.roundToPrecision(123, 2, "ceil").should.eql 130
  //   display.roundToPrecision(123, 3, "ceil").should.eql 123
  //   display.roundToPrecision(0, 3).should.eql 0
