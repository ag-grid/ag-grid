// ag-grid-enterprise v9.1.0
import { InfiniteCacheParams, RowNode, IEnterpriseCache, IEnterpriseDatasource, NumberSequence, RowNodeBlock, RowNodeCache, RowNodeCacheParams } from "ag-grid";
export interface EnterpriseCacheParams extends RowNodeCacheParams {
    datasource: IEnterpriseDatasource;
    lastAccessedSequence: NumberSequence;
}
export declare class EnterpriseCache extends RowNodeCache implements IEnterpriseCache {
    private params;
    private eventService;
    constructor(params: EnterpriseCacheParams);
    protected dispatchModelUpdated(): void;
}
export declare class EnterpriseBlock extends RowNodeBlock {
    private context;
    constructor(pageNumber: number, params: InfiniteCacheParams);
    protected init(): void;
    protected setTopOnRowNode(rowNode: RowNode, rowIndex: number): void;
    protected loadFromDatasource(): void;
}
