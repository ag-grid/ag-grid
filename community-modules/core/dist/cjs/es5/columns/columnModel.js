/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
exports.ColumnModel = void 0;
var columnGroup_1 = require("../entities/columnGroup");
var column_1 = require("../entities/column");
var events_1 = require("../events");
var beanStub_1 = require("../context/beanStub");
var providedColumnGroup_1 = require("../entities/providedColumnGroup");
var groupInstanceIdCreator_1 = require("./groupInstanceIdCreator");
var context_1 = require("../context/context");
var autoGroupColService_1 = require("./autoGroupColService");
var array_1 = require("../utils/array");
var generic_1 = require("../utils/generic");
var string_1 = require("../utils/string");
var map_1 = require("../utils/map");
var function_1 = require("../utils/function");
var gridOptionsValidator_1 = require("../gridOptionsValidator");
var ColumnModel = /** @class */ (function (_super) {
    __extends(ColumnModel, _super);
    function ColumnModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // header row count, based on user provided columns
        _this.primaryHeaderRowCount = 0;
        _this.secondaryHeaderRowCount = 0;
        // header row count, either above, or based on pivoting if we are pivoting
        _this.gridHeaderRowCount = 0;
        // leave level columns of the displayed trees
        _this.displayedColumnsLeft = [];
        _this.displayedColumnsRight = [];
        _this.displayedColumnsCenter = [];
        // all three lists above combined
        _this.displayedColumns = [];
        // for fast lookup, to see if a column or group is still displayed
        _this.displayedColumnsAndGroupsMap = {};
        // all columns to be rendered
        _this.viewportColumns = [];
        // A hash key to keep track of changes in viewport columns
        _this.viewportColumnsHash = '';
        // same as viewportColumns, except we always include columns with headerAutoHeight
        _this.headerViewportColumns = [];
        // all columns to be rendered in the centre
        _this.viewportColumnsCenter = [];
        // same as viewportColumnsCenter, except we always include columns with headerAutoHeight
        _this.headerViewportColumnsCenter = [];
        _this.autoHeightActiveAtLeastOnce = false;
        _this.rowGroupColumns = [];
        _this.valueColumns = [];
        _this.pivotColumns = [];
        _this.ready = false;
        _this.autoGroupsNeedBuilding = false;
        _this.forceRecreateAutoGroups = false;
        _this.pivotMode = false;
        _this.bodyWidth = 0;
        _this.leftWidth = 0;
        _this.rightWidth = 0;
        _this.bodyWidthDirty = true;
        _this.flexColsCalculatedAtLestOnce = false;
        return _this;
    }
    ColumnModel.prototype.init = function () {
        var _this = this;
        this.suppressColumnVirtualisation = this.gridOptionsService.is('suppressColumnVirtualisation');
        var pivotMode = this.gridOptionsService.is('pivotMode');
        if (this.isPivotSettingAllowed(pivotMode)) {
            this.pivotMode = pivotMode;
        }
        this.usingTreeData = this.gridOptionsService.isTreeData();
        this.addManagedPropertyListener('groupDisplayType', function () { return _this.onAutoGroupColumnDefChanged(); });
        this.addManagedPropertyListener('autoGroupColumnDef', function () { return _this.onAutoGroupColumnDefChanged(); });
        this.addManagedPropertyListener('defaultColDef', function (params) { return _this.onSharedColDefChanged(params.source); });
        this.addManagedPropertyListener('columnTypes', function (params) { return _this.onSharedColDefChanged(params.source); });
    };
    ColumnModel.prototype.onAutoGroupColumnDefChanged = function () {
        this.autoGroupsNeedBuilding = true;
        this.forceRecreateAutoGroups = true;
        this.updateGridColumns();
        this.updateDisplayedColumns('gridOptionsChanged');
    };
    ColumnModel.prototype.onSharedColDefChanged = function (source) {
        if (source === void 0) { source = 'api'; }
        // likewise for autoGroupCol, the default col def impacts this
        this.forceRecreateAutoGroups = true;
        this.createColumnsFromColumnDefs(true, source);
    };
    ColumnModel.prototype.setColumnDefs = function (columnDefs, source) {
        if (source === void 0) { source = 'api'; }
        var colsPreviouslyExisted = !!this.columnDefs;
        this.columnDefs = columnDefs;
        this.createColumnsFromColumnDefs(colsPreviouslyExisted, source);
    };
    ColumnModel.prototype.destroyOldColumns = function (oldTree, newTree) {
        var oldObjectsById = {};
        if (!oldTree) {
            return;
        }
        // add in all old columns to be destroyed
        this.columnUtils.depthFirstOriginalTreeSearch(null, oldTree, function (child) {
            oldObjectsById[child.getInstanceId()] = child;
        });
        // however we don't destroy anything in the new tree. if destroying the grid, there is no new tree
        if (newTree) {
            this.columnUtils.depthFirstOriginalTreeSearch(null, newTree, function (child) {
                oldObjectsById[child.getInstanceId()] = null;
            });
        }
        // what's left can be destroyed
        var colsToDestroy = Object.values(oldObjectsById).filter(function (item) { return item != null; });
        this.destroyBeans(colsToDestroy);
    };
    ColumnModel.prototype.destroyColumns = function () {
        this.destroyOldColumns(this.primaryColumnTree);
        this.destroyOldColumns(this.secondaryBalancedTree);
        this.destroyOldColumns(this.groupAutoColsBalancedTree);
    };
    ColumnModel.prototype.createColumnsFromColumnDefs = function (colsPreviouslyExisted, source) {
        var _this = this;
        if (source === void 0) { source = 'api'; }
        // only need to dispatch before/after events if updating columns, never if setting columns for first time
        var dispatchEventsFunc = colsPreviouslyExisted ? this.compareColumnStatesAndDispatchEvents(source) : undefined;
        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.
        this.valueCache.expire();
        // NOTE ==================
        // we should be destroying the existing columns and groups if they exist, for example, the original column
        // group adds a listener to the columns, it should be also removing the listeners
        this.autoGroupsNeedBuilding = true;
        var oldPrimaryColumns = this.primaryColumns;
        var oldPrimaryTree = this.primaryColumnTree;
        var balancedTreeResult = this.columnFactory.createColumnTree(this.columnDefs, true, oldPrimaryTree);
        this.destroyOldColumns(this.primaryColumnTree, balancedTreeResult.columnTree);
        this.primaryColumnTree = balancedTreeResult.columnTree;
        this.primaryHeaderRowCount = balancedTreeResult.treeDept + 1;
        this.primaryColumns = this.getColumnsFromTree(this.primaryColumnTree);
        this.primaryColumnsMap = {};
        this.primaryColumns.forEach(function (col) { return _this.primaryColumnsMap[col.getId()] = col; });
        this.extractRowGroupColumns(source, oldPrimaryColumns);
        this.extractPivotColumns(source, oldPrimaryColumns);
        this.extractValueColumns(source, oldPrimaryColumns);
        this.ready = true;
        // if we are showing secondary columns, then no need to update grid columns
        // at this point, as it's the pivot service responsibility to change these
        // if we are no longer pivoting (ie and need to revert back to primary, otherwise
        // we shouldn't be touching the primary).
        var gridColsNotProcessed = this.gridColsArePrimary === undefined;
        var processGridCols = this.gridColsArePrimary || gridColsNotProcessed;
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
    };
    ColumnModel.prototype.dispatchNewColumnsLoaded = function () {
        var newColumnsLoadedEvent = {
            type: events_1.Events.EVENT_NEW_COLUMNS_LOADED
        };
        this.eventService.dispatchEvent(newColumnsLoadedEvent);
    };
    // this event is legacy, no grid code listens to it. instead the grid listens to New Columns Loaded
    ColumnModel.prototype.dispatchEverythingChanged = function (source) {
        if (source === void 0) { source = 'api'; }
        var eventEverythingChanged = {
            type: events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED,
            source: source
        };
        this.eventService.dispatchEvent(eventEverythingChanged);
    };
    ColumnModel.prototype.orderGridColumnsLikePrimary = function () {
        var _this = this;
        var primaryColumns = this.primaryColumns;
        if (!primaryColumns) {
            return;
        }
        this.gridColumns.sort(function (colA, colB) {
            var primaryIndexA = primaryColumns.indexOf(colA);
            var primaryIndexB = primaryColumns.indexOf(colB);
            // if both cols are present in primary, then we just return the position,
            // so position is maintained.
            var indexAPresent = primaryIndexA >= 0;
            var indexBPresent = primaryIndexB >= 0;
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
            var gridIndexA = _this.gridColumns.indexOf(colA);
            var gridIndexB = _this.gridColumns.indexOf(colB);
            return gridIndexA - gridIndexB;
        });
        this.gridColumns = this.placeLockedColumns(this.gridColumns);
    };
    ColumnModel.prototype.getAllDisplayedAutoHeightCols = function () {
        return this.displayedAutoHeightCols;
    };
    ColumnModel.prototype.setViewport = function () {
        if (this.gridOptionsService.is('enableRtl')) {
            this.viewportLeft = this.bodyWidth - this.scrollPosition - this.scrollWidth;
            this.viewportRight = this.bodyWidth - this.scrollPosition;
        }
        else {
            this.viewportLeft = this.scrollPosition;
            this.viewportRight = this.scrollWidth + this.scrollPosition;
        }
    };
    // used by clipboard service, to know what columns to paste into
    ColumnModel.prototype.getDisplayedColumnsStartingAt = function (column) {
        var currentColumn = column;
        var columns = [];
        while (currentColumn != null) {
            columns.push(currentColumn);
            currentColumn = this.getDisplayedColAfter(currentColumn);
        }
        return columns;
    };
    // checks what columns are currently displayed due to column virtualisation. dispatches an event
    // if the list of columns has changed.
    // + setColumnWidth(), setViewportPosition(), setColumnDefs(), sizeColumnsToFit()
    ColumnModel.prototype.checkViewportColumns = function () {
        // check displayCenterColumnTree exists first, as it won't exist when grid is initialising
        if (this.displayedColumnsCenter == null) {
            return;
        }
        var viewportColumnsChanged = this.extractViewport();
        if (!viewportColumnsChanged) {
            return;
        }
        var event = {
            type: events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnModel.prototype.setViewportPosition = function (scrollWidth, scrollPosition) {
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
    };
    ColumnModel.prototype.isPivotMode = function () {
        return this.pivotMode;
    };
    ColumnModel.prototype.isPivotSettingAllowed = function (pivot) {
        if (pivot && this.gridOptionsService.isTreeData()) {
            console.warn("AG Grid: Pivot mode not available in conjunction Tree Data i.e. 'gridOptions.treeData: true'");
            return false;
        }
        return true;
    };
    ColumnModel.prototype.setPivotMode = function (pivotMode, source) {
        if (source === void 0) { source = 'api'; }
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
        var event = {
            type: events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnModel.prototype.getSecondaryPivotColumn = function (pivotKeys, valueColKey) {
        if (generic_1.missing(this.secondaryColumns)) {
            return null;
        }
        var valueColumnToFind = this.getPrimaryColumn(valueColKey);
        var foundColumn = null;
        this.secondaryColumns.forEach(function (column) {
            var thisPivotKeys = column.getColDef().pivotKeys;
            var pivotValueColumn = column.getColDef().pivotValueColumn;
            var pivotKeyMatches = array_1.areEqual(thisPivotKeys, pivotKeys);
            var pivotValueMatches = pivotValueColumn === valueColumnToFind;
            if (pivotKeyMatches && pivotValueMatches) {
                foundColumn = column;
            }
        });
        return foundColumn;
    };
    ColumnModel.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('columnModel');
    };
    ColumnModel.prototype.setFirstRightAndLastLeftPinned = function (source) {
        var lastLeft;
        var firstRight;
        if (this.gridOptionsService.is('enableRtl')) {
            lastLeft = this.displayedColumnsLeft ? this.displayedColumnsLeft[0] : null;
            firstRight = this.displayedColumnsRight ? array_1.last(this.displayedColumnsRight) : null;
        }
        else {
            lastLeft = this.displayedColumnsLeft ? array_1.last(this.displayedColumnsLeft) : null;
            firstRight = this.displayedColumnsRight ? this.displayedColumnsRight[0] : null;
        }
        this.gridColumns.forEach(function (column) {
            column.setLastLeftPinned(column === lastLeft, source);
            column.setFirstRightPinned(column === firstRight, source);
        });
    };
    ColumnModel.prototype.autoSizeColumns = function (params) {
        var _this = this;
        var columns = params.columns, skipHeader = params.skipHeader, skipHeaderGroups = params.skipHeaderGroups, stopAtGroup = params.stopAtGroup, _a = params.source, source = _a === void 0 ? 'api' : _a;
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
        var columnsAutosized = [];
        // initialise with anything except 0 so that while loop executes at least once
        var changesThisTimeAround = -1;
        var shouldSkipHeader = skipHeader != null ? skipHeader : this.gridOptionsService.is('skipHeaderOnAutoSize');
        var shouldSkipHeaderGroups = skipHeaderGroups != null ? skipHeaderGroups : shouldSkipHeader;
        while (changesThisTimeAround !== 0) {
            changesThisTimeAround = 0;
            this.actionOnGridColumns(columns, function (column) {
                // if already autosized, skip it
                if (columnsAutosized.indexOf(column) >= 0) {
                    return false;
                }
                // get how wide this col should be
                var preferredWidth = _this.autoWidthCalculator.getPreferredWidthForColumn(column, shouldSkipHeader);
                // preferredWidth = -1 if this col is not on the screen
                if (preferredWidth > 0) {
                    var newWidth = _this.normaliseColumnWidth(column, preferredWidth);
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
    };
    ColumnModel.prototype.dispatchColumnResizedEvent = function (columns, finished, source, flexColumns) {
        if (flexColumns === void 0) { flexColumns = null; }
        if (columns && columns.length) {
            var event_1 = {
                type: events_1.Events.EVENT_COLUMN_RESIZED,
                columns: columns,
                column: columns.length === 1 ? columns[0] : null,
                flexColumns: flexColumns,
                finished: finished,
                source: source
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    ColumnModel.prototype.dispatchColumnChangedEvent = function (type, columns, source) {
        var event = {
            type: type,
            columns: columns,
            column: (columns && columns.length == 1) ? columns[0] : null,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnModel.prototype.dispatchColumnMovedEvent = function (params) {
        var movedColumns = params.movedColumns, source = params.source, toIndex = params.toIndex, finished = params.finished;
        var event = {
            type: events_1.Events.EVENT_COLUMN_MOVED,
            columns: movedColumns,
            column: movedColumns && movedColumns.length === 1 ? movedColumns[0] : null,
            toIndex: toIndex,
            finished: finished,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnModel.prototype.dispatchColumnPinnedEvent = function (changedColumns, source) {
        if (!changedColumns.length) {
            return;
        }
        // if just one column, we use this, otherwise we don't include the col
        var column = changedColumns.length === 1 ? changedColumns[0] : null;
        // only include visible if it's common in all columns
        var pinned = this.getCommonValue(changedColumns, function (col) { return col.getPinned(); });
        var event = {
            type: events_1.Events.EVENT_COLUMN_PINNED,
            // mistake in typing, 'undefined' should be allowed, as 'null' means 'not pinned'
            pinned: pinned != null ? pinned : null,
            columns: changedColumns,
            column: column,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnModel.prototype.dispatchColumnVisibleEvent = function (changedColumns, source) {
        if (!changedColumns.length) {
            return;
        }
        // if just one column, we use this, otherwise we don't include the col
        var column = changedColumns.length === 1 ? changedColumns[0] : null;
        // only include visible if it's common in all columns
        var visible = this.getCommonValue(changedColumns, function (col) { return col.isVisible(); });
        var event = {
            type: events_1.Events.EVENT_COLUMN_VISIBLE,
            visible: visible,
            columns: changedColumns,
            column: column,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnModel.prototype.autoSizeColumn = function (key, skipHeader, source) {
        if (source === void 0) { source = "api"; }
        if (key) {
            this.autoSizeColumns({ columns: [key], skipHeader: skipHeader, skipHeaderGroups: true, source: source });
        }
    };
    ColumnModel.prototype.autoSizeColumnGroupsByColumns = function (keys, stopAtGroup) {
        var e_1, _a, e_2, _b;
        var columnGroups = new Set();
        var columns = this.getGridColumns(keys);
        columns.forEach(function (col) {
            var parent = col.getParent();
            while (parent && parent != stopAtGroup) {
                if (!parent.isPadding()) {
                    columnGroups.add(parent);
                }
                parent = parent.getParent();
            }
        });
        var headerGroupCtrl;
        var resizedColumns = [];
        try {
            for (var columnGroups_1 = __values(columnGroups), columnGroups_1_1 = columnGroups_1.next(); !columnGroups_1_1.done; columnGroups_1_1 = columnGroups_1.next()) {
                var columnGroup = columnGroups_1_1.value;
                try {
                    for (var _c = (e_2 = void 0, __values(this.ctrlsService.getHeaderRowContainerCtrls())), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var headerContainerCtrl = _d.value;
                        headerGroupCtrl = headerContainerCtrl.getHeaderCtrlForColumn(columnGroup);
                        if (headerGroupCtrl) {
                            break;
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                if (headerGroupCtrl) {
                    headerGroupCtrl.resizeLeafColumnsToFit();
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (columnGroups_1_1 && !columnGroups_1_1.done && (_a = columnGroups_1.return)) _a.call(columnGroups_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return resizedColumns;
    };
    ColumnModel.prototype.autoSizeAllColumns = function (skipHeader, source) {
        if (source === void 0) { source = "api"; }
        var allDisplayedColumns = this.getAllDisplayedColumns();
        this.autoSizeColumns({ columns: allDisplayedColumns, skipHeader: skipHeader, source: source });
    };
    // Possible candidate for reuse (alot of recursive traversal duplication)
    ColumnModel.prototype.getColumnsFromTree = function (rootColumns) {
        var result = [];
        var recursiveFindColumns = function (childColumns) {
            for (var i = 0; i < childColumns.length; i++) {
                var child = childColumns[i];
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
    };
    ColumnModel.prototype.getAllDisplayedTrees = function () {
        if (this.displayedTreeLeft && this.displayedTreeRight && this.displayedTreeCentre) {
            return this.displayedTreeLeft
                .concat(this.displayedTreeCentre)
                .concat(this.displayedTreeRight);
        }
        return null;
    };
    // + columnSelectPanel
    ColumnModel.prototype.getPrimaryColumnTree = function () {
        return this.primaryColumnTree;
    };
    // + gridPanel -> for resizing the body and setting top margin
    ColumnModel.prototype.getHeaderRowCount = function () {
        return this.gridHeaderRowCount;
    };
    // + headerRenderer -> setting pinned body width
    ColumnModel.prototype.getDisplayedTreeLeft = function () {
        return this.displayedTreeLeft;
    };
    // + headerRenderer -> setting pinned body width
    ColumnModel.prototype.getDisplayedTreeRight = function () {
        return this.displayedTreeRight;
    };
    // + headerRenderer -> setting pinned body width
    ColumnModel.prototype.getDisplayedTreeCentre = function () {
        return this.displayedTreeCentre;
    };
    // gridPanel -> ensureColumnVisible
    ColumnModel.prototype.isColumnDisplayed = function (column) {
        return this.getAllDisplayedColumns().indexOf(column) >= 0;
    };
    // + csvCreator
    ColumnModel.prototype.getAllDisplayedColumns = function () {
        return this.displayedColumns;
    };
    ColumnModel.prototype.getViewportColumns = function () {
        return this.viewportColumns;
    };
    ColumnModel.prototype.getDisplayedLeftColumnsForRow = function (rowNode) {
        if (!this.colSpanActive) {
            return this.displayedColumnsLeft;
        }
        return this.getDisplayedColumnsForRow(rowNode, this.displayedColumnsLeft);
    };
    ColumnModel.prototype.getDisplayedRightColumnsForRow = function (rowNode) {
        if (!this.colSpanActive) {
            return this.displayedColumnsRight;
        }
        return this.getDisplayedColumnsForRow(rowNode, this.displayedColumnsRight);
    };
    ColumnModel.prototype.getDisplayedColumnsForRow = function (rowNode, displayedColumns, filterCallback, emptySpaceBeforeColumn) {
        var result = [];
        var lastConsideredCol = null;
        var _loop_1 = function (i) {
            var col = displayedColumns[i];
            var maxAllowedColSpan = displayedColumns.length - i;
            var colSpan = Math.min(col.getColSpan(rowNode), maxAllowedColSpan);
            var columnsToCheckFilter = [col];
            if (colSpan > 1) {
                var colsToRemove = colSpan - 1;
                for (var j = 1; j <= colsToRemove; j++) {
                    columnsToCheckFilter.push(displayedColumns[i + j]);
                }
                i += colsToRemove;
            }
            // see which cols we should take out for column virtualisation
            var filterPasses;
            if (filterCallback) {
                // if user provided a callback, means some columns may not be in the viewport.
                // the user will NOT provide a callback if we are talking about pinned areas,
                // as pinned areas have no horizontal scroll and do not virtualise the columns.
                // if lots of columns, that means column spanning, and we set filterPasses = true
                // if one or more of the columns spanned pass the filter.
                filterPasses = false;
                columnsToCheckFilter.forEach(function (colForFilter) {
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
                    var gapBeforeColumn = emptySpaceBeforeColumn ? emptySpaceBeforeColumn(col) : false;
                    if (gapBeforeColumn) {
                        result.push(lastConsideredCol);
                    }
                }
                result.push(col);
            }
            lastConsideredCol = col;
            out_i_1 = i;
        };
        var out_i_1;
        for (var i = 0; i < displayedColumns.length; i++) {
            _loop_1(i);
            i = out_i_1;
        }
        return result;
    };
    // + rowRenderer
    // if we are not column spanning, this just returns back the virtual centre columns,
    // however if we are column spanning, then different rows can have different virtual
    // columns, so we have to work out the list for each individual row.
    ColumnModel.prototype.getViewportCenterColumnsForRow = function (rowNode) {
        var _this = this;
        if (!this.colSpanActive) {
            return this.viewportColumnsCenter;
        }
        var emptySpaceBeforeColumn = function (col) {
            var left = col.getLeft();
            return generic_1.exists(left) && left > _this.viewportLeft;
        };
        // if doing column virtualisation, then we filter based on the viewport.
        var filterCallback = this.suppressColumnVirtualisation ? null : this.isColumnInRowViewport.bind(this);
        return this.getDisplayedColumnsForRow(rowNode, this.displayedColumnsCenter, filterCallback, emptySpaceBeforeColumn);
    };
    ColumnModel.prototype.getAriaColumnIndex = function (col) {
        return this.getAllGridColumns().indexOf(col) + 1;
    };
    ColumnModel.prototype.isColumnInHeaderViewport = function (col) {
        // for headers, we never filter out autoHeaderHeight columns, if calculating
        if (col.isAutoHeaderHeight()) {
            return true;
        }
        return this.isColumnInRowViewport(col);
    };
    ColumnModel.prototype.isColumnInRowViewport = function (col) {
        // we never filter out autoHeight columns, as we need them in the DOM for calculating Auto Height
        if (col.isAutoHeight()) {
            return true;
        }
        var columnLeft = col.getLeft() || 0;
        var columnRight = columnLeft + col.getActualWidth();
        // adding 200 for buffer size, so some cols off viewport are rendered.
        // this helps horizontal scrolling so user rarely sees white space (unless
        // they scroll horizontally fast). however we are conservative, as the more
        // buffer the slower the vertical redraw speed
        var leftBounds = this.viewportLeft - 200;
        var rightBounds = this.viewportRight + 200;
        var columnToMuchLeft = columnLeft < leftBounds && columnRight < leftBounds;
        var columnToMuchRight = columnLeft > rightBounds && columnRight > rightBounds;
        return !columnToMuchLeft && !columnToMuchRight;
    };
    // used by:
    // + angularGrid -> setting pinned body width
    // note: this should be cached
    ColumnModel.prototype.getDisplayedColumnsLeftWidth = function () {
        return this.getWidthOfColsInList(this.displayedColumnsLeft);
    };
    // note: this should be cached
    ColumnModel.prototype.getDisplayedColumnsRightWidth = function () {
        return this.getWidthOfColsInList(this.displayedColumnsRight);
    };
    ColumnModel.prototype.updatePrimaryColumnList = function (keys, masterList, actionIsAdd, columnCallback, eventType, source) {
        var _this = this;
        if (source === void 0) { source = "api"; }
        if (!keys || generic_1.missingOrEmpty(keys)) {
            return;
        }
        var atLeastOne = false;
        keys.forEach(function (key) {
            var columnToAdd = _this.getPrimaryColumn(key);
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
        var event = {
            type: eventType,
            columns: masterList,
            column: masterList.length === 1 ? masterList[0] : null,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnModel.prototype.setRowGroupColumns = function (colKeys, source) {
        if (source === void 0) { source = "api"; }
        this.autoGroupsNeedBuilding = true;
        this.setPrimaryColumnList(colKeys, this.rowGroupColumns, events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.setRowGroupActive.bind(this), source);
    };
    ColumnModel.prototype.setRowGroupActive = function (active, column, source) {
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
    };
    ColumnModel.prototype.addRowGroupColumn = function (key, source) {
        if (source === void 0) { source = "api"; }
        if (key) {
            this.addRowGroupColumns([key], source);
        }
    };
    ColumnModel.prototype.addRowGroupColumns = function (keys, source) {
        if (source === void 0) { source = "api"; }
        this.autoGroupsNeedBuilding = true;
        this.updatePrimaryColumnList(keys, this.rowGroupColumns, true, this.setRowGroupActive.bind(this, true), events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, source);
    };
    ColumnModel.prototype.removeRowGroupColumns = function (keys, source) {
        if (source === void 0) { source = "api"; }
        this.autoGroupsNeedBuilding = true;
        this.updatePrimaryColumnList(keys, this.rowGroupColumns, false, this.setRowGroupActive.bind(this, false), events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, source);
    };
    ColumnModel.prototype.removeRowGroupColumn = function (key, source) {
        if (source === void 0) { source = "api"; }
        if (key) {
            this.removeRowGroupColumns([key], source);
        }
    };
    ColumnModel.prototype.addPivotColumns = function (keys, source) {
        if (source === void 0) { source = "api"; }
        this.updatePrimaryColumnList(keys, this.pivotColumns, true, function (column) { return column.setPivotActive(true, source); }, events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, source);
    };
    ColumnModel.prototype.setPivotColumns = function (colKeys, source) {
        if (source === void 0) { source = "api"; }
        this.setPrimaryColumnList(colKeys, this.pivotColumns, events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, function (added, column) {
            column.setPivotActive(added, source);
        }, source);
    };
    ColumnModel.prototype.addPivotColumn = function (key, source) {
        if (source === void 0) { source = "api"; }
        this.addPivotColumns([key], source);
    };
    ColumnModel.prototype.removePivotColumns = function (keys, source) {
        if (source === void 0) { source = "api"; }
        this.updatePrimaryColumnList(keys, this.pivotColumns, false, function (column) { return column.setPivotActive(false, source); }, events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, source);
    };
    ColumnModel.prototype.removePivotColumn = function (key, source) {
        if (source === void 0) { source = "api"; }
        this.removePivotColumns([key], source);
    };
    ColumnModel.prototype.setPrimaryColumnList = function (colKeys, masterList, eventName, columnCallback, source) {
        var _this = this;
        masterList.length = 0;
        if (generic_1.exists(colKeys)) {
            colKeys.forEach(function (key) {
                var column = _this.getPrimaryColumn(key);
                if (column) {
                    masterList.push(column);
                }
            });
        }
        (this.primaryColumns || []).forEach(function (column) {
            var added = masterList.indexOf(column) >= 0;
            columnCallback(added, column);
        });
        if (this.autoGroupsNeedBuilding) {
            this.updateGridColumns();
        }
        this.updateDisplayedColumns(source);
        this.dispatchColumnChangedEvent(eventName, masterList, source);
    };
    ColumnModel.prototype.setValueColumns = function (colKeys, source) {
        if (source === void 0) { source = "api"; }
        this.setPrimaryColumnList(colKeys, this.valueColumns, events_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.setValueActive.bind(this), source);
    };
    ColumnModel.prototype.setValueActive = function (active, column, source) {
        if (active === column.isValueActive()) {
            return;
        }
        column.setValueActive(active, source);
        if (active && !column.getAggFunc()) {
            var initialAggFunc = this.aggFuncService.getDefaultAggFunc(column);
            column.setAggFunc(initialAggFunc);
        }
    };
    ColumnModel.prototype.addValueColumns = function (keys, source) {
        if (source === void 0) { source = "api"; }
        this.updatePrimaryColumnList(keys, this.valueColumns, true, this.setValueActive.bind(this, true), events_1.Events.EVENT_COLUMN_VALUE_CHANGED, source);
    };
    ColumnModel.prototype.addValueColumn = function (colKey, source) {
        if (source === void 0) { source = "api"; }
        if (colKey) {
            this.addValueColumns([colKey], source);
        }
    };
    ColumnModel.prototype.removeValueColumn = function (colKey, source) {
        if (source === void 0) { source = "api"; }
        this.removeValueColumns([colKey], source);
    };
    ColumnModel.prototype.removeValueColumns = function (keys, source) {
        if (source === void 0) { source = "api"; }
        this.updatePrimaryColumnList(keys, this.valueColumns, false, this.setValueActive.bind(this, false), events_1.Events.EVENT_COLUMN_VALUE_CHANGED, source);
    };
    // returns the width we can set to this col, taking into consideration min and max widths
    ColumnModel.prototype.normaliseColumnWidth = function (column, newWidth) {
        var minWidth = column.getMinWidth();
        if (generic_1.exists(minWidth) && newWidth < minWidth) {
            newWidth = minWidth;
        }
        var maxWidth = column.getMaxWidth();
        if (generic_1.exists(maxWidth) && column.isGreaterThanMax(newWidth)) {
            newWidth = maxWidth;
        }
        return newWidth;
    };
    ColumnModel.prototype.getPrimaryOrGridColumn = function (key) {
        var column = this.getPrimaryColumn(key);
        return column || this.getGridColumn(key);
    };
    ColumnModel.prototype.setColumnWidths = function (columnWidths, shiftKey, // @takeFromAdjacent - if user has 'shift' pressed, then pixels are taken from adjacent column
    finished, // @finished - ends up in the event, tells the user if more events are to come
    source) {
        var _this = this;
        if (source === void 0) { source = "api"; }
        var sets = [];
        columnWidths.forEach(function (columnWidth) {
            var col = _this.getPrimaryOrGridColumn(columnWidth.key);
            if (!col) {
                return;
            }
            sets.push({
                width: columnWidth.newWidth,
                ratios: [1],
                columns: [col]
            });
            // if user wants to do shift resize by default, then we invert the shift operation
            var defaultIsShift = _this.gridOptionsService.get('colResizeDefault') === 'shift';
            if (defaultIsShift) {
                shiftKey = !shiftKey;
            }
            if (shiftKey) {
                var otherCol = _this.getDisplayedColAfter(col);
                if (!otherCol) {
                    return;
                }
                var widthDiff = col.getActualWidth() - columnWidth.newWidth;
                var otherColWidth = otherCol.getActualWidth() + widthDiff;
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
            finished: finished,
            source: source
        });
    };
    ColumnModel.prototype.checkMinAndMaxWidthsForSet = function (columnResizeSet) {
        var columns = columnResizeSet.columns, width = columnResizeSet.width;
        // every col has a min width, so sum them all up and see if we have enough room
        // for all the min widths
        var minWidthAccumulated = 0;
        var maxWidthAccumulated = 0;
        var maxWidthActive = true;
        columns.forEach(function (col) {
            var minWidth = col.getMinWidth();
            minWidthAccumulated += minWidth || 0;
            var maxWidth = col.getMaxWidth();
            if (generic_1.exists(maxWidth) && maxWidth > 0) {
                maxWidthAccumulated += maxWidth;
            }
            else {
                // if at least one columns has no max width, it means the group of columns
                // then has no max width, as at least one column can take as much width as possible
                maxWidthActive = false;
            }
        });
        var minWidthPasses = width >= minWidthAccumulated;
        var maxWidthPasses = !maxWidthActive || (width <= maxWidthAccumulated);
        return minWidthPasses && maxWidthPasses;
    };
    // method takes sets of columns and resizes them. either all sets will be resized, or nothing
    // be resized. this is used for example when user tries to resize a group and holds shift key,
    // then both the current group (grows), and the adjacent group (shrinks), will get resized,
    // so that's two sets for this method.
    ColumnModel.prototype.resizeColumnSets = function (params) {
        var _this = this;
        var resizeSets = params.resizeSets, finished = params.finished, source = params.source;
        var passMinMaxCheck = !resizeSets || resizeSets.every(function (columnResizeSet) { return _this.checkMinAndMaxWidthsForSet(columnResizeSet); });
        if (!passMinMaxCheck) {
            // even though we are not going to resize beyond min/max size, we still need to dispatch event when finished
            if (finished) {
                var columns = resizeSets && resizeSets.length > 0 ? resizeSets[0].columns : null;
                this.dispatchColumnResizedEvent(columns, finished, source);
            }
            return; // don't resize!
        }
        var changedCols = [];
        var allResizedCols = [];
        resizeSets.forEach(function (set) {
            var width = set.width, columns = set.columns, ratios = set.ratios;
            // keep track of pixels used, and last column gets the remaining,
            // to cater for rounding errors, and min width adjustments
            var newWidths = {};
            var finishedCols = {};
            columns.forEach(function (col) { return allResizedCols.push(col); });
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
            var finishedColsGrew = true;
            var loopCount = 0;
            var _loop_2 = function () {
                loopCount++;
                if (loopCount > 1000) {
                    // this should never happen, but in the future, someone might introduce a bug here,
                    // so we stop the browser from hanging and report bug properly
                    console.error('AG Grid: infinite loop in resizeColumnSets');
                    return "break";
                }
                finishedColsGrew = false;
                var subsetCols = [];
                var subsetRatioTotal = 0;
                var pixelsToDistribute = width;
                columns.forEach(function (col, index) {
                    var thisColFinished = finishedCols[col.getId()];
                    if (thisColFinished) {
                        pixelsToDistribute -= newWidths[col.getId()];
                    }
                    else {
                        subsetCols.push(col);
                        var ratioThisCol = ratios[index];
                        subsetRatioTotal += ratioThisCol;
                    }
                });
                // because we are not using all of the ratios (cols can be missing),
                // we scale the ratio. if all columns are included, then subsetRatioTotal=1,
                // and so the ratioScale will be 1.
                var ratioScale = 1 / subsetRatioTotal;
                subsetCols.forEach(function (col, index) {
                    var lastCol = index === (subsetCols.length - 1);
                    var colNewWidth;
                    if (lastCol) {
                        colNewWidth = pixelsToDistribute;
                    }
                    else {
                        colNewWidth = Math.round(ratios[index] * width * ratioScale);
                        pixelsToDistribute -= colNewWidth;
                    }
                    var minWidth = col.getMinWidth();
                    var maxWidth = col.getMaxWidth();
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
            };
            while (finishedColsGrew) {
                var state_1 = _loop_2();
                if (state_1 === "break")
                    break;
            }
            columns.forEach(function (col) {
                var newWidth = newWidths[col.getId()];
                var actualWidth = col.getActualWidth();
                if (actualWidth !== newWidth) {
                    col.setActualWidth(newWidth, source);
                    changedCols.push(col);
                }
            });
        });
        // if no cols changed, then no need to update more or send event.
        var atLeastOneColChanged = changedCols.length > 0;
        var flexedCols = [];
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
        var colsForEvent = allResizedCols.concat(flexedCols);
        if (atLeastOneColChanged || finished) {
            this.dispatchColumnResizedEvent(colsForEvent, finished, source, flexedCols);
        }
    };
    ColumnModel.prototype.setColumnAggFunc = function (key, aggFunc, source) {
        if (source === void 0) { source = "api"; }
        if (!key) {
            return;
        }
        var column = this.getPrimaryColumn(key);
        if (!column) {
            return;
        }
        column.setAggFunc(aggFunc);
        this.dispatchColumnChangedEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, [column], source);
    };
    ColumnModel.prototype.moveRowGroupColumn = function (fromIndex, toIndex, source) {
        if (source === void 0) { source = "api"; }
        var column = this.rowGroupColumns[fromIndex];
        this.rowGroupColumns.splice(fromIndex, 1);
        this.rowGroupColumns.splice(toIndex, 0, column);
        var event = {
            type: events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            columns: this.rowGroupColumns,
            column: this.rowGroupColumns.length === 1 ? this.rowGroupColumns[0] : null,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnModel.prototype.moveColumns = function (columnsToMoveKeys, toIndex, source, finished) {
        if (source === void 0) { source = "api"; }
        if (finished === void 0) { finished = true; }
        this.columnAnimationService.start();
        if (toIndex > this.gridColumns.length - columnsToMoveKeys.length) {
            console.warn('AG Grid: tried to insert columns in invalid location, toIndex = ' + toIndex);
            console.warn('AG Grid: remember that you should not count the moving columns when calculating the new index');
            return;
        }
        // we want to pull all the columns out first and put them into an ordered list
        var movedColumns = this.getGridColumns(columnsToMoveKeys);
        var failedRules = !this.doesMovePassRules(movedColumns, toIndex);
        if (failedRules) {
            return;
        }
        array_1.moveInArray(this.gridColumns, movedColumns, toIndex);
        this.updateDisplayedColumns(source);
        this.dispatchColumnMovedEvent({ movedColumns: movedColumns, source: source, toIndex: toIndex, finished: finished });
        this.columnAnimationService.finish();
    };
    ColumnModel.prototype.doesMovePassRules = function (columnsToMove, toIndex) {
        // make a copy of what the grid columns would look like after the move
        var proposedColumnOrder = this.getProposedColumnOrder(columnsToMove, toIndex);
        return this.doesOrderPassRules(proposedColumnOrder);
    };
    ColumnModel.prototype.doesOrderPassRules = function (gridOrder) {
        if (!this.doesMovePassMarryChildren(gridOrder)) {
            return false;
        }
        if (!this.doesMovePassLockedPositions(gridOrder)) {
            return false;
        }
        return true;
    };
    ColumnModel.prototype.getProposedColumnOrder = function (columnsToMove, toIndex) {
        var proposedColumnOrder = this.gridColumns.slice();
        array_1.moveInArray(proposedColumnOrder, columnsToMove, toIndex);
        return proposedColumnOrder;
    };
    // returns the provided cols sorted in same order as they appear in grid columns. eg if grid columns
    // contains [a,b,c,d,e] and col passed is [e,a] then the passed cols are sorted into [a,e]
    ColumnModel.prototype.sortColumnsLikeGridColumns = function (cols) {
        var _this = this;
        if (!cols || cols.length <= 1) {
            return;
        }
        var notAllColsInGridColumns = cols.filter(function (c) { return _this.gridColumns.indexOf(c) < 0; }).length > 0;
        if (notAllColsInGridColumns) {
            return;
        }
        cols.sort(function (a, b) {
            var indexA = _this.gridColumns.indexOf(a);
            var indexB = _this.gridColumns.indexOf(b);
            return indexA - indexB;
        });
    };
    ColumnModel.prototype.doesMovePassLockedPositions = function (proposedColumnOrder) {
        // Placement is a number indicating 'left' 'center' or 'right' as 0 1 2
        var lastPlacement = 0;
        var rulePassed = true;
        var lockPositionToPlacement = function (position) {
            if (!position) { // false or undefined
                return 1;
            }
            if (position === true) {
                return 0;
            }
            return position === 'left' ? 0 : 2; // Otherwise 'right'
        };
        proposedColumnOrder.forEach(function (col) {
            var placement = lockPositionToPlacement(col.getColDef().lockPosition);
            if (placement < lastPlacement) { // If placement goes down, we're not in the correct order
                rulePassed = false;
            }
            lastPlacement = placement;
        });
        return rulePassed;
    };
    ColumnModel.prototype.doesMovePassMarryChildren = function (allColumnsCopy) {
        var rulePassed = true;
        this.columnUtils.depthFirstOriginalTreeSearch(null, this.gridBalancedTree, function (child) {
            if (!(child instanceof providedColumnGroup_1.ProvidedColumnGroup)) {
                return;
            }
            var columnGroup = child;
            var colGroupDef = columnGroup.getColGroupDef();
            var marryChildren = colGroupDef && colGroupDef.marryChildren;
            if (!marryChildren) {
                return;
            }
            var newIndexes = [];
            columnGroup.getLeafColumns().forEach(function (col) {
                var newColIndex = allColumnsCopy.indexOf(col);
                newIndexes.push(newColIndex);
            });
            var maxIndex = Math.max.apply(Math, newIndexes);
            var minIndex = Math.min.apply(Math, newIndexes);
            // spread is how far the first column in this group is away from the last column
            var spread = maxIndex - minIndex;
            var maxSpread = columnGroup.getLeafColumns().length - 1;
            // if the columns
            if (spread > maxSpread) {
                rulePassed = false;
            }
            // console.log(`maxIndex = ${maxIndex}, minIndex = ${minIndex}, spread = ${spread}, maxSpread = ${maxSpread}, fail = ${spread > (count-1)}`)
            // console.log(allColumnsCopy.map( col => col.getColDef().field).join(','));
        });
        return rulePassed;
    };
    ColumnModel.prototype.moveColumn = function (key, toIndex, source) {
        if (source === void 0) { source = "api"; }
        this.moveColumns([key], toIndex, source);
    };
    ColumnModel.prototype.moveColumnByIndex = function (fromIndex, toIndex, source) {
        if (source === void 0) { source = "api"; }
        var column = this.gridColumns[fromIndex];
        this.moveColumn(column, toIndex, source);
    };
    ColumnModel.prototype.getColumnDefs = function () {
        var _this = this;
        if (!this.primaryColumns) {
            return;
        }
        var cols = this.primaryColumns.slice();
        if (this.gridColsArePrimary) {
            cols.sort(function (a, b) { return _this.gridColumns.indexOf(a) - _this.gridColumns.indexOf(b); });
        }
        else if (this.lastPrimaryOrder) {
            cols.sort(function (a, b) { return _this.lastPrimaryOrder.indexOf(a) - _this.lastPrimaryOrder.indexOf(b); });
        }
        return this.columnDefFactory.buildColumnDefs(cols, this.rowGroupColumns, this.pivotColumns);
    };
    // used by:
    // + angularGrid -> for setting body width
    // + rowController -> setting main row widths (when inserting and resizing)
    // need to cache this
    ColumnModel.prototype.getBodyContainerWidth = function () {
        return this.bodyWidth;
    };
    ColumnModel.prototype.getContainerWidth = function (pinned) {
        switch (pinned) {
            case 'left':
                return this.leftWidth;
            case 'right':
                return this.rightWidth;
            default:
                return this.bodyWidth;
        }
    };
    // after setColumnWidth or updateGroupsAndDisplayedColumns
    ColumnModel.prototype.updateBodyWidths = function () {
        var newBodyWidth = this.getWidthOfColsInList(this.displayedColumnsCenter);
        var newLeftWidth = this.getWidthOfColsInList(this.displayedColumnsLeft);
        var newRightWidth = this.getWidthOfColsInList(this.displayedColumnsRight);
        // this is used by virtual col calculation, for RTL only, as a change to body width can impact displayed
        // columns, due to RTL inverting the y coordinates
        this.bodyWidthDirty = this.bodyWidth !== newBodyWidth;
        var atLeastOneChanged = this.bodyWidth !== newBodyWidth || this.leftWidth !== newLeftWidth || this.rightWidth !== newRightWidth;
        if (atLeastOneChanged) {
            this.bodyWidth = newBodyWidth;
            this.leftWidth = newLeftWidth;
            this.rightWidth = newRightWidth;
            // when this fires, it is picked up by the gridPanel, which ends up in
            // gridPanel calling setWidthAndScrollPosition(), which in turn calls setViewportPosition()
            var event_2 = {
                type: events_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED,
            };
            this.eventService.dispatchEvent(event_2);
        }
    };
    // + rowController
    ColumnModel.prototype.getValueColumns = function () {
        return this.valueColumns ? this.valueColumns : [];
    };
    // + rowController
    ColumnModel.prototype.getPivotColumns = function () {
        return this.pivotColumns ? this.pivotColumns : [];
    };
    // + clientSideRowModel
    ColumnModel.prototype.isPivotActive = function () {
        return this.pivotColumns && this.pivotColumns.length > 0 && this.pivotMode;
    };
    // + toolPanel
    ColumnModel.prototype.getRowGroupColumns = function () {
        return this.rowGroupColumns ? this.rowGroupColumns : [];
    };
    // + rowController -> while inserting rows
    ColumnModel.prototype.getDisplayedCenterColumns = function () {
        return this.displayedColumnsCenter;
    };
    // + rowController -> while inserting rows
    ColumnModel.prototype.getDisplayedLeftColumns = function () {
        return this.displayedColumnsLeft;
    };
    ColumnModel.prototype.getDisplayedRightColumns = function () {
        return this.displayedColumnsRight;
    };
    ColumnModel.prototype.getDisplayedColumns = function (type) {
        switch (type) {
            case 'left':
                return this.getDisplayedLeftColumns();
            case 'right':
                return this.getDisplayedRightColumns();
            default:
                return this.getDisplayedCenterColumns();
        }
    };
    // used by:
    // + clientSideRowController -> sorting, building quick filter text
    // + headerRenderer -> sorting (clearing icon)
    ColumnModel.prototype.getAllPrimaryColumns = function () {
        return this.primaryColumns ? this.primaryColumns.slice() : null;
    };
    ColumnModel.prototype.getSecondaryColumns = function () {
        return this.secondaryColumns ? this.secondaryColumns.slice() : null;
    };
    ColumnModel.prototype.getAllColumnsForQuickFilter = function () {
        return this.columnsForQuickFilter;
    };
    // + moveColumnController
    ColumnModel.prototype.getAllGridColumns = function () {
        return this.gridColumns;
    };
    ColumnModel.prototype.isEmpty = function () {
        return generic_1.missingOrEmpty(this.gridColumns);
    };
    ColumnModel.prototype.isRowGroupEmpty = function () {
        return generic_1.missingOrEmpty(this.rowGroupColumns);
    };
    ColumnModel.prototype.setColumnVisible = function (key, visible, source) {
        if (source === void 0) { source = "api"; }
        this.setColumnsVisible([key], visible, source);
    };
    ColumnModel.prototype.setColumnsVisible = function (keys, visible, source) {
        if (visible === void 0) { visible = false; }
        if (source === void 0) { source = "api"; }
        this.applyColumnState({
            state: keys.map(function (key) { return ({
                colId: typeof key === 'string' ? key : key.getColId(),
                hide: !visible,
            }); }),
        }, source);
    };
    ColumnModel.prototype.setColumnPinned = function (key, pinned, source) {
        if (source === void 0) { source = "api"; }
        if (key) {
            this.setColumnsPinned([key], pinned, source);
        }
    };
    ColumnModel.prototype.setColumnsPinned = function (keys, pinned, source) {
        if (source === void 0) { source = "api"; }
        if (this.gridOptionsService.isDomLayout('print')) {
            console.warn("AG Grid: Changing the column pinning status is not allowed with domLayout='print'");
            return;
        }
        this.columnAnimationService.start();
        var actualPinned;
        if (pinned === true || pinned === 'left') {
            actualPinned = 'left';
        }
        else if (pinned === 'right') {
            actualPinned = 'right';
        }
        else {
            actualPinned = null;
        }
        this.actionOnGridColumns(keys, function (col) {
            if (col.getPinned() !== actualPinned) {
                col.setPinned(actualPinned);
                return true;
            }
            return false;
        }, source, function () {
            var event = {
                type: events_1.Events.EVENT_COLUMN_PINNED,
                pinned: actualPinned,
                column: null,
                columns: null,
                source: source
            };
            return event;
        });
        this.columnAnimationService.finish();
    };
    // does an action on a set of columns. provides common functionality for looking up the
    // columns based on key, getting a list of effected columns, and then updated the event
    // with either one column (if it was just one col) or a list of columns
    // used by: autoResize, setVisible, setPinned
    ColumnModel.prototype.actionOnGridColumns = function (// the column keys this action will be on
    keys, 
    // the action to do - if this returns false, the column was skipped
    // and won't be included in the event
    action, 
    // should return back a column event of the right type
    source, createEvent) {
        var _this = this;
        if (generic_1.missingOrEmpty(keys)) {
            return;
        }
        var updatedColumns = [];
        keys.forEach(function (key) {
            var column = _this.getGridColumn(key);
            if (!column) {
                return;
            }
            // need to check for false with type (ie !== instead of !=)
            // as not returning anything (undefined) would also be false
            var resultOfAction = action(column);
            if (resultOfAction !== false) {
                updatedColumns.push(column);
            }
        });
        if (!updatedColumns.length) {
            return;
        }
        this.updateDisplayedColumns(source);
        if (generic_1.exists(createEvent) && createEvent) {
            var event_3 = createEvent();
            event_3.columns = updatedColumns;
            event_3.column = updatedColumns.length === 1 ? updatedColumns[0] : null;
            this.eventService.dispatchEvent(event_3);
        }
    };
    ColumnModel.prototype.getDisplayedColBefore = function (col) {
        var allDisplayedColumns = this.getAllDisplayedColumns();
        var oldIndex = allDisplayedColumns.indexOf(col);
        if (oldIndex > 0) {
            return allDisplayedColumns[oldIndex - 1];
        }
        return null;
    };
    // used by:
    // + rowRenderer -> for navigation
    ColumnModel.prototype.getDisplayedColAfter = function (col) {
        var allDisplayedColumns = this.getAllDisplayedColumns();
        var oldIndex = allDisplayedColumns.indexOf(col);
        if (oldIndex < (allDisplayedColumns.length - 1)) {
            return allDisplayedColumns[oldIndex + 1];
        }
        return null;
    };
    ColumnModel.prototype.getDisplayedGroupAfter = function (columnGroup) {
        return this.getDisplayedGroupAtDirection(columnGroup, 'After');
    };
    ColumnModel.prototype.getDisplayedGroupBefore = function (columnGroup) {
        return this.getDisplayedGroupAtDirection(columnGroup, 'Before');
    };
    ColumnModel.prototype.getDisplayedGroupAtDirection = function (columnGroup, direction) {
        // pick the last displayed column in this group
        var requiredLevel = columnGroup.getProvidedColumnGroup().getLevel() + columnGroup.getPaddingLevel();
        var colGroupLeafColumns = columnGroup.getDisplayedLeafColumns();
        var col = direction === 'After' ? array_1.last(colGroupLeafColumns) : colGroupLeafColumns[0];
        var getDisplayColMethod = "getDisplayedCol" + direction;
        while (true) {
            // keep moving to the next col, until we get to another group
            var column = this[getDisplayColMethod](col);
            if (!column) {
                return null;
            }
            var groupPointer = this.getColumnGroupAtLevel(column, requiredLevel);
            if (groupPointer !== columnGroup) {
                return groupPointer;
            }
        }
    };
    ColumnModel.prototype.getColumnGroupAtLevel = function (column, level) {
        // get group at same level as the one we are looking for
        var groupPointer = column.getParent();
        var originalGroupLevel;
        var groupPointerLevel;
        while (true) {
            var groupPointerProvidedColumnGroup = groupPointer.getProvidedColumnGroup();
            originalGroupLevel = groupPointerProvidedColumnGroup.getLevel();
            groupPointerLevel = groupPointer.getPaddingLevel();
            if (originalGroupLevel + groupPointerLevel <= level) {
                break;
            }
            groupPointer = groupPointer.getParent();
        }
        return groupPointer;
    };
    ColumnModel.prototype.isPinningLeft = function () {
        return this.displayedColumnsLeft.length > 0;
    };
    ColumnModel.prototype.isPinningRight = function () {
        return this.displayedColumnsRight.length > 0;
    };
    ColumnModel.prototype.getPrimaryAndSecondaryAndAutoColumns = function () {
        var _a;
        return (_a = []).concat.apply(_a, __spread([
            this.primaryColumns || [],
            this.groupAutoColumns || [],
            this.secondaryColumns || [],
        ]));
    };
    ColumnModel.prototype.createStateItemFromColumn = function (column) {
        var rowGroupIndex = column.isRowGroupActive() ? this.rowGroupColumns.indexOf(column) : null;
        var pivotIndex = column.isPivotActive() ? this.pivotColumns.indexOf(column) : null;
        var aggFunc = column.isValueActive() ? column.getAggFunc() : null;
        var sort = column.getSort() != null ? column.getSort() : null;
        var sortIndex = column.getSortIndex() != null ? column.getSortIndex() : null;
        var flex = column.getFlex() != null && column.getFlex() > 0 ? column.getFlex() : null;
        var res = {
            colId: column.getColId(),
            width: column.getActualWidth(),
            hide: !column.isVisible(),
            pinned: column.getPinned(),
            sort: sort,
            sortIndex: sortIndex,
            aggFunc: aggFunc,
            rowGroup: column.isRowGroupActive(),
            rowGroupIndex: rowGroupIndex,
            pivot: column.isPivotActive(),
            pivotIndex: pivotIndex,
            flex: flex
        };
        return res;
    };
    ColumnModel.prototype.getColumnState = function () {
        if (generic_1.missing(this.primaryColumns) || !this.isAlive()) {
            return [];
        }
        var colsForState = this.getPrimaryAndSecondaryAndAutoColumns();
        var res = colsForState.map(this.createStateItemFromColumn.bind(this));
        this.orderColumnStateList(res);
        return res;
    };
    ColumnModel.prototype.orderColumnStateList = function (columnStateList) {
        // for fast looking, store the index of each column
        var colIdToGridIndexMap = map_1.convertToMap(this.gridColumns.map(function (col, index) { return [col.getColId(), index]; }));
        columnStateList.sort(function (itemA, itemB) {
            var posA = colIdToGridIndexMap.has(itemA.colId) ? colIdToGridIndexMap.get(itemA.colId) : -1;
            var posB = colIdToGridIndexMap.has(itemB.colId) ? colIdToGridIndexMap.get(itemB.colId) : -1;
            return posA - posB;
        });
    };
    ColumnModel.prototype.resetColumnState = function (source) {
        // NOTE = there is one bug here that no customer has noticed - if a column has colDef.lockPosition,
        // this is ignored  below when ordering the cols. to work, we should always put lockPosition cols first.
        // As a work around, developers should just put lockPosition columns first in their colDef list.
        if (source === void 0) { source = "api"; }
        // we can't use 'allColumns' as the order might of messed up, so get the primary ordered list
        var primaryColumns = this.getColumnsFromTree(this.primaryColumnTree);
        var columnStates = [];
        // we start at 1000, so if user has mix of rowGroup and group specified, it will work with both.
        // eg IF user has ColA.rowGroupIndex=0, ColB.rowGroupIndex=1, ColC.rowGroup=true,
        // THEN result will be ColA.rowGroupIndex=0, ColB.rowGroupIndex=1, ColC.rowGroup=1000
        var letRowGroupIndex = 1000;
        var letPivotIndex = 1000;
        var colsToProcess = [];
        if (this.groupAutoColumns) {
            colsToProcess = colsToProcess.concat(this.groupAutoColumns);
        }
        if (primaryColumns) {
            colsToProcess = colsToProcess.concat(primaryColumns);
        }
        colsToProcess.forEach(function (column) {
            var getValueOrNull = function (a, b) { return a != null ? a : b != null ? b : null; };
            var colDef = column.getColDef();
            var sort = getValueOrNull(colDef.sort, colDef.initialSort);
            var sortIndex = getValueOrNull(colDef.sortIndex, colDef.initialSortIndex);
            var hide = getValueOrNull(colDef.hide, colDef.initialHide);
            var pinned = getValueOrNull(colDef.pinned, colDef.initialPinned);
            var width = getValueOrNull(colDef.width, colDef.initialWidth);
            var flex = getValueOrNull(colDef.flex, colDef.initialFlex);
            var rowGroupIndex = getValueOrNull(colDef.rowGroupIndex, colDef.initialRowGroupIndex);
            var rowGroup = getValueOrNull(colDef.rowGroup, colDef.initialRowGroup);
            if (rowGroupIndex == null && (rowGroup == null || rowGroup == false)) {
                rowGroupIndex = null;
                rowGroup = null;
            }
            var pivotIndex = getValueOrNull(colDef.pivotIndex, colDef.initialPivotIndex);
            var pivot = getValueOrNull(colDef.pivot, colDef.initialPivot);
            if (pivotIndex == null && (pivot == null || pivot == false)) {
                pivotIndex = null;
                pivot = null;
            }
            var aggFunc = getValueOrNull(colDef.aggFunc, colDef.initialAggFunc);
            var stateItem = {
                colId: column.getColId(),
                sort: sort,
                sortIndex: sortIndex,
                hide: hide,
                pinned: pinned,
                width: width,
                flex: flex,
                rowGroup: rowGroup,
                rowGroupIndex: rowGroupIndex,
                pivot: pivot,
                pivotIndex: pivotIndex,
                aggFunc: aggFunc,
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
    };
    ColumnModel.prototype.applyColumnState = function (params, source) {
        var _this = this;
        if (generic_1.missingOrEmpty(this.primaryColumns)) {
            return false;
        }
        if (params && params.state && !params.state.forEach) {
            console.warn('AG Grid: applyColumnState() - the state attribute should be an array, however an array was not found. Please provide an array of items (one for each col you want to change) for state.');
            return false;
        }
        var applyStates = function (states, existingColumns, getById) {
            var dispatchEventsFunc = _this.compareColumnStatesAndDispatchEvents(source);
            _this.autoGroupsNeedBuilding = true;
            // at the end below, this list will have all columns we got no state for
            var columnsWithNoState = existingColumns.slice();
            var rowGroupIndexes = {};
            var pivotIndexes = {};
            var autoGroupColumnStates = [];
            // If pivoting is modified, these are the states we try to reapply after
            // the secondary columns are re-generated
            var unmatchedAndAutoStates = [];
            var unmatchedCount = 0;
            var previousRowGroupCols = _this.rowGroupColumns.slice();
            var previousPivotCols = _this.pivotColumns.slice();
            states.forEach(function (state) {
                var colId = state.colId || '';
                // auto group columns are re-created so deferring syncing with ColumnState
                var isAutoGroupColumn = colId.startsWith(autoGroupColService_1.GROUP_AUTO_COLUMN_ID);
                if (isAutoGroupColumn) {
                    autoGroupColumnStates.push(state);
                    unmatchedAndAutoStates.push(state);
                    return;
                }
                var column = getById(colId);
                if (!column) {
                    unmatchedAndAutoStates.push(state);
                    unmatchedCount += 1;
                }
                else {
                    _this.syncColumnWithStateItem(column, state, params.defaultState, rowGroupIndexes, pivotIndexes, false, source);
                    array_1.removeFromArray(columnsWithNoState, column);
                }
            });
            // anything left over, we got no data for, so add in the column as non-value, non-rowGroup and hidden
            var applyDefaultsFunc = function (col) {
                return _this.syncColumnWithStateItem(col, null, params.defaultState, rowGroupIndexes, pivotIndexes, false, source);
            };
            columnsWithNoState.forEach(applyDefaultsFunc);
            // sort the lists according to the indexes that were provided
            var comparator = function (indexes, oldList, colA, colB) {
                var indexA = indexes[colA.getId()];
                var indexB = indexes[colB.getId()];
                var aHasIndex = indexA != null;
                var bHasIndex = indexB != null;
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
                var oldIndexA = oldList.indexOf(colA);
                var oldIndexB = oldList.indexOf(colB);
                var aHasOldIndex = oldIndexA >= 0;
                var bHasOldIndex = oldIndexB >= 0;
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
            _this.rowGroupColumns.sort(comparator.bind(_this, rowGroupIndexes, previousRowGroupCols));
            _this.pivotColumns.sort(comparator.bind(_this, pivotIndexes, previousPivotCols));
            _this.updateGridColumns();
            // sync newly created auto group columns with ColumnState
            var autoGroupColsCopy = _this.groupAutoColumns ? _this.groupAutoColumns.slice() : [];
            autoGroupColumnStates.forEach(function (stateItem) {
                var autoCol = _this.getAutoColumn(stateItem.colId);
                array_1.removeFromArray(autoGroupColsCopy, autoCol);
                _this.syncColumnWithStateItem(autoCol, stateItem, params.defaultState, null, null, true, source);
            });
            // autogroup cols with nothing else, apply the default
            autoGroupColsCopy.forEach(applyDefaultsFunc);
            _this.applyOrderAfterApplyState(params);
            _this.updateDisplayedColumns(source);
            _this.dispatchEverythingChanged(source);
            dispatchEventsFunc(); // Will trigger secondary column changes if pivoting modified
            return { unmatchedAndAutoStates: unmatchedAndAutoStates, unmatchedCount: unmatchedCount };
        };
        this.columnAnimationService.start();
        var _a = applyStates(params.state || [], this.primaryColumns || [], function (id) { return _this.getPrimaryColumn(id); }), unmatchedAndAutoStates = _a.unmatchedAndAutoStates, unmatchedCount = _a.unmatchedCount;
        // If there are still states left over, see if we can apply them to newly generated
        // secondary or auto columns. Also if defaults exist, ensure they are applied to secondary cols
        if (unmatchedAndAutoStates.length > 0 || generic_1.exists(params.defaultState)) {
            unmatchedCount = applyStates(unmatchedAndAutoStates, this.secondaryColumns || [], function (id) { return _this.getSecondaryColumn(id); }).unmatchedCount;
        }
        this.columnAnimationService.finish();
        return unmatchedCount === 0; // Successful if no states unaccounted for
    };
    ColumnModel.prototype.applyOrderAfterApplyState = function (params) {
        var _this = this;
        if (!params.applyOrder || !params.state) {
            return;
        }
        var newOrder = [];
        var processedColIds = {};
        params.state.forEach(function (item) {
            if (!item.colId || processedColIds[item.colId]) {
                return;
            }
            var col = _this.gridColumnsMap[item.colId];
            if (col) {
                newOrder.push(col);
                processedColIds[item.colId] = true;
            }
        });
        // add in all other columns
        var autoGroupInsertIndex = 0;
        this.gridColumns.forEach(function (col) {
            var colId = col.getColId();
            var alreadyProcessed = processedColIds[colId] != null;
            if (alreadyProcessed) {
                return;
            }
            var isAutoGroupCol = colId.startsWith(autoGroupColService_1.GROUP_AUTO_COLUMN_ID);
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
    };
    ColumnModel.prototype.compareColumnStatesAndDispatchEvents = function (source) {
        var _this = this;
        var startState = {
            rowGroupColumns: this.rowGroupColumns.slice(),
            pivotColumns: this.pivotColumns.slice(),
            valueColumns: this.valueColumns.slice()
        };
        var columnStateBefore = this.getColumnState();
        var columnStateBeforeMap = {};
        columnStateBefore.forEach(function (col) {
            columnStateBeforeMap[col.colId] = col;
        });
        return function () {
            var colsForState = _this.getPrimaryAndSecondaryAndAutoColumns();
            // dispatches generic ColumnEvents where all columns are returned rather than what has changed
            var dispatchWhenListsDifferent = function (eventType, colsBefore, colsAfter, idMapper) {
                var beforeList = colsBefore.map(idMapper);
                var afterList = colsAfter.map(idMapper);
                var unchanged = array_1.areEqual(beforeList, afterList);
                if (unchanged) {
                    return;
                }
                // returning all columns rather than what has changed!
                var event = {
                    type: eventType,
                    columns: colsAfter,
                    column: colsAfter.length === 1 ? colsAfter[0] : null,
                    source: source
                };
                _this.eventService.dispatchEvent(event);
            };
            // determines which columns have changed according to supplied predicate
            var getChangedColumns = function (changedPredicate) {
                var changedColumns = [];
                colsForState.forEach(function (column) {
                    var colStateBefore = columnStateBeforeMap[column.getColId()];
                    if (colStateBefore && changedPredicate(colStateBefore, column)) {
                        changedColumns.push(column);
                    }
                });
                return changedColumns;
            };
            var columnIdMapper = function (c) { return c.getColId(); };
            dispatchWhenListsDifferent(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, startState.rowGroupColumns, _this.rowGroupColumns, columnIdMapper);
            dispatchWhenListsDifferent(events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, startState.pivotColumns, _this.pivotColumns, columnIdMapper);
            var valueChangePredicate = function (cs, c) {
                var oldActive = cs.aggFunc != null;
                var activeChanged = oldActive != c.isValueActive();
                // we only check aggFunc if the agg is active
                var aggFuncChanged = oldActive && cs.aggFunc != c.getAggFunc();
                return activeChanged || aggFuncChanged;
            };
            var changedValues = getChangedColumns(valueChangePredicate);
            if (changedValues.length > 0) {
                // we pass all value columns, now the ones that changed. this is the same
                // as pivot and rowGroup cols, but different to all other properties below.
                // this is more for backwards compatibility, as it's always been this way.
                // really it should be the other way, as the order of the cols makes no difference
                // for valueColumns (apart from displaying them in the tool panel).
                _this.dispatchColumnChangedEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, _this.valueColumns, source);
            }
            var resizeChangePredicate = function (cs, c) { return cs.width != c.getActualWidth(); };
            _this.dispatchColumnResizedEvent(getChangedColumns(resizeChangePredicate), true, source);
            var pinnedChangePredicate = function (cs, c) { return cs.pinned != c.getPinned(); };
            _this.dispatchColumnPinnedEvent(getChangedColumns(pinnedChangePredicate), source);
            var visibilityChangePredicate = function (cs, c) { return cs.hide == c.isVisible(); };
            _this.dispatchColumnVisibleEvent(getChangedColumns(visibilityChangePredicate), source);
            var sortChangePredicate = function (cs, c) { return cs.sort != c.getSort() || cs.sortIndex != c.getSortIndex(); };
            if (getChangedColumns(sortChangePredicate).length > 0) {
                _this.sortController.dispatchSortChangedEvents(source);
            }
            // special handling for moved column events
            _this.normaliseColumnMovedEventForColumnState(columnStateBefore, source);
        };
    };
    ColumnModel.prototype.getCommonValue = function (cols, valueGetter) {
        if (!cols || cols.length == 0) {
            return undefined;
        }
        // compare each value to the first value. if nothing differs, then value is common so return it.
        var firstValue = valueGetter(cols[0]);
        for (var i = 1; i < cols.length; i++) {
            if (firstValue !== valueGetter(cols[i])) {
                // values differ, no common value
                return undefined;
            }
        }
        return firstValue;
    };
    ColumnModel.prototype.normaliseColumnMovedEventForColumnState = function (colStateBefore, source) {
        // we are only interested in columns that were both present and visible before and after
        var _this = this;
        var colStateAfter = this.getColumnState();
        var colStateAfterMapped = {};
        colStateAfter.forEach(function (s) { return colStateAfterMapped[s.colId] = s; });
        // get id's of cols in both before and after lists
        var colsIntersectIds = {};
        colStateBefore.forEach(function (s) {
            if (colStateAfterMapped[s.colId]) {
                colsIntersectIds[s.colId] = true;
            }
        });
        // filter state lists, so we only have cols that were present before and after
        var beforeFiltered = colStateBefore.filter(function (c) { return colsIntersectIds[c.colId]; });
        var afterFiltered = colStateAfter.filter(function (c) { return colsIntersectIds[c.colId]; });
        // see if any cols are in a different location
        var movedColumns = [];
        afterFiltered.forEach(function (csAfter, index) {
            var csBefore = beforeFiltered && beforeFiltered[index];
            if (csBefore && csBefore.colId !== csAfter.colId) {
                var gridCol = _this.getGridColumn(csBefore.colId);
                if (gridCol) {
                    movedColumns.push(gridCol);
                }
            }
        });
        if (!movedColumns.length) {
            return;
        }
        this.dispatchColumnMovedEvent({ movedColumns: movedColumns, source: source, finished: true });
    };
    ColumnModel.prototype.syncColumnWithStateItem = function (column, stateItem, defaultState, rowGroupIndexes, pivotIndexes, autoCol, source) {
        if (!column) {
            return;
        }
        var getValue = function (key1, key2) {
            var obj = { value1: undefined, value2: undefined };
            var calculated = false;
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
        var hide = getValue('hide').value1;
        if (hide !== undefined) {
            column.setVisible(!hide, source);
        }
        // sets pinned to 'left' or 'right'
        var pinned = getValue('pinned').value1;
        if (pinned !== undefined) {
            column.setPinned(pinned);
        }
        // if width provided and valid, use it, otherwise stick with the old width
        var minColWidth = this.columnUtils.calculateColMinWidth(column.getColDef());
        // flex
        var flex = getValue('flex').value1;
        if (flex !== undefined) {
            column.setFlex(flex);
        }
        // width - we only set width if column is not flexing
        var noFlexThisCol = column.getFlex() <= 0;
        if (noFlexThisCol) {
            // both null and undefined means we skip, as it's not possible to 'clear' width (a column must have a width)
            var width = getValue('width').value1;
            if (width != null) {
                if (minColWidth != null && width >= minColWidth) {
                    column.setActualWidth(width, source);
                }
            }
        }
        var sort = getValue('sort').value1;
        if (sort !== undefined) {
            if (sort === 'desc' || sort === 'asc') {
                column.setSort(sort, source);
            }
            else {
                column.setSort(undefined, source);
            }
        }
        var sortIndex = getValue('sortIndex').value1;
        if (sortIndex !== undefined) {
            column.setSortIndex(sortIndex);
        }
        // we do not do aggFunc, rowGroup or pivot for auto cols or secondary cols
        if (autoCol || !column.isPrimary()) {
            return;
        }
        var aggFunc = getValue('aggFunc').value1;
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
        var _a = getValue('rowGroup', 'rowGroupIndex'), rowGroup = _a.value1, rowGroupIndex = _a.value2;
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
        var _b = getValue('pivot', 'pivotIndex'), pivot = _b.value1, pivotIndex = _b.value2;
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
    };
    ColumnModel.prototype.getGridColumns = function (keys) {
        return this.getColumns(keys, this.getGridColumn.bind(this));
    };
    ColumnModel.prototype.getColumns = function (keys, columnLookupCallback) {
        var foundColumns = [];
        if (keys) {
            keys.forEach(function (key) {
                var column = columnLookupCallback(key);
                if (column) {
                    foundColumns.push(column);
                }
            });
        }
        return foundColumns;
    };
    // used by growGroupPanel
    ColumnModel.prototype.getColumnWithValidation = function (key) {
        if (key == null) {
            return null;
        }
        var column = this.getGridColumn(key);
        if (!column) {
            console.warn('AG Grid: could not find column ' + key);
        }
        return column;
    };
    ColumnModel.prototype.getPrimaryColumn = function (key) {
        if (!this.primaryColumns) {
            return null;
        }
        return this.getColumn(key, this.primaryColumns, this.primaryColumnsMap);
    };
    ColumnModel.prototype.getGridColumn = function (key) {
        return this.getColumn(key, this.gridColumns, this.gridColumnsMap);
    };
    ColumnModel.prototype.getSecondaryColumn = function (key) {
        if (!this.secondaryColumns) {
            return null;
        }
        return this.getColumn(key, this.secondaryColumns, this.secondaryColumnsMap);
    };
    ColumnModel.prototype.getColumn = function (key, columnList, columnMap) {
        if (!key) {
            return null;
        }
        // most of the time this method gets called the key is a string, so we put this shortcut in
        // for performance reasons, to see if we can match for ID (it doesn't do auto columns, that's done below)
        if (typeof key == 'string' && columnMap[key]) {
            return columnMap[key];
        }
        for (var i = 0; i < columnList.length; i++) {
            if (this.columnsMatch(columnList[i], key)) {
                return columnList[i];
            }
        }
        return this.getAutoColumn(key);
    };
    ColumnModel.prototype.getSourceColumnsForGroupColumn = function (groupCol) {
        var sourceColumnId = groupCol.getColDef().showRowGroup;
        if (!sourceColumnId) {
            return null;
        }
        if (sourceColumnId === true) {
            return this.rowGroupColumns.slice(0);
        }
        var column = this.getPrimaryColumn(sourceColumnId);
        return column ? [column] : null;
    };
    ColumnModel.prototype.getAutoColumn = function (key) {
        var _this = this;
        if (!this.groupAutoColumns ||
            !generic_1.exists(this.groupAutoColumns) ||
            generic_1.missing(this.groupAutoColumns)) {
            return null;
        }
        return this.groupAutoColumns.find(function (groupCol) { return _this.columnsMatch(groupCol, key); }) || null;
    };
    ColumnModel.prototype.columnsMatch = function (column, key) {
        var columnMatches = column === key;
        var colDefMatches = column.getColDef() === key;
        var idMatches = column.getColId() == key;
        return columnMatches || colDefMatches || idMatches;
    };
    ColumnModel.prototype.getDisplayNameForColumn = function (column, location, includeAggFunc) {
        if (includeAggFunc === void 0) { includeAggFunc = false; }
        if (!column) {
            return null;
        }
        var headerName = this.getHeaderName(column.getColDef(), column, null, null, location);
        if (includeAggFunc) {
            return this.wrapHeaderNameWithAggFunc(column, headerName);
        }
        return headerName;
    };
    ColumnModel.prototype.getDisplayNameForProvidedColumnGroup = function (columnGroup, providedColumnGroup, location) {
        var colGroupDef = providedColumnGroup ? providedColumnGroup.getColGroupDef() : null;
        if (colGroupDef) {
            return this.getHeaderName(colGroupDef, null, columnGroup, providedColumnGroup, location);
        }
        return null;
    };
    ColumnModel.prototype.getDisplayNameForColumnGroup = function (columnGroup, location) {
        return this.getDisplayNameForProvidedColumnGroup(columnGroup, columnGroup.getProvidedColumnGroup(), location);
    };
    // location is where the column is going to appear, ie who is calling us
    ColumnModel.prototype.getHeaderName = function (colDef, column, columnGroup, providedColumnGroup, location) {
        var headerValueGetter = colDef.headerValueGetter;
        if (headerValueGetter) {
            var params = {
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
    };
    ColumnModel.prototype.wrapHeaderNameWithAggFunc = function (column, headerName) {
        if (this.gridOptionsService.is('suppressAggFuncInHeader')) {
            return headerName;
        }
        // only columns with aggregation active can have aggregations
        var pivotValueColumn = column.getColDef().pivotValueColumn;
        var pivotActiveOnThisColumn = generic_1.exists(pivotValueColumn);
        var aggFunc = null;
        var aggFuncFound;
        // otherwise we have a measure that is active, and we are doing aggregation on it
        if (pivotActiveOnThisColumn) {
            var isCollapsedHeaderEnabled = this.gridOptionsService.is('removePivotHeaderRowWhenSingleValueColumn') && this.valueColumns.length === 1;
            var isTotalColumn = column.getColDef().pivotTotalColumnIds !== undefined;
            if (isCollapsedHeaderEnabled && !isTotalColumn) {
                return headerName; // Skip decorating the header - in this case the label is the pivot key, not the value col
            }
            aggFunc = pivotValueColumn ? pivotValueColumn.getAggFunc() : null;
            aggFuncFound = true;
        }
        else {
            var measureActive = column.isValueActive();
            var aggregationPresent = this.pivotMode || !this.isRowGroupEmpty();
            if (measureActive && aggregationPresent) {
                aggFunc = column.getAggFunc();
                aggFuncFound = true;
            }
            else {
                aggFuncFound = false;
            }
        }
        if (aggFuncFound) {
            var aggFuncString = (typeof aggFunc === 'string') ? aggFunc : 'func';
            var localeTextFunc = this.localeService.getLocaleTextFunc();
            var aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);
            return aggFuncStringTranslated + "(" + headerName + ")";
        }
        return headerName;
    };
    // returns the group with matching colId and instanceId. If instanceId is missing,
    // matches only on the colId.
    ColumnModel.prototype.getColumnGroup = function (colId, partId) {
        if (!colId) {
            return null;
        }
        if (colId instanceof columnGroup_1.ColumnGroup) {
            return colId;
        }
        var allColumnGroups = this.getAllDisplayedTrees();
        var checkPartId = typeof partId === 'number';
        var result = null;
        this.columnUtils.depthFirstAllColumnTreeSearch(allColumnGroups, function (child) {
            if (child instanceof columnGroup_1.ColumnGroup) {
                var columnGroup = child;
                var matched = void 0;
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
    };
    ColumnModel.prototype.isReady = function () {
        return this.ready;
    };
    ColumnModel.prototype.extractValueColumns = function (source, oldPrimaryColumns) {
        this.valueColumns = this.extractColumns(oldPrimaryColumns, this.valueColumns, function (col, flag) { return col.setValueActive(flag, source); }, 
        // aggFunc doesn't have index variant, cos order of value cols doesn't matter, so always return null
        function () { return undefined; }, function () { return undefined; }, 
        // aggFunc is a string, so return it's existence
        function (colDef) {
            var aggFunc = colDef.aggFunc;
            // null or empty string means clear
            if (aggFunc === null || aggFunc === '') {
                return null;
            }
            if (aggFunc === undefined) {
                return;
            }
            return !!aggFunc;
        }, function (colDef) {
            // return false if any of the following: null, undefined, empty string
            return colDef.initialAggFunc != null && colDef.initialAggFunc != '';
        });
        // all new columns added will have aggFunc missing, so set it to what is in the colDef
        this.valueColumns.forEach(function (col) {
            var colDef = col.getColDef();
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
    };
    ColumnModel.prototype.extractRowGroupColumns = function (source, oldPrimaryColumns) {
        this.rowGroupColumns = this.extractColumns(oldPrimaryColumns, this.rowGroupColumns, function (col, flag) { return col.setRowGroupActive(flag, source); }, function (colDef) { return colDef.rowGroupIndex; }, function (colDef) { return colDef.initialRowGroupIndex; }, function (colDef) { return colDef.rowGroup; }, function (colDef) { return colDef.initialRowGroup; });
    };
    ColumnModel.prototype.extractColumns = function (oldPrimaryColumns, previousCols, setFlagFunc, getIndexFunc, getInitialIndexFunc, getValueFunc, getInitialValueFunc) {
        if (oldPrimaryColumns === void 0) { oldPrimaryColumns = []; }
        if (previousCols === void 0) { previousCols = []; }
        var colsWithIndex = [];
        var colsWithValue = [];
        // go though all cols.
        // if value, change
        // if default only, change only if new
        (this.primaryColumns || []).forEach(function (col) {
            var colIsNew = oldPrimaryColumns.indexOf(col) < 0;
            var colDef = col.getColDef();
            var value = generic_1.attrToBoolean(getValueFunc(colDef));
            var initialValue = generic_1.attrToBoolean(getInitialValueFunc(colDef));
            var index = generic_1.attrToNumber(getIndexFunc(colDef));
            var initialIndex = generic_1.attrToNumber(getInitialIndexFunc(colDef));
            var include;
            var valuePresent = value !== undefined;
            var indexPresent = index !== undefined;
            var initialValuePresent = initialValue !== undefined;
            var initialIndexPresent = initialIndex !== undefined;
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
                var useIndex = colIsNew ? (index != null || initialIndex != null) : index != null;
                useIndex ? colsWithIndex.push(col) : colsWithValue.push(col);
            }
        });
        var getIndexForCol = function (col) {
            var index = getIndexFunc(col.getColDef());
            var defaultIndex = getInitialIndexFunc(col.getColDef());
            return index != null ? index : defaultIndex;
        };
        // sort cols with index, and add these first
        colsWithIndex.sort(function (colA, colB) {
            var indexA = getIndexForCol(colA);
            var indexB = getIndexForCol(colB);
            if (indexA === indexB) {
                return 0;
            }
            if (indexA < indexB) {
                return -1;
            }
            return 1;
        });
        var res = [].concat(colsWithIndex);
        // second add columns that were there before and in the same order as they were before,
        // so we are preserving order of current grouping of columns that simply have rowGroup=true
        previousCols.forEach(function (col) {
            if (colsWithValue.indexOf(col) >= 0) {
                res.push(col);
            }
        });
        // lastly put in all remaining cols
        colsWithValue.forEach(function (col) {
            if (res.indexOf(col) < 0) {
                res.push(col);
            }
        });
        // set flag=false for removed cols
        previousCols.forEach(function (col) {
            if (res.indexOf(col) < 0) {
                setFlagFunc(col, false);
            }
        });
        // set flag=true for newly added cols
        res.forEach(function (col) {
            if (previousCols.indexOf(col) < 0) {
                setFlagFunc(col, true);
            }
        });
        return res;
    };
    ColumnModel.prototype.extractPivotColumns = function (source, oldPrimaryColumns) {
        this.pivotColumns = this.extractColumns(oldPrimaryColumns, this.pivotColumns, function (col, flag) { return col.setPivotActive(flag, source); }, function (colDef) { return colDef.pivotIndex; }, function (colDef) { return colDef.initialPivotIndex; }, function (colDef) { return colDef.pivot; }, function (colDef) { return colDef.initialPivot; });
    };
    ColumnModel.prototype.resetColumnGroupState = function (source) {
        if (source === void 0) { source = "api"; }
        var stateItems = [];
        this.columnUtils.depthFirstOriginalTreeSearch(null, this.primaryColumnTree, function (child) {
            if (child instanceof providedColumnGroup_1.ProvidedColumnGroup) {
                var colGroupDef = child.getColGroupDef();
                var groupState = {
                    groupId: child.getGroupId(),
                    open: !colGroupDef ? undefined : colGroupDef.openByDefault
                };
                stateItems.push(groupState);
            }
        });
        this.setColumnGroupState(stateItems, source);
    };
    ColumnModel.prototype.getColumnGroupState = function () {
        var columnGroupState = [];
        this.columnUtils.depthFirstOriginalTreeSearch(null, this.gridBalancedTree, function (node) {
            if (node instanceof providedColumnGroup_1.ProvidedColumnGroup) {
                columnGroupState.push({
                    groupId: node.getGroupId(),
                    open: node.isExpanded()
                });
            }
        });
        return columnGroupState;
    };
    ColumnModel.prototype.setColumnGroupState = function (stateItems, source) {
        var _this = this;
        if (source === void 0) { source = "api"; }
        this.columnAnimationService.start();
        var impactedGroups = [];
        stateItems.forEach(function (stateItem) {
            var groupKey = stateItem.groupId;
            var newValue = stateItem.open;
            var providedColumnGroup = _this.getProvidedColumnGroup(groupKey);
            if (!providedColumnGroup) {
                return;
            }
            if (providedColumnGroup.isExpanded() === newValue) {
                return;
            }
            _this.logger.log('columnGroupOpened(' + providedColumnGroup.getGroupId() + ',' + newValue + ')');
            providedColumnGroup.setExpanded(newValue);
            impactedGroups.push(providedColumnGroup);
        });
        this.updateGroupsAndDisplayedColumns(source);
        this.setFirstRightAndLastLeftPinned(source);
        impactedGroups.forEach(function (providedColumnGroup) {
            var event = {
                type: events_1.Events.EVENT_COLUMN_GROUP_OPENED,
                columnGroup: providedColumnGroup
            };
            _this.eventService.dispatchEvent(event);
        });
        this.columnAnimationService.finish();
    };
    // called by headerRenderer - when a header is opened or closed
    ColumnModel.prototype.setColumnGroupOpened = function (key, newValue, source) {
        if (source === void 0) { source = "api"; }
        var keyAsString;
        if (key instanceof providedColumnGroup_1.ProvidedColumnGroup) {
            keyAsString = key.getId();
        }
        else {
            keyAsString = key || '';
        }
        this.setColumnGroupState([{ groupId: keyAsString, open: newValue }], source);
    };
    ColumnModel.prototype.getProvidedColumnGroup = function (key) {
        // if (key instanceof ProvidedColumnGroup) { return key; }
        if (typeof key !== 'string') {
            console.error('AG Grid: group key must be a string');
        }
        // otherwise, search for the column group by id
        var res = null;
        this.columnUtils.depthFirstOriginalTreeSearch(null, this.gridBalancedTree, function (node) {
            if (node instanceof providedColumnGroup_1.ProvidedColumnGroup) {
                if (node.getId() === key) {
                    res = node;
                }
            }
        });
        return res;
    };
    ColumnModel.prototype.calculateColumnsForDisplay = function () {
        var _this = this;
        var columnsForDisplay;
        if (this.pivotMode && generic_1.missing(this.secondaryColumns)) {
            // pivot mode is on, but we are not pivoting, so we only
            // show columns we are aggregating on
            columnsForDisplay = this.gridColumns.filter(function (column) {
                var isAutoGroupCol = _this.groupAutoColumns && array_1.includes(_this.groupAutoColumns, column);
                var isValueCol = _this.valueColumns && array_1.includes(_this.valueColumns, column);
                return isAutoGroupCol || isValueCol;
            });
        }
        else {
            // otherwise continue as normal. this can be working on the primary
            // or secondary columns, whatever the gridColumns are set to
            columnsForDisplay = this.gridColumns.filter(function (column) {
                // keep col if a) it's auto-group or b) it's visible
                var isAutoGroupCol = _this.groupAutoColumns && array_1.includes(_this.groupAutoColumns, column);
                return isAutoGroupCol || column.isVisible();
            });
        }
        return columnsForDisplay;
    };
    ColumnModel.prototype.checkColSpanActiveInCols = function (columns) {
        var result = false;
        columns.forEach(function (col) {
            if (generic_1.exists(col.getColDef().colSpan)) {
                result = true;
            }
        });
        return result;
    };
    ColumnModel.prototype.calculateColumnsForGroupDisplay = function () {
        var _this = this;
        this.groupDisplayColumns = [];
        this.groupDisplayColumnsMap = {};
        var checkFunc = function (col) {
            var colDef = col.getColDef();
            var underlyingColumn = colDef.showRowGroup;
            if (colDef && generic_1.exists(underlyingColumn)) {
                _this.groupDisplayColumns.push(col);
                if (typeof underlyingColumn === 'string') {
                    _this.groupDisplayColumnsMap[underlyingColumn] = col;
                }
                else if (underlyingColumn === true) {
                    _this.getRowGroupColumns().forEach(function (rowGroupCol) {
                        _this.groupDisplayColumnsMap[rowGroupCol.getId()] = col;
                    });
                }
            }
        };
        this.gridColumns.forEach(checkFunc);
        if (this.groupAutoColumns) {
            this.groupAutoColumns.forEach(checkFunc);
        }
    };
    ColumnModel.prototype.getGroupDisplayColumns = function () {
        return this.groupDisplayColumns;
    };
    ColumnModel.prototype.getGroupDisplayColumnForGroup = function (rowGroupColumnId) {
        return this.groupDisplayColumnsMap[rowGroupColumnId];
    };
    ColumnModel.prototype.updateDisplayedColumns = function (source) {
        var columnsForDisplay = this.calculateColumnsForDisplay();
        this.buildDisplayedTrees(columnsForDisplay);
        this.calculateColumnsForGroupDisplay();
        // also called when group opened/closed
        this.updateGroupsAndDisplayedColumns(source);
        // also called when group opened/closed
        this.setFirstRightAndLastLeftPinned(source);
    };
    ColumnModel.prototype.isSecondaryColumnsPresent = function () {
        return generic_1.exists(this.secondaryColumns);
    };
    ColumnModel.prototype.setSecondaryColumns = function (colDefs, source) {
        var _this = this;
        if (source === void 0) { source = "api"; }
        var newColsPresent = colDefs && colDefs.length > 0;
        // if not cols passed, and we had no cols anyway, then do nothing
        if (!newColsPresent && generic_1.missing(this.secondaryColumns)) {
            return;
        }
        if (newColsPresent) {
            this.processSecondaryColumnDefinitions(colDefs);
            var balancedTreeResult = this.columnFactory.createColumnTree(colDefs, false, this.secondaryBalancedTree || this.previousSecondaryColumns || undefined);
            this.destroyOldColumns(this.secondaryBalancedTree, balancedTreeResult.columnTree);
            this.secondaryBalancedTree = balancedTreeResult.columnTree;
            this.secondaryHeaderRowCount = balancedTreeResult.treeDept + 1;
            this.secondaryColumns = this.getColumnsFromTree(this.secondaryBalancedTree);
            this.secondaryColumnsMap = {};
            this.secondaryColumns.forEach(function (col) { return _this.secondaryColumnsMap[col.getId()] = col; });
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
    };
    ColumnModel.prototype.processSecondaryColumnDefinitions = function (colDefs) {
        var columnCallback = this.gridOptionsService.get('processPivotResultColDef') || this.gridOptionsService.get('processSecondaryColDef');
        var groupCallback = this.gridOptionsService.get('processPivotResultColGroupDef') || this.gridOptionsService.get('processSecondaryColGroupDef');
        if (!columnCallback && !groupCallback) {
            return undefined;
        }
        var searchForColDefs = function (colDefs2) {
            colDefs2.forEach(function (abstractColDef) {
                var isGroup = generic_1.exists(abstractColDef.children);
                if (isGroup) {
                    var colGroupDef = abstractColDef;
                    if (groupCallback) {
                        groupCallback(colGroupDef);
                    }
                    searchForColDefs(colGroupDef.children);
                }
                else {
                    var colDef = abstractColDef;
                    if (columnCallback) {
                        columnCallback(colDef);
                    }
                }
            });
        };
        if (colDefs) {
            searchForColDefs(colDefs);
        }
    };
    // called from: applyColumnState, setColumnDefs, setSecondaryColumns
    ColumnModel.prototype.updateGridColumns = function () {
        var _this = this;
        var prevGridCols = this.gridBalancedTree;
        if (this.gridColsArePrimary) {
            this.lastPrimaryOrder = this.gridColumns;
        }
        else {
            this.lastSecondaryOrder = this.gridColumns;
        }
        var sortOrderToRecover = undefined;
        if (this.secondaryColumns && this.secondaryBalancedTree) {
            var hasSameColumns = this.secondaryColumns.every(function (col) {
                return _this.gridColumnsMap[col.getColId()] !== undefined;
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
        var areAutoColsChanged = this.createGroupAutoColumnsIfNeeded();
        // if auto group cols have changed, and we have a sort order, we need to move auto cols to the start
        if (areAutoColsChanged && sortOrderToRecover) {
            var groupAutoColsMap_1 = map_1.convertToMap(this.groupAutoColumns.map(function (col) { return [col, true]; }));
            // if group columns has changed, we don't preserve the group column order, so remove them from the old order
            sortOrderToRecover = sortOrderToRecover.filter(function (col) { return !groupAutoColsMap_1.has(col); });
            // and add them to the start of the order
            sortOrderToRecover = __spread(this.groupAutoColumns, sortOrderToRecover);
        }
        this.addAutoGroupToGridColumns();
        this.orderGridColsLike(sortOrderToRecover);
        this.gridColumns = this.placeLockedColumns(this.gridColumns);
        this.refreshQuickFilterColumns();
        this.clearDisplayedAndViewportColumns();
        this.colSpanActive = this.checkColSpanActiveInCols(this.gridColumns);
        this.gridColumnsMap = {};
        this.gridColumns.forEach(function (col) { return _this.gridColumnsMap[col.getId()] = col; });
        this.setAutoHeightActive();
        if (!array_1.areEqual(prevGridCols, this.gridBalancedTree)) {
            var event_4 = {
                type: events_1.Events.EVENT_GRID_COLUMNS_CHANGED
            };
            this.eventService.dispatchEvent(event_4);
        }
    };
    ColumnModel.prototype.setAutoHeightActive = function () {
        this.autoHeightActive = this.gridColumns.filter(function (col) { return col.isAutoHeight(); }).length > 0;
        if (this.autoHeightActive) {
            this.autoHeightActiveAtLeastOnce = true;
            var rowModelType = this.rowModel.getType();
            var supportedRowModel = rowModelType === 'clientSide' || rowModelType === 'serverSide';
            if (!supportedRowModel) {
                var message_1 = 'AG Grid - autoHeight columns only work with Client Side Row Model and Server Side Row Model.';
                function_1.doOnce(function () { return console.warn(message_1); }, 'autoHeightActive.wrongRowModel');
            }
        }
    };
    ColumnModel.prototype.orderGridColsLike = function (colsOrder) {
        if (generic_1.missing(colsOrder)) {
            return;
        }
        var lastOrderMapped = map_1.convertToMap(colsOrder.map(function (col, index) { return [col, index]; }));
        // only do the sort if at least one column is accounted for. columns will be not accounted for
        // if changing from secondary to primary columns
        var noColsFound = true;
        this.gridColumns.forEach(function (col) {
            if (lastOrderMapped.has(col)) {
                noColsFound = false;
            }
        });
        if (noColsFound) {
            return;
        }
        // order cols in the same order as before. we need to make sure that all
        // cols still exists, so filter out any that no longer exist.
        var gridColsMap = map_1.convertToMap(this.gridColumns.map(function (col) { return [col, true]; }));
        var oldColsOrdered = colsOrder.filter(function (col) { return gridColsMap.has(col); });
        var oldColsMap = map_1.convertToMap(oldColsOrdered.map(function (col) { return [col, true]; }));
        var newColsOrdered = this.gridColumns.filter(function (col) { return !oldColsMap.has(col); });
        // add in the new columns, at the end (if no group), or at the end of the group (if a group)
        var newGridColumns = oldColsOrdered.slice();
        newColsOrdered.forEach(function (newCol) {
            var parent = newCol.getOriginalParent();
            // if no parent, means we are not grouping, so just add the column to the end
            if (!parent) {
                newGridColumns.push(newCol);
                return;
            }
            // find the group the column belongs to. if no siblings at the current level (eg col in group on it's
            // own) then go up one level and look for siblings there.
            var siblings = [];
            while (!siblings.length && parent) {
                var leafCols = parent.getLeafColumns();
                leafCols.forEach(function (leafCol) {
                    var presentInNewGriColumns = newGridColumns.indexOf(leafCol) >= 0;
                    var noYetInSiblings = siblings.indexOf(leafCol) < 0;
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
            var indexes = siblings.map(function (col) { return newGridColumns.indexOf(col); });
            var lastIndex = Math.max.apply(Math, __spread(indexes));
            array_1.insertIntoArray(newGridColumns, newCol, lastIndex + 1);
        });
        this.gridColumns = newGridColumns;
    };
    ColumnModel.prototype.isPrimaryColumnGroupsPresent = function () {
        return this.primaryHeaderRowCount > 1;
    };
    // if we are using autoGroupCols, then they should be included for quick filter. this covers the
    // following scenarios:
    // a) user provides 'field' into autoGroupCol of normal grid, so now because a valid col to filter leafs on
    // b) using tree data and user depends on autoGroupCol for first col, and we also want to filter on this
    //    (tree data is a bit different, as parent rows can be filtered on, unlike row grouping)
    ColumnModel.prototype.refreshQuickFilterColumns = function () {
        var _a;
        var columnsForQuickFilter;
        if (this.groupAutoColumns) {
            columnsForQuickFilter = ((_a = this.primaryColumns) !== null && _a !== void 0 ? _a : []).concat(this.groupAutoColumns);
        }
        else if (this.primaryColumns) {
            columnsForQuickFilter = this.primaryColumns;
        }
        columnsForQuickFilter = columnsForQuickFilter !== null && columnsForQuickFilter !== void 0 ? columnsForQuickFilter : [];
        this.columnsForQuickFilter = this.gridOptionsService.is('excludeHiddenColumnsFromQuickFilter')
            ? columnsForQuickFilter.filter(function (col) { return col.isVisible(); })
            : columnsForQuickFilter;
    };
    ColumnModel.prototype.placeLockedColumns = function (cols) {
        var left = [];
        var normal = [];
        var right = [];
        cols.forEach(function (col) {
            var position = col.getColDef().lockPosition;
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
        return __spread(left, normal, right);
    };
    ColumnModel.prototype.addAutoGroupToGridColumns = function () {
        if (generic_1.missing(this.groupAutoColumns)) {
            this.destroyOldColumns(this.groupAutoColsBalancedTree);
            this.groupAutoColsBalancedTree = null;
            return;
        }
        this.gridColumns = this.groupAutoColumns ? this.groupAutoColumns.concat(this.gridColumns) : this.gridColumns;
        var newAutoColsTree = this.columnFactory.createForAutoGroups(this.groupAutoColumns, this.gridBalancedTree);
        this.destroyOldColumns(this.groupAutoColsBalancedTree, newAutoColsTree);
        this.groupAutoColsBalancedTree = newAutoColsTree;
        this.gridBalancedTree = newAutoColsTree.concat(this.gridBalancedTree);
    };
    // gets called after we copy down grid columns, to make sure any part of the gui
    // that tries to draw, eg the header, it will get empty lists of columns rather
    // than stale columns. for example, the header will received gridColumnsChanged
    // event, so will try and draw, but it will draw successfully when it acts on the
    // virtualColumnsChanged event
    ColumnModel.prototype.clearDisplayedAndViewportColumns = function () {
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
    };
    ColumnModel.prototype.updateGroupsAndDisplayedColumns = function (source) {
        this.updateOpenClosedVisibilityInColumnGroups();
        this.deriveDisplayedColumns(source);
        this.refreshFlexedColumns();
        this.extractViewport();
        this.updateBodyWidths();
        // this event is picked up by the gui, headerRenderer and rowRenderer, to recalculate what columns to display
        var event = {
            type: events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnModel.prototype.deriveDisplayedColumns = function (source) {
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeLeft, this.displayedColumnsLeft);
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeCentre, this.displayedColumnsCenter);
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeRight, this.displayedColumnsRight);
        this.joinDisplayedColumns();
        this.setLeftValues(source);
        this.displayedAutoHeightCols = this.displayedColumns.filter(function (col) { return col.isAutoHeight(); });
    };
    ColumnModel.prototype.isAutoRowHeightActive = function () {
        return this.autoHeightActive;
    };
    ColumnModel.prototype.wasAutoRowHeightEverActive = function () {
        return this.autoHeightActiveAtLeastOnce;
    };
    ColumnModel.prototype.joinDisplayedColumns = function () {
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
    };
    // sets the left pixel position of each column
    ColumnModel.prototype.setLeftValues = function (source) {
        this.setLeftValuesOfColumns(source);
        this.setLeftValuesOfGroups();
    };
    ColumnModel.prototype.setLeftValuesOfColumns = function (source) {
        var _this = this;
        if (!this.primaryColumns) {
            return;
        }
        // go through each list of displayed columns
        var allColumns = this.primaryColumns.slice(0);
        // let totalColumnWidth = this.getWidthOfColsInList()
        var doingRtl = this.gridOptionsService.is('enableRtl');
        [
            this.displayedColumnsLeft,
            this.displayedColumnsRight,
            this.displayedColumnsCenter
        ].forEach(function (columns) {
            if (doingRtl) {
                // when doing RTL, we start at the top most pixel (ie RHS) and work backwards
                var left_1 = _this.getWidthOfColsInList(columns);
                columns.forEach(function (column) {
                    left_1 -= column.getActualWidth();
                    column.setLeft(left_1, source);
                });
            }
            else {
                // otherwise normal LTR, we start at zero
                var left_2 = 0;
                columns.forEach(function (column) {
                    column.setLeft(left_2, source);
                    left_2 += column.getActualWidth();
                });
            }
            array_1.removeAllFromArray(allColumns, columns);
        });
        // items left in allColumns are columns not displayed, so remove the left position. this is
        // important for the rows, as if a col is made visible, then taken out, then made visible again,
        // we don't want the animation of the cell floating in from the old position, whatever that was.
        allColumns.forEach(function (column) {
            column.setLeft(null, source);
        });
    };
    ColumnModel.prototype.setLeftValuesOfGroups = function () {
        // a groups left value is the lest left value of it's children
        [
            this.displayedTreeLeft,
            this.displayedTreeRight,
            this.displayedTreeCentre
        ].forEach(function (columns) {
            columns.forEach(function (column) {
                if (column instanceof columnGroup_1.ColumnGroup) {
                    var columnGroup = column;
                    columnGroup.checkLeft();
                }
            });
        });
    };
    ColumnModel.prototype.derivedDisplayedColumnsFromDisplayedTree = function (tree, columns) {
        columns.length = 0;
        this.columnUtils.depthFirstDisplayedColumnTreeSearch(tree, function (child) {
            if (child instanceof column_1.Column) {
                columns.push(child);
            }
        });
    };
    ColumnModel.prototype.extractViewportColumns = function () {
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
    };
    ColumnModel.prototype.getVirtualHeaderGroupRow = function (type, dept) {
        var result;
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
    };
    ColumnModel.prototype.calculateHeaderRows = function () {
        // go through each group, see if any of it's cols are displayed, and if yes,
        // then this group is included
        this.viewportRowLeft = {};
        this.viewportRowRight = {};
        this.viewportRowCenter = {};
        // for easy lookup when building the groups.
        var virtualColIds = {};
        this.headerViewportColumns.forEach(function (col) { return virtualColIds[col.getId()] = true; });
        var testGroup = function (children, result, dept) {
            var returnValue = false;
            for (var i = 0; i < children.length; i++) {
                // see if this item is within viewport
                var child = children[i];
                var addThisItem = false;
                if (child instanceof column_1.Column) {
                    // for column, test if column is included
                    addThisItem = virtualColIds[child.getId()] === true;
                }
                else {
                    // if group, base decision on children
                    var columnGroup = child;
                    var displayedChildren = columnGroup.getDisplayedChildren();
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
    };
    ColumnModel.prototype.extractViewport = function () {
        var hashColumn = function (c) { return c.getId() + "-" + (c.getPinned() || 'normal'); };
        this.extractViewportColumns();
        var newHash = this.viewportColumns.map(hashColumn).join('#');
        var changed = this.viewportColumnsHash !== newHash;
        if (changed) {
            this.viewportColumnsHash = newHash;
            this.calculateHeaderRows();
        }
        return changed;
    };
    ColumnModel.prototype.refreshFlexedColumns = function (params) {
        var _this = this;
        if (params === void 0) { params = {}; }
        var source = params.source ? params.source : 'flex';
        if (params.viewportWidth != null) {
            this.flexViewportWidth = params.viewportWidth;
        }
        if (!this.flexViewportWidth) {
            return [];
        }
        // If the grid has left-over space, divide it between flexing columns in proportion to their flex value.
        // A "flexing column" is one that has a 'flex' value set and is not currently being constrained by its
        // minWidth or maxWidth rules.
        var flexAfterDisplayIndex = -1;
        if (params.resizingCols) {
            params.resizingCols.forEach(function (col) {
                var indexOfCol = _this.displayedColumnsCenter.indexOf(col);
                if (flexAfterDisplayIndex < indexOfCol) {
                    flexAfterDisplayIndex = indexOfCol;
                }
            });
        }
        var isColFlex = function (col) {
            var afterResizingCols = _this.displayedColumnsCenter.indexOf(col) > flexAfterDisplayIndex;
            return col.getFlex() && afterResizingCols;
        };
        var knownWidthColumns = this.displayedColumnsCenter.filter(function (col) { return !isColFlex(col); });
        var flexingColumns = this.displayedColumnsCenter.filter(function (col) { return isColFlex(col); });
        var changedColumns = [];
        if (!flexingColumns.length) {
            return [];
        }
        var flexingColumnSizes = [];
        var spaceForFlexingColumns;
        outer: while (true) {
            var totalFlex = flexingColumns.reduce(function (count, col) { return count + col.getFlex(); }, 0);
            spaceForFlexingColumns = this.flexViewportWidth - this.getWidthOfColsInList(knownWidthColumns);
            for (var i = 0; i < flexingColumns.length; i++) {
                var col = flexingColumns[i];
                var widthByFlexRule = spaceForFlexingColumns * col.getFlex() / totalFlex;
                var constrainedWidth = 0;
                var minWidth = col.getMinWidth();
                var maxWidth = col.getMaxWidth();
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
        var remainingSpace = spaceForFlexingColumns;
        flexingColumns.forEach(function (col, i) {
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
    };
    // called from api
    ColumnModel.prototype.sizeColumnsToFit = function (gridWidth, source, silent, params) {
        var _a, _b, _c, _d, _e;
        if (source === void 0) { source = "sizeColumnsToFit"; }
        var limitsMap = {};
        if (params) {
            (_a = params === null || params === void 0 ? void 0 : params.columnLimits) === null || _a === void 0 ? void 0 : _a.forEach(function (_a) {
                var key = _a.key, dimensions = __rest(_a, ["key"]);
                limitsMap[typeof key === 'string' ? key : key.getColId()] = dimensions;
            });
        }
        // avoid divide by zero
        var allDisplayedColumns = this.getAllDisplayedColumns();
        var doColumnsAlreadyFit = gridWidth === this.getWidthOfColsInList(allDisplayedColumns);
        if (gridWidth <= 0 || !allDisplayedColumns.length || doColumnsAlreadyFit) {
            return;
        }
        var colsToSpread = [];
        var colsToNotSpread = [];
        allDisplayedColumns.forEach(function (column) {
            if (column.getColDef().suppressSizeToFit === true) {
                colsToNotSpread.push(column);
            }
            else {
                colsToSpread.push(column);
            }
        });
        // make a copy of the cols that are going to be resized
        var colsToDispatchEventFor = colsToSpread.slice(0);
        var finishedResizing = false;
        var moveToNotSpread = function (column) {
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
        colsToSpread.forEach(function (column) { return column.resetActualWidth(source); });
        while (!finishedResizing) {
            finishedResizing = true;
            var availablePixels = gridWidth - this.getWidthOfColsInList(colsToNotSpread);
            if (availablePixels <= 0) {
                // no width, set everything to minimum
                colsToSpread.forEach(function (column) {
                    var _a, _b;
                    var widthOverride = (_b = (_a = limitsMap === null || limitsMap === void 0 ? void 0 : limitsMap[column.getId()]) === null || _a === void 0 ? void 0 : _a.minWidth) !== null && _b !== void 0 ? _b : params === null || params === void 0 ? void 0 : params.defaultMinWidth;
                    if (typeof widthOverride === 'number') {
                        column.setActualWidth(widthOverride);
                        return;
                    }
                    column.setMinimum(source);
                });
            }
            else {
                var scale = availablePixels / this.getWidthOfColsInList(colsToSpread);
                // we set the pixels for the last col based on what's left, as otherwise
                // we could be a pixel or two short or extra because of rounding errors.
                var pixelsForLastCol = availablePixels;
                // backwards through loop, as we are removing items as we go
                for (var i = colsToSpread.length - 1; i >= 0; i--) {
                    var column = colsToSpread[i];
                    var widthOverride = limitsMap === null || limitsMap === void 0 ? void 0 : limitsMap[column.getId()];
                    var minOverride = ((_b = widthOverride === null || widthOverride === void 0 ? void 0 : widthOverride.minWidth) !== null && _b !== void 0 ? _b : params === null || params === void 0 ? void 0 : params.defaultMinWidth);
                    var maxOverride = ((_c = widthOverride === null || widthOverride === void 0 ? void 0 : widthOverride.maxWidth) !== null && _c !== void 0 ? _c : params === null || params === void 0 ? void 0 : params.defaultMaxWidth);
                    var colMinWidth = (_d = column.getMinWidth()) !== null && _d !== void 0 ? _d : 0;
                    var colMaxWidth = (_e = column.getMaxWidth()) !== null && _e !== void 0 ? _e : Number.MAX_VALUE;
                    var minWidth = typeof minOverride === 'number' && minOverride > colMinWidth ? minOverride : column.getMinWidth();
                    var maxWidth = typeof maxOverride === 'number' && maxOverride < colMaxWidth ? maxOverride : column.getMaxWidth();
                    var newWidth = Math.round(column.getActualWidth() * scale);
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
        colsToDispatchEventFor.forEach(function (col) {
            col.fireColumnWidthChangedEvent(source);
        });
        this.setLeftValues(source);
        this.updateBodyWidths();
        if (silent) {
            return;
        }
        this.dispatchColumnResizedEvent(colsToDispatchEventFor, true, source);
    };
    ColumnModel.prototype.buildDisplayedTrees = function (visibleColumns) {
        var leftVisibleColumns = [];
        var rightVisibleColumns = [];
        var centerVisibleColumns = [];
        visibleColumns.forEach(function (column) {
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
        var groupInstanceIdCreator = new groupInstanceIdCreator_1.GroupInstanceIdCreator();
        this.displayedTreeLeft = this.displayedGroupCreator.createDisplayedGroups(leftVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, 'left', this.displayedTreeLeft);
        this.displayedTreeRight = this.displayedGroupCreator.createDisplayedGroups(rightVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, 'right', this.displayedTreeRight);
        this.displayedTreeCentre = this.displayedGroupCreator.createDisplayedGroups(centerVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, null, this.displayedTreeCentre);
        this.updateDisplayedMap();
    };
    ColumnModel.prototype.updateDisplayedMap = function () {
        var _this = this;
        this.displayedColumnsAndGroupsMap = {};
        var func = function (child) {
            _this.displayedColumnsAndGroupsMap[child.getUniqueId()] = child;
        };
        this.columnUtils.depthFirstAllColumnTreeSearch(this.displayedTreeCentre, func);
        this.columnUtils.depthFirstAllColumnTreeSearch(this.displayedTreeLeft, func);
        this.columnUtils.depthFirstAllColumnTreeSearch(this.displayedTreeRight, func);
    };
    ColumnModel.prototype.isDisplayed = function (item) {
        var fromMap = this.displayedColumnsAndGroupsMap[item.getUniqueId()];
        // check for reference, in case new column / group with same id is now present
        return fromMap === item;
    };
    ColumnModel.prototype.updateOpenClosedVisibilityInColumnGroups = function () {
        var allColumnGroups = this.getAllDisplayedTrees();
        this.columnUtils.depthFirstAllColumnTreeSearch(allColumnGroups, function (child) {
            if (child instanceof columnGroup_1.ColumnGroup) {
                var columnGroup = child;
                columnGroup.calculateDisplayedColumns();
            }
        });
    };
    ColumnModel.prototype.getGroupAutoColumns = function () {
        return this.groupAutoColumns;
    };
    /**
     * Creates new auto group columns if required
     * @returns whether auto cols have changed
     */
    ColumnModel.prototype.createGroupAutoColumnsIfNeeded = function () {
        if (!this.autoGroupsNeedBuilding) {
            return false;
        }
        this.autoGroupsNeedBuilding = false;
        var groupFullWidthRow = this.gridOptionsService.isGroupUseEntireRow(this.pivotMode);
        // we need to allow suppressing auto-column separately for group and pivot as the normal situation
        // is CSRM and user provides group column themselves for normal view, but when they go into pivot the
        // columns are generated by the grid so no opportunity for user to provide group column. so need a way
        // to suppress auto-col for grouping only, and not pivot.
        // however if using Viewport RM or SSRM and user is providing the columns, the user may wish full control
        // of the group column in this instance.
        var suppressAutoColumn = this.pivotMode ?
            this.gridOptionsService.is('pivotSuppressAutoColumn') : this.isGroupSuppressAutoColumn();
        var groupingActive = this.rowGroupColumns.length > 0 || this.usingTreeData;
        var needAutoColumns = groupingActive && !suppressAutoColumn && !groupFullWidthRow;
        if (needAutoColumns) {
            var existingCols = this.groupAutoColumns || [];
            var newAutoGroupCols = this.autoGroupColService.createAutoGroupColumns(existingCols, this.rowGroupColumns);
            var autoColsDifferent = !this.autoColsEqual(newAutoGroupCols, this.groupAutoColumns);
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
    };
    ColumnModel.prototype.isGroupSuppressAutoColumn = function () {
        var groupDisplayType = this.gridOptionsService.get('groupDisplayType');
        var isCustomRowGroups = groupDisplayType ? gridOptionsValidator_1.matchesGroupDisplayType('custom', groupDisplayType) : false;
        if (isCustomRowGroups) {
            return true;
        }
        var treeDataDisplayType = this.gridOptionsService.get('treeDataDisplayType');
        return treeDataDisplayType ? gridOptionsValidator_1.matchesTreeDataDisplayType('custom', treeDataDisplayType) : false;
    };
    ColumnModel.prototype.autoColsEqual = function (colsA, colsB) {
        return array_1.areEqual(colsA, colsB, function (a, b) { return a.getColId() === b.getColId(); });
    };
    ColumnModel.prototype.getWidthOfColsInList = function (columnList) {
        return columnList.reduce(function (width, col) { return width + col.getActualWidth(); }, 0);
    };
    ColumnModel.prototype.getGridBalancedTree = function () {
        return this.gridBalancedTree;
    };
    ColumnModel.prototype.hasFloatingFilters = function () {
        if (!this.gridColumns) {
            return false;
        }
        var res = this.gridColumns.some(function (col) { return col.getColDef().floatingFilter; });
        return res;
    };
    ColumnModel.prototype.getFirstDisplayedColumn = function () {
        var isRtl = this.gridOptionsService.is('enableRtl');
        var queryOrder = [
            'getDisplayedLeftColumns',
            'getDisplayedCenterColumns',
            'getDisplayedRightColumns'
        ];
        if (isRtl) {
            queryOrder.reverse();
        }
        for (var i = 0; i < queryOrder.length; i++) {
            var container = this[queryOrder[i]]();
            if (container.length) {
                return isRtl ? array_1.last(container) : container[0];
            }
        }
        return null;
    };
    ColumnModel.prototype.setColumnHeaderHeight = function (col, height) {
        var changed = col.setAutoHeaderHeight(height);
        if (changed) {
            var event_5 = {
                type: events_1.Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED,
                column: col,
                columns: [col],
                source: 'autosizeColumnHeaderHeight',
            };
            this.eventService.dispatchEvent(event_5);
        }
    };
    ColumnModel.prototype.getColumnGroupHeaderRowHeight = function () {
        if (this.isPivotMode()) {
            return this.getPivotGroupHeaderHeight();
        }
        return this.getGroupHeaderHeight();
    };
    ColumnModel.prototype.getColumnHeaderRowHeight = function () {
        var defaultHeight = (this.isPivotMode() ?
            this.getPivotHeaderHeight() :
            this.getHeaderHeight());
        var displayedHeights = this.getAllDisplayedColumns()
            .filter(function (col) { return col.isAutoHeaderHeight(); })
            .map(function (col) { return col.getAutoHeaderHeight() || 0; });
        return Math.max.apply(Math, __spread([defaultHeight], displayedHeights));
    };
    ColumnModel.prototype.getHeaderHeight = function () {
        var _a;
        return (_a = this.gridOptionsService.getNum('headerHeight')) !== null && _a !== void 0 ? _a : this.environment.getFromTheme(25, 'headerHeight');
    };
    ColumnModel.prototype.getFloatingFiltersHeight = function () {
        var _a;
        return (_a = this.gridOptionsService.getNum('floatingFiltersHeight')) !== null && _a !== void 0 ? _a : this.getHeaderHeight();
    };
    ColumnModel.prototype.getGroupHeaderHeight = function () {
        var _a;
        return (_a = this.gridOptionsService.getNum('groupHeaderHeight')) !== null && _a !== void 0 ? _a : this.getHeaderHeight();
    };
    ColumnModel.prototype.getPivotHeaderHeight = function () {
        var _a;
        return (_a = this.gridOptionsService.getNum('pivotHeaderHeight')) !== null && _a !== void 0 ? _a : this.getHeaderHeight();
    };
    ColumnModel.prototype.getPivotGroupHeaderHeight = function () {
        var _a;
        return (_a = this.gridOptionsService.getNum('pivotGroupHeaderHeight')) !== null && _a !== void 0 ? _a : this.getGroupHeaderHeight();
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
    return ColumnModel;
}(beanStub_1.BeanStub));
exports.ColumnModel = ColumnModel;
