import {
    _,
    Autowired,
    Column,
    ColumnApi,
    ColumnController,
    GridApi,
    GridOptionsWrapper,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    Logger,
    LoggerFactory,
    NumberSequence,
    PostConstruct,
    PreDestroy,
    Qualifier,
    RowBounds,
    RowNode,
    RowNodeBlock,
    RowRenderer,
    ValueService
} from "@ag-grid-community/core";

import {ServerSideCache, ServerSideCacheParams} from "./serverSideCache";

export class ServerSideBlock extends RowNodeBlock {

    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private logger: Logger;

    private readonly params: ServerSideCacheParams;
    private readonly blockNumber: number;
    private readonly startRow: number;
    private readonly endRow: number;

    private readonly level: number;
    private readonly groupLevel: boolean | undefined;
    private readonly leafGroup: boolean;

    private readonly parentCache: ServerSideCache;
    private readonly parentRowNode: RowNode;

    private usingTreeData: boolean;
    private usingMasterDetail: boolean;

    private lastAccessed: number;

    public rowNodes: RowNode[];

    private displayIndexStart: number;
    private displayIndexEnd: number;

    private blockTop: number;
    private blockHeight: number;

    private groupField: string;
    private rowGroupColumn: Column;
    private nodeIdPrefix: string;

    constructor(blockNumber: number, parentRowNode: RowNode, params: ServerSideCacheParams, parentCache: ServerSideCache) {
        super();

        this.params = params;

        this.blockNumber = blockNumber;

        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = blockNumber * params.blockSize;
        this.endRow = this.startRow + params.blockSize;

        this.parentRowNode = parentRowNode;
        this.parentCache = parentCache;
        this.level = parentRowNode.level + 1;
        this.groupLevel = params.rowGroupCols ? this.level < params.rowGroupCols.length : undefined;
        this.leafGroup = params.rowGroupCols ? this.level === params.rowGroupCols.length - 1 : false;
    }

    @PostConstruct
    protected postConstruct(): void {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        this.usingMasterDetail = this.gridOptionsWrapper.isMasterDetail();

        if (!this.usingTreeData && this.groupLevel) {
            const groupColVo = this.params.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnController.getRowGroupColumns()[this.level];
        }

        this.createNodeIdPrefix();
        this.createRowNodes();
    }

    public getStartRow(): number {
        return this.startRow;
    }

    public getEndRow(): number {
        return this.endRow;
    }

    public getBlockNumber(): number {
        return this.blockNumber;
    }

