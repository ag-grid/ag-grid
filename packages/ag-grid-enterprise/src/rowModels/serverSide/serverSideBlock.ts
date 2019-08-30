import {
    Autowired,
    Column,
    ColumnController,
    Context,
    GridOptionsWrapper,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    Logger,
    LoggerFactory,
    NumberSequence,
    PostConstruct,
    Qualifier,
    RowBounds,
    RowNode,
    RowNodeBlock,
    RowRenderer,
    ValueService,
    _
} from "ag-grid-community";

import { ServerSideCache, ServerSideCacheParams } from "./serverSideCache";

export class ServerSideBlock extends RowNodeBlock {

    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private logger: Logger;

    private displayIndexStart: number;
    private displayIndexEnd: number;

    private blockTop: number;
    private blockHeight: number;

    private params: ServerSideCacheParams;
    private parentCache: ServerSideCache;

    private parentRowNode: RowNode;

    private level: number;
    private groupLevel: boolean | undefined;
    private leafGroup: boolean;
    private groupField: string;
    private rowGroupColumn: Column;
    private nodeIdPrefix: string;

    private usingTreeData: boolean;
    private usingMasterDetail: boolean;

    public static readonly DefaultBlockSize = 100;

    constructor(pageNumber: number, parentRowNode: RowNode, params: ServerSideCacheParams, parentCache: ServerSideCache) {
        super(pageNumber, params);
        this.params = params;
        this.parentRowNode = parentRowNode;
        this.parentCache = parentCache;
        this.level = parentRowNode.level + 1;
        this.groupLevel = params.rowGroupCols ? this.level < params.rowGroupCols.length : undefined;
        this.leafGroup = params.rowGroupCols ? this.level === params.rowGroupCols.length - 1 : false;
    }

    @PostConstruct
    protected init(): void {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        this.usingMasterDetail = this.gridOptionsWrapper.isMasterDetail();

        if (!this.usingTreeData && this.groupLevel) {
            const groupColVo = this.params.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnController.getRowGroupColumns()[this.level];
        }

        this.createNodeIdPrefix();

        super.init({
            context: this.getContext(),
            rowRenderer: this.rowRenderer
        });
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('ServerSideBlock');
    }

    private createNodeIdPrefix(): void {
        const parts: string[] = [];
        let rowNode : RowNode | null = this.parentRowNode;

        // pull keys from all parent nodes, but do not include the root node
        while (rowNode && rowNode.level >= 0) {
            parts.push(rowNode.key);
            rowNode = rowNode.parent;
        }

        if (parts.length > 0) {
            this.nodeIdPrefix = parts.reverse().join('-') + '-';
        }
    }

    protected createIdForIndex(index: number): string {
        if (_.exists(this.nodeIdPrefix)) {
            return this.nodeIdPrefix + index.toString();
        } else {
            return index.toString();
        }
    }

    public getNodeIdPrefix(): string {
        return this.nodeIdPrefix;
    }

    public getRow(displayRowIndex: number): RowNode | null {
        let bottomPointer = this.getStartRow();

        // the end row depends on whether all this block is used or not. if the virtual row count
        // is before the end, then not all the row is used
        const virtualRowCount = this.parentCache.getVirtualRowCount();
        const endRow = this.getEndRow();
        const actualEnd = (virtualRowCount < endRow) ? virtualRowCount : endRow;

        let topPointer = actualEnd - 1;

        if (_.missing(topPointer) || _.missing(bottomPointer)) {
            console.warn(`ag-grid: error: topPointer = ${topPointer}, bottomPointer = ${bottomPointer}`);
            return null;
        }

        while (true) {
            const midPointer = Math.floor((bottomPointer + topPointer) / 2);
            const currentRowNode = super.getRowUsingLocalIndex(midPointer);

            // first check current row for index
            if (currentRowNode.rowIndex === displayRowIndex) {
                return currentRowNode;
            }

            // then check if current row contains a detail row with the index
            const expandedMasterRow = currentRowNode.master && currentRowNode.expanded;
            if (expandedMasterRow && currentRowNode.detailNode.rowIndex === displayRowIndex) {
                return currentRowNode.detailNode;
            }

            // then check if child cache contains index
            const childrenCache = currentRowNode.childrenCache as ServerSideCache;
            if (currentRowNode.expanded && childrenCache && childrenCache.isDisplayIndexInCache(displayRowIndex)) {
                return childrenCache.getRow(displayRowIndex);
            }

            // otherwise adjust pointers to continue searching for index
            if (currentRowNode.rowIndex < displayRowIndex) {
                bottomPointer = midPointer + 1;
            } else if (currentRowNode.rowIndex > displayRowIndex) {
                topPointer = midPointer - 1;
            } else {
                console.warn(`ag-Grid: error: unable to locate rowIndex = ${displayRowIndex} in cache`);
                return null;
            }
        }
    }

