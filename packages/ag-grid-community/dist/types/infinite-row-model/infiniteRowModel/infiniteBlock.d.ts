import type { BeanCollection, LoadSuccessParams, NumberSequence } from 'ag-grid-community';
import { RowNode, RowNodeBlock } from 'ag-grid-community';
import type { InfiniteCache, InfiniteCacheParams } from './infiniteCache';
export declare class InfiniteBlock extends RowNodeBlock {
    private beans;
    wireBeans(beans: BeanCollection): void;
    private readonly startRow;
    private readonly endRow;
    private readonly parentCache;
    private params;
    private lastAccessed;
    rowNodes: RowNode[];
    constructor(id: number, parentCache: InfiniteCache, params: InfiniteCacheParams);
    postConstruct(): void;
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
    destroy(): void;
}
