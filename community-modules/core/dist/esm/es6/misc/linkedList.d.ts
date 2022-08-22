// Type definitions for @ag-grid-community/core v28.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class LinkedList<T> {
    private first;
    private last;
    add(item: T): void;
    remove(): T;
    isEmpty(): boolean;
}
