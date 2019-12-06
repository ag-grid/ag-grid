import { RowNode, IEventEmitter, RowNodeBlock } from "@ag-grid-community/core";
import { InfiniteCacheParams } from "./infiniteCache";
export declare class InfiniteBlock extends RowNodeBlock implements IEventEmitter {
    private gridOptionsWrapper;
    private rowRenderer;
    private cacheParams;
    constructor(pageNumber: number, params: InfiniteCacheParams);
    protected createBlankRowNode(rowIndex: number): RowNode;
    protected setDataAndId(rowNode: RowNode, data: any, index: number): void;
    setRowNode(rowIndex: number, rowNode: RowNode): void;
    protected init(): void;
    getNodeIdPrefix(): string;
    getRow(displayIndex: number): RowNode;
    private setIndexAndTopOnRowNode;
    protected loadFromDatasource(): void;
}
