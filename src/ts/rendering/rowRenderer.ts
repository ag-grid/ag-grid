import {Utils as _} from "../utils";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {GridPanel, RowContainerComponents} from "../gridPanel/gridPanel";
import {ExpressionService} from "../valueService/expressionService";
import {TemplateService} from "../templateService";
import {ValueService} from "../valueService/valueService";
import {EventService} from "../eventService";
import {RowComp} from "./rowComp";
import {Column} from "../entities/column";
import {RowNode} from "../entities/rowNode";
import {Events, ModelUpdatedEvent, ViewportChangedEvent} from "../events";
import {Constants} from "../constants";
import {CellComp} from "./cellComp";
import {Autowired, Bean, Context, Optional, PostConstruct, PreDestroy, Qualifier} from "../context/context";
import {GridCore} from "../gridCore";
import {ColumnApi} from "../columnController/columnApi";
import {ColumnController} from "../columnController/columnController";
import {Logger, LoggerFactory} from "../logger";
import {FocusedCellController} from "../focusedCellController";
import {IRangeController} from "../interfaces/iRangeController";
import {CellNavigationService} from "../cellNavigationService";
import {GridCell} from "../entities/gridCell";
import {NavigateToNextCellParams, TabToNextCellParams} from "../entities/gridOptions";
import {RowContainerComponent} from "./rowContainerComponent";
import {BeanStub} from "../context/beanStub";
import {PaginationProxy} from "../rowModels/paginationProxy";
import {GridApi, RefreshCellsParams} from "../gridApi";
import {PinnedRowModel} from "../rowModels/pinnedRowModel";
import {Beans} from "./beans";
import {AnimationFrameService} from "../misc/animationFrameService";

@Bean('rowRenderer')
export class RowRenderer extends BeanStub {

    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridCore') private gridCore: GridCore;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('$scope') private $scope: any;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('templateService') private templateService: TemplateService;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('context') private context: Context;
    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('cellNavigationService') private cellNavigationService: CellNavigationService;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('beans') private beans: Beans;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Optional('rangeController') private rangeController: IRangeController;

    private firstRenderedRow: number;
    private lastRenderedRow: number;

    // map of row ids to row objects. keeps track of which elements
    // are rendered for which rows in the dom.
    private rowCompsByIndex: {[key: string]: RowComp} = {};
    private floatingTopRowComps: RowComp[] = [];
    private floatingBottomRowComps: RowComp[] = [];

    private forPrint: boolean;
    private autoHeight: boolean;

    private rowContainers: RowContainerComponents;

    private pinningLeft: boolean;
    private pinningRight: boolean;

    // we only allow one refresh at a time, otherwise the internal memory structure here
    // will get messed up. this can happen if the user has a cellRenderer, and inside the
    // renderer they call an API method that results in another pass of the refresh,
    // then it will be trying to draw rows in the middle of a refresh.
    private refreshInProgress = false;

