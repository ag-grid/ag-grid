/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var columnGroup_1 = require("../entities/columnGroup");
var column_1 = require("../entities/column");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var expressionService_1 = require("../valueService/expressionService");
var balancedColumnTreeBuilder_1 = require("./balancedColumnTreeBuilder");
var displayedGroupCreator_1 = require("./displayedGroupCreator");
var autoWidthCalculator_1 = require("../rendering/autoWidthCalculator");
var eventService_1 = require("../eventService");
var columnUtils_1 = require("./columnUtils");
var logger_1 = require("../logger");
var events_1 = require("../events");
var originalColumnGroup_1 = require("../entities/originalColumnGroup");
var groupInstanceIdCreator_1 = require("./groupInstanceIdCreator");
var context_1 = require("../context/context");
var gridPanel_1 = require("../gridPanel/gridPanel");
var columnAnimationService_1 = require("../rendering/columnAnimationService");
var autoGroupColService_1 = require("./autoGroupColService");
var valueCache_1 = require("../valueService/valueCache");
var gridApi_1 = require("../gridApi");
var columnApi_1 = require("./columnApi");
var ColumnController = (function () {
    function ColumnController() {
        // header row count, based on user provided columns
        this.primaryHeaderRowCount = 0;
        this.secondaryHeaderRowCount = 0;
        this.secondaryColumnsPresent = false;
        // header row count, either above, or based on pivoting if we are pivoting
        this.gridHeaderRowCount = 0;
        // these are the lists used by the rowRenderer to render nodes. almost the leaf nodes of the above
        // displayed trees, however it also takes into account if the groups are open or not.
        this.displayedLeftColumns = [];
        this.displayedRightColumns = [];
        this.displayedCenterColumns = [];
        // all three lists above combined
        this.allDisplayedColumns = [];
        // same as above, except trimmed down to only columns within the viewport
        this.allDisplayedVirtualColumns = [];
        this.allDisplayedCenterVirtualColumns = [];
        this.rowGroupColumns = [];
        this.valueColumns = [];
        this.pivotColumns = [];
        this.ready = false;
        this.autoGroupsNeedBuilding = false;
        this.pivotMode = false;
        this.bodyWidth = 0;
        this.leftWidth = 0;
        this.rightWidth = 0;
        this.bodyWidthDirty = true;
    }
    ColumnController.prototype.init = function () {
        var pivotMode = this.gridOptionsWrapper.isPivotMode();
        if (this.isPivotSettingAllowed(pivotMode)) {
            this.pivotMode = pivotMode;
        }
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
    };
    ColumnController.prototype.setVirtualViewportLeftAndRight = function () {
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
        var result = [];
        while (utils_1.Utils.exists(currentColumn)) {
            result.push(currentColumn);
            currentColumn = this.getDisplayedColAfter(currentColumn);
        }
        return result;
    };
    // checks what columns are currently displayed due to column virtualisation. fires an event
    // if the list of columns has changed.
    // + setColumnWidth(), setVirtualViewportPosition(), setColumnDefs(), sizeColumnsToFit()
    ColumnController.prototype.checkDisplayedVirtualColumns = function () {
        // check displayCenterColumnTree exists first, as it won't exist when grid is initialising
        if (utils_1.Utils.exists(this.displayedCenterColumns)) {
            var hashBefore = this.allDisplayedVirtualColumns.map(function (column) { return column.getId(); }).join('#');
            this.updateVirtualSets();
            var hashAfter = this.allDisplayedVirtualColumns.map(function (column) { return column.getId(); }).join('#');
            if (hashBefore !== hashAfter) {
                var event_1 = {
                    type: events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED,
                    api: this.gridApi,
                    columnApi: this.columnApi
                };
                this.eventService.dispatchEvent(event_1);
            }
        }
    };
    ColumnController.prototype.setVirtualViewportPosition = function (scrollWidth, scrollPosition) {
        if (scrollWidth !== this.scrollWidth || scrollPosition !== this.scrollPosition || this.bodyWidthDirty) {
            this.scrollWidth = scrollWidth;
            this.scrollPosition = scrollPosition;
            // we need to call setVirtualViewportLeftAndRight() at least once after the body width changes,
            // as the viewport can stay the same, but in RTL, if body width changes, we need to work out the
            // virtual columns again
            this.bodyWidthDirty = true;
            this.setVirtualViewportLeftAndRight();
            if (this.ready) {
                this.checkDisplayedVirtualColumns();
            }
        }
    };
    ColumnController.prototype.isPivotMode = function () {
        return this.pivotMode;
    };
    ColumnController.prototype.isPivotSettingAllowed = function (pivot) {
        if (pivot) {
            if (this.gridOptionsWrapper.isTreeData()) {
                console.warn("ag-Grid: Pivot mode not available in conjunction Tree Data i.e. 'gridOptions.treeData: true'");
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return true;
        }
    };
    ColumnController.prototype.setPivotMode = function (pivotMode, source) {
        if (source === void 0) { source = "api"; }
        if (pivotMode === this.pivotMode) {
            return;
        }
        if (!this.isPivotSettingAllowed(this.pivotMode)) {
            return;
        }
        this.pivotMode = pivotMode;
        this.updateDisplayedColumns(source);
        var event = {
            type: events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnController.prototype.getSecondaryPivotColumn = function (pivotKeys, valueColKey) {
        if (!this.secondaryColumnsPresent) {
            return null;
        }
        var valueColumnToFind = this.getPrimaryColumn(valueColKey);
        var foundColumn = null;
        this.secondaryColumns.forEach(function (column) {
            var thisPivotKeys = column.getColDef().pivotKeys;
            var pivotValueColumn = column.getColDef().pivotValueColumn;
            var pivotKeyMatches = utils_1.Utils.compareArrays(thisPivotKeys, pivotKeys);
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
            lastLeft = this.displayedLeftColumns ? this.displayedLeftColumns[0] : null;
            firstRight = this.displayedRightColumns ? this.displayedRightColumns[this.displayedRightColumns.length - 1] : null;
        }
        else {
            lastLeft = this.displayedLeftColumns ? this.displayedLeftColumns[this.displayedLeftColumns.length - 1] : null;
            firstRight = this.displayedRightColumns ? this.displayedRightColumns[0] : null;
        }
        this.gridColumns.forEach(function (column) {
            column.setLastLeftPinned(column === lastLeft, source);
            column.setFirstRightPinned(column === firstRight, source);
        });
    };
    ColumnController.prototype.autoSizeColumns = function (keys, source) {
        // because of column virtualisation, we can only do this function on columns that are
        // actually rendered, as non-rendered columns (outside the viewport and not rendered
        // due to column virtualisation) are not present. this can result in all rendered columns
        // getting narrowed, which in turn introduces more rendered columns on the RHS which
        // did not get autosized in the original run, leaving the visible grid with columns on
        // the LHS sized, but RHS no. so we keep looping through teh visible columns until
        // no more cols are available (rendered) to be resized
        var _this = this;
        if (source === void 0) { source = "api"; }
        // keep track of which cols we have resized in here
        var columnsAutosized = [];
        // initialise with anything except 0 so that while loop executs at least once
        var changesThisTimeAround = -1;
        while (changesThisTimeAround !== 0) {
            changesThisTimeAround = 0;
            this.actionOnGridColumns(keys, function (column) {
                // if already autosized, skip it
                if (columnsAutosized.indexOf(column) >= 0) {
                    return;
                }
                // get how wide this col should be
                var preferredWidth = _this.autoWidthCalculator.getPreferredWidthForColumn(column);
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
        if (columnsAutosized.length > 0) {
            var event_2 = {
                type: events_1.Events.EVENT_COLUMN_RESIZED,
                columns: columnsAutosized,
                column: columnsAutosized.length === 1 ? columnsAutosized[0] : null,
                finished: true,
                api: this.gridApi,
                columnApi: this.columnApi,
                source: "autosizeColumns"
            };
            this.eventService.dispatchEvent(event_2);
        }
    };
    ColumnController.prototype.autoSizeColumn = function (key, source) {
        if (source === void 0) { source = "api"; }
        this.autoSizeColumns([key], source);
    };
    ColumnController.prototype.autoSizeAllColumns = function (source) {
        if (source === void 0) { source = "api"; }
        var allDisplayedColumns = this.getAllDisplayedColumns();
        this.autoSizeColumns(allDisplayedColumns, source);
    };
    ColumnController.prototype.getColumnsFromTree = function (rootColumns) {
        var result = [];
        recursiveFindColumns(rootColumns);
        return result;
        function recursiveFindColumns(childColumns) {
            for (var i = 0; i < childColumns.length; i++) {
                var child = childColumns[i];
                if (child instanceof column_1.Column) {
                    result.push(child);
                }
                else if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
                    recursiveFindColumns(child.getChildren());
                }
            }
        }
    };
    ColumnController.prototype.getAllDisplayedColumnGroups = function () {
        if (this.displayedLeftColumnTree && this.displayedRightColumnTree && this.displayedCentreColumnTree) {
            return this.displayedLeftColumnTree
                .concat(this.displayedCentreColumnTree)
                .concat(this.displayedRightColumnTree);
        }
        else {
            return null;
        }
    };
    // + columnSelectPanel
    ColumnController.prototype.getPrimaryColumnTree = function () {
        return this.primaryBalancedTree;
    };
    // + gridPanel -> for resizing the body and setting top margin
    ColumnController.prototype.getHeaderRowCount = function () {
        return this.gridHeaderRowCount;
    };
    // + headerRenderer -> setting pinned body width
    ColumnController.prototype.getLeftDisplayedColumnGroups = function () {
        return this.displayedLeftColumnTree;
    };
    // + headerRenderer -> setting pinned body width
    ColumnController.prototype.getRightDisplayedColumnGroups = function () {
        return this.displayedRightColumnTree;
    };
    // + headerRenderer -> setting pinned body width
    ColumnController.prototype.getCenterDisplayedColumnGroups = function () {
        return this.displayedCentreColumnTree;
    };
    ColumnController.prototype.getDisplayedColumnGroups = function (type) {
        switch (type) {
            case column_1.Column.PINNED_LEFT: return this.getLeftDisplayedColumnGroups();
            case column_1.Column.PINNED_RIGHT: return this.getRightDisplayedColumnGroups();
            default: return this.getCenterDisplayedColumnGroups();
        }
    };
    // gridPanel -> ensureColumnVisible
    ColumnController.prototype.isColumnDisplayed = function (column) {
        return this.getAllDisplayedColumns().indexOf(column) >= 0;
    };
    // + csvCreator
    ColumnController.prototype.getAllDisplayedColumns = function () {
        return this.allDisplayedColumns;
    };
    ColumnController.prototype.getAllDisplayedVirtualColumns = function () {
        return this.allDisplayedVirtualColumns;
    };
    ColumnController.prototype.getDisplayedLeftColumnsForRow = function (rowNode) {
        if (!this.colSpanActive) {
            return this.displayedLeftColumns;
        }
        else {
            return this.getDisplayedColumnsForRow(rowNode, this.displayedLeftColumns);
        }
    };
    ColumnController.prototype.getDisplayedRightColumnsForRow = function (rowNode) {
        if (!this.colSpanActive) {
            return this.displayedRightColumns;
        }
        else {
            return this.getDisplayedColumnsForRow(rowNode, this.displayedRightColumns);
        }
    };
    ColumnController.prototype.getDisplayedColumnsForRow = function (rowNode, displayedColumns, filterCallback, gapBeforeCallback) {
        var result = [];
        var lastConsideredCol = null;
        for (var i = 0; i < displayedColumns.length; i++) {
            var col = displayedColumns[i];
            var colSpan = col.getColSpan(rowNode);
            if (colSpan > 1) {
                var colsToRemove = colSpan - 1;
                i += colsToRemove;
            }
            var filterPasses = filterCallback ? filterCallback(col) : true;
            if (filterPasses) {
                var gapBeforeColumn = gapBeforeCallback ? gapBeforeCallback(col) : false;
                var addInPreviousColumn = result.length === 0 && gapBeforeColumn && lastConsideredCol;
                if (addInPreviousColumn) {
                    result.push(lastConsideredCol);
                }
                result.push(col);
            }
            lastConsideredCol = col;
        }
        return result;
    };
    // + rowRenderer
    // if we are not column spanning, this just returns back the virtual centre columns,
    // however if we are column spanning, then different rows can have different virtual
    // columns, so we have to work out the list for each individual row.
    ColumnController.prototype.getAllDisplayedCenterVirtualColumnsForRow = function (rowNode) {
        var _this = this;
        if (!this.colSpanActive) {
            return this.allDisplayedCenterVirtualColumns;
        }
        var gapBeforeCallback = function (col) { return col.getLeft() > _this.viewportLeft; };
        return this.getDisplayedColumnsForRow(rowNode, this.displayedCenterColumns, this.isColumnInViewport.bind(this), gapBeforeCallback);
    };
    ColumnController.prototype.isColumnInViewport = function (col) {
        var columnLeft = col.getLeft();
        var columnRight = col.getLeft() + col.getActualWidth();
        var columnToMuchLeft = columnLeft < this.viewportLeft && columnRight < this.viewportLeft;
        var columnToMuchRight = columnLeft > this.viewportRight && columnRight > this.viewportRight;
        return !columnToMuchLeft && !columnToMuchRight;
    };
    // used by:
    // + angularGrid -> setting pinned body width
    // todo: this needs to be cached
    ColumnController.prototype.getPinnedLeftContainerWidth = function () {
        return this.getWidthOfColsInList(this.displayedLeftColumns);
    };
    // todo: this needs to be cached
    ColumnController.prototype.getPinnedRightContainerWidth = function () {
        return this.getWidthOfColsInList(this.displayedRightColumns);
    };
    ColumnController.prototype.updatePrimaryColumnList = function (keys, masterList, actionIsAdd, columnCallback, eventType, source) {
        var _this = this;
        if (source === void 0) { source = "api"; }
        if (utils_1.Utils.missingOrEmpty(keys)) {
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
                utils_1.Utils.removeFromArray(masterList, columnToAdd);
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
        if (!active) {
            column.setVisible(true, source);
        }
    };
    ColumnController.prototype.addRowGroupColumn = function (key, source) {
        if (source === void 0) { source = "api"; }
        this.addRowGroupColumns([key], source);
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
        this.removeRowGroupColumns([key], source);
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
        if (utils_1.Utils.exists(colKeys)) {
            colKeys.forEach(function (key) {
                var column = _this.getPrimaryColumn(key);
                masterList.push(column);
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
        var event = {
            type: eventName,
            columns: masterList,
            column: masterList.length === 1 ? masterList[0] : null,
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };
        this.eventService.dispatchEvent(event);
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
            var defaultAggFunc = this.aggFuncService.getDefaultAggFunc(column);
            column.setAggFunc(defaultAggFunc);
        }
    };
    ColumnController.prototype.addValueColumns = function (keys, source) {
        if (source === void 0) { source = "api"; }
        this.updatePrimaryColumnList(keys, this.valueColumns, true, this.setValueActive.bind(this, true), events_1.Events.EVENT_COLUMN_VALUE_CHANGED, source);
    };
    ColumnController.prototype.addValueColumn = function (colKey, source) {
        if (source === void 0) { source = "api"; }
        this.addValueColumns([colKey], source);
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
        if (newWidth < column.getMinWidth()) {
            newWidth = column.getMinWidth();
        }
        if (column.isGreaterThanMax(newWidth)) {
            newWidth = column.getMaxWidth();
        }
        return newWidth;
    };
    ColumnController.prototype.getPrimaryOrGridColumn = function (key) {
        var column = this.getPrimaryColumn(key);
        if (column) {
            return column;
        }
        else {
            return this.getGridColumn(key);
        }
    };
    ColumnController.prototype.setColumnWidth = function (key, newWidth, finished, source) {
        if (source === void 0) { source = "api"; }
        var column = this.getPrimaryOrGridColumn(key);
        if (!column) {
            return;
        }
        newWidth = this.normaliseColumnWidth(column, newWidth);
        var widthChanged = column.getActualWidth() !== newWidth;
        if (widthChanged) {
            column.setActualWidth(newWidth, source);
            this.setLeftValues(source);
        }
        this.updateBodyWidths();
        this.checkDisplayedVirtualColumns();
        // check for change first, to avoid unnecessary firing of events
        // however we always fire 'finished' events. this is important
        // when groups are resized, as if the group is changing slowly,
        // eg 1 pixel at a time, then each change will fire change events
        // in all the columns in the group, but only one with get the pixel.
        if (finished || widthChanged) {
            var event_3 = {
                type: events_1.Events.EVENT_COLUMN_RESIZED,
                columns: [column],
                column: column,
                finished: finished,
                api: this.gridApi,
                columnApi: this.columnApi,
                source: source
            };
            this.eventService.dispatchEvent(event_3);
        }
    };
    ColumnController.prototype.setColumnAggFunc = function (column, aggFunc, source) {
        if (source === void 0) { source = "api"; }
        column.setAggFunc(aggFunc);
        var event = {
            type: events_1.Events.EVENT_COLUMN_VALUE_CHANGED,
            columns: [column],
            column: column,
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
            console.warn('ag-Grid: tried to insert columns in invalid location, toIndex = ' + toIndex);
            console.warn('ag-Grid: remember that you should not count the moving columns when calculating the new index');
            return;
        }
        // we want to pull all the columns out first and put them into an ordered list
        var columnsToMove = this.getGridColumns(columnsToMoveKeys);
        var failedRules = !this.doesMovePassRules(columnsToMove, toIndex);
        if (failedRules) {
            return;
        }
        utils_1.Utils.moveInArray(this.gridColumns, columnsToMove, toIndex);
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
        utils_1.Utils.moveInArray(proposedColumnOrder, columnsToMove, toIndex);
        // then check that the new proposed order of the columns passes all rules
        if (!this.doesMovePassMarryChildren(proposedColumnOrder)) {
            return false;
        }
        if (!this.doesMovePassLockedPositions(proposedColumnOrder)) {
            return false;
        }
        return true;
    };
    ColumnController.prototype.doesMovePassLockedPositions = function (proposedColumnOrder) {
        var foundNonLocked = false;
        var rulePassed = true;
        // go though the cols, see if any non-locked appear before any locked
        proposedColumnOrder.forEach(function (col) {
            if (col.isLockPosition()) {
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
        this.columnUtils.depthFirstOriginalTreeSearch(this.gridBalancedTree, function (child) {
            if (!(child instanceof originalColumnGroup_1.OriginalColumnGroup)) {
                return;
            }
            var columnGroup = child;
            var marryChildren = columnGroup.getColGroupDef() && columnGroup.getColGroupDef().marryChildren;
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
    // used by:
    // + angularGrid -> for setting body width
    // + rowController -> setting main row widths (when inserting and resizing)
    // need to cache this
    ColumnController.prototype.getBodyContainerWidth = function () {
        return this.bodyWidth;
    };
    ColumnController.prototype.getContainerWidth = function (pinned) {
        switch (pinned) {
            case column_1.Column.PINNED_LEFT: return this.leftWidth;
            case column_1.Column.PINNED_RIGHT: return this.rightWidth;
            default: return this.bodyWidth;
        }
    };
    // after setColumnWidth or updateGroupsAndDisplayedColumns
    ColumnController.prototype.updateBodyWidths = function () {
        var newBodyWidth = this.getWidthOfColsInList(this.displayedCenterColumns);
        var newLeftWidth = this.getWidthOfColsInList(this.displayedLeftColumns);
        var newRightWidth = this.getWidthOfColsInList(this.displayedRightColumns);
        // this is used by virtual col calculation, for RTL only, as a change to body width can impact displayed
        // columns, due to RTL inverting the y coordinates
        this.bodyWidthDirty = this.bodyWidth !== newBodyWidth;
        var atLeastOneChanged = this.bodyWidth !== newBodyWidth || this.leftWidth !== newLeftWidth || this.rightWidth !== newRightWidth;
        if (atLeastOneChanged) {
            this.bodyWidth = newBodyWidth;
            this.leftWidth = newLeftWidth;
            this.rightWidth = newRightWidth;
            // when this fires, it is picked up by the gridPanel, which ends up in
            // gridPanel calling setWidthAndScrollPosition(), which in turn calls setVirtualViewportPosition()
            var event_4 = {
                type: events_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event_4);
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
    // + inMemoryRowModel
    ColumnController.prototype.isPivotActive = function () {
        return this.pivotColumns && this.pivotColumns.length > 0 && this.pivotMode;
    };
    // + toolPanel
    ColumnController.prototype.getRowGroupColumns = function () {
        return this.rowGroupColumns ? this.rowGroupColumns : [];
    };
    // + rowController -> while inserting rows
    ColumnController.prototype.getDisplayedCenterColumns = function () {
        return this.displayedCenterColumns;
    };
    // + rowController -> while inserting rows
    ColumnController.prototype.getDisplayedLeftColumns = function () {
        return this.displayedLeftColumns;
    };
    ColumnController.prototype.getDisplayedRightColumns = function () {
        return this.displayedRightColumns;
    };
    ColumnController.prototype.getDisplayedColumns = function (type) {
        switch (type) {
            case column_1.Column.PINNED_LEFT: return this.getDisplayedLeftColumns();
            case column_1.Column.PINNED_RIGHT: return this.getDisplayedRightColumns();
            default: return this.getDisplayedCenterColumns();
        }
    };
    // used by:
    // + inMemoryRowController -> sorting, building quick filter text
    // + headerRenderer -> sorting (clearing icon)
    ColumnController.prototype.getAllPrimaryColumns = function () {
        return this.primaryColumns;
    };
    ColumnController.prototype.getAllColumnsForQuickFilter = function () {
        return this.columnsForQuickFilter;
    };
    // + moveColumnController
    ColumnController.prototype.getAllGridColumns = function () {
        return this.gridColumns;
    };
    ColumnController.prototype.isEmpty = function () {
        return utils_1.Utils.missingOrEmpty(this.gridColumns);
    };
    ColumnController.prototype.isRowGroupEmpty = function () {
        return utils_1.Utils.missingOrEmpty(this.rowGroupColumns);
    };
    ColumnController.prototype.setColumnVisible = function (key, visible, source) {
        if (source === void 0) { source = "api"; }
        this.setColumnsVisible([key], visible, source);
    };
    ColumnController.prototype.setColumnsVisible = function (keys, visible, source) {
        var _this = this;
        if (source === void 0) { source = "api"; }
        this.columnAnimationService.start();
        this.actionOnGridColumns(keys, function (column) {
            if (column.isVisible() !== visible) {
                column.setVisible(visible, source);
                return true;
            }
            else {
                return false;
            }
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
        this.setColumnsPinned([key], pinned, source);
    };
    ColumnController.prototype.setColumnsPinned = function (keys, pinned, source) {
        var _this = this;
        if (source === void 0) { source = "api"; }
        this.columnAnimationService.start();
        var actualPinned;
        if (pinned === true || pinned === column_1.Column.PINNED_LEFT) {
            actualPinned = column_1.Column.PINNED_LEFT;
        }
        else if (pinned === column_1.Column.PINNED_RIGHT) {
            actualPinned = column_1.Column.PINNED_RIGHT;
        }
        else {
            actualPinned = null;
        }
        this.actionOnGridColumns(keys, function (col) {
            if (col.getPinned() !== actualPinned) {
                col.setPinned(actualPinned);
                return true;
            }
            else {
                return false;
            }
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
        if (utils_1.Utils.missingOrEmpty(keys)) {
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
        if (updatedColumns.length === 0) {
            return;
        }
        this.updateDisplayedColumns(source);
        if (utils_1.Utils.exists(createEvent)) {
            var event_5 = createEvent();
            event_5.columns = updatedColumns;
            event_5.column = updatedColumns.length === 1 ? updatedColumns[0] : null;
            this.eventService.dispatchEvent(event_5);
        }
    };
    ColumnController.prototype.getDisplayedColBefore = function (col) {
        var allDisplayedColumns = this.getAllDisplayedColumns();
        var oldIndex = allDisplayedColumns.indexOf(col);
        if (oldIndex > 0) {
            return allDisplayedColumns[oldIndex - 1];
        }
        else {
            return null;
        }
    };
    // used by:
    // + rowRenderer -> for navigation
    ColumnController.prototype.getDisplayedColAfter = function (col) {
        var allDisplayedColumns = this.getAllDisplayedColumns();
        var oldIndex = allDisplayedColumns.indexOf(col);
        if (oldIndex < (allDisplayedColumns.length - 1)) {
            return allDisplayedColumns[oldIndex + 1];
        }
        else {
            return null;
        }
    };
    ColumnController.prototype.isPinningLeft = function () {
        return this.displayedLeftColumns.length > 0;
    };
    ColumnController.prototype.isPinningRight = function () {
        return this.displayedRightColumns.length > 0;
    };
    ColumnController.prototype.getPrimaryAndSecondaryAndAutoColumns = function () {
        var result = this.primaryColumns ? this.primaryColumns.slice(0) : [];
        if (utils_1.Utils.exists(this.groupAutoColumns)) {
            this.groupAutoColumns.forEach(function (col) { return result.push(col); });
        }
        if (this.secondaryColumnsPresent) {
            this.secondaryColumns.forEach(function (column) { return result.push(column); });
        }
        return result;
    };
    ColumnController.prototype.createStateItemFromColumn = function (column) {
        var rowGroupIndex = column.isRowGroupActive() ? this.rowGroupColumns.indexOf(column) : null;
        var pivotIndex = column.isPivotActive() ? this.pivotColumns.indexOf(column) : null;
        var aggFunc = column.isValueActive() ? column.getAggFunc() : null;
        var resultItem = {
            colId: column.getColId(),
            hide: !column.isVisible(),
            aggFunc: aggFunc,
            width: column.getActualWidth(),
            pivotIndex: pivotIndex,
            pinned: column.getPinned(),
            rowGroupIndex: rowGroupIndex
        };
        return resultItem;
    };
    ColumnController.prototype.getColumnState = function () {
        if (utils_1.Utils.missing(this.primaryColumns)) {
            return [];
        }
        var columnStateList = this.primaryColumns.map(this.createStateItemFromColumn.bind(this));
        if (!this.pivotMode) {
            this.orderColumnStateList(columnStateList);
        }
        return columnStateList;
    };
    ColumnController.prototype.orderColumnStateList = function (columnStateList) {
        var gridColumnIds = this.gridColumns.map(function (column) { return column.getColId(); });
        columnStateList.sort(function (itemA, itemB) {
            var posA = gridColumnIds.indexOf(itemA.colId);
            var posB = gridColumnIds.indexOf(itemB.colId);
            return posA - posB;
        });
    };
    ColumnController.prototype.resetColumnState = function (source) {
        if (source === void 0) { source = "api"; }
        // we can't use 'allColumns' as the order might of messed up, so get the primary ordered list
        var primaryColumns = this.getColumnsFromTree(this.primaryBalancedTree);
        var state = [];
        if (primaryColumns) {
            primaryColumns.forEach(function (column) {
                state.push({
                    colId: column.getColId(),
                    aggFunc: column.getColDef().aggFunc,
                    hide: column.getColDef().hide,
                    pinned: column.getColDef().pinned,
                    rowGroupIndex: column.getColDef().rowGroupIndex,
                    pivotIndex: column.getColDef().pivotIndex,
                    width: column.getColDef().width
                });
            });
        }
        this.setColumnState(state, source);
    };
    ColumnController.prototype.setColumnState = function (columnState, source) {
        var _this = this;
        if (source === void 0) { source = "api"; }
        if (utils_1.Utils.missingOrEmpty(this.primaryColumns)) {
            return false;
        }
        this.autoGroupsNeedBuilding = true;
        // at the end below, this list will have all columns we got no state for
        var columnsWithNoState = this.primaryColumns.slice();
        this.rowGroupColumns = [];
        this.valueColumns = [];
        this.pivotColumns = [];
        var success = true;
        var rowGroupIndexes = {};
        var pivotIndexes = {};
        if (columnState) {
            columnState.forEach(function (stateItem) {
                var column = _this.getPrimaryColumn(stateItem.colId);
                if (!column) {
                    console.warn('ag-grid: column ' + stateItem.colId + ' not found');
                    success = false;
                }
                else {
                    _this.syncColumnWithStateItem(column, stateItem, rowGroupIndexes, pivotIndexes, source);
                    utils_1.Utils.removeFromArray(columnsWithNoState, column);
                }
            });
        }
        // anything left over, we got no data for, so add in the column as non-value, non-rowGroup and hidden
        columnsWithNoState.forEach(this.syncColumnWithNoState.bind(this));
        // sort the lists according to the indexes that were provided
        this.rowGroupColumns.sort(this.sortColumnListUsingIndexes.bind(this, rowGroupIndexes));
        this.pivotColumns.sort(this.sortColumnListUsingIndexes.bind(this, pivotIndexes));
        this.updateGridColumns();
        if (columnState) {
            var orderOfColIds_1 = columnState.map(function (stateItem) { return stateItem.colId; });
            this.gridColumns.sort(function (colA, colB) {
                var indexA = orderOfColIds_1.indexOf(colA.getId());
                var indexB = orderOfColIds_1.indexOf(colB.getId());
                return indexA - indexB;
            });
        }
        this.updateDisplayedColumns(source);
        var event = {
            type: events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
        return success;
    };
    ColumnController.prototype.sortColumnListUsingIndexes = function (indexes, colA, colB) {
        var indexA = indexes[colA.getId()];
        var indexB = indexes[colB.getId()];
        return indexA - indexB;
    };
    ColumnController.prototype.syncColumnWithNoState = function (column, source) {
        column.setVisible(false, source);
        column.setAggFunc(null);
        column.setPinned(null);
        column.setRowGroupActive(false, source);
        column.setPivotActive(false, source);
        column.setValueActive(false, source);
    };
    ColumnController.prototype.syncColumnWithStateItem = function (column, stateItem, rowGroupIndexes, pivotIndexes, source) {
        // following ensures we are left with boolean true or false, eg converts (null, undefined, 0) all to true
        column.setVisible(!stateItem.hide, source);
        // sets pinned to 'left' or 'right'
        column.setPinned(stateItem.pinned);
        // if width provided and valid, use it, otherwise stick with the old width
        if (stateItem.width >= this.gridOptionsWrapper.getMinColWidth()) {
            column.setActualWidth(stateItem.width, source);
        }
        if (typeof stateItem.aggFunc === 'string') {
            column.setAggFunc(stateItem.aggFunc);
            column.setValueActive(true, source);
            this.valueColumns.push(column);
        }
        else {
            if (utils_1.Utils.exists(stateItem.aggFunc)) {
                console.warn('ag-Grid: stateItem.aggFunc must be a string. if using your own aggregation ' +
                    'functions, register the functions first before using them in get/set state. This is because it is' +
                    'intended for the column state to be stored and retrieved as simple JSON.');
            }
            column.setAggFunc(null);
            column.setValueActive(false, source);
        }
        if (typeof stateItem.rowGroupIndex === 'number') {
            this.rowGroupColumns.push(column);
            column.setRowGroupActive(true, source);
            rowGroupIndexes[column.getId()] = stateItem.rowGroupIndex;
        }
        else {
            column.setRowGroupActive(false, source);
        }
        if (typeof stateItem.pivotIndex === 'number') {
            this.pivotColumns.push(column);
            column.setPivotActive(true, source);
            pivotIndexes[column.getId()] = stateItem.pivotIndex;
        }
        else {
            column.setPivotActive(false, source);
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
        var column = this.getPrimaryColumn(key);
        if (!column) {
            console.warn('ag-Grid: could not find column ' + column);
        }
        return column;
    };
    ColumnController.prototype.getPrimaryColumn = function (key) {
        return this.getColumn(key, this.primaryColumns);
    };
    ColumnController.prototype.getGridColumn = function (key) {
        return this.getColumn(key, this.gridColumns);
    };
    ColumnController.prototype.getColumn = function (key, columnList) {
        if (!key) {
            return null;
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
        if (!utils_1.Utils.exists(this.groupAutoColumns) || utils_1.Utils.missing(this.groupAutoColumns)) {
            return null;
        }
        return utils_1.Utils.find(this.groupAutoColumns, function (groupCol) {
            return _this.columnsMatch(groupCol, key);
        });
    };
    ColumnController.prototype.columnsMatch = function (column, key) {
        var columnMatches = column === key;
        var colDefMatches = column.getColDef() === key;
        var idMatches = column.getColId() == key;
        return columnMatches || colDefMatches || idMatches;
    };
    ColumnController.prototype.getDisplayNameForColumn = function (column, location, includeAggFunc) {
        if (includeAggFunc === void 0) { includeAggFunc = false; }
        var headerName = this.getHeaderName(column.getColDef(), column, null, location);
        if (includeAggFunc) {
            return this.wrapHeaderNameWithAggFunc(column, headerName);
        }
        else {
            return headerName;
        }
    };
    ColumnController.prototype.getDisplayNameForColumnGroup = function (columnGroup, location) {
        var colGroupDef = columnGroup.getOriginalColumnGroup().getColGroupDef();
        if (colGroupDef) {
            return this.getHeaderName(colGroupDef, null, columnGroup, location);
        }
        else {
            return null;
        }
    };
    // location is where the column is going to appear, ie who is calling us
    ColumnController.prototype.getHeaderName = function (colDef, column, columnGroup, location) {
        var headerValueGetter = colDef.headerValueGetter;
        if (headerValueGetter) {
            var params = {
                colDef: colDef,
                column: column,
                columnGroup: columnGroup,
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
            else {
                console.warn('ag-grid: headerValueGetter must be a function or a string');
                return '';
            }
        }
        else if (colDef.headerName != null) {
            return colDef.headerName;
        }
        else if (colDef.field) {
            return utils_1.Utils.camelCaseToHumanText(colDef.field);
        }
        else {
            return '';
        }
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
        var pivotActiveOnThisColumn = utils_1.Utils.exists(pivotValueColumn);
        var aggFunc = null;
        var aggFuncFound;
        // otherwise we have a measure that is active, and we are doing aggregation on it
        if (pivotActiveOnThisColumn) {
            aggFunc = pivotValueColumn.getAggFunc();
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
        else {
            return headerName;
        }
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
        var allColumnGroups = this.getAllDisplayedColumnGroups();
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
    ColumnController.prototype.setColumnDefs = function (columnDefs, source) {
        if (source === void 0) { source = "api"; }
        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.
        this.valueCache.expire();
        // NOTE ==================
        // we should be destroying the existing columns and groups if they exist, for example, the original column
        // group adds a listener to the columns, it should be also removing the listeners
        this.autoGroupsNeedBuilding = true;
        var balancedTreeResult = this.balancedColumnTreeBuilder.createBalancedColumnGroups(columnDefs, true);
        this.primaryBalancedTree = balancedTreeResult.balancedTree;
        this.primaryHeaderRowCount = balancedTreeResult.treeDept + 1;
        this.primaryColumns = this.getColumnsFromTree(this.primaryBalancedTree);
        this.extractRowGroupColumns(source);
        this.extractPivotColumns(source);
        this.createValueColumns(source);
        this.updateGridColumns();
        this.updateDisplayedColumns(source);
        this.checkDisplayedVirtualColumns();
        this.ready = true;
        var eventEverythingChanged = {
            type: events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(eventEverythingChanged);
        var newColumnsLoadedEvent = {
            type: events_1.Events.EVENT_NEW_COLUMNS_LOADED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(newColumnsLoadedEvent);
    };
    ColumnController.prototype.isReady = function () {
        return this.ready;
    };
    ColumnController.prototype.extractRowGroupColumns = function (source) {
        var _this = this;
        this.rowGroupColumns.forEach(function (column) { return column.setRowGroupActive(false, source); });
        this.rowGroupColumns = [];
        // pull out items with rowGroupIndex
        this.primaryColumns.forEach(function (column) {
            if (typeof column.getColDef().rowGroupIndex === 'number') {
                _this.rowGroupColumns.push(column);
                column.setRowGroupActive(true, source);
            }
        });
        // then sort them
        this.rowGroupColumns.sort(function (colA, colB) {
            return colA.getColDef().rowGroupIndex - colB.getColDef().rowGroupIndex;
        });
        // now just pull out items rowGroup, they will be added at the end
        // after the indexed ones, but in the order the columns appear
        this.primaryColumns.forEach(function (column) {
            if (column.getColDef().rowGroup) {
                // if user already specified rowGroupIndex then we skip it as this col already included
                if (_this.rowGroupColumns.indexOf(column) >= 0) {
                    return;
                }
                _this.rowGroupColumns.push(column);
                column.setRowGroupActive(true, source);
            }
        });
    };
    ColumnController.prototype.extractPivotColumns = function (source) {
        var _this = this;
        this.pivotColumns.forEach(function (column) { return column.setPivotActive(false, source); });
        this.pivotColumns = [];
        // pull out items with pivotIndex
        this.primaryColumns.forEach(function (column) {
            if (typeof column.getColDef().pivotIndex === 'number') {
                _this.pivotColumns.push(column);
                column.setPivotActive(true, source);
            }
        });
        // then sort them
        this.pivotColumns.sort(function (colA, colB) {
            return colA.getColDef().pivotIndex - colB.getColDef().pivotIndex;
        });
        // now check the boolean equivalent
        this.primaryColumns.forEach(function (column) {
            if (column.getColDef().pivot) {
                // if user already specified pivotIndex then we skip it as this col already included
                if (_this.pivotColumns.indexOf(column) >= 0) {
                    return;
                }
                _this.pivotColumns.push(column);
                column.setPivotActive(true, source);
            }
        });
    };
    ColumnController.prototype.resetColumnGroupState = function (source) {
        if (source === void 0) { source = "api"; }
        var stateItems = [];
        this.columnUtils.depthFirstOriginalTreeSearch(this.primaryBalancedTree, function (child) {
            if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
                var groupState = {
                    groupId: child.getGroupId(),
                    open: child.getColGroupDef().openByDefault
                };
                stateItems.push(groupState);
            }
        });
        this.setColumnGroupState(stateItems, source);
    };
    ColumnController.prototype.getColumnGroupState = function () {
        var columnGroupState = [];
        this.columnUtils.depthFirstOriginalTreeSearch(this.gridBalancedTree, function (node) {
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
            keyAsString = key;
        }
        this.setColumnGroupState([{ groupId: keyAsString, open: newValue }], source);
    };
    ColumnController.prototype.getOriginalColumnGroup = function (key) {
        if (key instanceof originalColumnGroup_1.OriginalColumnGroup) {
            return key;
        }
        if (typeof key !== 'string') {
            console.error('ag-Grid: group key must be a string');
        }
        // otherwise, search for the column group by id
        var res = null;
        this.columnUtils.depthFirstOriginalTreeSearch(this.gridBalancedTree, function (node) {
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
            columnsForDisplay = utils_1.Utils.filter(this.gridColumns, function (column) {
                var isAutoGroupCol = _this.groupAutoColumns && _this.groupAutoColumns.indexOf(column) >= 0;
                var isValueCol = _this.valueColumns && _this.valueColumns.indexOf(column) >= 0;
                return isAutoGroupCol || isValueCol;
            });
        }
        else {
            // otherwise continue as normal. this can be working on the primary
            // or secondary columns, whatever the gridColumns are set to
            columnsForDisplay = utils_1.Utils.filter(this.gridColumns, function (column) {
                // keep col if a) it's auto-group or b) it's visible
                var isAutoGroupCol = _this.groupAutoColumns && _this.groupAutoColumns.indexOf(column) >= 0;
                return isAutoGroupCol || column.isVisible();
            });
        }
        return columnsForDisplay;
    };
    ColumnController.prototype.checkColSpanActiveInCols = function (columns) {
        var result = false;
        columns.forEach(function (col) {
            if (utils_1.Utils.exists(col.getColDef().colSpan)) {
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
            if (colDef && utils_1.Utils.exists(colDef.showRowGroup)) {
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
        // this is also called when a group is opened or closed
        this.updateGroupsAndDisplayedColumns(source);
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
            var balancedTreeResult = this.balancedColumnTreeBuilder.createBalancedColumnGroups(colDefs, false);
            this.secondaryBalancedTree = balancedTreeResult.balancedTree;
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
            return;
        }
        searchForColDefs(colDefs);
        function searchForColDefs(colDefs2) {
            colDefs2.forEach(function (abstractColDef) {
                var isGroup = utils_1.Utils.exists(abstractColDef.children);
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
        }
    };
    // called from: setColumnState, setColumnDefs, setSecondaryColumns
    ColumnController.prototype.updateGridColumns = function () {
        if (this.secondaryColumns) {
            this.gridBalancedTree = this.secondaryBalancedTree.slice();
            this.gridHeaderRowCount = this.secondaryHeaderRowCount;
            this.gridColumns = this.secondaryColumns.slice();
        }
        else {
            this.gridBalancedTree = this.primaryBalancedTree.slice();
            this.gridHeaderRowCount = this.primaryHeaderRowCount;
            this.gridColumns = this.primaryColumns.slice();
        }
        this.putFixedColumnsFirst();
        this.addAutoGroupToGridColumns();
        this.setupQuickFilterColumns();
        this.clearDisplayedColumns();
        this.colSpanActive = this.checkColSpanActiveInCols(this.gridColumns);
        var event = {
            type: events_1.Events.EVENT_GRID_COLUMNS_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
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
    ColumnController.prototype.putFixedColumnsFirst = function () {
        var locked = this.gridColumns.filter(function (c) { return c.isLockPosition(); });
        var unlocked = this.gridColumns.filter(function (c) { return !c.isLockPosition(); });
        this.gridColumns = locked.concat(unlocked);
    };
    ColumnController.prototype.addAutoGroupToGridColumns = function () {
        // add in auto-group here
        this.createGroupAutoColumnsIfNeeded();
        if (utils_1.Utils.missing(this.groupAutoColumns)) {
            return;
        }
        this.gridColumns = this.groupAutoColumns.concat(this.gridColumns);
        var autoColBalancedTree = this.balancedColumnTreeBuilder.createForAutoGroups(this.groupAutoColumns, this.gridBalancedTree);
        this.gridBalancedTree = autoColBalancedTree.concat(this.gridBalancedTree);
    };
    // gets called after we copy down grid columns, to make sure any part of the gui
    // that tries to draw, eg the header, it will get empty lists of columns rather
    // than stale columns. for example, the header will received gridColumnsChanged
    // event, so will try and draw, but it will draw successfully when it acts on the
    // virtualColumnsChanged event
    ColumnController.prototype.clearDisplayedColumns = function () {
        this.displayedLeftColumnTree = [];
        this.displayedRightColumnTree = [];
        this.displayedCentreColumnTree = [];
        this.displayedLeftHeaderRows = {};
        this.displayedRightHeaderRows = {};
        this.displayedCentreHeaderRows = {};
        this.displayedLeftColumns = [];
        this.displayedRightColumns = [];
        this.displayedCenterColumns = [];
        this.allDisplayedColumns = [];
        this.allDisplayedVirtualColumns = [];
    };
    ColumnController.prototype.updateGroupsAndDisplayedColumns = function (source) {
        this.updateOpenClosedVisibilityInColumnGroups();
        this.updateDisplayedColumnsFromTrees(source);
        this.updateVirtualSets();
        this.updateBodyWidths();
        // this event is picked up by the gui, headerRenderer and rowRenderer, to recalculate what columns to display
        var event = {
            type: events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    ColumnController.prototype.updateDisplayedColumnsFromTrees = function (source) {
        this.addToDisplayedColumns(this.displayedLeftColumnTree, this.displayedLeftColumns);
        this.addToDisplayedColumns(this.displayedCentreColumnTree, this.displayedCenterColumns);
        this.addToDisplayedColumns(this.displayedRightColumnTree, this.displayedRightColumns);
        this.setupAllDisplayedColumns();
        this.setLeftValues(source);
    };
    ColumnController.prototype.setupAllDisplayedColumns = function () {
        if (this.gridOptionsWrapper.isEnableRtl()) {
            this.allDisplayedColumns = this.displayedRightColumns
                .concat(this.displayedCenterColumns)
                .concat(this.displayedLeftColumns);
        }
        else {
            this.allDisplayedColumns = this.displayedLeftColumns
                .concat(this.displayedCenterColumns)
                .concat(this.displayedRightColumns);
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
        [this.displayedLeftColumns, this.displayedRightColumns, this.displayedCenterColumns].forEach(function (columns) {
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
            utils_1.Utils.removeAllFromArray(allColumns, columns);
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
        [this.displayedLeftColumnTree, this.displayedRightColumnTree, this.displayedCentreColumnTree].forEach(function (columns) {
            columns.forEach(function (column) {
                if (column instanceof columnGroup_1.ColumnGroup) {
                    var columnGroup = column;
                    columnGroup.checkLeft();
                }
            });
        });
    };
    ColumnController.prototype.addToDisplayedColumns = function (displayedColumnTree, displayedColumns) {
        displayedColumns.length = 0;
        this.columnUtils.depthFirstDisplayedColumnTreeSearch(displayedColumnTree, function (child) {
            if (child instanceof column_1.Column) {
                displayedColumns.push(child);
            }
        });
    };
    ColumnController.prototype.updateDisplayedCenterVirtualColumns = function () {
        var skipVirtualisation = this.gridOptionsWrapper.isSuppressColumnVirtualisation() || this.gridOptionsWrapper.isForPrint();
        if (skipVirtualisation) {
            // no virtualisation, so don't filter
            this.allDisplayedCenterVirtualColumns = this.displayedCenterColumns;
        }
        else {
            // filter out what should be visible
            this.allDisplayedCenterVirtualColumns = this.filterOutColumnsWithinViewport();
        }
        this.allDisplayedVirtualColumns = this.allDisplayedCenterVirtualColumns
            .concat(this.displayedLeftColumns)
            .concat(this.displayedRightColumns);
        // return map of virtual col id's, for easy lookup when building the groups.
        // the map will be colId=>true, ie col id's mapping to 'true'.
        var result = {};
        this.allDisplayedVirtualColumns.forEach(function (col) {
            result[col.getId()] = true;
        });
        return result;
    };
    ColumnController.prototype.getVirtualHeaderGroupRow = function (type, dept) {
        var result;
        switch (type) {
            case column_1.Column.PINNED_LEFT:
                result = this.displayedLeftHeaderRows[dept];
                break;
            case column_1.Column.PINNED_RIGHT:
                result = this.displayedRightHeaderRows[dept];
                break;
            default:
                result = this.displayedCentreHeaderRows[dept];
                break;
        }
        if (utils_1.Utils.missing(result)) {
            result = [];
        }
        return result;
    };
    ColumnController.prototype.updateDisplayedVirtualGroups = function (virtualColIds) {
        // go through each group, see if any of it's cols are displayed, and if yes,
        // then this group is included
        this.displayedLeftHeaderRows = {};
        this.displayedRightHeaderRows = {};
        this.displayedCentreHeaderRows = {};
        testGroup(this.displayedLeftColumnTree, this.displayedLeftHeaderRows, 0);
        testGroup(this.displayedRightColumnTree, this.displayedRightHeaderRows, 0);
        testGroup(this.displayedCentreColumnTree, this.displayedCentreHeaderRows, 0);
        function testGroup(children, result, dept) {
            var returnValue = false;
            for (var i = 0; i < children.length; i++) {
                // see if this item is within viewport
                var child = children[i];
                var addThisItem = void 0;
                if (child instanceof column_1.Column) {
                    // for column, test if column is included
                    addThisItem = virtualColIds[child.getId()] === true;
                }
                else {
                    // if group, base decision on children
                    var columnGroup = child;
                    addThisItem = testGroup(columnGroup.getDisplayedChildren(), result, dept + 1);
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
        }
    };
    ColumnController.prototype.updateVirtualSets = function () {
        var virtualColIds = this.updateDisplayedCenterVirtualColumns();
        this.updateDisplayedVirtualGroups(virtualColIds);
    };
    ColumnController.prototype.filterOutColumnsWithinViewport = function () {
        return utils_1.Utils.filter(this.displayedCenterColumns, this.isColumnInViewport.bind(this));
    };
    // called from api
    ColumnController.prototype.sizeColumnsToFit = function (gridWidth, source) {
        var _this = this;
        if (source === void 0) { source = "api"; }
        // avoid divide by zero
        var allDisplayedColumns = this.getAllDisplayedColumns();
        if (gridWidth <= 0 || allDisplayedColumns.length === 0) {
            return;
        }
        var colsToNotSpread = utils_1.Utils.filter(allDisplayedColumns, function (column) {
            return column.getColDef().suppressSizeToFit === true;
        });
        var colsToSpread = utils_1.Utils.filter(allDisplayedColumns, function (column) {
            return column.getColDef().suppressSizeToFit !== true;
        });
        // make a copy of the cols that are going to be resized
        var colsToFireEventFor = colsToSpread.slice(0);
        var finishedResizing = false;
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
                    var newWidth = Math.round(column.getActualWidth() * scale);
                    if (newWidth < column.getMinWidth()) {
                        column.setMinimum(source);
                        moveToNotSpread(column);
                        finishedResizing = false;
                    }
                    else if (column.isGreaterThanMax(newWidth)) {
                        column.setActualWidth(column.getMaxWidth(), source);
                        moveToNotSpread(column);
                        finishedResizing = false;
                    }
                    else {
                        var onLastCol = i === 0;
                        if (onLastCol) {
                            column.setActualWidth(pixelsForLastCol, source);
                        }
                        else {
                            column.setActualWidth(newWidth, source);
                        }
                    }
                    pixelsForLastCol -= newWidth;
                }
            }
        }
        this.setLeftValues(source);
        this.updateBodyWidths();
        colsToFireEventFor.forEach(function (column) {
            var event = {
                type: events_1.Events.EVENT_COLUMN_RESIZED,
                column: column,
                columns: [column],
                finished: true,
                api: _this.gridApi,
                columnApi: _this.columnApi,
                source: "sizeColumnsToFit"
            };
            _this.eventService.dispatchEvent(event);
        });
        function moveToNotSpread(column) {
            utils_1.Utils.removeFromArray(colsToSpread, column);
            colsToNotSpread.push(column);
        }
    };
    ColumnController.prototype.buildDisplayedTrees = function (visibleColumns) {
        var leftVisibleColumns = utils_1.Utils.filter(visibleColumns, function (column) {
            return column.getPinned() === 'left';
        });
        var rightVisibleColumns = utils_1.Utils.filter(visibleColumns, function (column) {
            return column.getPinned() === 'right';
        });
        var centerVisibleColumns = utils_1.Utils.filter(visibleColumns, function (column) {
            return column.getPinned() !== 'left' && column.getPinned() !== 'right';
        });
        var groupInstanceIdCreator = new groupInstanceIdCreator_1.GroupInstanceIdCreator();
        this.displayedLeftColumnTree = this.displayedGroupCreator.createDisplayedGroups(leftVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, this.displayedLeftColumnTree);
        this.displayedRightColumnTree = this.displayedGroupCreator.createDisplayedGroups(rightVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, this.displayedRightColumnTree);
        this.displayedCentreColumnTree = this.displayedGroupCreator.createDisplayedGroups(centerVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, this.displayedCentreColumnTree);
    };
    ColumnController.prototype.updateOpenClosedVisibilityInColumnGroups = function () {
        var allColumnGroups = this.getAllDisplayedColumnGroups();
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
        // see if we need to insert the default grouping column
        var needAutoColumns = (this.rowGroupColumns.length > 0 || this.usingTreeData)
            && !this.gridOptionsWrapper.isGroupSuppressAutoColumn()
            && !this.gridOptionsWrapper.isGroupUseEntireRow()
            && !this.gridOptionsWrapper.isGroupSuppressRow();
        if (needAutoColumns) {
            this.groupAutoColumns = this.autoGroupColService.createAutoGroupColumns(this.rowGroupColumns);
        }
        else {
            this.groupAutoColumns = null;
        }
    };
    ColumnController.prototype.createValueColumns = function (source) {
        this.valueColumns.forEach(function (column) { return column.setValueActive(false, source); });
        this.valueColumns = [];
        // override with columns that have the aggFunc specified explicitly
        for (var i = 0; i < this.primaryColumns.length; i++) {
            var column = this.primaryColumns[i];
            if (column.getColDef().aggFunc) {
                column.setAggFunc(column.getColDef().aggFunc);
                this.valueColumns.push(column);
                column.setValueActive(true, source);
            }
        }
    };
    ColumnController.prototype.getWidthOfColsInList = function (columnList) {
        var result = 0;
        for (var i = 0; i < columnList.length; i++) {
            result += columnList[i].getActualWidth();
        }
        return result;
    };
    ColumnController.prototype.getGridBalancedTree = function () {
        return this.gridBalancedTree;
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ColumnController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('expressionService'),
        __metadata("design:type", expressionService_1.ExpressionService)
    ], ColumnController.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('balancedColumnTreeBuilder'),
        __metadata("design:type", balancedColumnTreeBuilder_1.BalancedColumnTreeBuilder)
    ], ColumnController.prototype, "balancedColumnTreeBuilder", void 0);
    __decorate([
        context_1.Autowired('displayedGroupCreator'),
        __metadata("design:type", displayedGroupCreator_1.DisplayedGroupCreator)
    ], ColumnController.prototype, "displayedGroupCreator", void 0);
    __decorate([
        context_1.Autowired('autoWidthCalculator'),
        __metadata("design:type", autoWidthCalculator_1.AutoWidthCalculator)
    ], ColumnController.prototype, "autoWidthCalculator", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], ColumnController.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('columnUtils'),
        __metadata("design:type", columnUtils_1.ColumnUtils)
    ], ColumnController.prototype, "columnUtils", void 0);
    __decorate([
        context_1.Autowired('gridPanel'),
        __metadata("design:type", gridPanel_1.GridPanel)
    ], ColumnController.prototype, "gridPanel", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], ColumnController.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('columnAnimationService'),
        __metadata("design:type", columnAnimationService_1.ColumnAnimationService)
    ], ColumnController.prototype, "columnAnimationService", void 0);
    __decorate([
        context_1.Autowired('autoGroupColService'),
        __metadata("design:type", autoGroupColService_1.AutoGroupColService)
    ], ColumnController.prototype, "autoGroupColService", void 0);
    __decorate([
        context_1.Optional('aggFuncService'),
        __metadata("design:type", Object)
    ], ColumnController.prototype, "aggFuncService", void 0);
    __decorate([
        context_1.Optional('valueCache'),
        __metadata("design:type", valueCache_1.ValueCache)
    ], ColumnController.prototype, "valueCache", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], ColumnController.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], ColumnController.prototype, "gridApi", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ColumnController.prototype, "init", null);
    __decorate([
        __param(0, context_1.Qualifier('loggerFactory')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [logger_1.LoggerFactory]),
        __metadata("design:returntype", void 0)
    ], ColumnController.prototype, "setBeans", null);
    ColumnController = __decorate([
        context_1.Bean('columnController')
    ], ColumnController);
    return ColumnController;
}());
exports.ColumnController = ColumnController;
