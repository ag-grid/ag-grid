import {
    _,
    Autowired,
    Column,
    ColumnApi,
    ColumnController,
    GridApi,
    GridOptionsWrapper,
    IServerSideChildStore,
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

import {ChildStoreParams, CacheChildStore} from "./cacheChildStore";
import {CacheUtils} from "./cacheUtils";
import {BlockUtils} from "./blockUtils";

export class CacheBlock extends RowNodeBlock {

    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('ssrmCacheUtils') private cacheUtils: CacheUtils;
    @Autowired('ssrmBlockUtils') private blockUtils: BlockUtils;

    private logger: Logger;

    private readonly storeParams: ChildStoreParams;
    private readonly startRow: number;
    private readonly endRow: number;

    private readonly level: number;
    private readonly groupLevel: boolean | undefined;
    private readonly leafGroup: boolean;

    private readonly parentCache: CacheChildStore;
    private readonly parentRowNode: RowNode;

    private defaultRowHeight: number;
    private usingTreeData: boolean;
    private usingMasterDetail: boolean;

    private lastAccessed: number;

    public rowNodes: RowNode[];

    private displayIndexStart: number;
    private displayIndexEnd: number;

    private blockTopPx: number;
    private blockHeightPx: number;

    private groupField: string;
    private rowGroupColumn: Column;
    private nodeIdPrefix: string;


    constructor(blockNumber: number, parentRowNode: RowNode, storeParams: ChildStoreParams, parentCache: CacheChildStore) {
        super(blockNumber);

        this.storeParams = storeParams;
        this.parentRowNode = parentRowNode;

        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = blockNumber * storeParams.blockSize;
        this.endRow = this.startRow + storeParams.blockSize;

        this.parentCache = parentCache;
        this.level = parentRowNode.level + 1;
        this.groupLevel = storeParams.rowGroupCols ? this.level < storeParams.rowGroupCols.length : undefined;
        this.leafGroup = storeParams.rowGroupCols ? this.level === storeParams.rowGroupCols.length - 1 : false;
    }

    public getRowCount(): number {
        return this.parentCache.getRowCount();
    }

    @PostConstruct
    protected postConstruct(): void {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        this.usingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
        this.defaultRowHeight  = this.gridOptionsWrapper.getRowHeightAsNumber();

        if (!this.usingTreeData && this.groupLevel) {
            const groupColVo = this.storeParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnController.getRowGroupColumns()[this.level];
        }

        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        this.createRowNodes();
    }

    public getStartRow(): number {
        return this.startRow;
    }

    public getEndRow(): number {
        return this.endRow;
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

    public getBlockHeightPx(): number {
        return this.blockHeightPx;
    }

    public getBlockTopPx(): number {
        return this.blockTopPx;
    }

    public isGroupLevel(): boolean | undefined {
        return this.groupLevel;
    }

    public getGroupField(): string {
        return this.groupField;
    }

    public getBlockStateJson(): {id: string, state: any} {
        return {
            id: this.nodeIdPrefix + this.getId(),
            state: {
                blockNumber: this.getId(),
                startRow: this.startRow,
                endRow: this.endRow,
                pageStatus: this.getState()
            }
        };
    }

    public isAnyNodeOpen(): boolean {
        const openNodeCount = this.rowNodes.filter( node => node.expanded ).length;
        return openNodeCount > 0;
    }

    // this method is repeated, see forEachNode, why?
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

    // this method is repeated, see forEachRowNode, why?
    private forEachNode(callback: (rowNode: RowNode, index: number) => void,
                        rowCount: number,
                        sequence: NumberSequence = new NumberSequence(),
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
                    (rowNode.childrenCache as IServerSideChildStore).forEachNodeDeep(callback, sequence);
                }
            }
        }
    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, rowCount: number, sequence?: NumberSequence): void {
        this.forEachNode(callback, rowCount, sequence, true);
    }

    public forEachNodeShallow(callback: (rowNode: RowNode) => void, rowCount: number, sequence?: NumberSequence): void {
        this.forEachNode(callback, rowCount, sequence, false);
    }

    public getLastAccessed(): number {
        return this.lastAccessed;
    }

    public getRowUsingLocalIndex(rowIndex: number, dontTouchLastAccessed = false): RowNode {
        if (!dontTouchLastAccessed) {
            this.lastAccessed = this.storeParams.lastAccessedSequence.next();
        }
        const localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    }

    // creates empty row nodes, data is missing as not loaded yet
    private createRowNodes(): void {
        this.rowNodes = [];
        for (let i = 0; i < this.storeParams.blockSize; i++) {
            const rowNode = this.blockUtils.createRowNode(
                {field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
                    level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn}
            );
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
            this.blockUtils.setDataIntoRowNode(rowNode, data, this.startRow + index, this.nodeIdPrefix);
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

    public getRowUsingDisplayIndex(displayRowIndex: number): RowNode | null {
        let bottomPointer = this.getStartRow();

        // the end row depends on whether all this block is used or not. if the virtual row count
        // is before the end, then not all the row is used
        const rowCount = this.parentCache.getRowCount();
        const endRow = this.getEndRow();
        const actualEnd = (rowCount < endRow) ? rowCount : endRow;

        let topPointer = actualEnd - 1;

        const res = this.blockUtils.getRowUsingDisplayIndex(displayRowIndex, bottomPointer, topPointer, this.getRowUsingLocalIndex.bind(this));
        return res;
    }

    protected loadFromDatasource(): void {
        this.cacheUtils.loadFromDatasource({
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            parentNode: this.parentRowNode,
            cacheParams: this.storeParams,
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this)
        });
    }

    public isPixelInRange(pixel: number): boolean {
        return pixel >= this.blockTopPx && pixel < (this.blockTopPx + this.blockHeightPx);
    }

    public getRowBounds(index: number, rowCount: number): RowBounds | null {

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
                const res = this.blockUtils.extractRowBounds(rowNode, index);
                if (res) { return res; }
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
                const res = this.blockUtils.getIndexAtPixel(rowNode, pixel);
                if (res!=null) {
                    return res;
                }
            }
        }

        console.warn(`ag-Grid: invalid pixel range for server side block ${pixel}`);
        return 0;
    }

    public clearDisplayIndexes(rowCount: number): void {
        this.displayIndexEnd = undefined;
        this.displayIndexStart = undefined;
        this.forEachRowNode(rowCount, rowNode => this.blockUtils.clearDisplayIndex(rowNode) );
    }

    public setDisplayIndexes(displayIndexSeq: NumberSequence,
                             rowCount: number,
                             nextRowTop: { value: number }): void {
        this.displayIndexStart = displayIndexSeq.peek();

        this.blockTopPx = nextRowTop.value;

        this.forEachRowNode(rowCount, rowNode =>
            this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop)
        );

        this.displayIndexEnd = displayIndexSeq.peek();
        this.blockHeightPx = nextRowTop.value - this.blockTopPx;
    }

}
