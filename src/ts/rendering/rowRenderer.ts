import {Utils as _, Timer} from "../utils";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {GridPanel, RowContainerComponents} from "../gridPanel/gridPanel";
import {ExpressionService} from "../expressionService";
import {TemplateService} from "../templateService";
import {ValueService} from "../valueService";
import {EventService} from "../eventService";
import {FloatingRowModel} from "../rowControllers/floatingRowModel";
import {RenderedRow} from "./renderedRow";
import {Column} from "../entities/column";
import {RowNode} from "../entities/rowNode";
import {Events, ModelUpdatedEvent} from "../events";
import {Constants} from "../constants";
import {RenderedCell} from "./renderedCell";
import {Bean, PreDestroy, Qualifier, Context, Autowired, PostConstruct, Optional} from "../context/context";
import {GridCore} from "../gridCore";
import {ColumnController} from "../columnController/columnController";
import {Logger, LoggerFactory} from "../logger";
import {IRowModel} from "../interfaces/iRowModel";
import {FocusedCellController} from "../focusedCellController";
import {IRangeController} from "../interfaces/iRangeController";
import {CellNavigationService} from "../cellNavigationService";
import {GridCell} from "../entities/gridCell";
import {NavigateToNextCellParams, TabToNextCellParams} from "../entities/gridOptions";
import {RowContainerComponent} from "./rowContainerComponent";
import {ColDef} from "../entities/colDef";

@Bean('rowRenderer')
export class RowRenderer {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridCore') private gridCore: GridCore;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('$compile') private $compile: any;
    @Autowired('$scope') private $scope: any;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('templateService') private templateService: TemplateService;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('floatingRowModel') private floatingRowModel: FloatingRowModel;
    @Autowired('context') private context: Context;
    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Optional('rangeController') private rangeController: IRangeController;
    @Autowired('cellNavigationService') private cellNavigationService: CellNavigationService;

    private firstRenderedRow: number;
    private lastRenderedRow: number;

    // map of row ids to row objects. keeps track of which elements
    // are rendered for which rows in the dom.
    private renderedRows: {[key: string]: RenderedRow} = {};
    private renderedTopFloatingRows: RenderedRow[] = [];
    private renderedBottomFloatingRows: RenderedRow[] = [];

    private rowContainers: RowContainerComponents;

    // we only allow one refresh at a time, otherwise the internal memory structure here
    // will get messed up. this can happen if the user has a cellRenderer, and inside the
    // renderer they call an API method that results in another pass of the refresh,
    // then it will be trying to draw rows in the middle of a refresh.
    private refreshInProgress = false;

    private logger: Logger;

