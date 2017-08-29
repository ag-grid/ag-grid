/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v12.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var gridPanel_1 = require("../gridPanel/gridPanel");
var expressionService_1 = require("../valueService/expressionService");
var templateService_1 = require("../templateService");
var valueService_1 = require("../valueService/valueService");
var eventService_1 = require("../eventService");
var rowComp_1 = require("./rowComp");
var events_1 = require("../events");
var constants_1 = require("../constants");
var cellComp_1 = require("./cellComp");
var context_1 = require("../context/context");
var gridCore_1 = require("../gridCore");
var columnController_1 = require("../columnController/columnController");
var logger_1 = require("../logger");
var focusedCellController_1 = require("../focusedCellController");
var cellNavigationService_1 = require("../cellNavigationService");
var gridCell_1 = require("../entities/gridCell");
var beanStub_1 = require("../context/beanStub");
var paginationProxy_1 = require("../rowModels/paginationProxy");
var pinnedRowModel_1 = require("../rowModels/pinnedRowModel");
var RowRenderer = (function (_super) {
    __extends(RowRenderer, _super);
    function RowRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // map of row ids to row objects. keeps track of which elements
        // are rendered for which rows in the dom.
        _this.rowCompsByIndex = {};
        _this.floatingTopRowComps = [];
        _this.floatingBottomRowComps = [];
        // we only allow one refresh at a time, otherwise the internal memory structure here
        // will get messed up. this can happen if the user has a cellRenderer, and inside the
        // renderer they call an API method that results in another pass of the refresh,
        // then it will be trying to draw rows in the middle of a refresh.
        _this.refreshInProgress = false;
        return _this;
    }
    RowRenderer.prototype.agWire = function (loggerFactory) {
        this.logger = loggerFactory.create('RowRenderer');
    };
    RowRenderer.prototype.init = function () {
        this.forPrint = this.gridOptionsWrapper.isForPrint();
        this.autoHeight = this.gridOptionsWrapper.isAutoHeight();
        this.rowContainers = this.gridPanel.getRowContainers();
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_PAGINATION_CHANGED, this.onPageLoaded.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.redrawAfterModelUpdate();
    };
    RowRenderer.prototype.onPageLoaded = function (refreshEvent) {
        if (refreshEvent === void 0) { refreshEvent = { animate: false, keepRenderedRows: false, newData: false, newPage: false }; }
        this.onModelUpdated(refreshEvent);
    };
    RowRenderer.prototype.getAllCellsForColumn = function (column) {
        var eCells = [];
        utils_1.Utils.iterateObject(this.rowCompsByIndex, callback);
        utils_1.Utils.iterateObject(this.floatingBottomRowComps, callback);
        utils_1.Utils.iterateObject(this.floatingTopRowComps, callback);
        function callback(key, renderedRow) {
            var eCell = renderedRow.getCellForCol(column);
            if (eCell) {
                eCells.push(eCell);
            }
        }
        return eCells;
    };
    RowRenderer.prototype.refreshFloatingRowComps = function () {
        this.refreshFloatingRows(this.floatingTopRowComps, this.pinnedRowModel.getPinnedTopRowData(), this.rowContainers.floatingTopPinnedLeft, this.rowContainers.floatingTopPinnedRight, this.rowContainers.floatingTop, this.rowContainers.floatingTopFullWidth);
        this.refreshFloatingRows(this.floatingBottomRowComps, this.pinnedRowModel.getPinnedBottomRowData(), this.rowContainers.floatingBottomPinnedLeft, this.rowContainers.floatingBottomPinnedRight, this.rowContainers.floatingBottom, this.rowContainers.floatingBottomFullWith);
    };
    RowRenderer.prototype.refreshFloatingRows = function (renderedRows, rowNodes, pinnedLeftContainerComp, pinnedRightContainerComp, bodyContainerComp, fullWidthContainerComp) {
        var _this = this;
        renderedRows.forEach(function (row) {
            row.destroy();
        });
        renderedRows.length = 0;
        // if no cols, don't draw row - can we get rid of this???
        var columns = this.columnController.getAllDisplayedColumns();
        if (utils_1.Utils.missingOrEmpty(columns)) {
            return;
        }
        if (rowNodes) {
            rowNodes.forEach(function (node) {
                var renderedRow = new rowComp_1.RowComp(_this.$scope, _this, bodyContainerComp, fullWidthContainerComp, pinnedLeftContainerComp, pinnedRightContainerComp, node, false, null);
                _this.context.wireBean(renderedRow);
                renderedRows.push(renderedRow);
            });
        }
    };
    RowRenderer.prototype.onPinnedRowDataChanged = function () {
        this.redrawAfterModelUpdate();
    };
    RowRenderer.prototype.onModelUpdated = function (refreshEvent) {
        var params = {
            recycleRows: refreshEvent.keepRenderedRows,
            animate: refreshEvent.animate,
            newData: refreshEvent.newData,
            newPage: refreshEvent.newPage
        };
        this.redrawAfterModelUpdate(params);
        // this.eventService.dispatchEvent(Events.DEPRECATED_EVENT_PAGINATION_PAGE_LOADED);
    };
    // if the row nodes are not rendered, no index is returned
    RowRenderer.prototype.getRenderedIndexesForRowNodes = function (rowNodes) {
        var result = [];
        if (utils_1.Utils.missing(rowNodes)) {
            return result;
        }
        utils_1.Utils.iterateObject(this.rowCompsByIndex, function (index, renderedRow) {
            var rowNode = renderedRow.getRowNode();
            if (rowNodes.indexOf(rowNode) >= 0) {
                result.push(index);
            }
        });
        return result;
    };
    RowRenderer.prototype.redrawRows = function (rowNodes) {
        if (!rowNodes || rowNodes.length == 0) {
            return;
        }
        // we only need to be worried about rendered rows, as this method is
        // called to whats rendered. if the row isn't rendered, we don't care
        var indexesToRemove = this.getRenderedIndexesForRowNodes(rowNodes);
        // remove the rows
        this.removeRowComps(indexesToRemove);
        // add draw them again
        this.redrawAfterModelUpdate({
            recycleRows: true
        });
    };
    RowRenderer.prototype.getCellToRestoreFocusToAfterRefresh = function (params) {
        var focusedCell = params.suppressKeepFocus ? null : this.focusedCellController.getFocusCellToUseAfterRefresh();
        if (utils_1.Utils.missing(focusedCell)) {
            return null;
        }
        // if the dom is not actually focused on a cell, then we don't try to refocus. the problem this
        // solves is with editing - if the user is editing, eg focus is on a text field, and not on the
        // cell itself, then the cell can be registered as having focus, however it's the text field that
        // has the focus and not the cell div. therefore, when the refresh is finished, the grid will focus
        // the cell, and not the textfield. that means if the user is in a text field, and the grid refreshes,
        // the focus is lost from the text field. we do not want this.
        var activeElement = document.activeElement;
        var domData = this.gridOptionsWrapper.getDomData(activeElement, cellComp_1.CellComp.DOM_DATA_KEY_CELL_COMP);
        var elementIsNotACellDev = utils_1.Utils.missing(domData);
        if (elementIsNotACellDev) {
            return null;
        }
        return focusedCell;
    };
    // gets called after changes to the model.
    RowRenderer.prototype.redrawAfterModelUpdate = function (params) {
        if (params === void 0) { params = {}; }
        this.logger.log('refreshView');
        this.getLockOnRefresh();
        var focusedCell = this.getCellToRestoreFocusToAfterRefresh(params);
        if (!this.forPrint) {
            this.sizeContainerToPageHeight();
        }
        this.scrollToTopIfNewData(params);
        // never keep rendered rows if doing forPrint or autoHeight, as we do not use 'top' to
        // position the rows (it uses normal flow), so we have to remove
        // all rows and insert them again from scratch
        var rowsUsingFlow = this.forPrint || this.autoHeight;
        var recycleRows = rowsUsingFlow ? false : params.recycleRows;
        var animate = rowsUsingFlow ? false : params.animate;
        var rowsToRecycle = this.binRowComps(recycleRows);
        this.redraw(rowsToRecycle, animate);
        if (!params.onlyBody) {
            this.refreshFloatingRowComps();
        }
        this.restoreFocusedCell(focusedCell);
        this.releaseLockOnRefresh();
    };
    RowRenderer.prototype.scrollToTopIfNewData = function (params) {
        var scrollToTop = params.newData || params.newPage;
        var suppressScrollToTop = this.gridOptionsWrapper.isSuppressScrollOnNewData();
        if (scrollToTop && !suppressScrollToTop) {
            this.gridPanel.scrollToTop();
        }
    };
    RowRenderer.prototype.sizeContainerToPageHeight = function () {
        var containerHeight = this.paginationProxy.getCurrentPageHeight();
        // we need at least 1 pixel for the horizontal scroll to work. so if there are now rows,
        // we still want the scroll to be present, otherwise there would be no way to access the columns
        // on the RHS - and if that was where the filter was that cause no rows to be presented, there
        // is no way to remove the filter.
        if (containerHeight === 0) {
            containerHeight = 1;
        }
        this.rowContainers.body.setHeight(containerHeight);
        this.rowContainers.fullWidth.setHeight(containerHeight);
        this.rowContainers.pinnedLeft.setHeight(containerHeight);
        this.rowContainers.pinnedRight.setHeight(containerHeight);
    };
    RowRenderer.prototype.getLockOnRefresh = function () {
        if (this.refreshInProgress) {
            throw 'ag-Grid: cannot get grid to draw rows when it is in the middle of drawing rows. ' +
                'Your code probably called a grid API method while the grid was in the render stage. To overcome ' +
                'this, put the API call into a timeout, eg instead of api.refreshView(), ' +
                'call setTimeout(function(){api.refreshView(),0}). To see what part of your code ' +
                'that caused the refresh check this stacktrace.';
        }
        this.refreshInProgress = true;
    };
    RowRenderer.prototype.releaseLockOnRefresh = function () {
        this.refreshInProgress = false;
    };
    // sets the focus to the provided cell, if the cell is provided. this way, the user can call refresh without
    // worry about the focus been lost. this is important when the user is using keyboard navigation to do edits
    // and the cellEditor is calling 'refresh' to get other cells to update (as other cells might depend on the
    // edited cell).
    RowRenderer.prototype.restoreFocusedCell = function (gridCell) {
        if (gridCell) {
            this.focusedCellController.setFocusedCell(gridCell.rowIndex, gridCell.column, gridCell.floating, true);
        }
    };
    RowRenderer.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        this.forEachRowComp(function (key, renderedRow) {
            renderedRow.stopEditing(cancel);
        });
    };
    RowRenderer.prototype.forEachCellComp = function (callback) {
        utils_1.Utils.iterateObject(this.rowCompsByIndex, function (index, renderedRow) {
            renderedRow.forEachCellComp(callback);
        });
    };
    RowRenderer.prototype.forEachRowComp = function (callback) {
        utils_1.Utils.iterateObject(this.rowCompsByIndex, callback);
        utils_1.Utils.iterateObject(this.floatingTopRowComps, callback);
        utils_1.Utils.iterateObject(this.floatingBottomRowComps, callback);
    };
    RowRenderer.prototype.addRenderedRowListener = function (eventName, rowIndex, callback) {
        var renderedRow = this.rowCompsByIndex[rowIndex];
        renderedRow.addEventListener(eventName, callback);
    };
    RowRenderer.prototype.refreshCells = function (params) {
        var _this = this;
        if (params === void 0) { params = {}; }
        var rowIdsMap;
        if (utils_1.Utils.exists(params.rowNodes)) {
            rowIdsMap = {
                top: {},
                bottom: {},
                normal: {}
            };
            params.rowNodes.forEach(function (rowNode) {
                if (rowNode.rowPinned === constants_1.Constants.PINNED_TOP) {
                    rowIdsMap.top[rowNode.id] = true;
                }
                else if (rowNode.rowPinned === constants_1.Constants.PINNED_BOTTOM) {
                    rowIdsMap.bottom[rowNode.id] = true;
                }
                else {
                    rowIdsMap.normal[rowNode.id] = true;
                }
            });
        }
        var colIdsMap;
        if (utils_1.Utils.exists(params.columns)) {
            colIdsMap = {};
            params.columns.forEach(function (colKey) {
                var column = _this.columnController.getGridColumn(colKey);
                colIdsMap[column.getId()] = true;
            });
        }
        var processRow = function (rowComp) {
            var rowNode = rowComp.getRowNode();
            var id = rowNode.id;
            var floating = rowNode.rowPinned;
            // skip this row if it is missing from the provided list
            if (utils_1.Utils.exists(rowIdsMap)) {
                if (floating === constants_1.Constants.PINNED_BOTTOM) {
                    if (!rowIdsMap.bottom[id]) {
                        return;
                    }
                }
                else if (floating === constants_1.Constants.PINNED_TOP) {
                    if (!rowIdsMap.top[id]) {
                        return;
                    }
                }
                else {
                    if (!rowIdsMap.normal[id]) {
                        return;
                    }
                }
            }
            rowComp.forEachCellComp(function (cellComp) {
                var colId = cellComp.getColumn().getId();
                var excludeColFromRefresh = colIdsMap && !colIdsMap[colId];
                if (excludeColFromRefresh) {
                    return;
                }
                cellComp.refreshCell({
                    forceRefresh: params.force,
                    volatile: params.volatile,
                    newData: false
                });
            });
        };
        utils_1.Utils.iterateObject(this.rowCompsByIndex, function (index, rowComp) {
            processRow(rowComp);
        });
        if (this.floatingTopRowComps) {
            this.floatingTopRowComps.forEach(processRow);
        }
        if (this.floatingBottomRowComps) {
            this.floatingBottomRowComps.forEach(processRow);
        }
    };
    RowRenderer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        var rowIndexesToRemove = Object.keys(this.rowCompsByIndex);
        this.removeRowComps(rowIndexesToRemove);
    };
    RowRenderer.prototype.binRowComps = function (recycleRows) {
        var _this = this;
        var indexesToRemove;
        var rowsToRecycle = {};
        if (recycleRows) {
            indexesToRemove = [];
            utils_1.Utils.iterateObject(this.rowCompsByIndex, function (index, rowComp) {
                var rowNode = rowComp.getRowNode();
                if (utils_1.Utils.exists(rowNode.id)) {
                    rowsToRecycle[rowNode.id] = rowComp;
                    delete _this.rowCompsByIndex[index];
                }
                else {
                    indexesToRemove.push(index);
                }
            });
        }
        else {
            indexesToRemove = Object.keys(this.rowCompsByIndex);
        }
        this.removeRowComps(indexesToRemove);
        return rowsToRecycle;
    };
    // takes array of row indexes
    RowRenderer.prototype.removeRowComps = function (rowsToRemove) {
        var _this = this;
        // if no fromIndex then set to -1, which will refresh everything
        // let realFromIndex = -1;
        rowsToRemove.forEach(function (indexToRemove) {
            var renderedRow = _this.rowCompsByIndex[indexToRemove];
            renderedRow.destroy();
            delete _this.rowCompsByIndex[indexToRemove];
        });
    };
    // gets called when rows don't change, but viewport does, so after:
    // 1) size of grid changed
    // 2) grid scrolled to new position
    // 3) ensure index visible (which is a scroll)
    RowRenderer.prototype.redrawAfterScroll = function () {
        this.getLockOnRefresh();
        this.redraw();
        this.releaseLockOnRefresh();
    };
    RowRenderer.prototype.removeRowCompsNotToDraw = function (indexesToDraw) {
        // for speedy lookup, dump into map
        var indexesToDrawMap = {};
        indexesToDraw.forEach(function (index) { return indexesToDrawMap[index] = true; });
        var existingIndexes = Object.keys(this.rowCompsByIndex);
        var indexesNotToDraw = utils_1.Utils.filter(existingIndexes, function (index) { return !indexesToDrawMap[index]; });
        this.removeRowComps(indexesNotToDraw);
    };
    RowRenderer.prototype.calculateIndexesToDraw = function () {
        var _this = this;
        // all in all indexes in the viewport
        var indexesToDraw = utils_1.Utils.createArrayOfNumbers(this.firstRenderedRow, this.lastRenderedRow);
        // add in indexes of rows we want to keep, because they are currently editing
        utils_1.Utils.iterateObject(this.rowCompsByIndex, function (indexStr, rowComp) {
            var index = Number(indexStr);
            if (index < _this.firstRenderedRow || index > _this.lastRenderedRow) {
                if (_this.keepRowBecauseEditing(rowComp)) {
                    indexesToDraw.push(index);
                }
            }
        });
        indexesToDraw.sort(function (a, b) { return a - b; });
        return indexesToDraw;
    };
    RowRenderer.prototype.redraw = function (rowsToRecycle, animate) {
        var _this = this;
        if (animate === void 0) { animate = false; }
        this.workOutFirstAndLastRowsToRender();
        // the row can already exist and be in the following:
        // rowsToRecycle -> if model change, then the index may be different, however row may
        //                         exist here from previous time (mapped by id).
        // this.rowCompsByIndex -> if just a scroll, then this will contain what is currently in the viewport
        // this is all the indexes we want, including those that already exist, so this method
        // will end up going through each index and drawing only if the row doesn't already exist
        var indexesToDraw = this.calculateIndexesToDraw();
        this.removeRowCompsNotToDraw(indexesToDraw);
        // we always ensure dom order for inserts, as this doesn't impact our animation. however our animation
        // gets messed up when we rearrange the rows (for updates). so we only maintain order for updates
        // when the user explicitly asks for it.
        var ensureDomOrderForInsert = !this.forPrint;
        var ensureDomOrderForUpdate = this.gridOptionsWrapper.isEnsureDomOrder() && !this.forPrint;
        var ensureDomOrder = ensureDomOrderForInsert || ensureDomOrderForUpdate;
        // this keeps track of the last inserted element in each container, so when rows are getting
        // inserted or repositioned, they can be done relative to the previous DOM element
        var previousElements = ensureDomOrder ? { eBody: null, eLeft: null, eRight: null, eFullWidth: null } : null;
        // add in new rows
        var nextVmTurnFunctions = [];
        indexesToDraw.forEach(function (rowIndex) {
            var rowComp = _this.createOrUpdateRowComp(rowIndex, rowsToRecycle, animate, previousElements, ensureDomOrderForUpdate);
            if (utils_1.Utils.exists(rowComp)) {
                utils_1.Utils.pushAll(nextVmTurnFunctions, rowComp.getAndClearNextVMTurnFunctions());
            }
        });
        utils_1.Utils.executeNextVMTurn(nextVmTurnFunctions);
        this.destroyRowComps(rowsToRecycle, animate);
        this.checkAngularCompile();
    };
    RowRenderer.prototype.createOrUpdateRowComp = function (rowIndex, rowsToRecycle, animate, previousElements, ensureDomOrderForUpdate) {
        var rowNode;
        var rowComp = this.rowCompsByIndex[rowIndex];
        // if no row comp, see if we can get it from the previous rowComps
        if (!rowComp) {
            rowNode = this.paginationProxy.getRow(rowIndex);
            if (utils_1.Utils.exists(rowNode) && utils_1.Utils.exists(rowsToRecycle) && rowsToRecycle[rowNode.id]) {
                rowComp = rowsToRecycle[rowNode.id];
                rowsToRecycle[rowNode.id] = null;
            }
        }
        var creatingNewRowComp = !rowComp;
        if (creatingNewRowComp) {
            // create a new one
            if (!rowNode) {
                rowNode = this.paginationProxy.getRow(rowIndex);
            }
            if (utils_1.Utils.exists(rowNode)) {
                rowComp = this.createRowComp(rowNode, animate, previousElements);
            }
            else {
                // this should never happen - if somehow we are trying to create
                // a row for a rowNode that does not exist.
                return;
            }
        }
        else {
            // ensure row comp is in right position in DOM
            if (ensureDomOrderForUpdate) {
                rowComp.ensureInDomAfter(previousElements);
            }
        }
        this.updatePreviousElements(previousElements, rowComp);
        this.rowCompsByIndex[rowIndex] = rowComp;
        return rowComp;
    };
    RowRenderer.prototype.destroyRowComps = function (rowCompsMap, animate) {
        var delayedFuncs = [];
        utils_1.Utils.iterateObject(rowCompsMap, function (nodeId, rowComp) {
            // if row was used, then it's null
            if (!rowComp) {
                return;
            }
            rowComp.destroy(animate);
            utils_1.Utils.pushAll(delayedFuncs, rowComp.getAndClearDelayedDestroyFunctions());
        });
        utils_1.Utils.executeInAWhile(delayedFuncs);
    };
    RowRenderer.prototype.checkAngularCompile = function () {
        var _this = this;
        // if we are doing angular compiling, then do digest the scope here
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            // we do it in a timeout, in case we are already in an apply
            setTimeout(function () { _this.$scope.$apply(); }, 0);
        }
    };
    RowRenderer.prototype.workOutFirstAndLastRowsToRender = function () {
        var newFirst;
        var newLast;
        if (!this.paginationProxy.isRowsToRender()) {
            newFirst = 0;
            newLast = -1; // setting to -1 means nothing in range
        }
        else {
            var pageFirstRow = this.paginationProxy.getPageFirstRow();
            var pageLastRow = this.paginationProxy.getPageLastRow();
            if (this.forPrint) {
                newFirst = pageFirstRow;
                newLast = pageLastRow;
            }
            else {
                var pixelOffset = this.paginationProxy ? this.paginationProxy.getPixelOffset() : 0;
                var bodyVRange = this.gridPanel.getVerticalPixelRange();
                var topPixel = bodyVRange.top;
                var bottomPixel = bodyVRange.bottom;
                var first = this.paginationProxy.getRowIndexAtPixel(topPixel + pixelOffset);
                var last = this.paginationProxy.getRowIndexAtPixel(bottomPixel + pixelOffset);
                //add in buffer
                var buffer = this.gridOptionsWrapper.getRowBuffer();
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
        var firstDiffers = newFirst !== this.firstRenderedRow;
        var lastDiffers = newLast !== this.lastRenderedRow;
        if (firstDiffers || lastDiffers) {
            this.firstRenderedRow = newFirst;
            this.lastRenderedRow = newLast;
            var event_1 = { firstRow: newFirst, lastRow: newLast };
            this.eventService.dispatchEvent(events_1.Events.EVENT_VIEWPORT_CHANGED, event_1);
        }
    };
    RowRenderer.prototype.getFirstVirtualRenderedRow = function () {
        return this.firstRenderedRow;
    };
    RowRenderer.prototype.getLastVirtualRenderedRow = function () {
        return this.lastRenderedRow;
    };
    RowRenderer.prototype.updatePreviousElements = function (previousElements, rowComp) {
        if (utils_1.Utils.missing(previousElements)) {
            return;
        }
        var body = rowComp.getBodyRowElement();
        var left = rowComp.getPinnedLeftRowElement();
        var right = rowComp.getPinnedRightRowElement();
        var fullWidth = rowComp.getFullWidthRowElement();
        if (body) {
            previousElements.eBody = body;
        }
        if (left) {
            previousElements.eLeft = left;
        }
        if (right) {
            previousElements.eRight = right;
        }
        if (fullWidth) {
            previousElements.eFullWidth = fullWidth;
        }
    };
    // check that none of the rows to remove are editing or focused as:
    // a) if editing, we want to keep them, otherwise the user will loose the context of the edit,
    //    eg user starts editing, enters some text, then scrolls down and then up, next time row rendered
    //    the edit is reset - so we want to keep it rendered.
    // b) if focused, we want ot keep keyboard focus, so if user ctrl+c, it goes to clipboard,
    //    otherwise the user can range select and drag (with focus cell going out of the viewport)
    //    and then ctrl+c, nothing will happen if cell is removed from dom.
    RowRenderer.prototype.keepRowBecauseEditing = function (rowComp) {
        var REMOVE_ROW = false;
        var KEEP_ROW = true;
        var rowNode = rowComp.getRowNode();
        var rowHasFocus = this.focusedCellController.isRowNodeFocused(rowNode);
        var rowIsEditing = rowComp.isEditing();
        var mightWantToKeepRow = rowHasFocus || rowIsEditing;
        // if we deffo don't want to keep it,
        if (!mightWantToKeepRow) {
            return REMOVE_ROW;
        }
        // editing row, only remove if it is no longer rendered, eg filtered out or new data set.
        // the reason we want to keep is if user is scrolling up and down, we don't want to loose
        // the context of the editing in process.
        var rowNodePresent = this.paginationProxy.isRowPresent(rowNode);
        return rowNodePresent ? KEEP_ROW : REMOVE_ROW;
    };
    RowRenderer.prototype.createRowComp = function (rowNode, animate, previousElements) {
        var rowComp = new rowComp_1.RowComp(this.$scope, this, this.rowContainers.body, this.rowContainers.fullWidth, this.rowContainers.pinnedLeft, this.rowContainers.pinnedRight, rowNode, animate, previousElements);
        this.context.wireBean(rowComp);
        return rowComp;
    };
    RowRenderer.prototype.getRenderedNodes = function () {
        var renderedRows = this.rowCompsByIndex;
        return Object.keys(renderedRows).map(function (key) {
            return renderedRows[key].getRowNode();
        });
    };
    // we use index for rows, but column object for columns, as the next column (by index) might not
    // be visible (header grouping) so it's not reliable, so using the column object instead.
    RowRenderer.prototype.navigateToNextCell = function (event, key, rowIndex, column, floating) {
        var previousCell = new gridCell_1.GridCell({ rowIndex: rowIndex, floating: floating, column: column });
        var nextCell = previousCell;
        // we keep searching for a next cell until we find one. this is how the group rows get skipped
        while (true) {
            nextCell = this.cellNavigationService.getNextCellToFocus(key, nextCell);
            if (utils_1.Utils.missing(nextCell)) {
                break;
            }
            var skipGroupRows = this.gridOptionsWrapper.isGroupUseEntireRow();
            if (skipGroupRows) {
                var rowNode = this.paginationProxy.getRow(nextCell.rowIndex);
                if (!rowNode.group) {
                    break;
                }
            }
            else {
                break;
            }
        }
        // allow user to override what cell to go to next
        var userFunc = this.gridOptionsWrapper.getNavigateToNextCellFunc();
        if (utils_1.Utils.exists(userFunc)) {
            var params = {
                key: key,
                previousCellDef: previousCell,
                nextCellDef: nextCell ? nextCell.getGridCellDef() : null,
                event: event
            };
            var nextCellDef = userFunc(params);
            if (utils_1.Utils.exists(nextCellDef)) {
                nextCell = new gridCell_1.GridCell(nextCellDef);
            }
            else {
                nextCell = null;
            }
        }
        // no next cell means we have reached a grid boundary, eg left, right, top or bottom of grid
        if (!nextCell) {
            return;
        }
        // this scrolls the row into view
        if (utils_1.Utils.missing(nextCell.floating)) {
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
            var gridCell = new gridCell_1.GridCell({ rowIndex: nextCell.rowIndex, floating: nextCell.floating, column: nextCell.column });
            this.rangeController.setRangeToCell(gridCell);
        }
    };
    RowRenderer.prototype.startEditingCell = function (gridCell, keyPress, charPress) {
        var cell = this.getComponentForCell(gridCell);
        if (cell) {
            cell.startRowOrCellEdit(keyPress, charPress);
        }
    };
    RowRenderer.prototype.getComponentForCell = function (gridCell) {
        var rowComponent;
        switch (gridCell.floating) {
            case constants_1.Constants.PINNED_TOP:
                rowComponent = this.floatingTopRowComps[gridCell.rowIndex];
                break;
            case constants_1.Constants.PINNED_BOTTOM:
                rowComponent = this.floatingBottomRowComps[gridCell.rowIndex];
                break;
            default:
                rowComponent = this.rowCompsByIndex[gridCell.rowIndex];
                break;
        }
        if (!rowComponent) {
            return null;
        }
        var cellComponent = rowComponent.getRenderedCellForColumn(gridCell.column);
        return cellComponent;
    };
    RowRenderer.prototype.onTabKeyDown = function (previousRenderedCell, keyboardEvent) {
        var backwards = keyboardEvent.shiftKey;
        var success = this.moveToCellAfter(previousRenderedCell, backwards);
        if (success) {
            keyboardEvent.preventDefault();
        }
    };
    RowRenderer.prototype.tabToNextCell = function (backwards) {
        var focusedCell = this.focusedCellController.getFocusedCell();
        // if no focus, then cannot navigate
        if (utils_1.Utils.missing(focusedCell)) {
            return false;
        }
        var renderedCell = this.getComponentForCell(focusedCell);
        // if cell is not rendered, means user has scrolled away from the cell
        if (utils_1.Utils.missing(renderedCell)) {
            return false;
        }
        var result = this.moveToCellAfter(renderedCell, backwards);
        return result;
    };
    // returns true if moving to next cell was successful
    RowRenderer.prototype.moveToCellAfter = function (previousRenderedCell, backwards) {
        var editing = previousRenderedCell.isEditing();
        var gridCell = previousRenderedCell.getGridCell();
        // find the next cell to start editing
        var nextRenderedCell = this.findNextCellToFocusOn(gridCell, backwards, editing);
        var foundCell = utils_1.Utils.exists(nextRenderedCell);
        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (foundCell) {
            if (editing) {
                if (this.gridOptionsWrapper.isFullRowEdit()) {
                    this.moveEditToNextRow(previousRenderedCell, nextRenderedCell);
                }
                else {
                    this.moveEditToNextCell(previousRenderedCell, nextRenderedCell);
                }
            }
            else {
                nextRenderedCell.focusCell(true);
            }
            return true;
        }
        else {
            return false;
        }
    };
    RowRenderer.prototype.moveEditToNextCell = function (previousRenderedCell, nextRenderedCell) {
        previousRenderedCell.stopEditing();
        nextRenderedCell.startEditingIfEnabled(null, null, true);
        nextRenderedCell.focusCell(false);
    };
    RowRenderer.prototype.moveEditToNextRow = function (previousRenderedCell, nextRenderedCell) {
        var pGridCell = previousRenderedCell.getGridCell();
        var nGridCell = nextRenderedCell.getGridCell();
        var rowsMatch = (pGridCell.rowIndex === nGridCell.rowIndex)
            && (pGridCell.floating === nGridCell.floating);
        if (rowsMatch) {
            // same row, so we don't start / stop editing, we just move the focus along
            previousRenderedCell.setFocusOutOnEditor();
            nextRenderedCell.setFocusInOnEditor();
        }
        else {
            var pRow = previousRenderedCell.getRenderedRow();
            var nRow = nextRenderedCell.getRenderedRow();
            previousRenderedCell.setFocusOutOnEditor();
            pRow.stopEditing();
            nRow.startRowEditing();
            nextRenderedCell.setFocusInOnEditor();
        }
        nextRenderedCell.focusCell();
    };
    // called by the cell, when tab is pressed while editing.
    // @return: RenderedCell when navigation successful, otherwise null
    RowRenderer.prototype.findNextCellToFocusOn = function (gridCell, backwards, startEditing) {
        var nextCell = gridCell;
        while (true) {
            nextCell = this.cellNavigationService.getNextTabbedCell(nextCell, backwards);
            // allow user to override what cell to go to next
            var userFunc = this.gridOptionsWrapper.getTabToNextCellFunc();
            if (utils_1.Utils.exists(userFunc)) {
                var params = {
                    backwards: backwards,
                    editing: startEditing,
                    previousCellDef: gridCell.getGridCellDef(),
                    nextCellDef: nextCell ? nextCell.getGridCellDef() : null
                };
                var nextCellDef = userFunc(params);
                if (utils_1.Utils.exists(nextCellDef)) {
                    nextCell = new gridCell_1.GridCell(nextCellDef);
                }
                else {
                    nextCell = null;
                }
            }
            // if no 'next cell', means we have got to last cell of grid, so nothing to move to,
            // so bottom right cell going forwards, or top left going backwards
            if (!nextCell) {
                return null;
            }
            // this scrolls the row into view
            var cellIsNotFloating = utils_1.Utils.missing(nextCell.floating);
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
            // if next cell is fullWidth row, then no rendered cell,
            // as fullWidth rows have no cells, so we skip it
            if (utils_1.Utils.missing(nextRenderedCell)) {
                continue;
            }
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
                var gridCell_2 = new gridCell_1.GridCell({ rowIndex: nextCell.rowIndex, floating: nextCell.floating, column: nextCell.column });
                this.rangeController.setRangeToCell(gridCell_2);
            }
            // we successfully tabbed onto a grid cell, so return true
            return nextRenderedCell;
        }
    };
    __decorate([
        context_1.Autowired('paginationProxy'),
        __metadata("design:type", paginationProxy_1.PaginationProxy)
    ], RowRenderer.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], RowRenderer.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], RowRenderer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('gridCore'),
        __metadata("design:type", gridCore_1.GridCore)
    ], RowRenderer.prototype, "gridCore", void 0);
    __decorate([
        context_1.Autowired('gridPanel'),
        __metadata("design:type", gridPanel_1.GridPanel)
    ], RowRenderer.prototype, "gridPanel", void 0);
    __decorate([
        context_1.Autowired('$scope'),
        __metadata("design:type", Object)
    ], RowRenderer.prototype, "$scope", void 0);
    __decorate([
        context_1.Autowired('expressionService'),
        __metadata("design:type", expressionService_1.ExpressionService)
    ], RowRenderer.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('templateService'),
        __metadata("design:type", templateService_1.TemplateService)
    ], RowRenderer.prototype, "templateService", void 0);
    __decorate([
        context_1.Autowired('valueService'),
        __metadata("design:type", valueService_1.ValueService)
    ], RowRenderer.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], RowRenderer.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('pinnedRowModel'),
        __metadata("design:type", pinnedRowModel_1.PinnedRowModel)
    ], RowRenderer.prototype, "pinnedRowModel", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], RowRenderer.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('loggerFactory'),
        __metadata("design:type", logger_1.LoggerFactory)
    ], RowRenderer.prototype, "loggerFactory", void 0);
    __decorate([
        context_1.Autowired('focusedCellController'),
        __metadata("design:type", focusedCellController_1.FocusedCellController)
    ], RowRenderer.prototype, "focusedCellController", void 0);
    __decorate([
        context_1.Optional('rangeController'),
        __metadata("design:type", Object)
    ], RowRenderer.prototype, "rangeController", void 0);
    __decorate([
        context_1.Autowired('cellNavigationService'),
        __metadata("design:type", cellNavigationService_1.CellNavigationService)
    ], RowRenderer.prototype, "cellNavigationService", void 0);
    __decorate([
        __param(0, context_1.Qualifier('loggerFactory')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [logger_1.LoggerFactory]),
        __metadata("design:returntype", void 0)
    ], RowRenderer.prototype, "agWire", null);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], RowRenderer.prototype, "init", null);
    __decorate([
        context_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], RowRenderer.prototype, "destroy", null);
    RowRenderer = __decorate([
        context_1.Bean('rowRenderer')
    ], RowRenderer);
    return RowRenderer;
}(beanStub_1.BeanStub));
exports.RowRenderer = RowRenderer;
