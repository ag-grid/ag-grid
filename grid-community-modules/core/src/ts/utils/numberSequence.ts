export class NumberSequence {
    private nextValue: number;
    private step: number;

    constructor(initValue = 0, step = 1) {
        this.nextValue = initValue;
        this.step = step;
    }

    public next(): number {
        const valToReturn = this.nextValue;
        this.nextValue += this.step;
        return valToReturn;
    }

    public peek(): number {
        return this.nextValue;
    }

    public skip(count: number): void {
        this.nextValue += count;
    }
}
