import {
    GridOptionsWrapper,
    RowNode,
    IGetRowsParams,
    RowNodeBlock,
    NumberSequence,
    Autowired,
    PostConstruct,
    PreDestroy,
    BeanStub, RowNodeCacheParams,
    RowRenderer,
    AgEvent,
    _
} from "@ag-grid-community/core";
import {InfiniteCacheParams} from "./infiniteCache";

export interface LoadCompleteEvent extends AgEvent {
    success: boolean;
    page: InfiniteBlock;
    lastRow: number;
}

export class InfiniteBlock extends BeanStub {

    public static EVENT_LOAD_COMPLETE = 'loadComplete';

    public static STATE_DIRTY = 'dirty';
    public static STATE_LOADING = 'loading';
    public static STATE_LOADED = 'loaded';
    public static STATE_FAILED = 'failed';

    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private params: InfiniteCacheParams;

    private version = 0;
    private state = RowNodeBlock.STATE_DIRTY;

    private lastAccessed: number;

    private readonly blockNumber: number;
    private readonly startRow: number;
    private readonly endRow: number;
    public rowNodes: RowNode[];

    constructor(blockNumber: number, params: InfiniteCacheParams) {
        super();

        this.params = params;
        this.blockNumber = blockNumber;

        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = blockNumber * params.blockSize;
        this.endRow = this.startRow + params.blockSize;
    }

    public getDisplayIndexStart(): number {
        return this.getBlockNumber() * this.params.blockSize;
    }

    // this is an estimate, as the last block will probably only be partially full. however
    // this method is used to know if this block is been rendered, before destroying, so
    // and this estimate works in that use case.
    public getDisplayIndexEnd(): number {
        return this.getDisplayIndexStart() + this.params.blockSize;
    }

    protected setDataAndId(rowNode: RowNode, data: any, index: number): void {
        if (_.exists(data)) {
            // this means if the user is not providing id's we just use the
            // index for the row. this will allow selection to work (that is based
            // on index) as long user is not inserting or deleting rows,
            // or wanting to keep selection between server side sorting or filtering
            rowNode.setDataAndId(data, index.toString());
        } else {
            rowNode.setDataAndId(undefined, undefined);
        }
    }

    public setRowNode(rowIndex: number, rowNode: RowNode): void {
        const localIndex = rowIndex - this.startRow;
        this.rowNodes[localIndex] = rowNode;
        this.setIndexAndTopOnRowNode(rowNode, rowIndex);
    }

    public getNodeIdPrefix(): string {
        return null;
    }

    public getRow(displayIndex: number): RowNode {
        return this.getRowUsingLocalIndex(displayIndex);
    }

    private setIndexAndTopOnRowNode(rowNode: RowNode, rowIndex: number): void {
        rowNode.setRowIndex(rowIndex);
        rowNode.rowTop = this.params.rowHeight * rowIndex;
    }

    protected loadFromDatasource(): void {
        // PROBLEM . . . . when the user sets sort via colDef.sort, then this code
        // is executing before the sort is set up, so server is not getting the sort
        // model. need to change with regards order - so the server side request is
        // AFTER thus it gets the right sort model.
        const params: IGetRowsParams = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this),
            sortModel: this.params.sortModel,
            filterModel: this.params.filterModel,
            context: this.gridOptionsWrapper.getContext()
        };

        if (_.missing(this.params.datasource.getRows)) {
            console.warn(`ag-Grid: datasource is missing getRows method`);
            return;
        }

        // put in timeout, to force result to be async
        window.setTimeout(() => {
            this.params.datasource.getRows(params);
        }, 0);
    }

    public isAnyNodeOpen(rowCount: number): boolean {
        // because SSRM doesn't extend from here, we always return false.
        // this method should be taken out.
        return false;
    }

    private forEachNodeCallback(callback: (rowNode: RowNode, index: number) => void, rowCount: number): void {
        for (let rowIndex = this.startRow; rowIndex < this.endRow; rowIndex++) {
            // we check against rowCount as this page may be the last one, and if it is, then
            // the last rows are not part of the set
            if (rowIndex < rowCount) {
                const rowNode = this.getRowUsingLocalIndex(rowIndex);
                callback(rowNode, rowIndex);
            }
        }
    }

    private forEachNode(callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number, deep: boolean): void {
        this.forEachNodeCallback((rowNode: RowNode) => {
            callback(rowNode, sequence.next());
            // this will only every happen for server side row model, as infinite
            // row model doesn't have groups
            if (deep && rowNode.childrenCache) {
                // rowNode.childrenCache.forEachNodeDeep(callback, sequence);
            }
        }, rowCount);
    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number): void {
        this.forEachNode(callback, sequence, rowCount, true);
    }

    public forEachNodeShallow(callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number): void {
        this.forEachNode(callback, sequence, rowCount, false);
    }

    public getVersion(): number {
        return this.version;
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

    @PostConstruct
    protected init(): void {
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

    public setDirty(): void {
        // in case any current loads in progress, this will have their results ignored
        this.version++;
        this.state = RowNodeBlock.STATE_DIRTY;
    }

    public setDirtyAndPurge(): void {
        this.setDirty();
        this.rowNodes.forEach(rowNode => rowNode.setData(null));
    }

    public getState(): string {
        return this.state;
    }

    public setBlankRowNode(rowIndex: number): RowNode {
        const newRowNode = this.createBlankRowNode(rowIndex);
        const localIndex = rowIndex - this.startRow;
        this.rowNodes[localIndex] = newRowNode;
        return newRowNode;
    }

    public setNewData(rowIndex: number, dataItem: any): RowNode {
        const newRowNode = this.setBlankRowNode(rowIndex);

        this.setDataAndId(newRowNode, dataItem, this.startRow + rowIndex);

        return newRowNode;
    }

    protected createBlankRowNode(rowIndex: number): RowNode {
        const rowNode = this.getContext().createBean(new RowNode());

        rowNode.setRowHeight(this.params.rowHeight);

        rowNode.uiLevel = 0;

        this.setIndexAndTopOnRowNode(rowNode, rowIndex);

        return rowNode;
    }

    // creates empty row nodes, data is missing as not loaded yet
    protected createRowNodes(): void {
        this.rowNodes = [];
        for (let i = 0; i < this.params.blockSize; i++) {
            let rowIndex = this.startRow + i;
            const rowNode = this.createBlankRowNode(rowIndex);
            this.rowNodes.push(rowNode);
        }
    }

    public load(): void {
        this.state = RowNodeBlock.STATE_LOADING;
        this.loadFromDatasource();
    }

    protected pageLoadFailed() {
        this.state = RowNodeBlock.STATE_FAILED;
        const event: LoadCompleteEvent = {
            type: RowNodeBlock.EVENT_LOAD_COMPLETE,
            success: false,
            page: this,
            lastRow: null
        };
        this.dispatchEvent(event);
    }

    private populateWithRowData(rows: any[]): void {
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

    protected pageLoaded(version: number, rows: any[], lastRow: number) {
        // we need to check the version, in case there was an old request
        // from the server that was sent before we refreshed the cache,
        // if the load was done as a result of a cache refresh
        if (version === this.version) {
            this.state = RowNodeBlock.STATE_LOADED;
            this.populateWithRowData(rows);
        }

        lastRow = _.cleanNumber(lastRow);

        // check here if lastRow should be set
        const event: LoadCompleteEvent = {
            type: RowNodeBlock.EVENT_LOAD_COMPLETE,
            success: true,
            page: this,
            lastRow: lastRow
        };

        this.dispatchEvent(event);
    }
}