    private destroyFunctions: Function[] = [];

    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('RowRenderer');
    }

    @PostConstruct
    public init(): void {
        this.rowContainers = this.gridPanel.getRowContainers();

        let modelUpdatedListener = this.onModelUpdated.bind(this);
        let floatingRowDataChangedListener = this.onFloatingRowDataChanged.bind(this);

        this.eventService.addEventListener(Events.EVENT_MODEL_UPDATED, modelUpdatedListener);
        this.eventService.addEventListener(Events.EVENT_FLOATING_ROW_DATA_CHANGED, floatingRowDataChangedListener);

        this.destroyFunctions.push( () => {
            this.eventService.removeEventListener(Events.EVENT_MODEL_UPDATED, modelUpdatedListener);
            this.eventService.removeEventListener(Events.EVENT_FLOATING_ROW_DATA_CHANGED, floatingRowDataChangedListener);
        });

        this.refreshView();
    }

    public getAllCellsForColumn(column: Column): HTMLElement[] {
        var eCells: HTMLElement[] = [];

        _.iterateObject(this.renderedRows, callback);
        _.iterateObject(this.renderedBottomFloatingRows, callback);
        _.iterateObject(this.renderedTopFloatingRows, callback);

        function callback(key: any, renderedRow: RenderedRow) {
            var eCell = renderedRow.getCellForCol(column);
            if (eCell) {
                eCells.push(eCell);
            }
        }

        return eCells;
    }

    public refreshAllFloatingRows(): void {
        this.refreshFloatingRows(
            this.renderedTopFloatingRows,
            this.floatingRowModel.getFloatingTopRowData(),
            this.rowContainers.floatingTopPinnedLeft,
            this.rowContainers.floatingTopPinnedRight,
            this.rowContainers.floatingTop,
            this.rowContainers.floatingTopFullWidth);
        this.refreshFloatingRows(
            this.renderedBottomFloatingRows,
            this.floatingRowModel.getFloatingBottomRowData(),
            this.rowContainers.floatingBottomPinnedLeft,
            this.rowContainers.floatingBottomPinnedRight,
            this.rowContainers.floatingBottom,
            this.rowContainers.floatingBottomFullWith);
    }

    private refreshFloatingRows(renderedRows: RenderedRow[], rowNodes: RowNode[],
                                pinnedLeftContainerComp: RowContainerComponent, pinnedRightContainerComp: RowContainerComponent,
                                bodyContainerComp: RowContainerComponent, fullWidthContainerComp: RowContainerComponent): void {
        renderedRows.forEach( (row: RenderedRow) => {
            row.destroy();
        });

        renderedRows.length = 0;

        // if no cols, don't draw row - can we get rid of this???
        var columns = this.columnController.getAllDisplayedColumns();
        if (_.missingOrEmpty(columns)) { return; }

        if (rowNodes) {
            rowNodes.forEach( (node: RowNode) => {
                var renderedRow = new RenderedRow(this.$scope,
                    this,
                    bodyContainerComp,
                    fullWidthContainerComp,
                    pinnedLeftContainerComp,
                    pinnedRightContainerComp,
                    node,
                    false);
                this.context.wireBean(renderedRow);
                renderedRows.push(renderedRow);
            })
        }
    }

    private onFloatingRowDataChanged(): void {
        this.refreshView();
    }

    private onModelUpdated(refreshEvent: ModelUpdatedEvent): void {
        let params: RefreshViewParams = {
            keepRenderedRows: refreshEvent.keepRenderedRows,
            animate: refreshEvent.animate
        };
        this.refreshView(params);

    }

    // if the row nodes are not rendered, no index is returned
    private getRenderedIndexesForRowNodes(rowNodes: RowNode[]): string[] {
        var result: any = [];
        if (_.missing(rowNodes)) { return result; }
        _.iterateObject(this.renderedRows, (key: string, renderedRow: RenderedRow)=> {
            var rowNode = renderedRow.getRowNode();
            if (rowNodes.indexOf(rowNode)>=0) {
                result.push(key);
            }
        });
        return result;
    }

    public refreshRows(rowNodes: RowNode[]): void {
        if (!rowNodes || rowNodes.length==0) {
            return;
        }

        // we only need to be worried about rendered rows, as this method is
        // called to whats rendered. if the row isn't rendered, we don't care
        var indexesToRemove = this.getRenderedIndexesForRowNodes(rowNodes);

        // remove the rows
        this.removeVirtualRows(indexesToRemove);

        // add draw them again
        this.refreshView({
            keepRenderedRows: true
        });
    }

    public refreshView(params: RefreshViewParams = {}): void {
        this.logger.log('refreshView');

        this.getLockOnRefresh();

        let focusedCell = params.suppressKeepFocus ? null : this.focusedCellController.getFocusCellToUseAfterRefresh();

        if (!this.gridOptionsWrapper.isForPrint()) {
            var containerHeight = this.rowModel.getRowCombinedHeight();
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

        this.refreshAllVirtualRows(params.keepRenderedRows, params.animate);
        if (!params.onlyBody){
            this.refreshAllFloatingRows();
        }

        this.restoreFocusedCell(focusedCell);

        this.releaseLockOnRefresh();
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

    public softRefreshView() {
        var focusedCell = this.focusedCellController.getFocusCellToUseAfterRefresh();

        this.forEachRenderedCell( renderedCell => {
            if (renderedCell.isVolatile()) {
                renderedCell.refreshCell();
            }
        });

        this.restoreFocusedCell(focusedCell);
    }

    public stopEditing(cancel: boolean = false) {
        this.forEachRenderedRow( (key: string, renderedRow: RenderedRow) => {
            renderedRow.stopEditing(cancel);
        });
    }

    public forEachRenderedCell(callback: (renderedCell: RenderedCell)=>void): void {
        _.iterateObject(this.renderedRows, (key: any, renderedRow: RenderedRow)=> {
            renderedRow.forEachRenderedCell(callback);
        });
    }

    private forEachRenderedRow(callback: (key: string, renderedCell: RenderedRow)=>void): void {
        _.iterateObject(this.renderedRows, callback);
        _.iterateObject(this.renderedTopFloatingRows, callback);
        _.iterateObject(this.renderedBottomFloatingRows, callback);
    }

    public addRenderedRowListener(eventName: string, rowIndex: number, callback: Function): void {
        var renderedRow = this.renderedRows[rowIndex];
        renderedRow.addEventListener(eventName, callback);
    }

    public refreshCells(rowNodes: RowNode[], cols: (string|ColDef|Column)[], animate = false): void {
        if (!rowNodes || rowNodes.length==0) {
            return;
        }
        // we only need to be worried about rendered rows, as this method is
        // called to whats rendered. if the row isn't rendered, we don't care
        _.iterateObject(this.renderedRows, (key: string, renderedRow: RenderedRow)=> {
            var rowNode = renderedRow.getRowNode();
            if (rowNodes.indexOf(rowNode)>=0) {
                renderedRow.refreshCells(cols, animate);
            }
        });
    }

    @PreDestroy
    private destroy() {
        this.destroyFunctions.forEach(func => func());

        var rowsToRemove = Object.keys(this.renderedRows);
        this.removeVirtualRows(rowsToRemove);
    }

    private refreshAllVirtualRows(keepRenderedRows: boolean, animate: boolean) {
        let rowsToRemove: string[];
        let oldRowsByNodeId: {[key: string]: RenderedRow} = {};

        if (keepRenderedRows) {
            rowsToRemove = [];
            _.iterateObject(this.renderedRows, (index: string, renderedRow: RenderedRow)=> {
                let rowNode = renderedRow.getRowNode();
                if (_.exists(rowNode.id)) {
                    oldRowsByNodeId[rowNode.id] = renderedRow;
                    delete this.renderedRows[index];
                } else {
                    rowsToRemove.push(index);
                }
            });
        } else {
            rowsToRemove = Object.keys(this.renderedRows);
        }

        this.removeVirtualRows(rowsToRemove);
        this.drawVirtualRows(oldRowsByNodeId, animate);
    }

    // public - removes the group rows and then redraws them again
    public refreshGroupRows() {
        // find all the group rows
        var rowsToRemove: any = [];
        Object.keys(this.renderedRows).forEach( (index: any) => {
            var renderedRow = this.renderedRows[index];
            if (renderedRow.isGroup()) {
                rowsToRemove.push(index);
            }
        });
        // remove the rows
        this.removeVirtualRows(rowsToRemove);
        // and draw them back again
        this.ensureRowsRendered();
    }

    // takes array of row indexes
    private removeVirtualRows(rowsToRemove: any[]) {
        // if no fromIndex then set to -1, which will refresh everything
        // var realFromIndex = -1;
        rowsToRemove.forEach( indexToRemove => {
            var renderedRow = this.renderedRows[indexToRemove];
            renderedRow.destroy();
            delete this.renderedRows[indexToRemove];
        });
    }

    // gets called when rows don't change, but viewport does, so after:
    // 1) size of grid changed
    // 2) grid scrolled to new position
    // 3) ensure index visible (which is a scroll)
    public drawVirtualRowsWithLock() {
        this.getLockOnRefresh();
        this.drawVirtualRows();
        this.releaseLockOnRefresh();
    }

    private drawVirtualRows(oldRowsByNodeId?: {[key: string]: RenderedRow}, animate = false) {
        this.workOutFirstAndLastRowsToRender();
        this.ensureRowsRendered(oldRowsByNodeId, animate);
    }

    private workOutFirstAndLastRowsToRender(): void {

        var newFirst: number;
        var newLast: number;

        if (!this.rowModel.isRowsToRender()) {
            newFirst = 0;
            newLast = -1; // setting to -1 means nothing in range
        } else {

            var rowCount = this.rowModel.getRowCount();

            if (this.gridOptionsWrapper.isForPrint()) {
                newFirst = 0;
                newLast = rowCount;
            } else {

                let bodyVRange = this.gridPanel.getVerticalPixelRange();
                var topPixel = bodyVRange.top;
                var bottomPixel = bodyVRange.bottom;

                var first = this.rowModel.getRowIndexAtPixel(topPixel);
                var last = this.rowModel.getRowIndexAtPixel(bottomPixel);

                //add in buffer
                var buffer = this.gridOptionsWrapper.getRowBuffer();
                first = first - buffer;
                last = last + buffer;

                // adjust, in case buffer extended actual size
                if (first < 0) {
                    first = 0;
                }
                if (last > rowCount - 1) {
                    last = rowCount - 1;
                }

                newFirst = first;
                newLast = last;
            }
        }

        var firstDiffers = newFirst !== this.firstRenderedRow;
        var lastDiffers = newLast !== this.lastRenderedRow;
        if (firstDiffers || lastDiffers) {
            this.firstRenderedRow = newFirst;
            this.lastRenderedRow = newLast;

            var event = {firstRow: newFirst, lastRow: newLast};
            this.eventService.dispatchEvent(Events.EVENT_VIEWPORT_CHANGED, event);
        }
    }

    public getFirstVirtualRenderedRow() {
        return this.firstRenderedRow;
    }

    public getLastVirtualRenderedRow() {
        return this.lastRenderedRow;
    }

    private ensureRowsRendered(oldRenderedRowsByNodeId?: {[key: string]: RenderedRow}, animate = false) {

        // var timer = new Timer();

        // at the end, this array will contain the items we need to remove
        var rowsToRemove = Object.keys(this.renderedRows);

        // add in new rows
        var delayedCreateFunctions: Function[] = [];
        for (let rowIndex = this.firstRenderedRow; rowIndex <= this.lastRenderedRow; rowIndex++) {
            // see if item already there, and if yes, take it out of the 'to remove' array
            if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                _.removeFromArray(rowsToRemove, rowIndex.toString());
                continue;
            }
            // check this row actually exists (in case overflow buffer window exceeds real data)
            var node = this.rowModel.getRow(rowIndex);
            if (node) {
                let renderedRow = this.getOrCreateRenderedRow(node, oldRenderedRowsByNodeId, animate);
                _.pushAll(delayedCreateFunctions, renderedRow.getAndClearNextVMTurnFunctions());
                this.renderedRows[rowIndex] = renderedRow;
            }
        }
        setTimeout( ()=> {
            delayedCreateFunctions.forEach( func => func() );
        }, 0);

        // timer.print('creating template');

        // check that none of the rows to remove are editing or focused as:
        // a) if editing, we want to keep them, otherwise the user will loose the context of the edit,
        //    eg user starts editing, enters some text, then scrolls down and then up, next time row rendered
        //    the edit is reset - so we want to keep it rendered.
        // b) if focused, we want ot keep keyboard focus, so if user ctrl+c, it goes to clipboard,
        //    otherwise the user can range select and drag (with focus cell going out of the viewport)
        //    and then ctrl+c, nothing will happen if cell is removed from dom.
        rowsToRemove = _.filter(rowsToRemove, indexStr => {
            let REMOVE_ROW : boolean = true;
            let KEEP_ROW : boolean = false;
            let renderedRow = this.renderedRows[indexStr];
            let rowNode = renderedRow.getRowNode();

            let rowHasFocus = this.focusedCellController.isRowNodeFocused(rowNode);
            let rowIsEditing = renderedRow.isEditing();

            let mightWantToKeepRow = rowHasFocus || rowIsEditing;

            // if we deffo don't want to keep it,
            if (!mightWantToKeepRow) { return REMOVE_ROW; }

            // editing row, only remove if it is no longer rendered, eg filtered out or new data set.
            // the reason we want to keep is if user is scrolling up and down, we don't want to loose
            // the context of the editing in process.
            let rowNodePresent = this.rowModel.isRowPresent(rowNode);
            return rowNodePresent ? KEEP_ROW : REMOVE_ROW;
        });

        // at this point, everything in our 'rowsToRemove' is an old index that needs to be removed
        this.removeVirtualRows(rowsToRemove);

        // and everything in our oldRenderedRowsByNodeId is an old row that is no longer used
        var delayedDestroyFunctions: Function[] = [];
        _.iterateObject(oldRenderedRowsByNodeId, (nodeId: string, renderedRow: RenderedRow) => {
            renderedRow.destroy(animate);
            renderedRow.getAndClearDelayedDestroyFunctions().forEach(func => delayedDestroyFunctions.push(func) );
            delete oldRenderedRowsByNodeId[nodeId];
        });
        setTimeout( ()=> {
            delayedDestroyFunctions.forEach( func => func() );
        }, 400);

        // timer.print('removing');

        this.rowContainers.body.flushDocumentFragment();
        if (!this.gridOptionsWrapper.isForPrint()) {
            this.rowContainers.pinnedLeft.flushDocumentFragment();
            this.rowContainers.pinnedRight.flushDocumentFragment();
        }

        // if we are doing angular compiling, then do digest the scope here
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            // we do it in a timeout, in case we are already in an apply
            setTimeout( () => { this.$scope.$apply(); }, 0);
        }

        // timer.print('total');
    }

    private getOrCreateRenderedRow(rowNode: RowNode,
                                   oldRowsByNodeId: {[key: string]: RenderedRow}, animate: boolean): RenderedRow {

        let renderedRow: RenderedRow;

        if (_.exists(oldRowsByNodeId) && oldRowsByNodeId[rowNode.id]) {

            renderedRow = oldRowsByNodeId[rowNode.id];
            delete oldRowsByNodeId[rowNode.id];

        } else {

            renderedRow = new RenderedRow(this.$scope,
                this, this.rowContainers.body, this.rowContainers.fullWidth,
                this.rowContainers.pinnedLeft, this.rowContainers.pinnedRight,
                rowNode, animate);

            this.context.wireBean(renderedRow);

        }

        return renderedRow;
    }

    public getRenderedNodes() {
        var renderedRows = this.renderedRows;
        return Object.keys(renderedRows).map(key => {
            return renderedRows[key].getRowNode();
        });
    }

    // we use index for rows, but column object for columns, as the next column (by index) might not
    // be visible (header grouping) so it's not reliable, so using the column object instead.
    public navigateToNextCell(event: KeyboardEvent, key: number, rowIndex: number, column: Column, floating: string) {

        let previousCell = new GridCell({rowIndex: rowIndex, floating: floating, column: column});
        let nextCell = previousCell;

        // we keep searching for a next cell until we find one. this is how the group rows get skipped
        while (true) {
            nextCell = this.cellNavigationService.getNextCellToFocus(key, nextCell);

            if (_.missing(nextCell)) {
                break;
            }

            var skipGroupRows = this.gridOptionsWrapper.isGroupUseEntireRow();
            if (skipGroupRows) {
                var rowNode = this.rowModel.getRow(nextCell.rowIndex);
                if (!rowNode.group) {
                    break;
                }
            } else {
                break;
            }
        }

        // allow user to override what cell to go to next
        var userFunc = this.gridOptionsWrapper.getNavigateToNextCellFunc();
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

        this.focusedCellController.setFocusedCell(nextCell.rowIndex, nextCell.column, nextCell.floating, true);
        if (this.rangeController) {
            let gridCell = new GridCell({rowIndex: nextCell.rowIndex, floating: nextCell.floating, column: nextCell.column});
            this.rangeController.setRangeToCell(gridCell);
        }
    }

    public startEditingCell(gridCell: GridCell, keyPress: number, charPress: string): void {
        var cell = this.getComponentForCell(gridCell);
        cell.startRowOrCellEdit(keyPress, charPress);
    }

    private getComponentForCell(gridCell: GridCell): RenderedCell {
        var rowComponent: RenderedRow;
        switch (gridCell.floating) {
            case Constants.FLOATING_TOP:
                rowComponent = this.renderedTopFloatingRows[gridCell.rowIndex];
                break;
            case Constants.FLOATING_BOTTOM:
                rowComponent = this.renderedBottomFloatingRows[gridCell.rowIndex];
                break;
            default:
                rowComponent = this.renderedRows[gridCell.rowIndex];
                break;
        }

        if (!rowComponent) {
            return null;
        }

        var cellComponent: RenderedCell = rowComponent.getRenderedCellForColumn(gridCell.column);
        return cellComponent;
    }

    public onTabKeyDown(previousRenderedCell: RenderedCell, keyboardEvent: KeyboardEvent): void {
        let backwards = keyboardEvent.shiftKey;
        let success = this.moveToCellAfter(previousRenderedCell, backwards);
        if (success) {
            keyboardEvent.preventDefault();
        }
    }

    public tabToNextCell(backwards: boolean): boolean {
        var focusedCell = this.focusedCellController.getFocusedCell();
        // if no focus, then cannot navigate
        if (_.missing(focusedCell)) { return false; }
        var renderedCell = this.getComponentForCell(focusedCell);
        // if cell is not rendered, means user has scrolled away from the cell
        if (_.missing(renderedCell)) { return false; }

        var result = this.moveToCellAfter(renderedCell, backwards);
        return result;
    }

    // returns true if moving to next cell was successful
    private moveToCellAfter(previousRenderedCell: RenderedCell, backwards: boolean): boolean {

        var editing = previousRenderedCell.isEditing();
        var gridCell = previousRenderedCell.getGridCell();

        // find the next cell to start editing
        var nextRenderedCell = this.findNextCellToFocusOn(gridCell, backwards, editing);

        var foundCell = _.exists(nextRenderedCell);

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (foundCell) {

            if (editing) {
                if (this.gridOptionsWrapper.isFullRowEdit()) {
                    this.moveEditToNextRow(previousRenderedCell, nextRenderedCell);
                } else {
                    this.moveEditToNextCell(previousRenderedCell, nextRenderedCell);
                }
            } else {
                nextRenderedCell.focusCell(true);
            }

            return true;
        } else {
            return false;
        }
    }

    private moveEditToNextCell(previousRenderedCell: RenderedCell, nextRenderedCell: RenderedCell): void {
        previousRenderedCell.stopEditing();
        nextRenderedCell.startEditingIfEnabled(null, null, true);
        nextRenderedCell.focusCell(false);
    }

    private moveEditToNextRow(previousRenderedCell: RenderedCell, nextRenderedCell: RenderedCell): void {
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
    private findNextCellToFocusOn(gridCell: GridCell, backwards: boolean, startEditing: boolean): RenderedCell {

        var nextCell: GridCell = gridCell;

        while (true) {

            nextCell = this.cellNavigationService.getNextTabbedCell(nextCell, backwards);

            // allow user to override what cell to go to next
            var userFunc = this.gridOptionsWrapper.getTabToNextCellFunc();
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
            var cellIsNotFloating = _.missing(nextCell.floating);
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

            // we have to call this after ensureColumnVisible - otherwise it could be a virtual column
            // or row that is not currently in view, hence the renderedCell would not exist
            var nextRenderedCell = this.getComponentForCell(nextCell);

            // if editing, but cell not editable, skip cell
            if (startEditing && !nextRenderedCell.isCellEditable()) {
                continue;
            }

            if (nextRenderedCell.isSuppressNavigable()) {
                continue;
            }

            // by default, when we click a cell, it gets selected into a range, so to keep keyboard navigation
            // consistent, we set into range here also.
            if (this.rangeController) {
                let gridCell = new GridCell({rowIndex: nextCell.rowIndex, floating: nextCell.floating, column: nextCell.column});
                this.rangeController.setRangeToCell(gridCell);
            }

            // we successfully tabbed onto a grid cell, so return true
            return nextRenderedCell;
        }
    }
}

export interface RefreshViewParams {
    keepRenderedRows?:boolean;
    animate?:boolean;
    suppressKeepFocus?:boolean;
    onlyBody?:boolean;
}
