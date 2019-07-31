// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { NumberSequence } from "../../utils";
import { RowNode } from "../../entities/rowNode";
import { Context } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
import { RowNodeCacheParams } from "./rowNodeCache";
import { RowRenderer } from "../../rendering/rowRenderer";
import { AgEvent } from "../../events";
export interface RowNodeBlockBeans {
    context: Context;
    rowRenderer: RowRenderer;
}
export interface LoadCompleteEvent extends AgEvent {
    success: boolean;
    page: RowNodeBlock;
    lastRow: number;
}
export declare abstract class RowNodeBlock extends BeanStub {
    static EVENT_LOAD_COMPLETE: string;
    static STATE_DIRTY: string;
    static STATE_LOADING: string;
    static STATE_LOADED: string;
    static STATE_FAILED: string;
    private version;
    private state;
    private lastAccessed;
    private readonly blockNumber;
    private readonly startRow;
    private readonly endRow;
    rowNodes: RowNode[];
    private beans;
    private rowNodeCacheParams;
    protected abstract loadFromDatasource(): void;
    protected abstract setDataAndId(rowNode: RowNode, data: any, index: number): void;
    abstract getRow(displayIndex: number): RowNode | null;
    abstract getNodeIdPrefix(): string;
    protected constructor(blockNumber: number, rowNodeCacheParams: RowNodeCacheParams);
    isAnyNodeOpen(rowCount: number): boolean;
    private forEachNodeCallback;
    private forEachNode;
    forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number): void;
    forEachNodeShallow(callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number): void;
    getVersion(): number;
    getLastAccessed(): number;
    getRowUsingLocalIndex(rowIndex: number, dontTouchLastAccessed?: boolean): RowNode;
    protected init(beans: RowNodeBlockBeans): void;
    getStartRow(): number;
    getEndRow(): number;
    getBlockNumber(): number;
    setDirty(): void;
    setDirtyAndPurge(): void;
    getState(): string;
    setRowNode(rowIndex: number, rowNode: RowNode): void;
    setBlankRowNode(rowIndex: number): RowNode;
    setNewData(rowIndex: number, dataItem: any): RowNode;
    protected createBlankRowNode(rowIndex: number): RowNode;
    protected createRowNodes(): void;
    load(): void;
    protected pageLoadFailed(): void;
    private populateWithRowData;
    destroy(): void;
    protected pageLoaded(version: number, rows: any[], lastRow: number): void;
}
