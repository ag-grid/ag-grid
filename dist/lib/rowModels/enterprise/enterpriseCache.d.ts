// ag-grid-enterprise v16.0.1
import { ColumnVO, IEnterpriseCache, IEnterpriseDatasource, NumberSequence, RowNode, RowNodeCache, RowNodeCacheParams, RowBounds } from "ag-grid";
import { EnterpriseBlock } from "./enterpriseBlock";
export interface EnterpriseCacheParams extends RowNodeCacheParams {
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    pivotCols: ColumnVO[];
    pivotMode: boolean;
    datasource: IEnterpriseDatasource;
    lastAccessedSequence: NumberSequence;
}
export declare class EnterpriseCache extends RowNodeCache<EnterpriseBlock, EnterpriseCacheParams> implements IEnterpriseCache {
    private eventService;
    private context;
    private displayIndexStart;
    private displayIndexEnd;
    private parentRowNode;
    private cacheTop;
    private cacheHeight;
    private blockHeights;
    constructor(cacheParams: EnterpriseCacheParams, parentRowNode: RowNode);
    private setBeans(loggerFactory);
    protected init(): void;
    getRowBounds(index: number): RowBounds;
    protected destroyBlock(block: EnterpriseBlock): void;
    getRowIndexAtPixel(pixel: number): number;
    clearRowTops(): void;
    setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: {
        value: number;
    }): void;
    getRow(displayRowIndex: number): RowNode;
    private createBlock(blockNumber, displayIndex, nextRowTop);
    getDisplayIndexEnd(): number;
    isDisplayIndexInCache(displayIndex: number): boolean;
    getChildCache(keys: string[]): EnterpriseCache;
    isPixelInRange(pixel: number): boolean;
}
