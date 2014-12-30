
# clicolor

Display pretty colored output in your CLI tool

Example:

```javascript
var clicolor = require("clicolor");

clicolor.display(clicolor.color("purple", "ATTENTION"), ": ", clicolor.color("green", "I am feeling green today."));
```

## API

All of the `display*` functions take either a string or a thing with a `toString()` method on it. Conveniently, the colored spans returned by `paint`, `color`, and `underline` all have such a method.

- `useColor(boolean)`

Turn on or off color support. By default, we assume that if stdout is a terminal, we should use colors. If it isn't, we shouldn't. You can hook this up to a `--color`/`--no-color` command-line option to let people override this guess.

- `quiet(boolean)`

Turn on/off quiet mode. In quiet mode, notices to stderr are squelched. The default is to be not quiet.

- `display(message...)`

Display the message to stdout, with a trailing linefeed added. If multiple strings are passed in, they are sent to `paint` first.

- `displayNotice(message...)`

Display the message to stderr, unless `quiet` mode is on. This is meant for tools that expect their standard output to be piped into another tool or file, when you'd like to post a verbose notice to the console to indicate progress or a status update.

- `displayWarning(message...)`

Same as `display`, but prefixed by an orange "WARNING: ".

- `displayError(message)`

Same as `display`, but prefixed by a red "ERROR: ".

- `color(colorName, strings...)`

Cat the strings together and color them with the given color name. The strings may be spans returned by another call to `color` or `paint` -- the terminal codes to set the color are repeated between each string.

Color names may be common American names like "green" or "brown", or hex codes like "fff" or "3a3acc". (Check out the "antsy" module for the full list.) They may also be one of these special names:

  + `underline` - underline the text instead of changing color
  + `dim` - a dimmer but still readable white
  + `timestamp` - a lovely shade of teal, suitable for timestamps
  + `warning` - a bright warning orange, used by `displayWarning`
  + `error` - a bright error red, used by `displayError`

- `paint(strings...)`

Do exactly the same as `color`, but don't change the color.


# License

Apache 2 (open-source) license, included in 'LICENSE.txt'.

# Authors

@robey - Robey Pointer <robeypointer@gmail.com>
