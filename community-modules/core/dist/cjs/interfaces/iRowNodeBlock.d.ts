// Type definitions for @ag-grid-community/core v23.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IEventEmitter } from "./iEventEmitter";
import { RowNode } from "../entities/rowNode";
import { NumberSequence } from "../utils";
export interface IRowNodeBlock extends IEventEmitter {
    getLastAccessed(): number;
    getState(): string;
    isAnyNodeOpen(rowCount: number): boolean;
    getBlockNumber(): number;
    forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number): void;
    destroy(): void;
    forEachNodeShallow(callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number): void;
    load(): void;
}
