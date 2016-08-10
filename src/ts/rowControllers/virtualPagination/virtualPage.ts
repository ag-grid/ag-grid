import {Utils as _} from "../../utils";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {RowNode} from "../../entities/rowNode";
import {Context, Autowired, PostConstruct} from "../../context/context";
import {EventService} from "../../eventService";
import {SelectionController} from "../../selectionController";
import {IGetRowsParams} from "../iDataSource";
import {IEventEmitter} from "../../interfaces/iEventEmitter";
import {CacheParams} from "./virtualPageCache";

export class VirtualPage implements IEventEmitter {

    public static EVENT_LOAD_COMPLETE = 'loadComplete';

    public static STATE_NEW = 'new';
    public static STATE_LOADING = 'loading';
    public static STATE_LOADED = 'loaded';
    public static STATE_FAILED = 'failed';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;
    @Autowired('selectionController') private selectionController: SelectionController;

    private state = VirtualPage.STATE_NEW;

    private lastAccessed: number;

    private pageNumber: number;
    private startRow: number;
    private endRow: number;
    private rowNodes: RowNode[];

    private cacheParams: CacheParams;

    private localEventService = new EventService();

    constructor(pageNumber: number, cacheSettings: CacheParams) {
        this.pageNumber = pageNumber;
        this.cacheParams = cacheSettings;

        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = pageNumber * cacheSettings.pageSize;
        this.endRow = this.startRow + cacheSettings.pageSize;
    }

    public getStartRow(): number {
        return this.startRow;
    }

    public getEndRow(): number {
        return this.endRow;
    }

    public getPageNumber(): number {
        return this.pageNumber;
    }

    public addEventListener(eventType: string, listener: Function): void {
        this.localEventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.localEventService.removeEventListener(eventType, listener);
    }

    public getLastAccessed(): number {
        return this.lastAccessed;
    }

    public getState(): string {
        return this.state;
    }

    @PostConstruct
    private init(): void {
        this.createRowNodes();
    }

    // creates empty row nodes, data is missing as not loaded yet
    private createRowNodes(): void {
        this.rowNodes = [];
        for (var i = 0; i < this.cacheParams.pageSize; i++) {
            var rowIndex = this.startRow + i;
            let rowNode = new RowNode();
            this.context.wireBean(rowNode);
            rowNode.rowTop = this.cacheParams.rowHeight * rowIndex;
            rowNode.rowHeight = this.cacheParams.rowHeight;
            this.rowNodes.push(rowNode);
        }
    }

    public getRow(rowIndex: number): RowNode {
        this.lastAccessed = this.cacheParams.lastAccessedSequence.next();
        var localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    }

    public load(): void {

        this.state = VirtualPage.STATE_LOADING;

        var params: IGetRowsParams = {
            startRow: this.startRow,
            endRow: this.endRow,
            successCallback: this.pageLoaded.bind(this),
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

    private pageLoadFailed() {
        this.state = VirtualPage.STATE_FAILED;
        var event = {success: true, page: this};
        this.localEventService.dispatchEvent(VirtualPage.EVENT_LOAD_COMPLETE, event);
    }

    private pageLoaded(rows: any[], lastRow: number) {
        this.state = VirtualPage.STATE_LOADED;

        this.rowNodes.forEach( (rowNode: RowNode, index: number)=> {
            var data = rows[index];
            if (_.exists(data)) {
                // this means if the user is not providing id's for the rows, then
                // we set the id to null, which disables selection on that row if
                // selection is enabled
                rowNode.setDataAndId(data, null);
            }
        });

        // check here if lastrow should be set
        var event = {success: true, page: this, lastRow: lastRow};

        this.localEventService.dispatchEvent(VirtualPage.EVENT_LOAD_COMPLETE, event);
    }

}
