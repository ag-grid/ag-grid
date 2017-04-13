// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../../entities/rowNode";
import { Context } from "../../context/context";
import { IEventEmitter } from "../../interfaces/iEventEmitter";
import { InfiniteCacheParams, RowNodeCacheParams } from "./infiniteCache";
export interface RowNodeBlockBeans {
    context: Context;
}
export declare abstract class RowNodeBlock {
    static EVENT_LOAD_COMPLETE: string;
    static STATE_DIRTY: string;
    static STATE_LOADING: string;
    static STATE_LOADED: string;
    static STATE_FAILED: string;
    private version;
    private state;
    private lastAccessed;
    private blockNumber;
    private startRow;
    private endRow;
    private rowNodes;
    private beans;
    private rowNodeCacheParams;
    private localEventService;
    constructor(blockNumber: number, rowNodeCacheParams: RowNodeCacheParams);
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    getVersion(): number;
    getLastAccessed(): number;
    getRow(rowIndex: number): RowNode;
    protected init(beans: RowNodeBlockBeans): void;
    getStartRow(): number;
    getEndRow(): number;
    getPageNumber(): number;
    setDirty(): void;
    setDirtyAndPurge(): void;
    protected abstract setTopOnRowNode(rowNode: RowNode, rowIndex: number): void;
    getState(): string;
    setRowNode(rowIndex: number, rowNode: RowNode): void;
    setBlankRowNode(rowIndex: number): RowNode;
    setNewData(rowIndex: number, dataItem: any): RowNode;
    private createBlankRowNode(rowIndex);
    protected createRowNodes(): void;
    protected abstract loadFromDatasource(): void;
    load(): void;
    protected pageLoadFailed(): void;
    private populateWithRowData(rows);
    protected pageLoaded(version: number, rows: any[], lastRow: number): void;
}
export declare class InfiniteBlock extends RowNodeBlock implements IEventEmitter {
    private gridOptionsWrapper;
    private context;
    private cacheParams;
    constructor(pageNumber: number, cacheSettings: InfiniteCacheParams);
    protected init(): void;
    protected setTopOnRowNode(rowNode: RowNode, rowIndex: number): void;
    protected loadFromDatasource(): void;
}
