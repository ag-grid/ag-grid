export declare class NumberSequence {
    private nextValue;
    private step;
    constructor(initValue?: number, step?: number);
    next(): number;
    peek(): number;
    skip(count: number): void;
}
