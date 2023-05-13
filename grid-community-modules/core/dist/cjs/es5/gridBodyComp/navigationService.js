/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationService = void 0;
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var generic_1 = require("../utils/generic");
var array_1 = require("../utils/array");
var keyCode_1 = require("../constants/keyCode");
var cellCtrl_1 = require("../rendering/cell/cellCtrl");
var rowCtrl_1 = require("../rendering/row/rowCtrl");
var function_1 = require("../utils/function");
var eventKeys_1 = require("../eventKeys");
var NavigationService = /** @class */ (function (_super) {
    __extends(NavigationService, _super);
    function NavigationService() {
        var _this = _super.call(this) || this;
        _this.onPageDown = function_1.throttle(_this.onPageDown, 100);
        _this.onPageUp = function_1.throttle(_this.onPageUp, 100);
        return _this;
    }
    NavigationService.prototype.postConstruct = function () {
        var _this = this;
        this.ctrlsService.whenReady(function (p) {
            _this.gridBodyCon = p.gridBodyCtrl;
        });
    };
    NavigationService.prototype.handlePageScrollingKey = function (event) {
        var key = event.key;
        var alt = event.altKey;
        var ctrl = event.ctrlKey || event.metaKey;
        var rangeServiceShouldHandleShift = !!this.rangeService && event.shiftKey;
        // home and end can be processed without knowing the currently selected cell, this can occur for full width rows.
        var currentCell = this.mouseEventService.getCellPositionForEvent(event);
        var processed = false;
        switch (key) {
            case keyCode_1.KeyCode.PAGE_HOME:
            case keyCode_1.KeyCode.PAGE_END:
                // handle home and end when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onHomeOrEndKey(key);
                    processed = true;
                }
                break;
            case keyCode_1.KeyCode.LEFT:
            case keyCode_1.KeyCode.RIGHT:
            case keyCode_1.KeyCode.UP:
            case keyCode_1.KeyCode.DOWN:
                if (!currentCell) {
                    return false;
                }
                // handle when ctrl is pressed only, if shift is pressed
                // it will be handled by the rangeService
                if (ctrl && !alt && !rangeServiceShouldHandleShift) {
                    this.onCtrlUpDownLeftRight(key, currentCell);
                    processed = true;
                }
                break;
            case keyCode_1.KeyCode.PAGE_DOWN:
                if (!currentCell) {
                    return false;
                }
                // handle page up and page down when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onPageDown(currentCell);
                    processed = true;
                }
                break;
            case keyCode_1.KeyCode.PAGE_UP:
                if (!currentCell) {
                    return false;
                }
                // handle page up and page down when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onPageUp(currentCell);
                    processed = true;
                }
                break;
        }
        if (processed) {
            event.preventDefault();
        }
        return processed;
    };
    NavigationService.prototype.navigateTo = function (navigateParams) {
        var scrollIndex = navigateParams.scrollIndex, scrollType = navigateParams.scrollType, scrollColumn = navigateParams.scrollColumn, focusIndex = navigateParams.focusIndex, focusColumn = navigateParams.focusColumn;
        if (generic_1.exists(scrollColumn) && !scrollColumn.isPinned()) {
            this.gridBodyCon.getScrollFeature().ensureColumnVisible(scrollColumn);
        }
        if (generic_1.exists(scrollIndex)) {
            this.gridBodyCon.getScrollFeature().ensureIndexVisible(scrollIndex, scrollType);
        }
        // setFocusedCell relies on the browser default focus behavior to scroll the focused cell into view,
        // however, this behavior will cause the cell border to be cut off, or if we have sticky rows, the
        // cell will be completely hidden, so we call ensureIndexVisible without a position to guarantee
        // minimal scroll to get the row into view.
        if (!navigateParams.isAsync) {
            this.gridBodyCon.getScrollFeature().ensureIndexVisible(focusIndex);
        }
        // if we don't do this, the range will be left on the last cell, which will leave the last focused cell
        // highlighted.
        this.focusService.setFocusedCell({ rowIndex: focusIndex, column: focusColumn, rowPinned: null, forceBrowserFocus: true });
        if (this.rangeService) {
            var cellPosition = { rowIndex: focusIndex, rowPinned: null, column: focusColumn };
            this.rangeService.setRangeToCell(cellPosition);
        }
    };
    NavigationService.prototype.onPageDown = function (gridCell) {
        var gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        var scrollPosition = gridBodyCon.getScrollFeature().getVScrollPosition();
        var pixelsInOnePage = this.getViewportHeight();
        var pagingPixelOffset = this.paginationProxy.getPixelOffset();
        var currentPageBottomPixel = scrollPosition.top + pixelsInOnePage;
        var currentPageBottomRow = this.paginationProxy.getRowIndexAtPixel(currentPageBottomPixel + pagingPixelOffset);
        if (this.columnModel.isAutoRowHeightActive()) {
            this.navigateToNextPageWithAutoHeight(gridCell, currentPageBottomRow);
        }
        else {
            this.navigateToNextPage(gridCell, currentPageBottomRow);
        }
    };
    NavigationService.prototype.onPageUp = function (gridCell) {
        var gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        var scrollPosition = gridBodyCon.getScrollFeature().getVScrollPosition();
        var pagingPixelOffset = this.paginationProxy.getPixelOffset();
        var currentPageTopPixel = scrollPosition.top;
        var currentPageTopRow = this.paginationProxy.getRowIndexAtPixel(currentPageTopPixel + pagingPixelOffset);
        if (this.columnModel.isAutoRowHeightActive()) {
            this.navigateToNextPageWithAutoHeight(gridCell, currentPageTopRow, true);
        }
        else {
            this.navigateToNextPage(gridCell, currentPageTopRow, true);
        }
    };
    NavigationService.prototype.navigateToNextPage = function (gridCell, scrollIndex, up) {
        if (up === void 0) { up = false; }
        var pixelsInOnePage = this.getViewportHeight();
        var firstRow = this.paginationProxy.getPageFirstRow();
        var lastRow = this.paginationProxy.getPageLastRow();
        var pagingPixelOffset = this.paginationProxy.getPixelOffset();
        var currentRowNode = this.paginationProxy.getRow(gridCell.rowIndex);
        var rowPixelDiff = up
            ? ((currentRowNode === null || currentRowNode === void 0 ? void 0 : currentRowNode.rowHeight) - pixelsInOnePage - pagingPixelOffset)
            : (pixelsInOnePage - pagingPixelOffset);
        var nextCellPixel = (currentRowNode === null || currentRowNode === void 0 ? void 0 : currentRowNode.rowTop) + rowPixelDiff;
        var focusIndex = this.paginationProxy.getRowIndexAtPixel(nextCellPixel + pagingPixelOffset);
        if (focusIndex === gridCell.rowIndex) {
            var diff = up ? -1 : 1;
            scrollIndex = focusIndex = gridCell.rowIndex + diff;
        }
        var scrollType;
        if (up) {
            scrollType = 'bottom';
            if (focusIndex < firstRow) {
                focusIndex = firstRow;
            }
            if (scrollIndex < firstRow) {
                scrollIndex = firstRow;
            }
        }
        else {
            scrollType = 'top';
            if (focusIndex > lastRow) {
                focusIndex = lastRow;
            }
            if (scrollIndex > lastRow) {
                scrollIndex = lastRow;
            }
        }
        if (this.isRowTallerThanView(focusIndex)) {
            scrollIndex = focusIndex;
            scrollType = 'top';
        }
        this.navigateTo({
            scrollIndex: scrollIndex,
            scrollType: scrollType,
            scrollColumn: null,
            focusIndex: focusIndex,
            focusColumn: gridCell.column
        });
    };
    NavigationService.prototype.navigateToNextPageWithAutoHeight = function (gridCell, scrollIndex, up) {
        var _this = this;
        if (up === void 0) { up = false; }
        // because autoHeight will calculate the height of rows after scroll
        // first we scroll towards the required point, then we add a small
        // delay to allow the height to be recalculated, check which index
        // should be focused and then finally navigate to that index.
        // TODO: we should probably have an event fired once to scrollbar has
        // settled and all rowHeights have been calculated instead of relying
        // on a setTimeout of 50ms.
        this.navigateTo({
            scrollIndex: scrollIndex,
            scrollType: up ? 'bottom' : 'top',
            scrollColumn: null,
            focusIndex: scrollIndex,
            focusColumn: gridCell.column
        });
        setTimeout(function () {
            var focusIndex = _this.getNextFocusIndexForAutoHeight(gridCell, up);
            _this.navigateTo({
                scrollIndex: scrollIndex,
                scrollType: up ? 'bottom' : 'top',
                scrollColumn: null,
                focusIndex: focusIndex,
                focusColumn: gridCell.column,
                isAsync: true
            });
        }, 50);
    };
    NavigationService.prototype.getNextFocusIndexForAutoHeight = function (gridCell, up) {
        var _a;
        if (up === void 0) { up = false; }
        var step = up ? -1 : 1;
        var pixelsInOnePage = this.getViewportHeight();
        var lastRowIndex = this.paginationProxy.getPageLastRow();
        var pixelSum = 0;
        var currentIndex = gridCell.rowIndex;
        while (currentIndex >= 0 && currentIndex <= lastRowIndex) {
            var currentCell = this.paginationProxy.getRow(currentIndex);
            if (currentCell) {
                var currentCellHeight = (_a = currentCell.rowHeight) !== null && _a !== void 0 ? _a : 0;
                if (pixelSum + currentCellHeight > pixelsInOnePage) {
                    break;
                }
                pixelSum += currentCellHeight;
            }
            currentIndex += step;
        }
        return Math.max(0, Math.min(currentIndex, lastRowIndex));
    };
    NavigationService.prototype.getViewportHeight = function () {
        var gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        var scrollPosition = gridBodyCon.getScrollFeature().getVScrollPosition();
        var scrollbarWidth = this.gridOptionsService.getScrollbarWidth();
        var pixelsInOnePage = scrollPosition.bottom - scrollPosition.top;
        if (this.ctrlsService.getCenterRowContainerCtrl().isHorizontalScrollShowing()) {
            pixelsInOnePage -= scrollbarWidth;
        }
        return pixelsInOnePage;
    };
    NavigationService.prototype.isRowTallerThanView = function (rowIndex) {
        var rowNode = this.paginationProxy.getRow(rowIndex);
        if (!rowNode) {
            return false;
        }
        var rowHeight = rowNode.rowHeight;
        if (typeof rowHeight !== 'number') {
            return false;
        }
        return rowHeight > this.getViewportHeight();
    };
    NavigationService.prototype.onCtrlUpDownLeftRight = function (key, gridCell) {
        var cellToFocus = this.cellNavigationService.getNextCellToFocus(key, gridCell, true);
        var rowIndex = cellToFocus.rowIndex, column = cellToFocus.column;
        this.navigateTo({
            scrollIndex: rowIndex,
            scrollType: null,
            scrollColumn: column,
            focusIndex: rowIndex,
            focusColumn: column
        });
    };
    // home brings focus to top left cell, end brings focus to bottom right, grid scrolled to bring
    // same cell into view (which means either scroll all the way up, or all the way down).
    NavigationService.prototype.onHomeOrEndKey = function (key) {
        var homeKey = key === keyCode_1.KeyCode.PAGE_HOME;
        var allColumns = this.columnModel.getAllDisplayedColumns();
        var columnToSelect = homeKey ? allColumns[0] : array_1.last(allColumns);
        var scrollIndex = homeKey ? this.paginationProxy.getPageFirstRow() : this.paginationProxy.getPageLastRow();
        this.navigateTo({
            scrollIndex: scrollIndex,
            scrollType: null,
            scrollColumn: columnToSelect,
            focusIndex: scrollIndex,
            focusColumn: columnToSelect
        });
    };
    // result of keyboard event
    NavigationService.prototype.onTabKeyDown = function (previous, keyboardEvent) {
        var backwards = keyboardEvent.shiftKey;
        var movedToNextCell = this.tabToNextCellCommon(previous, backwards, keyboardEvent);
        if (movedToNextCell) {
            // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
            // to the normal tabbing so user can exit the grid.
            keyboardEvent.preventDefault();
            return;
        }
        // if we didn't move to next cell, then need to tab out of the cells, ie to the header (if going
        // backwards)
        if (backwards) {
            var _a = previous.getRowPosition(), rowIndex = _a.rowIndex, rowPinned = _a.rowPinned;
            var firstRow = rowPinned ? rowIndex === 0 : rowIndex === this.paginationProxy.getPageFirstRow();
            if (firstRow) {
                if (this.gridOptionsService.getNum('headerHeight') === 0) {
                    this.focusService.focusNextGridCoreContainer(true, true);
                }
                else {
                    keyboardEvent.preventDefault();
                    this.focusService.focusLastHeader(keyboardEvent);
                }
            }
        }
        else {
            // if the case it's a popup editor, the focus is on the editor and not the previous cell.
            // in order for the tab navigation to work, we need to focus the browser back onto the
            // previous cell.
            if (previous instanceof cellCtrl_1.CellCtrl) {
                previous.focusCell(true);
            }
            if (this.focusService.focusNextGridCoreContainer(backwards)) {
                keyboardEvent.preventDefault();
            }
        }
    };
    // comes from API
    NavigationService.prototype.tabToNextCell = function (backwards, event) {
        var focusedCell = this.focusService.getFocusedCell();
        // if no focus, then cannot navigate
        if (!focusedCell) {
            return false;
        }
        var cellOrRow = this.getCellByPosition(focusedCell);
        // if cell is not rendered, means user has scrolled away from the cell
        // or that the focusedCell is a Full Width Row
        if (!cellOrRow) {
            cellOrRow = this.rowRenderer.getRowByPosition(focusedCell);
            if (!cellOrRow || !cellOrRow.isFullWidth()) {
                return false;
            }
        }
        return this.tabToNextCellCommon(cellOrRow, backwards, event);
    };
    NavigationService.prototype.tabToNextCellCommon = function (previous, backwards, event) {
        var editing = previous.isEditing();
        // if cell is not editing, there is still chance row is editing if it's Full Row Editing
        if (!editing && previous instanceof cellCtrl_1.CellCtrl) {
            var cell = previous;
            var row = cell.getRowCtrl();
            if (row) {
                editing = row.isEditing();
            }
        }
        var res;
        if (editing) {
            // if we are editing, we know it's not a Full Width Row (RowComp)
            if (this.gridOptionsService.get('editType') === 'fullRow') {
                res = this.moveToNextEditingRow(previous, backwards, event);
            }
            else {
                res = this.moveToNextEditingCell(previous, backwards, event);
            }
        }
        else {
            res = this.moveToNextCellNotEditing(previous, backwards);
        }
        // if a cell wasn't found, it's possible that focus was moved to the header
        return res || !!this.focusService.getFocusedHeader();
    };
    NavigationService.prototype.moveToNextEditingCell = function (previousCell, backwards, event) {
        if (event === void 0) { event = null; }
        var previousPos = previousCell.getCellPosition();
        // before we stop editing, we need to focus the cell element
        // so the grid doesn't detect that focus has left the grid
        previousCell.getGui().focus();
        // need to do this before getting next cell to edit, in case the next cell
        // has editable function (eg colDef.editable=func() ) and it depends on the
        // result of this cell, so need to save updates from the first edit, in case
        // the value is referenced in the function.
        previousCell.stopEditing();
        // find the next cell to start editing
        var nextCell = this.findNextCellToFocusOn(previousPos, backwards, true);
        if (nextCell == null) {
            return false;
        }
        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        nextCell.startEditing(null, null, true, event);
        nextCell.focusCell(false);
        return true;
    };
    NavigationService.prototype.moveToNextEditingRow = function (previousCell, backwards, event) {
        if (event === void 0) { event = null; }
        var previousPos = previousCell.getCellPosition();
        // find the next cell to start editing
        var nextCell = this.findNextCellToFocusOn(previousPos, backwards, true);
        if (nextCell == null) {
            return false;
        }
        var nextPos = nextCell.getCellPosition();
        var previousEditable = this.isCellEditable(previousPos);
        var nextEditable = this.isCellEditable(nextPos);
        var rowsMatch = nextPos && previousPos.rowIndex === nextPos.rowIndex && previousPos.rowPinned === nextPos.rowPinned;
        if (previousEditable) {
            previousCell.setFocusOutOnEditor();
        }
        if (!rowsMatch) {
            var pRow = previousCell.getRowCtrl();
            pRow.stopEditing();
            var nRow = nextCell.getRowCtrl();
            nRow.startRowEditing(undefined, undefined, undefined, event);
        }
        if (nextEditable) {
            nextCell.setFocusInOnEditor();
            nextCell.focusCell();
        }
        else {
            nextCell.focusCell(true);
        }
        return true;
    };
    NavigationService.prototype.moveToNextCellNotEditing = function (previousCell, backwards) {
        var displayedColumns = this.columnModel.getAllDisplayedColumns();
        var cellPos;
        if (previousCell instanceof rowCtrl_1.RowCtrl) {
            cellPos = __assign(__assign({}, previousCell.getRowPosition()), { column: backwards ? displayedColumns[0] : array_1.last(displayedColumns) });
        }
        else {
            cellPos = previousCell.getCellPosition();
        }
        // find the next cell to start editing
        var nextCell = this.findNextCellToFocusOn(cellPos, backwards, false);
        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (nextCell instanceof cellCtrl_1.CellCtrl) {
            nextCell.focusCell(true);
        }
        else if (nextCell) {
            return this.tryToFocusFullWidthRow(nextCell.getRowPosition(), backwards);
        }
        return generic_1.exists(nextCell);
    };
    // called by the cell, when tab is pressed while editing.
    // @return: RenderedCell when navigation successful, otherwise null
    NavigationService.prototype.findNextCellToFocusOn = function (previousPosition, backwards, startEditing) {
        var nextPosition = previousPosition;
        while (true) {
            if (previousPosition !== nextPosition) {
                previousPosition = nextPosition;
            }
            if (!backwards) {
                nextPosition = this.getLastCellOfColSpan(nextPosition);
            }
            nextPosition = this.cellNavigationService.getNextTabbedCell(nextPosition, backwards);
            // allow user to override what cell to go to next
            var userFunc = this.gridOptionsService.getCallback('tabToNextCell');
            if (generic_1.exists(userFunc)) {
                var params = {
                    backwards: backwards,
                    editing: startEditing,
                    previousCellPosition: previousPosition,
                    nextCellPosition: nextPosition ? nextPosition : null
                };
                var userCell = userFunc(params);
                if (generic_1.exists(userCell)) {
                    if (userCell.floating) {
                        function_1.doOnce(function () { console.warn("AG Grid: tabToNextCellFunc return type should have attributes: rowIndex, rowPinned, column. However you had 'floating', maybe you meant 'rowPinned'?"); }, 'no floating in userCell');
                        userCell.rowPinned = userCell.floating;
                    }
                    nextPosition = {
                        rowIndex: userCell.rowIndex,
                        column: userCell.column,
                        rowPinned: userCell.rowPinned
                    };
                }
                else {
                    nextPosition = null;
                }
            }
            // if no 'next cell', means we have got to last cell of grid, so nothing to move to,
            // so bottom right cell going forwards, or top left going backwards
            if (!nextPosition) {
                return null;
            }
            if (nextPosition.rowIndex < 0) {
                var headerLen = this.headerNavigationService.getHeaderRowCount();
                this.focusService.focusHeaderPosition({
                    headerPosition: {
                        headerRowIndex: headerLen + (nextPosition.rowIndex),
                        column: nextPosition.column
                    }
                });
                return null;
            }
            // if editing, but cell not editable, skip cell. we do this before we do all of
            // the 'ensure index visible' and 'flush all frames', otherwise if we are skipping
            // a bunch of cells (eg 10 rows) then all the work on ensuring cell visible is useless
            // (except for the last one) which causes grid to stall for a while.
            // note - for full row edit, we do focus non-editable cells, as the row stays in edit mode.
            var fullRowEdit = this.gridOptionsService.get('editType') === 'fullRow';
            if (startEditing && !fullRowEdit) {
                var cellIsEditable = this.isCellEditable(nextPosition);
                if (!cellIsEditable) {
                    continue;
                }
            }
            this.ensureCellVisible(nextPosition);
            // we have to call this after ensureColumnVisible - otherwise it could be a virtual column
            // or row that is not currently in view, hence the renderedCell would not exist
            var nextCell = this.getCellByPosition(nextPosition);
            // if next cell is fullWidth row, then no rendered cell,
            // as fullWidth rows have no cells, so we skip it
            if (!nextCell) {
                var row = this.rowRenderer.getRowByPosition(nextPosition);
                if (!row || !row.isFullWidth() || startEditing) {
                    continue;
                }
                return row;
            }
            if (nextCell.isSuppressNavigable()) {
                continue;
            }
            // by default, when we click a cell, it gets selected into a range, so to keep keyboard navigation
            // consistent, we set into range here also.
            if (this.rangeService) {
                this.rangeService.setRangeToCell(nextPosition);
            }
            // we successfully tabbed onto a grid cell, so return true
            return nextCell;
        }
    };
    NavigationService.prototype.isCellEditable = function (cell) {
        var rowNode = this.lookupRowNodeForCell(cell);
        if (rowNode) {
            return cell.column.isCellEditable(rowNode);
        }
        return false;
    };
    NavigationService.prototype.getCellByPosition = function (cellPosition) {
        var rowCtrl = this.rowRenderer.getRowByPosition(cellPosition);
        if (!rowCtrl) {
            return null;
        }
        return rowCtrl.getCellCtrl(cellPosition.column);
    };
    NavigationService.prototype.lookupRowNodeForCell = function (cell) {
        if (cell.rowPinned === 'top') {
            return this.pinnedRowModel.getPinnedTopRow(cell.rowIndex);
        }
        if (cell.rowPinned === 'bottom') {
            return this.pinnedRowModel.getPinnedBottomRow(cell.rowIndex);
        }
        return this.paginationProxy.getRow(cell.rowIndex);
    };
    // we use index for rows, but column object for columns, as the next column (by index) might not
    // be visible (header grouping) so it's not reliable, so using the column object instead.
    NavigationService.prototype.navigateToNextCell = function (event, key, currentCell, allowUserOverride) {
        // we keep searching for a next cell until we find one. this is how the group rows get skipped
        var nextCell = currentCell;
        var hitEdgeOfGrid = false;
        while (nextCell && (nextCell === currentCell || !this.isValidNavigateCell(nextCell))) {
            // if the current cell is spanning across multiple columns, we need to move
            // our current position to be the last cell on the right before finding the
            // the next target.
            if (this.gridOptionsService.is('enableRtl')) {
                if (key === keyCode_1.KeyCode.LEFT) {
                    nextCell = this.getLastCellOfColSpan(nextCell);
                }
            }
            else if (key === keyCode_1.KeyCode.RIGHT) {
                nextCell = this.getLastCellOfColSpan(nextCell);
            }
            nextCell = this.cellNavigationService.getNextCellToFocus(key, nextCell);
            // eg if going down, and nextCell=undefined, means we are gone past the last row
            hitEdgeOfGrid = generic_1.missing(nextCell);
        }
        if (hitEdgeOfGrid && event && event.key === keyCode_1.KeyCode.UP) {
            nextCell = {
                rowIndex: -1,
                rowPinned: null,
                column: currentCell.column
            };
        }
        // allow user to override what cell to go to next. when doing normal cell navigation (with keys)
        // we allow this, however if processing 'enter after edit' we don't allow override
        if (allowUserOverride) {
            var userFunc = this.gridOptionsService.getCallback('navigateToNextCell');
            if (generic_1.exists(userFunc)) {
                var params = {
                    key: key,
                    previousCellPosition: currentCell,
                    nextCellPosition: nextCell ? nextCell : null,
                    event: event
                };
                var userCell = userFunc(params);
                if (generic_1.exists(userCell)) {
                    if (userCell.floating) {
                        function_1.doOnce(function () { console.warn("AG Grid: tabToNextCellFunc return type should have attributes: rowIndex, rowPinned, column. However you had 'floating', maybe you meant 'rowPinned'?"); }, 'no floating in userCell');
                        userCell.rowPinned = userCell.floating;
                    }
                    nextCell = {
                        rowPinned: userCell.rowPinned,
                        rowIndex: userCell.rowIndex,
                        column: userCell.column
                    };
                }
                else {
                    nextCell = null;
                }
            }
        }
        // no next cell means we have reached a grid boundary, eg left, right, top or bottom of grid
        if (!nextCell) {
            return;
        }
        if (nextCell.rowIndex < 0) {
            var headerLen = this.headerNavigationService.getHeaderRowCount();
            this.focusService.focusHeaderPosition({
                headerPosition: { headerRowIndex: headerLen + (nextCell.rowIndex), column: currentCell.column },
                event: event || undefined
            });
            return;
        }
        // in case we have col spanning we get the cellComp and use it to get the
        // position. This was we always focus the first cell inside the spanning.
        var normalisedPosition = this.getNormalisedPosition(nextCell);
        if (normalisedPosition) {
            this.focusPosition(normalisedPosition);
        }
        else {
            this.tryToFocusFullWidthRow(nextCell);
        }
    };
    NavigationService.prototype.getNormalisedPosition = function (cellPosition) {
        // ensureCellVisible first, to make sure cell at position is rendered.
        this.ensureCellVisible(cellPosition);
        var cellCtrl = this.getCellByPosition(cellPosition);
        // not guaranteed to have a cellComp when using the SSRM as blocks are loading.
        if (!cellCtrl) {
            return null;
        }
        cellPosition = cellCtrl.getCellPosition();
        // we call this again, as nextCell can be different to it's previous value due to Column Spanning
        // (ie if cursor moving from right to left, and cell is spanning columns, then nextCell was the
        // last column in the group, however now it's the first column in the group). if we didn't do
        // ensureCellVisible again, then we could only be showing the last portion (last column) of the
        // merged cells.
        this.ensureCellVisible(cellPosition);
        return cellPosition;
    };
    NavigationService.prototype.tryToFocusFullWidthRow = function (position, backwards) {
        if (backwards === void 0) { backwards = false; }
        var displayedColumns = this.columnModel.getAllDisplayedColumns();
        var rowComp = this.rowRenderer.getRowByPosition(position);
        if (!rowComp || !rowComp.isFullWidth()) {
            return false;
        }
        var currentCellFocused = this.focusService.getFocusedCell();
        var cellPosition = {
            rowIndex: position.rowIndex,
            rowPinned: position.rowPinned,
            column: position.column || (backwards ? array_1.last(displayedColumns) : displayedColumns[0])
        };
        this.focusPosition(cellPosition);
        var fromBelow = currentCellFocused != null ? this.rowPositionUtils.before(cellPosition, currentCellFocused) : false;
        var focusEvent = {
            type: eventKeys_1.Events.EVENT_FULL_WIDTH_ROW_FOCUSED,
            rowIndex: cellPosition.rowIndex,
            rowPinned: cellPosition.rowPinned,
            column: cellPosition.column,
            isFullWidthCell: true,
            floating: cellPosition.rowPinned,
            fromBelow: fromBelow
        };
        this.eventService.dispatchEvent(focusEvent);
        return true;
    };
    NavigationService.prototype.focusPosition = function (cellPosition) {
        this.focusService.setFocusedCell({
            rowIndex: cellPosition.rowIndex,
            column: cellPosition.column,
            rowPinned: cellPosition.rowPinned,
            forceBrowserFocus: true
        });
        if (this.rangeService) {
            this.rangeService.setRangeToCell(cellPosition);
        }
    };
    NavigationService.prototype.isValidNavigateCell = function (cell) {
        var rowNode = this.rowPositionUtils.getRowNode(cell);
        // we do not allow focusing on detail rows and full width rows
        return !!rowNode;
    };
    NavigationService.prototype.getLastCellOfColSpan = function (cell) {
        var cellCtrl = this.getCellByPosition(cell);
        if (!cellCtrl) {
            return cell;
        }
        var colSpanningList = cellCtrl.getColSpanningList();
        if (colSpanningList.length === 1) {
            return cell;
        }
        return {
            rowIndex: cell.rowIndex,
            column: array_1.last(colSpanningList),
            rowPinned: cell.rowPinned
        };
    };
    NavigationService.prototype.ensureCellVisible = function (gridCell) {
        var isGroupStickyEnabled = this.gridOptionsService.is('groupRowsSticky');
        var rowNode = this.rowModel.getRow(gridCell.rowIndex);
        // sticky rows are always visible, so the grid shouldn't scroll to focus them.
        var skipScrollToRow = isGroupStickyEnabled && (rowNode === null || rowNode === void 0 ? void 0 : rowNode.sticky);
        // this scrolls the row into view
        if (!skipScrollToRow && generic_1.missing(gridCell.rowPinned)) {
            this.gridBodyCon.getScrollFeature().ensureIndexVisible(gridCell.rowIndex);
        }
        if (!gridCell.column.isPinned()) {
            this.gridBodyCon.getScrollFeature().ensureColumnVisible(gridCell.column);
        }
    };
    __decorate([
        context_1.Autowired('mouseEventService')
    ], NavigationService.prototype, "mouseEventService", void 0);
    __decorate([
        context_1.Autowired('paginationProxy')
    ], NavigationService.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('focusService')
    ], NavigationService.prototype, "focusService", void 0);
    __decorate([
        context_1.Optional('rangeService')
    ], NavigationService.prototype, "rangeService", void 0);
    __decorate([
        context_1.Autowired('columnModel')
    ], NavigationService.prototype, "columnModel", void 0);
    __decorate([
        context_1.Autowired('rowModel')
    ], NavigationService.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('ctrlsService')
    ], NavigationService.prototype, "ctrlsService", void 0);
    __decorate([
        context_1.Autowired('rowRenderer')
    ], NavigationService.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('headerNavigationService')
    ], NavigationService.prototype, "headerNavigationService", void 0);
    __decorate([
        context_1.Autowired("rowPositionUtils")
    ], NavigationService.prototype, "rowPositionUtils", void 0);
    __decorate([
        context_1.Autowired("cellNavigationService")
    ], NavigationService.prototype, "cellNavigationService", void 0);
    __decorate([
        context_1.Autowired("pinnedRowModel")
    ], NavigationService.prototype, "pinnedRowModel", void 0);
    __decorate([
        context_1.PostConstruct
    ], NavigationService.prototype, "postConstruct", null);
    NavigationService = __decorate([
        context_1.Bean('navigationService')
    ], NavigationService);
    return NavigationService;
}(beanStub_1.BeanStub));
exports.NavigationService = NavigationService;
