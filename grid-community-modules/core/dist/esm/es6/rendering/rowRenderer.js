/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RowCtrl } from "./row/rowCtrl";
import { Events } from "../events";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { exists, missing } from "../utils/generic";
import { getAllValuesInObject, iterateObject } from "../utils/object";
import { createArrayOfNumbers } from "../utils/number";
import { doOnce, executeInAWhile } from "../utils/function";
import { CellCtrl } from "./cell/cellCtrl";
import { removeFromArray } from "../utils/array";
import { StickyRowFeature } from "./features/stickyRowFeature";
import { browserSupportsPreventScroll } from "../utils/browser";
const DEFAULT_KEEP_DETAIL_ROW_COUNT = 10;
let RowRenderer = class RowRenderer extends BeanStub {
    constructor() {
        super(...arguments);
        this.destroyFuncsForColumnListeners = [];
        // map of row ids to row objects. keeps track of which elements
        // are rendered for which rows in the dom.
        this.rowCtrlsByRowIndex = {};
        this.zombieRowCtrls = {};
        this.allRowCtrls = [];
        this.topRowCtrls = [];
        this.bottomRowCtrls = [];
        // we only allow one refresh at a time, otherwise the internal memory structure here
        // will get messed up. this can happen if the user has a cellRenderer, and inside the
        // renderer they call an API method that results in another pass of the refresh,
        // then it will be trying to draw rows in the middle of a refresh.
        this.refreshInProgress = false;
        this.dataFirstRenderedFired = false;
    }
    postConstruct() {
        this.ctrlsService.whenReady(() => {
            this.gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
            this.initialise();
        });
    }
    initialise() {
        this.addManagedListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onPageLoaded.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, this.onBodyScroll.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.redrawAfterScroll.bind(this));
        this.addManagedPropertyListener('domLayout', this.onDomLayoutChanged.bind(this));
        this.addManagedPropertyListener('rowClass', this.redrawRows.bind(this));
        if (this.gridOptionsService.is('groupRowsSticky')) {
            const rowModelType = this.rowModel.getType();
            if (rowModelType != 'clientSide' && rowModelType != 'serverSide') {
                doOnce(() => console.warn('AG Grid: The feature Sticky Row Groups only works with the Client Side or Server Side Row Model'), 'rowRenderer.stickyWorksWithCsrmOnly');
            }
            else {
                this.stickyRowFeature = this.createManagedBean(new StickyRowFeature(this.createRowCon.bind(this), this.destroyRowCtrls.bind(this)));
            }
        }
        this.registerCellEventListeners();
        this.initialiseCache();
        this.printLayout = this.gridOptionsService.isDomLayout('print');
        this.embedFullWidthRows = this.printLayout || this.gridOptionsService.is('embedFullWidthRows');
        this.redrawAfterModelUpdate();
    }
    initialiseCache() {
        if (this.gridOptionsService.is('keepDetailRows')) {
            const countProp = this.getKeepDetailRowsCount();
            const count = countProp != null ? countProp : 3;
            this.cachedRowCtrls = new RowCtrlCache(count);
        }
    }
    getKeepDetailRowsCount() {
        const keepDetailRowsCount = this.gridOptionsService.getNum('keepDetailRowsCount');
        if (exists(keepDetailRowsCount) && keepDetailRowsCount > 0) {
            return keepDetailRowsCount;
        }
        return DEFAULT_KEEP_DETAIL_ROW_COUNT;
    }
    getRowCtrls() {
        return this.allRowCtrls;
    }
    getStickyTopRowCtrls() {
        if (!this.stickyRowFeature) {
            return [];
        }
        return this.stickyRowFeature.getStickyRowCtrls();
    }
    updateAllRowCtrls() {
        const liveList = getAllValuesInObject(this.rowCtrlsByRowIndex);
        const isEnsureDomOrder = this.gridOptionsService.is('ensureDomOrder');
        const isPrintLayout = this.gridOptionsService.isDomLayout('print');
        if (isEnsureDomOrder || isPrintLayout) {
            liveList.sort((a, b) => a.getRowNode().rowIndex - b.getRowNode.rowIndex);
        }
        const zombieList = getAllValuesInObject(this.zombieRowCtrls);
        const cachedList = this.cachedRowCtrls ? this.cachedRowCtrls.getEntries() : [];
        this.allRowCtrls = [...liveList, ...zombieList, ...cachedList];
    }
    onCellFocusChanged(event) {
        this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.onCellFocused(event));
        this.getFullWidthRowCtrls().forEach(rowCtrl => rowCtrl.onFullWidthRowFocused(event));
    }
    // in a clean design, each cell would register for each of these events. however when scrolling, all the cells
    // registering and de-registering for events is a performance bottleneck. so we register here once and inform
    // all active cells.
    registerCellEventListeners() {
        this.addManagedListener(this.eventService, Events.EVENT_CELL_FOCUSED, (event) => {
            this.onCellFocusChanged(event);
        });
        this.addManagedListener(this.eventService, Events.EVENT_CELL_FOCUS_CLEARED, () => {
            this.onCellFocusChanged();
        });
        this.addManagedListener(this.eventService, Events.EVENT_FLASH_CELLS, event => {
            this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.onFlashCells(event));
        });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, () => {
            this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.onColumnHover());
        });
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, () => {
            this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.onDisplayedColumnsChanged());
        });
        // only for printLayout - because we are rendering all the cells in the same row, regardless of pinned state,
        // then changing the width of the containers will impact left position. eg the center cols all have their
        // left position adjusted by the width of the left pinned column, so if the pinned left column width changes,
        // all the center cols need to be shifted to accommodate this. when in normal layout, the pinned cols are
        // in different containers so doesn't impact.
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, () => {
            if (this.printLayout) {
                this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.onLeftChanged());
            }
        });
        const rangeSelectionEnabled = this.gridOptionsService.isEnableRangeSelection();
        if (rangeSelectionEnabled) {
            this.addManagedListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, () => {
                this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.onRangeSelectionChanged());
            });
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, () => {
                this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.updateRangeBordersIfRangeCount());
            });
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, () => {
                this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.updateRangeBordersIfRangeCount());
            });
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, () => {
                this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.updateRangeBordersIfRangeCount());
            });
        }
        // add listeners to the grid columns
        this.refreshListenersToColumnsForCellComps();
        // if the grid columns change, then refresh the listeners again
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.refreshListenersToColumnsForCellComps.bind(this));
        this.addDestroyFunc(this.removeGridColumnListeners.bind(this));
    }
    // executes all functions in destroyFuncsForColumnListeners and then clears the list
    removeGridColumnListeners() {
        this.destroyFuncsForColumnListeners.forEach(func => func());
        this.destroyFuncsForColumnListeners.length = 0;
    }
    // this function adds listeners onto all the grid columns, which are the column that we could have cellComps for.
    // when the grid columns change, we add listeners again. in an ideal design, each CellComp would just register to
    // the column it belongs to on creation, however this was a bottleneck with the number of cells, so do it here
    // once instead.
    refreshListenersToColumnsForCellComps() {
        this.removeGridColumnListeners();
        const cols = this.columnModel.getAllGridColumns();
        if (!cols) {
            return;
        }
        cols.forEach(col => {
            const forEachCellWithThisCol = (callback) => {
                this.getAllCellCtrls().forEach(cellCtrl => {
                    if (cellCtrl.getColumn() === col) {
                        callback(cellCtrl);
                    }
                });
            };
            const leftChangedListener = () => {
                forEachCellWithThisCol(cellCtrl => cellCtrl.onLeftChanged());
            };
            const widthChangedListener = () => {
                forEachCellWithThisCol(cellCtrl => cellCtrl.onWidthChanged());
            };
            const firstRightPinnedChangedListener = () => {
                forEachCellWithThisCol(cellCtrl => cellCtrl.onFirstRightPinnedChanged());
            };
            const lastLeftPinnedChangedListener = () => {
                forEachCellWithThisCol(cellCtrl => cellCtrl.onLastLeftPinnedChanged());
            };
            const colDefChangedListener = () => {
                forEachCellWithThisCol(cellCtrl => cellCtrl.onColDefChanged());
            };
            col.addEventListener('leftChanged', leftChangedListener);
            col.addEventListener('widthChanged', widthChangedListener);
            col.addEventListener('firstRightPinnedChanged', firstRightPinnedChangedListener);
            col.addEventListener('lastLeftPinnedChanged', lastLeftPinnedChangedListener);
            col.addEventListener('colDefChanged', colDefChangedListener);
            this.destroyFuncsForColumnListeners.push(() => {
                col.removeEventListener('leftChanged', leftChangedListener);
                col.removeEventListener('widthChanged', widthChangedListener);
                col.removeEventListener('firstRightPinnedChanged', firstRightPinnedChangedListener);
                col.removeEventListener('lastLeftPinnedChanged', lastLeftPinnedChangedListener);
                col.removeEventListener('colDefChanged', colDefChangedListener);
            });
        });
    }
    onDomLayoutChanged() {
        const printLayout = this.gridOptionsService.isDomLayout('print');
        const embedFullWidthRows = printLayout || this.gridOptionsService.is('embedFullWidthRows');
        // if moving towards or away from print layout, means we need to destroy all rows, as rows are not laid
        // out using absolute positioning when doing print layout
        const destroyRows = embedFullWidthRows !== this.embedFullWidthRows || this.printLayout !== printLayout;
        this.printLayout = printLayout;
        this.embedFullWidthRows = embedFullWidthRows;
        if (destroyRows) {
            this.redrawAfterModelUpdate({ domLayoutChanged: true });
        }
    }
    // for row models that have datasources, when we update the datasource, we need to force the rowRenderer
    // to redraw all rows. otherwise the old rows from the old datasource will stay displayed.
    datasourceChanged() {
        this.firstRenderedRow = 0;
        this.lastRenderedRow = -1;
        const rowIndexesToRemove = Object.keys(this.rowCtrlsByRowIndex);
        this.removeRowCtrls(rowIndexesToRemove);
    }
    onPageLoaded(event) {
        const params = {
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
    }
    getAllCellsForColumn(column) {
        const res = [];
        this.getAllRowCtrls().forEach(rowCtrl => {
            const eCell = rowCtrl.getCellElement(column);
            if (eCell) {
                res.push(eCell);
            }
        });
        return res;
    }
    refreshFloatingRowComps() {
        this.refreshFloatingRows(this.topRowCtrls, this.pinnedRowModel.getPinnedTopRowData());
        this.refreshFloatingRows(this.bottomRowCtrls, this.pinnedRowModel.getPinnedBottomRowData());
    }
    getTopRowCtrls() {
        return this.topRowCtrls;
    }
    getBottomRowCtrls() {
        return this.bottomRowCtrls;
    }
    refreshFloatingRows(rowComps, rowNodes) {
        rowComps.forEach((row) => {
            row.destroyFirstPass();
            row.destroySecondPass();
        });
        rowComps.length = 0;
        if (!rowNodes) {
            return;
        }
        rowNodes.forEach(rowNode => {
            const rowCtrl = new RowCtrl(rowNode, this.beans, false, false, this.printLayout);
            rowComps.push(rowCtrl);
        });
    }
    onPinnedRowDataChanged() {
        // recycling rows in order to ensure cell editing is not cancelled
        const params = {
            recycleRows: true
        };
        this.redrawAfterModelUpdate(params);
    }
    // if the row nodes are not rendered, no index is returned
    getRenderedIndexesForRowNodes(rowNodes) {
        const result = [];
        if (missing(rowNodes)) {
            return result;
        }
        iterateObject(this.rowCtrlsByRowIndex, (index, renderedRow) => {
            const rowNode = renderedRow.getRowNode();
            if (rowNodes.indexOf(rowNode) >= 0) {
                result.push(index);
            }
        });
        return result;
    }
    redrawRows(rowNodes) {
        // if no row nodes provided, then refresh everything
        const partialRefresh = rowNodes != null && rowNodes.length > 0;
        if (partialRefresh) {
            const indexesToRemove = this.getRenderedIndexesForRowNodes(rowNodes);
            // remove the rows
            this.removeRowCtrls(indexesToRemove);
        }
        // add draw them again
        this.redrawAfterModelUpdate({
            recycleRows: partialRefresh
        });
    }
    getCellToRestoreFocusToAfterRefresh(params) {
        const focusedCell = (params === null || params === void 0 ? void 0 : params.suppressKeepFocus) ? null : this.focusService.getFocusCellToUseAfterRefresh();
        if (focusedCell == null) {
            return null;
        }
        // if the dom is not actually focused on a cell, then we don't try to refocus. the problem this
        // solves is with editing - if the user is editing, eg focus is on a text field, and not on the
        // cell itself, then the cell can be registered as having focus, however it's the text field that
        // has the focus and not the cell div. therefore, when the refresh is finished, the grid will focus
        // the cell, and not the textfield. that means if the user is in a text field, and the grid refreshes,
        // the focus is lost from the text field. we do not want this.
        const eDocument = this.gridOptionsService.getDocument();
        const activeElement = eDocument.activeElement;
        const cellDomData = this.gridOptionsService.getDomData(activeElement, CellCtrl.DOM_DATA_KEY_CELL_CTRL);
        const rowDomData = this.gridOptionsService.getDomData(activeElement, RowCtrl.DOM_DATA_KEY_ROW_CTRL);
        const gridElementFocused = cellDomData || rowDomData;
        return gridElementFocused ? focusedCell : null;
    }
    // gets called from:
    // +) initialisation (in registerGridComp) params = null
    // +) onDomLayoutChanged, params = null
    // +) onPageLoaded, recycleRows, animate, newData, newPage from event, onlyBody=true
    // +) onPinnedRowDataChanged, recycleRows = true
    // +) redrawRows (from Grid API), recycleRows = true/false
    redrawAfterModelUpdate(params = {}) {
        this.getLockOnRefresh();
        const focusedCell = this.getCellToRestoreFocusToAfterRefresh(params);
        this.updateContainerHeights();
        this.scrollToTopIfNewData(params);
        // never recycle rows on layout change as rows could change from normal DOM layout
        // back to the grid's row positioning.
        const recycleRows = !params.domLayoutChanged && !!params.recycleRows;
        const animate = params.animate && this.gridOptionsService.isAnimateRows();
        // after modelUpdate, row indexes can change, so we clear out the rowsByIndex map,
        // however we can reuse the rows, so we keep them but index by rowNode.id
        const rowsToRecycle = recycleRows ? this.recycleRows() : null;
        if (!recycleRows) {
            this.removeAllRowComps();
        }
        this.redraw(rowsToRecycle, animate);
        this.gridBodyCtrl.updateRowCount();
        if (!params.onlyBody) {
            this.refreshFloatingRowComps();
        }
        this.dispatchDisplayedRowsChanged();
        // if a cell was focused before, ensure focus now.
        if (focusedCell != null) {
            this.restoreFocusedCell(focusedCell);
        }
        this.releaseLockOnRefresh();
    }
    scrollToTopIfNewData(params) {
        const scrollToTop = params.newData || params.newPage;
        const suppressScrollToTop = this.gridOptionsService.is('suppressScrollOnNewData');
        if (scrollToTop && !suppressScrollToTop) {
            this.gridBodyCtrl.getScrollFeature().scrollToTop();
        }
    }
    updateContainerHeights() {
        // when doing print layout, we don't explicitly set height on the containers
        if (this.printLayout) {
            this.rowContainerHeightService.setModelHeight(null);
            return;
        }
        let containerHeight = this.paginationProxy.getCurrentPageHeight();
        // we need at least 1 pixel for the horizontal scroll to work. so if there are now rows,
        // we still want the scroll to be present, otherwise there would be no way to scroll the header
        // which might be needed us user wants to access columns
        // on the RHS - and if that was where the filter was that cause no rows to be presented, there
        // is no way to remove the filter.
        if (containerHeight === 0) {
            containerHeight = 1;
        }
        this.rowContainerHeightService.setModelHeight(containerHeight);
    }
    getLockOnRefresh() {
        if (this.refreshInProgress) {
            throw new Error("AG Grid: cannot get grid to draw rows when it is in the middle of drawing rows. " +
                "Your code probably called a grid API method while the grid was in the render stage. To overcome " +
                "this, put the API call into a timeout, e.g. instead of api.redrawRows(), " +
                "call setTimeout(function() { api.redrawRows(); }, 0). To see what part of your code " +
                "that caused the refresh check this stacktrace.");
        }
        this.refreshInProgress = true;
    }
    releaseLockOnRefresh() {
        this.refreshInProgress = false;
    }
    isRefreshInProgress() {
        return this.refreshInProgress;
    }
    // sets the focus to the provided cell, if the cell is provided. this way, the user can call refresh without
    // worry about the focus been lost. this is important when the user is using keyboard navigation to do edits
    // and the cellEditor is calling 'refresh' to get other cells to update (as other cells might depend on the
    // edited cell).
    restoreFocusedCell(cellPosition) {
        if (cellPosition) {
            // we don't wish to dispatch an event as the rowRenderer is not capable of changing the selected cell,
            // so we mock a change event for the full width rows and cells to ensure they update to the newly selected
            // state
            this.onCellFocusChanged({
                rowIndex: cellPosition.rowIndex,
                column: cellPosition.column,
                rowPinned: cellPosition.rowPinned,
                forceBrowserFocus: true,
                preventScrollOnBrowserFocus: true,
                api: this.beans.gridApi,
                columnApi: this.beans.columnApi,
                context: this.beans.gridOptionsService.context,
                type: 'mock',
            });
        }
    }
    stopEditing(cancel = false) {
        this.getAllRowCtrls().forEach(rowCtrl => {
            rowCtrl.stopEditing(cancel);
        });
    }
    getAllCellCtrls() {
        const res = [];
        const rowCtrls = this.getAllRowCtrls();
        const rowCtrlsLength = rowCtrls.length;
        for (let i = 0; i < rowCtrlsLength; i++) {
            const cellCtrls = rowCtrls[i].getAllCellCtrls();
            const cellCtrlsLength = cellCtrls.length;
            for (let j = 0; j < cellCtrlsLength; j++) {
                res.push(cellCtrls[j]);
            }
        }
        return res;
    }
    getAllRowCtrls() {
        const stickyRowCtrls = (this.stickyRowFeature && this.stickyRowFeature.getStickyRowCtrls()) || [];
        const res = [...this.topRowCtrls, ...this.bottomRowCtrls, ...stickyRowCtrls];
        for (const key of Object.keys(this.rowCtrlsByRowIndex)) {
            res.push(this.rowCtrlsByRowIndex[key]);
        }
        return res;
    }
    addRenderedRowListener(eventName, rowIndex, callback) {
        const rowComp = this.rowCtrlsByRowIndex[rowIndex];
        if (rowComp) {
            rowComp.addEventListener(eventName, callback);
        }
    }
    flashCells(params = {}) {
        const { flashDelay, fadeDelay } = params;
        this.getCellCtrls(params.rowNodes, params.columns)
            .forEach(cellCtrl => cellCtrl.flashCell({ flashDelay, fadeDelay }));
    }
    refreshCells(params = {}) {
        const refreshCellParams = {
            forceRefresh: params.force,
            newData: false,
            suppressFlash: params.suppressFlash
        };
        this.getCellCtrls(params.rowNodes, params.columns)
            .forEach(cellCtrl => {
            if (cellCtrl.refreshShouldDestroy()) {
                const rowCtrl = cellCtrl.getRowCtrl();
                if (rowCtrl) {
                    rowCtrl.refreshCell(cellCtrl);
                }
            }
            else {
                cellCtrl.refreshCell(refreshCellParams);
            }
        });
        this.getFullWidthRowCtrls(params.rowNodes).forEach(fullWidthRowCtrl => {
            fullWidthRowCtrl.refreshFullWidth();
        });
    }
    getCellRendererInstances(params) {
        var _a;
        const cellRenderers = this.getCellCtrls(params.rowNodes, params.columns)
            .map(cellCtrl => cellCtrl.getCellRenderer())
            .filter(renderer => renderer != null);
        if ((_a = params.columns) === null || _a === void 0 ? void 0 : _a.length) {
            return cellRenderers;
        }
        const fullWidthRenderers = [];
        const rowIdMap = this.mapRowNodes(params.rowNodes);
        this.getAllRowCtrls().forEach(rowCtrl => {
            if (rowIdMap && !this.isRowInMap(rowCtrl.getRowNode(), rowIdMap)) {
                return;
            }
            if (!rowCtrl.isFullWidth()) {
                return;
            }
            const fullWidthRenderer = rowCtrl.getFullWidthCellRenderer();
            if (fullWidthRenderer) {
                fullWidthRenderers.push(fullWidthRenderer);
            }
        });
        return [...fullWidthRenderers, ...cellRenderers];
    }
    getCellEditorInstances(params) {
        const res = [];
        this.getCellCtrls(params.rowNodes, params.columns).forEach(cellCtrl => {
            const cellEditor = cellCtrl.getCellEditor();
            if (cellEditor) {
                res.push(cellEditor);
            }
        });
        return res;
    }
    getEditingCells() {
        const res = [];
        this.getAllCellCtrls().forEach(cellCtrl => {
            if (cellCtrl.isEditing()) {
                const cellPosition = cellCtrl.getCellPosition();
                res.push(cellPosition);
            }
        });
        return res;
    }
    mapRowNodes(rowNodes) {
        if (!rowNodes) {
            return;
        }
        const res = {
            top: {},
            bottom: {},
            normal: {}
        };
        rowNodes.forEach(rowNode => {
            const id = rowNode.id;
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
    }
    isRowInMap(rowNode, rowIdsMap) {
        // skip this row if it is missing from the provided list
        const id = rowNode.id;
        const floating = rowNode.rowPinned;
        if (floating === 'bottom') {
            return rowIdsMap.bottom[id] != null;
        }
        if (floating === 'top') {
            return rowIdsMap.top[id] != null;
        }
        return rowIdsMap.normal[id] != null;
    }
    // returns CellCtrl's that match the provided rowNodes and columns. eg if one row node
    // and two columns provided, that identifies 4 cells, so 4 CellCtrl's returned.
    getCellCtrls(rowNodes, columns) {
        const rowIdsMap = this.mapRowNodes(rowNodes);
        const res = [];
        let colIdsMap;
        if (exists(columns)) {
            colIdsMap = {};
            columns.forEach((colKey) => {
                const column = this.columnModel.getGridColumn(colKey);
                if (exists(column)) {
                    colIdsMap[column.getId()] = true;
                }
            });
        }
        const processRow = (rowCtrl) => {
            const rowNode = rowCtrl.getRowNode();
            // skip this row if it is missing from the provided list
            if (rowIdsMap != null && !this.isRowInMap(rowNode, rowIdsMap)) {
                return;
            }
            rowCtrl.getAllCellCtrls().forEach(cellCtrl => {
                const colId = cellCtrl.getColumn().getId();
                const excludeColFromRefresh = colIdsMap && !colIdsMap[colId];
                if (excludeColFromRefresh) {
                    return;
                }
                res.push(cellCtrl);
            });
        };
        this.getAllRowCtrls().forEach(row => processRow(row));
        return res;
    }
    destroy() {
        this.removeAllRowComps();
        super.destroy();
    }
    removeAllRowComps() {
        const rowIndexesToRemove = Object.keys(this.rowCtrlsByRowIndex);
        this.removeRowCtrls(rowIndexesToRemove);
    }
    recycleRows() {
        // remove all stub nodes, they can't be reused, as no rowNode id
        const stubNodeIndexes = [];
        iterateObject(this.rowCtrlsByRowIndex, (index, rowComp) => {
            const stubNode = rowComp.getRowNode().id == null;
            if (stubNode) {
                stubNodeIndexes.push(index);
            }
        });
        this.removeRowCtrls(stubNodeIndexes);
        // then clear out rowCompsByIndex, but before that take a copy, but index by id, not rowIndex
        const ctrlsByIdMap = {};
        iterateObject(this.rowCtrlsByRowIndex, (index, rowComp) => {
            const rowNode = rowComp.getRowNode();
            ctrlsByIdMap[rowNode.id] = rowComp;
        });
        this.rowCtrlsByRowIndex = {};
        return ctrlsByIdMap;
    }
    // takes array of row indexes
    removeRowCtrls(rowsToRemove) {
        // if no fromIndex then set to -1, which will refresh everything
        // let realFromIndex = -1;
        rowsToRemove.forEach(indexToRemove => {
            const rowCtrl = this.rowCtrlsByRowIndex[indexToRemove];
            if (rowCtrl) {
                rowCtrl.destroyFirstPass();
                rowCtrl.destroySecondPass();
            }
            delete this.rowCtrlsByRowIndex[indexToRemove];
        });
    }
    onBodyScroll(e) {
        if (e.direction !== 'vertical') {
            return;
        }
        this.redrawAfterScroll();
    }
    // gets called when rows don't change, but viewport does, so after:
    // 1) height of grid body changes, ie number of displayed rows has changed
    // 2) grid scrolled to new position
    // 3) ensure index visible (which is a scroll)
    redrawAfterScroll() {
        let cellFocused;
        // only try to refocus cells shifting in and out of sticky container
        // if the browser supports focus ({ preventScroll })
        if (this.stickyRowFeature && browserSupportsPreventScroll()) {
            cellFocused = this.getCellToRestoreFocusToAfterRefresh() || undefined;
        }
        this.getLockOnRefresh();
        this.redraw(null, false, true);
        this.releaseLockOnRefresh();
        this.dispatchDisplayedRowsChanged(true);
        if (cellFocused != null) {
            const newFocusedCell = this.getCellToRestoreFocusToAfterRefresh();
            if (cellFocused != null && newFocusedCell == null) {
                this.animationFrameService.flushAllFrames();
                this.restoreFocusedCell(cellFocused);
            }
        }
    }
    removeRowCompsNotToDraw(indexesToDraw) {
        // for speedy lookup, dump into map
        const indexesToDrawMap = {};
        indexesToDraw.forEach(index => (indexesToDrawMap[index] = true));
        const existingIndexes = Object.keys(this.rowCtrlsByRowIndex);
        const indexesNotToDraw = existingIndexes.filter(index => !indexesToDrawMap[index]);
        this.removeRowCtrls(indexesNotToDraw);
    }
    calculateIndexesToDraw(rowsToRecycle) {
        // all in all indexes in the viewport
        let indexesToDraw = createArrayOfNumbers(this.firstRenderedRow, this.lastRenderedRow);
        const checkRowToDraw = (indexStr, rowComp) => {
            const index = rowComp.getRowNode().rowIndex;
            if (index == null) {
                return;
            }
            if (index < this.firstRenderedRow || index > this.lastRenderedRow) {
                if (this.doNotUnVirtualiseRow(rowComp)) {
                    indexesToDraw.push(index);
                }
            }
        };
        // if we are redrawing due to scrolling change, then old rows are in this.rowCompsByIndex
        iterateObject(this.rowCtrlsByRowIndex, checkRowToDraw);
        // if we are redrawing due to model update, then old rows are in rowsToRecycle
        iterateObject(rowsToRecycle, checkRowToDraw);
        indexesToDraw.sort((a, b) => a - b);
        indexesToDraw = indexesToDraw.filter(index => {
            const rowNode = this.paginationProxy.getRow(index);
            return rowNode && !rowNode.sticky;
        });
        return indexesToDraw;
    }
    redraw(rowsToRecycle, animate = false, afterScroll = false) {
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
        const indexesToDraw = this.calculateIndexesToDraw(rowsToRecycle);
        this.removeRowCompsNotToDraw(indexesToDraw);
        // never animate when doing print layout - as we want to get things ready to print as quickly as possible,
        // otherwise we risk the printer printing a row that's half faded (half way through fading in)
        if (this.printLayout) {
            animate = false;
        }
        // add in new rows
        const rowCtrls = [];
        indexesToDraw.forEach(rowIndex => {
            const rowCtrl = this.createOrUpdateRowCtrl(rowIndex, rowsToRecycle, animate, afterScroll);
            if (exists(rowCtrl)) {
                rowCtrls.push(rowCtrl);
            }
        });
        if (rowsToRecycle) {
            const useAnimationFrame = afterScroll && !this.gridOptionsService.is('suppressAnimationFrame') && !this.printLayout;
            if (useAnimationFrame) {
                this.beans.animationFrameService.addDestroyTask(() => {
                    this.destroyRowCtrls(rowsToRecycle, animate);
                    this.updateAllRowCtrls();
                    this.dispatchDisplayedRowsChanged();
                });
            }
            else {
                this.destroyRowCtrls(rowsToRecycle, animate);
            }
        }
        this.updateAllRowCtrls();
    }
    dispatchDisplayedRowsChanged(afterScroll = false) {
        const event = { type: Events.EVENT_DISPLAYED_ROWS_CHANGED, afterScroll };
        this.eventService.dispatchEvent(event);
    }
    onDisplayedColumnsChanged() {
        const pinningLeft = this.columnModel.isPinningLeft();
        const pinningRight = this.columnModel.isPinningRight();
        const atLeastOneChanged = this.pinningLeft !== pinningLeft || pinningRight !== this.pinningRight;
        if (atLeastOneChanged) {
            this.pinningLeft = pinningLeft;
            this.pinningRight = pinningRight;
            if (this.embedFullWidthRows) {
                this.redrawFullWidthEmbeddedRows();
            }
        }
    }
    // when embedding, what gets showed in each section depends on what is pinned. eg if embedding group expand / collapse,
    // then it should go into the pinned left area if pinning left, or the center area if not pinning.
    redrawFullWidthEmbeddedRows() {
        // if either of the pinned panels has shown / hidden, then need to redraw the fullWidth bits when
        // embedded, as what appears in each section depends on whether we are pinned or not
        const rowsToRemove = [];
        this.getFullWidthRowCtrls().forEach(fullWidthCtrl => {
            const rowIndex = fullWidthCtrl.getRowNode().rowIndex;
            rowsToRemove.push(rowIndex.toString());
        });
        this.refreshFloatingRowComps();
        this.removeRowCtrls(rowsToRemove);
        this.redrawAfterScroll();
    }
    getFullWidthRowCtrls(rowNodes) {
        const rowNodesMap = this.mapRowNodes(rowNodes);
        return this.getAllRowCtrls().filter((rowCtrl) => {
            // include just full width
            if (!rowCtrl.isFullWidth()) {
                return false;
            }
            // if Row Nodes provided, we exclude where Row Node is missing
            const rowNode = rowCtrl.getRowNode();
            if (rowNodesMap != null && !this.isRowInMap(rowNode, rowNodesMap)) {
                return false;
            }
            return true;
        });
    }
    refreshFullWidthRow(rowNode) {
        const fullWidthCtrl = this.getFullWidthRowCtrls().find(rowCtrl => rowCtrl.getRowNode() === rowNode);
        if (!fullWidthCtrl) {
            return;
        }
        const refreshed = fullWidthCtrl.refreshFullWidth();
        if (refreshed) {
            return;
        }
        if (rowNode.sticky) {
            this.stickyRowFeature.refreshStickyNode(rowNode);
        }
        else {
            this.removeRowCtrls([rowNode.rowIndex]);
        }
        this.redrawAfterScroll();
    }
    createOrUpdateRowCtrl(rowIndex, rowsToRecycle, animate, afterScroll) {
        let rowNode;
        let rowCtrl = this.rowCtrlsByRowIndex[rowIndex];
        // if no row comp, see if we can get it from the previous rowComps
        if (!rowCtrl) {
            rowNode = this.paginationProxy.getRow(rowIndex);
            if (exists(rowNode) && exists(rowsToRecycle) && rowsToRecycle[rowNode.id] && rowNode.alreadyRendered) {
                rowCtrl = rowsToRecycle[rowNode.id];
                rowsToRecycle[rowNode.id] = null;
            }
        }
        const creatingNewRowCtrl = !rowCtrl;
        if (creatingNewRowCtrl) {
            // create a new one
            if (!rowNode) {
                rowNode = this.paginationProxy.getRow(rowIndex);
            }
            if (exists(rowNode)) {
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
    }
    destroyRowCtrls(rowCtrlsMap, animate) {
        const executeInAWhileFuncs = [];
        iterateObject(rowCtrlsMap, (nodeId, rowCtrl) => {
            // if row was used, then it's null
            if (!rowCtrl) {
                return;
            }
            if (this.cachedRowCtrls && rowCtrl.isCacheable()) {
                this.cachedRowCtrls.addRow(rowCtrl);
                return;
            }
            rowCtrl.destroyFirstPass();
            if (animate) {
                this.zombieRowCtrls[rowCtrl.getInstanceId()] = rowCtrl;
                executeInAWhileFuncs.push(() => {
                    rowCtrl.destroySecondPass();
                    delete this.zombieRowCtrls[rowCtrl.getInstanceId()];
                });
            }
            else {
                rowCtrl.destroySecondPass();
            }
        });
        if (animate) {
            // this ensures we fire displayedRowsChanged AFTER all the 'executeInAWhileFuncs' get
            // executed, as we added it to the end of the list.
            executeInAWhileFuncs.push(() => {
                this.updateAllRowCtrls();
                this.dispatchDisplayedRowsChanged();
            });
            executeInAWhile(executeInAWhileFuncs);
        }
    }
    getRowBuffer() {
        let rowBuffer = this.gridOptionsService.getNum('rowBuffer');
        if (typeof rowBuffer === 'number') {
            if (rowBuffer < 0) {
                doOnce(() => console.warn(`AG Grid: rowBuffer should not be negative`), 'warn rowBuffer negative');
                rowBuffer = 0;
                this.gridOptionsService.set('rowBuffer', 0);
            }
        }
        else {
            rowBuffer = 10;
        }
        return rowBuffer;
    }
    getRowBufferInPixels() {
        const rowsToBuffer = this.getRowBuffer();
        const defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        return rowsToBuffer * defaultRowHeight;
    }
    workOutFirstAndLastRowsToRender() {
        let newFirst;
        let newLast;
        if (!this.paginationProxy.isRowsToRender()) {
            newFirst = 0;
            newLast = -1; // setting to -1 means nothing in range
        }
        else if (this.printLayout) {
            newFirst = this.paginationProxy.getPageFirstRow();
            newLast = this.paginationProxy.getPageLastRow();
        }
        else {
            const bufferPixels = this.getRowBufferInPixels();
            const gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
            const suppressRowVirtualisation = this.gridOptionsService.is('suppressRowVirtualisation');
            let rowHeightsChanged = false;
            let firstPixel;
            let lastPixel;
            do {
                const paginationOffset = this.paginationProxy.getPixelOffset();
                const { pageFirstPixel, pageLastPixel } = this.paginationProxy.getCurrentPagePixelRange();
                const divStretchOffset = this.rowContainerHeightService.getDivStretchOffset();
                const bodyVRange = gridBodyCtrl.getScrollFeature().getVScrollPosition();
                const bodyTopPixel = bodyVRange.top;
                const bodyBottomPixel = bodyVRange.bottom;
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
            let firstRowIndex = this.paginationProxy.getRowIndexAtPixel(firstPixel);
            let lastRowIndex = this.paginationProxy.getRowIndexAtPixel(lastPixel);
            const pageFirstRow = this.paginationProxy.getPageFirstRow();
            const pageLastRow = this.paginationProxy.getPageLastRow();
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
        const rowLayoutNormal = this.gridOptionsService.isDomLayout('normal');
        const suppressRowCountRestriction = this.gridOptionsService.is('suppressMaxRenderedRowRestriction');
        const rowBufferMaxSize = Math.max(this.getRowBuffer(), 500);
        if (rowLayoutNormal && !suppressRowCountRestriction) {
            if (newLast - newFirst > rowBufferMaxSize) {
                newLast = newFirst + rowBufferMaxSize;
            }
        }
        const firstDiffers = newFirst !== this.firstRenderedRow;
        const lastDiffers = newLast !== this.lastRenderedRow;
        if (firstDiffers || lastDiffers) {
            this.firstRenderedRow = newFirst;
            this.lastRenderedRow = newLast;
            const event = {
                type: Events.EVENT_VIEWPORT_CHANGED,
                firstRow: newFirst,
                lastRow: newLast
            };
            this.eventService.dispatchEvent(event);
        }
    }
    /**
     * This event will only be fired once, and is queued until after the browser next renders.
     * This allows us to fire an event during the start of the render cycle, when we first see data being rendered
     * but not execute the event until all of the data has finished being rendered to the dom.
     */
    dispatchFirstDataRenderedEvent() {
        if (this.dataFirstRenderedFired) {
            return;
        }
        this.dataFirstRenderedFired = true;
        const event = {
            type: Events.EVENT_FIRST_DATA_RENDERED,
            firstRow: this.firstRenderedRow,
            lastRow: this.lastRenderedRow,
        };
        // See AG-7018
        window.requestAnimationFrame(() => {
            this.beans.eventService.dispatchEvent(event);
        });
    }
    ensureAllRowsInRangeHaveHeightsCalculated(topPixel, bottomPixel) {
        // ensureRowHeightsVisible only works with CSRM, as it's the only row model that allows lazy row height calcs.
        // all the other row models just hard code so the method just returns back false
        const res = this.paginationProxy.ensureRowHeightsValid(topPixel, bottomPixel, -1, -1);
        if (res) {
            this.updateContainerHeights();
        }
        return res;
    }
    getFirstVisibleVerticalPixel() {
        return this.firstVisibleVPixel;
    }
    getFirstVirtualRenderedRow() {
        return this.firstRenderedRow;
    }
    getLastVirtualRenderedRow() {
        return this.lastRenderedRow;
    }
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
    doNotUnVirtualiseRow(rowComp) {
        const REMOVE_ROW = false;
        const KEEP_ROW = true;
        const rowNode = rowComp.getRowNode();
        const rowHasFocus = this.focusService.isRowNodeFocused(rowNode);
        const rowIsEditing = rowComp.isEditing();
        const rowIsDetail = rowNode.detail;
        const mightWantToKeepRow = rowHasFocus || rowIsEditing || rowIsDetail;
        // if we deffo don't want to keep it,
        if (!mightWantToKeepRow) {
            return REMOVE_ROW;
        }
        // editing row, only remove if it is no longer rendered, eg filtered out or new data set.
        // the reason we want to keep is if user is scrolling up and down, we don't want to loose
        // the context of the editing in process.
        const rowNodePresent = this.paginationProxy.isRowPresent(rowNode);
        return rowNodePresent ? KEEP_ROW : REMOVE_ROW;
    }
    createRowCon(rowNode, animate, afterScroll) {
        const rowCtrlFromCache = this.cachedRowCtrls ? this.cachedRowCtrls.getRow(rowNode) : null;
        if (rowCtrlFromCache) {
            return rowCtrlFromCache;
        }
        // we don't use animations frames for printing, so the user can put the grid into print mode
        // and immediately print - otherwise the user would have to wait for the rows to draw in the background
        // (via the animation frames) which is awkward to do from code.
        // we only do the animation frames after scrolling, as this is where we want the smooth user experience.
        // having animation frames for other times makes the grid look 'jumpy'.
        const suppressAnimationFrame = this.gridOptionsService.is('suppressAnimationFrame');
        const useAnimationFrameForCreate = afterScroll && !suppressAnimationFrame && !this.printLayout;
        const res = new RowCtrl(rowNode, this.beans, animate, useAnimationFrameForCreate, this.printLayout);
        return res;
    }
    getRenderedNodes() {
        const renderedRows = this.rowCtrlsByRowIndex;
        return Object.keys(renderedRows).map(key => renderedRows[key].getRowNode());
    }
    getRowByPosition(rowPosition) {
        let rowCtrl;
        const { rowIndex } = rowPosition;
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
                    rowCtrl = this.getStickyTopRowCtrls().find(ctrl => ctrl.getRowNode().rowIndex === rowIndex) || null;
                }
                break;
        }
        return rowCtrl;
    }
    getRowNode(gridRow) {
        switch (gridRow.rowPinned) {
            case 'top':
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case 'bottom':
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    }
    // returns true if any row between startIndex and endIndex is rendered. used by
    // SSRM or IRM, as they don't want to purge visible blocks from cache.
    isRangeInRenderedViewport(startIndex, endIndex) {
        // parent closed means the parent node is not expanded, thus these blocks are not visible
        const parentClosed = startIndex == null || endIndex == null;
        if (parentClosed) {
            return false;
        }
        const blockAfterViewport = startIndex > this.lastRenderedRow;
        const blockBeforeViewport = endIndex < this.firstRenderedRow;
        const blockInsideViewport = !blockBeforeViewport && !blockAfterViewport;
        return blockInsideViewport;
    }
};
__decorate([
    Autowired("animationFrameService")
], RowRenderer.prototype, "animationFrameService", void 0);
__decorate([
    Autowired("paginationProxy")
], RowRenderer.prototype, "paginationProxy", void 0);
__decorate([
    Autowired("columnModel")
], RowRenderer.prototype, "columnModel", void 0);
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
    Autowired("beans")
], RowRenderer.prototype, "beans", void 0);
__decorate([
    Autowired("rowContainerHeightService")
], RowRenderer.prototype, "rowContainerHeightService", void 0);
__decorate([
    Autowired("ctrlsService")
], RowRenderer.prototype, "ctrlsService", void 0);
__decorate([
    PostConstruct
], RowRenderer.prototype, "postConstruct", null);
RowRenderer = __decorate([
    Bean("rowRenderer")
], RowRenderer);
export { RowRenderer };
class RowCtrlCache {
    constructor(maxCount) {
        // map for fast access
        this.entriesMap = {};
        // list for keeping order
        this.entriesList = [];
        this.maxCount = maxCount;
    }
    addRow(rowCtrl) {
        this.entriesMap[rowCtrl.getRowNode().id] = rowCtrl;
        this.entriesList.push(rowCtrl);
        rowCtrl.setCached(true);
        if (this.entriesList.length > this.maxCount) {
            const rowCtrlToDestroy = this.entriesList[0];
            rowCtrlToDestroy.destroyFirstPass();
            rowCtrlToDestroy.destroySecondPass();
            this.removeFromCache(rowCtrlToDestroy);
        }
    }
    getRow(rowNode) {
        if (rowNode == null || rowNode.id == null) {
            return null;
        }
        const res = this.entriesMap[rowNode.id];
        if (!res) {
            return null;
        }
        this.removeFromCache(res);
        res.setCached(false);
        // this can happen if user reloads data, and a new RowNode is reusing
        // the same ID as the old one
        const rowNodeMismatch = res.getRowNode() != rowNode;
        return rowNodeMismatch ? null : res;
    }
    removeFromCache(rowCtrl) {
        const rowNodeId = rowCtrl.getRowNode().id;
        delete this.entriesMap[rowNodeId];
        removeFromArray(this.entriesList, rowCtrl);
    }
    getEntries() {
        return this.entriesList;
    }
}
