// ag-grid-enterprise v18.0.1
import { NumberSequence, RowNodeBlock, RowNode, RowBounds } from "ag-grid";
import { ServerSideCache, ServerSideCacheParams } from "./serverSideCache";
export declare class ServerSideBlock extends RowNodeBlock {
    private context;
    private rowRenderer;
    private columnController;
    private valueService;
    private gridOptionsWrapper;
    private logger;
    private displayIndexStart;
    private displayIndexEnd;
    private blockTop;
    private blockHeight;
    private params;
    private parentCache;
    private parentRowNode;
    private level;
    private groupLevel;
    private leafGroup;
    private groupField;
    private rowGroupColumn;
    private nodeIdPrefix;
    constructor(pageNumber: number, parentRowNode: RowNode, params: ServerSideCacheParams, parentCache: ServerSideCache);
    private createNodeIdPrefix();
    protected createIdForIndex(index: number): string;
    getNodeIdPrefix(): string;
    getRow(displayRowIndex: number): RowNode;
    private setBeans(loggerFactory);
    protected init(): void;
    protected setDataAndId(rowNode: RowNode, data: any, index: number): void;
    private setChildCountIntoRowNode(rowNode);
    private setGroupDataIntoRowNode(rowNode);
    protected loadFromDatasource(): void;
    protected createBlankRowNode(rowIndex: number): RowNode;
    private createGroupKeys(groupNode);
    isPixelInRange(pixel: number): boolean;
    getRowBounds(index: number, virtualRowCount: number): RowBounds;
    getRowIndexAtPixel(pixel: number, virtualRowCount: number): number;
    clearRowTops(virtualRowCount: number): void;
    setDisplayIndexes(displayIndexSeq: NumberSequence, virtualRowCount: number, nextRowTop: {
        value: number;
    }): void;
    private forEachRowNode(virtualRowCount, callback);
    private createLoadParams();
    updateSortModel(sortModel: {
        colId: string;
        sort: string;
    }[]): void;
    isDisplayIndexInBlock(displayIndex: number): boolean;
    isBlockBefore(displayIndex: number): boolean;
    getDisplayIndexStart(): number;
    getDisplayIndexEnd(): number;
    getBlockHeight(): number;
    getBlockTop(): number;
    isGroupLevel(): boolean;
    getGroupField(): string;
}
