import { NumberSequence, RowNode, RowNodeBlock, LoadSuccessParams } from "ag-grid-community";
import { InfiniteCache, InfiniteCacheParams } from "./infiniteCache";
export declare class InfiniteBlock extends RowNodeBlock {
    private beans;
    private readonly startRow;
    private readonly endRow;
    private readonly parentCache;
    private params;
    private lastAccessed;
    rowNodes: RowNode[];
    constructor(id: number, parentCache: InfiniteCache, params: InfiniteCacheParams);
    protected postConstruct(): void;
    getBlockStateJson(): {
        id: string;
        state: any;
    };
    protected setDataAndId(rowNode: RowNode, data: any, index: number): void;
    protected loadFromDatasource(): void;
    protected processServerFail(): void;
    protected createLoadParams(): any;
    forEachNode(callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number): void;
    getLastAccessed(): number;
    getRow(rowIndex: number, dontTouchLastAccessed?: boolean): RowNode;
    getStartRow(): number;
    getEndRow(): number;
    protected createRowNodes(): void;
    protected processServerResult(params: LoadSuccessParams): void;
    private destroyRowNodes;
}
