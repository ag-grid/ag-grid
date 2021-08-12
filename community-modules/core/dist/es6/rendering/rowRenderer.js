/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { RowCtrl } from "./row/rowCtrl";
import { Column } from "../entities/column";
import { Events } from "../events";
import { Constants } from "../constants/constants";
import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { exists, missing } from "../utils/generic";
import { getAllValuesInObject, iterateObject } from "../utils/object";
import { createArrayOfNumbers } from "../utils/number";
import { executeInAWhile } from "../utils/function";
import { CellCtrl } from "./cell/cellCtrl";
import { removeFromArray } from "../utils/array";
var RowRenderer = /** @class */ (function (_super) {
    __extends(RowRenderer, _super);
    function RowRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.destroyFuncsForColumnListeners = [];
        // map of row ids to row objects. keeps track of which elements
        // are rendered for which rows in the dom.
        _this.rowCtrlsByRowIndex = {};
        _this.zombieRowCtrls = {};
        _this.allRowCtrls = [];
        _this.topRowCtrls = [];
        _this.bottomRowCtrls = [];
        // we only allow one refresh at a time, otherwise the internal memory structure here
        // will get messed up. this can happen if the user has a cellRenderer, and inside the
        // renderer they call an API method that results in another pass of the refresh,
        // then it will be trying to draw rows in the middle of a refresh.
        _this.refreshInProgress = false;
        return _this;
    }
    RowRenderer.prototype.postConstruct = function () {
        var _this = this;
        this.ctrlsService.whenReady(function () {
            _this.gridBodyCtrl = _this.ctrlsService.getGridBodyCtrl();
            _this.initialise();
        });
    };
    RowRenderer.prototype.initialise = function () {
        this.addManagedListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onPageLoaded.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, this.redrawAfterScroll.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.redrawAfterScroll.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
        this.registerCellEventListeners();
        this.initialiseCache();
        this.printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        this.embedFullWidthRows = this.printLayout || this.gridOptionsWrapper.isEmbedFullWidthRows();
        this.redrawAfterModelUpdate();
    };
    RowRenderer.prototype.initialiseCache = function () {
        if (this.gridOptionsWrapper.isKeepDetailRows()) {
            var countProp = this.gridOptionsWrapper.getKeepDetailRowsCount();
            var count = countProp != null ? countProp : 3;
            this.cachedRowCtrls = new RowCtrlCache(count);
        }
    };
    RowRenderer.prototype.getRowCtrls = function () {
        return this.allRowCtrls;
    };
    RowRenderer.prototype.updateAllRowCtrls = function () {
        var liveList = getAllValuesInObject(this.rowCtrlsByRowIndex);
        if (this.beans.gridOptionsWrapper.isEnsureDomOrder()) {
            liveList.sort(function (a, b) { return a.getRowNode().rowIndex - b.getRowNode.rowIndex; });
        }
        var zombieList = getAllValuesInObject(this.zombieRowCtrls);
        var cachedList = this.cachedRowCtrls ? this.cachedRowCtrls.getEntries() : [];
        this.allRowCtrls = __spreadArrays(liveList, zombieList, cachedList);
    };
    // in a clean design, each cell would register for each of these events. however when scrolling, all the cells
    // registering and de-registering for events is a performance bottleneck. so we register here once and inform
    // all active cells.
    RowRenderer.prototype.registerCellEventListeners = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_CELL_FOCUSED, function (event) {
            _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.onCellFocused(event); });
            _this.getAllRowCtrls().forEach(function (rowCtrl) {
                if (rowCtrl.isFullWidth()) {
                    rowCtrl.onFullWidthRowFocused(event);
                }
            });
        });
        this.addManagedListener(this.eventService, Events.EVENT_FLASH_CELLS, function (event) {
            _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.onFlashCells(event); });
        });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, function () {
            _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.onColumnHover(); });
        });
        // only for printLayout - because we are rendering all the cells in the same row, regardless of pinned state,
        // then changing the width of the containers will impact left position. eg the center cols all have their
        // left position adjusted by the width of the left pinned column, so if the pinned left column width changes,
        // all the center cols need to be shifted to accommodate this. when in normal layout, the pinned cols are
        // in different containers so doesn't impact.
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, function () {
            if (_this.printLayout) {
                _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.onLeftChanged(); });
            }
        });
        var rangeSelectionEnabled = this.gridOptionsWrapper.isEnableRangeSelection();
        if (rangeSelectionEnabled) {
            this.addManagedListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, function () {
                _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.onRangeSelectionChanged(); });
            });
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, function () {
                _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.updateRangeBordersIfRangeCount(); });
            });
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, function () {
                _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.updateRangeBordersIfRangeCount(); });
            });
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, function () {
                _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.updateRangeBordersIfRangeCount(); });
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
        var cols = this.columnModel.getAllGridColumns();
        if (!cols) {
            return;
        }
        cols.forEach(function (col) {
            var forEachCellWithThisCol = function (callback) {
                _this.getAllCellCtrls().forEach(function (cellCtrl) {
                    if (cellCtrl.getColumn() === col) {
                        callback(cellCtrl);
                    }
                });
            };
            var leftChangedListener = function () {
                forEachCellWithThisCol(function (cellCtrl) { return cellCtrl.onLeftChanged(); });
            };
            var widthChangedListener = function () {
                forEachCellWithThisCol(function (cellCtrl) { return cellCtrl.onWidthChanged(); });
            };
            var firstRightPinnedChangedListener = function () {
                forEachCellWithThisCol(function (cellCtrl) { return cellCtrl.onFirstRightPinnedChanged(); });
            };
            var lastLeftPinnedChangedListener = function () {
                forEachCellWithThisCol(function (cellCtrl) { return cellCtrl.onLastLeftPinnedChanged(); });
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
        var rowIndexesToRemove = Object.keys(this.rowCtrlsByRowIndex);
        this.removeRowCtrls(rowIndexesToRemove);
    };
    RowRenderer.prototype.onPageLoaded = function (event) {
        var params = {
            recycleRows: event.keepRenderedRows,
            animate: event.animate,
            newData: event.newData,
            newPage: event.newPage,
            // because this is a model updated event (not pinned rows), we
            // can skip updating the pinned rows. this is needed so that if user
            // is doing transaction updates, the pinned rows are not getting constantly
            // trashed - or editing cells in pinned rows are not refreshed and put into read mode
            onlyBody: true
        };
        this.redrawAfterModelUpdate(params);
    };
    RowRenderer.prototype.getAllCellsForColumn = function (column) {
        var res = [];
        this.getAllRowCtrls().forEach(function (rowCtrl) {
            var eCell = rowCtrl.getCellElement(column);
            if (eCell) {
                res.push(eCell);
            }
        });
        return res;
    };
    RowRenderer.prototype.refreshFloatingRowComps = function () {
        this.refreshFloatingRows(this.topRowCtrls, this.pinnedRowModel.getPinnedTopRowData());
        this.refreshFloatingRows(this.bottomRowCtrls, this.pinnedRowModel.getPinnedBottomRowData());
    };
    RowRenderer.prototype.getTopRowCtrls = function () {
        return this.topRowCtrls;
    };
    RowRenderer.prototype.getBottomRowCtrls = function () {
        return this.bottomRowCtrls;
    };
    RowRenderer.prototype.refreshFloatingRows = function (rowComps, rowNodes) {
        var _this = this;
        rowComps.forEach(function (row) {
            row.destroyFirstPass();
            row.destroySecondPass();
        });
        rowComps.length = 0;
        if (!rowNodes) {
            return;
        }
        rowNodes.forEach(function (rowNode) {
            var rowCon = new RowCtrl(_this.$scope, rowNode, _this.beans, false, false, _this.printLayout);
            rowComps.push(rowCon);
        });
    };
    RowRenderer.prototype.onPinnedRowDataChanged = function () {
        // recycling rows in order to ensure cell editing is not cancelled
        var params = {
            recycleRows: true
        };
        this.redrawAfterModelUpdate(params);
    };
    // if the row nodes are not rendered, no index is returned
    RowRenderer.prototype.getRenderedIndexesForRowNodes = function (rowNodes) {
        var result = [];
        if (missing(rowNodes)) {
            return result;
        }
        iterateObject(this.rowCtrlsByRowIndex, function (index, renderedRow) {
            var rowNode = renderedRow.getRowNode();
            if (rowNodes.indexOf(rowNode) >= 0) {
                result.push(index);
            }
        });
        return result;
    };
    RowRenderer.prototype.redrawRows = function (rowNodes) {
        // if no row nodes provided, then refresh everything
        var partialRefresh = rowNodes != null && rowNodes.length > 0;
        if (partialRefresh) {
            var indexesToRemove = this.getRenderedIndexesForRowNodes(rowNodes);
            // remove the rows
            this.removeRowCtrls(indexesToRemove);
        }
        // add draw them again
        this.redrawAfterModelUpdate({
            recycleRows: partialRefresh
        });
    };
    RowRenderer.prototype.getCellToRestoreFocusToAfterRefresh = function (params) {
        var focusedCell = params.suppressKeepFocus ? null : this.focusService.getFocusCellToUseAfterRefresh();
        if (missing(focusedCell)) {
            return null;
        }
        // if the dom is not actually focused on a cell, then we don't try to refocus. the problem this
        // solves is with editing - if the user is editing, eg focus is on a text field, and not on the
        // cell itself, then the cell can be registered as having focus, however it's the text field that
        // has the focus and not the cell div. therefore, when the refresh is finished, the grid will focus
        // the cell, and not the textfield. that means if the user is in a text field, and the grid refreshes,
        // the focus is lost from the text field. we do not want this.
        var activeElement = document.activeElement;
        var domData = this.gridOptionsWrapper.getDomData(activeElement, CellCtrl.DOM_DATA_KEY_CELL_CTRL);
        var elementIsNotACellDev = missing(domData);
        return elementIsNotACellDev ? null : focusedCell;
    };
    // gets called from:
    // +) initialisation (in registerGridComp) params = null
    // +) onDomLayoutChanged, params = null
    // +) onPageLoaded, recycleRows, animate, newData, newPage from event, onlyBody=true
    // +) onPinnedRowDataChanged, recycleRows = true
    // +) redrawRows (from Grid API), recycleRows = true/false
    RowRenderer.prototype.redrawAfterModelUpdate = function (params) {
        if (params === void 0) { params = {}; }
        this.getLockOnRefresh();
        var focusedCell = this.getCellToRestoreFocusToAfterRefresh(params);
        this.updateContainerHeights();
        this.scrollToTopIfNewData(params);
        // never recycle rows when print layout, we draw each row again from scratch. this is because print layout
        // uses normal dom layout to put cells into dom - it doesn't allow reordering rows.
        var recycleRows = !this.printLayout && !!params.recycleRows;
        var animate = params.animate && this.gridOptionsWrapper.isAnimateRows();
        // after modelUpdate, row indexes can change, so we clear out the rowsByIndex map,
        // however we can reuse the rows, so we keep them but index by rowNode.id
        var rowsToRecycle = recycleRows ? this.recycleRows() : null;
        if (!recycleRows) {
            this.removeAllRowComps();
        }
        var isFocusedCellGettingRecycled = function () {
            if (focusedCell == null || rowsToRecycle == null) {
                return false;
            }
            var res = false;
            iterateObject(rowsToRecycle, function (key, rowComp) {
                var rowNode = rowComp.getRowNode();
                var rowIndexEqual = rowNode.rowIndex == focusedCell.rowIndex;
                var pinnedEqual = rowNode.rowPinned == focusedCell.rowPinned;
                if (rowIndexEqual && pinnedEqual) {
                    res = true;
                }
            });
            return res;
        };
        var focusedCellRecycled = isFocusedCellGettingRecycled();
        this.redraw(rowsToRecycle, animate);
        if (!params.onlyBody) {
            this.refreshFloatingRowComps();
        }
        this.dispatchDisplayedRowsChanged();
        // if we focus a cell that's already focused, then we get an unnecessary 'cellFocused' event fired.
        // this was happening when user clicked 'expand' on a rowGroup, then cellFocused was getting fired twice.
        if (!focusedCellRecycled) {
            this.restoreFocusedCell(focusedCell);
        }
        this.releaseLockOnRefresh();
    };
    RowRenderer.prototype.scrollToTopIfNewData = function (params) {
        var scrollToTop = params.newData || params.newPage;
        var suppressScrollToTop = this.gridOptionsWrapper.isSuppressScrollOnNewData();
        if (scrollToTop && !suppressScrollToTop) {
            this.gridBodyCtrl.getScrollFeature().scrollToTop();
        }
    };
    RowRenderer.prototype.updateContainerHeights = function () {
        // when doing print layout, we don't explicitly set height on the containers
        if (this.printLayout) {
            this.rowContainerHeightService.setModelHeight(null);
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
        this.rowContainerHeightService.setModelHeight(containerHeight);
    };
    RowRenderer.prototype.getLockOnRefresh = function () {
        if (this.refreshInProgress) {
            throw new Error("AG Grid: cannot get grid to draw rows when it is in the middle of drawing rows. " +
                "Your code probably called a grid API method while the grid was in the render stage. To overcome " +
                "this, put the API call into a timeout, e.g. instead of api.refreshView(), " +
                "call setTimeout(function() { api.refreshView(); }, 0). To see what part of your code " +
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
            this.focusService.setFocusedCell(cellPosition.rowIndex, cellPosition.column, cellPosition.rowPinned, true);
        }
    };
    RowRenderer.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        this.getAllRowCtrls().forEach(function (rowCtrl) {
            rowCtrl.stopEditing(cancel);
        });
    };
    RowRenderer.prototype.onNewColumnsLoaded = function () {
        // we don't want each cellComp to register for events, as would increase rendering time.
        // so for newColumnsLoaded, we register once here (in rowRenderer) and then inform
        // each cell if / when event was fired.
        this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.onNewColumnsLoaded(); });
    };
    RowRenderer.prototype.getAllCellCtrls = function () {
        var res = [];
        this.getAllRowCtrls().forEach(function (rowCtrl) { return res = res.concat(rowCtrl.getAllCellCtrls()); });
        return res;
    };
    RowRenderer.prototype.getAllRowCtrls = function () {
        var _this = this;
        var res = __spreadArrays(this.topRowCtrls, this.bottomRowCtrls);
        Object.keys(this.rowCtrlsByRowIndex).forEach(function (key) { return res.push(_this.rowCtrlsByRowIndex[key]); });
        return res;
    };
    RowRenderer.prototype.addRenderedRowListener = function (eventName, rowIndex, callback) {
        var rowComp = this.rowCtrlsByRowIndex[rowIndex];
        if (rowComp) {
            rowComp.addEventListener(eventName, callback);
        }
    };
    RowRenderer.prototype.flashCells = function (params) {
        if (params === void 0) { params = {}; }
        var flashDelay = params.flashDelay, fadeDelay = params.fadeDelay;
        this.getCellCtrls(params.rowNodes, params.columns)
            .forEach(function (cellCtrl) { return cellCtrl.flashCell({ flashDelay: flashDelay, fadeDelay: fadeDelay }); });
    };
    RowRenderer.prototype.refreshCells = function (params) {
        if (params === void 0) { params = {}; }
        var refreshCellParams = {
            forceRefresh: params.force,
            newData: false,
            suppressFlash: params.suppressFlash
        };
        this.getCellCtrls(params.rowNodes, params.columns)
            .forEach(function (cellCtrl) {
            if (cellCtrl.refreshShouldDestroy()) {
                var rowCtrl = cellCtrl.getRowCtrl();
                if (rowCtrl) {
                    rowCtrl.refreshCell(cellCtrl);
                }
            }
            else {
                cellCtrl.refreshCell(refreshCellParams);
            }
        });
    };
    RowRenderer.prototype.getCellRendererInstances = function (params) {
        var res = this.getCellCtrls(params.rowNodes, params.columns)
            .map(function (cellCtrl) { return cellCtrl.getCellRenderer(); })
            .filter(function (renderer) { return renderer != null; });
        return res;
    };
    RowRenderer.prototype.getCellEditorInstances = function (params) {
        var res = [];
        this.getCellCtrls(params.rowNodes, params.columns).forEach(function (cellCtrl) {
            var cellEditor = cellCtrl.getCellEditor();
            if (cellEditor) {
                res.push(cellEditor);
            }
        });
        return res;
    };
    RowRenderer.prototype.getEditingCells = function () {
        var res = [];
        this.getAllCellCtrls().forEach(function (cellCtrl) {
            if (cellCtrl.isEditing()) {
                var cellPosition = cellCtrl.getCellPosition();
                res.push(cellPosition);
            }
        });
        return res;
    };
    // returns CellCtrl's that match the provided rowNodes and columns. eg if one row node
    // and two columns provided, that identifies 4 cells, so 4 CellCtrl's returned.
    RowRenderer.prototype.getCellCtrls = function (rowNodes, columns) {
        var _this = this;
        var rowIdsMap;
        var res = [];
        if (exists(rowNodes)) {
            rowIdsMap = {
                top: {},
                bottom: {},
                normal: {}
            };
            rowNodes.forEach(function (rowNode) {
                var id = rowNode.id;
                if (rowNode.rowPinned === Constants.PINNED_TOP) {
                    rowIdsMap.top[id] = true;
                }
                else if (rowNode.rowPinned === Constants.PINNED_BOTTOM) {
                    rowIdsMap.bottom[id] = true;
                }
                else {
                    rowIdsMap.normal[id] = true;
                }
            });
        }
        var colIdsMap;
        if (exists(columns)) {
            colIdsMap = {};
            columns.forEach(function (colKey) {
                var column = _this.columnModel.getGridColumn(colKey);
                if (exists(column)) {
                    colIdsMap[column.getId()] = true;
                }
            });
        }
        var processRow = function (rowComp) {
            var rowNode = rowComp.getRowNode();
            var id = rowNode.id;
            var floating = rowNode.rowPinned;
            // skip this row if it is missing from the provided list
            if (exists(rowIdsMap)) {
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
            rowComp.getAllCellCtrls().forEach(function (cellCtrl) {
                var colId = cellCtrl.getColumn().getId();
                var excludeColFromRefresh = colIdsMap && !colIdsMap[colId];
                if (excludeColFromRefresh) {
                    return;
                }
                res.push(cellCtrl);
            });
        };
        iterateObject(this.rowCtrlsByRowIndex, function (index, rowComp) {
            processRow(rowComp);
        });
        if (this.topRowCtrls) {
            this.topRowCtrls.forEach(processRow);
        }
        if (this.bottomRowCtrls) {
            this.bottomRowCtrls.forEach(processRow);
        }
        return res;
    };
    RowRenderer.prototype.destroy = function () {
        this.removeAllRowComps();
        _super.prototype.destroy.call(this);
    };
    RowRenderer.prototype.removeAllRowComps = function () {
        var rowIndexesToRemove = Object.keys(this.rowCtrlsByRowIndex);
        this.removeRowCtrls(rowIndexesToRemove);
    };
    RowRenderer.prototype.recycleRows = function () {
        // remove all stub nodes, they can't be reused, as no rowNode id
        var stubNodeIndexes = [];
        iterateObject(this.rowCtrlsByRowIndex, function (index, rowComp) {
            var stubNode = rowComp.getRowNode().id == null;
            if (stubNode) {
                stubNodeIndexes.push(index);
            }
        });
        this.removeRowCtrls(stubNodeIndexes);
        // then clear out rowCompsByIndex, but before that take a copy, but index by id, not rowIndex
        var nodesByIdMap = {};
        iterateObject(this.rowCtrlsByRowIndex, function (index, rowComp) {
            var rowNode = rowComp.getRowNode();
            nodesByIdMap[rowNode.id] = rowComp;
        });
        this.rowCtrlsByRowIndex = {};
        return nodesByIdMap;
    };
    // takes array of row indexes
    RowRenderer.prototype.removeRowCtrls = function (rowsToRemove) {
        var _this = this;
        // if no fromIndex then set to -1, which will refresh everything
        // let realFromIndex = -1;
        rowsToRemove.forEach(function (indexToRemove) {
            var rowCtrl = _this.rowCtrlsByRowIndex[indexToRemove];
            if (rowCtrl) {
                rowCtrl.destroyFirstPass();
                rowCtrl.destroySecondPass();
            }
            delete _this.rowCtrlsByRowIndex[indexToRemove];
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
        this.dispatchDisplayedRowsChanged();
    };
    RowRenderer.prototype.removeRowCompsNotToDraw = function (indexesToDraw) {
        // for speedy lookup, dump into map
        var indexesToDrawMap = {};
        indexesToDraw.forEach(function (index) { return (indexesToDrawMap[index] = true); });
        var existingIndexes = Object.keys(this.rowCtrlsByRowIndex);
        var indexesNotToDraw = existingIndexes.filter(function (index) { return !indexesToDrawMap[index]; });
        this.removeRowCtrls(indexesNotToDraw);
    };
    RowRenderer.prototype.calculateIndexesToDraw = function (rowsToRecycle) {
        var _this = this;
        // all in all indexes in the viewport
        var indexesToDraw = createArrayOfNumbers(this.firstRenderedRow, this.lastRenderedRow);
        var checkRowToDraw = function (indexStr, rowComp) {
            var index = rowComp.getRowNode().rowIndex;
            if (index == null) {
                return;
            }
            if (index < _this.firstRenderedRow || index > _this.lastRenderedRow) {
                if (_this.doNotUnVirtualiseRow(rowComp)) {
                    indexesToDraw.push(index);
                }
            }
        };
        // if we are redrawing due to scrolling change, then old rows are in this.rowCompsByIndex
        iterateObject(this.rowCtrlsByRowIndex, checkRowToDraw);
        // if we are redrawing due to model update, then old rows are in rowsToRecycle
        iterateObject(rowsToRecycle, checkRowToDraw);
        indexesToDraw.sort(function (a, b) { return a - b; });
        return indexesToDraw;
    };
    RowRenderer.prototype.redraw = function (rowsToRecycle, animate, afterScroll) {
        var _this = this;
        if (animate === void 0) { animate = false; }
        if (afterScroll === void 0) { afterScroll = false; }
        this.rowContainerHeightService.updateOffset();
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
        var rowCtrls = [];
        indexesToDraw.forEach(function (rowIndex) {
            var rowCtrl = _this.createOrUpdateRowCtrl(rowIndex, rowsToRecycle, animate, afterScroll);
            if (exists(rowCtrl)) {
                rowCtrls.push(rowCtrl);
            }
        });
        if (rowsToRecycle) {
            var useAnimationFrame = afterScroll && !this.gridOptionsWrapper.isSuppressAnimationFrame() && !this.printLayout;
            if (useAnimationFrame) {
                this.beans.taskQueue.addDestroyTask(function () {
                    _this.destroyRowCtrls(rowsToRecycle, animate);
                    _this.updateAllRowCtrls();
                    _this.dispatchDisplayedRowsChanged();
                });
            }
            else {
                this.destroyRowCtrls(rowsToRecycle, animate);
            }
        }
        this.updateAllRowCtrls();
        this.checkAngularCompile();
        this.gridBodyCtrl.updateRowCount();
    };
    RowRenderer.prototype.dispatchDisplayedRowsChanged = function () {
        var event = { type: Events.EVENT_DISPLAYED_ROWS_CHANGED };
        this.eventService.dispatchEvent(event);
    };
    RowRenderer.prototype.onDisplayedColumnsChanged = function () {
        var pinningLeft = this.columnModel.isPinningLeft();
        var pinningRight = this.columnModel.isPinningRight();
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
        iterateObject(this.rowCtrlsByRowIndex, function (id, rowComp) {
            if (rowComp.isFullWidth()) {
                var rowIndex = rowComp.getRowNode().rowIndex;
                rowsToRemove.push(rowIndex.toString());
            }
        });
        this.refreshFloatingRowComps();
        this.removeRowCtrls(rowsToRemove);
        this.redrawAfterScroll();
    };
    RowRenderer.prototype.refreshFullWidthRows = function (rowNodesToRefresh) {
        var rowsToRemove = [];
        var selectivelyRefreshing = !!rowNodesToRefresh;
        var idsToRefresh = selectivelyRefreshing ? {} : undefined;
        if (selectivelyRefreshing && idsToRefresh) {
            rowNodesToRefresh.forEach(function (r) { return idsToRefresh[r.id] = true; });
        }
        iterateObject(this.rowCtrlsByRowIndex, function (id, rowCtrl) {
            if (!rowCtrl.isFullWidth()) {
                return;
            }
            var rowNode = rowCtrl.getRowNode();
            if (selectivelyRefreshing && idsToRefresh) {
                // we refresh if a) this node is present or b) this parents nodes is present. checking parent
                // node is important for master/detail, as we want detail to refresh on changes to parent node.
                // it's also possible, if user is provider their own fullWidth, that details panels contain
                // some info on the parent, eg if in tree data and child row shows some data from parent row also.
                var parentId = (rowNode.level > 0 && rowNode.parent) ? rowNode.parent.id : undefined;
                var skipThisNode = !idsToRefresh[rowNode.id] && !idsToRefresh[parentId];
                if (skipThisNode) {
                    return;
                }
            }
            var fullWidthRowsRefreshed = rowCtrl.refreshFullWidth();
            if (!fullWidthRowsRefreshed) {
                var rowIndex = rowCtrl.getRowNode().rowIndex;
                rowsToRemove.push(rowIndex.toString());
            }
        });
        this.removeRowCtrls(rowsToRemove);
        this.redrawAfterScroll();
    };
    RowRenderer.prototype.createOrUpdateRowCtrl = function (rowIndex, rowsToRecycle, animate, afterScroll) {
        var rowNode;
        var rowCon = this.rowCtrlsByRowIndex[rowIndex];
        // if no row comp, see if we can get it from the previous rowComps
        if (!rowCon) {
            rowNode = this.paginationProxy.getRow(rowIndex);
            if (exists(rowNode) && exists(rowsToRecycle) && rowsToRecycle[rowNode.id] && rowNode.alreadyRendered) {
                rowCon = rowsToRecycle[rowNode.id];
                rowsToRecycle[rowNode.id] = null;
            }
        }
        var creatingNewRowCon = !rowCon;
        if (creatingNewRowCon) {
            // create a new one
            if (!rowNode) {
                rowNode = this.paginationProxy.getRow(rowIndex);
            }
            if (exists(rowNode)) {
                rowCon = this.createRowCon(rowNode, animate, afterScroll);
            }
            else {
                // this should never happen - if somehow we are trying to create
                // a row for a rowNode that does not exist.
                return;
            }
        }
        if (rowNode) {
            // set node as 'alreadyRendered' to ensure we only recycle rowComps that have been rendered, this ensures
            // we don't reuse rowComps that have been removed and then re-added in the same batch transaction.
            rowNode.alreadyRendered = true;
        }
        this.rowCtrlsByRowIndex[rowIndex] = rowCon;
        return rowCon;
    };
    RowRenderer.prototype.destroyRowCtrls = function (rowCtrlsMap, animate) {
        var _this = this;
        var executeInAWhileFuncs = [];
        iterateObject(rowCtrlsMap, function (nodeId, rowCtrl) {
            // if row was used, then it's null
            if (!rowCtrl) {
                return;
            }
            if (_this.cachedRowCtrls && rowCtrl.isCacheable()) {
                _this.cachedRowCtrls.addRow(rowCtrl);
                return;
            }
            rowCtrl.destroyFirstPass();
            if (animate) {
                _this.zombieRowCtrls[rowCtrl.getInstanceId()] = rowCtrl;
                executeInAWhileFuncs.push(function () {
                    rowCtrl.destroySecondPass();
                    delete _this.zombieRowCtrls[rowCtrl.getInstanceId()];
                });
            }
            else {
                rowCtrl.destroySecondPass();
            }
        });
        if (animate) {
            // this ensures we fire displayedRowsChanged AFTER all the 'executeInAWhileFuncs' get
            // executed, as we added it to the end of the list.
            executeInAWhileFuncs.push(function () {
                _this.updateAllRowCtrls();
                _this.dispatchDisplayedRowsChanged();
            });
            executeInAWhile(executeInAWhileFuncs);
        }
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
            var bufferPixels = this.gridOptionsWrapper.getRowBufferInPixels();
            var gridBodyCon = this.ctrlsService.getGridBodyCtrl();
            var rowHeightsChanged = false;
            var firstPixel = void 0;
            var lastPixel = void 0;
            do {
                var paginationOffset = this.paginationProxy.getPixelOffset();
                var _a = this.paginationProxy.getCurrentPagePixelRange(), pageFirstPixel = _a.pageFirstPixel, pageLastPixel = _a.pageLastPixel;
                var divStretchOffset = this.rowContainerHeightService.getDivStretchOffset();
                var bodyVRange = gridBodyCon.getScrollFeature().getVScrollPosition();
                var bodyTopPixel = bodyVRange.top;
                var bodyBottomPixel = bodyVRange.bottom;
                firstPixel = Math.max(bodyTopPixel + paginationOffset - bufferPixels, pageFirstPixel) + divStretchOffset;
                lastPixel = Math.min(bodyBottomPixel + paginationOffset + bufferPixels, pageLastPixel) + divStretchOffset;
                // if the rows we are about to display get their heights changed, then that upsets the calcs from above.
                rowHeightsChanged = this.ensureAllRowsInRangeHaveHeightsCalculated(firstPixel, lastPixel);
            } while (rowHeightsChanged);
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
        var res = this.paginationProxy.ensureRowHeightsValid(topPixel, bottomPixel, -1, -1);
        if (res) {
            this.updateContainerHeights();
        }
        return res;
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
        var rowHasFocus = this.focusService.isRowNodeFocused(rowNode);
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
    RowRenderer.prototype.createRowCon = function (rowNode, animate, afterScroll) {
        var rowCtrlFromCache = this.cachedRowCtrls ? this.cachedRowCtrls.getRow(rowNode) : null;
        if (rowCtrlFromCache) {
            return rowCtrlFromCache;
        }
        // we don't use animations frames for printing, so the user can put the grid into print mode
        // and immediately print - otherwise the user would have to wait for the rows to draw in the background
        // (via the animation frames) which is awkward to do from code.
        // we only do the animation frames after scrolling, as this is where we want the smooth user experience.
        // having animation frames for other times makes the grid look 'jumpy'.
        var suppressAnimationFrame = this.gridOptionsWrapper.isSuppressAnimationFrame();
        var useAnimationFrameForCreate = afterScroll && !suppressAnimationFrame && !this.printLayout;
        var res = new RowCtrl(this.$scope, rowNode, this.beans, animate, useAnimationFrameForCreate, this.printLayout);
        return res;
    };
    RowRenderer.prototype.getRenderedNodes = function () {
        var renderedRows = this.rowCtrlsByRowIndex;
        return Object.keys(renderedRows).map(function (key) { return renderedRows[key].getRowNode(); });
    };
    RowRenderer.prototype.getRowByPosition = function (rowPosition) {
        var rowComponent;
        switch (rowPosition.rowPinned) {
            case Constants.PINNED_TOP:
                rowComponent = this.topRowCtrls[rowPosition.rowIndex];
                break;
            case Constants.PINNED_BOTTOM:
                rowComponent = this.bottomRowCtrls[rowPosition.rowIndex];
                break;
            default:
                rowComponent = this.rowCtrlsByRowIndex[rowPosition.rowIndex];
                break;
        }
        return rowComponent;
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
    // returns true if any row between startIndex and endIndex is rendered. used by
    // SSRM or IRM, as they don't want to purge visible blocks from cache.
    RowRenderer.prototype.isRangeInRenderedViewport = function (startIndex, endIndex) {
        // parent closed means the parent node is not expanded, thus these blocks are not visible
        var parentClosed = startIndex == null || endIndex == null;
        if (parentClosed) {
            return false;
        }
        var blockAfterViewport = startIndex > this.lastRenderedRow;
        var blockBeforeViewport = endIndex < this.firstRenderedRow;
        var blockInsideViewport = !blockBeforeViewport && !blockAfterViewport;
        return blockInsideViewport;
    };
    __decorate([
        Autowired("paginationProxy")
    ], RowRenderer.prototype, "paginationProxy", void 0);
    __decorate([
        Autowired("columnModel")
    ], RowRenderer.prototype, "columnModel", void 0);
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
        Autowired("focusService")
    ], RowRenderer.prototype, "focusService", void 0);
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
        Autowired("rowContainerHeightService")
    ], RowRenderer.prototype, "rowContainerHeightService", void 0);
    __decorate([
        Optional("ctrlsService")
    ], RowRenderer.prototype, "ctrlsService", void 0);
    __decorate([
        PostConstruct
    ], RowRenderer.prototype, "postConstruct", null);
    RowRenderer = __decorate([
        Bean("rowRenderer")
    ], RowRenderer);
    return RowRenderer;
}(BeanStub));
export { RowRenderer };
var RowCtrlCache = /** @class */ (function () {
    function RowCtrlCache(maxCount) {
        // map for fast access
        this.entriesMap = {};
        // list for keeping order
        this.entriesList = [];
        this.maxCount = maxCount;
    }
    RowCtrlCache.prototype.toString = function () {
        return this.entriesList.map(function (item) { return item.getRowNode().data.name; }).join(', ');
    };
    RowCtrlCache.prototype.addRow = function (rowCtrl) {
        this.entriesMap[rowCtrl.getRowNode().id] = rowCtrl;
        this.entriesList.push(rowCtrl);
        rowCtrl.setCached(true);
        if (this.entriesList.length > this.maxCount) {
            var rowCtrlToDestroy = this.entriesList[0];
            rowCtrlToDestroy.destroyFirstPass();
            rowCtrlToDestroy.destroySecondPass();
            this.removeFromCache(rowCtrlToDestroy);
        }
    };
    RowCtrlCache.prototype.getRow = function (rowNode) {
        if (rowNode == null || rowNode.id == null) {
            return null;
        }
        var res = this.entriesMap[rowNode.id];
        if (!res) {
            return null;
        }
        this.removeFromCache(res);
        res.setCached(false);
        // this can happen if user reloads data, and a new RowNode is reusing
        // the same ID as the old one
        var rowNodeMismatch = res.getRowNode() != rowNode;
        return rowNodeMismatch ? null : res;
    };
    RowCtrlCache.prototype.removeFromCache = function (rowCtrl) {
        var rowNodeId = rowCtrl.getRowNode().id;
        delete this.entriesMap[rowNodeId];
        removeFromArray(this.entriesList, rowCtrl);
    };
    RowCtrlCache.prototype.getEntries = function () {
        return this.entriesList;
    };
    return RowCtrlCache;
}());
