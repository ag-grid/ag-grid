/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { RowComp } from "./rowComp";
import { Column } from "../entities/column";
import { Events } from "../events";
import { Constants } from "../constants";
import { CellComp } from "./cellComp";
import { Autowired, Bean, Optional, Qualifier } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { _ } from "../utils";
var RowRenderer = /** @class */ (function (_super) {
    __extends(RowRenderer, _super);
    function RowRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.destroyFuncsForColumnListeners = [];
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
    RowRenderer.prototype.registerGridCore = function (gridCore) {
        this.gridCore = gridCore;
    };
    RowRenderer.prototype.getGridCore = function () {
        return this.gridCore;
    };
    RowRenderer.prototype.agWire = function (loggerFactory) {
        this.logger = loggerFactory.create("RowRenderer");
    };
    RowRenderer.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
        this.rowContainers = this.gridPanel.getRowContainers();
        this.addManagedListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onPageLoaded.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, this.redrawAfterScroll.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.redrawAfterScroll.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));
        this.registerCellEventListeners();
        this.printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        this.embedFullWidthRows = this.printLayout || this.gridOptionsWrapper.isEmbedFullWidthRows();
        this.redrawAfterModelUpdate();
    };
    // in a clean design, each cell would register for each of these events. however when scrolling, all the cells
    // registering and de-registering for events is a performance bottleneck. so we register here once and inform
    // all active cells.
    RowRenderer.prototype.registerCellEventListeners = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_CELL_FOCUSED, function (event) {
            _this.forEachCellComp(function (cellComp) { return cellComp.onCellFocused(event); });
        });
        this.addManagedListener(this.eventService, Events.EVENT_FLASH_CELLS, function (event) {
            _this.forEachCellComp(function (cellComp) { return cellComp.onFlashCells(event); });
        });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, function () {
            _this.forEachCellComp(function (cellComp) { return cellComp.onColumnHover(); });
        });
        // only for printLayout - because we are rendering all the cells in the same row, regardless of pinned state,
        // then changing the width of the containers will impact left position. eg the center cols all have their
        // left position adjusted by the width of the left pinned column, so if the pinned left column width changes,
        // all the center cols need to be shifted to accommodate this. when in normal layout, the pinned cols are
        // in different containers so doesn't impact.
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, function () {
            if (_this.printLayout) {
                _this.forEachCellComp(function (cellComp) { return cellComp.onLeftChanged(); });
            }
        });
        var rangeSelectionEnabled = this.gridOptionsWrapper.isEnableRangeSelection();
        if (rangeSelectionEnabled) {
            this.addManagedListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, function () {
                _this.forEachCellComp(function (cellComp) { return cellComp.onRangeSelectionChanged(); });
            });
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, function () {
                _this.forEachCellComp(function (cellComp) { return cellComp.updateRangeBordersIfRangeCount(); });
            });
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, function () {
                _this.forEachCellComp(function (cellComp) { return cellComp.updateRangeBordersIfRangeCount(); });
            });
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, function () {
                _this.forEachCellComp(function (cellComp) { return cellComp.updateRangeBordersIfRangeCount(); });
            });
        }
        // add listeners to the grid columns
        this.refreshListenersToColumnsForCellComps();
        // if the grid columns change, then refresh the listeners again
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.refreshListenersToColumnsForCellComps.bind(this));
        this.addDestroyFunc(this.removeGridColumnListeners.bind(this));
    };
    // executes all functions in destroyFuncsForColumnListeners and then clears the list
    RowRenderer.prototype.removeGridColumnListeners = function () {
        this.destroyFuncsForColumnListeners.forEach(function (func) { return func(); });
        this.destroyFuncsForColumnListeners.length = 0;
    };
    // this function adds listeners onto all the grid columns, which are the column that we could have cellComps for.
    // when the grid columns change, we add listeners again. in an ideal design, each CellComp would just register to
    // the column it belongs to on creation, however this was a bottleneck with the number of cells, so do it here
    // once instead.
    RowRenderer.prototype.refreshListenersToColumnsForCellComps = function () {
        var _this = this;
        this.removeGridColumnListeners();
        var cols = this.columnController.getAllGridColumns();
        if (!cols) {
            return;
        }
        cols.forEach(function (col) {
            var forEachCellWithThisCol = function (callback) {
                _this.forEachCellComp(function (cellComp) {
                    if (cellComp.getColumn() === col) {
                        callback(cellComp);
                    }
                });
            };
            var leftChangedListener = function () {
                forEachCellWithThisCol(function (cellComp) { return cellComp.onLeftChanged(); });
            };
            var widthChangedListener = function () {
                forEachCellWithThisCol(function (cellComp) { return cellComp.onWidthChanged(); });
            };
            var firstRightPinnedChangedListener = function () {
                forEachCellWithThisCol(function (cellComp) { return cellComp.onFirstRightPinnedChanged(); });
            };
            var lastLeftPinnedChangedListener = function () {
                forEachCellWithThisCol(function (cellComp) { return cellComp.onLastLeftPinnedChanged(); });
            };
            col.addEventListener(Column.EVENT_LEFT_CHANGED, leftChangedListener);
            col.addEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
            col.addEventListener(Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, firstRightPinnedChangedListener);
            col.addEventListener(Column.EVENT_LAST_LEFT_PINNED_CHANGED, lastLeftPinnedChangedListener);
            _this.destroyFuncsForColumnListeners.push(function () {
                col.removeEventListener(Column.EVENT_LEFT_CHANGED, leftChangedListener);
                col.removeEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
                col.removeEventListener(Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, firstRightPinnedChangedListener);
                col.removeEventListener(Column.EVENT_LAST_LEFT_PINNED_CHANGED, lastLeftPinnedChangedListener);
            });
        });
    };
    RowRenderer.prototype.onDomLayoutChanged = function () {
        var printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        var embedFullWidthRows = printLayout || this.gridOptionsWrapper.isEmbedFullWidthRows();
        // if moving towards or away from print layout, means we need to destroy all rows, as rows are not laid
        // out using absolute positioning when doing print layout
        var destroyRows = embedFullWidthRows !== this.embedFullWidthRows || this.printLayout !== printLayout;
        this.printLayout = printLayout;
        this.embedFullWidthRows = embedFullWidthRows;
        if (destroyRows) {
            this.redrawAfterModelUpdate();
        }
    };
    // for row models that have datasources, when we update the datasource, we need to force the rowRenderer
    // to redraw all rows. otherwise the old rows from the old datasource will stay displayed.
    RowRenderer.prototype.datasourceChanged = function () {
        this.firstRenderedRow = 0;
        this.lastRenderedRow = -1;
        var rowIndexesToRemove = Object.keys(this.rowCompsByIndex);
        this.removeRowComps(rowIndexesToRemove);
    };
    RowRenderer.prototype.onPageLoaded = function (refreshEvent) {
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
    };
    RowRenderer.prototype.getAllCellsForColumn = function (column) {
        var eCells = [];
        function callback(key, rowComp) {
            var eCell = rowComp.getCellForCol(column);
            if (eCell) {
                eCells.push(eCell);
            }
        }
        _.iterateObject(this.rowCompsByIndex, callback);
        _.iterateObject(this.floatingBottomRowComps, callback);
        _.iterateObject(this.floatingTopRowComps, callback);
        return eCells;
    };
    RowRenderer.prototype.refreshFloatingRowComps = function () {
        this.refreshFloatingRows(this.floatingTopRowComps, this.pinnedRowModel.getPinnedTopRowData(), this.rowContainers.floatingTopPinnedLeft, this.rowContainers.floatingTopPinnedRight, this.rowContainers.floatingTop, this.rowContainers.floatingTopFullWidth);
        this.refreshFloatingRows(this.floatingBottomRowComps, this.pinnedRowModel.getPinnedBottomRowData(), this.rowContainers.floatingBottomPinnedLeft, this.rowContainers.floatingBottomPinnedRight, this.rowContainers.floatingBottom, this.rowContainers.floatingBottomFullWidth);
    };
    RowRenderer.prototype.refreshFloatingRows = function (rowComps, rowNodes, pinnedLeftContainerComp, pinnedRightContainerComp, bodyContainerComp, fullWidthContainerComp) {
        var _this = this;
        rowComps.forEach(function (row) {
            row.destroy();
        });
        rowComps.length = 0;
        if (rowNodes) {
            rowNodes.forEach(function (node) {
                var rowComp = new RowComp(_this.$scope, bodyContainerComp, pinnedLeftContainerComp, pinnedRightContainerComp, fullWidthContainerComp, node, _this.beans, false, false, _this.printLayout, _this.embedFullWidthRows);
                rowComp.init();
                rowComps.push(rowComp);
            });
        }
        this.flushContainers(rowComps);
    };
    RowRenderer.prototype.onPinnedRowDataChanged = function () {
        // recycling rows in order to ensure cell editing is not cancelled
        var params = {
            recycleRows: true
        };
        this.redrawAfterModelUpdate(params);
    };
    RowRenderer.prototype.onModelUpdated = function (refreshEvent) {
        var params = {
            recycleRows: refreshEvent.keepRenderedRows,
            animate: refreshEvent.animate,
            newData: refreshEvent.newData,
            newPage: refreshEvent.newPage,
            // because this is a model updated event (not pinned rows), we
            // can skip updating the pinned rows. this is needed so that if user
            // is doing transaction updates, the pinned rows are not getting constantly
            // trashed - or editing cells in pinned rows are not refreshed and put into read mode
            onlyBody: true
        };
        this.redrawAfterModelUpdate(params);
    };
    // if the row nodes are not rendered, no index is returned
    RowRenderer.prototype.getRenderedIndexesForRowNodes = function (rowNodes) {
        var result = [];
        if (_.missing(rowNodes)) {
            return result;
        }
        _.iterateObject(this.rowCompsByIndex, function (index, renderedRow) {
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
        // called to what's rendered. if the row isn't rendered, we don't care
        var indexesToRemove = this.getRenderedIndexesForRowNodes(rowNodes);
        // remove the rows
        this.removeRowComps(indexesToRemove);
        // add draw them again
        this.redrawAfterModelUpdate({
            recycleRows: true
        });
    };
    RowRenderer.prototype.getCellToRestoreFocusToAfterRefresh = function (params) {
        var focusedCell = params.suppressKeepFocus ? null : this.focusController.getFocusCellToUseAfterRefresh();
        if (_.missing(focusedCell)) {
            return null;
        }
        // if the dom is not actually focused on a cell, then we don't try to refocus. the problem this
        // solves is with editing - if the user is editing, eg focus is on a text field, and not on the
        // cell itself, then the cell can be registered as having focus, however it's the text field that
        // has the focus and not the cell div. therefore, when the refresh is finished, the grid will focus
        // the cell, and not the textfield. that means if the user is in a text field, and the grid refreshes,
        // the focus is lost from the text field. we do not want this.
        var activeElement = document.activeElement;
        var domData = this.gridOptionsWrapper.getDomData(activeElement, CellComp.DOM_DATA_KEY_CELL_COMP);
        var elementIsNotACellDev = _.missing(domData);
        return elementIsNotACellDev ? null : focusedCell;
    };
    // gets called after changes to the model.
    RowRenderer.prototype.redrawAfterModelUpdate = function (params) {
        if (params === void 0) { params = {}; }
        this.getLockOnRefresh();
        var focusedCell = this.getCellToRestoreFocusToAfterRefresh(params);
        this.sizeContainerToPageHeight();
        this.scrollToTopIfNewData(params);
        // never recycle rows when print layout, we draw each row again from scratch. this is because print layout
        // uses normal dom layout to put cells into dom - it doesn't allow reordering rows.
        var recycleRows = !this.printLayout && params.recycleRows;
        var animate = params.animate && this.gridOptionsWrapper.isAnimateRows();
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
        var containers = [
            this.rowContainers.body,
            this.rowContainers.fullWidth,
            this.rowContainers.pinnedLeft,
            this.rowContainers.pinnedRight
        ];
        if (this.printLayout) {
            containers.forEach(function (container) { return container.setHeight(null); });
            return;
        }
        var containerHeight = this.paginationProxy.getCurrentPageHeight();
        // we need at least 1 pixel for the horizontal scroll to work. so if there are now rows,
        // we still want the scroll to be present, otherwise there would be no way to scroll the header
        // which might be needed us user wants to access columns
        // on the RHS - and if that was where the filter was that cause no rows to be presented, there
        // is no way to remove the filter.
        if (containerHeight === 0) {
            containerHeight = 1;
        }
        this.maxDivHeightScaler.setModelHeight(containerHeight);
        var realHeight = this.maxDivHeightScaler.getUiContainerHeight();
        containers.forEach(function (container) { return container.setHeight(realHeight); });
    };
    RowRenderer.prototype.getLockOnRefresh = function () {
        if (this.refreshInProgress) {
            throw new Error("ag-Grid: cannot get grid to draw rows when it is in the middle of drawing rows. " +
                "Your code probably called a grid API method while the grid was in the render stage. To overcome " +
                "this, put the API call into a timeout, eg instead of api.refreshView(), " +
                "call setTimeout(function(){api.refreshView(),0}). To see what part of your code " +
                "that caused the refresh check this stacktrace.");
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
    RowRenderer.prototype.restoreFocusedCell = function (cellPosition) {
        if (cellPosition) {
            this.focusController.setFocusedCell(cellPosition.rowIndex, cellPosition.column, cellPosition.rowPinned, true);
        }
    };
    RowRenderer.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        this.forEachRowComp(function (key, rowComp) {
            rowComp.stopEditing(cancel);
        });
    };
    RowRenderer.prototype.forEachCellComp = function (callback) {
        this.forEachRowComp(function (key, rowComp) { return rowComp.forEachCellComp(callback); });
    };
    RowRenderer.prototype.forEachRowComp = function (callback) {
        _.iterateObject(this.rowCompsByIndex, callback);
        _.iterateObject(this.floatingTopRowComps, callback);
        _.iterateObject(this.floatingBottomRowComps, callback);
    };
    RowRenderer.prototype.addRenderedRowListener = function (eventName, rowIndex, callback) {
        var rowComp = this.rowCompsByIndex[rowIndex];
        if (rowComp) {
            rowComp.addEventListener(eventName, callback);
        }
    };
    RowRenderer.prototype.flashCells = function (params) {
        if (params === void 0) { params = {}; }
        var flashDelay = params.flashDelay, fadeDelay = params.fadeDelay;
        this.forEachCellCompFiltered(params.rowNodes, params.columns, function (cellComp) { return cellComp.flashCell({ flashDelay: flashDelay, fadeDelay: fadeDelay }); });
    };
    RowRenderer.prototype.refreshCells = function (params) {
        if (params === void 0) { params = {}; }
        var refreshCellParams = {
            forceRefresh: params.force,
            newData: false,
            suppressFlash: params.suppressFlash
        };
        this.forEachCellCompFiltered(params.rowNodes, params.columns, function (cellComp) { return cellComp.refreshCell(refreshCellParams); });
    };
    RowRenderer.prototype.getCellRendererInstances = function (params) {
        var res = [];
        this.forEachCellCompFiltered(params.rowNodes, params.columns, function (cellComp) {
            var cellRenderer = cellComp.getCellRenderer();
            if (cellRenderer) {
                res.push(cellRenderer);
            }
        });
        return res;
    };
    RowRenderer.prototype.getCellEditorInstances = function (params) {
        var res = [];
        this.forEachCellCompFiltered(params.rowNodes, params.columns, function (cellComp) {
            var cellEditor = cellComp.getCellEditor();
            if (cellEditor) {
                res.push(cellEditor);
            }
        });
        return res;
    };
    RowRenderer.prototype.getEditingCells = function () {
        var res = [];
        this.forEachCellComp(function (cellComp) {
            if (cellComp.isEditing()) {
                var cellPosition = cellComp.getCellPosition();
                res.push(cellPosition);
            }
        });
        return res;
    };
    // calls the callback for each cellComp that match the provided rowNodes and columns. eg if one row node
    // and two columns provided, that identifies 4 cells, so callback gets called 4 times, once for each cell.
    RowRenderer.prototype.forEachCellCompFiltered = function (rowNodes, columns, callback) {
        var _this = this;
        var rowIdsMap;
        if (_.exists(rowNodes)) {
            rowIdsMap = {
                top: {},
                bottom: {},
                normal: {}
            };
            rowNodes.forEach(function (rowNode) {
                if (rowNode.rowPinned === Constants.PINNED_TOP) {
                    rowIdsMap.top[rowNode.id] = true;
                }
                else if (rowNode.rowPinned === Constants.PINNED_BOTTOM) {
                    rowIdsMap.bottom[rowNode.id] = true;
                }
                else {
                    rowIdsMap.normal[rowNode.id] = true;
                }
            });
        }
        var colIdsMap;
        if (_.exists(columns)) {
            colIdsMap = {};
            columns.forEach(function (colKey) {
                var column = _this.columnController.getGridColumn(colKey);
                if (_.exists(column)) {
                    colIdsMap[column.getId()] = true;
                }
            });
        }
        var processRow = function (rowComp) {
            var rowNode = rowComp.getRowNode();
            var id = rowNode.id;
            var floating = rowNode.rowPinned;
            // skip this row if it is missing from the provided list
            if (_.exists(rowIdsMap)) {
                if (floating === Constants.PINNED_BOTTOM) {
                    if (!rowIdsMap.bottom[id]) {
                        return;
                    }
                }
                else if (floating === Constants.PINNED_TOP) {
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
                callback(cellComp);
            });
        };
        _.iterateObject(this.rowCompsByIndex, function (index, rowComp) {
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
        var rowIndexesToRemove = Object.keys(this.rowCompsByIndex);
        this.removeRowComps(rowIndexesToRemove);
        _super.prototype.destroy.call(this);
    };
    RowRenderer.prototype.binRowComps = function (recycleRows) {
        var _this = this;
        var rowsToRecycle = {};
        var indexesToRemove;
        if (recycleRows) {
            indexesToRemove = [];
            _.iterateObject(this.rowCompsByIndex, function (index, rowComp) {
                var rowNode = rowComp.getRowNode();
                if (_.exists(rowNode.id)) {
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
    // 1) height of grid body changes, ie number of displayed rows has changed
    // 2) grid scrolled to new position
    // 3) ensure index visible (which is a scroll)
    RowRenderer.prototype.redrawAfterScroll = function () {
        this.getLockOnRefresh();
        this.redraw(null, false, true);
        this.releaseLockOnRefresh();
    };
    RowRenderer.prototype.removeRowCompsNotToDraw = function (indexesToDraw) {
        // for speedy lookup, dump into map
        var indexesToDrawMap = {};
        indexesToDraw.forEach(function (index) { return (indexesToDrawMap[index] = true); });
        var existingIndexes = Object.keys(this.rowCompsByIndex);
        var indexesNotToDraw = existingIndexes.filter(function (index) { return !indexesToDrawMap[index]; });
        this.removeRowComps(indexesNotToDraw);
    };
    RowRenderer.prototype.calculateIndexesToDraw = function (rowsToRecycle) {
        var _this = this;
        // all in all indexes in the viewport
        var indexesToDraw = _.createArrayOfNumbers(this.firstRenderedRow, this.lastRenderedRow);
        var checkRowToDraw = function (indexStr, rowComp) {
            var index = Number(indexStr);
            if (index < _this.firstRenderedRow || index > _this.lastRenderedRow) {
                if (_this.doNotUnVirtualiseRow(rowComp)) {
                    indexesToDraw.push(index);
                }
            }
        };
        // if we are redrawing due to scrolling change, then old rows are in this.rowCompsByIndex
        _.iterateObject(this.rowCompsByIndex, checkRowToDraw);
        // if we are redrawing due to model update, then old rows are in rowsToRecycle
        _.iterateObject(rowsToRecycle, checkRowToDraw);
        indexesToDraw.sort(function (a, b) { return a - b; });
        return indexesToDraw;
    };
    RowRenderer.prototype.redraw = function (rowsToRecycle, animate, afterScroll) {
        var _this = this;
        if (animate === void 0) { animate = false; }
        if (afterScroll === void 0) { afterScroll = false; }
        this.maxDivHeightScaler.updateOffset();
        this.workOutFirstAndLastRowsToRender();
        // the row can already exist and be in the following:
        // rowsToRecycle -> if model change, then the index may be different, however row may
        //                         exist here from previous time (mapped by id).
        // this.rowCompsByIndex -> if just a scroll, then this will contain what is currently in the viewport
        // this is all the indexes we want, including those that already exist, so this method
        // will end up going through each index and drawing only if the row doesn't already exist
        var indexesToDraw = this.calculateIndexesToDraw(rowsToRecycle);
        this.removeRowCompsNotToDraw(indexesToDraw);
        // never animate when doing print layout - as we want to get things ready to print as quickly as possible,
        // otherwise we risk the printer printing a row that's half faded (half way through fading in)
        if (this.printLayout) {
            animate = false;
        }
        // add in new rows
        var nextVmTurnFunctions = [];
        var rowComps = [];
        indexesToDraw.forEach(function (rowIndex) {
            var rowComp = _this.createOrUpdateRowComp(rowIndex, rowsToRecycle, animate, afterScroll);
            if (_.exists(rowComp)) {
                rowComps.push(rowComp);
                _.pushAll(nextVmTurnFunctions, rowComp.getAndClearNextVMTurnFunctions());
            }
        });
        this.flushContainers(rowComps);
        _.executeNextVMTurn(nextVmTurnFunctions);
        var useAnimationFrame = afterScroll && !this.gridOptionsWrapper.isSuppressAnimationFrame() && !this.printLayout;
        if (useAnimationFrame) {
            this.beans.taskQueue.addDestroyTask(this.destroyRowComps.bind(this, rowsToRecycle, animate));
        }
        else {
            this.destroyRowComps(rowsToRecycle, animate);
        }
        this.checkAngularCompile();
        this.gridPanel.updateRowCount();
    };
    RowRenderer.prototype.flushContainers = function (rowComps) {
        _.iterateObject(this.rowContainers, function (key, rowContainerComp) {
            if (rowContainerComp) {
                rowContainerComp.flushRowTemplates();
            }
        });
        rowComps.forEach(function (rowComp) { return rowComp.afterFlush(); });
    };
    RowRenderer.prototype.onDisplayedColumnsChanged = function () {
        var pinningLeft = this.columnController.isPinningLeft();
        var pinningRight = this.columnController.isPinningRight();
        var atLeastOneChanged = this.pinningLeft !== pinningLeft || pinningRight !== this.pinningRight;
        if (atLeastOneChanged) {
            this.pinningLeft = pinningLeft;
            this.pinningRight = pinningRight;
            if (this.embedFullWidthRows) {
                this.redrawFullWidthEmbeddedRows();
            }
        }
    };
    // when embedding, what gets showed in each section depends on what is pinned. eg if embedding group expand / collapse,
    // then it should go into the pinned left area if pinning left, or the center area if not pinning.
    RowRenderer.prototype.redrawFullWidthEmbeddedRows = function () {
        // if either of the pinned panels has shown / hidden, then need to redraw the fullWidth bits when
        // embedded, as what appears in each section depends on whether we are pinned or not
        var rowsToRemove = [];
        _.iterateObject(this.rowCompsByIndex, function (id, rowComp) {
            if (rowComp.isFullWidth()) {
                var rowIndex = rowComp.getRowNode().rowIndex;
                rowsToRemove.push(rowIndex.toString());
            }
        });
        this.refreshFloatingRowComps();
        this.removeRowComps(rowsToRemove);
        this.redrawAfterScroll();
    };
    RowRenderer.prototype.refreshFullWidthRows = function () {
        var rowsToRemove = [];
        _.iterateObject(this.rowCompsByIndex, function (id, rowComp) {
            if (rowComp.isFullWidth()) {
                var fullWidthRowsRefreshed = rowComp.refreshFullWidth();
                if (!fullWidthRowsRefreshed) {
                    var rowIndex = rowComp.getRowNode().rowIndex;
                    rowsToRemove.push(rowIndex.toString());
                }
            }
        });
        this.removeRowComps(rowsToRemove);
        this.redrawAfterScroll();
    };
    RowRenderer.prototype.createOrUpdateRowComp = function (rowIndex, rowsToRecycle, animate, afterScroll) {
        var rowNode;
        var rowComp = this.rowCompsByIndex[rowIndex];
        // if no row comp, see if we can get it from the previous rowComps
        if (!rowComp) {
            rowNode = this.paginationProxy.getRow(rowIndex);
            if (_.exists(rowNode) && _.exists(rowsToRecycle) && rowsToRecycle[rowNode.id] && rowNode.alreadyRendered) {
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
            if (_.exists(rowNode)) {
                rowComp = this.createRowComp(rowNode, animate, afterScroll);
            }
            else {
                // this should never happen - if somehow we are trying to create
                // a row for a rowNode that does not exist.
                return;
            }
        }
        else {
            // ensure row comp is in right position in DOM
            rowComp.ensureDomOrder();
        }
        if (rowNode) {
            // set node as 'alreadyRendered' to ensure we only recycle rowComps that have been rendered, this ensures
            // we don't reuse rowComps that have been removed and then re-added in the same batch transaction.
            rowNode.alreadyRendered = true;
        }
        this.rowCompsByIndex[rowIndex] = rowComp;
        return rowComp;
    };
    RowRenderer.prototype.destroyRowComps = function (rowCompsMap, animate) {
        var delayedFuncs = [];
        _.iterateObject(rowCompsMap, function (nodeId, rowComp) {
            // if row was used, then it's null
            if (!rowComp) {
                return;
            }
            rowComp.destroy(animate);
            _.pushAll(delayedFuncs, rowComp.getAndClearDelayedDestroyFunctions());
        });
        _.executeInAWhile(delayedFuncs);
    };
    RowRenderer.prototype.checkAngularCompile = function () {
        var _this = this;
        // if we are doing angular compiling, then do digest the scope here
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            // we do it in a timeout, in case we are already in an apply
            window.setTimeout(function () {
                _this.$scope.$apply();
            }, 0);
        }
    };
    RowRenderer.prototype.workOutFirstAndLastRowsToRender = function () {
        var _this = this;
        var newFirst;
        var newLast;
        if (!this.paginationProxy.isRowsToRender()) {
            newFirst = 0;
            newLast = -1; // setting to -1 means nothing in range
        }
        else if (this.printLayout) {
            newFirst = this.paginationProxy.getPageFirstRow();
            newLast = this.paginationProxy.getPageLastRow();
        }
        else {
            var paginationOffset = this.paginationProxy.getPixelOffset();
            var maxDivHeightScaler = this.maxDivHeightScaler.getOffset();
            var bodyVRange = this.gridPanel.getVScrollPosition();
            var bodyTopPixel = bodyVRange.top;
            var bodyBottomPixel = bodyVRange.bottom;
            var bufferPixels = this.gridOptionsWrapper.getRowBufferInPixels();
            var firstPixel = bodyTopPixel + paginationOffset + maxDivHeightScaler - bufferPixels;
            var lastPixel = bodyBottomPixel + paginationOffset + maxDivHeightScaler + bufferPixels;
            this.ensureAllRowsInRangeHaveHeightsCalculated(firstPixel, lastPixel);
            var firstRowIndex = this.paginationProxy.getRowIndexAtPixel(firstPixel);
            var lastRowIndex = this.paginationProxy.getRowIndexAtPixel(lastPixel);
            var pageFirstRow = this.paginationProxy.getPageFirstRow();
            var pageLastRow = this.paginationProxy.getPageLastRow();
            // adjust, in case buffer extended actual size
            if (firstRowIndex < pageFirstRow) {
                firstRowIndex = pageFirstRow;
            }
            if (lastRowIndex > pageLastRow) {
                lastRowIndex = pageLastRow;
            }
            newFirst = firstRowIndex;
            newLast = lastRowIndex;
        }
        // sometimes user doesn't set CSS right and ends up with grid with no height and grid ends up
        // trying to render all the rows, eg 10,000+ rows. this will kill the browser. so instead of
        // killing the browser, we limit the number of rows. just in case some use case we didn't think
        // of, we also have a property to not do this operation.
        var rowLayoutNormal = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_NORMAL;
        var suppressRowCountRestriction = this.gridOptionsWrapper.isSuppressMaxRenderedRowRestriction();
        var rowBufferMaxSize = Math.max(this.gridOptionsWrapper.getRowBuffer(), 500);
        if (rowLayoutNormal && !suppressRowCountRestriction) {
            if (newLast - newFirst > rowBufferMaxSize) {
                newLast = newFirst + rowBufferMaxSize;
            }
        }
        var firstDiffers = newFirst !== this.firstRenderedRow;
        var lastDiffers = newLast !== this.lastRenderedRow;
        if (firstDiffers || lastDiffers) {
            this.firstRenderedRow = newFirst;
            this.lastRenderedRow = newLast;
            var event_1 = {
                type: Events.EVENT_VIEWPORT_CHANGED,
                firstRow: newFirst,
                lastRow: newLast,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event_1);
        }
        // only dispatch firstDataRendered if we have actually rendered some data
        if (this.paginationProxy.isRowsToRender()) {
            var event_2 = {
                type: Events.EVENT_FIRST_DATA_RENDERED,
                firstRow: newFirst,
                lastRow: newLast,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            // added a small delay here because in some scenarios this can be fired
            // before the grid is actually rendered, causing component creation
            // on EVENT_FIRST_DATA_RENDERED to fail.
            window.setTimeout(function () { return _this.eventService.dispatchEventOnce(event_2); }, 50);
        }
    };
    RowRenderer.prototype.ensureAllRowsInRangeHaveHeightsCalculated = function (topPixel, bottomPixel) {
        // ensureRowHeightsVisible only works with CSRM, as it's the only row model that allows lazy row height calcs.
        // all the other row models just hard code so the method just returns back false
        var rowHeightsChanged = this.paginationProxy.ensureRowHeightsValid(topPixel, bottomPixel, -1, -1);
        if (rowHeightsChanged) {
            // if row heights have changed, we need to resize the containers the rows sit it
            this.sizeContainerToPageHeight();
            // we also need to update heightScaler as this has dependency of row container height
            this.maxDivHeightScaler.updateOffset();
        }
    };
    RowRenderer.prototype.getFirstVirtualRenderedRow = function () {
        return this.firstRenderedRow;
    };
    RowRenderer.prototype.getLastVirtualRenderedRow = function () {
        return this.lastRenderedRow;
    };
    // check that none of the rows to remove are editing or focused as:
    // a) if editing, we want to keep them, otherwise the user will loose the context of the edit,
    //    eg user starts editing, enters some text, then scrolls down and then up, next time row rendered
    //    the edit is reset - so we want to keep it rendered.
    // b) if focused, we want ot keep keyboard focus, so if user ctrl+c, it goes to clipboard,
    //    otherwise the user can range select and drag (with focus cell going out of the viewport)
    //    and then ctrl+c, nothing will happen if cell is removed from dom.
    // c) if detail record of master detail, as users complained that the context of detail rows
    //    was getting lost when detail row out of view. eg user expands to show detail row,
    //    then manipulates the detail panel (eg sorts the detail grid), then context is lost
    //    after detail panel is scrolled out of / into view.
    RowRenderer.prototype.doNotUnVirtualiseRow = function (rowComp) {
        var REMOVE_ROW = false;
        var KEEP_ROW = true;
        var rowNode = rowComp.getRowNode();
        var rowHasFocus = this.focusController.isRowNodeFocused(rowNode);
        var rowIsEditing = rowComp.isEditing();
        var rowIsDetail = rowNode.detail;
        var mightWantToKeepRow = rowHasFocus || rowIsEditing || rowIsDetail;
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
    RowRenderer.prototype.createRowComp = function (rowNode, animate, afterScroll) {
        var suppressAnimationFrame = this.gridOptionsWrapper.isSuppressAnimationFrame();
        // we don't use animations frames for printing, so the user can put the grid into print mode
        // and immediately print - otherwise the user would have to wait for the rows to draw in the background
        // (via the animation frames) which is awkward to do from code.
        // we only do the animation frames after scrolling, as this is where we want the smooth user experience.
        // having animation frames for other times makes the grid look 'jumpy'.
        var useAnimationFrameForCreate = afterScroll && !suppressAnimationFrame && !this.printLayout;
        var rowComp = new RowComp(this.$scope, this.rowContainers.body, this.rowContainers.pinnedLeft, this.rowContainers.pinnedRight, this.rowContainers.fullWidth, rowNode, this.beans, animate, useAnimationFrameForCreate, this.printLayout, this.embedFullWidthRows);
        rowComp.init();
        return rowComp;
    };
    RowRenderer.prototype.getRenderedNodes = function () {
        var renderedRows = this.rowCompsByIndex;
        return Object.keys(renderedRows).map(function (key) { return renderedRows[key].getRowNode(); });
    };
    // we use index for rows, but column object for columns, as the next column (by index) might not
    // be visible (header grouping) so it's not reliable, so using the column object instead.
    RowRenderer.prototype.navigateToNextCell = function (event, key, currentCell, allowUserOverride) {
        // we keep searching for a next cell until we find one. this is how the group rows get skipped
        var nextCell = currentCell;
        var hitEdgeOfGrid = false;
        while (nextCell && (nextCell === currentCell || !this.isValidNavigateCell(nextCell))) {
            // if the current cell is spanning across multiple columns, we need to move
            // our current position to be the last cell on the right before finding the
            // the next target.
            if (this.gridOptionsWrapper.isEnableRtl()) {
                if (key === Constants.KEY_LEFT) {
                    nextCell = this.getLastCellOfColSpan(nextCell);
                }
            }
            else if (key === Constants.KEY_RIGHT) {
                nextCell = this.getLastCellOfColSpan(nextCell);
            }
            nextCell = this.cellNavigationService.getNextCellToFocus(key, nextCell);
            // eg if going down, and nextCell=undefined, means we are gone past the last row
            hitEdgeOfGrid = _.missing(nextCell);
        }
        if (hitEdgeOfGrid && event.keyCode === Constants.KEY_UP) {
            nextCell = {
                rowIndex: -1,
                rowPinned: null,
                column: currentCell.column
            };
        }
        // allow user to override what cell to go to next. when doing normal cell navigation (with keys)
        // we allow this, however if processing 'enter after edit' we don't allow override
        if (allowUserOverride) {
            var userFunc = this.gridOptionsWrapper.getNavigateToNextCellFunc();
            if (_.exists(userFunc)) {
                var params = {
                    key: key,
                    previousCellPosition: currentCell,
                    nextCellPosition: nextCell ? nextCell : null,
                    event: event
                };
                var userCell = userFunc(params);
                if (_.exists(userCell)) {
                    if (userCell.floating) {
                        _.doOnce(function () { console.warn("ag-Grid: tabToNextCellFunc return type should have attributes: rowIndex, rowPinned, column. However you had 'floating', maybe you meant 'rowPinned'?"); }, 'no floating in userCell');
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
            var headerLen = this.beans.headerNavigationService.getHeaderRowCount();
            this.focusController.focusHeaderPosition({
                headerRowIndex: headerLen + (nextCell.rowIndex), column: currentCell.column
            });
            return;
        }
        // in case we have col spanning we get the cellComp and use it to
        // get the position. This was we always focus the first cell inside
        // the spanning.
        this.ensureCellVisible(nextCell); // ensureCellVisible first, to make sure nextCell is rendered
        var cellComp = this.getComponentForCell(nextCell);
        // not guaranteed to have a cellComp when using the SSRM as blocks are loading.
        if (!cellComp) {
            return;
        }
        nextCell = cellComp.getCellPosition();
        // we call this again, as nextCell can be different to it's previous value due to Column Spanning
        // (ie if cursor moving from right to left, and cell is spanning columns, then nextCell was the
        // last column in the group, however now it's the first column in the group). if we didn't do
        // ensureCellVisible again, then we could only be showing the last portion (last column) of the
        // merged cells.
        this.ensureCellVisible(nextCell);
        this.focusController.setFocusedCell(nextCell.rowIndex, nextCell.column, nextCell.rowPinned, true);
        if (this.rangeController) {
            this.rangeController.setRangeToCell(nextCell);
        }
    };
    RowRenderer.prototype.isValidNavigateCell = function (cell) {
        var rowNode = this.rowPositionUtils.getRowNode(cell);
        // we do not allow focusing on detail rows and full width rows
        if (rowNode.detail || rowNode.isFullWidthCell()) {
            return false;
        }
        // if not a group, then we have a valid row, so quit the search
        if (!rowNode.group) {
            return true;
        }
        // full width rows cannot be focused, so if it's a group and using full width rows,
        // we need to skip over the row
        var pivotMode = this.columnController.isPivotMode();
        var usingFullWidthRows = this.gridOptionsWrapper.isGroupUseEntireRow(pivotMode);
        if (!usingFullWidthRows) {
            return true;
        }
        return false;
    };
    RowRenderer.prototype.getLastCellOfColSpan = function (cell) {
        var cellComp = this.getComponentForCell(cell);
        if (!cellComp) {
            return cell;
        }
        var colSpanningList = cellComp.getColSpanningList();
        if (colSpanningList.length === 1) {
            return cell;
        }
        return {
            rowIndex: cell.rowIndex,
            column: _.last(colSpanningList),
            rowPinned: cell.rowPinned
        };
    };
    RowRenderer.prototype.ensureCellVisible = function (gridCell) {
        // this scrolls the row into view
        if (_.missing(gridCell.rowPinned)) {
            this.gridPanel.ensureIndexVisible(gridCell.rowIndex);
        }
        if (!gridCell.column.isPinned()) {
            this.gridPanel.ensureColumnVisible(gridCell.column);
        }
        // need to nudge the scrolls for the floating items. otherwise when we set focus on a non-visible
        // floating cell, the scrolls get out of sync
        this.gridPanel.horizontallyScrollHeaderCenterAndFloatingCenter();
        // need to flush frames, to make sure the correct cells are rendered
        this.animationFrameService.flushAllFrames();
    };
    RowRenderer.prototype.startEditingCell = function (gridCell, keyPress, charPress) {
        var cell = this.getComponentForCell(gridCell);
        if (cell) {
            cell.startRowOrCellEdit(keyPress, charPress);
        }
    };
    RowRenderer.prototype.getComponentForCell = function (cellPosition) {
        var rowComponent;
        switch (cellPosition.rowPinned) {
            case Constants.PINNED_TOP:
                rowComponent = this.floatingTopRowComps[cellPosition.rowIndex];
                break;
            case Constants.PINNED_BOTTOM:
                rowComponent = this.floatingBottomRowComps[cellPosition.rowIndex];
                break;
            default:
                rowComponent = this.rowCompsByIndex[cellPosition.rowIndex];
                break;
        }
        if (!rowComponent) {
            return null;
        }
        var cellComponent = rowComponent.getRenderedCellForColumn(cellPosition.column);
        return cellComponent;
    };
    RowRenderer.prototype.getRowNode = function (gridRow) {
        switch (gridRow.rowPinned) {
            case Constants.PINNED_TOP:
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case Constants.PINNED_BOTTOM:
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    };
    RowRenderer.prototype.onTabKeyDown = function (previousRenderedCell, keyboardEvent) {
        var backwards = keyboardEvent.shiftKey;
        var success = this.moveToCellAfter(previousRenderedCell, backwards);
        if (success) {
            keyboardEvent.preventDefault();
        }
        else if (keyboardEvent.shiftKey) {
            var cellPosition = previousRenderedCell.getCellPosition();
            if (cellPosition.rowIndex === 0) {
                keyboardEvent.preventDefault();
                this.focusController.focusHeaderPosition({
                    headerRowIndex: this.beans.headerNavigationService.getHeaderRowCount() - 1,
                    column: _.last(this.columnController.getAllDisplayedColumns())
                });
            }
        }
    };
    RowRenderer.prototype.tabToNextCell = function (backwards) {
        var focusedCell = this.focusController.getFocusedCell();
        // if no focus, then cannot navigate
        if (_.missing(focusedCell)) {
            return false;
        }
        var renderedCell = this.getComponentForCell(focusedCell);
        // if cell is not rendered, means user has scrolled away from the cell
        if (_.missing(renderedCell)) {
            return false;
        }
        var result = this.moveToCellAfter(renderedCell, backwards);
        return result;
    };
    RowRenderer.prototype.moveToCellAfter = function (previousRenderedCell, backwards) {
        var editing = previousRenderedCell.isEditing();
        var res;
        if (editing) {
            if (this.gridOptionsWrapper.isFullRowEdit()) {
                res = this.moveToNextEditingRow(previousRenderedCell, backwards);
            }
            else {
                res = this.moveToNextEditingCell(previousRenderedCell, backwards);
            }
        }
        else {
            res = this.moveToNextCellNotEditing(previousRenderedCell, backwards);
        }
        return res;
    };
    RowRenderer.prototype.moveToNextEditingCell = function (previousRenderedCell, backwards) {
        var gridCell = previousRenderedCell.getCellPosition();
        // need to do this before getting next cell to edit, in case the next cell
        // has editable function (eg colDef.editable=func() ) and it depends on the
        // result of this cell, so need to save updates from the first edit, in case
        // the value is referenced in the function.
        previousRenderedCell.stopEditing();
        // find the next cell to start editing
        var nextRenderedCell = this.findNextCellToFocusOn(gridCell, backwards, true);
        var foundCell = _.exists(nextRenderedCell);
        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (foundCell) {
            nextRenderedCell.startEditingIfEnabled(null, null, true);
            nextRenderedCell.focusCell(false);
        }
        return foundCell;
    };
    RowRenderer.prototype.moveToNextEditingRow = function (previousRenderedCell, backwards) {
        var gridCell = previousRenderedCell.getCellPosition();
        // find the next cell to start editing
        var nextRenderedCell = this.findNextCellToFocusOn(gridCell, backwards, true);
        var foundCell = _.exists(nextRenderedCell);
        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (foundCell) {
            this.moveEditToNextCellOrRow(previousRenderedCell, nextRenderedCell);
        }
        return foundCell;
    };
    RowRenderer.prototype.moveToNextCellNotEditing = function (previousRenderedCell, backwards) {
        var gridCell = previousRenderedCell.getCellPosition();
        // find the next cell to start editing
        var nextRenderedCell = this.findNextCellToFocusOn(gridCell, backwards, false);
        var foundCell = _.exists(nextRenderedCell);
        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (foundCell) {
            nextRenderedCell.focusCell(true);
        }
        return foundCell;
    };
    RowRenderer.prototype.moveEditToNextCellOrRow = function (previousRenderedCell, nextRenderedCell) {
        var pGridCell = previousRenderedCell.getCellPosition();
        var nGridCell = nextRenderedCell.getCellPosition();
        var rowsMatch = pGridCell.rowIndex === nGridCell.rowIndex && pGridCell.rowPinned === nGridCell.rowPinned;
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
            if (!backwards) {
                nextCell = this.getLastCellOfColSpan(nextCell);
            }
            nextCell = this.cellNavigationService.getNextTabbedCell(nextCell, backwards);
            // allow user to override what cell to go to next
            var userFunc = this.gridOptionsWrapper.getTabToNextCellFunc();
            if (_.exists(userFunc)) {
                var params = {
                    backwards: backwards,
                    editing: startEditing,
                    previousCellPosition: gridCell,
                    nextCellPosition: nextCell ? nextCell : null
                };
                var userCell = userFunc(params);
                if (_.exists(userCell)) {
                    if (userCell.floating) {
                        _.doOnce(function () { console.warn("ag-Grid: tabToNextCellFunc return type should have attributes: rowIndex, rowPinned, column. However you had 'floating', maybe you meant 'rowPinned'?"); }, 'no floating in userCell');
                        userCell.rowPinned = userCell.floating;
                    }
                    nextCell = {
                        rowIndex: userCell.rowIndex,
                        column: userCell.column,
                        rowPinned: userCell.rowPinned
                    };
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
            // if editing, but cell not editable, skip cell. we do this before we do all of
            // the 'ensure index visible' and 'flush all frames', otherwise if we are skipping
            // a bunch of cells (eg 10 rows) then all the work on ensuring cell visible is useless
            // (except for the last one) which causes grid to stall for a while.
            if (startEditing) {
                var rowNode = this.lookupRowNodeForCell(nextCell);
                var cellIsEditable = nextCell.column.isCellEditable(rowNode);
                if (!cellIsEditable) {
                    continue;
                }
            }
            // this scrolls the row into view
            var cellIsNotFloating = _.missing(nextCell.rowPinned);
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
            var nextCellComp = this.getComponentForCell(nextCell);
            // if next cell is fullWidth row, then no rendered cell,
            // as fullWidth rows have no cells, so we skip it
            if (_.missing(nextCellComp)) {
                continue;
            }
            if (nextCellComp.isSuppressNavigable()) {
                continue;
            }
            // by default, when we click a cell, it gets selected into a range, so to keep keyboard navigation
            // consistent, we set into range here also.
            if (this.rangeController) {
                this.rangeController.setRangeToCell(nextCell);
            }
            // we successfully tabbed onto a grid cell, so return true
            return nextCellComp;
        }
    };
    RowRenderer.prototype.lookupRowNodeForCell = function (cell) {
        if (cell.rowPinned === Constants.PINNED_TOP) {
            return this.pinnedRowModel.getPinnedTopRow(cell.rowIndex);
        }
        if (cell.rowPinned === Constants.PINNED_BOTTOM) {
            return this.pinnedRowModel.getPinnedBottomRow(cell.rowIndex);
        }
        return this.paginationProxy.getRow(cell.rowIndex);
    };
    __decorate([
        Autowired("paginationProxy")
    ], RowRenderer.prototype, "paginationProxy", void 0);
    __decorate([
        Autowired("columnController")
    ], RowRenderer.prototype, "columnController", void 0);
    __decorate([
        Autowired("gridOptionsWrapper")
    ], RowRenderer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired("$scope")
    ], RowRenderer.prototype, "$scope", void 0);
    __decorate([
        Autowired("pinnedRowModel")
    ], RowRenderer.prototype, "pinnedRowModel", void 0);
    __decorate([
        Autowired("rowModel")
    ], RowRenderer.prototype, "rowModel", void 0);
    __decorate([
        Autowired("loggerFactory")
    ], RowRenderer.prototype, "loggerFactory", void 0);
    __decorate([
        Autowired("focusController")
    ], RowRenderer.prototype, "focusController", void 0);
    __decorate([
        Autowired("cellNavigationService")
    ], RowRenderer.prototype, "cellNavigationService", void 0);
    __decorate([
        Autowired("columnApi")
    ], RowRenderer.prototype, "columnApi", void 0);
    __decorate([
        Autowired("gridApi")
    ], RowRenderer.prototype, "gridApi", void 0);
    __decorate([
        Autowired("beans")
    ], RowRenderer.prototype, "beans", void 0);
    __decorate([
        Autowired("maxDivHeightScaler")
    ], RowRenderer.prototype, "maxDivHeightScaler", void 0);
    __decorate([
        Autowired("animationFrameService")
    ], RowRenderer.prototype, "animationFrameService", void 0);
    __decorate([
        Autowired("rowPositionUtils")
    ], RowRenderer.prototype, "rowPositionUtils", void 0);
    __decorate([
        Optional("rangeController")
    ], RowRenderer.prototype, "rangeController", void 0);
    __decorate([
        __param(0, Qualifier("loggerFactory"))
    ], RowRenderer.prototype, "agWire", null);
    RowRenderer = __decorate([
        Bean("rowRenderer")
    ], RowRenderer);
    return RowRenderer;
}(BeanStub));
export { RowRenderer };
