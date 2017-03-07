import {Observable, Subscription} from 'rxjs';

import {Utils as _} from "../../utils";
import {Constants as constants, Constants} from "../../constants";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {ColumnController} from "../../columnController/columnController";
import {FilterManager} from "../../filter/filterManager";
import {RowNode} from "../../entities/rowNode";
import {EventService} from "../../eventService";
import {Events, ModelUpdatedEvent} from "../../events";
import {Bean, Context, Autowired, PostConstruct, Optional, PreDestroy} from "../../context/context";
import {SelectionController} from "../../selectionController";
import {IRowNodeStage} from "../../interfaces/iRowNodeStage";
import {IObservableInMemoryRowModel} from "../../interfaces/iObservableInMemoryRowModel";
import {ObservableInMemoryNodeManager} from "./observableInMemoryNodeManager";

enum RecursionType {Normal, AfterFilter, AfterFilterAndSort, PivotNodes};

@Bean('rowModel')
export class ObservableInMemoryRowModel implements IObservableInMemoryRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('$scope') private $scope: any;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    // standard stages
    @Autowired('filterStage') private filterStage: IRowNodeStage;
    @Autowired('sortStage') private sortStage: IRowNodeStage;
    @Autowired('flattenStage') private flattenStage: IRowNodeStage;

    // top most node of the tree. the children are the user provided data.
    private rootNode: RowNode;

    private rowsToDisplay: RowNode[]; // the rows mapped to rows to display

    private nodeManager: ObservableInMemoryNodeManager;

    private rowDataSubscription: Subscription = null;

    @PostConstruct
    public init(): void {

        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshModel.bind(this, {step: Constants.STEP_EVERYTHING} ));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshModel.bind(this, {step: Constants.STEP_EVERYTHING} ));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_PIVOT_CHANGED, this.refreshModel.bind(this, {step: Constants.STEP_PIVOT} ));

        this.eventService.addModalPriorityEventListener(Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.eventService.addModalPriorityEventListener(Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.refreshModel.bind(this, {step: Constants.STEP_PIVOT} ));

        this.rootNode = new RowNode();
        this.nodeManager = new ObservableInMemoryNodeManager(this.rootNode, this.gridOptionsWrapper, this.context, this.eventService);

        this.context.wireBean(this.rootNode);

        if (this.gridOptionsWrapper.isRowModelObservable()) {
            this.setRowDataSource(this.gridOptionsWrapper.getRowDataSource());
        }
    }

    @PreDestroy
    public destroy(): void {
        // Unsubscribe from any passed-in observable before destruction.
        if (this.rowDataSubscription) this.rowDataSubscription.unsubscribe();
    }

    private onFilterChanged(): void {
        var animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({step: Constants.STEP_FILTER, keepRenderedRows: true, animate: animate});
    }

    private onSortChanged(): void {
        // we only act on the sort event here if the user is doing in grid sorting.
        // we ignore it if the sorting is happening on the server side.
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) { return; }

        var animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({step: Constants.STEP_SORT, keepRenderedRows: true, animate: animate, keepEditingRows: true});
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_NORMAL;
    }

    private onValueChanged(): void {
        if (this.columnController.isPivotActive()) {
            this.refreshModel({step: Constants.STEP_PIVOT});
        } else {
            this.refreshModel({step: Constants.STEP_AGGREGATE});
        }
    }

    public refreshModel(params: {step: number, groupState?: any, keepRenderedRows?: boolean, animate?: boolean, keepEditingRows?: boolean, newRowNodes?: RowNode[]}): void {

        // this goes through the pipeline of stages. what's in my head is similar
        // to the diagram on this page:
        // http://commons.apache.org/sandbox/commons-pipeline/pipeline_basics.html
        // however we want to keep the results of each stage, hence we manually call
        // each step rather than have them chain each other.

        // fallthrough in below switch is on purpose,
        // eg if STEP_FILTER, then all steps below this
        // step get done
        // var start: number;

        switch (params.step) {
            case constants.STEP_EVERYTHING:
                this.rootNode.childrenAfterGroup = this.rootNode.allLeafChildren;
            case constants.STEP_FILTER:
                this.doFilter();
            case constants.STEP_SORT:
                this.doSort();
            case constants.STEP_MAP:
                this.doRowsToDisplay();
        }

        let event: ModelUpdatedEvent = {animate: params.animate, keepRenderedRows: params.keepRenderedRows};
        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED, event);

        if (this.$scope) {
            setTimeout( () => {
                this.$scope.$apply();
            }, 0);
        }
    }

    public isEmpty(): boolean {
        var rowsMissing: boolean;
        rowsMissing = _.missing(this.rootNode.allLeafChildren) || this.rootNode.allLeafChildren.length === 0;

        var empty = _.missing(this.rootNode) || rowsMissing  || !this.columnController.isReady();

        return empty;
    }

    public isRowsToRender(): boolean {
        return _.exists(this.rowsToDisplay) && this.rowsToDisplay.length > 0;
    }

    public setDatasource(datasource: any): void {
        console.error('ag-Grid-rx: should never call setDatasource on observableInMemoryRowController');
    }

    public getTopLevelNodes() {
        return this.rootNode ? this.rootNode.childrenAfterGroup : null;
    }

    public getRootNode() {
        return this.rootNode;
    }

    public getRow(index: number): RowNode {
        return this.rowsToDisplay[index];
    }

    public isRowPresent(rowNode: RowNode): boolean {
        return this.rowsToDisplay.indexOf(rowNode) >= 0;
    }

    public getVirtualRowCount(): number {
        console.warn('ag-Grid: rowModel.getVirtualRowCount() is not longer a function, use rowModel.getRowCount() instead');
        return this.getRowCount();
    }

    public getRowCount(): number {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length;
        } else {
            return 0;
        }
    }

    public getRowIndexAtPixel(pixelToMatch: number): number {
        if (this.isEmpty()) {
            return -1;
        }

        // do binary search of tree
        // http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
        var bottomPointer = 0;
        var topPointer = this.rowsToDisplay.length - 1;

        // quick check, if the pixel is out of bounds, then return last row
        if (pixelToMatch<=0) {
            // if pixel is less than or equal zero, it's always the first row
            return 0;
        }
        var lastNode = this.rowsToDisplay[this.rowsToDisplay.length-1];
        if (lastNode.rowTop<=pixelToMatch) {
            return this.rowsToDisplay.length - 1;
        }

        while (true) {

            var midPointer = Math.floor((bottomPointer + topPointer) / 2);
            var currentRowNode = this.rowsToDisplay[midPointer];

            if (this.isRowInPixel(currentRowNode, pixelToMatch)) {
                return midPointer;
            } else if (currentRowNode.rowTop < pixelToMatch) {
                bottomPointer = midPointer + 1;
            } else if (currentRowNode.rowTop > pixelToMatch) {
                topPointer = midPointer - 1;
            }

        }
    }

    private isRowInPixel(rowNode: RowNode, pixelToMatch: number): boolean {
        var topPixel = rowNode.rowTop;
        var bottomPixel = rowNode.rowTop + rowNode.rowHeight;
        var pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
        return pixelInRow;
    }

    public getRowCombinedHeight(): number {
        if (this.rowsToDisplay && this.rowsToDisplay.length > 0) {
            var lastRow = this.rowsToDisplay[this.rowsToDisplay.length - 1];
            var lastPixel = lastRow.rowTop + lastRow.rowHeight;
            return lastPixel;
        } else {
            return 0;
        }
    }
    
    public forEachNode(callback: Function): void {
        if (this.rootNode.allLeafChildren) {
            this.rootNode.allLeafChildren.forEach( (rowNode, index) => callback(rowNode, index) );
        }
    }

    public forEachNodeAfterFilter(callback: Function): void {
        if (this.rootNode.childrenAfterFilter) {
            this.rootNode.childrenAfterFilter.forEach( (rowNode, index) => callback(rowNode, index) );
        }
    }

    public forEachNodeAfterFilterAndSort(callback: Function): void {
        if (this.rootNode.childrenAfterSort) {
            this.rootNode.childrenAfterSort.forEach( (rowNode, index) => callback(rowNode, index) );
        }
    }

    private doSort() {
        this.sortStage.execute({rowNode: this.rootNode});
    }

    private doFilter() {
        this.filterStage.execute({rowNode: this.rootNode});
    }

    public setRowDataSource(rowData: Observable<any[]>) {
        // If we're already subscribed to an observable, unsubscribe.
        if (this.rowDataSubscription) this.rowDataSubscription.unsubscribe();

        // Start with an empty data set for our new observable.
        this.updateRowData([]);

        // If we've been handed a null observable, nothing more to do. 
        if (!rowData) return;

        // Subcribe to our new rowData source.
        this.rowDataSubscription = rowData.subscribe((newData: any[]) => {
            this.updateRowData(newData);
        });
    }

    private updateRowData(newData: any[]) {
        // When the data observable provides new data, handle it in a similar way to
        // how setRowData used to work, but use updateRowData on the nodeManager instead
        // of setRowData, and telling anything waiting for data updates that it's cool
        // to keep rendered rows, as we're trying to keep the same row nodes in place
        // wherever possible.

        this.nodeManager.updateRowData(newData);

        // Refresh the model, provided the column controller is ready.
        if (this.columnController.isReady()) {
            // Tell downstream that it is OK to keep rendered rows, as we've tried to maintain
            // the same set of nodes wherever possible.
            this.refreshModel({step: Constants.STEP_EVERYTHING, keepRenderedRows: true});
        }

        // - update selection
        // - update filters
        // - shows 'no rows' overlay if needed
        this.eventService.dispatchEvent(Events.EVENT_ROW_DATA_CHANGED);
    }

    private doRowsToDisplay() {
        this.rowsToDisplay = <RowNode[]> this.flattenStage.execute({rowNode: this.rootNode});
    }

    public insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void {
        console.error('ag-Grid-rx: insertItemsAtIndex not supported by observableInMemoryRowController');
    }

    public onRowHeightChanged(): void {
        this.refreshModel({step: Constants.STEP_MAP, keepRenderedRows: true, keepEditingRows: true});
    }

    public resetRowHeights(): void {
        this.forEachNode( (rowNode: RowNode) => rowNode.setRowHeight(null) );
        this.onRowHeightChanged();
    }

    public removeItems(rowNodes: RowNode[], skipRefresh: boolean): void {
        console.error('ag-Grid-rx: removeItems not supported by observableInMemoryRowController');
    }

    public addItems(items: any[], skipRefresh: boolean): void {
        console.error('ag-Grid-rx: addItems not supported by observableInMemoryRowController');
    }

}
