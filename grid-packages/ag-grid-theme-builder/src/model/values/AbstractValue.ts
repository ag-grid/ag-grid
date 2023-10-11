export abstract class AbstractValue {
  abstract toCss(): string;

  describe(): string {
    return this.toCss();
  }
}
