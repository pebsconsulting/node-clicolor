antsy = require "antsy"

class CliColor
  constructor: ->
    @_useColor = process.stdout.isTTY
    @_quiet = false

  useColor: (x) ->
    @_useColor = x

  quiet: (x) ->
    @_quiet = x

  display: (message...) ->
    text = (if message.length == 1 then message[0] else @paint(message...)).toString()
    process.stdout.write(text + "\n")

  displayNotice: (message...) ->
    text = (if message.length == 1 then message[0] else @paint(message...)).toString()
    if not @_quiet then process.stderr.write(text + "\n")

  displayError: (message...) ->
    @display(@color(STYLES.error, "ERROR"), ": ", message...)

  displayWarning: (message) ->
    @display(@color(STYLES.warning, "WARNING"), ": ", message...)

  paint: (spans...) ->
    new Span(null, spans, @_useColor)

  color: (colorName, spans...) ->
    new Span(colorName, spans, @_useColor)


STYLES =
  dim: "888"
  timestamp: "0cc"
  error: "c00"
  warning: "f60"


class Span
  constructor: (@color, @spans, @_useColor) ->

  toString: ->
    [ escOn, escOff ] = if @color? and @_useColor
      switch @color
        when "underline" then [ "\u001b[4m", "\u001b[24m" ]
        else
          c = antsy.get_color(if STYLES[@color]? then STYLES[@color] else @color)
          [ "\u001b[38;5;#{c}m", "\u001b[39m" ]
    else
      [ "", "" ]
    escOn + (@spans.map (span) -> span.toString()).join(escOn) + escOff


exports.cli = -> new CliColor()

# allow the styles to be changed:
exports.STYLES = STYLES
