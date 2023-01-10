/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowRenderer = void 0;
var rowCtrl_1 = require("./row/rowCtrl");
var events_1 = require("../events");
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var generic_1 = require("../utils/generic");
var object_1 = require("../utils/object");
var number_1 = require("../utils/number");
var function_1 = require("../utils/function");
var cellCtrl_1 = require("./cell/cellCtrl");
var array_1 = require("../utils/array");
var stickyRowFeature_1 = require("./features/stickyRowFeature");
var browser_1 = require("../utils/browser");
var DEFAULT_KEEP_DETAIL_ROW_COUNT = 10;
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
        _this.dataFirstRenderedFired = false;
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
        this.addManagedListener(this.eventService, events_1.Events.EVENT_PAGINATION_CHANGED, this.onPageLoaded.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_BODY_SCROLL, this.redrawAfterScroll.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_BODY_HEIGHT_CHANGED, this.redrawAfterScroll.bind(this));
        this.addManagedPropertyListener('domLayout', this.onDomLayoutChanged.bind(this));
        this.addManagedPropertyListener('rowClass', this.redrawRows.bind(this));
        if (this.gridOptionsService.is('groupRowsSticky')) {
            if (this.rowModel.getType() != 'clientSide') {
                function_1.doOnce(function () { return console.warn('AG Grid: The feature Sticky Row Groups only works with the Client Side Row Model'); }, 'rowRenderer.stickyWorksWithCsrmOnly');
            }
            else if (this.gridOptionsService.isTreeData()) {
                function_1.doOnce(function () { return console.warn('AG Grid: The feature Sticky Row Groups does not work with Tree Data.'); }, 'rowRenderer.stickyDoesNotWorkWithTreeData');
            }
            else {
                this.stickyRowFeature = this.createManagedBean(new stickyRowFeature_1.StickyRowFeature(this.createRowCon.bind(this), this.destroyRowCtrls.bind(this)));
            }
        }
        this.registerCellEventListeners();
        this.initialiseCache();
        this.printLayout = this.gridOptionsService.isDomLayout('print');
        this.embedFullWidthRows = this.printLayout || this.gridOptionsService.is('embedFullWidthRows');
        this.redrawAfterModelUpdate();
    };
    RowRenderer.prototype.initialiseCache = function () {
        if (this.gridOptionsService.is('keepDetailRows')) {
            var countProp = this.getKeepDetailRowsCount();
            var count = countProp != null ? countProp : 3;
            this.cachedRowCtrls = new RowCtrlCache(count);
        }
    };
    RowRenderer.prototype.getKeepDetailRowsCount = function () {
        var keepDetailRowsCount = this.gridOptionsService.getNum('keepDetailRowsCount');
        if (generic_1.exists(keepDetailRowsCount) && keepDetailRowsCount > 0) {
            return keepDetailRowsCount;
        }
        return DEFAULT_KEEP_DETAIL_ROW_COUNT;
    };
    RowRenderer.prototype.getRowCtrls = function () {
        return this.allRowCtrls;
    };
    RowRenderer.prototype.getStickyTopRowCtrls = function () {
        if (!this.stickyRowFeature) {
            return [];
        }
        return this.stickyRowFeature.getStickyRowCtrls();
    };
    RowRenderer.prototype.updateAllRowCtrls = function () {
        var liveList = object_1.getAllValuesInObject(this.rowCtrlsByRowIndex);
        var isEnsureDomOrder = this.gridOptionsService.is('ensureDomOrder');
        var isPrintLayout = this.gridOptionsService.isDomLayout('print');
        if (isEnsureDomOrder || isPrintLayout) {
            liveList.sort(function (a, b) { return a.getRowNode().rowIndex - b.getRowNode.rowIndex; });
        }
        var zombieList = object_1.getAllValuesInObject(this.zombieRowCtrls);
        var cachedList = this.cachedRowCtrls ? this.cachedRowCtrls.getEntries() : [];
        this.allRowCtrls = __spread(liveList, zombieList, cachedList);
    };
    // in a clean design, each cell would register for each of these events. however when scrolling, all the cells
    // registering and de-registering for events is a performance bottleneck. so we register here once and inform
    // all active cells.
    RowRenderer.prototype.registerCellEventListeners = function () {
        var _this = this;
        this.addManagedListener(this.eventService, events_1.Events.EVENT_CELL_FOCUSED, function (event) {
            _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.onCellFocused(event); });
            _this.getFullWidthRowCtrls().forEach(function (rowCtrl) {
                rowCtrl.onFullWidthRowFocused(event);
            });
        });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_FLASH_CELLS, function (event) {
            _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.onFlashCells(event); });
        });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_HOVER_CHANGED, function () {
            _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.onColumnHover(); });
        });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, function () {
            _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.onDisplayedColumnsChanged(); });
        });
        // only for printLayout - because we are rendering all the cells in the same row, regardless of pinned state,
        // then changing the width of the containers will impact left position. eg the center cols all have their
        // left position adjusted by the width of the left pinned column, so if the pinned left column width changes,
        // all the center cols need to be shifted to accommodate this. when in normal layout, the pinned cols are
        // in different containers so doesn't impact.
        this.addManagedListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, function () {
            if (_this.printLayout) {
                _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.onLeftChanged(); });
            }
        });
        var rangeSelectionEnabled = this.gridOptionsService.isEnableRangeSelection();
        if (rangeSelectionEnabled) {
            this.addManagedListener(this.eventService, events_1.Events.EVENT_RANGE_SELECTION_CHANGED, function () {
                _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.onRangeSelectionChanged(); });
            });
            this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_MOVED, function () {
                _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.updateRangeBordersIfRangeCount(); });
            });
            this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_PINNED, function () {
                _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.updateRangeBordersIfRangeCount(); });
            });
            this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_VISIBLE, function () {
                _this.getAllCellCtrls().forEach(function (cellCtrl) { return cellCtrl.updateRangeBordersIfRangeCount(); });
            });
        }
        // add listeners to the grid columns
        this.refreshListenersToColumnsForCellComps();
        // if the grid columns change, then refresh the listeners again
        this.addManagedListener(this.eventService, events_1.Events.EVENT_GRID_COLUMNS_CHANGED, this.refreshListenersToColumnsForCellComps.bind(this));
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
            var colDefChangedListener = function () {
                forEachCellWithThisCol(function (cellCtrl) { return cellCtrl.onColDefChanged(); });
            };
            col.addEventListener('leftChanged', leftChangedListener);
            col.addEventListener('widthChanged', widthChangedListener);
            col.addEventListener('firstRightPinnedChanged', firstRightPinnedChangedListener);
            col.addEventListener('lastLeftPinnedChanged', lastLeftPinnedChangedListener);
            col.addEventListener('colDefChanged', colDefChangedListener);
            _this.destroyFuncsForColumnListeners.push(function () {
                col.removeEventListener('leftChanged', leftChangedListener);
                col.removeEventListener('widthChanged', widthChangedListener);
                col.removeEventListener('firstRightPinnedChanged', firstRightPinnedChangedListener);
                col.removeEventListener('lastLeftPinnedChanged', lastLeftPinnedChangedListener);
                col.removeEventListener('colDefChanged', colDefChangedListener);
            });
        });
    };
    RowRenderer.prototype.onDomLayoutChanged = function () {
        var printLayout = this.gridOptionsService.isDomLayout('print');
        var embedFullWidthRows = printLayout || this.gridOptionsService.is('embedFullWidthRows');
        // if moving towards or away from print layout, means we need to destroy all rows, as rows are not laid
        // out using absolute positioning when doing print layout
        var destroyRows = embedFullWidthRows !== this.embedFullWidthRows || this.printLayout !== printLayout;
        this.printLayout = printLayout;
        this.embedFullWidthRows = embedFullWidthRows;
        if (destroyRows) {
            this.redrawAfterModelUpdate({ domLayoutChanged: true });
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
            var rowCtrl = new rowCtrl_1.RowCtrl(rowNode, _this.beans, false, false, _this.printLayout);
            rowComps.push(rowCtrl);
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
        if (generic_1.missing(rowNodes)) {
            return result;
        }
        object_1.iterateObject(this.rowCtrlsByRowIndex, function (index, renderedRow) {
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
        var focusedCell = (params === null || params === void 0 ? void 0 : params.suppressKeepFocus) ? null : this.focusService.getFocusCellToUseAfterRefresh();
        if (focusedCell == null) {
            return null;
        }
        // if the dom is not actually focused on a cell, then we don't try to refocus. the problem this
        // solves is with editing - if the user is editing, eg focus is on a text field, and not on the
        // cell itself, then the cell can be registered as having focus, however it's the text field that
        // has the focus and not the cell div. therefore, when the refresh is finished, the grid will focus
        // the cell, and not the textfield. that means if the user is in a text field, and the grid refreshes,
        // the focus is lost from the text field. we do not want this.
        var eDocument = this.gridOptionsService.getDocument();
        var activeElement = eDocument.activeElement;
        var cellDomData = this.gridOptionsService.getDomData(activeElement, cellCtrl_1.CellCtrl.DOM_DATA_KEY_CELL_CTRL);
        var rowDomData = this.gridOptionsService.getDomData(activeElement, rowCtrl_1.RowCtrl.DOM_DATA_KEY_ROW_CTRL);
        var gridElementFocused = cellDomData || rowDomData;
        return gridElementFocused ? focusedCell : null;
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
        // never recycle rows on layout change as rows could change from normal DOM layout
        // back to the grid's row positioning.
        var recycleRows = !params.domLayoutChanged && !!params.recycleRows;
        var animate = params.animate && this.gridOptionsService.isAnimateRows();
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
            object_1.iterateObject(rowsToRecycle, function (key, rowComp) {
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
        this.gridBodyCtrl.updateRowCount();
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
        var suppressScrollToTop = this.gridOptionsService.is('suppressScrollOnNewData');
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
                "this, put the API call into a timeout, e.g. instead of api.redrawRows(), " +
                "call setTimeout(function() { api.redrawRows(); }, 0). To see what part of your code " +
                "that caused the refresh check this stacktrace.");
        }
        this.refreshInProgress = true;
    };
    RowRenderer.prototype.releaseLockOnRefresh = function () {
        this.refreshInProgress = false;
    };
    RowRenderer.prototype.isRefreshInProgress = function () {
        return this.refreshInProgress;
    };
    // sets the focus to the provided cell, if the cell is provided. this way, the user can call refresh without
    // worry about the focus been lost. this is important when the user is using keyboard navigation to do edits
    // and the cellEditor is calling 'refresh' to get other cells to update (as other cells might depend on the
    // edited cell).
    RowRenderer.prototype.restoreFocusedCell = function (cellPosition) {
        if (cellPosition) {
            this.focusService.setFocusedCell({
                rowIndex: cellPosition.rowIndex,
                column: cellPosition.column,
                rowPinned: cellPosition.rowPinned,
                forceBrowserFocus: true,
                preventScrollOnBrowserFocus: true
            });
        }
    };
    RowRenderer.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        this.getAllRowCtrls().forEach(function (rowCtrl) {
            rowCtrl.stopEditing(cancel);
        });
    };
    RowRenderer.prototype.getAllCellCtrls = function () {
        var res = [];
        this.getAllRowCtrls().forEach(function (rowCtrl) { return res = res.concat(rowCtrl.getAllCellCtrls()); });
        return res;
    };
    RowRenderer.prototype.getAllRowCtrls = function () {
        var _this = this;
        var stickyRowCtrls = (this.stickyRowFeature && this.stickyRowFeature.getStickyRowCtrls()) || [];
        var res = __spread(this.topRowCtrls, this.bottomRowCtrls, stickyRowCtrls);
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
        this.getFullWidthRowCtrls(params.rowNodes).forEach(function (fullWidthRowCtrl) {
            fullWidthRowCtrl.refreshFullWidth();
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
    RowRenderer.prototype.mapRowNodes = function (rowNodes) {
        if (!rowNodes) {
            return;
        }
        var res = {
            top: {},
            bottom: {},
            normal: {}
        };
        rowNodes.forEach(function (rowNode) {
            var id = rowNode.id;
            if (rowNode.rowPinned === 'top') {
                res.top[id] = rowNode;
            }
            else if (rowNode.rowPinned === 'bottom') {
                res.bottom[id] = rowNode;
            }
            else {
                res.normal[id] = rowNode;
            }
        });
        return res;
    };
    RowRenderer.prototype.isRowInMap = function (rowNode, rowIdsMap) {
        // skip this row if it is missing from the provided list
        var id = rowNode.id;
        var floating = rowNode.rowPinned;
        if (floating === 'bottom') {
            return rowIdsMap.bottom[id] != null;
        }
        if (floating === 'top') {
            return rowIdsMap.top[id] != null;
        }
        return rowIdsMap.normal[id] != null;
    };
    // returns CellCtrl's that match the provided rowNodes and columns. eg if one row node
    // and two columns provided, that identifies 4 cells, so 4 CellCtrl's returned.
    RowRenderer.prototype.getCellCtrls = function (rowNodes, columns) {
        var _this = this;
        var rowIdsMap = this.mapRowNodes(rowNodes);
        var res = [];
        var colIdsMap;
        if (generic_1.exists(columns)) {
            colIdsMap = {};
            columns.forEach(function (colKey) {
                var column = _this.columnModel.getGridColumn(colKey);
                if (generic_1.exists(column)) {
                    colIdsMap[column.getId()] = true;
                }
            });
        }
        var processRow = function (rowComp) {
            var rowNode = rowComp.getRowNode();
            // skip this row if it is missing from the provided list
            if (rowIdsMap != null && !_this.isRowInMap(rowNode, rowIdsMap)) {
                return;
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
        object_1.iterateObject(this.rowCtrlsByRowIndex, function (index, rowComp) {
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
        object_1.iterateObject(this.rowCtrlsByRowIndex, function (index, rowComp) {
            var stubNode = rowComp.getRowNode().id == null;
            if (stubNode) {
                stubNodeIndexes.push(index);
            }
        });
        this.removeRowCtrls(stubNodeIndexes);
        // then clear out rowCompsByIndex, but before that take a copy, but index by id, not rowIndex
        var ctrlsByIdMap = {};
        object_1.iterateObject(this.rowCtrlsByRowIndex, function (index, rowComp) {
            var rowNode = rowComp.getRowNode();
            ctrlsByIdMap[rowNode.id] = rowComp;
        });
        this.rowCtrlsByRowIndex = {};
        return ctrlsByIdMap;
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
        var cellFocused;
        // only try to refocus cells shifting in and out of sticky container
        // if the browser supports focus ({ preventScroll })
        if (this.stickyRowFeature && browser_1.browserSupportsPreventScroll()) {
            cellFocused = this.getCellToRestoreFocusToAfterRefresh() || undefined;
        }
        this.getLockOnRefresh();
        this.redraw(null, false, true);
        this.releaseLockOnRefresh();
        this.dispatchDisplayedRowsChanged();
        if (cellFocused != null) {
            var newFocusedCell = this.getCellToRestoreFocusToAfterRefresh();
            if (cellFocused != null && newFocusedCell == null) {
                this.animationFrameService.flushAllFrames();
                this.restoreFocusedCell(cellFocused);
            }
        }
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
        var indexesToDraw = number_1.createArrayOfNumbers(this.firstRenderedRow, this.lastRenderedRow);
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
        object_1.iterateObject(this.rowCtrlsByRowIndex, checkRowToDraw);
        // if we are redrawing due to model update, then old rows are in rowsToRecycle
        object_1.iterateObject(rowsToRecycle, checkRowToDraw);
        indexesToDraw.sort(function (a, b) { return a - b; });
        indexesToDraw = indexesToDraw.filter(function (index) {
            var rowNode = _this.paginationProxy.getRow(index);
            return rowNode && !rowNode.sticky;
        });
        return indexesToDraw;
    };
    RowRenderer.prototype.redraw = function (rowsToRecycle, animate, afterScroll) {
        var _this = this;
        if (animate === void 0) { animate = false; }
        if (afterScroll === void 0) { afterScroll = false; }
        this.rowContainerHeightService.updateOffset();
        this.workOutFirstAndLastRowsToRender();
        if (this.stickyRowFeature) {
            this.stickyRowFeature.checkStickyRows();
        }
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
            if (generic_1.exists(rowCtrl)) {
                rowCtrls.push(rowCtrl);
            }
        });
        if (rowsToRecycle) {
            var useAnimationFrame = afterScroll && !this.gridOptionsService.is('suppressAnimationFrame') && !this.printLayout;
            if (useAnimationFrame) {
                this.beans.animationFrameService.addDestroyTask(function () {
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
    };
    RowRenderer.prototype.dispatchDisplayedRowsChanged = function () {
        var event = { type: events_1.Events.EVENT_DISPLAYED_ROWS_CHANGED };
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
        this.getFullWidthRowCtrls().forEach(function (fullWidthCtrl) {
            var rowIndex = fullWidthCtrl.getRowNode().rowIndex;
            rowsToRemove.push(rowIndex.toString());
        });
        this.refreshFloatingRowComps();
        this.removeRowCtrls(rowsToRemove);
        this.redrawAfterScroll();
    };
    RowRenderer.prototype.getFullWidthRowCtrls = function (rowNodes) {
        var _this = this;
        var rowNodesMap = this.mapRowNodes(rowNodes);
        return object_1.getAllValuesInObject(this.rowCtrlsByRowIndex).filter(function (rowCtrl) {
            // include just full width
            if (!rowCtrl.isFullWidth()) {
                return false;
            }
            // if Row Nodes provided, we exclude where Row Node is missing
            var rowNode = rowCtrl.getRowNode();
            if (rowNodesMap != null && !_this.isRowInMap(rowNode, rowNodesMap)) {
                return false;
            }
            return true;
        });
    };
    RowRenderer.prototype.refreshFullWidthRows = function (rowNodesToRefresh) {
        var rowsToRemove = [];
        var selectivelyRefreshing = !!rowNodesToRefresh;
        var idsToRefresh = selectivelyRefreshing ? {} : undefined;
        if (selectivelyRefreshing && idsToRefresh) {
            rowNodesToRefresh.forEach(function (r) { return idsToRefresh[r.id] = true; });
        }
        this.getFullWidthRowCtrls().forEach(function (fullWidthRowCtrl) {
            var rowNode = fullWidthRowCtrl.getRowNode();
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
            var fullWidthRowsRefreshed = fullWidthRowCtrl.refreshFullWidth();
            if (!fullWidthRowsRefreshed) {
                var rowIndex = fullWidthRowCtrl.getRowNode().rowIndex;
                rowsToRemove.push(rowIndex.toString());
            }
        });
        this.removeRowCtrls(rowsToRemove);
        this.redrawAfterScroll();
    };
    RowRenderer.prototype.createOrUpdateRowCtrl = function (rowIndex, rowsToRecycle, animate, afterScroll) {
        var rowNode;
        var rowCtrl = this.rowCtrlsByRowIndex[rowIndex];
        // if no row comp, see if we can get it from the previous rowComps
        if (!rowCtrl) {
            rowNode = this.paginationProxy.getRow(rowIndex);
            if (generic_1.exists(rowNode) && generic_1.exists(rowsToRecycle) && rowsToRecycle[rowNode.id] && rowNode.alreadyRendered) {
                rowCtrl = rowsToRecycle[rowNode.id];
                rowsToRecycle[rowNode.id] = null;
            }
        }
        var creatingNewRowCtrl = !rowCtrl;
        if (creatingNewRowCtrl) {
            // create a new one
            if (!rowNode) {
                rowNode = this.paginationProxy.getRow(rowIndex);
            }
            if (generic_1.exists(rowNode)) {
                rowCtrl = this.createRowCon(rowNode, animate, afterScroll);
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
        this.rowCtrlsByRowIndex[rowIndex] = rowCtrl;
        return rowCtrl;
    };
    RowRenderer.prototype.destroyRowCtrls = function (rowCtrlsMap, animate) {
        var _this = this;
        var executeInAWhileFuncs = [];
        object_1.iterateObject(rowCtrlsMap, function (nodeId, rowCtrl) {
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
            function_1.executeInAWhile(executeInAWhileFuncs);
        }
    };
    RowRenderer.prototype.getRowBuffer = function () {
        var rowBuffer = this.gridOptionsService.getNum('rowBuffer');
        if (typeof rowBuffer === 'number') {
            if (rowBuffer < 0) {
                function_1.doOnce(function () { return console.warn("AG Grid: rowBuffer should not be negative"); }, 'warn rowBuffer negative');
                rowBuffer = 0;
                this.gridOptionsService.set('rowBuffer', 0);
            }
        }
        else {
            rowBuffer = 10;
        }
        return rowBuffer;
    };
    RowRenderer.prototype.getRowBufferInPixels = function () {
        var rowsToBuffer = this.getRowBuffer();
        var defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        return rowsToBuffer * defaultRowHeight;
    };
    RowRenderer.prototype.workOutFirstAndLastRowsToRender = function () {
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
            var bufferPixels = this.getRowBufferInPixels();
            var gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
            var suppressRowVirtualisation = this.gridOptionsService.is('suppressRowVirtualisation');
            var rowHeightsChanged = false;
            var firstPixel = void 0;
            var lastPixel = void 0;
            do {
                var paginationOffset = this.paginationProxy.getPixelOffset();
                var _a = this.paginationProxy.getCurrentPagePixelRange(), pageFirstPixel = _a.pageFirstPixel, pageLastPixel = _a.pageLastPixel;
                var divStretchOffset = this.rowContainerHeightService.getDivStretchOffset();
                var bodyVRange = gridBodyCtrl.getScrollFeature().getVScrollPosition();
                var bodyTopPixel = bodyVRange.top;
                var bodyBottomPixel = bodyVRange.bottom;
                if (suppressRowVirtualisation) {
                    firstPixel = pageFirstPixel + divStretchOffset;
                    lastPixel = pageLastPixel + divStretchOffset;
                }
                else {
                    firstPixel = Math.max(bodyTopPixel + paginationOffset - bufferPixels, pageFirstPixel) + divStretchOffset;
                    lastPixel = Math.min(bodyBottomPixel + paginationOffset + bufferPixels, pageLastPixel) + divStretchOffset;
                }
                this.firstVisibleVPixel = Math.max(bodyTopPixel + paginationOffset, pageFirstPixel) + divStretchOffset;
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
        var rowLayoutNormal = this.gridOptionsService.isDomLayout('normal');
        var suppressRowCountRestriction = this.gridOptionsService.is('suppressMaxRenderedRowRestriction');
        var rowBufferMaxSize = Math.max(this.getRowBuffer(), 500);
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
                type: events_1.Events.EVENT_VIEWPORT_CHANGED,
                firstRow: newFirst,
                lastRow: newLast
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    /**
     * This event will only be fired once, and is queued until after the browser next renders.
     * This allows us to fire an event during the start of the render cycle, when we first see data being rendered
     * but not execute the event until all of the data has finished being rendered to the dom.
     */
    RowRenderer.prototype.dispatchFirstDataRenderedEvent = function () {
        var _this = this;
        if (this.dataFirstRenderedFired) {
            return;
        }
        this.dataFirstRenderedFired = true;
        var event = {
            type: events_1.Events.EVENT_FIRST_DATA_RENDERED,
            firstRow: this.firstRenderedRow,
            lastRow: this.lastRenderedRow,
        };
        // See AG-7018
        window.requestAnimationFrame(function () {
            _this.beans.eventService.dispatchEvent(event);
        });
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
    RowRenderer.prototype.getFirstVisibleVerticalPixel = function () {
        return this.firstVisibleVPixel;
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
        var suppressAnimationFrame = this.gridOptionsService.is('suppressAnimationFrame');
        var useAnimationFrameForCreate = afterScroll && !suppressAnimationFrame && !this.printLayout;
        var res = new rowCtrl_1.RowCtrl(rowNode, this.beans, animate, useAnimationFrameForCreate, this.printLayout);
        return res;
    };
    RowRenderer.prototype.getRenderedNodes = function () {
        var renderedRows = this.rowCtrlsByRowIndex;
        return Object.keys(renderedRows).map(function (key) { return renderedRows[key].getRowNode(); });
    };
    RowRenderer.prototype.getRowByPosition = function (rowPosition) {
        var rowCtrl;
        var rowIndex = rowPosition.rowIndex;
        switch (rowPosition.rowPinned) {
            case 'top':
                rowCtrl = this.topRowCtrls[rowIndex];
                break;
            case 'bottom':
                rowCtrl = this.bottomRowCtrls[rowIndex];
                break;
            default:
                rowCtrl = this.rowCtrlsByRowIndex[rowIndex];
                if (!rowCtrl) {
                    rowCtrl = this.getStickyTopRowCtrls().find(function (ctrl) { return ctrl.getRowNode().rowIndex === rowIndex; }) || null;
                }
                break;
        }
        return rowCtrl;
    };
    RowRenderer.prototype.getRowNode = function (gridRow) {
        switch (gridRow.rowPinned) {
            case 'top':
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case 'bottom':
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
        context_1.Autowired("animationFrameService")
    ], RowRenderer.prototype, "animationFrameService", void 0);
    __decorate([
        context_1.Autowired("paginationProxy")
    ], RowRenderer.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired("columnModel")
    ], RowRenderer.prototype, "columnModel", void 0);
    __decorate([
        context_1.Autowired("pinnedRowModel")
    ], RowRenderer.prototype, "pinnedRowModel", void 0);
    __decorate([
        context_1.Autowired("rowModel")
    ], RowRenderer.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired("focusService")
    ], RowRenderer.prototype, "focusService", void 0);
    __decorate([
        context_1.Autowired("beans")
    ], RowRenderer.prototype, "beans", void 0);
    __decorate([
        context_1.Autowired("rowContainerHeightService")
    ], RowRenderer.prototype, "rowContainerHeightService", void 0);
    __decorate([
        context_1.Autowired("ctrlsService")
    ], RowRenderer.prototype, "ctrlsService", void 0);
    __decorate([
        context_1.PostConstruct
    ], RowRenderer.prototype, "postConstruct", null);
    RowRenderer = __decorate([
        context_1.Bean("rowRenderer")
    ], RowRenderer);
    return RowRenderer;
}(beanStub_1.BeanStub));
exports.RowRenderer = RowRenderer;
var RowCtrlCache = /** @class */ (function () {
    function RowCtrlCache(maxCount) {
        // map for fast access
        this.entriesMap = {};
        // list for keeping order
        this.entriesList = [];
        this.maxCount = maxCount;
    }
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
        array_1.removeFromArray(this.entriesList, rowCtrl);
    };
    RowCtrlCache.prototype.getEntries = function () {
        return this.entriesList;
    };
    return RowCtrlCache;
}());
