// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../../entities/rowNode";
import { IEventEmitter } from "../../interfaces/iEventEmitter";
import { CacheParams } from "./virtualPageCache";
export declare class VirtualPage implements IEventEmitter {
    static EVENT_LOAD_COMPLETE: string;
    static STATE_DIRTY: string;
    static STATE_LOADING: string;
    static STATE_LOADED: string;
    static STATE_FAILED: string;
    private gridOptionsWrapper;
    private context;
    private state;
    private version;
    private lastAccessed;
    private pageNumber;
    private startRow;
    private endRow;
    private rowNodes;
    private cacheParams;
    private localEventService;
    constructor(pageNumber: number, cacheSettings: CacheParams);
    setDirty(): void;
    setDirtyAndPurge(): void;
    getStartRow(): number;
    getEndRow(): number;
    getPageNumber(): number;
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    getLastAccessed(): number;
    getState(): string;
    setRowNode(rowIndex: number, rowNode: RowNode): void;
    setBlankRowNode(rowIndex: number): RowNode;
    setNewData(rowIndex: number, dataItem: any): RowNode;
    private init();
    private createRowNodes();
    private setTopOnRowNode(rowNode, rowIndex);
    private createBlankRowNode(rowIndex);
    getRow(rowIndex: number): RowNode;
    load(): void;
    private pageLoadFailed();
    private populateWithRowData(rows);
    private pageLoaded(version, rows, lastRow);
}
