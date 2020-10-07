import { RowNodeTransaction, RowNode, IServerSideCache, RowDataTransaction, RowBounds, NumberSequence } from "@ag-grid-community/core";
import { ServerSideCache } from "./serverSideCache";
import { ServerSideBlock } from "./serverSideBlock";
export declare class ServerSideCrudCache implements IServerSideCache {
    getRowBounds(index: number): RowBounds;
    getRowIndexAtPixel(pixel: number): number;
    clearDisplayIndexes(): void;
    setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: {
        value: number;
    }): void;
    getRow(displayRowIndex: number, dontCreateBlock?: boolean): RowNode | null;
    getTopLevelRowDisplayedIndex(topLevelIndex: number): number;
    getDisplayIndexEnd(): number;
    isDisplayIndexInCache(displayIndex: number): boolean;
    applyTransaction(rowDataTransaction: RowDataTransaction): RowNodeTransaction | null;
    getChildCache(keys: string[]): ServerSideCache | null;
    isPixelInRange(pixel: number): boolean;
    refreshCacheAfterSort(changedColumnsInSort: string[], rowGroupColIds: string[]): void;
    isActive(): boolean;
    getVirtualRowCount(): number;
    hack_setVirtualRowCount(virtualRowCount: number): void;
    isMaxRowFound(): boolean;
    setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void;
    forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence?: NumberSequence): void;
    forEachBlockInOrder(callback: (block: ServerSideBlock, id: number) => void): void;
    purgeCache(): void;
    getRowNodesInRange(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
}