    protected setDataAndId(rowNode: RowNode, data: any, index: number): void {
        rowNode.stub = false;

        if (_.exists(data)) {
            // if the user is not providing id's, then we build an id based on the index.
            // for infinite scrolling, the index is used on it's own. for Server Side Row Model,
            // we combine the index with the level and group key, so that the id is
            // unique across the set.
            //
            // unique id is needed for selection (so selection can be maintained when
            // doing server side sorting / filtering) - if user is not providing id's
            // (and we use the indexes) then selection will not work between sorting &
            // filtering.
            //
            // id's are also used by the row renderer for updating the dom as it identifies
            // rowNodes by id
            const idToUse = this.createIdForIndex(index);

            rowNode.setDataAndId(data, idToUse);
            rowNode.setRowHeight(this.gridOptionsWrapper.getRowHeightForNode(rowNode).height);

            if (this.usingTreeData) {
                const getServerSideGroupKey = this.gridOptionsWrapper.getServerSideGroupKeyFunc();
                if (_.exists(getServerSideGroupKey) && getServerSideGroupKey) {
                    rowNode.key = getServerSideGroupKey(rowNode.data);
                }

                const isServerSideGroup = this.gridOptionsWrapper.getIsServerSideGroupFunc();
                if (_.exists(isServerSideGroup) && isServerSideGroup) {
                    rowNode.group = isServerSideGroup(rowNode.data);
                }

            } else if (rowNode.group) {
                rowNode.key = this.valueService.getValue(this.rowGroupColumn, rowNode);
                if (rowNode.key === null || rowNode.key === undefined) {
                    _.doOnce(() => {
                        console.warn(`null and undefined values are not allowed for server side row model keys`);
                        if (this.rowGroupColumn) {
                            console.warn(`column = ${this.rowGroupColumn.getId()}`);
                        }
                        console.warn(`data is `, rowNode.data);
                    }, 'ServerSideBlock-CannotHaveNullOrUndefinedForKey');
                }
            } else if (this.usingMasterDetail) {
                const isRowMasterFunc = this.gridOptionsWrapper.getIsRowMasterFunc();
                if (_.exists(isRowMasterFunc) && isRowMasterFunc) {
                    rowNode.master = isRowMasterFunc(rowNode.data);
                } else {
                    rowNode.master = true;
                }
            }

        } else {
            rowNode.setDataAndId(undefined, undefined);
            rowNode.key = null;
        }

        if (this.usingTreeData || this.groupLevel) {
            this.setGroupDataIntoRowNode(rowNode);
            this.setChildCountIntoRowNode(rowNode);
        }
    }

    private setChildCountIntoRowNode(rowNode: RowNode): void {
        const getChildCount = this.gridOptionsWrapper.getChildCountFunc();
        if (getChildCount) {
            rowNode.allChildrenCount = getChildCount(rowNode.data);
        }
    }

    private setGroupDataIntoRowNode(rowNode: RowNode): void {
        const groupDisplayCols: Column[] = this.columnController.getGroupDisplayColumns();

        const usingTreeData = this.gridOptionsWrapper.isTreeData();

        groupDisplayCols.forEach(col => {
            if (usingTreeData) {
                if (_.missing(rowNode.groupData)) {
                    rowNode.groupData = {};
                }
                rowNode.groupData[col.getColId()] = rowNode.key;
            } else if (col.isRowGroupDisplayed(this.rowGroupColumn.getId())) {
                const groupValue = this.valueService.getValue(this.rowGroupColumn, rowNode);
                if (_.missing(rowNode.groupData)) {
                    rowNode.groupData = {};
                }
                rowNode.groupData[col.getColId()] = groupValue;
            }
        });
    }

