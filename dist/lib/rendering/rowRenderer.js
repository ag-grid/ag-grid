/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var renderedRow_1 = require("./renderedRow");
var groupCellRendererFactory_1 = require("../cellRenderers/groupCellRendererFactory");
var events_1 = require("../events");
var constants_1 = require("../constants");
var RowRenderer = (function () {
    function RowRenderer() {
        this.renderedTopFloatingRows = [];
        this.renderedBottomFloatingRows = [];
    }
    RowRenderer.prototype.init = function (columnModel, gridOptionsWrapper, gridPanel, angularGrid, selectionRendererFactory, $compile, $scope, selectionController, expressionService, templateService, valueService, eventService, floatingRowModel) {
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
            'group': groupCellRendererFactory_1.default(gridOptionsWrapper, selectionRendererFactory, expressionService, eventService),
            'default': function (params) {
                return params.value;
            }
        };
        // map of row ids to row objects. keeps track of which elements
        // are rendered for which rows in the dom.
        this.renderedRows = {};
    };
    RowRenderer.prototype.setRowModel = function (rowModel) {
        this.rowModel = rowModel;
    };
    RowRenderer.prototype.getAllCellsForColumn = function (column) {
        var eCells = [];
        utils_1.default.iterateObject(this.renderedRows, callback);
        utils_1.default.iterateObject(this.renderedBottomFloatingRows, callback);
        utils_1.default.iterateObject(this.renderedBottomFloatingRows, callback);
        function callback(key, renderedRow) {
            var eCell = renderedRow.getCellForCol(column);
            if (eCell) {
                eCells.push(eCell);
            }
        }
        return eCells;
    };
    RowRenderer.prototype.setMainRowWidths = function () {
        var mainRowWidth = this.columnModel.getBodyContainerWidth() + "px";
        this.eAllBodyContainers.forEach(function (container) {
            var unpinnedRows = container.querySelectorAll(".ag-row");
            for (var i = 0; i < unpinnedRows.length; i++) {
                unpinnedRows[i].style.width = mainRowWidth;
            }
        });
    };
    RowRenderer.prototype.findAllElements = function (gridPanel) {
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
    };
    RowRenderer.prototype.refreshAllFloatingRows = function () {
        this.refreshFloatingRows(this.renderedTopFloatingRows, this.floatingRowModel.getFloatingTopRowData(), this.eFloatingTopPinnedLeftContainer, this.eFloatingTopPinnedRightContainer, this.eFloatingTopContainer);
        this.refreshFloatingRows(this.renderedBottomFloatingRows, this.floatingRowModel.getFloatingBottomRowData(), this.eFloatingBottomPinnedLeftContainer, this.eFloatingBottomPinnedRightContainer, this.eFloatingBottomContainer);
    };
    RowRenderer.prototype.refreshFloatingRows = function (renderedRows, rowNodes, pinnedLeftContainer, pinnedRightContainer, bodyContainer) {
        var _this = this;
        renderedRows.forEach(function (row) {
            row.destroy();
        });
        renderedRows.length = 0;
        // if no cols, don't draw row - can we get rid of this???
        var columns = this.columnModel.getAllDisplayedColumns();
        if (!columns || columns.length == 0) {
            return;
        }
        if (rowNodes) {
            rowNodes.forEach(function (node, rowIndex) {
                var renderedRow = new renderedRow_1.default(_this.gridOptionsWrapper, _this.valueService, _this.$scope, _this.angularGrid, _this.columnModel, _this.expressionService, _this.cellRendererMap, _this.selectionRendererFactory, _this.$compile, _this.templateService, _this.selectionController, _this, bodyContainer, pinnedLeftContainer, pinnedRightContainer, node, rowIndex, _this.eventService);
                renderedRows.push(renderedRow);
            });
        }
    };
    RowRenderer.prototype.refreshView = function (refreshFromIndex) {
        if (!this.gridOptionsWrapper.isForPrint()) {
            var containerHeight = this.rowModel.getVirtualRowCombinedHeight();
            this.eBodyContainer.style.height = containerHeight + "px";
            this.ePinnedLeftColsContainer.style.height = containerHeight + "px";
            this.ePinnedRightColsContainer.style.height = containerHeight + "px";
        }
        this.refreshAllVirtualRows(refreshFromIndex);
        this.refreshAllFloatingRows();
    };
    RowRenderer.prototype.softRefreshView = function () {
        utils_1.default.iterateObject(this.renderedRows, function (key, renderedRow) {
            renderedRow.softRefresh();
        });
    };
    RowRenderer.prototype.refreshRows = function (rowNodes) {
        if (!rowNodes || rowNodes.length == 0) {
            return;
        }
        // we only need to be worried about rendered rows, as this method is
        // called to whats rendered. if the row isn't rendered, we don't care
        var indexesToRemove = [];
        utils_1.default.iterateObject(this.renderedRows, function (key, renderedRow) {
            var rowNode = renderedRow.getRowNode();
            if (rowNodes.indexOf(rowNode) >= 0) {
                indexesToRemove.push(key);
            }
        });
        // remove the rows
        this.removeVirtualRow(indexesToRemove);
        // add draw them again
        this.drawVirtualRows();
    };
    RowRenderer.prototype.refreshCells = function (rowNodes, colIds) {
        if (!rowNodes || rowNodes.length == 0) {
            return;
        }
        // we only need to be worried about rendered rows, as this method is
        // called to whats rendered. if the row isn't rendered, we don't care
        utils_1.default.iterateObject(this.renderedRows, function (key, renderedRow) {
            var rowNode = renderedRow.getRowNode();
            if (rowNodes.indexOf(rowNode) >= 0) {
                renderedRow.refreshCells(colIds);
            }
        });
    };
    RowRenderer.prototype.rowDataChanged = function (rows) {
        // we only need to be worried about rendered rows, as this method is
        // called to whats rendered. if the row isn't rendered, we don't care
        var indexesToRemove = [];
        var renderedRows = this.renderedRows;
        Object.keys(renderedRows).forEach(function (key) {
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
    };
    RowRenderer.prototype.destroy = function () {
        var rowsToRemove = Object.keys(this.renderedRows);
        this.removeVirtualRow(rowsToRemove);
    };
    RowRenderer.prototype.refreshAllVirtualRows = function (fromIndex) {
        // remove all current virtual rows, as they have old data
        var rowsToRemove = Object.keys(this.renderedRows);
        this.removeVirtualRow(rowsToRemove, fromIndex);
        // add in new rows
        this.drawVirtualRows();
    };
    // public - removes the group rows and then redraws them again
    RowRenderer.prototype.refreshGroupRows = function () {
        // find all the group rows
        var rowsToRemove = [];
        var that = this;
        Object.keys(this.renderedRows).forEach(function (key) {
            var renderedRow = that.renderedRows[key];
            if (renderedRow.isGroup()) {
                rowsToRemove.push(key);
            }
        });
        // remove the rows
        this.removeVirtualRow(rowsToRemove);
        // and draw them back again
        this.ensureRowsRendered();
    };
    // takes array of row indexes
    RowRenderer.prototype.removeVirtualRow = function (rowsToRemove, fromIndex) {
        var that = this;
        // if no fromIndex then set to -1, which will refresh everything
        var realFromIndex = (typeof fromIndex === 'number') ? fromIndex : -1;
        rowsToRemove.forEach(function (indexToRemove) {
            if (indexToRemove >= realFromIndex) {
                that.unbindVirtualRow(indexToRemove);
                // if the row was last to have focus, we remove the fact that it has focus
                if (that.focusedCell && that.focusedCell.rowIndex == indexToRemove) {
                    that.focusedCell = null;
                }
            }
        });
    };
    RowRenderer.prototype.unbindVirtualRow = function (indexToRemove) {
        var renderedRow = this.renderedRows[indexToRemove];
        renderedRow.destroy();
        var event = { node: renderedRow.getRowNode(), rowIndex: indexToRemove };
        this.eventService.dispatchEvent(events_1.Events.EVENT_VIRTUAL_ROW_REMOVED, event);
        this.angularGrid.onVirtualRowRemoved(indexToRemove);
        delete this.renderedRows[indexToRemove];
    };
    RowRenderer.prototype.drawVirtualRows = function () {
        this.workOutFirstAndLastRowsToRender();
        this.ensureRowsRendered();
    };
    RowRenderer.prototype.workOutFirstAndLastRowsToRender = function () {
        var rowCount = this.rowModel.getVirtualRowCount();
        if (rowCount === 0) {
            this.firstVirtualRenderedRow = 0;
            this.lastVirtualRenderedRow = -1; // setting to -1 means nothing in range
            return;
        }
        if (this.gridOptionsWrapper.isForPrint()) {
            this.firstVirtualRenderedRow = 0;
            this.lastVirtualRenderedRow = rowCount;
        }
        else {
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
    };
    RowRenderer.prototype.getFirstVirtualRenderedRow = function () {
        return this.firstVirtualRenderedRow;
    };
    RowRenderer.prototype.getLastVirtualRenderedRow = function () {
        return this.lastVirtualRenderedRow;
    };
    RowRenderer.prototype.ensureRowsRendered = function () {
        //var start = new Date().getTime();
        var _this = this;
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
            setTimeout(function () { _this.$scope.$apply(); }, 0);
        }
        //var end = new Date().getTime();
        //console.log(end-start);
    };
    RowRenderer.prototype.insertRow = function (node, rowIndex, mainRowWidth) {
        var columns = this.columnModel.getAllDisplayedColumns();
        // if no cols, don't draw row
        if (!columns || columns.length == 0) {
            return;
        }
        var renderedRow = new renderedRow_1.default(this.gridOptionsWrapper, this.valueService, this.$scope, this.angularGrid, this.columnModel, this.expressionService, this.cellRendererMap, this.selectionRendererFactory, this.$compile, this.templateService, this.selectionController, this, this.eBodyContainer, this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, node, rowIndex, this.eventService);
        //renderedRow.setMainRowWidth(mainRowWidth);
        this.renderedRows[rowIndex] = renderedRow;
    };
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
    RowRenderer.prototype.getRenderedNodes = function () {
        var renderedRows = this.renderedRows;
        return Object.keys(renderedRows).map(function (key) {
            return renderedRows[key].getRowNode();
        });
    };
    RowRenderer.prototype.getIndexOfRenderedNode = function (node) {
        var renderedRows = this.renderedRows;
        var keys = Object.keys(renderedRows);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (renderedRows[key].getRowNode() === node) {
                return renderedRows[key].getRowIndex();
            }
        }
        return -1;
    };
    // we use index for rows, but column object for columns, as the next column (by index) might not
    // be visible (header grouping) so it's not reliable, so using the column object instead.
    RowRenderer.prototype.navigateToNextCell = function (key, rowIndex, column) {
        var cellToFocus = { rowIndex: rowIndex, column: column };
        var renderedRow;
        var eCell;
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
    };
    RowRenderer.prototype.getNextCellToFocus = function (key, lastCellToFocus) {
        var lastRowIndex = lastCellToFocus.rowIndex;
        var lastColumn = lastCellToFocus.column;
        var nextRowToFocus;
        var nextColumnToFocus;
        switch (key) {
            case constants_1.default.KEY_UP:
                // if already on top row, do nothing
                if (lastRowIndex === this.firstVirtualRenderedRow) {
                    return null;
                }
                nextRowToFocus = lastRowIndex - 1;
                nextColumnToFocus = lastColumn;
                break;
            case constants_1.default.KEY_DOWN:
                // if already on bottom, do nothing
                if (lastRowIndex === this.lastVirtualRenderedRow) {
                    return null;
                }
                nextRowToFocus = lastRowIndex + 1;
                nextColumnToFocus = lastColumn;
                break;
            case constants_1.default.KEY_RIGHT:
                var colToRight = this.columnModel.getDisplayedColAfter(lastColumn);
                // if already on right, do nothing
                if (!colToRight) {
                    return null;
                }
                nextRowToFocus = lastRowIndex;
                nextColumnToFocus = colToRight;
                break;
            case constants_1.default.KEY_LEFT:
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
    };
    RowRenderer.prototype.onRowSelected = function (rowIndex, selected) {
        if (this.renderedRows[rowIndex]) {
            this.renderedRows[rowIndex].onRowSelected(selected);
        }
    };
    // called by the renderedRow
    RowRenderer.prototype.focusCell = function (eCell, rowIndex, colId, colDef, forceBrowserFocus) {
        // do nothing if cell selection is off
        if (this.gridOptionsWrapper.isSuppressCellSelection()) {
            return;
        }
        this.eParentsOfRows.forEach(function (rowContainer) {
            // remove any previous focus
            utils_1.default.querySelectorAll_replaceCssClass(rowContainer, '.ag-cell-focus', 'ag-cell-focus', 'ag-cell-no-focus');
            utils_1.default.querySelectorAll_replaceCssClass(rowContainer, '.ag-row-focus', 'ag-row-focus', 'ag-row-no-focus');
            var selectorForCell = '[row="' + rowIndex + '"] [colId="' + colId + '"]';
            utils_1.default.querySelectorAll_replaceCssClass(rowContainer, selectorForCell, 'ag-cell-no-focus', 'ag-cell-focus');
            var selectorForRow = '[row="' + rowIndex + '"]';
            utils_1.default.querySelectorAll_replaceCssClass(rowContainer, selectorForRow, 'ag-row-no-focus', 'ag-row-focus');
        });
        this.focusedCell = { rowIndex: rowIndex, colId: colId, node: this.rowModel.getVirtualRow(rowIndex), colDef: colDef };
        // this puts the browser focus on the cell (so it gets key presses)
        if (forceBrowserFocus) {
            eCell.focus();
        }
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_FOCUSED, this.focusedCell);
    };
    // for API
    RowRenderer.prototype.getFocusedCell = function () {
        return this.focusedCell;
    };
    // called via API
    RowRenderer.prototype.setFocusedCell = function (rowIndex, colIndex) {
        var renderedRow = this.renderedRows[rowIndex];
        var column = this.columnModel.getAllDisplayedColumns()[colIndex];
        if (renderedRow && column) {
            var eCell = renderedRow.getCellForCol(column);
            this.focusCell(eCell, rowIndex, colIndex, column.getColDef(), true);
        }
    };
    // called by the cell, when tab is pressed while editing
    RowRenderer.prototype.startEditingNextCell = function (rowIndex, column, shiftKey) {
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
            }
            else {
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
            var nextRenderedRow = this.renderedRows[currentRowIndex];
            var nextRenderedCell = nextRenderedRow.getRenderedCellForColumn(currentCol);
            if (nextRenderedCell.isCellEditable()) {
                nextRenderedCell.startEditing();
                nextRenderedCell.focusCell(false);
                return;
            }
        }
    };
    return RowRenderer;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RowRenderer;
