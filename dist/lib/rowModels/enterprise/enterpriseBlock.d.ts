// ag-grid-enterprise v12.0.0
import { NumberSequence, RowNodeBlock, RowNode } from "ag-grid";
import { EnterpriseCache, EnterpriseCacheParams } from "./enterpriseCache";
export declare class EnterpriseBlock extends RowNodeBlock {
    private context;
    private rowRenderer;
    private columnController;
    private valueService;
    private logger;
    private displayStartIndex;
    private displayEndIndex;
    private params;
    private parentCache;
    private parentRowNode;
    private level;
    private groupLevel;
    private groupField;
    private rowGroupColumn;
    private nodeIdPrefix;
    constructor(pageNumber: number, parentRowNode: RowNode, params: EnterpriseCacheParams, parentCache: EnterpriseCache);
    private createNodeIdPrefix();
    protected createIdForIndex(index: number): string;
    getNodeIdPrefix(): string;
    getRow(rowIndex: number): RowNode;
    private setBeans(loggerFactory);
    protected init(): void;
    protected setDataAndId(rowNode: RowNode, data: any, index: number): void;
    protected loadFromDatasource(): void;
    protected createBlankRowNode(rowIndex: number): RowNode;
    private createGroupKeys(groupNode);
    setDisplayIndexes(displayIndexSeq: NumberSequence, virtualRowCount: number): void;
    private createLoadParams();
    isIndexInBlock(index: number): boolean;
    isBlockBefore(index: number): boolean;
    getDisplayStartIndex(): number;
    getDisplayEndIndex(): number;
}
