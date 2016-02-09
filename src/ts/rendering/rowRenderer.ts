import _ from '../utils';
import GridOptionsWrapper from "../gridOptionsWrapper";
import {Grid} from "../grid";
import SelectionRendererFactory from "../selectionRendererFactory";
import GridPanel from "../gridPanel/gridPanel";
import SelectionController from "../selectionController";
import ExpressionService from "../expressionService";
import TemplateService from "../templateService";
import ValueService from "../valueService";
import EventService from "../eventService";
import FloatingRowModel from "../rowControllers/floatingRowModel";
import RenderedRow from "./renderedRow";
import groupCellRendererFactory from "../cellRenderers/groupCellRendererFactory";
import Column from "../entities/column";
import {RowNode} from "../entities/rowNode";
import {Events} from "../events";
import Constants from "../constants";
import {ColDef} from "../entities/colDef";
import RenderedCell from "./renderedCell";

export default class RowRenderer {

    private columnModel: any;
    private gridOptionsWrapper: GridOptionsWrapper;
    private angularGrid: Grid;
    private selectionRendererFactory: SelectionRendererFactory;
    private gridPanel: GridPanel;
    private $compile: any;
    private $scope: any;
    private selectionController: SelectionController;
    private expressionService: ExpressionService;
    private templateService: TemplateService;
    private cellRendererMap: {[key: string]: any};
    private rowModel: any;
    private firstVirtualRenderedRow: number;
    private lastVirtualRenderedRow: number;

    private focusedCell: {
        rowIndex: number,
        colId: string,
        node: RowNode,
        colDef: ColDef
    };

    private valueService: ValueService;
    private eventService: EventService;
    private floatingRowModel: FloatingRowModel;

    private renderedRows: {[key: string]: RenderedRow};
    private renderedTopFloatingRows: RenderedRow[] = [];
    private renderedBottomFloatingRows: RenderedRow[] = [];

    private eAllBodyContainers: HTMLElement[];
    private eAllPinnedLeftContainers: HTMLElement[];
    private eAllPinnedRightContainers: HTMLElement[];

    private eBodyContainer: HTMLElement;
    private eBodyViewport: HTMLElement;
    private ePinnedLeftColsContainer: HTMLElement;
    private ePinnedRightColsContainer: HTMLElement;
    private eFloatingTopContainer: HTMLElement;
    private eFloatingTopPinnedLeftContainer: HTMLElement;
    private eFloatingTopPinnedRightContainer: HTMLElement;
    private eFloatingBottomContainer: HTMLElement;
    private eFloatingBottomPinnedLeftContainer: HTMLElement;
    private eFloatingBottomPinnedRightContainer: HTMLElement;
    private eParentsOfRows: HTMLElement[];

    public init(columnModel: any, gridOptionsWrapper: GridOptionsWrapper, gridPanel: GridPanel,
                angularGrid: Grid, selectionRendererFactory: SelectionRendererFactory, $compile: any, $scope: any,
                selectionController: SelectionController, expressionService: ExpressionService,
                templateService: TemplateService, valueService: ValueService, eventService: EventService,
                floatingRowModel: FloatingRowModel) {
        this.columnModel = columnModel;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.angularGrid = angularGrid;
        this.selectionRendererFactory = selectionRendererFactory;
        this.gridPanel = gridPanel;
        this.$compile = $compile;
        this.$scope = $scope;
        this.selectionController = selectionController;
        this.expressionService = expressionService;
        this.templateService = templateService;
        this.valueService = valueService;
        this.findAllElements(gridPanel);
        this.eventService = eventService;
        this.floatingRowModel = floatingRowModel;

        this.cellRendererMap = {
            'group': groupCellRendererFactory(gridOptionsWrapper, selectionRendererFactory, expressionService, eventService),
            'default': function(params: any) {
                return params.value;
            }
        };

        // map of row ids to row objects. keeps track of which elements
        // are rendered for which rows in the dom.
        this.renderedRows = {};
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
        var mainRowWidth = this.columnModel.getBodyContainerWidth() + "px";

        this.eAllBodyContainers.forEach( function(container: HTMLElement) {
            var unpinnedRows: [any] = (<any>container).querySelectorAll(".ag-row");
            for (var i = 0; i < unpinnedRows.length; i++) {
                unpinnedRows[i].style.width = mainRowWidth;
            }
        });
    }

