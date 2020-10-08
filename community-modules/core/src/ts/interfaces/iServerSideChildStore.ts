import {NumberSequence} from "../utils";
import {RowNode} from "../entities/rowNode";
import {RowBounds} from "./iRowModel";
import {RowDataTransaction} from "./rowDataTransaction";
import {RowNodeTransaction} from "./rowNodeTransaction";

export interface IServerSideChildStore {

    clearDisplayIndexes(): void;
    getDisplayIndexEnd(): number;
    isDisplayIndexInCache(displayIndex: number): boolean;
    setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: { value: number }): void;

    forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence?: NumberSequence): void;
    getRowUsingDisplayIndex(displayRowIndex: number, dontCreateBlock?: boolean): RowNode | null;
    getRowBounds(index: number): RowBounds;
    isPixelInRange(pixel: number): boolean;
    getRowIndexAtPixel(pixel: number): number;
    getChildCache(keys: string[]): IServerSideChildStore | null;
    refreshCacheAfterSort(changedColumnsInSort: string[], rowGroupColIds: string[]): void;
    applyTransaction(rowDataTransaction: RowDataTransaction): RowNodeTransaction | null
    purgeCache(): void;
    getRowCount(): number;
    getTopLevelRowDisplayedIndex(topLevelIndex: number): number;
    isLastRowIndexKnown(): boolean;
    getRowNodesInRange(firstInRange: RowNode, lastInRange: RowNode): RowNode[];

}