    public getNodeIdPrefix(): string {
        return this.nodeIdPrefix;
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

    public getBlockStateJson(): {id: string, state: any} {
        return {
            id: this.nodeIdPrefix + this.blockNumber,
            state: {
                blockNumber: this.blockNumber,
                startRow: this.startRow,
                endRow: this.endRow,
                pageStatus: this.getState()
            }
        };
    }

    public isAnyNodeOpen(rowCount: number): boolean {
        let result = false;
        this.forEachNodeShallow((rowNode: RowNode) => {
            if (rowNode.expanded) {
                result = true;
            }
        }, new NumberSequence(), rowCount);
        return result;
    }

    private forEachNode(callback: (rowNode: RowNode, index: number) => void,
                        sequence: NumberSequence,
                        rowCount: number,
                        includeChildren: boolean): void {
        for (let rowIndex = this.startRow; rowIndex < this.endRow; rowIndex++) {
            // we check against rowCount as this page may be the last one, and if it is, then
            // the last rows are not part of the set
            if (rowIndex < rowCount) {
                const rowNode = this.getRowUsingLocalIndex(rowIndex);
                callback(rowNode, sequence.next());

                // this will only every happen for server side row model, as infinite
                // row model doesn't have groups
                if (includeChildren && rowNode.childrenCache) {
                    (rowNode.childrenCache as ServerSideCache).forEachNodeDeep(callback, sequence);
                }
            }
        }
    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number): void {
        this.forEachNode(callback, sequence, rowCount, true);
    }

    public forEachNodeShallow(callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number): void {
        this.forEachNode(callback, sequence, rowCount, false);
    }

    public getLastAccessed(): number {
        return this.lastAccessed;
    }

    public getRowUsingLocalIndex(rowIndex: number, dontTouchLastAccessed = false): RowNode {
        if (!dontTouchLastAccessed) {
            this.lastAccessed = this.params.lastAccessedSequence.next();
        }
        const localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    }

    // creates empty row nodes, data is missing as not loaded yet
    protected createRowNodes(): void {
        this.rowNodes = [];
        for (let i = 0; i < this.params.blockSize; i++) {

            const rowNode = this.getContext().createBean(new RowNode());

            rowNode.setRowHeight(this.params.rowHeight);

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

            this.rowNodes.push(rowNode);
        }
    }

    protected processServerResult(rows: any[]): void {
        const rowNodesToRefresh: RowNode[] = [];

        this.rowNodes.forEach((rowNode: RowNode, index: number) => {
            const data = rows[index];
            if (rowNode.stub) {
                rowNodesToRefresh.push(rowNode);
            }
            this.setDataAndId(rowNode, data, this.startRow + index);
        });

        if (rowNodesToRefresh.length > 0) {
            this.rowRenderer.redrawRows(rowNodesToRefresh);
        }
    }

    @PreDestroy
    private destroyRowNodes(): void {
        this.rowNodes.forEach(rowNode => {
            if (rowNode.childrenCache) {
                this.destroyBean(rowNode.childrenCache);
                rowNode.childrenCache = null;
            }
            // this is needed, so row render knows to fade out the row, otherwise it
            // sees row top is present, and thinks the row should be shown. maybe
            // rowNode should have a flag on whether it is visible???
            rowNode.clearRowTop();
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

    public getRowUsingDisplayIndex(displayRowIndex: number): RowNode | null {
        let bottomPointer = this.getStartRow();

        // the end row depends on whether all this block is used or not. if the virtual row count
        // is before the end, then not all the row is used
        const rowCount = this.parentCache.getRowCount();
        const endRow = this.getEndRow();
        const actualEnd = (rowCount < endRow) ? rowCount : endRow;

        let topPointer = actualEnd - 1;

        if (_.missing(topPointer) || _.missing(bottomPointer)) {
            console.warn(`ag-grid: error: topPointer = ${topPointer}, bottomPointer = ${bottomPointer}`);
            return null;
        }

        while (true) {
            const midPointer = Math.floor((bottomPointer + topPointer) / 2);
            const currentRowNode = this.getRowUsingLocalIndex(midPointer);

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
                return childrenCache.getRowUsingDisplayIndex(displayRowIndex);
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
            const defaultId = this.nodeIdPrefix + index.toString();

            rowNode.setDataAndId(data, defaultId);

            if (this.usingTreeData) {
                const isGroupFunc = this.gridOptionsWrapper.getIsServerSideGroupFunc();
                const getKeyFunc = this.gridOptionsWrapper.getServerSideGroupKeyFunc();

                if (isGroupFunc != null) {
                    rowNode.group = isGroupFunc(rowNode.data);
                    if (rowNode.group && getKeyFunc != null) {
                        rowNode.key = getKeyFunc(rowNode.data);
                    }
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
                const isMasterFunc = this.gridOptionsWrapper.getIsRowMasterFunc();
                if (isMasterFunc != null) {
                    rowNode.master = isMasterFunc(rowNode.data);
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

        // this needs to be done AFTER setGroupDataIntoRowNode(), as the height can depend on the group data
        // getting set, if it's a group node and colDef.autoHeight=true
        if (_.exists(data)) {
            rowNode.setRowHeight(this.gridOptionsWrapper.getRowHeightForNode(rowNode).height);
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
            if (rowNode.groupData == null) {
                rowNode.groupData = {};
            }
            if (usingTreeData) {
                rowNode.groupData[col.getColId()] = rowNode.key;
            } else if (col.isRowGroupDisplayed(this.rowGroupColumn.getId())) {
                const groupValue = this.valueService.getValue(this.rowGroupColumn, rowNode);
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

    public getRowBounds(index: number, rowCount: number): RowBounds | null {

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
            if (i >= rowCount) {
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

    public clearDisplayIndexes(rowCount: number): void {
        this.displayIndexEnd = undefined;
        this.displayIndexStart = undefined;

        this.forEachRowNode(rowCount, rowNode => {
            rowNode.clearRowTop();
            rowNode.setRowIndex(undefined);

            const hasChildCache = rowNode.group && _.exists(rowNode.childrenCache);
            if (hasChildCache) {
                const serverSideCache = rowNode.childrenCache as ServerSideCache;
                serverSideCache.clearDisplayIndexes();
            }

            const hasDetailNode = rowNode.master && rowNode.detailNode;
            if (hasDetailNode) {
                rowNode.detailNode.clearRowTop();
                rowNode.detailNode.setRowIndex(undefined);
            }
        });
    }

    public setDisplayIndexes(displayIndexSeq: NumberSequence,
                             rowCount: number,
                             nextRowTop: { value: number }): void {
        this.displayIndexStart = displayIndexSeq.peek();

        this.blockTop = nextRowTop.value;

        this.forEachRowNode(rowCount, rowNode => {
            // set this row
            rowNode.setRowIndex(displayIndexSeq.next());
            rowNode.setRowTop(nextRowTop.value);
            nextRowTop.value += rowNode.rowHeight;

            // set child for master / detail
            const hasDetailRow = rowNode.master;
            if (hasDetailRow) {
                if (rowNode.expanded && rowNode.detailNode) {
                    rowNode.detailNode.setRowIndex(displayIndexSeq.next());
                    rowNode.detailNode.setRowTop(nextRowTop.value);
                    nextRowTop.value += rowNode.detailNode.rowHeight;
                } else if (rowNode.detailNode) {
                    rowNode.detailNode.clearRowTop();
                    rowNode.detailNode.setRowIndex(undefined);
                }
            }

            // set children for SSRM child rows
            const hasChildCache = rowNode.group && _.exists(rowNode.childrenCache);
            if (hasChildCache) {
                const serverSideCache = rowNode.childrenCache as ServerSideCache;
                if (rowNode.expanded) {
                    serverSideCache.setDisplayIndexes(displayIndexSeq, nextRowTop);
                } else {
                    // we need to clear the row tops, as the row renderer depends on
                    // this to know if the row should be faded out
                    serverSideCache.clearDisplayIndexes();
                }
            }
        });

        this.displayIndexEnd = displayIndexSeq.peek();
        this.blockHeight = nextRowTop.value - this.blockTop;
    }

    private forEachRowNode(rowCount: number, callback: (rowNode: RowNode) => void): void {
        const start = this.getStartRow();
        const end = this.getEndRow();

        for (let i = start; i <= end; i++) {
            // the blocks can have extra rows in them, if they are the last block
            // in the cache and the virtual row count doesn't divide evenly by the
            if (i >= rowCount) {
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
            parentNode: this.parentRowNode,
            api: this.gridApi,
            columnApi: this.columnApi
        } as IServerSideGetRowsParams;

        return params;
    }
}