    protected loadFromDatasource(): void {
        const params = this.createLoadParams();
        window.setTimeout(() => {
            if (this.params.datasource) {
                this.params.datasource.getRows(params);
            }
        }, 0);
    }

    protected createBlankRowNode(rowIndex: number): RowNode {
        const rowNode = super.createBlankRowNode(rowIndex);

        rowNode.group = this.groupLevel;
        rowNode.leafGroup = this.leafGroup;
        rowNode.level = this.level;
        rowNode.uiLevel = this.level;
        rowNode.parent = this.parentRowNode;

        // stub gets set to true here, and then false when this rowNode gets it's data
        rowNode.stub = true;

        if (rowNode.group) {
            rowNode.expanded = false;
            rowNode.field = this.groupField;
            rowNode.rowGroupColumn = this.rowGroupColumn;
        }

        return rowNode;
    }

    private createGroupKeys(groupNode: RowNode): string[] {
        const keys: string[] = [];

        let pointer: RowNode | null = groupNode;
        while (pointer && pointer.level >= 0) {
            keys.push(pointer.key);
            pointer = pointer.parent;
        }

        keys.reverse();

        return keys;
    }

    public isPixelInRange(pixel: number): boolean {
        return pixel >= this.blockTop && pixel < (this.blockTop + this.blockHeight);
    }

    public getRowBounds(index: number, virtualRowCount: number): RowBounds | null {

        const start = this.getStartRow();
        const end = this.getEndRow();

        const extractRowBounds = (rowNode: RowNode) => {
            return {
                rowHeight: rowNode.rowHeight,
                rowTop: rowNode.rowTop
            };
        };

        for (let i = start; i <= end; i++) {
            // the blocks can have extra rows in them, if they are the last block
            // in the cache and the virtual row count doesn't divide evenly by the
            if (i >= virtualRowCount) {
                continue;
            }

            const rowNode = this.getRowUsingLocalIndex(i);
            if (rowNode) {

                if (rowNode.rowIndex === index) {
                    return extractRowBounds(rowNode);
                }

                if (rowNode.group && rowNode.expanded && _.exists(rowNode.childrenCache)) {
                    const serverSideCache = rowNode.childrenCache as ServerSideCache;
                    if (serverSideCache.isDisplayIndexInCache(index)) {
                        return serverSideCache.getRowBounds(index);
                    }
                } else if (rowNode.master && rowNode.expanded && _.exists(rowNode.detailNode)) {
                    if (rowNode.detailNode.rowIndex === index) {
                        return extractRowBounds(rowNode.detailNode);
                    }
                }
            }
        }

        console.error(` ag-Grid: looking for invalid row index in Server Side Row Model, index=${index}`);

        return null;
    }

    public getRowIndexAtPixel(pixel: number, virtualRowCount: number): number {

        const start = this.getStartRow();
        const end = this.getEndRow();

        for (let i = start; i <= end; i++) {
            // the blocks can have extra rows in them, if they are the last block
            // in the cache and the virtual row count doesn't divide evenly by the
            if (i >= virtualRowCount) {
                continue;
            }

            const rowNode = this.getRowUsingLocalIndex(i);
            if (rowNode) {

                // first check if pixel is in range of current row
                if (rowNode.isPixelInRange(pixel)) {
                    return rowNode.rowIndex;
                }

                // then check if current row contains a detail row with pixel in range
                const expandedMasterRow = rowNode.master && rowNode.expanded;
                if (expandedMasterRow && rowNode.detailNode.isPixelInRange(pixel)) {
                    return rowNode.detailNode.rowIndex;
                }

                // then check if it's a group row with a child cache with pixel in range
                if (rowNode.group && rowNode.expanded && _.exists(rowNode.childrenCache)) {
                    const serverSideCache = rowNode.childrenCache as ServerSideCache;
                    if (serverSideCache.isPixelInRange(pixel)) {
                        return serverSideCache.getRowIndexAtPixel(pixel);
                    }
                }
            }
        }

        console.warn(`ag-Grid: invalid pixel range for server side block ${pixel}`);
        return 0;
    }

