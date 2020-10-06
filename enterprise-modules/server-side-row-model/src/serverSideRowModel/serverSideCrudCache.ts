import {RowNodeTransaction, RowNode, IServerSideCache, RowDataTransaction, RowBounds, NumberSequence} from "@ag-grid-community/core";
import {ServerSideCache} from "./serverSideCache";
import {ServerSideBlock} from "./serverSideBlock";

// test code niall wrote for prototyping

export class ServerSideCrudCache implements IServerSideCache {

    public getRowBounds(index: number): RowBounds {
        return null;
    }

    public getRowIndexAtPixel(pixel: number): number {
        return 0;
    }

    public clearDisplayIndexes(): void {

    }

    public setDisplayIndexes(displayIndexSeq: NumberSequence,
                             nextRowTop: { value: number }): void {

    }

    public getRow(displayRowIndex: number, dontCreateBlock = false): RowNode | null {
        return null;
    }

    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        return 0;
    }

    public getDisplayIndexEnd(): number {
        return 0;
    }

    public isDisplayIndexInCache(displayIndex: number): boolean {
        return true;
    }

    public applyTransaction(rowDataTransaction: RowDataTransaction): RowNodeTransaction | null {
        return null;
    }

    public getChildCache(keys: string[]): ServerSideCache | null {
        return null;
    }

    public isPixelInRange(pixel: number): boolean {
        return false;
    }

    public refreshCacheAfterSort(changedColumnsInSort: string[], rowGroupColIds: string[]): void {

    }

    //////////////// RowNodeCache
    public isActive(): boolean {
        return false;
    }

    public getVirtualRowCount(): number {
        return 0;
    }

    public hack_setVirtualRowCount(virtualRowCount: number): void {

    }

    public isMaxRowFound(): boolean {
        return true;
    }

    public setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void {

    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence = new NumberSequence()): void {

    }

    public forEachBlockInOrder(callback: (block: ServerSideBlock, id: number) => void): void {

    }

    public purgeCache(): void {

    }

    public getRowNodesInRange(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        return null;
    }

}