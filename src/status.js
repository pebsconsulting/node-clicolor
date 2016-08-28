"use strict";

class StatusUpdater {
  constructor(options = {}) {
    this.frequency = options.frequency || 100;
    this.width = options.width || 80;
    this.lastUpdate = 0;
    this.currentMessage = null;
    this.timer = null;
    this.blankLine = spaces(this.width - 1);
  }

  _render(message) {
    const s = message.slice(0, this.width - 1).toString();
    return "\r" + this.blankLine + "\r" + s;
  }

  update(message) {
    if (message == null) message = this.currentMessage;
    if (message == null) return "";
    this.currentMessage = message;
    const now = Date.now();
    const nextTime = this.lastUpdate + this.frequency;
    if (now >= nextTime) {
      this.lastUpdate = now;
      if (this.timer) clearTimeout(this.timer);
      this.timer = null;
      return this._render(this.currentMessage);
    } else {
      if (this.timer == null) {
        this.timer = setTimeout(() => this.update(), nextTime - now);
      }
      return "";
    }
  }

  clear() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.currentMessage == null) return "";
    this.currentMessage = null;
    return this._render("");
  }
}

//                 -+-*-+-|-+-*-+-|
const SPACES_16 = "                "; // 16

function spaces(n) {
  let rv = SPACES_16;
  while (rv.length < n) rv += SPACES_16;
  return rv.slice(0, n);
}


exports.spaces = spaces;
exports.StatusUpdater = StatusUpdater;
