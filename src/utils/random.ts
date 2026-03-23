export class Random {
  private seed: number;

  constructor(seed = Date.now()) {
    this.seed = seed >>> 0;
  }

  next(): number {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(values: T[]): T {
    return values[this.int(0, values.length - 1)];
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }
}