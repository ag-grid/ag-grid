import {Utils as _} from "../utils";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {GridPanel} from "../gridPanel/gridPanel";
import {ExpressionService} from "../expressionService";
import {TemplateService} from "../templateService";
import {ValueService} from "../valueService";
import {EventService} from "../eventService";
import {FloatingRowModel} from "../rowControllers/floatingRowModel";
import {RenderedRow} from "./renderedRow";
import {Column} from "../entities/column";
import {RowNode} from "../entities/rowNode";
import {Events} from "../events";
import {Constants} from "../constants";
import {RenderedCell} from "./renderedCell";
import {Bean, PreDestroy, Qualifier, Context, Autowired, PostConstruct, Optional} from "../context/context";
import {GridCore} from "../gridCore";
import {ColumnController} from "../columnController/columnController";
import {Logger, LoggerFactory} from "../logger";
import {ColumnChangeEvent} from "../columnChangeEvent";
import {IRowModel} from "../interfaces/iRowModel";
import {FocusedCellController} from "../focusedCellController";
import {IRangeController} from "../interfaces/iRangeController";
import {CellNavigationService} from "../cellNavigationService";
import {GridCell} from "../entities/gridCell";

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

    private eAllBodyContainers: HTMLElement[];
    private eAllPinnedLeftContainers: HTMLElement[];
    private eAllPinnedRightContainers: HTMLElement[];

    private eFullWidthContainer: HTMLElement;
    private eBodyContainer: HTMLElement;
    private eBodyViewport: HTMLElement;
    private ePinnedLeftColsContainer: HTMLElement;
    private ePinnedRightColsContainer: HTMLElement;
    private eFloatingTopContainer: HTMLElement;
    private eFloatingTopPinnedLeftContainer: HTMLElement;
    private eFloatingTopPinnedRightContainer: HTMLElement;
    private eFloatingTopFullWidthContainer: HTMLElement;
    private eFloatingBottomContainer: HTMLElement;
    private eFloatingBottomPinnedLeftContainer: HTMLElement;
    private eFloatingBottomPinnedRightContainer: HTMLElement;
    private eFloatingBottomFullWithContainer: HTMLElement;

    private logger: Logger;

    private destroyFunctions: Function[] = [];

    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = this.loggerFactory.create('RowRenderer');
        this.logger = loggerFactory.create('BalancedColumnTreeBuilder');
    }

    @PostConstruct
    public init(): void {
        this.getContainersFromGridPanel();
        
        var columnListener = this.onColumnEvent.bind(this);
        var refreshViewListener = this.refreshView.bind(this);

        this.eventService.addEventListener(Events.EVENT_DISPLAYED_COLUMNS_CHANGED, columnListener);
        this.eventService.addEventListener(Events.EVENT_COLUMN_RESIZED, columnListener);
        
        this.eventService.addEventListener(Events.EVENT_MODEL_UPDATED, refreshViewListener);
        this.eventService.addEventListener(Events.EVENT_FLOATING_ROW_DATA_CHANGED, refreshViewListener);

        this.destroyFunctions.push( () => {
            this.eventService.removeEventListener(Events.EVENT_DISPLAYED_COLUMNS_CHANGED, columnListener);
            this.eventService.removeEventListener(Events.EVENT_COLUMN_RESIZED, columnListener);

            this.eventService.removeEventListener(Events.EVENT_MODEL_UPDATED, refreshViewListener);
            this.eventService.removeEventListener(Events.EVENT_FLOATING_ROW_DATA_CHANGED, refreshViewListener);
        });

        this.refreshView();
    }

    public onColumnEvent(event: ColumnChangeEvent): void {
        this.setMainRowWidths();
    }

    public getContainersFromGridPanel(): void {
        this.eFullWidthContainer = this.gridPanel.getFullWidthCellContainer();
        this.eBodyContainer = this.gridPanel.getBodyContainer();
        this.ePinnedLeftColsContainer = this.gridPanel.getPinnedLeftColsContainer();
        this.ePinnedRightColsContainer = this.gridPanel.getPinnedRightColsContainer();

        this.eFloatingTopContainer = this.gridPanel.getFloatingTopContainer();
        this.eFloatingTopPinnedLeftContainer = this.gridPanel.getPinnedLeftFloatingTop();
        this.eFloatingTopPinnedRightContainer = this.gridPanel.getPinnedRightFloatingTop();
        this.eFloatingTopFullWidthContainer = this.gridPanel.getFloatingTopFullWidthCellContainer();

        this.eFloatingBottomContainer = this.gridPanel.getFloatingBottomContainer();
        this.eFloatingBottomPinnedLeftContainer = this.gridPanel.getPinnedLeftFloatingBottom();
        this.eFloatingBottomPinnedRightContainer = this.gridPanel.getPinnedRightFloatingBottom();
        this.eFloatingBottomFullWithContainer = this.gridPanel.getFloatingBottomFullWidthCellContainer();

        this.eBodyViewport = this.gridPanel.getBodyViewport();

        this.eAllBodyContainers = [this.eBodyContainer, this.eFloatingBottomContainer,
            this.eFloatingTopContainer];
        this.eAllPinnedLeftContainers = [
            this.ePinnedLeftColsContainer,
            this.eFloatingBottomPinnedLeftContainer,
            this.eFloatingTopPinnedLeftContainer];
        this.eAllPinnedRightContainers = [
            this.ePinnedRightColsContainer,
            this.eFloatingBottomPinnedRightContainer,
            this.eFloatingTopPinnedRightContainer];
    }

    public setRowModel(rowModel: any) {
        this.rowModel = rowModel;
    }

    public getAllCellsForColumn(column: Column): HTMLElement[] {
        var eCells: HTMLElement[] = [];

        _.iterateObject(this.renderedRows, callback);
        _.iterateObject(this.renderedBottomFloatingRows, callback);
        _.iterateObject(this.renderedBottomFloatingRows, callback);

        function callback(key: any, renderedRow: RenderedRow) {
            var eCell = renderedRow.getCellForCol(column);
            if (eCell) {
                eCells.push(eCell);
            }
        }

        return eCells;
    }

    public setMainRowWidths() {
        var mainRowWidth = this.columnController.getBodyContainerWidth() + "px";

        this.eAllBodyContainers.forEach( function(container: HTMLElement) {
            var unpinnedRows: [any] = (<any>container).querySelectorAll(".ag-row");
            for (var i = 0; i < unpinnedRows.length; i++) {
                unpinnedRows[i].style.width = mainRowWidth;
            }
        });
    }

    public refreshAllFloatingRows(): void {
        this.refreshFloatingRows(
            this.renderedTopFloatingRows,
            this.floatingRowModel.getFloatingTopRowData(),
            this.eFloatingTopPinnedLeftContainer,
            this.eFloatingTopPinnedRightContainer,
            this.eFloatingTopContainer,
            this.eFloatingTopFullWidthContainer);
        this.refreshFloatingRows(
            this.renderedBottomFloatingRows,
            this.floatingRowModel.getFloatingBottomRowData(),
            this.eFloatingBottomPinnedLeftContainer,
            this.eFloatingBottomPinnedRightContainer,
            this.eFloatingBottomContainer,
            this.eFloatingBottomFullWithContainer);
    }

    private refreshFloatingRows(renderedRows: RenderedRow[], rowNodes: RowNode[],
                                ePinnedLeftContainer: HTMLElement, ePinnedRightContainer: HTMLElement,
                                eBodyContainer: HTMLElement, eFullWidthContainer: HTMLElement): void {
        renderedRows.forEach( (row: RenderedRow) => {
            row.destroy();
        });

        renderedRows.length = 0;

        // if no cols, don't draw row - can we get rid of this???
        var columns = this.columnController.getAllDisplayedColumns();
        if (_.missingOrEmpty(columns)) { return; }

        if (rowNodes) {
            rowNodes.forEach( (node: RowNode, rowIndex: number) => {
                var renderedRow = new RenderedRow(this.$scope,
                    this,
                    eBodyContainer,
                    eFullWidthContainer,
                    ePinnedLeftContainer,
                    ePinnedRightContainer,
                    node, rowIndex);
                this.context.wireBean(renderedRow);
                renderedRows.push(renderedRow);
            })
        }
    }

    public refreshView(refreshEvent?: any) {
        this.logger.log('refreshView');

        var focusedCell = this.focusedCellController.getFocusCellToUseAfterRefresh();

        var refreshFromIndex: number = refreshEvent ? refreshEvent.fromIndex : null;

        if (!this.gridOptionsWrapper.isForPrint()) {
            var containerHeight = this.rowModel.getRowCombinedHeight();
            this.eBodyContainer.style.height = containerHeight + "px";
            this.eFullWidthContainer.style.height = containerHeight + "px";
            this.ePinnedLeftColsContainer.style.height = containerHeight + "px";
            this.ePinnedRightColsContainer.style.height = containerHeight + "px";
        }

        this.refreshAllVirtualRows(refreshFromIndex);
        this.refreshAllFloatingRows();

        this.restoreFocusedCell(focusedCell);
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
        this.forEachRenderedCell( renderedCell => {
            renderedCell.stopEditing(cancel);
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

    public refreshRows(rowNodes: RowNode[]): void {
        if (!rowNodes || rowNodes.length==0) {
            return;
        }

        var focusedCell = this.focusedCellController.getFocusCellToUseAfterRefresh();

        // we only need to be worried about rendered rows, as this method is
        // called to whats rendered. if the row isn't rendered, we don't care
        var indexesToRemove: any = [];
        _.iterateObject(this.renderedRows, (key: string, renderedRow: RenderedRow)=> {
            var rowNode = renderedRow.getRowNode();
            if (rowNodes.indexOf(rowNode)>=0) {
                indexesToRemove.push(key);
            }
        });
        // remove the rows
        this.removeVirtualRow(indexesToRemove);
        // add draw them again
        this.drawVirtualRows();

        this.restoreFocusedCell(focusedCell);
    }

    public refreshCells(rowNodes: RowNode[], colIds: string[], animate = false): void {
        if (!rowNodes || rowNodes.length==0) {
            return;
        }
        // we only need to be worried about rendered rows, as this method is
        // called to whats rendered. if the row isn't rendered, we don't care
        _.iterateObject(this.renderedRows, (key: string, renderedRow: RenderedRow)=> {
            var rowNode = renderedRow.getRowNode();
            if (rowNodes.indexOf(rowNode)>=0) {
                renderedRow.refreshCells(colIds, animate);
            }
        });
    }

    public rowDataChanged(rows: any) {
        // we only need to be worried about rendered rows, as this method is
        // called to whats rendered. if the row isn't rendered, we don't care
        var indexesToRemove: any = [];
        var renderedRows = this.renderedRows;
        Object.keys(renderedRows).forEach(function (index: any) {
            var renderedRow = renderedRows[index];
            // see if the rendered row is in the list of rows we have to update
            if (renderedRow.isDataInList(rows)) {
                indexesToRemove.push(index);
            }
        });
        // remove the rows
        this.removeVirtualRow(indexesToRemove);
        // add draw them again
        this.drawVirtualRows();
    }

    @PreDestroy
    private destroy() {
        this.destroyFunctions.forEach(func => func());

        var rowsToRemove = Object.keys(this.renderedRows);
        this.removeVirtualRow(rowsToRemove);
    }

    private refreshAllVirtualRows(fromIndex?: any) {
        // remove all current virtual rows, as they have old data
        var rowsToRemove = Object.keys(this.renderedRows);
        this.removeVirtualRow(rowsToRemove, fromIndex);

        // add in new rows
        this.drawVirtualRows();
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
        this.removeVirtualRow(rowsToRemove);
        // and draw them back again
        this.ensureRowsRendered();
    }

    // takes array of row indexes
    private removeVirtualRow(rowsToRemove: any, fromIndex?: any) {
        var that = this;
        // if no fromIndex then set to -1, which will refresh everything
        var realFromIndex = (typeof fromIndex === 'number') ? fromIndex : -1;
        rowsToRemove.forEach(function (indexToRemove: any) {
            if (indexToRemove >= realFromIndex) {
                that.unbindVirtualRow(indexToRemove);
            }
        });
    }

    private unbindVirtualRow(indexToRemove: any) {
        var renderedRow = this.renderedRows[indexToRemove];
        renderedRow.destroy();

        var event = {node: renderedRow.getRowNode(), rowIndex: indexToRemove};
        this.eventService.dispatchEvent(Events.EVENT_VIRTUAL_ROW_REMOVED, event);

        delete this.renderedRows[indexToRemove];
    }

    public drawVirtualRows() {
        this.workOutFirstAndLastRowsToRender();
        this.ensureRowsRendered();
    }

    public workOutFirstAndLastRowsToRender(): void {

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

                var topPixel = this.eBodyViewport.scrollTop;
                var bottomPixel = topPixel + this.eBodyViewport.offsetHeight;

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

    private ensureRowsRendered() {

        //var start = new Date().getTime();

        // at the end, this array will contain the items we need to remove
        var rowsToRemove = Object.keys(this.renderedRows);

        // add in new rows
        for (var rowIndex = this.firstRenderedRow; rowIndex <= this.lastRenderedRow; rowIndex++) {
            // see if item already there, and if yes, take it out of the 'to remove' array
            if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                continue;
            }
            // check this row actually exists (in case overflow buffer window exceeds real data)
            var node = this.rowModel.getRow(rowIndex);
            if (node) {
                this.insertRow(node, rowIndex);
            }
        }

        // at this point, everything in our 'rowsToRemove' . . .
        this.removeVirtualRow(rowsToRemove);

        // if we are doing angular compiling, then do digest the scope here
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            // we do it in a timeout, in case we are already in an apply
            setTimeout( () => { this.$scope.$apply(); }, 0);
        }

        //var end = new Date().getTime();
        //console.log(end-start);
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent, cell: GridCell): void {
        var renderedRow: RenderedRow;
        switch (cell.floating) {
            case Constants.FLOATING_TOP:
                renderedRow = this.renderedTopFloatingRows[cell.rowIndex];
                break;
            case Constants.FLOATING_BOTTOM:
                renderedRow = this.renderedBottomFloatingRows[cell.rowIndex];
                break;
            default:
                renderedRow = this.renderedRows[cell.rowIndex];
                break;
        }
        if (renderedRow) {
            renderedRow.onMouseEvent(eventName, mouseEvent, cell);
        }
    }

    private insertRow(node: any, rowIndex: any) {
        var columns = this.columnController.getAllDisplayedColumns();
        // if no cols, don't draw row
        if (_.missingOrEmpty(columns)) { return; }

        var renderedRow = new RenderedRow(this.$scope,
            this, this.eBodyContainer, this.eFullWidthContainer, this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer,
            node, rowIndex);
        this.context.wireBean(renderedRow);

        this.renderedRows[rowIndex] = renderedRow;
    }

    public getRenderedNodes() {
        var renderedRows = this.renderedRows;
        return Object.keys(renderedRows).map(key => {
            return renderedRows[key].getRowNode();
        });
    }

    // we use index for rows, but column object for columns, as the next column (by index) might not
    // be visible (header grouping) so it's not reliable, so using the column object instead.
    public navigateToNextCell(key: any, rowIndex: number, column: Column, floating: string) {

        var nextCell = new GridCell(rowIndex, floating, column);

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
            this.rangeController.setRangeToCell(new GridCell(nextCell.rowIndex, nextCell.floating, nextCell.column));
        }
    }

    public startEditingCell(gridCell: GridCell, keyPress: number, charPress: string): void {
        var cell = this.getComponentForCell(gridCell);
        cell.startEditingIfEnabled(keyPress, charPress);
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

    // called by the cell, when tab is pressed while editing.
    // @return: true when navigation successful, otherwise false
    public moveFocusToNextCell(rowIndex: any, column: any, floating: string, shiftKey: boolean, startEditing: boolean): boolean {

        var nextCell = new GridCell(rowIndex, floating, column);

        while (true) {

            nextCell = this.cellNavigationService.getNextTabbedCell(nextCell, shiftKey);

            // if no 'next cell', means we have got to last cell of grid, so nothing to move to,
            // so bottom right cell going forwards, or top left going backwards
            if (!nextCell) {
                return false;
            }

            // this scrolls the row into view
            var cellIsNotFloating = _.missing(nextCell.floating);
            if (cellIsNotFloating) {
                this.gridPanel.ensureIndexVisible(nextCell.rowIndex);
            }

            this.gridPanel.ensureColumnVisible(nextCell.column);
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

            if (startEditing) {
                nextRenderedCell.startEditingIfEnabled();
                nextRenderedCell.focusCell(false);
            } else {
                nextRenderedCell.focusCell(true);
            }

            // by default, when we click a cell, it gets selected into a range, so to keep keyboard navigation
            // consistent, we set into range here also.
            if (this.rangeController) {
                this.rangeController.setRangeToCell(new GridCell(nextCell.rowIndex, nextCell.floating, nextCell.column));
            }

            // we successfully tabbed onto a grid cell, so return true
            return true;
        }
    }
}