    private logger: Logger;

    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('RowRenderer');
    }

    @PostConstruct
    public init(): void {
        this.forPrint = this.gridOptionsWrapper.isForPrint();
        this.autoHeight = this.gridOptionsWrapper.isAutoHeight();

        this.rowContainers = this.gridPanel.getRowContainers();
        this.addDestroyableEventListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onPageLoaded.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));

        this.redrawAfterModelUpdate();
    }

    private onPageLoaded(refreshEvent?: ModelUpdatedEvent): void {
        if (_.missing(refreshEvent)) {
            refreshEvent = {
                type: Events.EVENT_MODEL_UPDATED,
                api: this.gridApi,
                columnApi: this.columnApi,
                animate: false,
                keepRenderedRows: false,
                newData: false,
                newPage: false
            };
        }
        this.onModelUpdated(refreshEvent);
    }

    public getAllCellsForColumn(column: Column): HTMLElement[] {
        let eCells: HTMLElement[] = [];

        _.iterateObject(this.rowCompsByIndex, callback);
        _.iterateObject(this.floatingBottomRowComps, callback);
        _.iterateObject(this.floatingTopRowComps, callback);

        function callback(key: any, rowComp: RowComp) {
            let eCell = rowComp.getCellForCol(column);
            if (eCell) {
                eCells.push(eCell);
            }
        }

        return eCells;
    }

    public refreshFloatingRowComps(): void {
        this.refreshFloatingRows(
            this.floatingTopRowComps,
            this.pinnedRowModel.getPinnedTopRowData(),
            this.rowContainers.floatingTopPinnedLeft,
            this.rowContainers.floatingTopPinnedRight,
            this.rowContainers.floatingTop,
            this.rowContainers.floatingTopFullWidth);
        this.refreshFloatingRows(
            this.floatingBottomRowComps,
            this.pinnedRowModel.getPinnedBottomRowData(),
            this.rowContainers.floatingBottomPinnedLeft,
            this.rowContainers.floatingBottomPinnedRight,
            this.rowContainers.floatingBottom,
            this.rowContainers.floatingBottomFullWith);
    }

    private refreshFloatingRows(rowComps: RowComp[], rowNodes: RowNode[],
                                pinnedLeftContainerComp: RowContainerComponent, pinnedRightContainerComp: RowContainerComponent,
                                bodyContainerComp: RowContainerComponent, fullWidthContainerComp: RowContainerComponent): void {
        rowComps.forEach( (row: RowComp) => {
            row.destroy();
        });

        rowComps.length = 0;

        // if no cols, don't draw row - can we get rid of this???
        let columns = this.columnController.getAllDisplayedColumns();
        if (_.missingOrEmpty(columns)) { return; }

        if (rowNodes) {
            rowNodes.forEach( (node: RowNode) => {

                let rowComp = new RowComp(this.$scope, bodyContainerComp,
                        pinnedLeftContainerComp, pinnedRightContainerComp,
                        fullWidthContainerComp, node, this.beans, false, false);

                rowComp.init();
                rowComps.push(rowComp);
            })
        }

        this.flushContainers(rowComps);

    }

    private onPinnedRowDataChanged(): void {
        this.redrawAfterModelUpdate();
    }

    private onModelUpdated(refreshEvent: ModelUpdatedEvent): void {
        let params: RefreshViewParams = {
            recycleRows: refreshEvent.keepRenderedRows,
            animate: refreshEvent.animate,
            newData: refreshEvent.newData,
            newPage: refreshEvent.newPage
        };
        this.redrawAfterModelUpdate(params);
        // this.eventService.dispatchEvent(Events.DEPRECATED_EVENT_PAGINATION_PAGE_LOADED);
    }

    // if the row nodes are not rendered, no index is returned
    private getRenderedIndexesForRowNodes(rowNodes: RowNode[]): string[] {
        let result: string[] = [];
        if (_.missing(rowNodes)) { return result; }
        _.iterateObject(this.rowCompsByIndex, (index: string, renderedRow: RowComp)=> {
            let rowNode = renderedRow.getRowNode();
            if (rowNodes.indexOf(rowNode)>=0) {
                result.push(index);
            }
        });
        return result;
    }

    public redrawRows(rowNodes: RowNode[]): void {
        if (!rowNodes || rowNodes.length==0) {
            return;
        }

        // we only need to be worried about rendered rows, as this method is
        // called to whats rendered. if the row isn't rendered, we don't care
        let indexesToRemove = this.getRenderedIndexesForRowNodes(rowNodes);

        // remove the rows
        this.removeRowComps(indexesToRemove);

        // add draw them again
        this.redrawAfterModelUpdate({
            recycleRows: true
        });
    }

    private getCellToRestoreFocusToAfterRefresh(params: RefreshViewParams): GridCell {
        let focusedCell = params.suppressKeepFocus ? null : this.focusedCellController.getFocusCellToUseAfterRefresh();

        if (_.missing(focusedCell)) {
            return null;
        }

        // if the dom is not actually focused on a cell, then we don't try to refocus. the problem this
        // solves is with editing - if the user is editing, eg focus is on a text field, and not on the
        // cell itself, then the cell can be registered as having focus, however it's the text field that
        // has the focus and not the cell div. therefore, when the refresh is finished, the grid will focus
        // the cell, and not the textfield. that means if the user is in a text field, and the grid refreshes,
        // the focus is lost from the text field. we do not want this.
        let activeElement = document.activeElement;
        let domData = this.gridOptionsWrapper.getDomData(activeElement, CellComp.DOM_DATA_KEY_CELL_COMP);
        let elementIsNotACellDev = _.missing(domData);
        if (elementIsNotACellDev) {
            return null;
        }

        return focusedCell;
    }

    // gets called after changes to the model.
    public redrawAfterModelUpdate(params: RefreshViewParams = {}): void {

        this.getLockOnRefresh();

        let focusedCell: GridCell = this.getCellToRestoreFocusToAfterRefresh(params);

        if (!this.forPrint) {
            this.sizeContainerToPageHeight();
        }

        this.scrollToTopIfNewData(params);

        // never keep rendered rows if doing forPrint or autoHeight, as we do not use 'top' to
        // position the rows (it uses normal flow), so we have to remove
        // all rows and insert them again from scratch
        let rowsUsingFlow = this.forPrint || this.autoHeight;
        let recycleRows = rowsUsingFlow ? false : params.recycleRows;
        let animate = rowsUsingFlow ? false : (params.animate && this.gridOptionsWrapper.isAnimateRows());

        let rowsToRecycle: {[key: string]: RowComp} = this.binRowComps(recycleRows);

        this.redraw(rowsToRecycle, animate);

        if (!params.onlyBody){
            this.refreshFloatingRowComps();
        }

        this.restoreFocusedCell(focusedCell);

        this.releaseLockOnRefresh();
    }

    private scrollToTopIfNewData(params: RefreshViewParams): void {
        let scrollToTop = params.newData || params.newPage;
        let suppressScrollToTop = this.gridOptionsWrapper.isSuppressScrollOnNewData();
        if (scrollToTop && !suppressScrollToTop) {
            this.gridPanel.scrollToTop();
        }
    }

    private sizeContainerToPageHeight(): void {
        let containerHeight = this.paginationProxy.getCurrentPageHeight();
        // we need at least 1 pixel for the horizontal scroll to work. so if there are now rows,
        // we still want the scroll to be present, otherwise there would be no way to access the columns
        // on the RHS - and if that was where the filter was that cause no rows to be presented, there
        // is no way to remove the filter.
        if (containerHeight===0) { containerHeight = 1; }
        this.rowContainers.body.setHeight(containerHeight);
        this.rowContainers.fullWidth.setHeight(containerHeight);
        this.rowContainers.pinnedLeft.setHeight(containerHeight);
        this.rowContainers.pinnedRight.setHeight(containerHeight);
    }

    private getLockOnRefresh(): void {
        if (this.refreshInProgress) {
            throw 'ag-Grid: cannot get grid to draw rows when it is in the middle of drawing rows. ' +
            'Your code probably called a grid API method while the grid was in the render stage. To overcome ' +
            'this, put the API call into a timeout, eg instead of api.refreshView(), ' +
            'call setTimeout(function(){api.refreshView(),0}). To see what part of your code ' +
            'that caused the refresh check this stacktrace.';
        }

        this.refreshInProgress = true;
    }

    private releaseLockOnRefresh(): void {
        this.refreshInProgress = false;
    }

    // sets the focus to the provided cell, if the cell is provided. this way, the user can call refresh without
    // worry about the focus been lost. this is important when the user is using keyboard navigation to do edits
    // and the cellEditor is calling 'refresh' to get other cells to update (as other cells might depend on the
    // edited cell).
    private restoreFocusedCell(gridCell: GridCell): void {
        if (gridCell) {
            this.focusedCellController.setFocusedCell(gridCell.rowIndex, gridCell.column, gridCell.floating, true);
        }
    }

    public stopEditing(cancel: boolean = false) {
        this.forEachRowComp( (key: string, renderedRow: RowComp) => {
            renderedRow.stopEditing(cancel);
        });
    }

    public forEachCellComp(callback: (renderedCell: CellComp)=>void): void {
        _.iterateObject(this.rowCompsByIndex, (index: any, renderedRow: RowComp)=> {
            renderedRow.forEachCellComp(callback);
        });
    }

    private forEachRowComp(callback: (key: string, rowComp: RowComp)=>void): void {
        _.iterateObject(this.rowCompsByIndex, callback);
        _.iterateObject(this.floatingTopRowComps, callback);
        _.iterateObject(this.floatingBottomRowComps, callback);
    }

    public addRenderedRowListener(eventName: string, rowIndex: number, callback: Function): void {
        let rowComp = this.rowCompsByIndex[rowIndex];
        if (rowComp) {
            rowComp.addEventListener(eventName, callback);
        }
    }

    public refreshCells(params: RefreshCellsParams = {}): void {

        let rowIdsMap: any;
        if (_.exists(params.rowNodes)) {
            rowIdsMap = {
                top: {},
                bottom: {},
                normal: {}
            };
            params.rowNodes.forEach( rowNode => {
                if (rowNode.rowPinned===Constants.PINNED_TOP) {
                    rowIdsMap.top[rowNode.id] = true;
                } else if (rowNode.rowPinned===Constants.PINNED_BOTTOM) {
                    rowIdsMap.bottom[rowNode.id] = true;
                } else {
                    rowIdsMap.normal[rowNode.id] = true;
                }
            });
        }

        let colIdsMap: any;
        if (_.exists(params.columns)) {
            colIdsMap = {};
            params.columns.forEach( (colKey: string|Column) => {
                let column: Column = this.columnController.getGridColumn(colKey);
                if (_.exists(column)) {
                    colIdsMap[column.getId()] = true
                }
            });
        }

        let processRow = (rowComp: RowComp) => {
            let rowNode: RowNode = rowComp.getRowNode();

            let id = rowNode.id;
            let floating = rowNode.rowPinned;

            // skip this row if it is missing from the provided list
            if (_.exists(rowIdsMap)) {
                if (floating===Constants.PINNED_BOTTOM) {
                    if (!rowIdsMap.bottom[id]) { return; }
                } else if (floating===Constants.PINNED_TOP) {
                    if (!rowIdsMap.top[id]) { return; }
                } else {
                    if (!rowIdsMap.normal[id]) { return; }
                }
            }

            rowComp.forEachCellComp( cellComp => {

                let colId: string = cellComp.getColumn().getId();
                let excludeColFromRefresh = colIdsMap && !colIdsMap[colId];
                if (excludeColFromRefresh) { return; }

                cellComp.refreshCell({
                    forceRefresh: params.force,
                    newData: false
                });
            });
        };

        _.iterateObject(this.rowCompsByIndex, (index: string, rowComp: RowComp)=> {
            processRow(rowComp);
        });

        if (this.floatingTopRowComps) {
            this.floatingTopRowComps.forEach(processRow);
        }

        if (this.floatingBottomRowComps) {
            this.floatingBottomRowComps.forEach(processRow);
        }
    }

    @PreDestroy
    public destroy() {
        super.destroy();

        let rowIndexesToRemove = Object.keys(this.rowCompsByIndex);
        this.removeRowComps(rowIndexesToRemove);
    }

    private binRowComps(recycleRows: boolean): {[key: string]: RowComp} {

        let indexesToRemove: string[];
        let rowsToRecycle: {[key: string]: RowComp} = {};

        if (recycleRows) {
            indexesToRemove = [];
            _.iterateObject(this.rowCompsByIndex, (index: string, rowComp: RowComp)=> {
                let rowNode = rowComp.getRowNode();
                if (_.exists(rowNode.id)) {
                    rowsToRecycle[rowNode.id] = rowComp;
                    delete this.rowCompsByIndex[index];
                } else {
                    indexesToRemove.push(index);
                }
            });
        } else {
            indexesToRemove = Object.keys(this.rowCompsByIndex);
        }

        this.removeRowComps(indexesToRemove);

        return rowsToRecycle;
    }

    // takes array of row indexes
    private removeRowComps(rowsToRemove: any[]) {
        // if no fromIndex then set to -1, which will refresh everything
        // let realFromIndex = -1;
        rowsToRemove.forEach( indexToRemove => {
            let renderedRow = this.rowCompsByIndex[indexToRemove];
            renderedRow.destroy();
            delete this.rowCompsByIndex[indexToRemove];
        });
    }

    // gets called when rows don't change, but viewport does, so after:
    // 1) size of grid changed
    // 2) grid scrolled to new position
    // 3) ensure index visible (which is a scroll)
    public redrawAfterScroll() {
        this.getLockOnRefresh();
        this.redraw(null, false, true);
        this.releaseLockOnRefresh();
    }

    private removeRowCompsNotToDraw(indexesToDraw: number[]): void {
        // for speedy lookup, dump into map
        let indexesToDrawMap: {[index: string]: boolean} = {};
        indexesToDraw.forEach(index => indexesToDrawMap[index] = true);

        let existingIndexes = Object.keys(this.rowCompsByIndex);
        let indexesNotToDraw: string[] = _.filter(existingIndexes, index => !indexesToDrawMap[index]);

        this.removeRowComps(indexesNotToDraw);
    }

    private calculateIndexesToDraw(): number[] {
        // all in all indexes in the viewport
        let indexesToDraw = _.createArrayOfNumbers(this.firstRenderedRow, this.lastRenderedRow);

        // add in indexes of rows we want to keep, because they are currently editing
        _.iterateObject(this.rowCompsByIndex, (indexStr: string, rowComp: RowComp) => {
            let index = Number(indexStr);
            if (index < this.firstRenderedRow || index > this.lastRenderedRow) {
                if (this.keepRowBecauseEditing(rowComp)) {
                    indexesToDraw.push(index);
                }
            }
        });

        indexesToDraw.sort( (a: number, b: number) => a - b);

        return indexesToDraw
    }

    private redraw(rowsToRecycle?: {[key: string]: RowComp}, animate = false, afterScroll = false) {
        this.workOutFirstAndLastRowsToRender();

        // the row can already exist and be in the following:
        // rowsToRecycle -> if model change, then the index may be different, however row may
        //                         exist here from previous time (mapped by id).
        // this.rowCompsByIndex -> if just a scroll, then this will contain what is currently in the viewport

        // this is all the indexes we want, including those that already exist, so this method
        // will end up going through each index and drawing only if the row doesn't already exist
        let indexesToDraw = this.calculateIndexesToDraw();

        this.removeRowCompsNotToDraw(indexesToDraw);

        // add in new rows
        let nextVmTurnFunctions: Function[] = [];

        let rowComps: RowComp[] = [];
        indexesToDraw.forEach( rowIndex => {
            let rowComp = this.createOrUpdateRowComp(rowIndex, rowsToRecycle, animate, afterScroll);
            if (_.exists(rowComp)) {
                rowComps.push(rowComp);
                _.pushAll(nextVmTurnFunctions, rowComp.getAndClearNextVMTurnFunctions());
            }
        });

        this.flushContainers(rowComps);

        _.executeNextVMTurn(nextVmTurnFunctions);

        if (afterScroll && !this.gridOptionsWrapper.isSuppressAnimationFrame()) {
            this.beans.taskQueue.addP2Task(this.destroyRowComps.bind(this, rowsToRecycle, animate));
        } else {
            this.destroyRowComps(rowsToRecycle, animate);
        }

        this.checkAngularCompile();
    }

    private flushContainers(rowComps: RowComp[]): void {
        _.iterateObject(this.rowContainers, (key: string, rowContainerComp: RowContainerComponent) => {
            if (rowContainerComp) {
                rowContainerComp.flushRowTemplates();
            }
        });

        rowComps.forEach( rowComp => rowComp.afterFlush());
    }

    private onDisplayedColumnsChanged(): void {
        let pinningLeft = this.columnController.isPinningLeft();
        let pinningRight = this.columnController.isPinningRight();
        let atLeastOneChanged = this.pinningLeft!==pinningLeft || pinningRight!==this.pinningRight;
        if (atLeastOneChanged) {
            this.pinningLeft = pinningLeft;
            this.pinningRight = pinningRight;
            if (this.gridOptionsWrapper.isEmbedFullWidthRows()) {
                this.redrawFullWidthEmbeddedRows();
            }
        }
    }

    // when embedding, what gets showed in each section depends on what is pinned. eg if embedding group expand / collapse,
    // then it should go into the pinned left area if pinning left, or the center area if not pinning.
    private redrawFullWidthEmbeddedRows(): void {
        // if either of the pinned panels has shown / hidden, then need to redraw the fullWidth bits when
        // embedded, as what appears in each section depends on whether we are pinned or not
        let rowsToRemove: string[] = [];
        this.forEachRowComp( (id: string, rowComp: RowComp) => {
            if (rowComp.isFullWidth()) {
                let rowIndex = rowComp.getRowNode().rowIndex;
                rowsToRemove.push(rowIndex.toString());
            }
        });
        this.removeRowComps(rowsToRemove);
        this.redrawAfterScroll();
    }

    private createOrUpdateRowComp(rowIndex: number, rowsToRecycle: {[key: string]: RowComp},
                                  animate: boolean, afterScroll: boolean): RowComp {

        let rowNode: RowNode;

        let rowComp: RowComp = this.rowCompsByIndex[rowIndex];

        // if no row comp, see if we can get it from the previous rowComps
        if (!rowComp) {
            rowNode = this.paginationProxy.getRow(rowIndex);
            if (_.exists(rowNode) && _.exists(rowsToRecycle) && rowsToRecycle[rowNode.id]) {
                rowComp = rowsToRecycle[rowNode.id];
                rowsToRecycle[rowNode.id] = null;
            }
        }

        let creatingNewRowComp = !rowComp;

        if (creatingNewRowComp) {
            // create a new one
            if (!rowNode) {
                rowNode = this.paginationProxy.getRow(rowIndex);
            }
            if (_.exists(rowNode)) {
                rowComp = this.createRowComp(rowNode, animate, afterScroll);
            } else {
                // this should never happen - if somehow we are trying to create
                // a row for a rowNode that does not exist.
                return;
            }
        } else {
            // ensure row comp is in right position in DOM
            rowComp.ensureDomOrder();
        }

        this.rowCompsByIndex[rowIndex] = rowComp;

        return rowComp;
    }

    private destroyRowComps(rowCompsMap: {[key: string]: RowComp}, animate: boolean): void {
        let delayedFuncs: Function[] = [];
        _.iterateObject(rowCompsMap, (nodeId: string, rowComp: RowComp) => {
            // if row was used, then it's null
            if (!rowComp) { return; }
            rowComp.destroy(animate);
            _.pushAll(delayedFuncs, rowComp.getAndClearDelayedDestroyFunctions());
        });
        _.executeInAWhile(delayedFuncs);
    }

    private checkAngularCompile(): void {
        // if we are doing angular compiling, then do digest the scope here
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            // we do it in a timeout, in case we are already in an apply
            setTimeout( () => { this.$scope.$apply(); }, 0);
        }
    }

    private workOutFirstAndLastRowsToRender(): void {

        let newFirst: number;
        let newLast: number;

        if (!this.paginationProxy.isRowsToRender()) {
            newFirst = 0;
            newLast = -1; // setting to -1 means nothing in range
        } else {

            let pageFirstRow = this.paginationProxy.getPageFirstRow();
            let pageLastRow = this.paginationProxy.getPageLastRow();

            if (this.forPrint) {
                newFirst = pageFirstRow;
                newLast = pageLastRow;
            } else {

                let pixelOffset = this.paginationProxy ? this.paginationProxy.getPixelOffset() : 0;

                let bodyVRange = this.gridPanel.getVerticalPixelRange();
                let topPixel = bodyVRange.top;
                let bottomPixel = bodyVRange.bottom;

                let first = this.paginationProxy.getRowIndexAtPixel(topPixel + pixelOffset);
                let last = this.paginationProxy.getRowIndexAtPixel(bottomPixel + pixelOffset);

                //add in buffer
                let buffer = this.gridOptionsWrapper.getRowBuffer();
                first = first - buffer;
                last = last + buffer;

                // adjust, in case buffer extended actual size
                if (first < pageFirstRow) {
                    first = pageFirstRow;
                }

                if (last > pageLastRow) {
                    last = pageLastRow;
                }

                newFirst = first;
                newLast = last;
            }
        }

        let firstDiffers = newFirst !== this.firstRenderedRow;
        let lastDiffers = newLast !== this.lastRenderedRow;
        if (firstDiffers || lastDiffers) {
            this.firstRenderedRow = newFirst;
            this.lastRenderedRow = newLast;

            let event: ViewportChangedEvent = {
                type: Events.EVENT_VIEWPORT_CHANGED,
                firstRow: newFirst,
                lastRow: newLast,
                api: this.gridApi,
                columnApi: this.columnApi
            };

            this.eventService.dispatchEvent(event);
        }
    }

    public getFirstVirtualRenderedRow() {
        return this.firstRenderedRow;
    }

    public getLastVirtualRenderedRow() {
        return this.lastRenderedRow;
    }

    // check that none of the rows to remove are editing or focused as:
    // a) if editing, we want to keep them, otherwise the user will loose the context of the edit,
    //    eg user starts editing, enters some text, then scrolls down and then up, next time row rendered
    //    the edit is reset - so we want to keep it rendered.
    // b) if focused, we want ot keep keyboard focus, so if user ctrl+c, it goes to clipboard,
    //    otherwise the user can range select and drag (with focus cell going out of the viewport)
    //    and then ctrl+c, nothing will happen if cell is removed from dom.
    private keepRowBecauseEditing(rowComp: RowComp): boolean {

        let REMOVE_ROW : boolean = false;
        let KEEP_ROW : boolean = true;
        let rowNode = rowComp.getRowNode();

        let rowHasFocus = this.focusedCellController.isRowNodeFocused(rowNode);
        let rowIsEditing = rowComp.isEditing();

        let mightWantToKeepRow = rowHasFocus || rowIsEditing;

        // if we deffo don't want to keep it,
        if (!mightWantToKeepRow) { return REMOVE_ROW; }

        // editing row, only remove if it is no longer rendered, eg filtered out or new data set.
        // the reason we want to keep is if user is scrolling up and down, we don't want to loose
        // the context of the editing in process.
        let rowNodePresent = this.paginationProxy.isRowPresent(rowNode);
        return rowNodePresent ? KEEP_ROW : REMOVE_ROW;
    }

    private createRowComp(rowNode: RowNode, animate: boolean, afterScroll: boolean): RowComp {

        let useAnimationFrameForCreate = afterScroll && !this.gridOptionsWrapper.isSuppressAnimationFrame();

        let rowComp = new RowComp(this.$scope, this.rowContainers.body,
                this.rowContainers.pinnedLeft, this.rowContainers.pinnedRight,
                this.rowContainers.fullWidth, rowNode, this.beans, animate, useAnimationFrameForCreate);

        rowComp.init();

        return rowComp;
    }

    public getRenderedNodes() {
        let renderedRows = this.rowCompsByIndex;
        return Object.keys(renderedRows).map(key => {
            return renderedRows[key].getRowNode();
        });
    }

    // we use index for rows, but column object for columns, as the next column (by index) might not
    // be visible (header grouping) so it's not reliable, so using the column object instead.
    public navigateToNextCell(event: KeyboardEvent, key: number, previousCell: GridCell, allowUserOverride: boolean) {

        let nextCell = previousCell;

        // we keep searching for a next cell until we find one. this is how the group rows get skipped
        while (true) {
            nextCell = this.cellNavigationService.getNextCellToFocus(key, nextCell);

            if (_.missing(nextCell)) {
                break;
            }

            let skipGroupRows = this.gridOptionsWrapper.isGroupUseEntireRow();
            if (skipGroupRows) {
                let rowNode = this.paginationProxy.getRow(nextCell.rowIndex);
                if (!rowNode.group) {
                    break;
                }
            } else {
                break;
            }
        }

        // allow user to override what cell to go to next. when doing normal cell navigation (with keys)
        // we allow this, however if processing 'enter after edit' we don't allow override
        if (allowUserOverride) {
            let userFunc = this.gridOptionsWrapper.getNavigateToNextCellFunc();
            if (_.exists(userFunc)) {
                let params = <NavigateToNextCellParams> {
                    key: key,
                    previousCellDef: previousCell,
                    nextCellDef: nextCell ? nextCell.getGridCellDef() : null,
                    event: event
                };
                let nextCellDef = userFunc(params);
                if (_.exists(nextCellDef)) {
                    nextCell = new GridCell(nextCellDef);
                } else {
                    nextCell = null;
                }
            }
        }

        // no next cell means we have reached a grid boundary, eg left, right, top or bottom of grid
        if (!nextCell) {
            return;
        }

        // this scrolls the row into view
        if (_.missing(nextCell.floating)) {
            this.gridPanel.ensureIndexVisible(nextCell.rowIndex);
        }

        if (!nextCell.column.isPinned()) {
            this.gridPanel.ensureColumnVisible(nextCell.column);
        }

        // need to nudge the scrolls for the floating items. otherwise when we set focus on a non-visible
        // floating cell, the scrolls get out of sync
        this.gridPanel.horizontallyScrollHeaderCenterAndFloatingCenter();

        // need to flush frames, to make sure the correct cells are rendered
        this.animationFrameService.flushAllFrames();

        this.focusedCellController.setFocusedCell(nextCell.rowIndex, nextCell.column, nextCell.floating, true);
        if (this.rangeController) {
            let gridCell = new GridCell({rowIndex: nextCell.rowIndex, floating: nextCell.floating, column: nextCell.column});
            this.rangeController.setRangeToCell(gridCell);
        }
    }

    public startEditingCell(gridCell: GridCell, keyPress: number, charPress: string): void {
        let cell = this.getComponentForCell(gridCell);
        if (cell) {
            cell.startRowOrCellEdit(keyPress, charPress);
        }
    }

    private getComponentForCell(gridCell: GridCell): CellComp {
        let rowComponent: RowComp;
        switch (gridCell.floating) {
            case Constants.PINNED_TOP:
                rowComponent = this.floatingTopRowComps[gridCell.rowIndex];
                break;
            case Constants.PINNED_BOTTOM:
                rowComponent = this.floatingBottomRowComps[gridCell.rowIndex];
                break;
            default:
                rowComponent = this.rowCompsByIndex[gridCell.rowIndex];
                break;
        }

        if (!rowComponent) {
            return null;
        }

        let cellComponent: CellComp = rowComponent.getRenderedCellForColumn(gridCell.column);
        return cellComponent;
    }

    public onTabKeyDown(previousRenderedCell: CellComp, keyboardEvent: KeyboardEvent): void {
        let backwards = keyboardEvent.shiftKey;
        let success = this.moveToCellAfter(previousRenderedCell, backwards);
        if (success) {
            keyboardEvent.preventDefault();
        }
    }

    public tabToNextCell(backwards: boolean): boolean {
        let focusedCell = this.focusedCellController.getFocusedCell();
        // if no focus, then cannot navigate
        if (_.missing(focusedCell)) { return false; }
        let renderedCell = this.getComponentForCell(focusedCell);
        // if cell is not rendered, means user has scrolled away from the cell
        if (_.missing(renderedCell)) { return false; }

        let result = this.moveToCellAfter(renderedCell, backwards);
        return result;
    }

    private moveToCellAfter(previousRenderedCell: CellComp, backwards: boolean): boolean {
        let editing = previousRenderedCell.isEditing();
        let res: boolean;
        if (editing) {
            if (this.gridOptionsWrapper.isFullRowEdit()) {
                res = this.moveToNextEditingRow(previousRenderedCell, backwards);
            } else {
                res = this.moveToNextEditingCell(previousRenderedCell, backwards);
            }
        } else {
            res = this.moveToNextCellNotEditing(previousRenderedCell, backwards);
        }
        return res;
    }

    private moveToNextEditingCell(previousRenderedCell: CellComp, backwards: boolean): boolean {

        let gridCell = previousRenderedCell.getGridCell();

        // need to do this before getting next cell to edit, in case the next cell
        // has editable function (eg colDef.editable=func() ) and it depends on the
        // result of this cell, so need to save updates from the first edit, in case
        // the value is referenced in the function.
        previousRenderedCell.stopEditing();

        // find the next cell to start editing
        let nextRenderedCell = this.findNextCellToFocusOn(gridCell, backwards, true);

        let foundCell = _.exists(nextRenderedCell);

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (foundCell) {
            nextRenderedCell.startEditingIfEnabled(null, null, true);
            nextRenderedCell.focusCell(false);
        }

        return foundCell;
    }

    private moveToNextEditingRow(previousRenderedCell: CellComp, backwards: boolean): boolean {

        let gridCell = previousRenderedCell.getGridCell();

        // find the next cell to start editing
        let nextRenderedCell = this.findNextCellToFocusOn(gridCell, backwards, true);

        let foundCell = _.exists(nextRenderedCell);

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (foundCell) {
            this.moveEditToNextCellOrRow(previousRenderedCell, nextRenderedCell);
        }

        return foundCell;
    }

    private moveToNextCellNotEditing(previousRenderedCell: CellComp, backwards: boolean): boolean {
        let gridCell = previousRenderedCell.getGridCell();

        // find the next cell to start editing
        let nextRenderedCell = this.findNextCellToFocusOn(gridCell, backwards, false);

        let foundCell = _.exists(nextRenderedCell);

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (foundCell) {
            nextRenderedCell.focusCell(true);
        }

        return foundCell;
    }

    private moveEditToNextCellOrRow(previousRenderedCell: CellComp, nextRenderedCell: CellComp): void {
        let pGridCell = previousRenderedCell.getGridCell();
        let nGridCell = nextRenderedCell.getGridCell();

        let rowsMatch = (pGridCell.rowIndex === nGridCell.rowIndex)
            && (pGridCell.floating === nGridCell.floating);

        if (rowsMatch) {
            // same row, so we don't start / stop editing, we just move the focus along
            previousRenderedCell.setFocusOutOnEditor();
            nextRenderedCell.setFocusInOnEditor();
        } else {
            let pRow = previousRenderedCell.getRenderedRow();
            let nRow = nextRenderedCell.getRenderedRow();

            previousRenderedCell.setFocusOutOnEditor();
            pRow.stopEditing();

            nRow.startRowEditing();
            nextRenderedCell.setFocusInOnEditor();
        }

        nextRenderedCell.focusCell();
    }

    // called by the cell, when tab is pressed while editing.
    // @return: RenderedCell when navigation successful, otherwise null
    private findNextCellToFocusOn(gridCell: GridCell, backwards: boolean, startEditing: boolean): CellComp {

        let nextCell: GridCell = gridCell;

        while (true) {

            nextCell = this.cellNavigationService.getNextTabbedCell(nextCell, backwards);

            // allow user to override what cell to go to next
            let userFunc = this.gridOptionsWrapper.getTabToNextCellFunc();
            if (_.exists(userFunc)) {
                let params = <TabToNextCellParams> {
                    backwards: backwards,
                    editing: startEditing,
                    previousCellDef: gridCell.getGridCellDef(),
                    nextCellDef: nextCell ? nextCell.getGridCellDef() : null
                };
                let nextCellDef = userFunc(params);
                if (_.exists(nextCellDef)) {
                    nextCell = new GridCell(nextCellDef);
                } else {
                    nextCell = null;
                }
            }

            // if no 'next cell', means we have got to last cell of grid, so nothing to move to,
            // so bottom right cell going forwards, or top left going backwards
            if (!nextCell) {
                return null;
            }

            // this scrolls the row into view
            let cellIsNotFloating = _.missing(nextCell.floating);
            if (cellIsNotFloating) {
                this.gridPanel.ensureIndexVisible(nextCell.rowIndex);
            }

            // pinned columns don't scroll, so no need to ensure index visible
            if (!nextCell.column.isPinned()) {
                this.gridPanel.ensureColumnVisible(nextCell.column);
            }

            // need to nudge the scrolls for the floating items. otherwise when we set focus on a non-visible
            // floating cell, the scrolls get out of sync
            this.gridPanel.horizontallyScrollHeaderCenterAndFloatingCenter();

            // get the grid panel to flush all animation frames - otherwise the call below to get the cellComp
            // could fail, if we just scrolled the grid (to make a cell visible) and the rendering hasn't finished.
            this.animationFrameService.flushAllFrames();

            // we have to call this after ensureColumnVisible - otherwise it could be a virtual column
            // or row that is not currently in view, hence the renderedCell would not exist
            let nextCellComp = this.getComponentForCell(nextCell);

            // if next cell is fullWidth row, then no rendered cell,
            // as fullWidth rows have no cells, so we skip it
            if (_.missing(nextCellComp)) {
                continue;
            }

            // if editing, but cell not editable, skip cell
            if (startEditing && !nextCellComp.isCellEditable()) {
                continue;
            }

            if (nextCellComp.isSuppressNavigable()) {
                continue;
            }

            // by default, when we click a cell, it gets selected into a range, so to keep keyboard navigation
            // consistent, we set into range here also.
            if (this.rangeController) {
                let gridCell = new GridCell({rowIndex: nextCell.rowIndex, floating: nextCell.floating, column: nextCell.column});
                this.rangeController.setRangeToCell(gridCell);
            }

            // we successfully tabbed onto a grid cell, so return true
            return nextCellComp;
        }
    }

}

export interface RefreshViewParams {
    recycleRows?:boolean;
    animate?:boolean;
    suppressKeepFocus?:boolean;
    onlyBody?:boolean;
    // when new data, grid scrolls back to top
    newData?:boolean;
    newPage?:boolean;
}
