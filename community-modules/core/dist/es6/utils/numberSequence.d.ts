// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class NumberSequence {
    private nextValue;
    private step;
    constructor(initValue?: number, step?: number);
    next(): number;
    peek(): number;
    skip(count: number): void;
}
