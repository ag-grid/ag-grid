/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnModel = void 0;
const columnGroup_1 = require("../entities/columnGroup");
const column_1 = require("../entities/column");
const events_1 = require("../events");
const beanStub_1 = require("../context/beanStub");
const providedColumnGroup_1 = require("../entities/providedColumnGroup");
const groupInstanceIdCreator_1 = require("./groupInstanceIdCreator");
const context_1 = require("../context/context");
const autoGroupColService_1 = require("./autoGroupColService");
const array_1 = require("../utils/array");
const generic_1 = require("../utils/generic");
const string_1 = require("../utils/string");
const map_1 = require("../utils/map");
const function_1 = require("../utils/function");
const gridOptionsValidator_1 = require("../gridOptionsValidator");
let ColumnModel = class ColumnModel extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        // header row count, based on user provided columns
        this.primaryHeaderRowCount = 0;
        this.secondaryHeaderRowCount = 0;
        // header row count, either above, or based on pivoting if we are pivoting
        this.gridHeaderRowCount = 0;
        // leave level columns of the displayed trees
        this.displayedColumnsLeft = [];
        this.displayedColumnsRight = [];
        this.displayedColumnsCenter = [];
        // all three lists above combined
        this.displayedColumns = [];
        // for fast lookup, to see if a column or group is still displayed
        this.displayedColumnsAndGroupsMap = {};
        // all columns to be rendered
        this.viewportColumns = [];
        // A hash key to keep track of changes in viewport columns
        this.viewportColumnsHash = '';
        // same as viewportColumns, except we always include columns with headerAutoHeight
        this.headerViewportColumns = [];
        // all columns to be rendered in the centre
        this.viewportColumnsCenter = [];
        // same as viewportColumnsCenter, except we always include columns with headerAutoHeight
        this.headerViewportColumnsCenter = [];
        this.autoHeightActiveAtLeastOnce = false;
        this.rowGroupColumns = [];
        this.valueColumns = [];
        this.pivotColumns = [];
        this.ready = false;
        this.autoGroupsNeedBuilding = false;
        this.forceRecreateAutoGroups = false;
        this.pivotMode = false;
        this.bodyWidth = 0;
        this.leftWidth = 0;
        this.rightWidth = 0;
        this.bodyWidthDirty = true;
        this.flexColsCalculatedAtLestOnce = false;
    }
    init() {
        this.suppressColumnVirtualisation = this.gridOptionsService.is('suppressColumnVirtualisation');
        const pivotMode = this.gridOptionsService.is('pivotMode');
        if (this.isPivotSettingAllowed(pivotMode)) {
            this.pivotMode = pivotMode;
        }
        this.usingTreeData = this.gridOptionsService.isTreeData();
        this.addManagedPropertyListener('groupDisplayType', () => this.onAutoGroupColumnDefChanged());
        this.addManagedPropertyListener('autoGroupColumnDef', () => this.onAutoGroupColumnDefChanged());
        this.addManagedPropertyListener('defaultColDef', (params) => this.onSharedColDefChanged(params.source));
        this.addManagedPropertyListener('columnTypes', (params) => this.onSharedColDefChanged(params.source));
    }
    onAutoGroupColumnDefChanged() {
        this.autoGroupsNeedBuilding = true;
        this.forceRecreateAutoGroups = true;
        this.updateGridColumns();
        this.updateDisplayedColumns('gridOptionsChanged');
    }
    onSharedColDefChanged(source = 'api') {
        // likewise for autoGroupCol, the default col def impacts this
        this.forceRecreateAutoGroups = true;
        this.createColumnsFromColumnDefs(true, source);
    }
    setColumnDefs(columnDefs, source = 'api') {
        const colsPreviouslyExisted = !!this.columnDefs;
        this.columnDefs = columnDefs;
        this.createColumnsFromColumnDefs(colsPreviouslyExisted, source);
    }
    destroyOldColumns(oldTree, newTree) {
        const oldObjectsById = {};
        if (!oldTree) {
            return;
        }
        // add in all old columns to be destroyed
        this.columnUtils.depthFirstOriginalTreeSearch(null, oldTree, child => {
            oldObjectsById[child.getInstanceId()] = child;
        });
        // however we don't destroy anything in the new tree. if destroying the grid, there is no new tree
        if (newTree) {
            this.columnUtils.depthFirstOriginalTreeSearch(null, newTree, child => {
                oldObjectsById[child.getInstanceId()] = null;
            });
        }
        // what's left can be destroyed
        const colsToDestroy = Object.values(oldObjectsById).filter(item => item != null);
        this.destroyBeans(colsToDestroy);
    }
    destroyColumns() {
        this.destroyOldColumns(this.primaryColumnTree);
        this.destroyOldColumns(this.secondaryBalancedTree);
        this.destroyOldColumns(this.groupAutoColsBalancedTree);
    }
    createColumnsFromColumnDefs(colsPreviouslyExisted, source = 'api') {
        // only need to dispatch before/after events if updating columns, never if setting columns for first time
        const dispatchEventsFunc = colsPreviouslyExisted ? this.compareColumnStatesAndDispatchEvents(source) : undefined;
        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.
        this.valueCache.expire();
        // NOTE ==================
        // we should be destroying the existing columns and groups if they exist, for example, the original column
        // group adds a listener to the columns, it should be also removing the listeners
        this.autoGroupsNeedBuilding = true;
        const oldPrimaryColumns = this.primaryColumns;
        const oldPrimaryTree = this.primaryColumnTree;
        const balancedTreeResult = this.columnFactory.createColumnTree(this.columnDefs, true, oldPrimaryTree);
        this.destroyOldColumns(this.primaryColumnTree, balancedTreeResult.columnTree);
        this.primaryColumnTree = balancedTreeResult.columnTree;
        this.primaryHeaderRowCount = balancedTreeResult.treeDept + 1;
        this.primaryColumns = this.getColumnsFromTree(this.primaryColumnTree);
        this.primaryColumnsMap = {};
        this.primaryColumns.forEach(col => this.primaryColumnsMap[col.getId()] = col);
        this.extractRowGroupColumns(source, oldPrimaryColumns);
        this.extractPivotColumns(source, oldPrimaryColumns);
        this.extractValueColumns(source, oldPrimaryColumns);
        this.ready = true;
        // if we are showing secondary columns, then no need to update grid columns
        // at this point, as it's the pivot service responsibility to change these
        // if we are no longer pivoting (ie and need to revert back to primary, otherwise
        // we shouldn't be touching the primary).
        const gridColsNotProcessed = this.gridColsArePrimary === undefined;
        const processGridCols = this.gridColsArePrimary || gridColsNotProcessed;
        if (processGridCols) {
            this.updateGridColumns();
            if (colsPreviouslyExisted && !this.gridOptionsService.is('maintainColumnOrder')) {
                this.orderGridColumnsLikePrimary();
            }
            this.updateDisplayedColumns(source);
            this.checkViewportColumns();
        }
        // this event is not used by AG Grid, but left here for backwards compatibility,
        // in case applications use it
        this.dispatchEverythingChanged(source);
        if (dispatchEventsFunc) {
            dispatchEventsFunc();
        }
        this.dispatchNewColumnsLoaded();
    }
    dispatchNewColumnsLoaded() {
        const newColumnsLoadedEvent = {
            type: events_1.Events.EVENT_NEW_COLUMNS_LOADED
        };
        this.eventService.dispatchEvent(newColumnsLoadedEvent);
    }
    // this event is legacy, no grid code listens to it. instead the grid listens to New Columns Loaded
    dispatchEverythingChanged(source = 'api') {
        const eventEverythingChanged = {
            type: events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED,
            source
        };
        this.eventService.dispatchEvent(eventEverythingChanged);
    }
    orderGridColumnsLikePrimary() {
        const primaryColumns = this.primaryColumns;
        if (!primaryColumns) {
            return;
        }
        this.gridColumns.sort((colA, colB) => {
            const primaryIndexA = primaryColumns.indexOf(colA);
            const primaryIndexB = primaryColumns.indexOf(colB);
            // if both cols are present in primary, then we just return the position,
            // so position is maintained.
            const indexAPresent = primaryIndexA >= 0;
            const indexBPresent = primaryIndexB >= 0;
            if (indexAPresent && indexBPresent) {
                return primaryIndexA - primaryIndexB;
            }
            if (indexAPresent) {
                // B is auto group column, so put B first
                return 1;
            }
            if (indexBPresent) {
                // A is auto group column, so put A first
                return -1;
            }
            // otherwise both A and B are auto-group columns. so we just keep the order
            // as they were already in.
            const gridIndexA = this.gridColumns.indexOf(colA);
            const gridIndexB = this.gridColumns.indexOf(colB);
            return gridIndexA - gridIndexB;
        });
        this.gridColumns = this.placeLockedColumns(this.gridColumns);
    }
    getAllDisplayedAutoHeightCols() {
        return this.displayedAutoHeightCols;
    }
    setViewport() {
        if (this.gridOptionsService.is('enableRtl')) {
            this.viewportLeft = this.bodyWidth - this.scrollPosition - this.scrollWidth;
            this.viewportRight = this.bodyWidth - this.scrollPosition;
        }
        else {
            this.viewportLeft = this.scrollPosition;
            this.viewportRight = this.scrollWidth + this.scrollPosition;
        }
    }
    // used by clipboard service, to know what columns to paste into
    getDisplayedColumnsStartingAt(column) {
        let currentColumn = column;
        const columns = [];
        while (currentColumn != null) {
            columns.push(currentColumn);
            currentColumn = this.getDisplayedColAfter(currentColumn);
        }
        return columns;
    }
    // checks what columns are currently displayed due to column virtualisation. dispatches an event
    // if the list of columns has changed.
    // + setColumnWidth(), setViewportPosition(), setColumnDefs(), sizeColumnsToFit()
    checkViewportColumns() {
        // check displayCenterColumnTree exists first, as it won't exist when grid is initialising
        if (this.displayedColumnsCenter == null) {
            return;
        }
        const viewportColumnsChanged = this.extractViewport();
        if (!viewportColumnsChanged) {
            return;
        }
        const event = {
            type: events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED
        };
        this.eventService.dispatchEvent(event);
    }
    setViewportPosition(scrollWidth, scrollPosition) {
        if (scrollWidth !== this.scrollWidth || scrollPosition !== this.scrollPosition || this.bodyWidthDirty) {
            this.scrollWidth = scrollWidth;
            this.scrollPosition = scrollPosition;
            // we need to call setVirtualViewportLeftAndRight() at least once after the body width changes,
            // as the viewport can stay the same, but in RTL, if body width changes, we need to work out the
            // virtual columns again
            this.bodyWidthDirty = true;
            this.setViewport();
            if (this.ready) {
                this.checkViewportColumns();
            }
        }
    }
    isPivotMode() {
        return this.pivotMode;
    }
    isPivotSettingAllowed(pivot) {
        if (pivot && this.gridOptionsService.isTreeData()) {
            console.warn("AG Grid: Pivot mode not available in conjunction Tree Data i.e. 'gridOptions.treeData: true'");
            return false;
        }
        return true;
    }
    setPivotMode(pivotMode, source = 'api') {
        if (pivotMode === this.pivotMode || !this.isPivotSettingAllowed(this.pivotMode)) {
            return;
        }
        this.pivotMode = pivotMode;
        // we need to update grid columns to cover the scenario where user has groupDisplayType = 'custom', as
        // this means we don't use auto group column UNLESS we are in pivot mode (it's mandatory in pivot mode),
        // so need to updateGridColumn() to check it autoGroupCol needs to be added / removed
        this.autoGroupsNeedBuilding = true;
        this.updateGridColumns();
        this.updateDisplayedColumns(source);
        const event = {
            type: events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED
        };
        this.eventService.dispatchEvent(event);
    }
    getSecondaryPivotColumn(pivotKeys, valueColKey) {
        if (generic_1.missing(this.secondaryColumns)) {
            return null;
        }
        const valueColumnToFind = this.getPrimaryColumn(valueColKey);
        let foundColumn = null;
        this.secondaryColumns.forEach(column => {
            const thisPivotKeys = column.getColDef().pivotKeys;
            const pivotValueColumn = column.getColDef().pivotValueColumn;
            const pivotKeyMatches = array_1.areEqual(thisPivotKeys, pivotKeys);
            const pivotValueMatches = pivotValueColumn === valueColumnToFind;
            if (pivotKeyMatches && pivotValueMatches) {
                foundColumn = column;
            }
        });
        return foundColumn;
    }
    setBeans(loggerFactory) {
        this.logger = loggerFactory.create('columnModel');
    }
    setFirstRightAndLastLeftPinned(source) {
        let lastLeft;
        let firstRight;
        if (this.gridOptionsService.is('enableRtl')) {
            lastLeft = this.displayedColumnsLeft ? this.displayedColumnsLeft[0] : null;
            firstRight = this.displayedColumnsRight ? array_1.last(this.displayedColumnsRight) : null;
        }
        else {
            lastLeft = this.displayedColumnsLeft ? array_1.last(this.displayedColumnsLeft) : null;
            firstRight = this.displayedColumnsRight ? this.displayedColumnsRight[0] : null;
        }
        this.gridColumns.forEach((column) => {
            column.setLastLeftPinned(column === lastLeft, source);
            column.setFirstRightPinned(column === firstRight, source);
        });
    }
    autoSizeColumns(params) {
        const { columns, skipHeader, skipHeaderGroups, stopAtGroup, source = 'api' } = params;
        // because of column virtualisation, we can only do this function on columns that are
        // actually rendered, as non-rendered columns (outside the viewport and not rendered
        // due to column virtualisation) are not present. this can result in all rendered columns
        // getting narrowed, which in turn introduces more rendered columns on the RHS which
        // did not get autosized in the original run, leaving the visible grid with columns on
        // the LHS sized, but RHS no. so we keep looping through the visible columns until
        // no more cols are available (rendered) to be resized
        // we autosize after animation frames finish in case any cell renderers need to complete first. this can
        // happen eg if client code is calling api.autoSizeAllColumns() straight after grid is initialised, but grid
        // hasn't fully drawn out all the cells yet (due to cell renderers in animation frames).
        this.animationFrameService.flushAllFrames();
        // keep track of which cols we have resized in here
        const columnsAutosized = [];
        // initialise with anything except 0 so that while loop executes at least once
        let changesThisTimeAround = -1;
        const shouldSkipHeader = skipHeader != null ? skipHeader : this.gridOptionsService.is('skipHeaderOnAutoSize');
        const shouldSkipHeaderGroups = skipHeaderGroups != null ? skipHeaderGroups : shouldSkipHeader;
        while (changesThisTimeAround !== 0) {
            changesThisTimeAround = 0;
            this.actionOnGridColumns(columns, (column) => {
                // if already autosized, skip it
                if (columnsAutosized.indexOf(column) >= 0) {
                    return false;
                }
                // get how wide this col should be
                const preferredWidth = this.autoWidthCalculator.getPreferredWidthForColumn(column, shouldSkipHeader);
                // preferredWidth = -1 if this col is not on the screen
                if (preferredWidth > 0) {
                    const newWidth = this.normaliseColumnWidth(column, preferredWidth);
                    column.setActualWidth(newWidth, source);
                    columnsAutosized.push(column);
                    changesThisTimeAround++;
                }
                return true;
            }, source);
        }
        if (!shouldSkipHeaderGroups) {
            this.autoSizeColumnGroupsByColumns(columns, stopAtGroup);
        }
        this.dispatchColumnResizedEvent(columnsAutosized, true, 'autosizeColumns');
    }
    dispatchColumnResizedEvent(columns, finished, source, flexColumns = null) {
        if (columns && columns.length) {
            const event = {
                type: events_1.Events.EVENT_COLUMN_RESIZED,
                columns: columns,
                column: columns.length === 1 ? columns[0] : null,
                flexColumns: flexColumns,
                finished: finished,
                source: source
            };
            this.eventService.dispatchEvent(event);
        }
    }
    dispatchColumnChangedEvent(type, columns, source) {
        const event = {
            type: type,
            columns: columns,
            column: (columns && columns.length == 1) ? columns[0] : null,
            source: source
        };
        this.eventService.dispatchEvent(event);
    }
    dispatchColumnMovedEvent(params) {
        const { movedColumns, source, toIndex, finished } = params;
        const event = {
            type: events_1.Events.EVENT_COLUMN_MOVED,
            columns: movedColumns,
            column: movedColumns && movedColumns.length === 1 ? movedColumns[0] : null,
            toIndex,
            finished,
            source
        };
        this.eventService.dispatchEvent(event);
    }
    dispatchColumnPinnedEvent(changedColumns, source) {
        if (!changedColumns.length) {
            return;
        }
        // if just one column, we use this, otherwise we don't include the col
        const column = changedColumns.length === 1 ? changedColumns[0] : null;
        // only include visible if it's common in all columns
        const pinned = this.getCommonValue(changedColumns, col => col.getPinned());
        const event = {
            type: events_1.Events.EVENT_COLUMN_PINNED,
            // mistake in typing, 'undefined' should be allowed, as 'null' means 'not pinned'
            pinned: pinned != null ? pinned : null,
            columns: changedColumns,
            column,
            source: source
        };
        this.eventService.dispatchEvent(event);
    }
    dispatchColumnVisibleEvent(changedColumns, source) {
        if (!changedColumns.length) {
            return;
        }
        // if just one column, we use this, otherwise we don't include the col
        const column = changedColumns.length === 1 ? changedColumns[0] : null;
        // only include visible if it's common in all columns
        const visible = this.getCommonValue(changedColumns, col => col.isVisible());
        const event = {
            type: events_1.Events.EVENT_COLUMN_VISIBLE,
            visible,
            columns: changedColumns,
            column,
            source: source
        };
        this.eventService.dispatchEvent(event);
    }
    autoSizeColumn(key, skipHeader, source = "api") {
        if (key) {
            this.autoSizeColumns({ columns: [key], skipHeader, skipHeaderGroups: true, source });
        }
    }
    autoSizeColumnGroupsByColumns(keys, stopAtGroup) {
        const columnGroups = new Set();
        const columns = this.getGridColumns(keys);
        columns.forEach(col => {
            let parent = col.getParent();
            while (parent && parent != stopAtGroup) {
                if (!parent.isPadding()) {
                    columnGroups.add(parent);
                }
                parent = parent.getParent();
            }
        });
        let headerGroupCtrl;
        const resizedColumns = [];
        for (const columnGroup of columnGroups) {
            for (const headerContainerCtrl of this.ctrlsService.getHeaderRowContainerCtrls()) {
                headerGroupCtrl = headerContainerCtrl.getHeaderCtrlForColumn(columnGroup);
                if (headerGroupCtrl) {
                    break;
                }
            }
            if (headerGroupCtrl) {
                headerGroupCtrl.resizeLeafColumnsToFit();
            }
        }
        return resizedColumns;
    }
    autoSizeAllColumns(skipHeader, source = "api") {
        const allDisplayedColumns = this.getAllDisplayedColumns();
        this.autoSizeColumns({ columns: allDisplayedColumns, skipHeader, source });
    }
    // Possible candidate for reuse (alot of recursive traversal duplication)
    getColumnsFromTree(rootColumns) {
        const result = [];
        const recursiveFindColumns = (childColumns) => {
            for (let i = 0; i < childColumns.length; i++) {
                const child = childColumns[i];
                if (child instanceof column_1.Column) {
                    result.push(child);
                }
                else if (child instanceof providedColumnGroup_1.ProvidedColumnGroup) {
                    recursiveFindColumns(child.getChildren());
                }
            }
        };
        recursiveFindColumns(rootColumns);
        return result;
    }
    getAllDisplayedTrees() {
        if (this.displayedTreeLeft && this.displayedTreeRight && this.displayedTreeCentre) {
            return this.displayedTreeLeft
                .concat(this.displayedTreeCentre)
                .concat(this.displayedTreeRight);
        }
        return null;
    }
    // + columnSelectPanel
    getPrimaryColumnTree() {
        return this.primaryColumnTree;
    }
    // + gridPanel -> for resizing the body and setting top margin
    getHeaderRowCount() {
        return this.gridHeaderRowCount;
    }
    // + headerRenderer -> setting pinned body width
    getDisplayedTreeLeft() {
        return this.displayedTreeLeft;
    }
    // + headerRenderer -> setting pinned body width
    getDisplayedTreeRight() {
        return this.displayedTreeRight;
    }
    // + headerRenderer -> setting pinned body width
    getDisplayedTreeCentre() {
        return this.displayedTreeCentre;
    }
    // gridPanel -> ensureColumnVisible
    isColumnDisplayed(column) {
        return this.getAllDisplayedColumns().indexOf(column) >= 0;
    }
    // + csvCreator
    getAllDisplayedColumns() {
        return this.displayedColumns;
    }
    getViewportColumns() {
        return this.viewportColumns;
    }
    getDisplayedLeftColumnsForRow(rowNode) {
        if (!this.colSpanActive) {
            return this.displayedColumnsLeft;
        }
        return this.getDisplayedColumnsForRow(rowNode, this.displayedColumnsLeft);
    }
    getDisplayedRightColumnsForRow(rowNode) {
        if (!this.colSpanActive) {
            return this.displayedColumnsRight;
        }
        return this.getDisplayedColumnsForRow(rowNode, this.displayedColumnsRight);
    }
    getDisplayedColumnsForRow(rowNode, displayedColumns, filterCallback, emptySpaceBeforeColumn) {
        const result = [];
        let lastConsideredCol = null;
        for (let i = 0; i < displayedColumns.length; i++) {
            const col = displayedColumns[i];
            const maxAllowedColSpan = displayedColumns.length - i;
            const colSpan = Math.min(col.getColSpan(rowNode), maxAllowedColSpan);
            const columnsToCheckFilter = [col];
            if (colSpan > 1) {
                const colsToRemove = colSpan - 1;
                for (let j = 1; j <= colsToRemove; j++) {
                    columnsToCheckFilter.push(displayedColumns[i + j]);
                }
                i += colsToRemove;
            }
            // see which cols we should take out for column virtualisation
            let filterPasses;
            if (filterCallback) {
                // if user provided a callback, means some columns may not be in the viewport.
                // the user will NOT provide a callback if we are talking about pinned areas,
                // as pinned areas have no horizontal scroll and do not virtualise the columns.
                // if lots of columns, that means column spanning, and we set filterPasses = true
                // if one or more of the columns spanned pass the filter.
                filterPasses = false;
                columnsToCheckFilter.forEach(colForFilter => {
                    if (filterCallback(colForFilter)) {
                        filterPasses = true;
                    }
                });
            }
            else {
                filterPasses = true;
            }
            if (filterPasses) {
                if (result.length === 0 && lastConsideredCol) {
                    const gapBeforeColumn = emptySpaceBeforeColumn ? emptySpaceBeforeColumn(col) : false;
                    if (gapBeforeColumn) {
                        result.push(lastConsideredCol);
                    }
                }
                result.push(col);
            }
            lastConsideredCol = col;
        }
        return result;
    }
    // + rowRenderer
    // if we are not column spanning, this just returns back the virtual centre columns,
    // however if we are column spanning, then different rows can have different virtual
    // columns, so we have to work out the list for each individual row.
    getViewportCenterColumnsForRow(rowNode) {
        if (!this.colSpanActive) {
            return this.viewportColumnsCenter;
        }
        const emptySpaceBeforeColumn = (col) => {
            const left = col.getLeft();
            return generic_1.exists(left) && left > this.viewportLeft;
        };
        // if doing column virtualisation, then we filter based on the viewport.
        const filterCallback = this.suppressColumnVirtualisation ? null : this.isColumnInRowViewport.bind(this);
        return this.getDisplayedColumnsForRow(rowNode, this.displayedColumnsCenter, filterCallback, emptySpaceBeforeColumn);
    }
    getAriaColumnIndex(col) {
        return this.getAllGridColumns().indexOf(col) + 1;
    }
    isColumnInHeaderViewport(col) {
        // for headers, we never filter out autoHeaderHeight columns, if calculating
        if (col.isAutoHeaderHeight()) {
            return true;
        }
        return this.isColumnInRowViewport(col);
    }
    isColumnInRowViewport(col) {
        // we never filter out autoHeight columns, as we need them in the DOM for calculating Auto Height
        if (col.isAutoHeight()) {
            return true;
        }
        const columnLeft = col.getLeft() || 0;
        const columnRight = columnLeft + col.getActualWidth();
        // adding 200 for buffer size, so some cols off viewport are rendered.
        // this helps horizontal scrolling so user rarely sees white space (unless
        // they scroll horizontally fast). however we are conservative, as the more
        // buffer the slower the vertical redraw speed
        const leftBounds = this.viewportLeft - 200;
        const rightBounds = this.viewportRight + 200;
        const columnToMuchLeft = columnLeft < leftBounds && columnRight < leftBounds;
        const columnToMuchRight = columnLeft > rightBounds && columnRight > rightBounds;
        return !columnToMuchLeft && !columnToMuchRight;
    }
    // used by:
    // + angularGrid -> setting pinned body width
    // note: this should be cached
    getDisplayedColumnsLeftWidth() {
        return this.getWidthOfColsInList(this.displayedColumnsLeft);
    }
    // note: this should be cached
    getDisplayedColumnsRightWidth() {
        return this.getWidthOfColsInList(this.displayedColumnsRight);
    }
    updatePrimaryColumnList(keys, masterList, actionIsAdd, columnCallback, eventType, source = "api") {
        if (!keys || generic_1.missingOrEmpty(keys)) {
            return;
        }
        let atLeastOne = false;
        keys.forEach(key => {
            const columnToAdd = this.getPrimaryColumn(key);
            if (!columnToAdd) {
                return;
            }
            if (actionIsAdd) {
                if (masterList.indexOf(columnToAdd) >= 0) {
                    return;
                }
                masterList.push(columnToAdd);
            }
            else {
                if (masterList.indexOf(columnToAdd) < 0) {
                    return;
                }
                array_1.removeFromArray(masterList, columnToAdd);
            }
            columnCallback(columnToAdd);
            atLeastOne = true;
        });
        if (!atLeastOne) {
            return;
        }
        if (this.autoGroupsNeedBuilding) {
            this.updateGridColumns();
        }
        this.updateDisplayedColumns(source);
        const event = {
            type: eventType,
            columns: masterList,
            column: masterList.length === 1 ? masterList[0] : null,
            source: source
        };
        this.eventService.dispatchEvent(event);
    }
    setRowGroupColumns(colKeys, source = "api") {
        this.autoGroupsNeedBuilding = true;
        this.setPrimaryColumnList(colKeys, this.rowGroupColumns, events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.setRowGroupActive.bind(this), source);
    }
    setRowGroupActive(active, column, source) {
        if (active === column.isRowGroupActive()) {
            return;
        }
        column.setRowGroupActive(active, source);
        if (active && !this.gridOptionsService.is('suppressRowGroupHidesColumns')) {
            this.setColumnVisible(column, false, source);
        }
        if (!active && !this.gridOptionsService.is('suppressMakeColumnVisibleAfterUnGroup')) {
            this.setColumnVisible(column, true, source);
        }
    }
    addRowGroupColumn(key, source = "api") {
        if (key) {
            this.addRowGroupColumns([key], source);
        }
    }
    addRowGroupColumns(keys, source = "api") {
        this.autoGroupsNeedBuilding = true;
        this.updatePrimaryColumnList(keys, this.rowGroupColumns, true, this.setRowGroupActive.bind(this, true), events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, source);
    }
    removeRowGroupColumns(keys, source = "api") {
        this.autoGroupsNeedBuilding = true;
        this.updatePrimaryColumnList(keys, this.rowGroupColumns, false, this.setRowGroupActive.bind(this, false), events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, source);
    }
    removeRowGroupColumn(key, source = "api") {
        if (key) {
            this.removeRowGroupColumns([key], source);
        }
    }
    addPivotColumns(keys, source = "api") {
        this.updatePrimaryColumnList(keys, this.pivotColumns, true, column => column.setPivotActive(true, source), events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, source);
    }
    setPivotColumns(colKeys, source = "api") {
        this.setPrimaryColumnList(colKeys, this.pivotColumns, events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, (added, column) => {
            column.setPivotActive(added, source);
        }, source);
    }
    addPivotColumn(key, source = "api") {
        this.addPivotColumns([key], source);
    }
    removePivotColumns(keys, source = "api") {
        this.updatePrimaryColumnList(keys, this.pivotColumns, false, column => column.setPivotActive(false, source), events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, source);
    }
    removePivotColumn(key, source = "api") {
        this.removePivotColumns([key], source);
    }
    setPrimaryColumnList(colKeys, masterList, eventName, columnCallback, source) {
        masterList.length = 0;
        if (generic_1.exists(colKeys)) {
            colKeys.forEach(key => {
                const column = this.getPrimaryColumn(key);
                if (column) {
                    masterList.push(column);
                }
            });
        }
        (this.primaryColumns || []).forEach(column => {
            const added = masterList.indexOf(column) >= 0;
            columnCallback(added, column);
        });
        if (this.autoGroupsNeedBuilding) {
            this.updateGridColumns();
        }
        this.updateDisplayedColumns(source);
        this.dispatchColumnChangedEvent(eventName, masterList, source);
    }
    setValueColumns(colKeys, source = "api") {
        this.setPrimaryColumnList(colKeys, this.valueColumns, events_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.setValueActive.bind(this), source);
    }
    setValueActive(active, column, source) {
        if (active === column.isValueActive()) {
            return;
        }
        column.setValueActive(active, source);
        if (active && !column.getAggFunc()) {
            const initialAggFunc = this.aggFuncService.getDefaultAggFunc(column);
            column.setAggFunc(initialAggFunc);
        }
    }
    addValueColumns(keys, source = "api") {
        this.updatePrimaryColumnList(keys, this.valueColumns, true, this.setValueActive.bind(this, true), events_1.Events.EVENT_COLUMN_VALUE_CHANGED, source);
    }
    addValueColumn(colKey, source = "api") {
        if (colKey) {
            this.addValueColumns([colKey], source);
        }
    }
    removeValueColumn(colKey, source = "api") {
        this.removeValueColumns([colKey], source);
    }
    removeValueColumns(keys, source = "api") {
        this.updatePrimaryColumnList(keys, this.valueColumns, false, this.setValueActive.bind(this, false), events_1.Events.EVENT_COLUMN_VALUE_CHANGED, source);
    }
    // returns the width we can set to this col, taking into consideration min and max widths
    normaliseColumnWidth(column, newWidth) {
        const minWidth = column.getMinWidth();
        if (generic_1.exists(minWidth) && newWidth < minWidth) {
            newWidth = minWidth;
        }
        const maxWidth = column.getMaxWidth();
        if (generic_1.exists(maxWidth) && column.isGreaterThanMax(newWidth)) {
            newWidth = maxWidth;
        }
        return newWidth;
    }
    getPrimaryOrGridColumn(key) {
        const column = this.getPrimaryColumn(key);
        return column || this.getGridColumn(key);
    }
    setColumnWidths(columnWidths, shiftKey, // @takeFromAdjacent - if user has 'shift' pressed, then pixels are taken from adjacent column
    finished, // @finished - ends up in the event, tells the user if more events are to come
    source = "api") {
        const sets = [];
        columnWidths.forEach(columnWidth => {
            const col = this.getPrimaryOrGridColumn(columnWidth.key);
            if (!col) {
                return;
            }
            sets.push({
                width: columnWidth.newWidth,
                ratios: [1],
                columns: [col]
            });
            // if user wants to do shift resize by default, then we invert the shift operation
            const defaultIsShift = this.gridOptionsService.get('colResizeDefault') === 'shift';
            if (defaultIsShift) {
                shiftKey = !shiftKey;
            }
            if (shiftKey) {
                const otherCol = this.getDisplayedColAfter(col);
                if (!otherCol) {
                    return;
                }
                const widthDiff = col.getActualWidth() - columnWidth.newWidth;
                const otherColWidth = otherCol.getActualWidth() + widthDiff;
                sets.push({
                    width: otherColWidth,
                    ratios: [1],
                    columns: [otherCol]
                });
            }
        });
        if (sets.length === 0) {
            return;
        }
        this.resizeColumnSets({
            resizeSets: sets,
            finished,
            source
        });
    }
    checkMinAndMaxWidthsForSet(columnResizeSet) {
        const { columns, width } = columnResizeSet;
        // every col has a min width, so sum them all up and see if we have enough room
        // for all the min widths
        let minWidthAccumulated = 0;
        let maxWidthAccumulated = 0;
        let maxWidthActive = true;
        columns.forEach(col => {
            const minWidth = col.getMinWidth();
            minWidthAccumulated += minWidth || 0;
            const maxWidth = col.getMaxWidth();
            if (generic_1.exists(maxWidth) && maxWidth > 0) {
                maxWidthAccumulated += maxWidth;
            }
            else {
                // if at least one columns has no max width, it means the group of columns
                // then has no max width, as at least one column can take as much width as possible
                maxWidthActive = false;
            }
        });
        const minWidthPasses = width >= minWidthAccumulated;
        const maxWidthPasses = !maxWidthActive || (width <= maxWidthAccumulated);
        return minWidthPasses && maxWidthPasses;
    }
    // method takes sets of columns and resizes them. either all sets will be resized, or nothing
    // be resized. this is used for example when user tries to resize a group and holds shift key,
    // then both the current group (grows), and the adjacent group (shrinks), will get resized,
    // so that's two sets for this method.
    resizeColumnSets(params) {
        const { resizeSets, finished, source } = params;
        const passMinMaxCheck = !resizeSets || resizeSets.every(columnResizeSet => this.checkMinAndMaxWidthsForSet(columnResizeSet));
        if (!passMinMaxCheck) {
            // even though we are not going to resize beyond min/max size, we still need to dispatch event when finished
            if (finished) {
                const columns = resizeSets && resizeSets.length > 0 ? resizeSets[0].columns : null;
                this.dispatchColumnResizedEvent(columns, finished, source);
            }
            return; // don't resize!
        }
        const changedCols = [];
        const allResizedCols = [];
        resizeSets.forEach(set => {
            const { width, columns, ratios } = set;
            // keep track of pixels used, and last column gets the remaining,
            // to cater for rounding errors, and min width adjustments
            const newWidths = {};
            const finishedCols = {};
            columns.forEach(col => allResizedCols.push(col));
            // the loop below goes through each col. if a col exceeds it's min/max width,
            // it then gets set to its min/max width and the column is removed marked as 'finished'
            // and the calculation is done again leaving this column out. take for example columns
            // {A, width: 50, maxWidth: 100}
            // {B, width: 50}
            // {C, width: 50}
            // and then the set is set to width 600 - on the first pass the grid tries to set each column
            // to 200. it checks A and sees 200 > 100 and so sets the width to 100. col A is then marked
            // as 'finished' and the calculation is done again with the remaining cols B and C, which end up
            // splitting the remaining 500 pixels.
            let finishedColsGrew = true;
            let loopCount = 0;
            while (finishedColsGrew) {
                loopCount++;
                if (loopCount > 1000) {
                    // this should never happen, but in the future, someone might introduce a bug here,
                    // so we stop the browser from hanging and report bug properly
                    console.error('AG Grid: infinite loop in resizeColumnSets');
                    break;
                }
                finishedColsGrew = false;
                const subsetCols = [];
                let subsetRatioTotal = 0;
                let pixelsToDistribute = width;
                columns.forEach((col, index) => {
                    const thisColFinished = finishedCols[col.getId()];
                    if (thisColFinished) {
                        pixelsToDistribute -= newWidths[col.getId()];
                    }
                    else {
                        subsetCols.push(col);
                        const ratioThisCol = ratios[index];
                        subsetRatioTotal += ratioThisCol;
                    }
                });
                // because we are not using all of the ratios (cols can be missing),
                // we scale the ratio. if all columns are included, then subsetRatioTotal=1,
                // and so the ratioScale will be 1.
                const ratioScale = 1 / subsetRatioTotal;
                subsetCols.forEach((col, index) => {
                    const lastCol = index === (subsetCols.length - 1);
                    let colNewWidth;
                    if (lastCol) {
                        colNewWidth = pixelsToDistribute;
                    }
                    else {
                        colNewWidth = Math.round(ratios[index] * width * ratioScale);
                        pixelsToDistribute -= colNewWidth;
                    }
                    const minWidth = col.getMinWidth();
                    const maxWidth = col.getMaxWidth();
                    if (generic_1.exists(minWidth) && colNewWidth < minWidth) {
                        colNewWidth = minWidth;
                        finishedCols[col.getId()] = true;
                        finishedColsGrew = true;
                    }
                    else if (generic_1.exists(maxWidth) && maxWidth > 0 && colNewWidth > maxWidth) {
                        colNewWidth = maxWidth;
                        finishedCols[col.getId()] = true;
                        finishedColsGrew = true;
                    }
                    newWidths[col.getId()] = colNewWidth;
                });
            }
            columns.forEach(col => {
                const newWidth = newWidths[col.getId()];
                const actualWidth = col.getActualWidth();
                if (actualWidth !== newWidth) {
                    col.setActualWidth(newWidth, source);
                    changedCols.push(col);
                }
            });
        });
        // if no cols changed, then no need to update more or send event.
        const atLeastOneColChanged = changedCols.length > 0;
        let flexedCols = [];
        if (atLeastOneColChanged) {
            flexedCols = this.refreshFlexedColumns({ resizingCols: allResizedCols, skipSetLeft: true });
            this.setLeftValues(source);
            this.updateBodyWidths();
            this.checkViewportColumns();
        }
        // check for change first, to avoid unnecessary firing of events
        // however we always dispatch 'finished' events. this is important
        // when groups are resized, as if the group is changing slowly,
        // eg 1 pixel at a time, then each change will dispatch change events
        // in all the columns in the group, but only one with get the pixel.
        const colsForEvent = allResizedCols.concat(flexedCols);
        if (atLeastOneColChanged || finished) {
            this.dispatchColumnResizedEvent(colsForEvent, finished, source, flexedCols);
        }
    }
    setColumnAggFunc(key, aggFunc, source = "api") {
        if (!key) {
            return;
        }
        const column = this.getPrimaryColumn(key);
        if (!column) {
            return;
        }
        column.setAggFunc(aggFunc);
        this.dispatchColumnChangedEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, [column], source);
    }
    moveRowGroupColumn(fromIndex, toIndex, source = "api") {
        const column = this.rowGroupColumns[fromIndex];
        this.rowGroupColumns.splice(fromIndex, 1);
        this.rowGroupColumns.splice(toIndex, 0, column);
        const event = {
            type: events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            columns: this.rowGroupColumns,
            column: this.rowGroupColumns.length === 1 ? this.rowGroupColumns[0] : null,
            source: source
        };
        this.eventService.dispatchEvent(event);
    }
    moveColumns(columnsToMoveKeys, toIndex, source = "api", finished = true) {
        this.columnAnimationService.start();
        if (toIndex > this.gridColumns.length - columnsToMoveKeys.length) {
            console.warn('AG Grid: tried to insert columns in invalid location, toIndex = ' + toIndex);
            console.warn('AG Grid: remember that you should not count the moving columns when calculating the new index');
            return;
        }
        // we want to pull all the columns out first and put them into an ordered list
        const movedColumns = this.getGridColumns(columnsToMoveKeys);
        const failedRules = !this.doesMovePassRules(movedColumns, toIndex);
        if (failedRules) {
            return;
        }
        array_1.moveInArray(this.gridColumns, movedColumns, toIndex);
        this.updateDisplayedColumns(source);
        this.dispatchColumnMovedEvent({ movedColumns, source, toIndex, finished });
        this.columnAnimationService.finish();
    }
    doesMovePassRules(columnsToMove, toIndex) {
        // make a copy of what the grid columns would look like after the move
        const proposedColumnOrder = this.getProposedColumnOrder(columnsToMove, toIndex);
        return this.doesOrderPassRules(proposedColumnOrder);
    }
    doesOrderPassRules(gridOrder) {
        if (!this.doesMovePassMarryChildren(gridOrder)) {
            return false;
        }
        if (!this.doesMovePassLockedPositions(gridOrder)) {
            return false;
        }
        return true;
    }
    getProposedColumnOrder(columnsToMove, toIndex) {
        const proposedColumnOrder = this.gridColumns.slice();
        array_1.moveInArray(proposedColumnOrder, columnsToMove, toIndex);
        return proposedColumnOrder;
    }
    // returns the provided cols sorted in same order as they appear in grid columns. eg if grid columns
    // contains [a,b,c,d,e] and col passed is [e,a] then the passed cols are sorted into [a,e]
    sortColumnsLikeGridColumns(cols) {
        if (!cols || cols.length <= 1) {
            return;
        }
        const notAllColsInGridColumns = cols.filter(c => this.gridColumns.indexOf(c) < 0).length > 0;
        if (notAllColsInGridColumns) {
            return;
        }
        cols.sort((a, b) => {
            const indexA = this.gridColumns.indexOf(a);
            const indexB = this.gridColumns.indexOf(b);
            return indexA - indexB;
        });
    }
    doesMovePassLockedPositions(proposedColumnOrder) {
        // Placement is a number indicating 'left' 'center' or 'right' as 0 1 2
        let lastPlacement = 0;
        let rulePassed = true;
        const lockPositionToPlacement = (position) => {
            if (!position) { // false or undefined
                return 1;
            }
            if (position === true) {
                return 0;
            }
            return position === 'left' ? 0 : 2; // Otherwise 'right'
        };
        proposedColumnOrder.forEach(col => {
            const placement = lockPositionToPlacement(col.getColDef().lockPosition);
            if (placement < lastPlacement) { // If placement goes down, we're not in the correct order
                rulePassed = false;
            }
            lastPlacement = placement;
        });
        return rulePassed;
    }
    doesMovePassMarryChildren(allColumnsCopy) {
        let rulePassed = true;
        this.columnUtils.depthFirstOriginalTreeSearch(null, this.gridBalancedTree, child => {
            if (!(child instanceof providedColumnGroup_1.ProvidedColumnGroup)) {
                return;
            }
            const columnGroup = child;
            const colGroupDef = columnGroup.getColGroupDef();
            const marryChildren = colGroupDef && colGroupDef.marryChildren;
            if (!marryChildren) {
                return;
            }
            const newIndexes = [];
            columnGroup.getLeafColumns().forEach(col => {
                const newColIndex = allColumnsCopy.indexOf(col);
                newIndexes.push(newColIndex);
            });
            const maxIndex = Math.max.apply(Math, newIndexes);
            const minIndex = Math.min.apply(Math, newIndexes);
            // spread is how far the first column in this group is away from the last column
            const spread = maxIndex - minIndex;
            const maxSpread = columnGroup.getLeafColumns().length - 1;
            // if the columns
            if (spread > maxSpread) {
                rulePassed = false;
            }
            // console.log(`maxIndex = ${maxIndex}, minIndex = ${minIndex}, spread = ${spread}, maxSpread = ${maxSpread}, fail = ${spread > (count-1)}`)
            // console.log(allColumnsCopy.map( col => col.getColDef().field).join(','));
        });
        return rulePassed;
    }
    moveColumn(key, toIndex, source = "api") {
        this.moveColumns([key], toIndex, source);
    }
    moveColumnByIndex(fromIndex, toIndex, source = "api") {
        const column = this.gridColumns[fromIndex];
        this.moveColumn(column, toIndex, source);
    }
    getColumnDefs() {
        if (!this.primaryColumns) {
            return;
        }
        const cols = this.primaryColumns.slice();
        if (this.gridColsArePrimary) {
            cols.sort((a, b) => this.gridColumns.indexOf(a) - this.gridColumns.indexOf(b));
        }
        else if (this.lastPrimaryOrder) {
            cols.sort((a, b) => this.lastPrimaryOrder.indexOf(a) - this.lastPrimaryOrder.indexOf(b));
        }
        return this.columnDefFactory.buildColumnDefs(cols, this.rowGroupColumns, this.pivotColumns);
    }
    // used by:
    // + angularGrid -> for setting body width
    // + rowController -> setting main row widths (when inserting and resizing)
    // need to cache this
    getBodyContainerWidth() {
        return this.bodyWidth;
    }
    getContainerWidth(pinned) {
        switch (pinned) {
            case 'left':
                return this.leftWidth;
            case 'right':
                return this.rightWidth;
            default:
                return this.bodyWidth;
        }
    }
    // after setColumnWidth or updateGroupsAndDisplayedColumns
    updateBodyWidths() {
        const newBodyWidth = this.getWidthOfColsInList(this.displayedColumnsCenter);
        const newLeftWidth = this.getWidthOfColsInList(this.displayedColumnsLeft);
        const newRightWidth = this.getWidthOfColsInList(this.displayedColumnsRight);
        // this is used by virtual col calculation, for RTL only, as a change to body width can impact displayed
        // columns, due to RTL inverting the y coordinates
        this.bodyWidthDirty = this.bodyWidth !== newBodyWidth;
        const atLeastOneChanged = this.bodyWidth !== newBodyWidth || this.leftWidth !== newLeftWidth || this.rightWidth !== newRightWidth;
        if (atLeastOneChanged) {
            this.bodyWidth = newBodyWidth;
            this.leftWidth = newLeftWidth;
            this.rightWidth = newRightWidth;
            // when this fires, it is picked up by the gridPanel, which ends up in
            // gridPanel calling setWidthAndScrollPosition(), which in turn calls setViewportPosition()
            const event = {
                type: events_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED,
            };
            this.eventService.dispatchEvent(event);
        }
    }
    // + rowController
    getValueColumns() {
        return this.valueColumns ? this.valueColumns : [];
    }
    // + rowController
    getPivotColumns() {
        return this.pivotColumns ? this.pivotColumns : [];
    }
    // + clientSideRowModel
    isPivotActive() {
        return this.pivotColumns && this.pivotColumns.length > 0 && this.pivotMode;
    }
    // + toolPanel
    getRowGroupColumns() {
        return this.rowGroupColumns ? this.rowGroupColumns : [];
    }
    // + rowController -> while inserting rows
    getDisplayedCenterColumns() {
        return this.displayedColumnsCenter;
    }
    // + rowController -> while inserting rows
    getDisplayedLeftColumns() {
        return this.displayedColumnsLeft;
    }
    getDisplayedRightColumns() {
        return this.displayedColumnsRight;
    }
    getDisplayedColumns(type) {
        switch (type) {
            case 'left':
                return this.getDisplayedLeftColumns();
            case 'right':
                return this.getDisplayedRightColumns();
            default:
                return this.getDisplayedCenterColumns();
        }
    }
    // used by:
    // + clientSideRowController -> sorting, building quick filter text
    // + headerRenderer -> sorting (clearing icon)
    getAllPrimaryColumns() {
        return this.primaryColumns ? this.primaryColumns.slice() : null;
    }
    getSecondaryColumns() {
        return this.secondaryColumns ? this.secondaryColumns.slice() : null;
    }
    getAllColumnsForQuickFilter() {
        return this.columnsForQuickFilter;
    }
    // + moveColumnController
    getAllGridColumns() {
        return this.gridColumns;
    }
    isEmpty() {
        return generic_1.missingOrEmpty(this.gridColumns);
    }
    isRowGroupEmpty() {
        return generic_1.missingOrEmpty(this.rowGroupColumns);
    }
    setColumnVisible(key, visible, source = "api") {
        this.setColumnsVisible([key], visible, source);
    }
    setColumnsVisible(keys, visible = false, source = "api") {
        this.applyColumnState({
            state: keys.map(key => ({
                colId: typeof key === 'string' ? key : key.getColId(),
                hide: !visible,
            })),
        }, source);
    }
    setColumnPinned(key, pinned, source = "api") {
        if (key) {
            this.setColumnsPinned([key], pinned, source);
        }
    }
    setColumnsPinned(keys, pinned, source = "api") {
        if (this.gridOptionsService.isDomLayout('print')) {
            console.warn(`AG Grid: Changing the column pinning status is not allowed with domLayout='print'`);
            return;
        }
        this.columnAnimationService.start();
        let actualPinned;
        if (pinned === true || pinned === 'left') {
            actualPinned = 'left';
        }
        else if (pinned === 'right') {
            actualPinned = 'right';
        }
        else {
            actualPinned = null;
        }
        this.actionOnGridColumns(keys, (col) => {
            if (col.getPinned() !== actualPinned) {
                col.setPinned(actualPinned);
                return true;
            }
            return false;
        }, source, () => {
            const event = {
                type: events_1.Events.EVENT_COLUMN_PINNED,
                pinned: actualPinned,
                column: null,
                columns: null,
                source: source
            };
            return event;
        });
        this.columnAnimationService.finish();
    }
    // does an action on a set of columns. provides common functionality for looking up the
    // columns based on key, getting a list of effected columns, and then updated the event
    // with either one column (if it was just one col) or a list of columns
    // used by: autoResize, setVisible, setPinned
    actionOnGridColumns(// the column keys this action will be on
    keys, 
    // the action to do - if this returns false, the column was skipped
    // and won't be included in the event
    action, 
    // should return back a column event of the right type
    source, createEvent) {
        if (generic_1.missingOrEmpty(keys)) {
            return;
        }
        const updatedColumns = [];
        keys.forEach((key) => {
            const column = this.getGridColumn(key);
            if (!column) {
                return;
            }
            // need to check for false with type (ie !== instead of !=)
            // as not returning anything (undefined) would also be false
            const resultOfAction = action(column);
            if (resultOfAction !== false) {
                updatedColumns.push(column);
            }
        });
        if (!updatedColumns.length) {
            return;
        }
        this.updateDisplayedColumns(source);
        if (generic_1.exists(createEvent) && createEvent) {
            const event = createEvent();
            event.columns = updatedColumns;
            event.column = updatedColumns.length === 1 ? updatedColumns[0] : null;
            this.eventService.dispatchEvent(event);
        }
    }
    getDisplayedColBefore(col) {
        const allDisplayedColumns = this.getAllDisplayedColumns();
        const oldIndex = allDisplayedColumns.indexOf(col);
        if (oldIndex > 0) {
            return allDisplayedColumns[oldIndex - 1];
        }
        return null;
    }
    // used by:
    // + rowRenderer -> for navigation
    getDisplayedColAfter(col) {
        const allDisplayedColumns = this.getAllDisplayedColumns();
        const oldIndex = allDisplayedColumns.indexOf(col);
        if (oldIndex < (allDisplayedColumns.length - 1)) {
            return allDisplayedColumns[oldIndex + 1];
        }
        return null;
    }
    getDisplayedGroupAfter(columnGroup) {
        return this.getDisplayedGroupAtDirection(columnGroup, 'After');
    }
    getDisplayedGroupBefore(columnGroup) {
        return this.getDisplayedGroupAtDirection(columnGroup, 'Before');
    }
    getDisplayedGroupAtDirection(columnGroup, direction) {
        // pick the last displayed column in this group
        const requiredLevel = columnGroup.getProvidedColumnGroup().getLevel() + columnGroup.getPaddingLevel();
        const colGroupLeafColumns = columnGroup.getDisplayedLeafColumns();
        const col = direction === 'After' ? array_1.last(colGroupLeafColumns) : colGroupLeafColumns[0];
        const getDisplayColMethod = `getDisplayedCol${direction}`;
        while (true) {
            // keep moving to the next col, until we get to another group
            const column = this[getDisplayColMethod](col);
            if (!column) {
                return null;
            }
            const groupPointer = this.getColumnGroupAtLevel(column, requiredLevel);
            if (groupPointer !== columnGroup) {
                return groupPointer;
            }
        }
    }
    getColumnGroupAtLevel(column, level) {
        // get group at same level as the one we are looking for
        let groupPointer = column.getParent();
        let originalGroupLevel;
        let groupPointerLevel;
        while (true) {
            const groupPointerProvidedColumnGroup = groupPointer.getProvidedColumnGroup();
            originalGroupLevel = groupPointerProvidedColumnGroup.getLevel();
            groupPointerLevel = groupPointer.getPaddingLevel();
            if (originalGroupLevel + groupPointerLevel <= level) {
                break;
            }
            groupPointer = groupPointer.getParent();
        }
        return groupPointer;
    }
    isPinningLeft() {
        return this.displayedColumnsLeft.length > 0;
    }
    isPinningRight() {
        return this.displayedColumnsRight.length > 0;
    }
    getPrimaryAndSecondaryAndAutoColumns() {
        return [].concat(...[
            this.primaryColumns || [],
            this.groupAutoColumns || [],
            this.secondaryColumns || [],
        ]);
    }
    createStateItemFromColumn(column) {
        const rowGroupIndex = column.isRowGroupActive() ? this.rowGroupColumns.indexOf(column) : null;
        const pivotIndex = column.isPivotActive() ? this.pivotColumns.indexOf(column) : null;
        const aggFunc = column.isValueActive() ? column.getAggFunc() : null;
        const sort = column.getSort() != null ? column.getSort() : null;
        const sortIndex = column.getSortIndex() != null ? column.getSortIndex() : null;
        const flex = column.getFlex() != null && column.getFlex() > 0 ? column.getFlex() : null;
        const res = {
            colId: column.getColId(),
            width: column.getActualWidth(),
            hide: !column.isVisible(),
            pinned: column.getPinned(),
            sort,
            sortIndex,
            aggFunc,
            rowGroup: column.isRowGroupActive(),
            rowGroupIndex,
            pivot: column.isPivotActive(),
            pivotIndex: pivotIndex,
            flex
        };
        return res;
    }
    getColumnState() {
        if (generic_1.missing(this.primaryColumns) || !this.isAlive()) {
            return [];
        }
        const colsForState = this.getPrimaryAndSecondaryAndAutoColumns();
        const res = colsForState.map(this.createStateItemFromColumn.bind(this));
        this.orderColumnStateList(res);
        return res;
    }
    orderColumnStateList(columnStateList) {
        // for fast looking, store the index of each column
        const colIdToGridIndexMap = map_1.convertToMap(this.gridColumns.map((col, index) => [col.getColId(), index]));
        columnStateList.sort((itemA, itemB) => {
            const posA = colIdToGridIndexMap.has(itemA.colId) ? colIdToGridIndexMap.get(itemA.colId) : -1;
            const posB = colIdToGridIndexMap.has(itemB.colId) ? colIdToGridIndexMap.get(itemB.colId) : -1;
            return posA - posB;
        });
    }
    resetColumnState(source = "api") {
        // NOTE = there is one bug here that no customer has noticed - if a column has colDef.lockPosition,
        // this is ignored  below when ordering the cols. to work, we should always put lockPosition cols first.
        // As a work around, developers should just put lockPosition columns first in their colDef list.
        // we can't use 'allColumns' as the order might of messed up, so get the primary ordered list
        const primaryColumns = this.getColumnsFromTree(this.primaryColumnTree);
        const columnStates = [];
        // we start at 1000, so if user has mix of rowGroup and group specified, it will work with both.
        // eg IF user has ColA.rowGroupIndex=0, ColB.rowGroupIndex=1, ColC.rowGroup=true,
        // THEN result will be ColA.rowGroupIndex=0, ColB.rowGroupIndex=1, ColC.rowGroup=1000
        let letRowGroupIndex = 1000;
        let letPivotIndex = 1000;
        let colsToProcess = [];
        if (this.groupAutoColumns) {
            colsToProcess = colsToProcess.concat(this.groupAutoColumns);
        }
        if (primaryColumns) {
            colsToProcess = colsToProcess.concat(primaryColumns);
        }
        colsToProcess.forEach(column => {
            const getValueOrNull = (a, b) => a != null ? a : b != null ? b : null;
            const colDef = column.getColDef();
            const sort = getValueOrNull(colDef.sort, colDef.initialSort);
            const sortIndex = getValueOrNull(colDef.sortIndex, colDef.initialSortIndex);
            const hide = getValueOrNull(colDef.hide, colDef.initialHide);
            const pinned = getValueOrNull(colDef.pinned, colDef.initialPinned);
            const width = getValueOrNull(colDef.width, colDef.initialWidth);
            const flex = getValueOrNull(colDef.flex, colDef.initialFlex);
            let rowGroupIndex = getValueOrNull(colDef.rowGroupIndex, colDef.initialRowGroupIndex);
            let rowGroup = getValueOrNull(colDef.rowGroup, colDef.initialRowGroup);
            if (rowGroupIndex == null && (rowGroup == null || rowGroup == false)) {
                rowGroupIndex = null;
                rowGroup = null;
            }
            let pivotIndex = getValueOrNull(colDef.pivotIndex, colDef.initialPivotIndex);
            let pivot = getValueOrNull(colDef.pivot, colDef.initialPivot);
            if (pivotIndex == null && (pivot == null || pivot == false)) {
                pivotIndex = null;
                pivot = null;
            }
            const aggFunc = getValueOrNull(colDef.aggFunc, colDef.initialAggFunc);
            const stateItem = {
                colId: column.getColId(),
                sort,
                sortIndex,
                hide,
                pinned,
                width,
                flex,
                rowGroup,
                rowGroupIndex,
                pivot,
                pivotIndex,
                aggFunc,
            };
            if (generic_1.missing(rowGroupIndex) && rowGroup) {
                stateItem.rowGroupIndex = letRowGroupIndex++;
            }
            if (generic_1.missing(pivotIndex) && pivot) {
                stateItem.pivotIndex = letPivotIndex++;
            }
            columnStates.push(stateItem);
        });
        this.applyColumnState({ state: columnStates, applyOrder: true }, source);
    }
    applyColumnState(params, source) {
        if (generic_1.missingOrEmpty(this.primaryColumns)) {
            return false;
        }
        if (params && params.state && !params.state.forEach) {
            console.warn('AG Grid: applyColumnState() - the state attribute should be an array, however an array was not found. Please provide an array of items (one for each col you want to change) for state.');
            return false;
        }
        const applyStates = (states, existingColumns, getById) => {
            const dispatchEventsFunc = this.compareColumnStatesAndDispatchEvents(source);
            this.autoGroupsNeedBuilding = true;
            // at the end below, this list will have all columns we got no state for
            const columnsWithNoState = existingColumns.slice();
            const rowGroupIndexes = {};
            const pivotIndexes = {};
            const autoGroupColumnStates = [];
            // If pivoting is modified, these are the states we try to reapply after
            // the secondary columns are re-generated
            const unmatchedAndAutoStates = [];
            let unmatchedCount = 0;
            const previousRowGroupCols = this.rowGroupColumns.slice();
            const previousPivotCols = this.pivotColumns.slice();
            states.forEach((state) => {
                const colId = state.colId || '';
                // auto group columns are re-created so deferring syncing with ColumnState
                const isAutoGroupColumn = colId.startsWith(autoGroupColService_1.GROUP_AUTO_COLUMN_ID);
                if (isAutoGroupColumn) {
                    autoGroupColumnStates.push(state);
                    unmatchedAndAutoStates.push(state);
                    return;
                }
                const column = getById(colId);
                if (!column) {
                    unmatchedAndAutoStates.push(state);
                    unmatchedCount += 1;
                }
                else {
                    this.syncColumnWithStateItem(column, state, params.defaultState, rowGroupIndexes, pivotIndexes, false, source);
                    array_1.removeFromArray(columnsWithNoState, column);
                }
            });
            // anything left over, we got no data for, so add in the column as non-value, non-rowGroup and hidden
            const applyDefaultsFunc = (col) => this.syncColumnWithStateItem(col, null, params.defaultState, rowGroupIndexes, pivotIndexes, false, source);
            columnsWithNoState.forEach(applyDefaultsFunc);
            // sort the lists according to the indexes that were provided
            const comparator = (indexes, oldList, colA, colB) => {
                const indexA = indexes[colA.getId()];
                const indexB = indexes[colB.getId()];
                const aHasIndex = indexA != null;
                const bHasIndex = indexB != null;
                if (aHasIndex && bHasIndex) {
                    // both a and b are new cols with index, so sort on index
                    return indexA - indexB;
                }
                if (aHasIndex) {
                    // a has an index, so it should be before a
                    return -1;
                }
                if (bHasIndex) {
                    // b has an index, so it should be before a
                    return 1;
                }
                const oldIndexA = oldList.indexOf(colA);
                const oldIndexB = oldList.indexOf(colB);
                const aHasOldIndex = oldIndexA >= 0;
                const bHasOldIndex = oldIndexB >= 0;
                if (aHasOldIndex && bHasOldIndex) {
                    // both a and b are old cols, so sort based on last order
                    return oldIndexA - oldIndexB;
                }
                if (aHasOldIndex) {
                    // a is old, b is new, so b is first
                    return -1;
                }
                // this bit does matter, means both are new cols
                // but without index or that b is old and a is new
                return 1;
            };
            this.rowGroupColumns.sort(comparator.bind(this, rowGroupIndexes, previousRowGroupCols));
            this.pivotColumns.sort(comparator.bind(this, pivotIndexes, previousPivotCols));
            this.updateGridColumns();
            // sync newly created auto group columns with ColumnState
            const autoGroupColsCopy = this.groupAutoColumns ? this.groupAutoColumns.slice() : [];
            autoGroupColumnStates.forEach(stateItem => {
                const autoCol = this.getAutoColumn(stateItem.colId);
                array_1.removeFromArray(autoGroupColsCopy, autoCol);
                this.syncColumnWithStateItem(autoCol, stateItem, params.defaultState, null, null, true, source);
            });
            // autogroup cols with nothing else, apply the default
            autoGroupColsCopy.forEach(applyDefaultsFunc);
            this.applyOrderAfterApplyState(params);
            this.updateDisplayedColumns(source);
            this.dispatchEverythingChanged(source);
            dispatchEventsFunc(); // Will trigger secondary column changes if pivoting modified
            return { unmatchedAndAutoStates, unmatchedCount };
        };
        this.columnAnimationService.start();
        let { unmatchedAndAutoStates, unmatchedCount, } = applyStates(params.state || [], this.primaryColumns || [], (id) => this.getPrimaryColumn(id));
        // If there are still states left over, see if we can apply them to newly generated
        // secondary or auto columns. Also if defaults exist, ensure they are applied to secondary cols
        if (unmatchedAndAutoStates.length > 0 || generic_1.exists(params.defaultState)) {
            unmatchedCount = applyStates(unmatchedAndAutoStates, this.secondaryColumns || [], (id) => this.getSecondaryColumn(id)).unmatchedCount;
        }
        this.columnAnimationService.finish();
        return unmatchedCount === 0; // Successful if no states unaccounted for
    }
    applyOrderAfterApplyState(params) {
        if (!params.applyOrder || !params.state) {
            return;
        }
        let newOrder = [];
        const processedColIds = {};
        params.state.forEach(item => {
            if (!item.colId || processedColIds[item.colId]) {
                return;
            }
            const col = this.gridColumnsMap[item.colId];
            if (col) {
                newOrder.push(col);
                processedColIds[item.colId] = true;
            }
        });
        // add in all other columns
        let autoGroupInsertIndex = 0;
        this.gridColumns.forEach(col => {
            const colId = col.getColId();
            const alreadyProcessed = processedColIds[colId] != null;
            if (alreadyProcessed) {
                return;
            }
            const isAutoGroupCol = colId.startsWith(autoGroupColService_1.GROUP_AUTO_COLUMN_ID);
            if (isAutoGroupCol) {
                // auto group columns, if missing from state list, are added to the start.
                // it's common to have autoGroup missing, as grouping could be on by default
                // on a column, but the user could of since removed the grouping via the UI.
                // if we don't inc the insert index, autoGroups will be inserted in reverse order
                array_1.insertIntoArray(newOrder, col, autoGroupInsertIndex++);
            }
            else {
                // normal columns, if missing from state list, are added at the end
                newOrder.push(col);
            }
        });
        // this is already done in updateGridColumns, however we changed the order above (to match the order of the state
        // columns) so we need to do it again. we could of put logic into the order above to take into account fixed
        // columns, however if we did then we would have logic for updating fixed columns twice. reusing the logic here
        // is less sexy for the code here, but it keeps consistency.
        newOrder = this.placeLockedColumns(newOrder);
        if (!this.doesMovePassMarryChildren(newOrder)) {
            console.warn('AG Grid: Applying column order broke a group where columns should be married together. Applying new order has been discarded.');
            return;
        }
        this.gridColumns = newOrder;
    }
    compareColumnStatesAndDispatchEvents(source) {
        const startState = {
            rowGroupColumns: this.rowGroupColumns.slice(),
            pivotColumns: this.pivotColumns.slice(),
            valueColumns: this.valueColumns.slice()
        };
        const columnStateBefore = this.getColumnState();
        const columnStateBeforeMap = {};
        columnStateBefore.forEach(col => {
            columnStateBeforeMap[col.colId] = col;
        });
        return () => {
            const colsForState = this.getPrimaryAndSecondaryAndAutoColumns();
            // dispatches generic ColumnEvents where all columns are returned rather than what has changed
            const dispatchWhenListsDifferent = (eventType, colsBefore, colsAfter, idMapper) => {
                const beforeList = colsBefore.map(idMapper);
                const afterList = colsAfter.map(idMapper);
                const unchanged = array_1.areEqual(beforeList, afterList);
                if (unchanged) {
                    return;
                }
                // returning all columns rather than what has changed!
                const event = {
                    type: eventType,
                    columns: colsAfter,
                    column: colsAfter.length === 1 ? colsAfter[0] : null,
                    source: source
                };
                this.eventService.dispatchEvent(event);
            };
            // determines which columns have changed according to supplied predicate
            const getChangedColumns = (changedPredicate) => {
                const changedColumns = [];
                colsForState.forEach(column => {
                    const colStateBefore = columnStateBeforeMap[column.getColId()];
                    if (colStateBefore && changedPredicate(colStateBefore, column)) {
                        changedColumns.push(column);
                    }
                });
                return changedColumns;
            };
            const columnIdMapper = (c) => c.getColId();
            dispatchWhenListsDifferent(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, startState.rowGroupColumns, this.rowGroupColumns, columnIdMapper);
            dispatchWhenListsDifferent(events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, startState.pivotColumns, this.pivotColumns, columnIdMapper);
            const valueChangePredicate = (cs, c) => {
                const oldActive = cs.aggFunc != null;
                const activeChanged = oldActive != c.isValueActive();
                // we only check aggFunc if the agg is active
                const aggFuncChanged = oldActive && cs.aggFunc != c.getAggFunc();
                return activeChanged || aggFuncChanged;
            };
            const changedValues = getChangedColumns(valueChangePredicate);
            if (changedValues.length > 0) {
                // we pass all value columns, now the ones that changed. this is the same
                // as pivot and rowGroup cols, but different to all other properties below.
                // this is more for backwards compatibility, as it's always been this way.
                // really it should be the other way, as the order of the cols makes no difference
                // for valueColumns (apart from displaying them in the tool panel).
                this.dispatchColumnChangedEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.valueColumns, source);
            }
            const resizeChangePredicate = (cs, c) => cs.width != c.getActualWidth();
            this.dispatchColumnResizedEvent(getChangedColumns(resizeChangePredicate), true, source);
            const pinnedChangePredicate = (cs, c) => cs.pinned != c.getPinned();
            this.dispatchColumnPinnedEvent(getChangedColumns(pinnedChangePredicate), source);
            const visibilityChangePredicate = (cs, c) => cs.hide == c.isVisible();
            this.dispatchColumnVisibleEvent(getChangedColumns(visibilityChangePredicate), source);
            const sortChangePredicate = (cs, c) => cs.sort != c.getSort() || cs.sortIndex != c.getSortIndex();
            if (getChangedColumns(sortChangePredicate).length > 0) {
                this.sortController.dispatchSortChangedEvents(source);
            }
            // special handling for moved column events
            this.normaliseColumnMovedEventForColumnState(columnStateBefore, source);
        };
    }
    getCommonValue(cols, valueGetter) {
        if (!cols || cols.length == 0) {
            return undefined;
        }
        // compare each value to the first value. if nothing differs, then value is common so return it.
        const firstValue = valueGetter(cols[0]);
        for (let i = 1; i < cols.length; i++) {
            if (firstValue !== valueGetter(cols[i])) {
                // values differ, no common value
                return undefined;
            }
        }
        return firstValue;
    }
    normaliseColumnMovedEventForColumnState(colStateBefore, source) {
        // we are only interested in columns that were both present and visible before and after
        const colStateAfter = this.getColumnState();
        const colStateAfterMapped = {};
        colStateAfter.forEach(s => colStateAfterMapped[s.colId] = s);
        // get id's of cols in both before and after lists
        const colsIntersectIds = {};
        colStateBefore.forEach(s => {
            if (colStateAfterMapped[s.colId]) {
                colsIntersectIds[s.colId] = true;
            }
        });
        // filter state lists, so we only have cols that were present before and after
        const beforeFiltered = colStateBefore.filter(c => colsIntersectIds[c.colId]);
        const afterFiltered = colStateAfter.filter(c => colsIntersectIds[c.colId]);
        // see if any cols are in a different location
        const movedColumns = [];
        afterFiltered.forEach((csAfter, index) => {
            const csBefore = beforeFiltered && beforeFiltered[index];
            if (csBefore && csBefore.colId !== csAfter.colId) {
                const gridCol = this.getGridColumn(csBefore.colId);
                if (gridCol) {
                    movedColumns.push(gridCol);
                }
            }
        });
        if (!movedColumns.length) {
            return;
        }
        this.dispatchColumnMovedEvent({ movedColumns, source, finished: true });
    }
    syncColumnWithStateItem(column, stateItem, defaultState, rowGroupIndexes, pivotIndexes, autoCol, source) {
        if (!column) {
            return;
        }
        const getValue = (key1, key2) => {
            const obj = { value1: undefined, value2: undefined };
            let calculated = false;
            if (stateItem) {
                if (stateItem[key1] !== undefined) {
                    obj.value1 = stateItem[key1];
                    calculated = true;
                }
                if (generic_1.exists(key2) && stateItem[key2] !== undefined) {
                    obj.value2 = stateItem[key2];
                    calculated = true;
                }
            }
            if (!calculated && defaultState) {
                if (defaultState[key1] !== undefined) {
                    obj.value1 = defaultState[key1];
                }
                if (generic_1.exists(key2) && defaultState[key2] !== undefined) {
                    obj.value2 = defaultState[key2];
                }
            }
            return obj;
        };
        // following ensures we are left with boolean true or false, eg converts (null, undefined, 0) all to true
        const hide = getValue('hide').value1;
        if (hide !== undefined) {
            column.setVisible(!hide, source);
        }
        // sets pinned to 'left' or 'right'
        const pinned = getValue('pinned').value1;
        if (pinned !== undefined) {
            column.setPinned(pinned);
        }
        // if width provided and valid, use it, otherwise stick with the old width
        const minColWidth = this.columnUtils.calculateColMinWidth(column.getColDef());
        // flex
        const flex = getValue('flex').value1;
        if (flex !== undefined) {
            column.setFlex(flex);
        }
        // width - we only set width if column is not flexing
        const noFlexThisCol = column.getFlex() <= 0;
        if (noFlexThisCol) {
            // both null and undefined means we skip, as it's not possible to 'clear' width (a column must have a width)
            const width = getValue('width').value1;
            if (width != null) {
                if (minColWidth != null && width >= minColWidth) {
                    column.setActualWidth(width, source);
                }
            }
        }
        const sort = getValue('sort').value1;
        if (sort !== undefined) {
            if (sort === 'desc' || sort === 'asc') {
                column.setSort(sort, source);
            }
            else {
                column.setSort(undefined, source);
            }
        }
        const sortIndex = getValue('sortIndex').value1;
        if (sortIndex !== undefined) {
            column.setSortIndex(sortIndex);
        }
        // we do not do aggFunc, rowGroup or pivot for auto cols or secondary cols
        if (autoCol || !column.isPrimary()) {
            return;
        }
        const aggFunc = getValue('aggFunc').value1;
        if (aggFunc !== undefined) {
            if (typeof aggFunc === 'string') {
                column.setAggFunc(aggFunc);
                if (!column.isValueActive()) {
                    column.setValueActive(true, source);
                    this.valueColumns.push(column);
                }
            }
            else {
                if (generic_1.exists(aggFunc)) {
                    console.warn('AG Grid: stateItem.aggFunc must be a string. if using your own aggregation ' +
                        'functions, register the functions first before using them in get/set state. This is because it is ' +
                        'intended for the column state to be stored and retrieved as simple JSON.');
                }
                // Note: we do not call column.setAggFunc(null), so that next time we aggregate
                // by this column (eg drag the column to the agg section int he toolpanel) it will
                // default to the last aggregation function.
                if (column.isValueActive()) {
                    column.setValueActive(false, source);
                    array_1.removeFromArray(this.valueColumns, column);
                }
            }
        }
        const { value1: rowGroup, value2: rowGroupIndex } = getValue('rowGroup', 'rowGroupIndex');
        if (rowGroup !== undefined || rowGroupIndex !== undefined) {
            if (typeof rowGroupIndex === 'number' || rowGroup) {
                if (!column.isRowGroupActive()) {
                    column.setRowGroupActive(true, source);
                    this.rowGroupColumns.push(column);
                }
                if (rowGroupIndexes && typeof rowGroupIndex === 'number') {
                    rowGroupIndexes[column.getId()] = rowGroupIndex;
                }
            }
            else {
                if (column.isRowGroupActive()) {
                    column.setRowGroupActive(false, source);
                    array_1.removeFromArray(this.rowGroupColumns, column);
                }
            }
        }
        const { value1: pivot, value2: pivotIndex } = getValue('pivot', 'pivotIndex');
        if (pivot !== undefined || pivotIndex !== undefined) {
            if (typeof pivotIndex === 'number' || pivot) {
                if (!column.isPivotActive()) {
                    column.setPivotActive(true, source);
                    this.pivotColumns.push(column);
                }
                if (pivotIndexes && typeof pivotIndex === 'number') {
                    pivotIndexes[column.getId()] = pivotIndex;
                }
            }
            else {
                if (column.isPivotActive()) {
                    column.setPivotActive(false, source);
                    array_1.removeFromArray(this.pivotColumns, column);
                }
            }
        }
    }
    getGridColumns(keys) {
        return this.getColumns(keys, this.getGridColumn.bind(this));
    }
    getColumns(keys, columnLookupCallback) {
        const foundColumns = [];
        if (keys) {
            keys.forEach((key) => {
                const column = columnLookupCallback(key);
                if (column) {
                    foundColumns.push(column);
                }
            });
        }
        return foundColumns;
    }
    // used by growGroupPanel
    getColumnWithValidation(key) {
        if (key == null) {
            return null;
        }
        const column = this.getGridColumn(key);
        if (!column) {
            console.warn('AG Grid: could not find column ' + key);
        }
        return column;
    }
    getPrimaryColumn(key) {
        if (!this.primaryColumns) {
            return null;
        }
        return this.getColumn(key, this.primaryColumns, this.primaryColumnsMap);
    }
    getGridColumn(key) {
        return this.getColumn(key, this.gridColumns, this.gridColumnsMap);
    }
    getSecondaryColumn(key) {
        if (!this.secondaryColumns) {
            return null;
        }
        return this.getColumn(key, this.secondaryColumns, this.secondaryColumnsMap);
    }
    getColumn(key, columnList, columnMap) {
        if (!key) {
            return null;
        }
        // most of the time this method gets called the key is a string, so we put this shortcut in
        // for performance reasons, to see if we can match for ID (it doesn't do auto columns, that's done below)
        if (typeof key == 'string' && columnMap[key]) {
            return columnMap[key];
        }
        for (let i = 0; i < columnList.length; i++) {
            if (this.columnsMatch(columnList[i], key)) {
                return columnList[i];
            }
        }
        return this.getAutoColumn(key);
    }
    getSourceColumnsForGroupColumn(groupCol) {
        const sourceColumnId = groupCol.getColDef().showRowGroup;
        if (!sourceColumnId) {
            return null;
        }
        if (sourceColumnId === true) {
            return this.rowGroupColumns.slice(0);
        }
        const column = this.getPrimaryColumn(sourceColumnId);
        return column ? [column] : null;
    }
    getAutoColumn(key) {
        if (!this.groupAutoColumns ||
            !generic_1.exists(this.groupAutoColumns) ||
            generic_1.missing(this.groupAutoColumns)) {
            return null;
        }
        return this.groupAutoColumns.find(groupCol => this.columnsMatch(groupCol, key)) || null;
    }
    columnsMatch(column, key) {
        const columnMatches = column === key;
        const colDefMatches = column.getColDef() === key;
        const idMatches = column.getColId() == key;
        return columnMatches || colDefMatches || idMatches;
    }
    getDisplayNameForColumn(column, location, includeAggFunc = false) {
        if (!column) {
            return null;
        }
        const headerName = this.getHeaderName(column.getColDef(), column, null, null, location);
        if (includeAggFunc) {
            return this.wrapHeaderNameWithAggFunc(column, headerName);
        }
        return headerName;
    }
    getDisplayNameForProvidedColumnGroup(columnGroup, providedColumnGroup, location) {
        const colGroupDef = providedColumnGroup ? providedColumnGroup.getColGroupDef() : null;
        if (colGroupDef) {
            return this.getHeaderName(colGroupDef, null, columnGroup, providedColumnGroup, location);
        }
        return null;
    }
    getDisplayNameForColumnGroup(columnGroup, location) {
        return this.getDisplayNameForProvidedColumnGroup(columnGroup, columnGroup.getProvidedColumnGroup(), location);
    }
    // location is where the column is going to appear, ie who is calling us
    getHeaderName(colDef, column, columnGroup, providedColumnGroup, location) {
        const headerValueGetter = colDef.headerValueGetter;
        if (headerValueGetter) {
            const params = {
                colDef: colDef,
                column: column,
                columnGroup: columnGroup,
                providedColumnGroup: providedColumnGroup,
                location: location,
                api: this.gridOptionsService.api,
                columnApi: this.gridOptionsService.columnApi,
                context: this.gridOptionsService.context
            };
            if (typeof headerValueGetter === 'function') {
                // valueGetter is a function, so just call it
                return headerValueGetter(params);
            }
            else if (typeof headerValueGetter === 'string') {
                // valueGetter is an expression, so execute the expression
                return this.expressionService.evaluate(headerValueGetter, params);
            }
            console.warn('AG Grid: headerValueGetter must be a function or a string');
            return '';
        }
        else if (colDef.headerName != null) {
            return colDef.headerName;
        }
        else if (colDef.field) {
            return string_1.camelCaseToHumanText(colDef.field);
        }
        return '';
    }
    wrapHeaderNameWithAggFunc(column, headerName) {
        if (this.gridOptionsService.is('suppressAggFuncInHeader')) {
            return headerName;
        }
        // only columns with aggregation active can have aggregations
        const pivotValueColumn = column.getColDef().pivotValueColumn;
        const pivotActiveOnThisColumn = generic_1.exists(pivotValueColumn);
        let aggFunc = null;
        let aggFuncFound;
        // otherwise we have a measure that is active, and we are doing aggregation on it
        if (pivotActiveOnThisColumn) {
            const isCollapsedHeaderEnabled = this.gridOptionsService.is('removePivotHeaderRowWhenSingleValueColumn') && this.valueColumns.length === 1;
            const isTotalColumn = column.getColDef().pivotTotalColumnIds !== undefined;
            if (isCollapsedHeaderEnabled && !isTotalColumn) {
                return headerName; // Skip decorating the header - in this case the label is the pivot key, not the value col
            }
            aggFunc = pivotValueColumn ? pivotValueColumn.getAggFunc() : null;
            aggFuncFound = true;
        }
        else {
            const measureActive = column.isValueActive();
            const aggregationPresent = this.pivotMode || !this.isRowGroupEmpty();
            if (measureActive && aggregationPresent) {
                aggFunc = column.getAggFunc();
                aggFuncFound = true;
            }
            else {
                aggFuncFound = false;
            }
        }
        if (aggFuncFound) {
            const aggFuncString = (typeof aggFunc === 'string') ? aggFunc : 'func';
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            const aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);
            return `${aggFuncStringTranslated}(${headerName})`;
        }
        return headerName;
    }
    // returns the group with matching colId and instanceId. If instanceId is missing,
    // matches only on the colId.
    getColumnGroup(colId, partId) {
        if (!colId) {
            return null;
        }
        if (colId instanceof columnGroup_1.ColumnGroup) {
            return colId;
        }
        const allColumnGroups = this.getAllDisplayedTrees();
        const checkPartId = typeof partId === 'number';
        let result = null;
        this.columnUtils.depthFirstAllColumnTreeSearch(allColumnGroups, (child) => {
            if (child instanceof columnGroup_1.ColumnGroup) {
                const columnGroup = child;
                let matched;
                if (checkPartId) {
                    matched = colId === columnGroup.getGroupId() && partId === columnGroup.getPartId();
                }
                else {
                    matched = colId === columnGroup.getGroupId();
                }
                if (matched) {
                    result = columnGroup;
                }
            }
        });
        return result;
    }
    isReady() {
        return this.ready;
    }
    extractValueColumns(source, oldPrimaryColumns) {
        this.valueColumns = this.extractColumns(oldPrimaryColumns, this.valueColumns, (col, flag) => col.setValueActive(flag, source), 
        // aggFunc doesn't have index variant, cos order of value cols doesn't matter, so always return null
        () => undefined, () => undefined, 
        // aggFunc is a string, so return it's existence
        (colDef) => {
            const aggFunc = colDef.aggFunc;
            // null or empty string means clear
            if (aggFunc === null || aggFunc === '') {
                return null;
            }
            if (aggFunc === undefined) {
                return;
            }
            return !!aggFunc;
        }, (colDef) => {
            // return false if any of the following: null, undefined, empty string
            return colDef.initialAggFunc != null && colDef.initialAggFunc != '';
        });
        // all new columns added will have aggFunc missing, so set it to what is in the colDef
        this.valueColumns.forEach(col => {
            const colDef = col.getColDef();
            // if aggFunc provided, we always override, as reactive property
            if (colDef.aggFunc != null && colDef.aggFunc != '') {
                col.setAggFunc(colDef.aggFunc);
            }
            else {
                // otherwise we use initialAggFunc only if no agg func set - which happens when new column only
                if (!col.getAggFunc()) {
                    col.setAggFunc(colDef.initialAggFunc);
                }
            }
        });
    }
    extractRowGroupColumns(source, oldPrimaryColumns) {
        this.rowGroupColumns = this.extractColumns(oldPrimaryColumns, this.rowGroupColumns, (col, flag) => col.setRowGroupActive(flag, source), (colDef) => colDef.rowGroupIndex, (colDef) => colDef.initialRowGroupIndex, (colDef) => colDef.rowGroup, (colDef) => colDef.initialRowGroup);
    }
    extractColumns(oldPrimaryColumns = [], previousCols = [], setFlagFunc, getIndexFunc, getInitialIndexFunc, getValueFunc, getInitialValueFunc) {
        const colsWithIndex = [];
        const colsWithValue = [];
        // go though all cols.
        // if value, change
        // if default only, change only if new
        (this.primaryColumns || []).forEach(col => {
            const colIsNew = oldPrimaryColumns.indexOf(col) < 0;
            const colDef = col.getColDef();
            const value = generic_1.attrToBoolean(getValueFunc(colDef));
            const initialValue = generic_1.attrToBoolean(getInitialValueFunc(colDef));
            const index = generic_1.attrToNumber(getIndexFunc(colDef));
            const initialIndex = generic_1.attrToNumber(getInitialIndexFunc(colDef));
            let include;
            const valuePresent = value !== undefined;
            const indexPresent = index !== undefined;
            const initialValuePresent = initialValue !== undefined;
            const initialIndexPresent = initialIndex !== undefined;
            if (valuePresent) {
                include = value; // boolean value is guaranteed as attrToBoolean() is used above
            }
            else if (indexPresent) {
                if (index === null) {
                    // if col is new we don't want to use the default / initial if index is set to null. Similarly,
                    // we don't want to include the property for existing columns, i.e. we want to 'clear' it.
                    include = false;
                }
                else {
                    // note that 'null >= 0' evaluates to true which means 'rowGroupIndex = null' would enable row
                    // grouping if the null check didn't exist above.
                    include = index >= 0;
                }
            }
            else {
                if (colIsNew) {
                    // as no value or index is 'present' we use the default / initial when col is new
                    if (initialValuePresent) {
                        include = initialValue;
                    }
                    else if (initialIndexPresent) {
                        include = initialIndex != null && initialIndex >= 0;
                    }
                    else {
                        include = false;
                    }
                }
                else {
                    // otherwise include it if included last time, e.g. if we are extracting row group cols and this col
                    // is an existing row group col (i.e. it exists in 'previousCols') then we should include it.
                    include = previousCols.indexOf(col) >= 0;
                }
            }
            if (include) {
                const useIndex = colIsNew ? (index != null || initialIndex != null) : index != null;
                useIndex ? colsWithIndex.push(col) : colsWithValue.push(col);
            }
        });
        const getIndexForCol = (col) => {
            const index = getIndexFunc(col.getColDef());
            const defaultIndex = getInitialIndexFunc(col.getColDef());
            return index != null ? index : defaultIndex;
        };
        // sort cols with index, and add these first
        colsWithIndex.sort((colA, colB) => {
            const indexA = getIndexForCol(colA);
            const indexB = getIndexForCol(colB);
            if (indexA === indexB) {
                return 0;
            }
            if (indexA < indexB) {
                return -1;
            }
            return 1;
        });
        const res = [].concat(colsWithIndex);
        // second add columns that were there before and in the same order as they were before,
        // so we are preserving order of current grouping of columns that simply have rowGroup=true
        previousCols.forEach(col => {
            if (colsWithValue.indexOf(col) >= 0) {
                res.push(col);
            }
        });
        // lastly put in all remaining cols
        colsWithValue.forEach(col => {
            if (res.indexOf(col) < 0) {
                res.push(col);
            }
        });
        // set flag=false for removed cols
        previousCols.forEach(col => {
            if (res.indexOf(col) < 0) {
                setFlagFunc(col, false);
            }
        });
        // set flag=true for newly added cols
        res.forEach(col => {
            if (previousCols.indexOf(col) < 0) {
                setFlagFunc(col, true);
            }
        });
        return res;
    }
    extractPivotColumns(source, oldPrimaryColumns) {
        this.pivotColumns = this.extractColumns(oldPrimaryColumns, this.pivotColumns, (col, flag) => col.setPivotActive(flag, source), (colDef) => colDef.pivotIndex, (colDef) => colDef.initialPivotIndex, (colDef) => colDef.pivot, (colDef) => colDef.initialPivot);
    }
    resetColumnGroupState(source = "api") {
        const stateItems = [];
        this.columnUtils.depthFirstOriginalTreeSearch(null, this.primaryColumnTree, child => {
            if (child instanceof providedColumnGroup_1.ProvidedColumnGroup) {
                const colGroupDef = child.getColGroupDef();
                const groupState = {
                    groupId: child.getGroupId(),
                    open: !colGroupDef ? undefined : colGroupDef.openByDefault
                };
                stateItems.push(groupState);
            }
        });
        this.setColumnGroupState(stateItems, source);
    }
    getColumnGroupState() {
        const columnGroupState = [];
        this.columnUtils.depthFirstOriginalTreeSearch(null, this.gridBalancedTree, node => {
            if (node instanceof providedColumnGroup_1.ProvidedColumnGroup) {
                columnGroupState.push({
                    groupId: node.getGroupId(),
                    open: node.isExpanded()
                });
            }
        });
        return columnGroupState;
    }
    setColumnGroupState(stateItems, source = "api") {
        this.columnAnimationService.start();
        const impactedGroups = [];
        stateItems.forEach(stateItem => {
            const groupKey = stateItem.groupId;
            const newValue = stateItem.open;
            const providedColumnGroup = this.getProvidedColumnGroup(groupKey);
            if (!providedColumnGroup) {
                return;
            }
            if (providedColumnGroup.isExpanded() === newValue) {
                return;
            }
            this.logger.log('columnGroupOpened(' + providedColumnGroup.getGroupId() + ',' + newValue + ')');
            providedColumnGroup.setExpanded(newValue);
            impactedGroups.push(providedColumnGroup);
        });
        this.updateGroupsAndDisplayedColumns(source);
        this.setFirstRightAndLastLeftPinned(source);
        impactedGroups.forEach(providedColumnGroup => {
            const event = {
                type: events_1.Events.EVENT_COLUMN_GROUP_OPENED,
                columnGroup: providedColumnGroup
            };
            this.eventService.dispatchEvent(event);
        });
        this.columnAnimationService.finish();
    }
    // called by headerRenderer - when a header is opened or closed
    setColumnGroupOpened(key, newValue, source = "api") {
        let keyAsString;
        if (key instanceof providedColumnGroup_1.ProvidedColumnGroup) {
            keyAsString = key.getId();
        }
        else {
            keyAsString = key || '';
        }
        this.setColumnGroupState([{ groupId: keyAsString, open: newValue }], source);
    }
    getProvidedColumnGroup(key) {
        // if (key instanceof ProvidedColumnGroup) { return key; }
        if (typeof key !== 'string') {
            console.error('AG Grid: group key must be a string');
        }
        // otherwise, search for the column group by id
        let res = null;
        this.columnUtils.depthFirstOriginalTreeSearch(null, this.gridBalancedTree, node => {
            if (node instanceof providedColumnGroup_1.ProvidedColumnGroup) {
                if (node.getId() === key) {
                    res = node;
                }
            }
        });
        return res;
    }
    calculateColumnsForDisplay() {
        let columnsForDisplay;
        if (this.pivotMode && generic_1.missing(this.secondaryColumns)) {
            // pivot mode is on, but we are not pivoting, so we only
            // show columns we are aggregating on
            columnsForDisplay = this.gridColumns.filter(column => {
                const isAutoGroupCol = this.groupAutoColumns && array_1.includes(this.groupAutoColumns, column);
                const isValueCol = this.valueColumns && array_1.includes(this.valueColumns, column);
                return isAutoGroupCol || isValueCol;
            });
        }
        else {
            // otherwise continue as normal. this can be working on the primary
            // or secondary columns, whatever the gridColumns are set to
            columnsForDisplay = this.gridColumns.filter(column => {
                // keep col if a) it's auto-group or b) it's visible
                const isAutoGroupCol = this.groupAutoColumns && array_1.includes(this.groupAutoColumns, column);
                return isAutoGroupCol || column.isVisible();
            });
        }
        return columnsForDisplay;
    }
    checkColSpanActiveInCols(columns) {
        let result = false;
        columns.forEach(col => {
            if (generic_1.exists(col.getColDef().colSpan)) {
                result = true;
            }
        });
        return result;
    }
    calculateColumnsForGroupDisplay() {
        this.groupDisplayColumns = [];
        this.groupDisplayColumnsMap = {};
        const checkFunc = (col) => {
            const colDef = col.getColDef();
            const underlyingColumn = colDef.showRowGroup;
            if (colDef && generic_1.exists(underlyingColumn)) {
                this.groupDisplayColumns.push(col);
                if (typeof underlyingColumn === 'string') {
                    this.groupDisplayColumnsMap[underlyingColumn] = col;
                }
                else if (underlyingColumn === true) {
                    this.getRowGroupColumns().forEach(rowGroupCol => {
                        this.groupDisplayColumnsMap[rowGroupCol.getId()] = col;
                    });
                }
            }
        };
        this.gridColumns.forEach(checkFunc);
        if (this.groupAutoColumns) {
            this.groupAutoColumns.forEach(checkFunc);
        }
    }
    getGroupDisplayColumns() {
        return this.groupDisplayColumns;
    }
    getGroupDisplayColumnForGroup(rowGroupColumnId) {
        return this.groupDisplayColumnsMap[rowGroupColumnId];
    }
    updateDisplayedColumns(source) {
        const columnsForDisplay = this.calculateColumnsForDisplay();
        this.buildDisplayedTrees(columnsForDisplay);
        this.calculateColumnsForGroupDisplay();
        // also called when group opened/closed
        this.updateGroupsAndDisplayedColumns(source);
        // also called when group opened/closed
        this.setFirstRightAndLastLeftPinned(source);
    }
    isSecondaryColumnsPresent() {
        return generic_1.exists(this.secondaryColumns);
    }
    setSecondaryColumns(colDefs, source = "api") {
        const newColsPresent = colDefs && colDefs.length > 0;
        // if not cols passed, and we had no cols anyway, then do nothing
        if (!newColsPresent && generic_1.missing(this.secondaryColumns)) {
            return;
        }
        if (newColsPresent) {
            this.processSecondaryColumnDefinitions(colDefs);
            const balancedTreeResult = this.columnFactory.createColumnTree(colDefs, false, this.secondaryBalancedTree || this.previousSecondaryColumns || undefined);
            this.destroyOldColumns(this.secondaryBalancedTree, balancedTreeResult.columnTree);
            this.secondaryBalancedTree = balancedTreeResult.columnTree;
            this.secondaryHeaderRowCount = balancedTreeResult.treeDept + 1;
            this.secondaryColumns = this.getColumnsFromTree(this.secondaryBalancedTree);
            this.secondaryColumnsMap = {};
            this.secondaryColumns.forEach(col => this.secondaryColumnsMap[col.getId()] = col);
            this.previousSecondaryColumns = null;
        }
        else {
            this.previousSecondaryColumns = this.secondaryBalancedTree;
            this.secondaryBalancedTree = null;
            this.secondaryHeaderRowCount = -1;
            this.secondaryColumns = null;
            this.secondaryColumnsMap = {};
        }
        this.updateGridColumns();
        this.updateDisplayedColumns(source);
    }
    processSecondaryColumnDefinitions(colDefs) {
        const columnCallback = this.gridOptionsService.get('processPivotResultColDef') || this.gridOptionsService.get('processSecondaryColDef');
        const groupCallback = this.gridOptionsService.get('processPivotResultColGroupDef') || this.gridOptionsService.get('processSecondaryColGroupDef');
        if (!columnCallback && !groupCallback) {
            return undefined;
        }
        const searchForColDefs = (colDefs2) => {
            colDefs2.forEach((abstractColDef) => {
                const isGroup = generic_1.exists(abstractColDef.children);
                if (isGroup) {
                    const colGroupDef = abstractColDef;
                    if (groupCallback) {
                        groupCallback(colGroupDef);
                    }
                    searchForColDefs(colGroupDef.children);
                }
                else {
                    const colDef = abstractColDef;
                    if (columnCallback) {
                        columnCallback(colDef);
                    }
                }
            });
        };
        if (colDefs) {
            searchForColDefs(colDefs);
        }
    }
    // called from: applyColumnState, setColumnDefs, setSecondaryColumns
    updateGridColumns() {
        const prevGridCols = this.gridBalancedTree;
        if (this.gridColsArePrimary) {
            this.lastPrimaryOrder = this.gridColumns;
        }
        else {
            this.lastSecondaryOrder = this.gridColumns;
        }
        let sortOrderToRecover = undefined;
        if (this.secondaryColumns && this.secondaryBalancedTree) {
            const hasSameColumns = this.secondaryColumns.every((col) => {
                return this.gridColumnsMap[col.getColId()] !== undefined;
            });
            this.gridBalancedTree = this.secondaryBalancedTree.slice();
            this.gridHeaderRowCount = this.secondaryHeaderRowCount;
            this.gridColumns = this.secondaryColumns.slice();
            this.gridColsArePrimary = false;
            // If the current columns are the same or a subset of the previous
            // we keep the previous order, otherwise we go back to the order the pivot
            // cols are generated in
            if (hasSameColumns) {
                sortOrderToRecover = this.lastSecondaryOrder;
            }
        }
        else if (this.primaryColumns) {
            this.gridBalancedTree = this.primaryColumnTree.slice();
            this.gridHeaderRowCount = this.primaryHeaderRowCount;
            this.gridColumns = this.primaryColumns.slice();
            this.gridColsArePrimary = true;
            // updateGridColumns gets called after user adds a row group. we want to maintain the order of the columns
            // when this happens (eg if user moved a column) rather than revert back to the original column order.
            // likewise if changing in/out of pivot mode, we want to maintain the order of the cols
            sortOrderToRecover = this.lastPrimaryOrder;
        }
        // create the new auto columns
        const areAutoColsChanged = this.createGroupAutoColumnsIfNeeded();
        // if auto group cols have changed, and we have a sort order, we need to move auto cols to the start
        if (areAutoColsChanged && sortOrderToRecover) {
            const groupAutoColsMap = map_1.convertToMap(this.groupAutoColumns.map(col => [col, true]));
            // if group columns has changed, we don't preserve the group column order, so remove them from the old order
            sortOrderToRecover = sortOrderToRecover.filter(col => !groupAutoColsMap.has(col));
            // and add them to the start of the order
            sortOrderToRecover = [...this.groupAutoColumns, ...sortOrderToRecover];
        }
        this.addAutoGroupToGridColumns();
        this.orderGridColsLike(sortOrderToRecover);
        this.gridColumns = this.placeLockedColumns(this.gridColumns);
        this.refreshQuickFilterColumns();
        this.clearDisplayedAndViewportColumns();
        this.colSpanActive = this.checkColSpanActiveInCols(this.gridColumns);
        this.gridColumnsMap = {};
        this.gridColumns.forEach(col => this.gridColumnsMap[col.getId()] = col);
        this.setAutoHeightActive();
        if (!array_1.areEqual(prevGridCols, this.gridBalancedTree)) {
            const event = {
                type: events_1.Events.EVENT_GRID_COLUMNS_CHANGED
            };
            this.eventService.dispatchEvent(event);
        }
    }
    setAutoHeightActive() {
        this.autoHeightActive = this.gridColumns.filter(col => col.isAutoHeight()).length > 0;
        if (this.autoHeightActive) {
            this.autoHeightActiveAtLeastOnce = true;
            const rowModelType = this.rowModel.getType();
            const supportedRowModel = rowModelType === 'clientSide' || rowModelType === 'serverSide';
            if (!supportedRowModel) {
                const message = 'AG Grid - autoHeight columns only work with Client Side Row Model and Server Side Row Model.';
                function_1.doOnce(() => console.warn(message), 'autoHeightActive.wrongRowModel');
            }
        }
    }
    orderGridColsLike(colsOrder) {
        if (generic_1.missing(colsOrder)) {
            return;
        }
        const lastOrderMapped = map_1.convertToMap(colsOrder.map((col, index) => [col, index]));
        // only do the sort if at least one column is accounted for. columns will be not accounted for
        // if changing from secondary to primary columns
        let noColsFound = true;
        this.gridColumns.forEach(col => {
            if (lastOrderMapped.has(col)) {
                noColsFound = false;
            }
        });
        if (noColsFound) {
            return;
        }
        // order cols in the same order as before. we need to make sure that all
        // cols still exists, so filter out any that no longer exist.
        const gridColsMap = map_1.convertToMap(this.gridColumns.map(col => [col, true]));
        const oldColsOrdered = colsOrder.filter(col => gridColsMap.has(col));
        const oldColsMap = map_1.convertToMap(oldColsOrdered.map(col => [col, true]));
        const newColsOrdered = this.gridColumns.filter(col => !oldColsMap.has(col));
        // add in the new columns, at the end (if no group), or at the end of the group (if a group)
        const newGridColumns = oldColsOrdered.slice();
        newColsOrdered.forEach(newCol => {
            let parent = newCol.getOriginalParent();
            // if no parent, means we are not grouping, so just add the column to the end
            if (!parent) {
                newGridColumns.push(newCol);
                return;
            }
            // find the group the column belongs to. if no siblings at the current level (eg col in group on it's
            // own) then go up one level and look for siblings there.
            const siblings = [];
            while (!siblings.length && parent) {
                const leafCols = parent.getLeafColumns();
                leafCols.forEach(leafCol => {
                    const presentInNewGriColumns = newGridColumns.indexOf(leafCol) >= 0;
                    const noYetInSiblings = siblings.indexOf(leafCol) < 0;
                    if (presentInNewGriColumns && noYetInSiblings) {
                        siblings.push(leafCol);
                    }
                });
                parent = parent.getOriginalParent();
            }
            // if no siblings exist at any level, this means the col is in a group (or parent groups) on it's own
            if (!siblings.length) {
                newGridColumns.push(newCol);
                return;
            }
            // find index of last column in the group
            const indexes = siblings.map(col => newGridColumns.indexOf(col));
            const lastIndex = Math.max(...indexes);
            array_1.insertIntoArray(newGridColumns, newCol, lastIndex + 1);
        });
        this.gridColumns = newGridColumns;
    }
    isPrimaryColumnGroupsPresent() {
        return this.primaryHeaderRowCount > 1;
    }
    // if we are using autoGroupCols, then they should be included for quick filter. this covers the
    // following scenarios:
    // a) user provides 'field' into autoGroupCol of normal grid, so now because a valid col to filter leafs on
    // b) using tree data and user depends on autoGroupCol for first col, and we also want to filter on this
    //    (tree data is a bit different, as parent rows can be filtered on, unlike row grouping)
    refreshQuickFilterColumns() {
        var _a;
        let columnsForQuickFilter;
        if (this.groupAutoColumns) {
            columnsForQuickFilter = ((_a = this.primaryColumns) !== null && _a !== void 0 ? _a : []).concat(this.groupAutoColumns);
        }
        else if (this.primaryColumns) {
            columnsForQuickFilter = this.primaryColumns;
        }
        columnsForQuickFilter = columnsForQuickFilter !== null && columnsForQuickFilter !== void 0 ? columnsForQuickFilter : [];
        this.columnsForQuickFilter = this.gridOptionsService.is('excludeHiddenColumnsFromQuickFilter')
            ? columnsForQuickFilter.filter(col => col.isVisible())
            : columnsForQuickFilter;
    }
    placeLockedColumns(cols) {
        const left = [];
        const normal = [];
        const right = [];
        cols.forEach((col) => {
            const position = col.getColDef().lockPosition;
            if (position === 'right') {
                right.push(col);
            }
            else if (position === 'left' || position === true) {
                left.push(col);
            }
            else {
                normal.push(col);
            }
        });
        return [...left, ...normal, ...right];
    }
    addAutoGroupToGridColumns() {
        if (generic_1.missing(this.groupAutoColumns)) {
            this.destroyOldColumns(this.groupAutoColsBalancedTree);
            this.groupAutoColsBalancedTree = null;
            return;
        }
        this.gridColumns = this.groupAutoColumns ? this.groupAutoColumns.concat(this.gridColumns) : this.gridColumns;
        const newAutoColsTree = this.columnFactory.createForAutoGroups(this.groupAutoColumns, this.gridBalancedTree);
        this.destroyOldColumns(this.groupAutoColsBalancedTree, newAutoColsTree);
        this.groupAutoColsBalancedTree = newAutoColsTree;
        this.gridBalancedTree = newAutoColsTree.concat(this.gridBalancedTree);
    }
    // gets called after we copy down grid columns, to make sure any part of the gui
    // that tries to draw, eg the header, it will get empty lists of columns rather
    // than stale columns. for example, the header will received gridColumnsChanged
    // event, so will try and draw, but it will draw successfully when it acts on the
    // virtualColumnsChanged event
    clearDisplayedAndViewportColumns() {
        this.viewportRowLeft = {};
        this.viewportRowRight = {};
        this.viewportRowCenter = {};
        this.displayedColumnsLeft = [];
        this.displayedColumnsRight = [];
        this.displayedColumnsCenter = [];
        this.displayedColumns = [];
        this.viewportColumns = [];
        this.headerViewportColumns = [];
        this.viewportColumnsHash = '';
    }
    updateGroupsAndDisplayedColumns(source) {
        this.updateOpenClosedVisibilityInColumnGroups();
        this.deriveDisplayedColumns(source);
        this.refreshFlexedColumns();
        this.extractViewport();
        this.updateBodyWidths();
        // this event is picked up by the gui, headerRenderer and rowRenderer, to recalculate what columns to display
        const event = {
            type: events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED
        };
        this.eventService.dispatchEvent(event);
    }
    deriveDisplayedColumns(source) {
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeLeft, this.displayedColumnsLeft);
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeCentre, this.displayedColumnsCenter);
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeRight, this.displayedColumnsRight);
        this.joinDisplayedColumns();
        this.setLeftValues(source);
        this.displayedAutoHeightCols = this.displayedColumns.filter(col => col.isAutoHeight());
    }
    isAutoRowHeightActive() {
        return this.autoHeightActive;
    }
    wasAutoRowHeightEverActive() {
        return this.autoHeightActiveAtLeastOnce;
    }
    joinDisplayedColumns() {
        if (this.gridOptionsService.is('enableRtl')) {
            this.displayedColumns = this.displayedColumnsRight
                .concat(this.displayedColumnsCenter)
                .concat(this.displayedColumnsLeft);
        }
        else {
            this.displayedColumns = this.displayedColumnsLeft
                .concat(this.displayedColumnsCenter)
                .concat(this.displayedColumnsRight);
        }
    }
    // sets the left pixel position of each column
    setLeftValues(source) {
        this.setLeftValuesOfColumns(source);
        this.setLeftValuesOfGroups();
    }
    setLeftValuesOfColumns(source) {
        if (!this.primaryColumns) {
            return;
        }
        // go through each list of displayed columns
        const allColumns = this.primaryColumns.slice(0);
        // let totalColumnWidth = this.getWidthOfColsInList()
        const doingRtl = this.gridOptionsService.is('enableRtl');
        [
            this.displayedColumnsLeft,
            this.displayedColumnsRight,
            this.displayedColumnsCenter
        ].forEach(columns => {
            if (doingRtl) {
                // when doing RTL, we start at the top most pixel (ie RHS) and work backwards
                let left = this.getWidthOfColsInList(columns);
                columns.forEach(column => {
                    left -= column.getActualWidth();
                    column.setLeft(left, source);
                });
            }
            else {
                // otherwise normal LTR, we start at zero
                let left = 0;
                columns.forEach(column => {
                    column.setLeft(left, source);
                    left += column.getActualWidth();
                });
            }
            array_1.removeAllFromArray(allColumns, columns);
        });
        // items left in allColumns are columns not displayed, so remove the left position. this is
        // important for the rows, as if a col is made visible, then taken out, then made visible again,
        // we don't want the animation of the cell floating in from the old position, whatever that was.
        allColumns.forEach((column) => {
            column.setLeft(null, source);
        });
    }
    setLeftValuesOfGroups() {
        // a groups left value is the lest left value of it's children
        [
            this.displayedTreeLeft,
            this.displayedTreeRight,
            this.displayedTreeCentre
        ].forEach(columns => {
            columns.forEach(column => {
                if (column instanceof columnGroup_1.ColumnGroup) {
                    const columnGroup = column;
                    columnGroup.checkLeft();
                }
            });
        });
    }
    derivedDisplayedColumnsFromDisplayedTree(tree, columns) {
        columns.length = 0;
        this.columnUtils.depthFirstDisplayedColumnTreeSearch(tree, (child) => {
            if (child instanceof column_1.Column) {
                columns.push(child);
            }
        });
    }
    extractViewportColumns() {
        if (this.suppressColumnVirtualisation) {
            // no virtualisation, so don't filter
            this.viewportColumnsCenter = this.displayedColumnsCenter;
            this.headerViewportColumnsCenter = this.displayedColumnsCenter;
        }
        else {
            // filter out what should be visible
            this.viewportColumnsCenter = this.displayedColumnsCenter.filter(this.isColumnInRowViewport.bind(this));
            this.headerViewportColumnsCenter = this.displayedColumnsCenter.filter(this.isColumnInHeaderViewport.bind(this));
        }
        this.viewportColumns = this.viewportColumnsCenter
            .concat(this.displayedColumnsLeft)
            .concat(this.displayedColumnsRight);
        this.headerViewportColumns = this.headerViewportColumnsCenter
            .concat(this.displayedColumnsLeft)
            .concat(this.displayedColumnsRight);
    }
    getVirtualHeaderGroupRow(type, dept) {
        let result;
        switch (type) {
            case 'left':
                result = this.viewportRowLeft[dept];
                break;
            case 'right':
                result = this.viewportRowRight[dept];
                break;
            default:
                result = this.viewportRowCenter[dept];
                break;
        }
        if (generic_1.missing(result)) {
            result = [];
        }
        return result;
    }
    calculateHeaderRows() {
        // go through each group, see if any of it's cols are displayed, and if yes,
        // then this group is included
        this.viewportRowLeft = {};
        this.viewportRowRight = {};
        this.viewportRowCenter = {};
        // for easy lookup when building the groups.
        const virtualColIds = {};
        this.headerViewportColumns.forEach(col => virtualColIds[col.getId()] = true);
        const testGroup = (children, result, dept) => {
            let returnValue = false;
            for (let i = 0; i < children.length; i++) {
                // see if this item is within viewport
                const child = children[i];
                let addThisItem = false;
                if (child instanceof column_1.Column) {
                    // for column, test if column is included
                    addThisItem = virtualColIds[child.getId()] === true;
                }
                else {
                    // if group, base decision on children
                    const columnGroup = child;
                    const displayedChildren = columnGroup.getDisplayedChildren();
                    if (displayedChildren) {
                        addThisItem = testGroup(displayedChildren, result, dept + 1);
                    }
                }
                if (addThisItem) {
                    returnValue = true;
                    if (!result[dept]) {
                        result[dept] = [];
                    }
                    result[dept].push(child);
                }
            }
            return returnValue;
        };
        testGroup(this.displayedTreeLeft, this.viewportRowLeft, 0);
        testGroup(this.displayedTreeRight, this.viewportRowRight, 0);
        testGroup(this.displayedTreeCentre, this.viewportRowCenter, 0);
    }
    extractViewport() {
        const hashColumn = (c) => `${c.getId()}-${c.getPinned() || 'normal'}`;
        this.extractViewportColumns();
        const newHash = this.viewportColumns.map(hashColumn).join('#');
        const changed = this.viewportColumnsHash !== newHash;
        if (changed) {
            this.viewportColumnsHash = newHash;
            this.calculateHeaderRows();
        }
        return changed;
    }
    refreshFlexedColumns(params = {}) {
        const source = params.source ? params.source : 'flex';
        if (params.viewportWidth != null) {
            this.flexViewportWidth = params.viewportWidth;
        }
        if (!this.flexViewportWidth) {
            return [];
        }
        // If the grid has left-over space, divide it between flexing columns in proportion to their flex value.
        // A "flexing column" is one that has a 'flex' value set and is not currently being constrained by its
        // minWidth or maxWidth rules.
        let flexAfterDisplayIndex = -1;
        if (params.resizingCols) {
            params.resizingCols.forEach(col => {
                const indexOfCol = this.displayedColumnsCenter.indexOf(col);
                if (flexAfterDisplayIndex < indexOfCol) {
                    flexAfterDisplayIndex = indexOfCol;
                }
            });
        }
        const isColFlex = (col) => {
            const afterResizingCols = this.displayedColumnsCenter.indexOf(col) > flexAfterDisplayIndex;
            return col.getFlex() && afterResizingCols;
        };
        const knownWidthColumns = this.displayedColumnsCenter.filter(col => !isColFlex(col));
        const flexingColumns = this.displayedColumnsCenter.filter(col => isColFlex(col));
        const changedColumns = [];
        if (!flexingColumns.length) {
            return [];
        }
        const flexingColumnSizes = [];
        let spaceForFlexingColumns;
        outer: while (true) {
            const totalFlex = flexingColumns.reduce((count, col) => count + col.getFlex(), 0);
            spaceForFlexingColumns = this.flexViewportWidth - this.getWidthOfColsInList(knownWidthColumns);
            for (let i = 0; i < flexingColumns.length; i++) {
                const col = flexingColumns[i];
                const widthByFlexRule = spaceForFlexingColumns * col.getFlex() / totalFlex;
                let constrainedWidth = 0;
                const minWidth = col.getMinWidth();
                const maxWidth = col.getMaxWidth();
                if (generic_1.exists(minWidth) && widthByFlexRule < minWidth) {
                    constrainedWidth = minWidth;
                }
                else if (generic_1.exists(maxWidth) && widthByFlexRule > maxWidth) {
                    constrainedWidth = maxWidth;
                }
                if (constrainedWidth) {
                    // This column is not in fact flexing as it is being constrained to a specific size
                    // so remove it from the list of flexing columns and start again
                    col.setActualWidth(constrainedWidth, source);
                    array_1.removeFromArray(flexingColumns, col);
                    changedColumns.push(col);
                    knownWidthColumns.push(col);
                    continue outer;
                }
                flexingColumnSizes[i] = Math.round(widthByFlexRule);
            }
            break;
        }
        let remainingSpace = spaceForFlexingColumns;
        flexingColumns.forEach((col, i) => {
            col.setActualWidth(Math.min(flexingColumnSizes[i], remainingSpace), source);
            changedColumns.push(col);
            remainingSpace -= flexingColumnSizes[i];
        });
        if (!params.skipSetLeft) {
            this.setLeftValues(source);
        }
        if (params.updateBodyWidths) {
            this.updateBodyWidths();
        }
        if (params.fireResizedEvent) {
            this.dispatchColumnResizedEvent(changedColumns, true, source, flexingColumns);
        }
        // if the user sets rowData directly into GridOptions, then the row data is set before
        // grid is attached to the DOM. this means the columns are not flexed, and then the rows
        // have the wrong height (as they depend on column widths). so once the columns have
        // been flexed for the first time (only happens once grid is attached to DOM, as dependency
        // on getting the grid width, which only happens after attached after ResizeObserver fires)
        // we get get rows to re-calc their heights.
        if (!this.flexColsCalculatedAtLestOnce) {
            if (this.gridOptionsService.isRowModelType('clientSide')) {
                this.rowModel.resetRowHeights();
            }
            this.flexColsCalculatedAtLestOnce = true;
        }
        return flexingColumns;
    }
    // called from api
    sizeColumnsToFit(gridWidth, source = "sizeColumnsToFit", silent, params) {
        var _a, _b, _c, _d, _e;
        const limitsMap = {};
        if (params) {
            (_a = params === null || params === void 0 ? void 0 : params.columnLimits) === null || _a === void 0 ? void 0 : _a.forEach((_a) => {
                var { key } = _a, dimensions = __rest(_a, ["key"]);
                limitsMap[typeof key === 'string' ? key : key.getColId()] = dimensions;
            });
        }
        // avoid divide by zero
        const allDisplayedColumns = this.getAllDisplayedColumns();
        const doColumnsAlreadyFit = gridWidth === this.getWidthOfColsInList(allDisplayedColumns);
        if (gridWidth <= 0 || !allDisplayedColumns.length || doColumnsAlreadyFit) {
            return;
        }
        const colsToSpread = [];
        const colsToNotSpread = [];
        allDisplayedColumns.forEach(column => {
            if (column.getColDef().suppressSizeToFit === true) {
                colsToNotSpread.push(column);
            }
            else {
                colsToSpread.push(column);
            }
        });
        // make a copy of the cols that are going to be resized
        const colsToDispatchEventFor = colsToSpread.slice(0);
        let finishedResizing = false;
        const moveToNotSpread = (column) => {
            array_1.removeFromArray(colsToSpread, column);
            colsToNotSpread.push(column);
        };
        // resetting cols to their original width makes the sizeColumnsToFit more deterministic,
        // rather than depending on the current size of the columns. most users call sizeColumnsToFit
        // immediately after grid is created, so will make no difference. however if application is calling
        // sizeColumnsToFit repeatedly (eg after column group is opened / closed repeatedly) we don't want
        // the columns to start shrinking / growing over time.
        //
        // NOTE: the process below will assign values to `this.actualWidth` of each column without firing events
        // for this reason we need to manually dispatch resize events after the resize has been done for each column.
        colsToSpread.forEach(column => column.resetActualWidth(source));
        while (!finishedResizing) {
            finishedResizing = true;
            const availablePixels = gridWidth - this.getWidthOfColsInList(colsToNotSpread);
            if (availablePixels <= 0) {
                // no width, set everything to minimum
                colsToSpread.forEach((column) => {
                    var _a, _b;
                    const widthOverride = (_b = (_a = limitsMap === null || limitsMap === void 0 ? void 0 : limitsMap[column.getId()]) === null || _a === void 0 ? void 0 : _a.minWidth) !== null && _b !== void 0 ? _b : params === null || params === void 0 ? void 0 : params.defaultMinWidth;
                    if (typeof widthOverride === 'number') {
                        column.setActualWidth(widthOverride);
                        return;
                    }
                    column.setMinimum(source);
                });
            }
            else {
                const scale = availablePixels / this.getWidthOfColsInList(colsToSpread);
                // we set the pixels for the last col based on what's left, as otherwise
                // we could be a pixel or two short or extra because of rounding errors.
                let pixelsForLastCol = availablePixels;
                // backwards through loop, as we are removing items as we go
                for (let i = colsToSpread.length - 1; i >= 0; i--) {
                    const column = colsToSpread[i];
                    const widthOverride = limitsMap === null || limitsMap === void 0 ? void 0 : limitsMap[column.getId()];
                    const minOverride = ((_b = widthOverride === null || widthOverride === void 0 ? void 0 : widthOverride.minWidth) !== null && _b !== void 0 ? _b : params === null || params === void 0 ? void 0 : params.defaultMinWidth);
                    const maxOverride = ((_c = widthOverride === null || widthOverride === void 0 ? void 0 : widthOverride.maxWidth) !== null && _c !== void 0 ? _c : params === null || params === void 0 ? void 0 : params.defaultMaxWidth);
                    const colMinWidth = (_d = column.getMinWidth()) !== null && _d !== void 0 ? _d : 0;
                    const colMaxWidth = (_e = column.getMaxWidth()) !== null && _e !== void 0 ? _e : Number.MAX_VALUE;
                    const minWidth = typeof minOverride === 'number' && minOverride > colMinWidth ? minOverride : column.getMinWidth();
                    const maxWidth = typeof maxOverride === 'number' && maxOverride < colMaxWidth ? maxOverride : column.getMaxWidth();
                    let newWidth = Math.round(column.getActualWidth() * scale);
                    if (generic_1.exists(minWidth) && newWidth < minWidth) {
                        newWidth = minWidth;
                        moveToNotSpread(column);
                        finishedResizing = false;
                    }
                    else if (generic_1.exists(maxWidth) && newWidth > maxWidth) {
                        newWidth = maxWidth;
                        moveToNotSpread(column);
                        finishedResizing = false;
                    }
                    else if (i === 0) { // if this is the last column
                        newWidth = pixelsForLastCol;
                    }
                    column.setActualWidth(newWidth, source, true);
                    pixelsForLastCol -= newWidth;
                }
            }
        }
        // see notes above
        colsToDispatchEventFor.forEach(col => {
            col.fireColumnWidthChangedEvent(source);
        });
        this.setLeftValues(source);
        this.updateBodyWidths();
        if (silent) {
            return;
        }
        this.dispatchColumnResizedEvent(colsToDispatchEventFor, true, source);
    }
    buildDisplayedTrees(visibleColumns) {
        const leftVisibleColumns = [];
        const rightVisibleColumns = [];
        const centerVisibleColumns = [];
        visibleColumns.forEach(column => {
            switch (column.getPinned()) {
                case "left":
                    leftVisibleColumns.push(column);
                    break;
                case "right":
                    rightVisibleColumns.push(column);
                    break;
                default:
                    centerVisibleColumns.push(column);
                    break;
            }
        });
        const groupInstanceIdCreator = new groupInstanceIdCreator_1.GroupInstanceIdCreator();
        this.displayedTreeLeft = this.displayedGroupCreator.createDisplayedGroups(leftVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, 'left', this.displayedTreeLeft);
        this.displayedTreeRight = this.displayedGroupCreator.createDisplayedGroups(rightVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, 'right', this.displayedTreeRight);
        this.displayedTreeCentre = this.displayedGroupCreator.createDisplayedGroups(centerVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, null, this.displayedTreeCentre);
        this.updateDisplayedMap();
    }
    updateDisplayedMap() {
        this.displayedColumnsAndGroupsMap = {};
        const func = (child) => {
            this.displayedColumnsAndGroupsMap[child.getUniqueId()] = child;
        };
        this.columnUtils.depthFirstAllColumnTreeSearch(this.displayedTreeCentre, func);
        this.columnUtils.depthFirstAllColumnTreeSearch(this.displayedTreeLeft, func);
        this.columnUtils.depthFirstAllColumnTreeSearch(this.displayedTreeRight, func);
    }
    isDisplayed(item) {
        const fromMap = this.displayedColumnsAndGroupsMap[item.getUniqueId()];
        // check for reference, in case new column / group with same id is now present
        return fromMap === item;
    }
    updateOpenClosedVisibilityInColumnGroups() {
        const allColumnGroups = this.getAllDisplayedTrees();
        this.columnUtils.depthFirstAllColumnTreeSearch(allColumnGroups, child => {
            if (child instanceof columnGroup_1.ColumnGroup) {
                const columnGroup = child;
                columnGroup.calculateDisplayedColumns();
            }
        });
    }
    getGroupAutoColumns() {
        return this.groupAutoColumns;
    }
    /**
     * Creates new auto group columns if required
     * @returns whether auto cols have changed
     */
    createGroupAutoColumnsIfNeeded() {
        if (!this.autoGroupsNeedBuilding) {
            return false;
        }
        this.autoGroupsNeedBuilding = false;
        const groupFullWidthRow = this.gridOptionsService.isGroupUseEntireRow(this.pivotMode);
        // we need to allow suppressing auto-column separately for group and pivot as the normal situation
        // is CSRM and user provides group column themselves for normal view, but when they go into pivot the
        // columns are generated by the grid so no opportunity for user to provide group column. so need a way
        // to suppress auto-col for grouping only, and not pivot.
        // however if using Viewport RM or SSRM and user is providing the columns, the user may wish full control
        // of the group column in this instance.
        const suppressAutoColumn = this.pivotMode ?
            this.gridOptionsService.is('pivotSuppressAutoColumn') : this.isGroupSuppressAutoColumn();
        const groupingActive = this.rowGroupColumns.length > 0 || this.usingTreeData;
        const needAutoColumns = groupingActive && !suppressAutoColumn && !groupFullWidthRow;
        if (needAutoColumns) {
            const existingCols = this.groupAutoColumns || [];
            const newAutoGroupCols = this.autoGroupColService.createAutoGroupColumns(existingCols, this.rowGroupColumns);
            const autoColsDifferent = !this.autoColsEqual(newAutoGroupCols, this.groupAutoColumns);
            // we force recreate so new group cols pick up the new
            // definitions. otherwise we could ignore the new cols because they appear to be the same.
            if (autoColsDifferent || this.forceRecreateAutoGroups) {
                this.groupAutoColumns = newAutoGroupCols;
                return true;
            }
        }
        else {
            this.groupAutoColumns = null;
        }
        return false;
    }
    isGroupSuppressAutoColumn() {
        const groupDisplayType = this.gridOptionsService.get('groupDisplayType');
        const isCustomRowGroups = groupDisplayType ? gridOptionsValidator_1.matchesGroupDisplayType('custom', groupDisplayType) : false;
        if (isCustomRowGroups) {
            return true;
        }
        const treeDataDisplayType = this.gridOptionsService.get('treeDataDisplayType');
        return treeDataDisplayType ? gridOptionsValidator_1.matchesTreeDataDisplayType('custom', treeDataDisplayType) : false;
    }
    autoColsEqual(colsA, colsB) {
        return array_1.areEqual(colsA, colsB, (a, b) => a.getColId() === b.getColId());
    }
    getWidthOfColsInList(columnList) {
        return columnList.reduce((width, col) => width + col.getActualWidth(), 0);
    }
    getGridBalancedTree() {
        return this.gridBalancedTree;
    }
    hasFloatingFilters() {
        if (!this.gridColumns) {
            return false;
        }
        const res = this.gridColumns.some(col => col.getColDef().floatingFilter);
        return res;
    }
    getFirstDisplayedColumn() {
        const isRtl = this.gridOptionsService.is('enableRtl');
        const queryOrder = [
            'getDisplayedLeftColumns',
            'getDisplayedCenterColumns',
            'getDisplayedRightColumns'
        ];
        if (isRtl) {
            queryOrder.reverse();
        }
        for (let i = 0; i < queryOrder.length; i++) {
            const container = this[queryOrder[i]]();
            if (container.length) {
                return isRtl ? array_1.last(container) : container[0];
            }
        }
        return null;
    }
    setColumnHeaderHeight(col, height) {
        const changed = col.setAutoHeaderHeight(height);
        if (changed) {
            const event = {
                type: events_1.Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED,
                column: col,
                columns: [col],
                source: 'autosizeColumnHeaderHeight',
            };
            this.eventService.dispatchEvent(event);
        }
    }
    getColumnGroupHeaderRowHeight() {
        if (this.isPivotMode()) {
            return this.getPivotGroupHeaderHeight();
        }
        return this.getGroupHeaderHeight();
    }
    getColumnHeaderRowHeight() {
        const defaultHeight = (this.isPivotMode() ?
            this.getPivotHeaderHeight() :
            this.getHeaderHeight());
        const displayedHeights = this.getAllDisplayedColumns()
            .filter((col) => col.isAutoHeaderHeight())
            .map((col) => col.getAutoHeaderHeight() || 0);
        return Math.max(defaultHeight, ...displayedHeights);
    }
    getHeaderHeight() {
        var _a;
        return (_a = this.gridOptionsService.getNum('headerHeight')) !== null && _a !== void 0 ? _a : this.environment.getFromTheme(25, 'headerHeight');
    }
    getFloatingFiltersHeight() {
        var _a;
        return (_a = this.gridOptionsService.getNum('floatingFiltersHeight')) !== null && _a !== void 0 ? _a : this.getHeaderHeight();
    }
    getGroupHeaderHeight() {
        var _a;
        return (_a = this.gridOptionsService.getNum('groupHeaderHeight')) !== null && _a !== void 0 ? _a : this.getHeaderHeight();
    }
    getPivotHeaderHeight() {
        var _a;
        return (_a = this.gridOptionsService.getNum('pivotHeaderHeight')) !== null && _a !== void 0 ? _a : this.getHeaderHeight();
    }
    getPivotGroupHeaderHeight() {
        var _a;
        return (_a = this.gridOptionsService.getNum('pivotGroupHeaderHeight')) !== null && _a !== void 0 ? _a : this.getGroupHeaderHeight();
    }
};
__decorate([
    context_1.Autowired('expressionService')
], ColumnModel.prototype, "expressionService", void 0);
__decorate([
    context_1.Autowired('columnFactory')
], ColumnModel.prototype, "columnFactory", void 0);
__decorate([
    context_1.Autowired('displayedGroupCreator')
], ColumnModel.prototype, "displayedGroupCreator", void 0);
__decorate([
    context_1.Autowired('ctrlsService')
], ColumnModel.prototype, "ctrlsService", void 0);
__decorate([
    context_1.Autowired('autoWidthCalculator')
], ColumnModel.prototype, "autoWidthCalculator", void 0);
__decorate([
    context_1.Autowired('columnUtils')
], ColumnModel.prototype, "columnUtils", void 0);
__decorate([
    context_1.Autowired('columnAnimationService')
], ColumnModel.prototype, "columnAnimationService", void 0);
__decorate([
    context_1.Autowired('autoGroupColService')
], ColumnModel.prototype, "autoGroupColService", void 0);
__decorate([
    context_1.Optional('aggFuncService')
], ColumnModel.prototype, "aggFuncService", void 0);
__decorate([
    context_1.Optional('valueCache')
], ColumnModel.prototype, "valueCache", void 0);
__decorate([
    context_1.Optional('animationFrameService')
], ColumnModel.prototype, "animationFrameService", void 0);
__decorate([
    context_1.Autowired('rowModel')
], ColumnModel.prototype, "rowModel", void 0);
__decorate([
    context_1.Autowired('sortController')
], ColumnModel.prototype, "sortController", void 0);
__decorate([
    context_1.Autowired('columnDefFactory')
], ColumnModel.prototype, "columnDefFactory", void 0);
__decorate([
    context_1.PostConstruct
], ColumnModel.prototype, "init", null);
__decorate([
    context_1.PreDestroy
], ColumnModel.prototype, "destroyColumns", null);
__decorate([
    __param(0, context_1.Qualifier('loggerFactory'))
], ColumnModel.prototype, "setBeans", null);
ColumnModel = __decorate([
    context_1.Bean('columnModel')
], ColumnModel);
exports.ColumnModel = ColumnModel;
