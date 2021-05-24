/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var columnGroup_1 = require("../entities/columnGroup");
var column_1 = require("../entities/column");
var events_1 = require("../events");
var beanStub_1 = require("../context/beanStub");
var originalColumnGroup_1 = require("../entities/originalColumnGroup");
var groupInstanceIdCreator_1 = require("./groupInstanceIdCreator");
var context_1 = require("../context/context");
var constants_1 = require("../constants/constants");
var array_1 = require("../utils/array");
var generic_1 = require("../utils/generic");
var string_1 = require("../utils/string");
var map_1 = require("../utils/map");
var ColumnController = /** @class */ (function (_super) {
    __extends(ColumnController, _super);
    function ColumnController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // header row count, based on user provided columns
        _this.primaryHeaderRowCount = 0;
        _this.secondaryHeaderRowCount = 0;
        _this.secondaryColumnsPresent = false;
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
        // all columns to be rendered in the centre
        _this.viewportColumnsCenter = [];
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
        _this.colDefVersion = 0;
        _this.flexColsCalculatedAtLestOnce = false;
        return _this;
    }
    ColumnController.prototype.init = function () {
        this.suppressColumnVirtualisation = this.gridOptionsWrapper.isSuppressColumnVirtualisation();
        var pivotMode = this.gridOptionsWrapper.isPivotMode();
        if (this.isPivotSettingAllowed(pivotMode)) {
            this.pivotMode = pivotMode;
        }
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        this.addManagedListener(this.gridOptionsWrapper, 'autoGroupColumnDef', this.onAutoGroupColumnDefChanged.bind(this));
    };
    ColumnController.prototype.onAutoGroupColumnDefChanged = function () {
        this.autoGroupsNeedBuilding = true;
        this.forceRecreateAutoGroups = true;
        this.updateGridColumns();
        this.updateDisplayedColumns('gridOptionsChanged');
    };
    ColumnController.prototype.getColDefVersion = function () {
        return this.colDefVersion;
    };
    ColumnController.prototype.setColumnDefs = function (columnDefs, source) {
        var _this = this;
        if (source === void 0) { source = 'api'; }
        var colsPreviouslyExisted = !!this.columnDefs;
        this.colDefVersion++;
        var raiseEventsFunc = this.compareColumnStatesAndRaiseEvents(source);
        this.columnDefs = columnDefs;
        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.
        this.valueCache.expire();
        // NOTE ==================
        // we should be destroying the existing columns and groups if they exist, for example, the original column
        // group adds a listener to the columns, it should be also removing the listeners
        this.autoGroupsNeedBuilding = true;
        var oldPrimaryColumns = this.primaryColumns;
        var oldPrimaryTree = this.primaryColumnTree;
        var balancedTreeResult = this.columnFactory.createColumnTree(columnDefs, true, oldPrimaryTree);
        this.primaryColumnTree = balancedTreeResult.columnTree;
        this.primaryHeaderRowCount = balancedTreeResult.treeDept + 1;
        this.primaryColumns = this.getColumnsFromTree(this.primaryColumnTree);
        this.primaryColumnsMap = {};
        this.primaryColumns.forEach(function (col) { return _this.primaryColumnsMap[col.getId()] = col; });
        this.extractRowGroupColumns(source, oldPrimaryColumns);
        this.extractPivotColumns(source, oldPrimaryColumns);
        this.extractValueColumns(source, oldPrimaryColumns);
        this.ready = true;
        this.updateGridColumns();
        if (colsPreviouslyExisted && this.gridColsArePrimary && this.gridOptionsWrapper.isApplyColumnDefOrder()) {
            this.orderGridColumnsLikePrimary();
        }
        this.updateDisplayedColumns(source);
        this.checkViewportColumns();
        // this event is not used by AG Grid, but left here for backwards compatibility,
        // in case applications use it
        this.dispatchEverythingChanged(source);
        raiseEventsFunc();
        this.dispatchNewColumnsLoaded();
    };
    ColumnController.prototype.dispatchNewColumnsLoaded = function () {
        var newColumnsLoadedEvent = {
            type: events_1.Events.EVENT_NEW_COLUMNS_LOADED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(newColumnsLoadedEvent);
    };
    // this event is legacy, no grid code listens to it. instead the grid listens to New Columns Loaded
    ColumnController.prototype.dispatchEverythingChanged = function (source) {
        if (source === void 0) { source = 'api'; }
        var eventEverythingChanged = {
            type: events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };
        this.eventService.dispatchEvent(eventEverythingChanged);
    };
    ColumnController.prototype.orderGridColumnsLikePrimary = function () {
        var _this = this;
        this.gridColumns.sort(function (colA, colB) {
            var primaryIndexA = _this.primaryColumns.indexOf(colA);
            var primaryIndexB = _this.primaryColumns.indexOf(colB);
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
    };
    ColumnController.prototype.isAutoRowHeightActive = function () {
        return this.autoRowHeightColumns && this.autoRowHeightColumns.length > 0;
    };
    ColumnController.prototype.getAllAutoRowHeightCols = function () {
        return this.autoRowHeightColumns;
    };
    ColumnController.prototype.setViewport = function () {
        if (this.gridOptionsWrapper.isEnableRtl()) {
            this.viewportLeft = this.bodyWidth - this.scrollPosition - this.scrollWidth;
            this.viewportRight = this.bodyWidth - this.scrollPosition;
        }
        else {
            this.viewportLeft = this.scrollPosition;
            this.viewportRight = this.scrollWidth + this.scrollPosition;
        }
    };
    // used by clipboard service, to know what columns to paste into
    ColumnController.prototype.getDisplayedColumnsStartingAt = function (column) {
        var currentColumn = column;
        var columns = [];
        while (currentColumn != null) {
            columns.push(currentColumn);
            currentColumn = this.getDisplayedColAfter(currentColumn);
        }
        return columns;
    };
    // checks what columns are currently displayed due to column virtualisation. fires an event
    // if the list of columns has changed.
    // + setColumnWidth(), setViewportPosition(), setColumnDefs(), sizeColumnsToFit()
    ColumnController.prototype.checkViewportColumns = function () {
        // check displayCenterColumnTree exists first, as it won't exist when grid is initialising
        if (this.displayedColumnsCenter == null) {
            return;
        }
        var hashBefore = this.viewportColumns.map(function (column) { return column.getId(); }).join('#');
        this.extractViewport();
        var hashAfter = this.viewportColumns.map(function (column) { return column.getId(); }).join('#');
        if (hashBefore !== hashAfter) {
            var event_1 = {
                type: events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    ColumnController.prototype.setViewportPosition = function (scrollWidth, scrollPosition) {
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
    ColumnController.prototype.isPivotMode = function () {
        return this.pivotMode;
    };
    ColumnController.prototype.isPivotSettingAllowed = function (pivot) {
        if (pivot && this.gridOptionsWrapper.isTreeData()) {
            console.warn("AG Grid: Pivot mode not available in conjunction Tree Data i.e. 'gridOptions.treeData: true'");
            return false;
        }
        return true;
    };
    ColumnController.prototype.setPivotMode = function (pivotMode, source) {
        if (source === void 0) { source = 'api'; }
        if (pivotMode === this.pivotMode || !this.isPivotSettingAllowed(this.pivotMode)) {
            return;
        }
        this.pivotMode = pivotMode;
        // we need to update grid columns to cover the scenario where user has groupSuppressAutoColumn=true, as
        // this means we don't use auto group column UNLESS we are in pivot mode (it's mandatory in pivot mode),
        // so need to updateGridColumn() to check it autoGroupCol needs to be added / removed
        this.autoGroupsNeedBuilding = true;
        this.updateGridColumns();
        this.updateDisplayedColumns(source);
        var event = {
            type: events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnController.prototype.getSecondaryPivotColumn = function (pivotKeys, valueColKey) {
        if (!this.secondaryColumnsPresent || !this.secondaryColumns) {
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
    ColumnController.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('ColumnController');
    };
    ColumnController.prototype.setFirstRightAndLastLeftPinned = function (source) {
        var lastLeft;
        var firstRight;
        if (this.gridOptionsWrapper.isEnableRtl()) {
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
    ColumnController.prototype.autoSizeColumns = function (keys, skipHeader, source) {
        // because of column virtualisation, we can only do this function on columns that are
        // actually rendered, as non-rendered columns (outside the viewport and not rendered
        // due to column virtualisation) are not present. this can result in all rendered columns
        // getting narrowed, which in turn introduces more rendered columns on the RHS which
        // did not get autosized in the original run, leaving the visible grid with columns on
        // the LHS sized, but RHS no. so we keep looping through the visible columns until
        // no more cols are available (rendered) to be resized
        var _this = this;
        if (source === void 0) { source = "api"; }
        // we autosize after animation frames finish in case any cell renderers need to complete first. this can
        // happen eg if client code is calling api.autoSizeAllColumns() straight after grid is initialised, but grid
        // hasn't fully drawn out all the cells yet (due to cell renderers in animation frames).
        this.animationFrameService.flushAllFrames();
        // keep track of which cols we have resized in here
        var columnsAutosized = [];
        // initialise with anything except 0 so that while loop executes at least once
        var changesThisTimeAround = -1;
        if (skipHeader == null) {
            skipHeader = this.gridOptionsWrapper.isSkipHeaderOnAutoSize();
        }
        while (changesThisTimeAround !== 0) {
            changesThisTimeAround = 0;
            this.actionOnGridColumns(keys, function (column) {
                // if already autosized, skip it
                if (columnsAutosized.indexOf(column) >= 0) {
                    return false;
                }
                // get how wide this col should be
                var preferredWidth = _this.autoWidthCalculator.getPreferredWidthForColumn(column, skipHeader);
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
        this.fireColumnResizedEvent(columnsAutosized, true, 'autosizeColumns');
    };
    ColumnController.prototype.fireColumnResizedEvent = function (columns, finished, source, flexColumns) {
        if (flexColumns === void 0) { flexColumns = null; }
        if (columns && columns.length) {
            var event_2 = {
                type: events_1.Events.EVENT_COLUMN_RESIZED,
                columns: columns,
                column: columns.length === 1 ? columns[0] : null,
                flexColumns: flexColumns,
                finished: finished,
                api: this.gridApi,
                columnApi: this.columnApi,
                source: source
            };
            this.eventService.dispatchEvent(event_2);
        }
    };
    ColumnController.prototype.autoSizeColumn = function (key, skipHeader, source) {
        if (source === void 0) { source = "api"; }
        if (key) {
            this.autoSizeColumns([key], skipHeader, source);
        }
    };
    ColumnController.prototype.autoSizeAllColumns = function (skipHeader, source) {
        if (source === void 0) { source = "api"; }
        var allDisplayedColumns = this.getAllDisplayedColumns();
        this.autoSizeColumns(allDisplayedColumns, skipHeader, source);
    };
    ColumnController.prototype.getColumnsFromTree = function (rootColumns) {
        var result = [];
        var recursiveFindColumns = function (childColumns) {
            for (var i = 0; i < childColumns.length; i++) {
                var child = childColumns[i];
                if (child instanceof column_1.Column) {
                    result.push(child);
                }
                else if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
                    recursiveFindColumns(child.getChildren());
                }
            }
        };
        recursiveFindColumns(rootColumns);
        return result;
    };
    ColumnController.prototype.getAllDisplayedTrees = function () {
        if (this.displayedTreeLeft && this.displayedTreeRight && this.displayedTreeCentre) {
            return this.displayedTreeLeft
                .concat(this.displayedTreeCentre)
                .concat(this.displayedTreeRight);
        }
        return null;
    };
    // + columnSelectPanel
    ColumnController.prototype.getPrimaryColumnTree = function () {
        return this.primaryColumnTree;
    };
    // + gridPanel -> for resizing the body and setting top margin
    ColumnController.prototype.getHeaderRowCount = function () {
        return this.gridHeaderRowCount;
    };
    // + headerRenderer -> setting pinned body width
    ColumnController.prototype.getDisplayedTreeLeft = function () {
        return this.displayedTreeLeft;
    };
    // + headerRenderer -> setting pinned body width
    ColumnController.prototype.getDisplayedTreeRight = function () {
        return this.displayedTreeRight;
    };
    // + headerRenderer -> setting pinned body width
    ColumnController.prototype.getDisplayedTreeCentre = function () {
        return this.displayedTreeCentre;
    };
    // gridPanel -> ensureColumnVisible
    ColumnController.prototype.isColumnDisplayed = function (column) {
        return this.getAllDisplayedColumns().indexOf(column) >= 0;
    };
    // + csvCreator
    ColumnController.prototype.getAllDisplayedColumns = function () {
        return this.displayedColumns;
    };
    ColumnController.prototype.getViewportColumns = function () {
        return this.viewportColumns;
    };
    ColumnController.prototype.getDisplayedLeftColumnsForRow = function (rowNode) {
        if (!this.colSpanActive) {
            return this.displayedColumnsLeft;
        }
        return this.getDisplayedColumnsForRow(rowNode, this.displayedColumnsLeft);
    };
    ColumnController.prototype.getDisplayedRightColumnsForRow = function (rowNode) {
        if (!this.colSpanActive) {
            return this.displayedColumnsRight;
        }
        return this.getDisplayedColumnsForRow(rowNode, this.displayedColumnsRight);
    };
    ColumnController.prototype.getDisplayedColumnsForRow = function (rowNode, displayedColumns, filterCallback, emptySpaceBeforeColumn) {
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
    ColumnController.prototype.getViewportCenterColumnsForRow = function (rowNode) {
        var _this = this;
        if (!this.colSpanActive) {
            return this.viewportColumnsCenter;
        }
        var emptySpaceBeforeColumn = function (col) {
            var left = col.getLeft();
            return generic_1.exists(left) && left > _this.viewportLeft;
        };
        // if doing column virtualisation, then we filter based on the viewport.
        var filterCallback = this.suppressColumnVirtualisation ? null : this.isColumnInViewport.bind(this);
        return this.getDisplayedColumnsForRow(rowNode, this.displayedColumnsCenter, filterCallback, emptySpaceBeforeColumn);
    };
    ColumnController.prototype.getAriaColumnIndex = function (col) {
        return this.getAllGridColumns().indexOf(col) + 1;
    };
    ColumnController.prototype.isColumnInViewport = function (col) {
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
    ColumnController.prototype.getDisplayedColumnsLeftWidth = function () {
        return this.getWidthOfColsInList(this.displayedColumnsLeft);
    };
    // note: this should be cached
    ColumnController.prototype.getDisplayedColumnsRightWidth = function () {
        return this.getWidthOfColsInList(this.displayedColumnsRight);
    };
    ColumnController.prototype.updatePrimaryColumnList = function (keys, masterList, actionIsAdd, columnCallback, eventType, source) {
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
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnController.prototype.setRowGroupColumns = function (colKeys, source) {
        if (source === void 0) { source = "api"; }
        this.autoGroupsNeedBuilding = true;
        this.setPrimaryColumnList(colKeys, this.rowGroupColumns, events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.setRowGroupActive.bind(this), source);
    };
    ColumnController.prototype.setRowGroupActive = function (active, column, source) {
        if (active === column.isRowGroupActive()) {
            return;
        }
        column.setRowGroupActive(active, source);
        if (!active && !this.gridOptionsWrapper.isSuppressMakeColumnVisibleAfterUnGroup()) {
            column.setVisible(true, source);
        }
    };
    ColumnController.prototype.addRowGroupColumn = function (key, source) {
        if (source === void 0) { source = "api"; }
        if (key) {
            this.addRowGroupColumns([key], source);
        }
    };
    ColumnController.prototype.addRowGroupColumns = function (keys, source) {
        if (source === void 0) { source = "api"; }
        this.autoGroupsNeedBuilding = true;
        this.updatePrimaryColumnList(keys, this.rowGroupColumns, true, this.setRowGroupActive.bind(this, true), events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, source);
    };
    ColumnController.prototype.removeRowGroupColumns = function (keys, source) {
        if (source === void 0) { source = "api"; }
        this.autoGroupsNeedBuilding = true;
        this.updatePrimaryColumnList(keys, this.rowGroupColumns, false, this.setRowGroupActive.bind(this, false), events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, source);
    };
    ColumnController.prototype.removeRowGroupColumn = function (key, source) {
        if (source === void 0) { source = "api"; }
        if (key) {
            this.removeRowGroupColumns([key], source);
        }
    };
    ColumnController.prototype.addPivotColumns = function (keys, source) {
        if (source === void 0) { source = "api"; }
        this.updatePrimaryColumnList(keys, this.pivotColumns, true, function (column) { return column.setPivotActive(true, source); }, events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, source);
    };
    ColumnController.prototype.setPivotColumns = function (colKeys, source) {
        if (source === void 0) { source = "api"; }
        this.setPrimaryColumnList(colKeys, this.pivotColumns, events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, function (added, column) {
            column.setPivotActive(added, source);
        }, source);
    };
    ColumnController.prototype.addPivotColumn = function (key, source) {
        if (source === void 0) { source = "api"; }
        this.addPivotColumns([key], source);
    };
    ColumnController.prototype.removePivotColumns = function (keys, source) {
        if (source === void 0) { source = "api"; }
        this.updatePrimaryColumnList(keys, this.pivotColumns, false, function (column) { return column.setPivotActive(false, source); }, events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, source);
    };
    ColumnController.prototype.removePivotColumn = function (key, source) {
        if (source === void 0) { source = "api"; }
        this.removePivotColumns([key], source);
    };
    ColumnController.prototype.setPrimaryColumnList = function (colKeys, masterList, eventName, columnCallback, source) {
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
        this.primaryColumns.forEach(function (column) {
            var added = masterList.indexOf(column) >= 0;
            columnCallback(added, column);
        });
        if (this.autoGroupsNeedBuilding) {
            this.updateGridColumns();
        }
        this.updateDisplayedColumns(source);
        this.fireColumnEvent(eventName, masterList, source);
    };
    ColumnController.prototype.setValueColumns = function (colKeys, source) {
        if (source === void 0) { source = "api"; }
        this.setPrimaryColumnList(colKeys, this.valueColumns, events_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.setValueActive.bind(this), source);
    };
    ColumnController.prototype.setValueActive = function (active, column, source) {
        if (active === column.isValueActive()) {
            return;
        }
        column.setValueActive(active, source);
        if (active && !column.getAggFunc()) {
            var initialAggFunc = this.aggFuncService.getDefaultAggFunc(column);
            column.setAggFunc(initialAggFunc);
        }
    };
    ColumnController.prototype.addValueColumns = function (keys, source) {
        if (source === void 0) { source = "api"; }
        this.updatePrimaryColumnList(keys, this.valueColumns, true, this.setValueActive.bind(this, true), events_1.Events.EVENT_COLUMN_VALUE_CHANGED, source);
    };
    ColumnController.prototype.addValueColumn = function (colKey, source) {
        if (source === void 0) { source = "api"; }
        if (colKey) {
            this.addValueColumns([colKey], source);
        }
    };
    ColumnController.prototype.removeValueColumn = function (colKey, source) {
        if (source === void 0) { source = "api"; }
        this.removeValueColumns([colKey], source);
    };
    ColumnController.prototype.removeValueColumns = function (keys, source) {
        if (source === void 0) { source = "api"; }
        this.updatePrimaryColumnList(keys, this.valueColumns, false, this.setValueActive.bind(this, false), events_1.Events.EVENT_COLUMN_VALUE_CHANGED, source);
    };
    // returns the width we can set to this col, taking into consideration min and max widths
    ColumnController.prototype.normaliseColumnWidth = function (column, newWidth) {
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
    ColumnController.prototype.getPrimaryOrGridColumn = function (key) {
        var column = this.getPrimaryColumn(key);
        return column || this.getGridColumn(key);
    };
    ColumnController.prototype.setColumnWidths = function (columnWidths, shiftKey, // @takeFromAdjacent - if user has 'shift' pressed, then pixels are taken from adjacent column
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
            var defaultIsShift = _this.gridOptionsWrapper.getColResizeDefault() === 'shift';
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
        this.resizeColumnSets(sets, finished, source);
    };
    ColumnController.prototype.checkMinAndMaxWidthsForSet = function (columnResizeSet) {
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
    ColumnController.prototype.resizeColumnSets = function (resizeSets, finished, source) {
        var passMinMaxCheck = !resizeSets || resizeSets.every(this.checkMinAndMaxWidthsForSet.bind(this));
        if (!passMinMaxCheck) {
            // even though we are not going to resize beyond min/max size, we still need to raise event when finished
            if (finished) {
                var columns = resizeSets && resizeSets.length > 0 ? resizeSets[0].columns : null;
                this.fireColumnResizedEvent(columns, finished, source);
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
                if (col.getActualWidth() !== newWidth) {
                    col.setActualWidth(newWidth, source);
                    changedCols.push(col);
                }
            });
        });
        // if no cols changed, then no need to update more or send event.
        var atLeastOneColChanged = changedCols.length > 0;
        var flexedCols = this.refreshFlexedColumns({ resizingCols: allResizedCols, skipSetLeft: true });
        if (atLeastOneColChanged) {
            this.setLeftValues(source);
            this.updateBodyWidths();
            this.checkViewportColumns();
        }
        // check for change first, to avoid unnecessary firing of events
        // however we always fire 'finished' events. this is important
        // when groups are resized, as if the group is changing slowly,
        // eg 1 pixel at a time, then each change will fire change events
        // in all the columns in the group, but only one with get the pixel.
        var colsForEvent = allResizedCols.concat(flexedCols);
        if (atLeastOneColChanged || finished) {
            this.fireColumnResizedEvent(colsForEvent, finished, source, flexedCols);
        }
    };
    ColumnController.prototype.setColumnAggFunc = function (key, aggFunc, source) {
        if (source === void 0) { source = "api"; }
        if (!key) {
            return;
        }
        var column = this.getPrimaryColumn(key);
        if (!column) {
            return;
        }
        column.setAggFunc(aggFunc);
        this.fireColumnEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, [column], source);
    };
    ColumnController.prototype.fireColumnEvent = function (type, columns, source) {
        var event = {
            type: type,
            columns: columns,
            column: (columns && columns.length == 1) ? columns[0] : null,
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnController.prototype.moveRowGroupColumn = function (fromIndex, toIndex, source) {
        if (source === void 0) { source = "api"; }
        var column = this.rowGroupColumns[fromIndex];
        this.rowGroupColumns.splice(fromIndex, 1);
        this.rowGroupColumns.splice(toIndex, 0, column);
        var event = {
            type: events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            columns: this.rowGroupColumns,
            column: this.rowGroupColumns.length === 1 ? this.rowGroupColumns[0] : null,
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnController.prototype.moveColumns = function (columnsToMoveKeys, toIndex, source) {
        if (source === void 0) { source = "api"; }
        this.columnAnimationService.start();
        if (toIndex > this.gridColumns.length - columnsToMoveKeys.length) {
            console.warn('AG Grid: tried to insert columns in invalid location, toIndex = ' + toIndex);
            console.warn('AG Grid: remember that you should not count the moving columns when calculating the new index');
            return;
        }
        // we want to pull all the columns out first and put them into an ordered list
        var columnsToMove = this.getGridColumns(columnsToMoveKeys);
        var failedRules = !this.doesMovePassRules(columnsToMove, toIndex);
        if (failedRules) {
            return;
        }
        array_1.moveInArray(this.gridColumns, columnsToMove, toIndex);
        this.updateDisplayedColumns(source);
        var event = {
            type: events_1.Events.EVENT_COLUMN_MOVED,
            columns: columnsToMove,
            column: columnsToMove.length === 1 ? columnsToMove[0] : null,
            toIndex: toIndex,
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };
        this.eventService.dispatchEvent(event);
        this.columnAnimationService.finish();
    };
    ColumnController.prototype.doesMovePassRules = function (columnsToMove, toIndex) {
        // make a copy of what the grid columns would look like after the move
        var proposedColumnOrder = this.gridColumns.slice();
        array_1.moveInArray(proposedColumnOrder, columnsToMove, toIndex);
        // then check that the new proposed order of the columns passes all rules
        if (!this.doesMovePassMarryChildren(proposedColumnOrder)) {
            return false;
        }
        if (!this.doesMovePassLockedPositions(proposedColumnOrder)) {
            return false;
        }
        return true;
    };
    // returns the provided cols sorted in same order as they appear in grid columns. eg if grid columns
    // contains [a,b,c,d,e] and col passed is [e,a] then the passed cols are sorted into [a,e]
    ColumnController.prototype.sortColumnsLikeGridColumns = function (cols) {
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
    ColumnController.prototype.doesMovePassLockedPositions = function (proposedColumnOrder) {
        var foundNonLocked = false;
        var rulePassed = true;
        // go though the cols, see if any non-locked appear before any locked
        proposedColumnOrder.forEach(function (col) {
            if (col.getColDef().lockPosition) {
                if (foundNonLocked) {
                    rulePassed = false;
                }
            }
            else {
                foundNonLocked = true;
            }
        });
        return rulePassed;
    };
    ColumnController.prototype.doesMovePassMarryChildren = function (allColumnsCopy) {
        var rulePassed = true;
        this.columnUtils.depthFirstOriginalTreeSearch(null, this.gridBalancedTree, function (child) {
            if (!(child instanceof originalColumnGroup_1.OriginalColumnGroup)) {
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
    ColumnController.prototype.moveColumn = function (key, toIndex, source) {
        if (source === void 0) { source = "api"; }
        this.moveColumns([key], toIndex, source);
    };
    ColumnController.prototype.moveColumnByIndex = function (fromIndex, toIndex, source) {
        if (source === void 0) { source = "api"; }
        var column = this.gridColumns[fromIndex];
        this.moveColumn(column, toIndex, source);
    };
    ColumnController.prototype.getColumnDefs = function () {
        var _this = this;
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
    ColumnController.prototype.getBodyContainerWidth = function () {
        return this.bodyWidth;
    };
    ColumnController.prototype.getContainerWidth = function (pinned) {
        switch (pinned) {
            case constants_1.Constants.PINNED_LEFT:
                return this.leftWidth;
            case constants_1.Constants.PINNED_RIGHT:
                return this.rightWidth;
            default:
                return this.bodyWidth;
        }
    };
    // after setColumnWidth or updateGroupsAndDisplayedColumns
    ColumnController.prototype.updateBodyWidths = function () {
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
            var event_3 = {
                type: events_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event_3);
        }
    };
    // + rowController
    ColumnController.prototype.getValueColumns = function () {
        return this.valueColumns ? this.valueColumns : [];
    };
    // + rowController
    ColumnController.prototype.getPivotColumns = function () {
        return this.pivotColumns ? this.pivotColumns : [];
    };
    // + clientSideRowModel
    ColumnController.prototype.isPivotActive = function () {
        return this.pivotColumns && this.pivotColumns.length > 0 && this.pivotMode;
    };
    // + toolPanel
    ColumnController.prototype.getRowGroupColumns = function () {
        return this.rowGroupColumns ? this.rowGroupColumns : [];
    };
    // + rowController -> while inserting rows
    ColumnController.prototype.getDisplayedCenterColumns = function () {
        return this.displayedColumnsCenter;
    };
    // + rowController -> while inserting rows
    ColumnController.prototype.getDisplayedLeftColumns = function () {
        return this.displayedColumnsLeft;
    };
    ColumnController.prototype.getDisplayedRightColumns = function () {
        return this.displayedColumnsRight;
    };
    ColumnController.prototype.getDisplayedColumns = function (type) {
        switch (type) {
            case constants_1.Constants.PINNED_LEFT:
                return this.getDisplayedLeftColumns();
            case constants_1.Constants.PINNED_RIGHT:
                return this.getDisplayedRightColumns();
            default:
                return this.getDisplayedCenterColumns();
        }
    };
    // used by:
    // + clientSideRowController -> sorting, building quick filter text
    // + headerRenderer -> sorting (clearing icon)
    ColumnController.prototype.getAllPrimaryColumns = function () {
        return this.primaryColumns ? this.primaryColumns.slice() : null;
    };
    ColumnController.prototype.getSecondaryColumns = function () {
        return this.secondaryColumns ? this.secondaryColumns.slice() : null;
    };
    ColumnController.prototype.getAllColumnsForQuickFilter = function () {
        return this.columnsForQuickFilter;
    };
    // + moveColumnController
    ColumnController.prototype.getAllGridColumns = function () {
        return this.gridColumns;
    };
    ColumnController.prototype.isEmpty = function () {
        return generic_1.missingOrEmpty(this.gridColumns);
    };
    ColumnController.prototype.isRowGroupEmpty = function () {
        return generic_1.missingOrEmpty(this.rowGroupColumns);
    };
    ColumnController.prototype.setColumnVisible = function (key, visible, source) {
        if (source === void 0) { source = "api"; }
        this.setColumnsVisible([key], visible, source);
    };
    ColumnController.prototype.setColumnsVisible = function (keys, visible, source) {
        var _this = this;
        if (visible === void 0) { visible = false; }
        if (source === void 0) { source = "api"; }
        this.columnAnimationService.start();
        this.actionOnGridColumns(keys, function (column) {
            if (column.isVisible() !== visible) {
                column.setVisible(visible, source);
                return true;
            }
            return false;
        }, source, function () {
            var event = {
                type: events_1.Events.EVENT_COLUMN_VISIBLE,
                visible: visible,
                column: null,
                columns: null,
                api: _this.gridApi,
                columnApi: _this.columnApi,
                source: source
            };
            return event;
        });
        this.columnAnimationService.finish();
    };
    ColumnController.prototype.setColumnPinned = function (key, pinned, source) {
        if (source === void 0) { source = "api"; }
        if (key) {
            this.setColumnsPinned([key], pinned, source);
        }
    };
    ColumnController.prototype.setColumnsPinned = function (keys, pinned, source) {
        var _this = this;
        if (source === void 0) { source = "api"; }
        if (this.gridOptionsWrapper.getDomLayout() === 'print') {
            console.warn("Changing the column pinning status is not allowed with domLayout='print'");
            return;
        }
        this.columnAnimationService.start();
        var actualPinned;
        if (pinned === true || pinned === constants_1.Constants.PINNED_LEFT) {
            actualPinned = constants_1.Constants.PINNED_LEFT;
        }
        else if (pinned === constants_1.Constants.PINNED_RIGHT) {
            actualPinned = constants_1.Constants.PINNED_RIGHT;
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
                api: _this.gridApi,
                columnApi: _this.columnApi,
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
    ColumnController.prototype.actionOnGridColumns = function (// the column keys this action will be on
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
            var event_4 = createEvent();
            event_4.columns = updatedColumns;
            event_4.column = updatedColumns.length === 1 ? updatedColumns[0] : null;
            this.eventService.dispatchEvent(event_4);
        }
    };
    ColumnController.prototype.getDisplayedColBefore = function (col) {
        var allDisplayedColumns = this.getAllDisplayedColumns();
        var oldIndex = allDisplayedColumns.indexOf(col);
        if (oldIndex > 0) {
            return allDisplayedColumns[oldIndex - 1];
        }
        return null;
    };
    // used by:
    // + rowRenderer -> for navigation
    ColumnController.prototype.getDisplayedColAfter = function (col) {
        var allDisplayedColumns = this.getAllDisplayedColumns();
        var oldIndex = allDisplayedColumns.indexOf(col);
        if (oldIndex < (allDisplayedColumns.length - 1)) {
            return allDisplayedColumns[oldIndex + 1];
        }
        return null;
    };
    ColumnController.prototype.getDisplayedGroupAfter = function (columnGroup) {
        return this.getDisplayedGroupAtDirection(columnGroup, 'After');
    };
    ColumnController.prototype.getDisplayedGroupBefore = function (columnGroup) {
        return this.getDisplayedGroupAtDirection(columnGroup, 'Before');
    };
    ColumnController.prototype.getDisplayedGroupAtDirection = function (columnGroup, direction) {
        // pick the last displayed column in this group
        var requiredLevel = columnGroup.getOriginalColumnGroup().getLevel() + columnGroup.getPaddingLevel();
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
    ColumnController.prototype.getColumnGroupAtLevel = function (column, level) {
        // get group at same level as the one we are looking for
        var groupPointer = column.getParent();
        var originalGroupLevel;
        var groupPointerLevel;
        while (true) {
            var groupPointerOriginalColumnGroup = groupPointer.getOriginalColumnGroup();
            originalGroupLevel = groupPointerOriginalColumnGroup.getLevel();
            groupPointerLevel = groupPointer.getPaddingLevel();
            if (originalGroupLevel + groupPointerLevel <= level) {
                break;
            }
            groupPointer = groupPointer.getParent();
        }
        return groupPointer;
    };
    ColumnController.prototype.isPinningLeft = function () {
        return this.displayedColumnsLeft.length > 0;
    };
    ColumnController.prototype.isPinningRight = function () {
        return this.displayedColumnsRight.length > 0;
    };
    ColumnController.prototype.getPrimaryAndSecondaryAndAutoColumns = function () {
        var result = this.primaryColumns ? this.primaryColumns.slice(0) : [];
        if (this.groupAutoColumns && generic_1.exists(this.groupAutoColumns)) {
            this.groupAutoColumns.forEach(function (col) { return result.push(col); });
        }
        if (this.secondaryColumnsPresent && this.secondaryColumns) {
            this.secondaryColumns.forEach(function (column) { return result.push(column); });
        }
        return result;
    };
    ColumnController.prototype.createStateItemFromColumn = function (column) {
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
    ColumnController.prototype.getColumnState = function () {
        if (generic_1.missing(this.primaryColumns) || !this.isAlive()) {
            return [];
        }
        var primaryColumnState = this.primaryColumns.map(this.createStateItemFromColumn.bind(this));
        var groupAutoColumnState = this.groupAutoColumns
            // if groupAutoCols, then include them
            ? this.groupAutoColumns.map(this.createStateItemFromColumn.bind(this))
            // otherwise no
            : [];
        var columnStateList = groupAutoColumnState.concat(primaryColumnState);
        if (!this.pivotMode) {
            this.orderColumnStateList(columnStateList);
        }
        return columnStateList;
    };
    ColumnController.prototype.orderColumnStateList = function (columnStateList) {
        // for fast looking, store the index of each column
        var gridColumnIdMap = map_1.convertToMap(this.gridColumns.map(function (col, index) { return [col.getColId(), index]; }));
        columnStateList.sort(function (itemA, itemB) {
            var posA = gridColumnIdMap.has(itemA.colId) ? gridColumnIdMap.get(itemA.colId) : -1;
            var posB = gridColumnIdMap.has(itemB.colId) ? gridColumnIdMap.get(itemB.colId) : -1;
            return posA - posB;
        });
    };
    ColumnController.prototype.resetColumnState = function (source) {
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
            var colDef = column.getColDef();
            var sort = colDef.sort != null ? colDef.sort : null;
            var sortIndex = colDef.sortIndex;
            var hide = colDef.hide ? true : false;
            var pinned = colDef.pinned ? colDef.pinned : null;
            var width = colDef.width;
            var flex = colDef.flex != null ? colDef.flex : null;
            var rowGroupIndex = colDef.rowGroupIndex;
            var rowGroup = colDef.rowGroup;
            if (rowGroupIndex == null && (rowGroup == null || rowGroup == false)) {
                rowGroupIndex = null;
                rowGroup = null;
            }
            var pivotIndex = colDef.pivotIndex;
            var pivot = colDef.pivot;
            if (pivotIndex == null && (pivot == null || pivot == false)) {
                pivotIndex = null;
                pivot = null;
            }
            var aggFunc = colDef.aggFunc != null ? colDef.aggFunc : null;
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
    ColumnController.prototype.applyColumnState = function (params, source) {
        var _this = this;
        if (source === void 0) { source = "api"; }
        if (generic_1.missingOrEmpty(this.primaryColumns)) {
            return false;
        }
        if (params && params.state && !params.state.forEach) {
            console.warn('AG Grid: applyColumnState() - the state attribute should be an array, however an array was not found. Please provide an array of items (one for each col you want to change) for state.');
            return false;
        }
        this.columnAnimationService.start();
        var raiseEventsFunc = this.compareColumnStatesAndRaiseEvents(source);
        this.autoGroupsNeedBuilding = true;
        // at the end below, this list will have all columns we got no state for
        var columnsWithNoState = this.primaryColumns.slice();
        var success = true;
        var rowGroupIndexes = {};
        var pivotIndexes = {};
        var autoGroupColumnStates = [];
        var previousRowGroupCols = this.rowGroupColumns.slice();
        var previousPivotCols = this.pivotColumns.slice();
        if (params.state) {
            params.state.forEach(function (state) {
                var groupAutoColumnId = constants_1.Constants.GROUP_AUTO_COLUMN_ID;
                var colId = state.colId || '';
                // auto group columns are re-created so deferring syncing with ColumnState
                var isAutoGroupColumn = string_1.startsWith(colId, groupAutoColumnId);
                if (isAutoGroupColumn) {
                    autoGroupColumnStates.push(state);
                    return;
                }
                var column = _this.getPrimaryColumn(colId);
                if (!column) {
                    // we don't log the failure, as it's possible the user is applying that has extra
                    // cols in it. for example they could of save while row-grouping (so state includes
                    // auto-group column) and then applied state when not grouping (so the auto-group
                    // column would be in the state but no used).
                    success = false;
                }
                else {
                    _this.syncColumnWithStateItem(column, state, params.defaultState, rowGroupIndexes, pivotIndexes, false, source);
                    array_1.removeFromArray(columnsWithNoState, column);
                }
            });
        }
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
        this.rowGroupColumns.sort(comparator.bind(this, rowGroupIndexes, previousRowGroupCols));
        this.pivotColumns.sort(comparator.bind(this, pivotIndexes, previousPivotCols));
        this.updateGridColumns();
        // sync newly created auto group columns with ColumnState
        var autoGroupColsCopy = this.groupAutoColumns ? this.groupAutoColumns.slice() : [];
        autoGroupColumnStates.forEach(function (stateItem) {
            var autoCol = _this.getAutoColumn(stateItem.colId);
            array_1.removeFromArray(autoGroupColsCopy, autoCol);
            _this.syncColumnWithStateItem(autoCol, stateItem, params.defaultState, null, null, true, source);
        });
        // autogroup cols with nothing else, apply the default
        autoGroupColsCopy.forEach(applyDefaultsFunc);
        this.applyOrderAfterApplyState(params);
        this.updateDisplayedColumns(source);
        this.dispatchEverythingChanged(source);
        raiseEventsFunc();
        this.columnAnimationService.finish();
        return success;
    };
    ColumnController.prototype.applyOrderAfterApplyState = function (params) {
        if (!this.gridColsArePrimary || !params.applyOrder || !params.state) {
            return;
        }
        var newOrder = [];
        var processedColIds = {};
        var gridColumnsMap = {};
        this.gridColumns.forEach(function (col) { return gridColumnsMap[col.getId()] = col; });
        params.state.forEach(function (item) {
            if (!item.colId || processedColIds[item.colId]) {
                return;
            }
            var col = gridColumnsMap[item.colId];
            if (col) {
                newOrder.push(col);
                processedColIds[item.colId] = true;
            }
        });
        // add in all other columns
        this.gridColumns.forEach(function (col) {
            if (!processedColIds[col.getColId()]) {
                newOrder.push(col);
            }
        });
        // this is already done in updateGridColumns, however we changed the order above (to match the order of the state
        // columns) so we need to do it again. we could of put logic into the order above to take into account fixed
        // columns, however if we did then we would have logic for updating fixed columns twice. reusing the logic here
        // is less sexy for the code here, but it keeps consistency.
        newOrder = this.putFixedColumnsFirst(newOrder);
        if (!this.doesMovePassMarryChildren(newOrder)) {
            console.warn('AG Grid: Applying column order broke a group where columns should be married together. Applying new order has been discarded.');
            return;
        }
        this.gridColumns = newOrder;
    };
    ColumnController.prototype.compareColumnStatesAndRaiseEvents = function (source) {
        var _this = this;
        // if no columns to begin with, then it means we are setting columns for the first time, so
        // there should be no events fired to show differences in columns.
        var colsPreviouslyExisted = !!this.columnDefs;
        if (!colsPreviouslyExisted) {
            return function () { };
        }
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
            if (_this.gridOptionsWrapper.isSuppressColumnStateEvents()) {
                return;
            }
            // raises generic ColumnEvents where all columns are returned rather than what has changed
            var raiseWhenListsDifferent = function (eventType, colsBefore, colsAfter, idMapper) {
                var beforeList = colsBefore.map(idMapper).sort();
                var afterList = colsAfter.map(idMapper).sort();
                var unchanged = array_1.areEqual(beforeList, afterList);
                if (unchanged) {
                    return;
                }
                // returning all columns rather than what has changed!
                var event = {
                    type: eventType,
                    columns: colsAfter,
                    column: colsAfter.length === 1 ? colsAfter[0] : null,
                    api: _this.gridApi,
                    columnApi: _this.columnApi,
                    source: source
                };
                _this.eventService.dispatchEvent(event);
            };
            // determines which columns have changed according to supplied predicate
            var getChangedColumns = function (changedPredicate) {
                var changedColumns = [];
                _this.gridColumns.forEach(function (column) {
                    var colStateBefore = columnStateBeforeMap[column.getColId()];
                    if (colStateBefore && changedPredicate(colStateBefore, column)) {
                        changedColumns.push(column);
                    }
                });
                return changedColumns;
            };
            var columnIdMapper = function (c) { return c.getColId(); };
            raiseWhenListsDifferent(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, startState.rowGroupColumns, _this.rowGroupColumns, columnIdMapper);
            raiseWhenListsDifferent(events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, startState.pivotColumns, _this.pivotColumns, columnIdMapper);
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
                _this.fireColumnEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, _this.valueColumns, source);
            }
            var resizeChangePredicate = function (cs, c) { return cs.width != c.getActualWidth(); };
            _this.fireColumnResizedEvent(getChangedColumns(resizeChangePredicate), true, source);
            var pinnedChangePredicate = function (cs, c) { return cs.pinned != c.getPinned(); };
            _this.raiseColumnPinnedEvent(getChangedColumns(pinnedChangePredicate), source);
            var visibilityChangePredicate = function (cs, c) { return cs.hide == c.isVisible(); };
            _this.raiseColumnVisibleEvent(getChangedColumns(visibilityChangePredicate), source);
            var sortChangePredicate = function (cs, c) { return cs.sort != c.getSort() || cs.sortIndex != c.getSortIndex(); };
            if (getChangedColumns(sortChangePredicate).length > 0) {
                _this.sortController.dispatchSortChangedEvents();
            }
            // special handling for moved column events
            _this.raiseColumnMovedEvent(columnStateBefore, source);
        };
    };
    ColumnController.prototype.raiseColumnPinnedEvent = function (changedColumns, source) {
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
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnController.prototype.getCommonValue = function (cols, valueGetter) {
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
    ColumnController.prototype.raiseColumnVisibleEvent = function (changedColumns, source) {
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
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnController.prototype.raiseColumnMovedEvent = function (colStateBefore, source) {
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
        var beforeFiltered = array_1.filter(colStateBefore, function (c) { return colsIntersectIds[c.colId]; });
        var afterFiltered = array_1.filter(colStateAfter, function (c) { return colsIntersectIds[c.colId]; });
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
        var event = {
            type: events_1.Events.EVENT_COLUMN_MOVED,
            columns: movedColumns,
            column: null,
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnController.prototype.syncColumnWithStateItem = function (column, stateItem, defaultState, rowGroupIndexes, pivotIndexes, autoCol, source) {
        if (!column) {
            return;
        }
        var getValue = function (key1, key2) {
            var stateAny = stateItem;
            var defaultAny = defaultState;
            var obj = { value1: undefined, value2: undefined };
            var calculated = false;
            if (stateAny) {
                if (stateAny[key1] !== undefined) {
                    obj.value1 = stateAny[key1];
                    calculated = true;
                }
                if (generic_1.exists(key2) && stateAny[key2] !== undefined) {
                    obj.value2 = stateAny[key2];
                    calculated = true;
                }
            }
            if (!calculated && defaultAny) {
                if (defaultAny[key1] !== undefined) {
                    obj.value1 = defaultAny[key1];
                }
                if (generic_1.exists(key2) && defaultAny[key2] !== undefined) {
                    obj.value2 = defaultAny[key2];
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
        var minColWidth = this.gridOptionsWrapper.getMinColWidth();
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
                if (minColWidth &&
                    (width >= minColWidth)) {
                    column.setActualWidth(width, source);
                }
            }
        }
        var sort = getValue('sort').value1;
        if (sort !== undefined) {
            if (sort === constants_1.Constants.SORT_DESC || sort === constants_1.Constants.SORT_ASC) {
                column.setSort(sort);
            }
            else {
                column.setSort(undefined);
            }
        }
        var sortIndex = getValue('sortIndex').value1;
        if (sortIndex !== undefined) {
            column.setSortIndex(sortIndex);
        }
        // we do not do aggFunc, rowGroup or pivot for auto cols, as you can't do these with auto col
        if (autoCol) {
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
                column.setAggFunc(null);
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
    ColumnController.prototype.getGridColumns = function (keys) {
        return this.getColumns(keys, this.getGridColumn.bind(this));
    };
    ColumnController.prototype.getColumns = function (keys, columnLookupCallback) {
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
    ColumnController.prototype.getColumnWithValidation = function (key) {
        if (key == null) {
            return null;
        }
        var column = this.getGridColumn(key);
        if (!column) {
            console.warn('AG Grid: could not find column ' + key);
        }
        return column;
    };
    ColumnController.prototype.getPrimaryColumn = function (key) {
        return this.getColumn(key, this.primaryColumns, this.primaryColumnsMap);
    };
    ColumnController.prototype.getGridColumn = function (key) {
        return this.getColumn(key, this.gridColumns, this.gridColumnsMap);
    };
    ColumnController.prototype.getColumn = function (key, columnList, columnMap) {
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
    ColumnController.prototype.getAutoColumn = function (key) {
        var _this = this;
        if (!this.groupAutoColumns ||
            !generic_1.exists(this.groupAutoColumns) ||
            generic_1.missing(this.groupAutoColumns)) {
            return null;
        }
        return generic_1.find(this.groupAutoColumns, function (groupCol) { return _this.columnsMatch(groupCol, key); });
    };
    ColumnController.prototype.columnsMatch = function (column, key) {
        var columnMatches = column === key;
        var colDefMatches = column.getColDef() === key;
        var idMatches = column.getColId() == key;
        return columnMatches || colDefMatches || idMatches;
    };
    ColumnController.prototype.getDisplayNameForColumn = function (column, location, includeAggFunc) {
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
    ColumnController.prototype.getDisplayNameForOriginalColumnGroup = function (columnGroup, originalColumnGroup, location) {
        var colGroupDef = originalColumnGroup ? originalColumnGroup.getColGroupDef() : null;
        if (colGroupDef) {
            return this.getHeaderName(colGroupDef, null, columnGroup, originalColumnGroup, location);
        }
        return null;
    };
    ColumnController.prototype.getDisplayNameForColumnGroup = function (columnGroup, location) {
        return this.getDisplayNameForOriginalColumnGroup(columnGroup, columnGroup.getOriginalColumnGroup(), location);
    };
    // location is where the column is going to appear, ie who is calling us
    ColumnController.prototype.getHeaderName = function (colDef, column, columnGroup, originalColumnGroup, location) {
        var headerValueGetter = colDef.headerValueGetter;
        if (headerValueGetter) {
            var params = {
                colDef: colDef,
                column: column,
                columnGroup: columnGroup,
                originalColumnGroup: originalColumnGroup,
                location: location,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            if (typeof headerValueGetter === 'function') {
                // valueGetter is a function, so just call it
                return headerValueGetter(params);
            }
            else if (typeof headerValueGetter === 'string') {
                // valueGetter is an expression, so execute the expression
                return this.expressionService.evaluate(headerValueGetter, params);
            }
            console.warn('ag-grid: headerValueGetter must be a function or a string');
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
    /*
        private getHeaderGroupName(columnGroup: ColumnGroup): string {
            let colGroupDef = columnGroup.getOriginalColumnGroup().getColGroupDef();
            let headerValueGetter = colGroupDef.headerValueGetter;

            if (headerValueGetter) {
                let params = {
                    columnGroup: columnGroup,
                    colDef: colGroupDef,
                    api: this.gridOptionsWrapper.getApi(),
                    context: this.gridOptionsWrapper.getContext()
                };

                if (typeof headerValueGetter === 'function') {
                    // valueGetter is a function, so just call it
                    return headerValueGetter(params);
                } else if (typeof headerValueGetter === 'string') {
                    // valueGetter is an expression, so execute the expression
                    return this.expressionService.evaluate(headerValueGetter, params);
                } else {
                    console.warn('ag-grid: headerValueGetter must be a function or a string');
                    return '';
                }
            } else {
                return colGroupDef.headerName;
            }
        }
    */
    ColumnController.prototype.wrapHeaderNameWithAggFunc = function (column, headerName) {
        if (this.gridOptionsWrapper.isSuppressAggFuncInHeader()) {
            return headerName;
        }
        // only columns with aggregation active can have aggregations
        var pivotValueColumn = column.getColDef().pivotValueColumn;
        var pivotActiveOnThisColumn = generic_1.exists(pivotValueColumn);
        var aggFunc = null;
        var aggFuncFound;
        // otherwise we have a measure that is active, and we are doing aggregation on it
        if (pivotActiveOnThisColumn) {
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
            var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            var aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);
            return aggFuncStringTranslated + "(" + headerName + ")";
        }
        return headerName;
    };
    // returns the group with matching colId and instanceId. If instanceId is missing,
    // matches only on the colId.
    ColumnController.prototype.getColumnGroup = function (colId, instanceId) {
        if (!colId) {
            return null;
        }
        if (colId instanceof columnGroup_1.ColumnGroup) {
            return colId;
        }
        var allColumnGroups = this.getAllDisplayedTrees();
        var checkInstanceId = typeof instanceId === 'number';
        var result = null;
        this.columnUtils.depthFirstAllColumnTreeSearch(allColumnGroups, function (child) {
            if (child instanceof columnGroup_1.ColumnGroup) {
                var columnGroup = child;
                var matched = void 0;
                if (checkInstanceId) {
                    matched = colId === columnGroup.getGroupId() && instanceId === columnGroup.getInstanceId();
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
    ColumnController.prototype.isReady = function () {
        return this.ready;
    };
    ColumnController.prototype.extractValueColumns = function (source, oldPrimaryColumns) {
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
    ColumnController.prototype.extractRowGroupColumns = function (source, oldPrimaryColumns) {
        this.rowGroupColumns = this.extractColumns(oldPrimaryColumns, this.rowGroupColumns, function (col, flag) { return col.setRowGroupActive(flag, source); }, function (colDef) { return colDef.rowGroupIndex; }, function (colDef) { return colDef.initialRowGroupIndex; }, function (colDef) { return colDef.rowGroup; }, function (colDef) { return colDef.initialRowGroup; });
    };
    ColumnController.prototype.extractColumns = function (oldPrimaryColumns, previousCols, setFlagFunc, getIndexFunc, getInitialIndexFunc, getValueFunc, getInitialValueFunc) {
        if (oldPrimaryColumns === void 0) { oldPrimaryColumns = []; }
        if (previousCols === void 0) { previousCols = []; }
        var colsWithIndex = [];
        var colsWithValue = [];
        // go though all cols.
        // if value, change
        // if default only, change only if new
        this.primaryColumns.forEach(function (col) {
            var colIsNew = oldPrimaryColumns.indexOf(col) < 0;
            var colDef = col.getColDef();
            var value = generic_1.attrToBoolean(getValueFunc(colDef));
            var initialValue = generic_1.attrToBoolean(getInitialValueFunc(colDef));
            var index = generic_1.attrToNumber(getIndexFunc(colDef));
            var initialIndex = generic_1.attrToNumber(getInitialIndexFunc(colDef));
            var include;
            if (colIsNew) {
                // col is new, use values if present, otherwise use default values if present
                var valuePresent = value !== undefined || index !== undefined;
                if (valuePresent) {
                    if (value !== undefined) {
                        // if boolean value present, we take it's value, even if 'false'
                        include = value;
                    }
                    else {
                        // otherwise we based on number value. note that 'null' resets, however 'undefined' doesn't
                        // go through this code path (undefined means 'ignore').
                        include = index >= 0;
                    }
                }
                else {
                    include = initialValue || initialIndex >= 0;
                }
            }
            else {
                // col is not new, we ignore the default values, just use the values if provided
                if (value !== undefined) { // value is never null, as attrToBoolean converts null to false
                    include = value;
                }
                else if (index !== undefined) {
                    if (index === null) {
                        include = false;
                    }
                    else {
                        include = index >= 0;
                    }
                }
                else {
                    // no values provided, we include if it was included last time
                    include = previousCols.indexOf(col) >= 0;
                }
            }
            if (include) {
                var useIndex = colIsNew ? (index != null || initialIndex != null) : index != null;
                if (useIndex) {
                    colsWithIndex.push(col);
                }
                else {
                    colsWithValue.push(col);
                }
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
    ColumnController.prototype.extractPivotColumns = function (source, oldPrimaryColumns) {
        this.pivotColumns = this.extractColumns(oldPrimaryColumns, this.pivotColumns, function (col, flag) { return col.setPivotActive(flag, source); }, function (colDef) { return colDef.pivotIndex; }, function (colDef) { return colDef.initialPivotIndex; }, function (colDef) { return colDef.pivot; }, function (colDef) { return colDef.initialPivot; });
    };
    ColumnController.prototype.resetColumnGroupState = function (source) {
        if (source === void 0) { source = "api"; }
        var stateItems = [];
        this.columnUtils.depthFirstOriginalTreeSearch(null, this.primaryColumnTree, function (child) {
            if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
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
    ColumnController.prototype.getColumnGroupState = function () {
        var columnGroupState = [];
        this.columnUtils.depthFirstOriginalTreeSearch(null, this.gridBalancedTree, function (node) {
            if (node instanceof originalColumnGroup_1.OriginalColumnGroup) {
                var originalColumnGroup = node;
                columnGroupState.push({
                    groupId: originalColumnGroup.getGroupId(),
                    open: originalColumnGroup.isExpanded()
                });
            }
        });
        return columnGroupState;
    };
    ColumnController.prototype.setColumnGroupState = function (stateItems, source) {
        var _this = this;
        if (source === void 0) { source = "api"; }
        this.columnAnimationService.start();
        var impactedGroups = [];
        stateItems.forEach(function (stateItem) {
            var groupKey = stateItem.groupId;
            var newValue = stateItem.open;
            var originalColumnGroup = _this.getOriginalColumnGroup(groupKey);
            if (!originalColumnGroup) {
                return;
            }
            if (originalColumnGroup.isExpanded() === newValue) {
                return;
            }
            _this.logger.log('columnGroupOpened(' + originalColumnGroup.getGroupId() + ',' + newValue + ')');
            originalColumnGroup.setExpanded(newValue);
            impactedGroups.push(originalColumnGroup);
        });
        this.updateGroupsAndDisplayedColumns(source);
        this.setFirstRightAndLastLeftPinned(source);
        impactedGroups.forEach(function (originalColumnGroup) {
            var event = {
                type: events_1.Events.EVENT_COLUMN_GROUP_OPENED,
                columnGroup: originalColumnGroup,
                api: _this.gridApi,
                columnApi: _this.columnApi
            };
            _this.eventService.dispatchEvent(event);
        });
        this.columnAnimationService.finish();
    };
    // called by headerRenderer - when a header is opened or closed
    ColumnController.prototype.setColumnGroupOpened = function (key, newValue, source) {
        if (source === void 0) { source = "api"; }
        var keyAsString;
        if (key instanceof originalColumnGroup_1.OriginalColumnGroup) {
            keyAsString = key.getId();
        }
        else {
            keyAsString = key || '';
        }
        this.setColumnGroupState([{ groupId: keyAsString, open: newValue }], source);
    };
    ColumnController.prototype.getOriginalColumnGroup = function (key) {
        if (key instanceof originalColumnGroup_1.OriginalColumnGroup) {
            return key;
        }
        if (typeof key !== 'string') {
            console.error('AG Grid: group key must be a string');
        }
        // otherwise, search for the column group by id
        var res = null;
        this.columnUtils.depthFirstOriginalTreeSearch(null, this.gridBalancedTree, function (node) {
            if (node instanceof originalColumnGroup_1.OriginalColumnGroup) {
                var originalColumnGroup = node;
                if (originalColumnGroup.getId() === key) {
                    res = originalColumnGroup;
                }
            }
        });
        return res;
    };
    ColumnController.prototype.calculateColumnsForDisplay = function () {
        var _this = this;
        var columnsForDisplay;
        if (this.pivotMode && !this.secondaryColumnsPresent) {
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
    ColumnController.prototype.checkColSpanActiveInCols = function (columns) {
        var result = false;
        columns.forEach(function (col) {
            if (generic_1.exists(col.getColDef().colSpan)) {
                result = true;
            }
        });
        return result;
    };
    ColumnController.prototype.calculateColumnsForGroupDisplay = function () {
        var _this = this;
        this.groupDisplayColumns = [];
        var checkFunc = function (col) {
            var colDef = col.getColDef();
            if (colDef && generic_1.exists(colDef.showRowGroup)) {
                _this.groupDisplayColumns.push(col);
            }
        };
        this.gridColumns.forEach(checkFunc);
        if (this.groupAutoColumns) {
            this.groupAutoColumns.forEach(checkFunc);
        }
    };
    ColumnController.prototype.getGroupDisplayColumns = function () {
        return this.groupDisplayColumns;
    };
    ColumnController.prototype.updateDisplayedColumns = function (source) {
        var columnsForDisplay = this.calculateColumnsForDisplay();
        this.buildDisplayedTrees(columnsForDisplay);
        this.calculateColumnsForGroupDisplay();
        // also called when group opened/closed
        this.updateGroupsAndDisplayedColumns(source);
        // also called when group opened/closed
        this.setFirstRightAndLastLeftPinned(source);
    };
    ColumnController.prototype.isSecondaryColumnsPresent = function () {
        return this.secondaryColumnsPresent;
    };
    ColumnController.prototype.setSecondaryColumns = function (colDefs, source) {
        if (source === void 0) { source = "api"; }
        var newColsPresent = colDefs && colDefs.length > 0;
        // if not cols passed, and we had to cols anyway, then do nothing
        if (!newColsPresent && !this.secondaryColumnsPresent) {
            return;
        }
        if (newColsPresent) {
            this.processSecondaryColumnDefinitions(colDefs);
            var balancedTreeResult = this.columnFactory.createColumnTree(colDefs, false);
            this.secondaryBalancedTree = balancedTreeResult.columnTree;
            this.secondaryHeaderRowCount = balancedTreeResult.treeDept + 1;
            this.secondaryColumns = this.getColumnsFromTree(this.secondaryBalancedTree);
            this.secondaryColumnsPresent = true;
        }
        else {
            this.secondaryBalancedTree = null;
            this.secondaryHeaderRowCount = -1;
            this.secondaryColumns = null;
            this.secondaryColumnsPresent = false;
        }
        this.updateGridColumns();
        this.updateDisplayedColumns(source);
    };
    ColumnController.prototype.processSecondaryColumnDefinitions = function (colDefs) {
        var columnCallback = this.gridOptionsWrapper.getProcessSecondaryColDefFunc();
        var groupCallback = this.gridOptionsWrapper.getProcessSecondaryColGroupDefFunc();
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
    // called from: setColumnState, setColumnDefs, setSecondaryColumns
    ColumnController.prototype.updateGridColumns = function () {
        var _this = this;
        if (this.gridColsArePrimary) {
            this.lastPrimaryOrder = this.gridColumns;
        }
        if (this.secondaryColumns && this.secondaryBalancedTree) {
            this.gridBalancedTree = this.secondaryBalancedTree.slice();
            this.gridHeaderRowCount = this.secondaryHeaderRowCount;
            this.gridColumns = this.secondaryColumns.slice();
            this.gridColsArePrimary = false;
        }
        else {
            this.gridBalancedTree = this.primaryColumnTree.slice();
            this.gridHeaderRowCount = this.primaryHeaderRowCount;
            this.gridColumns = this.primaryColumns.slice();
            this.gridColsArePrimary = true;
            // updateGridColumns gets called after user adds a row group. we want to maintain the order of the columns
            // when this happens (eg if user moved a column) rather than revert back to the original column order.
            // likewise if changing in/out of pivot mode, we want to maintain the order of the primary cols
            this.orderGridColsLikeLastPrimary();
        }
        this.addAutoGroupToGridColumns();
        this.autoRowHeightColumns = this.gridColumns.filter(function (col) { return col.getColDef().autoHeight; });
        this.gridColumns = this.putFixedColumnsFirst(this.gridColumns);
        this.setupQuickFilterColumns();
        this.clearDisplayedAndViewportColumns();
        this.colSpanActive = this.checkColSpanActiveInCols(this.gridColumns);
        this.gridColumnsMap = {};
        this.gridColumns.forEach(function (col) { return _this.gridColumnsMap[col.getId()] = col; });
        var event = {
            type: events_1.Events.EVENT_GRID_COLUMNS_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnController.prototype.orderGridColsLikeLastPrimary = function () {
        if (generic_1.missing(this.lastPrimaryOrder)) {
            return;
        }
        var lastPrimaryOrderMapped = map_1.convertToMap(this.lastPrimaryOrder.map(function (col, index) { return [col, index]; }));
        // only do the sort if at least one column is accounted for. columns will be not accounted for
        // if changing from secondary to primary columns
        var noColsFound = true;
        this.gridColumns.forEach(function (col) {
            if (lastPrimaryOrderMapped.has(col)) {
                noColsFound = false;
            }
        });
        if (noColsFound) {
            return;
        }
        // order cols in the same order as before. we need to make sure that all
        // cols still exists, so filter out any that no longer exist.
        var gridColsMap = map_1.convertToMap(this.gridColumns.map(function (col) { return [col, true]; }));
        var oldColsOrdered = this.lastPrimaryOrder.filter(function (col) { return gridColsMap.has(col); });
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
            var lastIndex = Math.max.apply(Math, indexes);
            array_1.insertIntoArray(newGridColumns, newCol, lastIndex + 1);
        });
        this.gridColumns = newGridColumns;
    };
    ColumnController.prototype.isPrimaryColumnGroupsPresent = function () {
        return this.primaryHeaderRowCount > 1;
    };
    // if we are using autoGroupCols, then they should be included for quick filter. this covers the
    // following scenarios:
    // a) user provides 'field' into autoGroupCol of normal grid, so now because a valid col to filter leafs on
    // b) using tree data and user depends on autoGroupCol for first col, and we also want to filter on this
    //    (tree data is a bit different, as parent rows can be filtered on, unlike row grouping)
    ColumnController.prototype.setupQuickFilterColumns = function () {
        if (this.groupAutoColumns) {
            this.columnsForQuickFilter = this.primaryColumns.concat(this.groupAutoColumns);
        }
        else {
            this.columnsForQuickFilter = this.primaryColumns;
        }
    };
    ColumnController.prototype.putFixedColumnsFirst = function (cols) {
        var locked = cols.filter(function (c) { return c.getColDef().lockPosition; });
        var unlocked = cols.filter(function (c) { return !c.getColDef().lockPosition; });
        return locked.concat(unlocked);
    };
    ColumnController.prototype.addAutoGroupToGridColumns = function () {
        // add in auto-group here
        this.createGroupAutoColumnsIfNeeded();
        if (generic_1.missing(this.groupAutoColumns)) {
            return;
        }
        this.gridColumns = this.groupAutoColumns ? this.groupAutoColumns.concat(this.gridColumns) : this.gridColumns;
        var autoColBalancedTree = this.columnFactory.createForAutoGroups(this.groupAutoColumns, this.gridBalancedTree);
        this.gridBalancedTree = autoColBalancedTree.concat(this.gridBalancedTree);
    };
    // gets called after we copy down grid columns, to make sure any part of the gui
    // that tries to draw, eg the header, it will get empty lists of columns rather
    // than stale columns. for example, the header will received gridColumnsChanged
    // event, so will try and draw, but it will draw successfully when it acts on the
    // virtualColumnsChanged event
    ColumnController.prototype.clearDisplayedAndViewportColumns = function () {
        this.displayedTreeLeft = [];
        this.displayedTreeRight = [];
        this.displayedTreeCentre = [];
        this.viewportRowLeft = {};
        this.viewportRowRight = {};
        this.viewportRowCenter = {};
        this.displayedColumnsLeft = [];
        this.displayedColumnsRight = [];
        this.displayedColumnsCenter = [];
        this.displayedColumns = [];
        this.viewportColumns = [];
    };
    ColumnController.prototype.updateGroupsAndDisplayedColumns = function (source) {
        this.updateOpenClosedVisibilityInColumnGroups();
        this.deriveDisplayedColumns(source);
        this.refreshFlexedColumns();
        this.extractViewport();
        this.updateBodyWidths();
        // this event is picked up by the gui, headerRenderer and rowRenderer, to recalculate what columns to display
        var event = {
            type: events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnController.prototype.deriveDisplayedColumns = function (source) {
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeLeft, this.displayedColumnsLeft);
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeCentre, this.displayedColumnsCenter);
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeRight, this.displayedColumnsRight);
        this.joinDisplayedColumns();
        this.setLeftValues(source);
    };
    ColumnController.prototype.joinDisplayedColumns = function () {
        if (this.gridOptionsWrapper.isEnableRtl()) {
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
    ColumnController.prototype.setLeftValues = function (source) {
        this.setLeftValuesOfColumns(source);
        this.setLeftValuesOfGroups();
    };
    ColumnController.prototype.setLeftValuesOfColumns = function (source) {
        var _this = this;
        // go through each list of displayed columns
        var allColumns = this.primaryColumns.slice(0);
        // let totalColumnWidth = this.getWidthOfColsInList()
        var doingRtl = this.gridOptionsWrapper.isEnableRtl();
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
    ColumnController.prototype.setLeftValuesOfGroups = function () {
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
    ColumnController.prototype.derivedDisplayedColumnsFromDisplayedTree = function (tree, columns) {
        columns.length = 0;
        this.columnUtils.depthFirstDisplayedColumnTreeSearch(tree, function (child) {
            if (child instanceof column_1.Column) {
                columns.push(child);
            }
        });
    };
    ColumnController.prototype.extractViewportColumns = function () {
        if (this.suppressColumnVirtualisation) {
            // no virtualisation, so don't filter
            this.viewportColumnsCenter = this.displayedColumnsCenter;
        }
        else {
            // filter out what should be visible
            this.viewportColumnsCenter = this.filterOutColumnsWithinViewport();
        }
        this.viewportColumns = this.viewportColumnsCenter
            .concat(this.displayedColumnsLeft)
            .concat(this.displayedColumnsRight);
    };
    ColumnController.prototype.getVirtualHeaderGroupRow = function (type, dept) {
        var result;
        switch (type) {
            case constants_1.Constants.PINNED_LEFT:
                result = this.viewportRowLeft[dept];
                break;
            case constants_1.Constants.PINNED_RIGHT:
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
    ColumnController.prototype.extractViewportRows = function () {
        // go through each group, see if any of it's cols are displayed, and if yes,
        // then this group is included
        this.viewportRowLeft = {};
        this.viewportRowRight = {};
        this.viewportRowCenter = {};
        // for easy lookup when building the groups.
        var virtualColIds = {};
        this.viewportColumns.forEach(function (col) { return virtualColIds[col.getId()] = true; });
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
    ColumnController.prototype.extractViewport = function () {
        this.extractViewportColumns();
        this.extractViewportRows();
    };
    ColumnController.prototype.filterOutColumnsWithinViewport = function () {
        return this.displayedColumnsCenter.filter(this.isColumnInViewport.bind(this));
    };
    ColumnController.prototype.refreshFlexedColumns = function (params) {
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
            this.fireColumnResizedEvent(changedColumns, true, source, flexingColumns);
        }
        // if the user sets rowData directly into GridOptions, then the row data is set before
        // grid is attached to the DOM. this means the columns are not flexed, and then the rows
        // have the wrong height (as they depend on column widths). so once the columns have
        // been flexed for the first time (only happens once grid is attached to DOM, as dependency
        // on getting the grid width, which only happens after attached after ResizeObserver fires)
        // we get get rows to re-calc their heights.
        if (!this.flexColsCalculatedAtLestOnce) {
            if (this.gridOptionsWrapper.isRowModelDefault()) {
                this.rowModel.resetRowHeights();
            }
            this.flexColsCalculatedAtLestOnce = true;
        }
        return flexingColumns;
    };
    // called from api
    ColumnController.prototype.sizeColumnsToFit = function (gridWidth, source, silent) {
        if (source === void 0) { source = "sizeColumnsToFit"; }
        // avoid divide by zero
        var allDisplayedColumns = this.getAllDisplayedColumns();
        if (gridWidth <= 0 || !allDisplayedColumns.length) {
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
        var colsToFireEventFor = colsToSpread.slice(0);
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
        // for this reason we need to manually fire resize events after the resize has been done for each column.
        colsToSpread.forEach(function (column) { return column.resetActualWidth(source); });
        while (!finishedResizing) {
            finishedResizing = true;
            var availablePixels = gridWidth - this.getWidthOfColsInList(colsToNotSpread);
            if (availablePixels <= 0) {
                // no width, set everything to minimum
                colsToSpread.forEach(function (column) {
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
                    var minWidth = column.getMinWidth();
                    var maxWidth = column.getMaxWidth();
                    var newWidth = Math.round(column.getActualWidth() * scale);
                    if (generic_1.exists(minWidth) && newWidth < minWidth) {
                        newWidth = minWidth;
                        moveToNotSpread(column);
                        finishedResizing = false;
                    }
                    else if (generic_1.exists(maxWidth) && column.isGreaterThanMax(newWidth)) {
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
        colsToFireEventFor.forEach(function (col) {
            col.fireColumnWidthChangedEvent(source);
        });
        this.setLeftValues(source);
        this.updateBodyWidths();
        if (silent) {
            return;
        }
        this.fireColumnResizedEvent(colsToFireEventFor, true, source);
    };
    ColumnController.prototype.buildDisplayedTrees = function (visibleColumns) {
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
        this.displayedTreeLeft = this.displayedGroupCreator.createDisplayedGroups(leftVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, constants_1.Constants.PINNED_LEFT, this.displayedTreeLeft);
        this.displayedTreeRight = this.displayedGroupCreator.createDisplayedGroups(rightVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, constants_1.Constants.PINNED_RIGHT, this.displayedTreeRight);
        this.displayedTreeCentre = this.displayedGroupCreator.createDisplayedGroups(centerVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, null, this.displayedTreeCentre);
        this.updateDisplayedMap();
    };
    ColumnController.prototype.updateDisplayedMap = function () {
        var _this = this;
        this.displayedColumnsAndGroupsMap = {};
        var func = function (child) {
            _this.displayedColumnsAndGroupsMap[child.getUniqueId()] = child;
        };
        this.columnUtils.depthFirstAllColumnTreeSearch(this.displayedTreeCentre, func);
        this.columnUtils.depthFirstAllColumnTreeSearch(this.displayedTreeLeft, func);
        this.columnUtils.depthFirstAllColumnTreeSearch(this.displayedTreeRight, func);
    };
    ColumnController.prototype.isDisplayed = function (item) {
        var fromMap = this.displayedColumnsAndGroupsMap[item.getUniqueId()];
        // check for reference, in case new column / group with same id is now present
        return fromMap === item;
    };
    ColumnController.prototype.updateOpenClosedVisibilityInColumnGroups = function () {
        var allColumnGroups = this.getAllDisplayedTrees();
        this.columnUtils.depthFirstAllColumnTreeSearch(allColumnGroups, function (child) {
            if (child instanceof columnGroup_1.ColumnGroup) {
                var columnGroup = child;
                columnGroup.calculateDisplayedColumns();
            }
        });
    };
    ColumnController.prototype.getGroupAutoColumns = function () {
        return this.groupAutoColumns;
    };
    ColumnController.prototype.createGroupAutoColumnsIfNeeded = function () {
        if (!this.autoGroupsNeedBuilding) {
            return;
        }
        this.autoGroupsNeedBuilding = false;
        var groupFullWidthRow = this.gridOptionsWrapper.isGroupUseEntireRow(this.pivotMode);
        // we need to allow suppressing auto-column separately for group and pivot as the normal situation
        // is CSRM and user provides group column themselves for normal view, but when they go into pivot the
        // columns are generated by the grid so no opportunity for user to provide group column. so need a way
        // to suppress auto-col for grouping only, and not pivot.
        // however if using Viewport RM or SSRM and user is providing the columns, the user may wish full control
        // of the group column in this instance.
        var suppressAutoColumn = this.pivotMode ?
            this.gridOptionsWrapper.isPivotSuppressAutoColumn() : this.gridOptionsWrapper.isGroupSuppressAutoColumn();
        var groupingActive = this.rowGroupColumns.length > 0 || this.usingTreeData;
        var needAutoColumns = groupingActive && !suppressAutoColumn && !groupFullWidthRow;
        if (needAutoColumns) {
            var newAutoGroupCols = this.autoGroupColService.createAutoGroupColumns(this.rowGroupColumns);
            var autoColsDifferent = !this.autoColsEqual(newAutoGroupCols, this.groupAutoColumns);
            // we force recreate when suppressColumnStateEvents changes, so new group cols pick up the new
            // definitions. otherwise we could ignore the new cols because they appear to be the same.
            if (autoColsDifferent || this.forceRecreateAutoGroups) {
                this.groupAutoColumns = newAutoGroupCols;
            }
        }
        else {
            this.groupAutoColumns = null;
        }
    };
    ColumnController.prototype.autoColsEqual = function (colsA, colsB) {
        return array_1.areEqual(colsA, colsB, function (a, b) { return a.getColId() === b.getColId(); });
    };
    ColumnController.prototype.getWidthOfColsInList = function (columnList) {
        return columnList.reduce(function (width, col) { return width + col.getActualWidth(); }, 0);
    };
    ColumnController.prototype.getGridBalancedTree = function () {
        return this.gridBalancedTree;
    };
    ColumnController.prototype.hasFloatingFilters = function () {
        if (!this.gridColumns) {
            return false;
        }
        var res = this.gridColumns.some(function (col) { return col.getColDef().floatingFilter; });
        return res;
    };
    ColumnController.prototype.getFirstDisplayedColumn = function () {
        var isRtl = this.gridOptionsWrapper.isEnableRtl();
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
    __decorate([
        context_1.Autowired('expressionService')
    ], ColumnController.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('columnFactory')
    ], ColumnController.prototype, "columnFactory", void 0);
    __decorate([
        context_1.Autowired('displayedGroupCreator')
    ], ColumnController.prototype, "displayedGroupCreator", void 0);
    __decorate([
        context_1.Autowired('autoWidthCalculator')
    ], ColumnController.prototype, "autoWidthCalculator", void 0);
    __decorate([
        context_1.Autowired('columnUtils')
    ], ColumnController.prototype, "columnUtils", void 0);
    __decorate([
        context_1.Autowired('columnAnimationService')
    ], ColumnController.prototype, "columnAnimationService", void 0);
    __decorate([
        context_1.Autowired('autoGroupColService')
    ], ColumnController.prototype, "autoGroupColService", void 0);
    __decorate([
        context_1.Optional('aggFuncService')
    ], ColumnController.prototype, "aggFuncService", void 0);
    __decorate([
        context_1.Optional('valueCache')
    ], ColumnController.prototype, "valueCache", void 0);
    __decorate([
        context_1.Optional('animationFrameService')
    ], ColumnController.prototype, "animationFrameService", void 0);
    __decorate([
        context_1.Autowired('rowModel')
    ], ColumnController.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], ColumnController.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], ColumnController.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('sortController')
    ], ColumnController.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('columnDefFactory')
    ], ColumnController.prototype, "columnDefFactory", void 0);
    __decorate([
        context_1.PostConstruct
    ], ColumnController.prototype, "init", null);
    __decorate([
        __param(0, context_1.Qualifier('loggerFactory'))
    ], ColumnController.prototype, "setBeans", null);
    ColumnController = __decorate([
        context_1.Bean('columnController')
    ], ColumnController);
    return ColumnController;
}(beanStub_1.BeanStub));
exports.ColumnController = ColumnController;

//# sourceMappingURL=columnController.js.map
