import {Utils as _} from "../../utils";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {RowNode} from "../../entities/rowNode";
import {Context, Autowired, PostConstruct} from "../../context/context";
import {EventService} from "../../eventService";
import {IGetRowsParams} from "../iDatasource";
import {IEventEmitter} from "../../interfaces/iEventEmitter";
import {InfiniteCacheParams, RowNodeCacheParams} from "./infiniteCache";

export interface RowNodeBlockBeans {
    context: Context;
}

export abstract class RowNodeBlock {

    public static EVENT_LOAD_COMPLETE = 'loadComplete';

    public static STATE_DIRTY = 'dirty';
    public static STATE_LOADING = 'loading';
    public static STATE_LOADED = 'loaded';
    public static STATE_FAILED = 'failed';

    private version = 0;
    private state = RowNodeBlock.STATE_DIRTY;

    private lastAccessed: number;

    private blockNumber: number;
    private startRow: number;
    private endRow: number;
    private rowNodes: RowNode[];

    // because the framework cannot wire beans in parent classes, this is a hack
    // to pass bean references up. give out to niall for not getting an IoC context
    // that can do this yet
    private beans: RowNodeBlockBeans;

    private rowNodeCacheParams: RowNodeCacheParams;

    private localEventService = new EventService();

    constructor(blockNumber: number, rowNodeCacheParams: RowNodeCacheParams) {
        this.rowNodeCacheParams = rowNodeCacheParams;
        this.blockNumber = blockNumber;

        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = blockNumber * rowNodeCacheParams.pageSize;
        this.endRow = this.startRow + rowNodeCacheParams.pageSize;
    }

    public addEventListener(eventType: string, listener: Function): void {
        this.localEventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.localEventService.removeEventListener(eventType, listener);
    }

    public getVersion(): number {
        return this.version;
    }

    public getLastAccessed(): number {
        return this.lastAccessed;
    }

    public getRow(rowIndex: number): RowNode {
        this.lastAccessed = this.rowNodeCacheParams.lastAccessedSequence.next();
        var localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    }

    protected init(beans: RowNodeBlockBeans): void {
        this.beans = beans;
        this.createRowNodes();
    }

    public getStartRow(): number {
        return this.startRow;
    }

    public getEndRow(): number {
        return this.endRow;
    }

    public getPageNumber(): number {
        return this.blockNumber;
    }

    public setDirty(): void {
        // in case any current loads in progress, this will have their results ignored
        this.version++;
        this.state = RowNodeBlock.STATE_DIRTY;
    }

    public setDirtyAndPurge(): void {
        this.setDirty();
        this.rowNodes.forEach( rowNode => {
            rowNode.setData(null);
        });
    }

    protected abstract setTopOnRowNode(rowNode: RowNode, rowIndex: number): void;

    public getState(): string {
        return this.state;
    }

    public setRowNode(rowIndex: number, rowNode: RowNode): void {
        var localIndex = rowIndex - this.startRow;
        this.rowNodes[localIndex] = rowNode;
        rowNode.setRowIndex(rowIndex);
        this.setTopOnRowNode(rowNode, rowIndex);
    }

    public setBlankRowNode(rowIndex: number): RowNode {
        var localIndex = rowIndex - this.startRow;
        var newRowNode = this.createBlankRowNode(rowIndex);
        this.rowNodes[localIndex] = newRowNode;
        return newRowNode;
    }

    public setNewData(rowIndex: number, dataItem: any): RowNode {
        var newRowNode = this.setBlankRowNode(rowIndex);
        newRowNode.setDataAndId(dataItem, rowIndex.toString());
        return newRowNode;
    }

    private createBlankRowNode(rowIndex: number): RowNode {
        let rowNode = new RowNode();
        this.beans.context.wireBean(rowNode);
        rowNode.setRowHeight(this.rowNodeCacheParams.rowHeight);
        rowNode.setRowIndex(rowIndex);
        this.setTopOnRowNode(rowNode, rowIndex);
        return rowNode;
    }

    // creates empty row nodes, data is missing as not loaded yet
    protected createRowNodes(): void {
        this.rowNodes = [];
        for (var i = 0; i < this.rowNodeCacheParams.pageSize; i++) {
            var rowIndex = this.startRow + i;
            var rowNode = this.createBlankRowNode(rowIndex);
            this.rowNodes.push(rowNode);
        }
    }

    // gets base class to load, based on what the datasource type is
    protected abstract loadFromDatasource(): void;

    public load(): void {
        this.state = RowNodeBlock.STATE_LOADING;
        this.loadFromDatasource();
    }

    protected pageLoadFailed() {
        this.state = RowNodeBlock.STATE_FAILED;
        var event = {success: true, page: this};
        this.localEventService.dispatchEvent(RowNodeBlock.EVENT_LOAD_COMPLETE, event);
    }

    private populateWithRowData(rows: any[]): void {
        this.rowNodes.forEach( (rowNode: RowNode, index: number)=> {
            var data = rows[index];
            if (_.exists(data)) {
                // this means if the user is not providing id's we just use the
                // index for the row. this will allow selection to work (that is based
                // on index) as long user is not inserting or deleting rows,
                // or wanting to keep selection between server side sorting or filtering
                var indexOfRow = this.startRow + index;
                rowNode.setDataAndId(data, indexOfRow.toString());
            } else {
                rowNode.setDataAndId(undefined, undefined);
            }
        });
    }

    protected pageLoaded(version: number, rows: any[], lastRow: number) {
        // we need to check the version, in case there was an old request
        // from the server that was sent before we refreshed the cache,
        // if the load was done as a result of a cache refresh
        if (version===this.version) {
            this.state = RowNodeBlock.STATE_LOADED;
            this.populateWithRowData(rows);
        }

        lastRow = _.cleanNumber(lastRow);

        // check here if lastrow should be set
        var event = {success: true, page: this, lastRow: lastRow};

        this.localEventService.dispatchEvent(RowNodeBlock.EVENT_LOAD_COMPLETE, event);
    }

}

export class InfiniteBlock extends RowNodeBlock implements IEventEmitter {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;

    private cacheParams: InfiniteCacheParams;

    constructor(pageNumber: number, cacheSettings: InfiniteCacheParams) {
        super(pageNumber, cacheSettings);

        this.cacheParams = cacheSettings;
    }

    @PostConstruct
    protected init(): void {
        super.init({
            context: this.context
        });
    }

    protected setTopOnRowNode(rowNode: RowNode, rowIndex: number): void {
        rowNode.rowTop = this.cacheParams.rowHeight * rowIndex;
    }

    protected loadFromDatasource(): void {
        // PROBLEM . . . . when the user sets sort via colDef.sort, then this code
        // is executing before the sort is set up, so server is not getting the sort
        // model. need to change with regards order - so the server side request is
        // AFTER thus it gets the right sort model.
        var params: IGetRowsParams = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this),
            sortModel: this.cacheParams.sortModel,
            filterModel: this.cacheParams.filterModel,
            context: this.gridOptionsWrapper.getContext()
        };

        if (_.missing(this.cacheParams.datasource.getRows)) {
            console.warn(`ag-Grid: datasource is missing getRows method`);
            return;
        }

        // check if old version of datasource used
        var getRowsParams = _.getFunctionParameters(this.cacheParams.datasource.getRows);
        if (getRowsParams.length > 1) {
            console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
            console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
        }

        // put in timeout, to force result to be async
        setTimeout(()=> {
            this.cacheParams.datasource.getRows(params);
        }, 0);

    }
}