    private findAllElements(gridPanel: any) {
        this.eBodyContainer = gridPanel.getBodyContainer();
        this.ePinnedLeftColsContainer = gridPanel.getPinnedLeftColsContainer();
        this.ePinnedRightColsContainer = gridPanel.getPinnedRightColsContainer();

        this.eFloatingTopContainer = gridPanel.getFloatingTopContainer();
        this.eFloatingTopPinnedLeftContainer = gridPanel.getPinnedLeftFloatingTop();
        this.eFloatingTopPinnedRightContainer = gridPanel.getPinnedRightFloatingTop();

        this.eFloatingBottomContainer = gridPanel.getFloatingBottomContainer();
        this.eFloatingBottomPinnedLeftContainer = gridPanel.getPinnedLeftFloatingBottom();
        this.eFloatingBottomPinnedRightContainer = gridPanel.getPinnedRightFloatingBottom();

        this.eBodyViewport = gridPanel.getBodyViewport();
        this.eParentsOfRows = gridPanel.getRowsParent();

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

    public refreshAllFloatingRows(): void {
        this.refreshFloatingRows(
            this.renderedTopFloatingRows,
            this.floatingRowModel.getFloatingTopRowData(),
            this.eFloatingTopPinnedLeftContainer,
            this.eFloatingTopPinnedRightContainer,
            this.eFloatingTopContainer);
        this.refreshFloatingRows(
            this.renderedBottomFloatingRows,
            this.floatingRowModel.getFloatingBottomRowData(),
            this.eFloatingBottomPinnedLeftContainer,
            this.eFloatingBottomPinnedRightContainer,
            this.eFloatingBottomContainer);
    }

    private refreshFloatingRows(renderedRows: RenderedRow[], rowNodes: RowNode[],
                                pinnedLeftContainer: HTMLElement, pinnedRightContainer: HTMLElement,
                                bodyContainer: HTMLElement): void {
        renderedRows.forEach( (row: RenderedRow) => {
            row.destroy();
        });

        renderedRows.length = 0;

        // if no cols, don't draw row - can we get rid of this???
        var columns = this.columnModel.getAllDisplayedColumns();
        if (!columns || columns.length == 0) {
            return;
        }

        if (rowNodes) {
            rowNodes.forEach( (node: RowNode, rowIndex: number) => {
                var renderedRow = new RenderedRow(this.gridOptionsWrapper, this.valueService, this.$scope,
                    this.angularGrid, this.columnModel, this.expressionService, this.cellRendererMap,
                    this.selectionRendererFactory, this.$compile, this.templateService,
                    this.selectionController, this, bodyContainer, pinnedLeftContainer, pinnedRightContainer,
                    node, rowIndex, this.eventService);
                renderedRows.push(renderedRow);
            })
        }
    }

    public refreshView(refreshFromIndex?: any) {
        if (!this.gridOptionsWrapper.isForPrint()) {
            var containerHeight = this.rowModel.getVirtualRowCombinedHeight();
            this.eBodyContainer.style.height = containerHeight + "px";
            this.ePinnedLeftColsContainer.style.height = containerHeight + "px";
            this.ePinnedRightColsContainer.style.height = containerHeight + "px";
        }

        this.refreshAllVirtualRows(refreshFromIndex);
        this.refreshAllFloatingRows();
    }

    public softRefreshView() {
        _.iterateObject(this.renderedRows, (key: any, renderedRow: RenderedRow)=> {
            renderedRow.softRefresh();
        });
    }

    public refreshRows(rowNodes: RowNode[]): void {
        if (!rowNodes || rowNodes.length==0) {
            return;
        }
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
    }

    public refreshCells(rowNodes: RowNode[], colIds: string[]): void {
        if (!rowNodes || rowNodes.length==0) {
            return;
        }
        // we only need to be worried about rendered rows, as this method is
        // called to whats rendered. if the row isn't rendered, we don't care
        _.iterateObject(this.renderedRows, (key: string, renderedRow: RenderedRow)=> {
            var rowNode = renderedRow.getRowNode();
            if (rowNodes.indexOf(rowNode)>=0) {
                renderedRow.refreshCells(colIds);
            }
        });
    }

    public rowDataChanged(rows: any) {
        // we only need to be worried about rendered rows, as this method is
        // called to whats rendered. if the row isn't rendered, we don't care
        var indexesToRemove: any = [];
        var renderedRows = this.renderedRows;
        Object.keys(renderedRows).forEach(function (key: any) {
            var renderedRow = renderedRows[key];
            // see if the rendered row is in the list of rows we have to update
            if (renderedRow.isDataInList(rows)) {
                indexesToRemove.push(key);
            }
        });
        // remove the rows
        this.removeVirtualRow(indexesToRemove);
        // add draw them again
        this.drawVirtualRows();
    }

    public destroy() {
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
        var that = this;
        Object.keys(this.renderedRows).forEach(function (key: any) {
            var renderedRow = that.renderedRows[key];
            if (renderedRow.isGroup()) {
                rowsToRemove.push(key);
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

                // if the row was last to have focus, we remove the fact that it has focus
                if (that.focusedCell && that.focusedCell.rowIndex == indexToRemove) {
                    that.focusedCell = null;
                }
            }
        });
    }

    private unbindVirtualRow(indexToRemove: any) {
        var renderedRow = this.renderedRows[indexToRemove];
        renderedRow.destroy();

        var event = {node: renderedRow.getRowNode(), rowIndex: indexToRemove};
        this.eventService.dispatchEvent(Events.EVENT_VIRTUAL_ROW_REMOVED, event);
        this.angularGrid.onVirtualRowRemoved(indexToRemove);

        delete this.renderedRows[indexToRemove];
    }

    public drawVirtualRows() {
        this.workOutFirstAndLastRowsToRender();
        this.ensureRowsRendered();
    }

    public workOutFirstAndLastRowsToRender(): void {

        var rowCount = this.rowModel.getVirtualRowCount();

        if (rowCount===0) {
            this.firstVirtualRenderedRow = 0;
            this.lastVirtualRenderedRow = -1; // setting to -1 means nothing in range
            return;
        }

        if (this.gridOptionsWrapper.isForPrint()) {
            this.firstVirtualRenderedRow = 0;
            this.lastVirtualRenderedRow = rowCount;
        } else {

            var topPixel = this.eBodyViewport.scrollTop;
            var bottomPixel = topPixel + this.eBodyViewport.offsetHeight;

            var first = this.rowModel.getRowAtPixel(topPixel);
            var last = this.rowModel.getRowAtPixel(bottomPixel);

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

            this.firstVirtualRenderedRow = first;
            this.lastVirtualRenderedRow = last;
        }

    }

    public getFirstVirtualRenderedRow() {
        return this.firstVirtualRenderedRow;
    }

    public getLastVirtualRenderedRow() {
        return this.lastVirtualRenderedRow;
    }

    private ensureRowsRendered() {

        //var start = new Date().getTime();

        var mainRowWidth = this.columnModel.getBodyContainerWidth();

        // at the end, this array will contain the items we need to remove
        var rowsToRemove = Object.keys(this.renderedRows);

        // add in new rows
        for (var rowIndex = this.firstVirtualRenderedRow; rowIndex <= this.lastVirtualRenderedRow; rowIndex++) {
            // see if item already there, and if yes, take it out of the 'to remove' array
            if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                continue;
            }
            // check this row actually exists (in case overflow buffer window exceeds real data)
            var node = this.rowModel.getVirtualRow(rowIndex);
            if (node) {
                this.insertRow(node, rowIndex, mainRowWidth);
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

    private insertRow(node: any, rowIndex: any, mainRowWidth: any) {
        var columns = this.columnModel.getAllDisplayedColumns();
        // if no cols, don't draw row
        if (!columns || columns.length == 0) {
            return;
        }

        var renderedRow = new RenderedRow(this.gridOptionsWrapper, this.valueService, this.$scope,
            this.angularGrid, this.columnModel, this.expressionService, this.cellRendererMap,
            this.selectionRendererFactory, this.$compile, this.templateService, this.selectionController,
            this, this.eBodyContainer, this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer,
            node, rowIndex, this.eventService);
        //renderedRow.setMainRowWidth(mainRowWidth);

        this.renderedRows[rowIndex] = renderedRow;
    }

    // Separating out the rendering into frames was experimental, but it looked crap.
    //private rowRenderIntervalId: number;
    //
    //private renderRows(): void {
    //    var frameStartMillis = new Date().getTime();
    //    var keys = Object.keys(this.renderedRows);
    //    keys.sort( (a, b) => Number(a) - Number(b) );
    //    var atLeastOne = false;
    //    var count = 0;
    //    for (var i = 0; i<keys.length; i++) {
    //        var renderedRow = this.renderedRows[keys[i]];
    //        if (!renderedRow.isRendered()) {
    //            renderedRow.render();
    //            atLeastOne = true;
    //            var nowMillis = new Date().getTime();
    //            var frameDuration = nowMillis - frameStartMillis;
    //            count++;
    //            // 16ms is 60 FPS, so if going slower than 60 FPS, we finish this frame
    //            if (frameDuration>100) {
    //                break;
    //            }
    //        }
    //    }
    //    if (!atLeastOne) {
    //        clearInterval(this.rowRenderIntervalId);
    //        this.rowRenderIntervalId = null;
    //    }
    //    //console.log('count = ' + count);
    //}

    public getRenderedNodes() {
        var renderedRows = this.renderedRows;
        return Object.keys(renderedRows).map(key => {
            return renderedRows[key].getRowNode();
        });
    }

    public getIndexOfRenderedNode(node: any): number {
        var renderedRows = this.renderedRows;
        var keys: string[] = Object.keys(renderedRows);
        for (var i = 0; i < keys.length; i++) {
            var key: string = keys[i];
            if (renderedRows[key].getRowNode() === node) {
                return renderedRows[key].getRowIndex();
            }
        }
        return -1;
    }

    // we use index for rows, but column object for columns, as the next column (by index) might not
    // be visible (header grouping) so it's not reliable, so using the column object instead.
    public navigateToNextCell(key: any, rowIndex: number, column: Column) {

        var cellToFocus = {rowIndex: rowIndex, column: column};
        var renderedRow: RenderedRow;
        var eCell: any;

        // we keep searching for a next cell until we find one. this is how the group rows get skipped
        while (!eCell) {
            cellToFocus = this.getNextCellToFocus(key, cellToFocus);
            // no next cell means we have reached a grid boundary, eg left, right, top or bottom of grid
            if (!cellToFocus) {
                return;
            }
            // see if the next cell is selectable, if yes, use it, if not, skip it
            renderedRow = this.renderedRows[cellToFocus.rowIndex];
            eCell = renderedRow.getCellForCol(cellToFocus.column);
        }

        // this scrolls the row into view
        this.gridPanel.ensureIndexVisible(renderedRow.getRowIndex());

        // this changes the css on the cell
        this.focusCell(eCell, cellToFocus.rowIndex, cellToFocus.column.getColId(), cellToFocus.column.getColDef(), true);
    }

    private getNextCellToFocus(key: any, lastCellToFocus: any) {
        var lastRowIndex = lastCellToFocus.rowIndex;
        var lastColumn = lastCellToFocus.column;

        var nextRowToFocus: any;
        var nextColumnToFocus: any;
        switch (key) {
            case Constants.KEY_UP :
                // if already on top row, do nothing
                if (lastRowIndex === this.firstVirtualRenderedRow) {
                    return null;
                }
                nextRowToFocus = lastRowIndex - 1;
                nextColumnToFocus = lastColumn;
                break;
            case Constants.KEY_DOWN :
                // if already on bottom, do nothing
                if (lastRowIndex === this.lastVirtualRenderedRow) {
                    return null;
                }
                nextRowToFocus = lastRowIndex + 1;
                nextColumnToFocus = lastColumn;
                break;
            case Constants.KEY_RIGHT :
                var colToRight = this.columnModel.getDisplayedColAfter(lastColumn);
                // if already on right, do nothing
                if (!colToRight) {
                    return null;
                }
                nextRowToFocus = lastRowIndex;
                nextColumnToFocus = colToRight;
                break;
            case Constants.KEY_LEFT :
                var colToLeft = this.columnModel.getDisplayedColBefore(lastColumn);
                // if already on left, do nothing
                if (!colToLeft) {
                    return null;
                }
                nextRowToFocus = lastRowIndex;
                nextColumnToFocus = colToLeft;
                break;
        }

        return {
            rowIndex: nextRowToFocus,
            column: nextColumnToFocus
        };
    }

    public onRowSelected(rowIndex: number, selected: boolean) {
        if (this.renderedRows[rowIndex]) {
            this.renderedRows[rowIndex].onRowSelected(selected);
        }
    }

    // called by the renderedRow
    public focusCell(eCell: any, rowIndex: number, colId: string, colDef: ColDef, forceBrowserFocus: any) {
        // do nothing if cell selection is off
        if (this.gridOptionsWrapper.isSuppressCellSelection()) {
            return;
        }

        this.eParentsOfRows.forEach( function(rowContainer: HTMLElement) {
            // remove any previous focus
            _.querySelectorAll_replaceCssClass(rowContainer, '.ag-cell-focus', 'ag-cell-focus', 'ag-cell-no-focus');
            _.querySelectorAll_replaceCssClass(rowContainer, '.ag-row-focus', 'ag-row-focus', 'ag-row-no-focus');

            var selectorForCell = '[row="' + rowIndex + '"] [colId="' + colId + '"]';
            _.querySelectorAll_replaceCssClass(rowContainer, selectorForCell, 'ag-cell-no-focus', 'ag-cell-focus');
            var selectorForRow = '[row="' + rowIndex + '"]';
            _.querySelectorAll_replaceCssClass(rowContainer, selectorForRow, 'ag-row-no-focus', 'ag-row-focus');
        });

        this.focusedCell = {rowIndex: rowIndex, colId: colId, node: this.rowModel.getVirtualRow(rowIndex), colDef: colDef};

        // this puts the browser focus on the cell (so it gets key presses)
        if (forceBrowserFocus) {
            eCell.focus();
        }

        this.eventService.dispatchEvent(Events.EVENT_CELL_FOCUSED, this.focusedCell);
    }

    // for API
    public getFocusedCell() {
        return this.focusedCell;
    }

    // called via API
    public setFocusedCell(rowIndex: any, colIndex: any) {
        var renderedRow = this.renderedRows[rowIndex];
        var column = this.columnModel.getAllDisplayedColumns()[colIndex];
        if (renderedRow && column) {
            var eCell = renderedRow.getCellForCol(column);
            this.focusCell(eCell, rowIndex, colIndex, column.getColDef(), true);
        }
    }

    // called by the cell, when tab is pressed while editing
    public startEditingNextCell(rowIndex: any, column: any, shiftKey: any) {

        var firstRowToCheck = this.firstVirtualRenderedRow;
        var lastRowToCheck = this.lastVirtualRenderedRow;
        var currentRowIndex = rowIndex;

        var visibleColumns = this.columnModel.getAllDisplayedColumns();
        var currentCol = column;

        while (true) {

            var indexOfCurrentCol = visibleColumns.indexOf(currentCol);

            // move backward
            if (shiftKey) {
                // move along to the previous cell
                currentCol = visibleColumns[indexOfCurrentCol - 1];
                // check if end of the row, and if so, go back a row
                if (!currentCol) {
                    currentCol = visibleColumns[visibleColumns.length - 1];
                    currentRowIndex--;
                }

                // if got to end of rendered rows, then quit looking
                if (currentRowIndex < firstRowToCheck) {
                    return;
                }
                // move forward
            } else {
                // move along to the next cell
                currentCol = visibleColumns[indexOfCurrentCol + 1];
                // check if end of the row, and if so, go forward a row
                if (!currentCol) {
                    currentCol = visibleColumns[0];
                    currentRowIndex++;
                }

                // if got to end of rendered rows, then quit looking
                if (currentRowIndex > lastRowToCheck) {
                    return;
                }
            }

            var nextRenderedRow: RenderedRow = this.renderedRows[currentRowIndex];
            var nextRenderedCell: RenderedCell = nextRenderedRow.getRenderedCellForColumn(currentCol);
            if (nextRenderedCell.isCellEditable()) {
                nextRenderedCell.startEditing();
                nextRenderedCell.focusCell(false);
                return;
            }
        }
    }
}
