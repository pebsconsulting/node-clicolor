"use strict";

const { clicolor } = require("./clicolor");
const { roundToPrecision, magnitude } = require("./magnitude");
const { Span } = require("./span");
const { spaces, StatusUpdater } = require("./status");

clicolor.roundToPrecision = roundToPrecision;
clicolor.magnitude = magnitude;
clicolor.spaces = spaces;
clicolor.Span = Span;
clicolor.StatusUpdater = StatusUpdater;

module.exports = clicolor;
