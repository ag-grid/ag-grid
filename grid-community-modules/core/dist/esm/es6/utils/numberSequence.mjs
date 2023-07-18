export class NumberSequence {
    constructor(initValue = 0, step = 1) {
        this.nextValue = initValue;
        this.step = step;
    }
    next() {
        const valToReturn = this.nextValue;
        this.nextValue += this.step;
        return valToReturn;
    }
    peek() {
        return this.nextValue;
    }
    skip(count) {
        this.nextValue += count;
    }
}