    public clearRowTops(virtualRowCount: number): void {
        this.forEachRowNode(virtualRowCount, rowNode => {
            rowNode.clearRowTop();

            const hasChildCache = rowNode.group && _.exists(rowNode.childrenCache);
            if (hasChildCache) {
                const serverSideCache = rowNode.childrenCache as ServerSideCache;
                serverSideCache.clearRowTops();
            }
        });
    }

    public setDisplayIndexes(displayIndexSeq: NumberSequence,
                             virtualRowCount: number,
                             nextRowTop: { value: number }): void {
        this.displayIndexStart = displayIndexSeq.peek();

        this.blockTop = nextRowTop.value;

        this.forEachRowNode(virtualRowCount, rowNode => {
            rowNode.setRowIndex(displayIndexSeq.next());
            rowNode.setRowTop(nextRowTop.value);
            nextRowTop.value += rowNode.rowHeight;

            const hasDetailRow = rowNode.master && rowNode.expanded;
            if (hasDetailRow) {
                rowNode.detailNode.setRowIndex(displayIndexSeq.next());
                rowNode.detailNode.setRowTop(nextRowTop.value);
                nextRowTop.value += rowNode.detailNode.rowHeight;
            }

            const hasChildCache = rowNode.group && _.exists(rowNode.childrenCache);
            if (hasChildCache) {
                const serverSideCache = rowNode.childrenCache as ServerSideCache;
                if (rowNode.expanded) {
                    serverSideCache.setDisplayIndexes(displayIndexSeq, nextRowTop);
                } else {
                    // we need to clear the row tops, as the row renderer depends on
                    // this to know if the row should be faded out
                    serverSideCache.clearRowTops();
                }
            }
        });

        this.displayIndexEnd = displayIndexSeq.peek();
        this.blockHeight = nextRowTop.value - this.blockTop;
    }

    private forEachRowNode(virtualRowCount: number, callback: (rowNode: RowNode) => void): void {
        const start = this.getStartRow();
        const end = this.getEndRow();

        for (let i = start; i <= end; i++) {
            // the blocks can have extra rows in them, if they are the last block
            // in the cache and the virtual row count doesn't divide evenly by the
            if (i >= virtualRowCount) {
                continue;
            }

            const rowNode = this.getRowUsingLocalIndex(i);

            if (rowNode) {
                callback(rowNode);
            }
        }
    }

    private createLoadParams(): IServerSideGetRowsParams {
        const groupKeys = this.createGroupKeys(this.parentRowNode);

        const request: IServerSideGetRowsRequest = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            rowGroupCols: this.params.rowGroupCols,
            valueCols: this.params.valueCols,
            pivotCols: this.params.pivotCols,
            pivotMode: this.params.pivotMode,
            groupKeys: groupKeys,
            filterModel: this.params.filterModel,
            sortModel: this.params.sortModel
        };

        const params = {
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this),
            request: request,
            parentNode: this.parentRowNode
        } as IServerSideGetRowsParams;

        return params;
    }

    public isDisplayIndexInBlock(displayIndex: number): boolean {
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    }

    public isBlockBefore(displayIndex: number): boolean {
        return displayIndex >= this.displayIndexEnd;
    }

    public getDisplayIndexStart(): number {
        return this.displayIndexStart;
    }

    public getDisplayIndexEnd(): number {
        return this.displayIndexEnd;
    }

    public getBlockHeight(): number {
        return this.blockHeight;
    }

    public getBlockTop(): number {
        return this.blockTop;
    }

    public isGroupLevel(): boolean | undefined {
        return this.groupLevel;
    }

    public getGroupField(): string {
        return this.groupField;
    }
}
