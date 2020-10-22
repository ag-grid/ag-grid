// Type definitions for @ag-grid-community/core v24.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { NumberSequence } from "../utils";
import { RowNode } from "../entities/rowNode";
import { RowBounds } from "./iRowModel";
import { ServerSideTransaction, ServerSideTransactionResult } from "./serverSideTransaction";
import { SortModelItem } from "../sortController";
export interface IServerSideStore {
    clearDisplayIndexes(): void;
    getDisplayIndexEnd(): number | undefined;
    isDisplayIndexInStore(displayIndex: number): boolean;
    setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: {
        value: number;
    }): void;
    forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence?: NumberSequence): void;
    getRowUsingDisplayIndex(displayRowIndex: number, dontCreateBlock?: boolean): RowNode | null;
    getRowBounds(index: number): RowBounds | null;
    isPixelInRange(pixel: number): boolean;
    getRowIndexAtPixel(pixel: number): number | undefined;
    getChildStore(keys: string[]): IServerSideStore | null;
    refreshAfterSort(params: RefreshSortParams): void;
    refreshAfterFilter(): void;
    applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult;
    purgeStore(): void;
    getRowCount(): number;
    getTopLevelRowDisplayedIndex(topLevelIndex: number): number;
    isLastRowIndexKnown(): boolean;
    getRowNodesInRange(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
}
export interface RefreshSortParams {
    oldSortModel: SortModelItem[];
    newSortModel: SortModelItem[];
    valueColSortChanged: boolean;
    secondaryColSortChanged: boolean;
    sortAlwaysResets: boolean;
    changedColumnsInSort: string[];
}
