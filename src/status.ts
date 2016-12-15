export type Options = {
  frequency?: number,
  width?: number
}

export class StatusUpdater {
  private frequency: number;
  private width: number;
  public lastUpdate: number;
  private currentMessage: string;
  private timer?: NodeJS.Timer;
  private blankLine: string;

  constructor(options: Options = {}) {
    this.frequency = options.frequency || 100;
    this.width = options.width || 80;
    this.lastUpdate = 0;
    this.blankLine = spaces(this.width - 1);
  }

  private render(message: string): string {
    const s = message.slice(0, this.width - 1).toString();
    return "\r" + this.blankLine + "\r" + s;
  }

  update(message?: string): string {
    if (message == null) message = this.currentMessage;
    if (message == null) return "";
    this.currentMessage = message;
    const now = Date.now();
    const nextTime = this.lastUpdate + this.frequency;
    if (now >= nextTime) {
      this.lastUpdate = now;
      if (this.timer) clearTimeout(this.timer);
      delete this.timer;
      return this.render(this.currentMessage);
    } else {
      if (this.timer === undefined) {
        this.timer = setTimeout(() => this.update(), nextTime - now);
      }
      return "";
    }
  }

  clear(): string {
    if (this.timer) clearTimeout(this.timer);
    delete this.timer;
    if (this.currentMessage === undefined) return "";
    delete this.currentMessage;
    return this.render("");
  }
}

//                 -+-*-+-|-+-*-+-|
const SPACES_16 = "                "; // 16

export function spaces(n: number): string {
  let rv = SPACES_16;
  while (rv.length < n) rv += SPACES_16;
  return rv.slice(0, n);
}
