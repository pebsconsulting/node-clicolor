
# clicolor

Display pretty colored text and single-line status updates in your CLI tool.

Example:

```javascript
const clicolor = require("clicolor");
const cli = clicolor();

cli.display(cli.color("purple", "ATTENTION"), ": ", cli.color("green", "I am feeling green today."));

cli.status("Building space station ", cli.format({ color: "#4d4" }, "(24%)"), " ...");
```


# API

## Setup

A `clicolor` object tracks quiet mode, whether we're using color codes, and the state of any single-line status display.

- `clicolor(options)`: options are:
    - `width`: Screen width. Defaults to the current terminal width, if possible, or 80 otherwise.
    - `frequency`: Minimum delay (in milliseconds) between updates to a single-line status, to avoid flooding a terminal. Default is 100.
    - `useColor`: True or false: Should we emit color codes? If false, only plain text is emitted. By default, clicolor will use "true" if it detects a TTY, or "false" if not.
    - `quiet`: True or false: If false, "verbose" and single-line status updates will be displayed. If true, they will be squelched.
    - `styles`: Map of additional color names to use when resolving colors (described below).

These methods can be used to configure modes after constructing the object:

  - `useColor(boolean)`
  - `quiet(boolean)`

## Color spans

Clicolor uses "span" objects internally to represent text with embedded formatting. Each method will accept either strings, span objects, or a mix. You don't need to use span objects directly; you can combine them and then pass them to a display method without ever looking inside. If you want to render one immediately, call `toString()` on it.

Color names may be common American names like "green" or "brown", or hex codes like "fff" or "3a3acc". (Check out the [antsy](https://www.npmjs.com/package/antsy) module for the full list.) They may also be one of these special names, defined in the default `styles` object:

  + `dim` - a dimmer but still readable white
  + `timestamp` - a lovely shade of teal, suitable for timestamps
  + `warning` - a bright warning orange, used by `displayWarning`
  + `error` - a bright error red, used by `displayError`

You may add or override styles by passing them in a `styles` object in the constructor. For example, to define the color "frog" as a deep green:

```es6
const cli = clicolor({ styles: { frog: "#3f3" } });
```

Each of these methods takes one or more strings (or spans), for convenience, and applies an effect to the whole set of strings/spans combined. For example,

```es6
cli.color("green", "this is ", "all green.");
```

makes the whole string ("this is all green") green.

- `color(colorName, ...spans)`: Set the foreground color to the named color or style.

- `backgroundColor(colorName, ...spans)`: Set the background color to the named color or style.

- `underline(...spans)`: Underline this combined string/span.

- `padLeft(length, ...spans)`: Pad the combined string/span with spaces on the left, until it reaches the desired length.

- `padRight(length, ...spans)`: Pad the combined string/span with spaces on the right, until it reaches the desired length.

- `merge(...spans)`: Combine multiple strings/spans into one.

## Format

If you have a preset format that you'd like to use to fill in colors or padding, `format` is the method for you. It takes an array of format objects, and a variable number of strings/spans, and applies them in order.

- `format(formatters, ...spans)`

For example,

```es6
const myFormat = [
  { color: "cyan" },
  { color: "blue", padLeft: 4 },
  { color: "cyan" },
  { color: "blue", padLeft: 4 },
  { color: "cyan" },
];
cli.display(cli.format(myFormat, "Downloading launch codes (", soFar, " of ", total, ")"));
```

would display something like

```
Downloading launch codes (  23 of  739)
```

with the "23" and "739" in blue, and the rest in cyan.

Valid fields in a format object are:

- `color`: foreground color or style
- `backgroundColor`: background color or style
- `underline`: true/false to underline this span
- `padLeft`: fill on the left with spaces to the desired length
- `padRight`: fill on the right with spaces to the desired length

## Display

Several methods exist to display a formatted span (or ordinary string) to the terminal. If color codes have been turned off, the formatting will be ignored. If a single-line status is currently active, it will be cleared first.

- `display(...spans)` - Write the formatted text to stdout, followed by a linefeed.

- `displayVerbose(...spans)` - Write the formatted text to stdout, followed by a linefeed, but only if quiet mode is off.

- `displayWarning(...spans)` - Write the formatted text to stdout, followed by a linefeed, using the "warning" color style.

- `displayError(...spans)` - Write the formatted text to stdout, followed by a linefeed, using the "error" color style.

## Status

A single-line status update can be used to display progress in interactive applications. A status update is just text (possibly with color codes) that's displayed without a linefeed. Periodically, the text is updated by sending a CR, a line full of spaces, another CR, and the new text. This makes it update in place without moving to a new line. The updates are rate-limited (to 10 per second by default, or 100ms). If the text is longer than the screen width, it's truncated.

- `status(...spans)` - Update the status display, if connected to a TTY and not in quiet mode. To clear the status line and return to normal, call `status()` with no parameters.

## Helpers

- `screenWidth()` - Return our current guess about the screen width.

- `toMagnitude(number, base = 1000.0)` - Convert a number like 1000 into "1K", or a number like 1123 into "1.1K". Numbers are rounded to two digits of precision. By default, it uses SI units, suitable for meters and liters. To use computer units suitable for bytes, pass 1024 to `base`.


# License

Apache 2 (open-source) license, included in 'LICENSE.txt'.

# Authors

@robey - Robey Pointer <robeypointer@gmail.com>
