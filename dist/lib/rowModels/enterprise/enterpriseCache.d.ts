// ag-grid-enterprise v10.0.1
import { RowNode, IEnterpriseCache, IEnterpriseDatasource, NumberSequence, RowNodeCache, RowNodeCacheParams, ColumnVO } from "ag-grid";
import { EnterpriseBlock } from "./enterpriseBlock";
export interface EnterpriseCacheParams extends RowNodeCacheParams {
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    datasource: IEnterpriseDatasource;
    lastAccessedSequence: NumberSequence;
}
export declare class EnterpriseCache extends RowNodeCache<EnterpriseBlock, EnterpriseCacheParams> implements IEnterpriseCache {
    private eventService;
    private context;
    private firstDisplayIndex;
    private lastDisplayIndex;
    private parentRowNode;
    constructor(cacheParams: EnterpriseCacheParams, parentRowNode: RowNode);
    private setBeans(loggerFactory);
    protected init(): void;
    setDisplayIndexes(numberSequence: NumberSequence): void;
    getRow(rowIndex: number): RowNode;
    private createBlock(blockNumber, displayIndex);
    getLastDisplayedIndex(): number;
    isIndexInCache(index: number): boolean;
    getChildCache(keys: string[]): EnterpriseCache;
}
