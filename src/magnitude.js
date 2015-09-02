"use strict";

const HUMAN_LABELS = " KMGTPE";

export function magnitude(number, base = 1000.0) {
  let index = HUMAN_LABELS.indexOf(" ");
  number = Math.abs(number);
  const originalNumber = number;
  while (number >= base && index < HUMAN_LABELS.length - 1) {
    number /= base;
    index += 1;
  }
  if (originalNumber > base) {
    number = (number < 10 ? roundToPrecision(number, 2) : Math.round(number));
  }
  let label = HUMAN_LABELS[index];
  if (label == " ") label = "";
  number = number.toString().slice(0, 4);
  // compensate for sloppy floating-point rounding:
  while (number.indexOf(".") > 0 && number[number.length - 1] == "0") {
    number = number.slice(0, number.length - 1);
  }
  return number + label;
}

export function roundToPrecision(number, digits, op = "round") {
  if (number == 0) return 0;
  const scale = digits - Math.floor(Math.log(number) / Math.log(10)) - 1;
  return Math[op](number * Math.pow(10, scale)) * Math.pow(10, -scale);
}
