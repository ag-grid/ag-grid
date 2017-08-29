// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../../entities/rowNode";
import { IEventEmitter } from "../../interfaces/iEventEmitter";
import { InfiniteCacheParams } from "./infiniteCache";
import { RowNodeBlock } from "../cache/rowNodeBlock";
export declare class InfiniteBlock extends RowNodeBlock implements IEventEmitter {
    private gridOptionsWrapper;
    private context;
    private rowRenderer;
    private cacheParams;
    constructor(pageNumber: number, params: InfiniteCacheParams);
    protected createBlankRowNode(rowIndex: number): RowNode;
    protected setDataAndId(rowNode: RowNode, data: any, index: number): void;
    setRowNode(rowIndex: number, rowNode: RowNode): void;
    protected init(): void;
    getNodeIdPrefix(): string;
    getRow(displayIndex: number): RowNode;
    private setIndexAndTopOnRowNode(rowNode, rowIndex);
    protected loadFromDatasource(): void;
}
