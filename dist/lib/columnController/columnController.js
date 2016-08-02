/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.7
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var utils_1 = require("../utils");
var columnGroup_1 = require("../entities/columnGroup");
var column_1 = require("../entities/column");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var expressionService_1 = require("../expressionService");
var balancedColumnTreeBuilder_1 = require("./balancedColumnTreeBuilder");
var displayedGroupCreator_1 = require("./displayedGroupCreator");
var autoWidthCalculator_1 = require("../rendering/autoWidthCalculator");
var eventService_1 = require("../eventService");
var columnUtils_1 = require("./columnUtils");
var logger_1 = require("../logger");
var events_1 = require("../events");
var columnChangeEvent_1 = require("../columnChangeEvent");
var originalColumnGroup_1 = require("../entities/originalColumnGroup");
var groupInstanceIdCreator_1 = require("./groupInstanceIdCreator");
var functions_1 = require("../functions");
var context_1 = require("../context/context");
var gridPanel_1 = require("../gridPanel/gridPanel");
var ColumnApi = (function () {
    function ColumnApi() {
    }
    ColumnApi.prototype.sizeColumnsToFit = function (gridWidth) { this._columnController.sizeColumnsToFit(gridWidth); };
    ColumnApi.prototype.setColumnGroupOpened = function (group, newValue, instanceId) { this._columnController.setColumnGroupOpened(group, newValue, instanceId); };
    ColumnApi.prototype.getColumnGroup = function (name, instanceId) { return this._columnController.getColumnGroup(name, instanceId); };
    ColumnApi.prototype.getDisplayNameForCol = function (column) { return this._columnController.getDisplayNameForCol(column); };
    ColumnApi.prototype.getColumn = function (key) { return this._columnController.getPrimaryColumn(key); };
    ColumnApi.prototype.setColumnState = function (columnState) { return this._columnController.setColumnState(columnState); };
    ColumnApi.prototype.getColumnState = function () { return this._columnController.getColumnState(); };
    ColumnApi.prototype.resetColumnState = function () { this._columnController.resetColumnState(); };
    ColumnApi.prototype.isPinning = function () { return this._columnController.isPinningLeft() || this._columnController.isPinningRight(); };
    ColumnApi.prototype.isPinningLeft = function () { return this._columnController.isPinningLeft(); };
    ColumnApi.prototype.isPinningRight = function () { return this._columnController.isPinningRight(); };
    ColumnApi.prototype.getDisplayedColAfter = function (col) { return this._columnController.getDisplayedColAfter(col); };
    ColumnApi.prototype.getDisplayedColBefore = function (col) { return this._columnController.getDisplayedColBefore(col); };
    ColumnApi.prototype.setColumnVisible = function (key, visible) { this._columnController.setColumnVisible(key, visible); };
    ColumnApi.prototype.setColumnsVisible = function (keys, visible) { this._columnController.setColumnsVisible(keys, visible); };
    ColumnApi.prototype.setColumnPinned = function (key, pinned) { this._columnController.setColumnPinned(key, pinned); };
    ColumnApi.prototype.setColumnsPinned = function (keys, pinned) { this._columnController.setColumnsPinned(keys, pinned); };
    ColumnApi.prototype.getAllColumns = function () { return this._columnController.getAllPrimaryColumns(); };
    ColumnApi.prototype.getAllGridColumns = function () { return this._columnController.getAllGridColumns(); };
    ColumnApi.prototype.getDisplayedLeftColumns = function () { return this._columnController.getDisplayedLeftColumns(); };
    ColumnApi.prototype.getDisplayedCenterColumns = function () { return this._columnController.getDisplayedCenterColumns(); };
    ColumnApi.prototype.getDisplayedRightColumns = function () { return this._columnController.getDisplayedRightColumns(); };
    ColumnApi.prototype.getAllDisplayedColumns = function () { return this._columnController.getAllDisplayedColumns(); };
    ColumnApi.prototype.getAllDisplayedVirtualColumns = function () { return this._columnController.getAllDisplayedVirtualColumns(); };
    ColumnApi.prototype.moveColumn = function (fromIndex, toIndex) { this._columnController.moveColumnByIndex(fromIndex, toIndex); };
    ColumnApi.prototype.moveRowGroupColumn = function (fromIndex, toIndex) { this._columnController.moveRowGroupColumn(fromIndex, toIndex); };
    ColumnApi.prototype.setColumnAggFunct = function (column, aggFunc) { this._columnController.setColumnAggFunc(column, aggFunc); };
    ColumnApi.prototype.setColumnWidth = function (key, newWidth, finished) {
        if (finished === void 0) { finished = true; }
        this._columnController.setColumnWidth(key, newWidth, finished);
    };
    ColumnApi.prototype.setPivotMode = function (pivotMode) { this._columnController.setPivotMode(pivotMode); };
    ColumnApi.prototype.isPivotMode = function () { return this._columnController.isPivotMode(); };
    ColumnApi.prototype.getSecondaryPivotColumn = function (pivotKeys, valueColKey) { return this._columnController.getSecondaryPivotColumn(pivotKeys, valueColKey); };
    ColumnApi.prototype.getValueColumns = function () { return this._columnController.getValueColumns(); };
    ColumnApi.prototype.removeValueColumn = function (colKey) { this._columnController.removeValueColumn(colKey); };
    ColumnApi.prototype.removeValueColumns = function (colKeys) { this._columnController.removeValueColumns(colKeys); };
    ColumnApi.prototype.addValueColumn = function (colKey) { this._columnController.addValueColumn(colKey); };
    ColumnApi.prototype.addValueColumns = function (colKeys) { this._columnController.addValueColumns(colKeys); };
    ColumnApi.prototype.setRowGroupColumns = function (colKeys) { this._columnController.setRowGroupColumns(colKeys); };
    ColumnApi.prototype.removeRowGroupColumn = function (colKey) { this._columnController.removeRowGroupColumn(colKey); };
    ColumnApi.prototype.removeRowGroupColumns = function (colKeys) { this._columnController.removeRowGroupColumns(colKeys); };
    ColumnApi.prototype.addRowGroupColumn = function (colKey) { this._columnController.addRowGroupColumn(colKey); };
    ColumnApi.prototype.addRowGroupColumns = function (colKeys) { this._columnController.addRowGroupColumns(colKeys); };
    ColumnApi.prototype.getRowGroupColumns = function () { return this._columnController.getRowGroupColumns(); };
    ColumnApi.prototype.setPivotColumns = function (colKeys) { this._columnController.setPivotColumns(colKeys); };
    ColumnApi.prototype.removePivotColumn = function (colKey) { this._columnController.removePivotColumn(colKey); };
    ColumnApi.prototype.removePivotColumns = function (colKeys) { this._columnController.removePivotColumns(colKeys); };
    ColumnApi.prototype.addPivotColumn = function (colKey) { this._columnController.addPivotColumn(colKey); };
    ColumnApi.prototype.addPivotColumns = function (colKeys) { this._columnController.addPivotColumns(colKeys); };
    ColumnApi.prototype.getPivotColumns = function () { return this._columnController.getPivotColumns(); };
    ColumnApi.prototype.getLeftDisplayedColumnGroups = function () { return this._columnController.getLeftDisplayedColumnGroups(); };
    ColumnApi.prototype.getCenterDisplayedColumnGroups = function () { return this._columnController.getCenterDisplayedColumnGroups(); };
    ColumnApi.prototype.getRightDisplayedColumnGroups = function () { return this._columnController.getRightDisplayedColumnGroups(); };
    ColumnApi.prototype.getAllDisplayedColumnGroups = function () { return this._columnController.getAllDisplayedColumnGroups(); };
    ColumnApi.prototype.autoSizeColumn = function (key) { return this._columnController.autoSizeColumn(key); };
    ColumnApi.prototype.autoSizeColumns = function (keys) { return this._columnController.autoSizeColumns(keys); };
    ColumnApi.prototype.setSecondaryColumns = function (colDefs) { this._columnController.setSecondaryColumns(colDefs); };
    // below goes through deprecated items, prints message to user, then calls the new version of the same method
    ColumnApi.prototype.columnGroupOpened = function (group, newValue) {
        console.error('ag-Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
        this.setColumnGroupOpened(group, newValue);
    };
    ColumnApi.prototype.hideColumns = function (colIds, hide) {
        console.error('ag-Grid: hideColumns is deprecated, use setColumnsVisible');
        this._columnController.setColumnsVisible(colIds, !hide);
    };
    ColumnApi.prototype.hideColumn = function (colId, hide) {
        console.error('ag-Grid: hideColumn is deprecated, use setColumnVisible');
        this._columnController.setColumnVisible(colId, !hide);
    };
    ColumnApi.prototype.setState = function (columnState) {
        console.error('ag-Grid: setState is deprecated, use setColumnState');
        return this.setColumnState(columnState);
    };
    ColumnApi.prototype.getState = function () {
        console.error('ag-Grid: getState is deprecated, use getColumnState');
        return this.getColumnState();
    };
    ColumnApi.prototype.resetState = function () {
        console.error('ag-Grid: resetState is deprecated, use resetColumnState');
        this.resetColumnState();
    };
    ColumnApi.prototype.getAggregationColumns = function () {
        console.error('ag-Grid: getAggregationColumns is deprecated, use getValueColumns');
        return this._columnController.getValueColumns();
    };
    ColumnApi.prototype.removeAggregationColumn = function (colKey) {
        console.error('ag-Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this._columnController.removeValueColumn(colKey);
    };
    ColumnApi.prototype.removeAggregationColumns = function (colKeys) {
        console.error('ag-Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this._columnController.removeValueColumns(colKeys);
    };
    ColumnApi.prototype.addAggregationColumn = function (colKey) {
        console.error('ag-Grid: addAggregationColumn is deprecated, use addValueColumn');
        this._columnController.addValueColumn(colKey);
    };
    ColumnApi.prototype.addAggregationColumns = function (colKeys) {
        console.error('ag-Grid: addAggregationColumns is deprecated, use addValueColumns');
        this._columnController.addValueColumns(colKeys);
    };
    ColumnApi.prototype.setColumnAggFunction = function (column, aggFunc) {
        console.error('ag-Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this._columnController.setColumnAggFunc(column, aggFunc);
    };
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', ColumnController)
    ], ColumnApi.prototype, "_columnController", void 0);
    ColumnApi = __decorate([
        context_1.Bean('columnApi'), 
        __metadata('design:paramtypes', [])
    ], ColumnApi);
    return ColumnApi;
})();
exports.ColumnApi = ColumnApi;
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
        this.rowGroupColumns = [];
        this.valueColumns = [];
        this.pivotColumns = [];
        this.ready = false;
        this.pivotMode = false;
    }
    ColumnController.prototype.init = function () {
        this.pivotMode = this.gridOptionsWrapper.isPivotMode();
        if (this.gridOptionsWrapper.getColumnDefs()) {
            this.setColumnDefs(this.gridOptionsWrapper.getColumnDefs());
        }
    };
    ColumnController.prototype.setViewportLeftAndRight = function () {
        this.viewportLeft = this.scrollPosition;
        this.viewportRight = this.totalWidth + this.scrollPosition;
    };
    ColumnController.prototype.checkDisplayedCenterColumns = function () {
        // check displayCenterColumnTree exists first, as it won't exist when grid is initialising
        if (utils_1.Utils.exists(this.displayedCenterColumns)) {
            var hashBefore = this.allDisplayedVirtualColumns.map(function (column) { return column.getId(); }).join('#');
            this.updateVirtualSets();
            var hashAfter = this.allDisplayedVirtualColumns.map(function (column) { return column.getId(); }).join('#');
            if (hashBefore !== hashAfter) {
                this.eventService.dispatchEvent(events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED);
            }
        }
    };
    ColumnController.prototype.setWidthAndScrollPosition = function (totalWidth, scrollPosition) {
        if (totalWidth !== this.totalWidth || scrollPosition !== this.scrollPosition) {
            this.totalWidth = totalWidth;
            this.scrollPosition = scrollPosition;
            this.setViewportLeftAndRight();
            if (this.ready) {
                this.checkDisplayedCenterColumns();
            }
        }
    };
    ColumnController.prototype.isPivotMode = function () {
        return this.pivotMode;
    };
    ColumnController.prototype.setPivotMode = function (pivotMode) {
        if (pivotMode === this.pivotMode) {
            return;
        }
        this.pivotMode = pivotMode;
        this.updateDisplayedColumns();
        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED);
        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, event);
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
    ColumnController.prototype.setFirstRightAndLastLeftPinned = function () {
        var lastLeft = this.displayedLeftColumns ? this.displayedLeftColumns[this.displayedLeftColumns.length - 1] : null;
        var firstRight = this.displayedRightColumns ? this.displayedRightColumns[0] : null;
        this.gridColumns.forEach(function (column) {
            column.setLastLeftPinned(column === lastLeft);
            column.setFirstRightPinned(column === firstRight);
        });
    };
    ColumnController.prototype.autoSizeColumns = function (keys) {
        // because of column virtualisation, we can only do this function on columns that are
        // actually rendered, as non-rendered columns (outside the viewport and not rendered
        // due to column virtualisation) are not present. this can result in all rendered columns
        // getting narrowed, which in turn introduces more rendered columns on the RHS which
        // did not get autosized in the original run, leaving the visible grid with columns on
        // the LHS sized, but RHS no. so we keep looping through teh visible columns until
        // no more cols are available (rendered) to be resized
        var _this = this;
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
                    column.setActualWidth(newWidth);
                    columnsAutosized.push(column);
                    changesThisTimeAround++;
                }
                return true;
            }, function () {
                return new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_RESIZED).withFinished(true);
            });
        }
    };
    ColumnController.prototype.autoSizeColumn = function (key) {
        this.autoSizeColumns([key]);
    };
    ColumnController.prototype.autoSizeAllColumns = function () {
        var allDisplayedColumns = this.getAllDisplayedColumns();
        this.autoSizeColumns(allDisplayedColumns);
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
    // + rowRenderer
    ColumnController.prototype.getAllDisplayedVirtualColumns = function () {
        return this.allDisplayedVirtualColumns;
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
    ColumnController.prototype.addRowGroupColumns = function (keys, columnsToIncludeInEvent) {
        var _this = this;
        this.actionOnPrimaryColumns(keys, function (column) {
            if (!column.isRowGroupActive()) {
                _this.rowGroupColumns.push(column);
                column.setRowGroupActive(true);
                return true;
            }
            else {
                return false;
            }
        }, function () {
            return new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED);
        }, columnsToIncludeInEvent);
    };
    ColumnController.prototype.setRowGroupColumns = function (keys) {
        var updatedColumns = [];
        this.rowGroupColumns.forEach(function (column) {
            column.setRowGroupActive(false);
            updatedColumns.push(column);
        });
        this.rowGroupColumns.length = 0;
        this.addRowGroupColumns(keys, updatedColumns);
    };
    ColumnController.prototype.addRowGroupColumn = function (key) {
        this.addRowGroupColumns([key]);
    };
    ColumnController.prototype.removeRowGroupColumns = function (keys) {
        var _this = this;
        this.actionOnPrimaryColumns(keys, function (column) {
            if (column.isRowGroupActive()) {
                utils_1.Utils.removeFromArray(_this.rowGroupColumns, column);
                column.setRowGroupActive(false);
                return true;
            }
            else {
                return false;
            }
        }, function () {
            return new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED);
        });
    };
    ColumnController.prototype.removeRowGroupColumn = function (key) {
        this.removeRowGroupColumns([key]);
    };
    ColumnController.prototype.addPivotColumns = function (keys, columnsToIncludeInEvent) {
        var _this = this;
        this.actionOnPrimaryColumns(keys, function (column) {
            if (!column.isPivotActive()) {
                _this.pivotColumns.push(column);
                column.setPivotActive(true);
                return true;
            }
            else {
                return false;
            }
        }, function () {
            return new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_PIVOT_CHANGED);
        }, columnsToIncludeInEvent);
    };
    ColumnController.prototype.setPivotColumns = function (keys) {
        var updatedColumns = [];
        this.pivotColumns.forEach(function (column) {
            column.setPivotActive(false);
            updatedColumns.push(column);
        });
        this.pivotColumns.length = 0;
        this.addPivotColumns(keys, updatedColumns);
    };
    ColumnController.prototype.addPivotColumn = function (key) {
        this.addPivotColumns([key]);
    };
    ColumnController.prototype.removePivotColumns = function (keys) {
        var _this = this;
        this.actionOnPrimaryColumns(keys, function (column) {
            if (column.isPivotActive()) {
                utils_1.Utils.removeFromArray(_this.pivotColumns, column);
                column.setPivotActive(false);
                return true;
            }
            else {
                return false;
            }
        }, function () {
            return new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_PIVOT_CHANGED);
        });
    };
    ColumnController.prototype.removePivotColumn = function (key) {
        this.removePivotColumns([key]);
    };
    ColumnController.prototype.addValueColumns = function (keys) {
        var _this = this;
        this.actionOnPrimaryColumns(keys, function (column) {
            if (!column.isValueActive()) {
                if (!column.getAggFunc()) {
                    var defaultAggFunc = _this.aggFuncService.getDefaultAggFunc();
                    column.setAggFunc(defaultAggFunc);
                }
                _this.valueColumns.push(column);
                column.setValueActive(true);
                return true;
            }
            else {
                return false;
            }
        }, function () {
            return new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGED);
        });
    };
    ColumnController.prototype.addValueColumn = function (colKey) {
        this.addValueColumns([colKey]);
    };
    ColumnController.prototype.removeValueColumn = function (colKey) {
        this.removeValueColumns([colKey]);
    };
    ColumnController.prototype.removeValueColumns = function (keys) {
        var _this = this;
        this.actionOnPrimaryColumns(keys, function (column) {
            if (column.isValueActive()) {
                utils_1.Utils.removeFromArray(_this.valueColumns, column);
                column.setValueActive(false);
                return true;
            }
            else {
                return false;
            }
        }, function () {
            return new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGED);
        });
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
    ColumnController.prototype.setColumnWidth = function (key, newWidth, finished) {
        var column = this.getPrimaryOrGridColumn(key);
        if (!column) {
            return;
        }
        newWidth = this.normaliseColumnWidth(column, newWidth);
        var widthChanged = column.getActualWidth() !== newWidth;
        if (widthChanged) {
            column.setActualWidth(newWidth);
            this.setLeftValues();
        }
        // check for change first, to avoid unnecessary firing of events
        // however we always fire 'finished' events. this is important
        // when groups are resized, as if the group is changing slowly,
        // eg 1 pixel at a time, then each change will fire change events
        // in all the columns in the group, but only one with get the pixel.
        if (finished || widthChanged) {
            var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_RESIZED).withColumn(column).withFinished(finished);
            this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_RESIZED, event);
        }
        this.checkDisplayedCenterColumns();
    };
    ColumnController.prototype.setColumnAggFunc = function (column, aggFunc) {
        column.setAggFunc(aggFunc);
        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGED);
        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, event);
    };
    ColumnController.prototype.moveRowGroupColumn = function (fromIndex, toIndex) {
        var column = this.rowGroupColumns[fromIndex];
        this.rowGroupColumns.splice(fromIndex, 1);
        this.rowGroupColumns.splice(toIndex, 0, column);
        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED);
        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, event);
    };
    ColumnController.prototype.moveColumns = function (columnsToMoveKeys, toIndex) {
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
        this.gridPanel.turnOnAnimationForABit();
        utils_1.Utils.moveInArray(this.gridColumns, columnsToMove, toIndex);
        this.updateDisplayedColumns();
        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_MOVED)
            .withToIndex(toIndex)
            .withColumns(columnsToMove);
        if (columnsToMove.length === 1) {
            event.withColumn(columnsToMove[0]);
        }
        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_MOVED, event);
    };
    ColumnController.prototype.doesMovePassRules = function (columnsToMove, toIndex) {
        var allColumnsCopy = this.gridColumns.slice();
        utils_1.Utils.moveInArray(allColumnsCopy, columnsToMove, toIndex);
        // look for broken groups, ie stray columns from groups that should be married
        for (var index = 0; index < (allColumnsCopy.length - 1); index++) {
            var thisColumn = allColumnsCopy[index];
            var nextColumn = allColumnsCopy[index + 1];
            // skip hidden columns
            if (!nextColumn.isVisible()) {
                continue;
            }
            var thisPath = this.columnUtils.getOriginalPathForColumn(thisColumn, this.gridBalancedTree);
            var nextPath = this.columnUtils.getOriginalPathForColumn(nextColumn, this.gridBalancedTree);
            if (!nextPath || !thisPath) {
                console.log('next path is missing');
            }
            // start at the top of the path and work down
            for (var dept = 0; dept < thisPath.length; dept++) {
                var thisOriginalGroup = thisPath[dept];
                var nextOriginalGroup = nextPath[dept];
                var lastColInGroup = thisOriginalGroup !== nextOriginalGroup;
                // a runaway is a column from this group that left the group, and the group has it's children marked as married
                var colGroupDef = thisOriginalGroup.getColGroupDef();
                var marryChildren = colGroupDef && colGroupDef.marryChildren;
                var needToCheckForRunaways = lastColInGroup && marryChildren;
                if (needToCheckForRunaways) {
                    for (var tailIndex = index + 1; tailIndex < allColumnsCopy.length; tailIndex++) {
                        var tailColumn = allColumnsCopy[tailIndex];
                        var tailPath = this.columnUtils.getOriginalPathForColumn(tailColumn, this.gridBalancedTree);
                        var tailOriginalGroup = tailPath[dept];
                        if (tailOriginalGroup === thisOriginalGroup) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    };
    ColumnController.prototype.moveColumn = function (key, toIndex) {
        this.moveColumns([key], toIndex);
    };
    ColumnController.prototype.moveColumnByIndex = function (fromIndex, toIndex) {
        var column = this.gridColumns[fromIndex];
        this.moveColumn(column, toIndex);
    };
    // used by:
    // + angularGrid -> for setting body width
    // + rowController -> setting main row widths (when inserting and resizing)
    // need to cache this
    ColumnController.prototype.getBodyContainerWidth = function () {
        var result = this.getWidthOfColsInList(this.displayedCenterColumns);
        return result;
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
        return this.displayedCenterColumns.slice(0);
    };
    // + rowController -> while inserting rows
    ColumnController.prototype.getDisplayedLeftColumns = function () {
        return this.displayedLeftColumns.slice(0);
    };
    ColumnController.prototype.getDisplayedRightColumns = function () {
        return this.displayedRightColumns.slice(0);
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
    ColumnController.prototype.setColumnVisible = function (key, visible) {
        this.setColumnsVisible([key], visible);
    };
    ColumnController.prototype.setColumnsVisible = function (keys, visible) {
        this.gridPanel.turnOnAnimationForABit();
        this.actionOnGridColumns(keys, function (column) {
            column.setVisible(visible);
            return true;
        }, function () {
            return new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_VISIBLE).withVisible(visible);
        });
    };
    ColumnController.prototype.setColumnPinned = function (key, pinned) {
        this.setColumnsPinned([key], pinned);
    };
    ColumnController.prototype.setColumnsPinned = function (keys, pinned) {
        this.gridPanel.turnOnAnimationForABit();
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
        this.actionOnGridColumns(keys, function (column) {
            column.setPinned(actualPinned);
            return true;
        }, function () {
            return new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_PINNED).withPinned(actualPinned);
        });
    };
    ColumnController.prototype.actionOnGridColumns = function (keys, action, createEvent, columnsToIncludeInEvent) {
        this.actionOnColumns(keys, this.getGridColumn.bind(this), action, createEvent, columnsToIncludeInEvent);
    };
    ColumnController.prototype.actionOnPrimaryColumns = function (keys, action, createEvent, columnsToIncludeInEvent) {
        this.actionOnColumns(keys, this.getPrimaryColumn.bind(this), action, createEvent, columnsToIncludeInEvent);
    };
    // does an action on a set of columns. provides common functionality for looking up the
    // columns based on key, getting a list of effected columns, and then updated the event
    // with either one column (if it was just one col) or a list of columns
    // used by: autoResize, setVisible, setPinned
    ColumnController.prototype.actionOnColumns = function (// the column keys this action will be on
        keys, columnLookup, 
        // the action to do - if this returns false, the column was skipped
        // and won't be included in the event
        action, 
        // should return back a column event of the right type
        createEvent, columnsToIncludeInEvent) {
        if (utils_1.Utils.missingOrEmpty(keys) && utils_1.Utils.missingOrEmpty(columnsToIncludeInEvent)) {
            return;
        }
        var updatedColumns = [];
        keys.forEach(function (key) {
            var column = columnLookup(key);
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
        if (updatedColumns.length === 0 && utils_1.Utils.missingOrEmpty(columnsToIncludeInEvent)) {
            return;
        }
        if (utils_1.Utils.existsAndNotEmpty(columnsToIncludeInEvent)) {
            columnsToIncludeInEvent.forEach(function (column) {
                if (updatedColumns.indexOf(column) < 0) {
                    updatedColumns.push(column);
                }
            });
        }
        this.updateDisplayedColumns();
        var event = createEvent();
        event.withColumns(updatedColumns);
        if (updatedColumns.length === 1) {
            event.withColumn(updatedColumns[0]);
        }
        this.eventService.dispatchEvent(event.getType(), event);
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
        if (this.groupAutoColumnActive) {
            result.push(this.groupAutoColumn);
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
    ColumnController.prototype.resetColumnState = function () {
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
        this.setColumnState(state);
    };
    ColumnController.prototype.setColumnState = function (columnState) {
        var _this = this;
        if (utils_1.Utils.missingOrEmpty(this.primaryColumns)) {
            return false;
        }
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
                    _this.syncColumnWithStateItem(column, stateItem, rowGroupIndexes, pivotIndexes);
                    utils_1.Utils.removeFromArray(columnsWithNoState, column);
                }
            });
        }
        // anything left over, we got no data for, so add in the column as non-value, non-rowGroup and hidden
        columnsWithNoState.forEach(this.syncColumnWithNoState.bind(this));
        // sort the lists according to the indexes that were provided
        this.rowGroupColumns.sort(this.sortColumnListUsingIndexes.bind(this, rowGroupIndexes));
        this.pivotColumns.sort(this.sortColumnListUsingIndexes.bind(this, pivotIndexes));
        this.copyDownGridColumns();
        var orderOfColIds = columnState.map(function (stateItem) { return stateItem.colId; });
        this.gridColumns.sort(function (colA, colB) {
            var indexA = orderOfColIds.indexOf(colA.getId());
            var indexB = orderOfColIds.indexOf(colB.getId());
            return indexA - indexB;
        });
        this.updateDisplayedColumns();
        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED);
        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, event);
        return success;
    };
    ColumnController.prototype.sortColumnListUsingIndexes = function (indexes, colA, colB) {
        var indexA = indexes[colA.getId()];
        var indexB = indexes[colB.getId()];
        return indexA - indexB;
    };
    ColumnController.prototype.syncColumnWithNoState = function (column) {
        column.setVisible(false);
        column.setAggFunc(null);
        column.setPinned(null);
        column.setRowGroupActive(false);
        column.setPivotActive(false);
        column.setValueActive(false);
    };
    ColumnController.prototype.syncColumnWithStateItem = function (column, stateItem, rowGroupIndexes, pivotIndexes) {
        // following ensures we are left with boolean true or false, eg converts (null, undefined, 0) all to true
        column.setVisible(!stateItem.hide);
        // sets pinned to 'left' or 'right'
        column.setPinned(stateItem.pinned);
        // if width provided and valid, use it, otherwise stick with the old width
        if (stateItem.width >= this.gridOptionsWrapper.getMinColWidth()) {
            column.setActualWidth(stateItem.width);
        }
        if (typeof stateItem.aggFunc === 'string') {
            column.setAggFunc(stateItem.aggFunc);
            column.setValueActive(true);
            this.valueColumns.push(column);
        }
        else {
            column.setAggFunc(null);
            column.setValueActive(false);
        }
        if (typeof stateItem.rowGroupIndex === 'number') {
            this.rowGroupColumns.push(column);
            column.setRowGroupActive(true);
            rowGroupIndexes[column.getId()] = stateItem.rowGroupIndex;
        }
        else {
            column.setRowGroupActive(false);
        }
        if (typeof stateItem.pivotIndex === 'number') {
            this.pivotColumns.push(column);
            column.setPivotActive(true);
            pivotIndexes[column.getId()] = stateItem.pivotIndex;
        }
        else {
            column.setPivotActive(false);
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
            if (colMatches(columnList[i])) {
                return columnList[i];
            }
        }
        if (this.groupAutoColumnActive && colMatches(this.groupAutoColumn)) {
            return this.groupAutoColumn;
        }
        function colMatches(column) {
            var columnMatches = column === key;
            var colDefMatches = column.getColDef() === key;
            var idMatches = column.getColId() === key;
            return columnMatches || colDefMatches || idMatches;
        }
        return null;
    };
    ColumnController.prototype.getDisplayNameForCol = function (column, includeAggFunc) {
        if (includeAggFunc === void 0) { includeAggFunc = false; }
        var headerName = this.getHeaderName(column);
        if (includeAggFunc) {
            return this.wrapHeaderNameWithAggFunc(column, headerName);
        }
        else {
            return headerName;
        }
    };
    ColumnController.prototype.getHeaderName = function (column) {
        var colDef = column.getColDef();
        var headerValueGetter = colDef.headerValueGetter;
        if (headerValueGetter) {
            var params = {
                colDef: colDef,
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
        else {
            return colDef.headerName;
        }
    };
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
            return aggFuncString + "(" + headerName + ")";
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
        this.columnUtils.deptFirstAllColumnTreeSearch(allColumnGroups, function (child) {
            if (child instanceof columnGroup_1.ColumnGroup) {
                var columnGroup = child;
                var matched;
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
    ColumnController.prototype.setColumnDefs = function (columnDefs) {
        var balancedTreeResult = this.balancedColumnTreeBuilder.createBalancedColumnGroups(columnDefs, true);
        this.primaryBalancedTree = balancedTreeResult.balancedTree;
        this.primaryHeaderRowCount = balancedTreeResult.treeDept + 1;
        this.primaryColumns = this.getColumnsFromTree(this.primaryBalancedTree);
        this.extractRowGroupColumns();
        this.extractPivotColumns();
        this.createValueColumns();
        this.copyDownGridColumns();
        this.updateDisplayedColumns();
        this.ready = true;
        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED);
        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, event);
        this.eventService.dispatchEvent(events_1.Events.EVENT_NEW_COLUMNS_LOADED);
    };
    ColumnController.prototype.isReady = function () {
        return this.ready;
    };
    ColumnController.prototype.extractRowGroupColumns = function () {
        var _this = this;
        this.rowGroupColumns.forEach(function (column) { return column.setRowGroupActive(false); });
        this.rowGroupColumns = [];
        // pull out the columns
        this.primaryColumns.forEach(function (column) {
            if (typeof column.getColDef().rowGroupIndex === 'number') {
                _this.rowGroupColumns.push(column);
                column.setRowGroupActive(true);
            }
        });
        // then sort them
        this.rowGroupColumns.sort(function (colA, colB) {
            return colA.getColDef().rowGroupIndex - colB.getColDef().rowGroupIndex;
        });
    };
    ColumnController.prototype.extractPivotColumns = function () {
        var _this = this;
        this.pivotColumns.forEach(function (column) { return column.setPivotActive(false); });
        this.pivotColumns = [];
        // pull out the columns
        this.primaryColumns.forEach(function (column) {
            if (typeof column.getColDef().pivotIndex === 'number') {
                _this.pivotColumns.push(column);
                column.setPivotActive(true);
            }
        });
        // then sort them
        this.pivotColumns.sort(function (colA, colB) {
            return colA.getColDef().pivotIndex - colB.getColDef().pivotIndex;
        });
    };
    // called by headerRenderer - when a header is opened or closed
    ColumnController.prototype.setColumnGroupOpened = function (passedGroup, newValue, instanceId) {
        var groupToUse = this.getColumnGroup(passedGroup, instanceId);
        if (!groupToUse) {
            return;
        }
        this.logger.log('columnGroupOpened(' + groupToUse.getGroupId() + ',' + newValue + ')');
        groupToUse.setExpanded(newValue);
        this.gridPanel.turnOnAnimationForABit();
        this.updateGroupsAndDisplayedColumns();
        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_GROUP_OPENED).withColumnGroup(groupToUse);
        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_GROUP_OPENED, event);
    };
    // used by updateModel
    ColumnController.prototype.getColumnGroupState = function () {
        var groupState = {};
        this.columnUtils.deptFirstDisplayedColumnTreeSearch(this.getAllDisplayedColumnGroups(), function (child) {
            if (child instanceof columnGroup_1.ColumnGroup) {
                var columnGroup = child;
                var key = columnGroup.getGroupId();
                // if more than one instance of the group, we only record the state of the first item
                if (!groupState.hasOwnProperty(key)) {
                    groupState[key] = columnGroup.isExpanded();
                }
            }
        });
        return groupState;
    };
    // used by updateModel
    ColumnController.prototype.setColumnGroupState = function (groupState) {
        this.columnUtils.deptFirstDisplayedColumnTreeSearch(this.getAllDisplayedColumnGroups(), function (child) {
            if (child instanceof columnGroup_1.ColumnGroup) {
                var columnGroup = child;
                var key = columnGroup.getGroupId();
                var shouldExpandGroup = groupState[key] === true && columnGroup.isExpandable();
                if (shouldExpandGroup) {
                    columnGroup.setExpanded(true);
                }
            }
        });
    };
    ColumnController.prototype.calculateColumnsForDisplay = function () {
        var columnsForDisplay;
        if (this.pivotMode && !this.secondaryColumnsPresent) {
            // pivot mode is on, but we are not pivoting, so we only
            // show columns we are aggregating on
            columnsForDisplay = this.valueColumns.slice();
        }
        else {
            // otherwise continue as normal. this can be working on the primary
            // or secondary columns, whatever the gridColumns are set to
            columnsForDisplay = utils_1.Utils.filter(this.gridColumns, function (column) { return column.isVisible(); });
        }
        this.createGroupAutoColumn();
        if (this.groupAutoColumnActive) {
            columnsForDisplay.unshift(this.groupAutoColumn);
        }
        return columnsForDisplay;
    };
    ColumnController.prototype.updateDisplayedColumns = function () {
        // save opened / closed state
        var oldGroupState = this.getColumnGroupState();
        var columnsForDisplay = this.calculateColumnsForDisplay();
        this.buildDisplayedTrees(columnsForDisplay);
        // restore opened / closed state
        this.setColumnGroupState(oldGroupState);
        // this is also called when a group is opened or closed
        this.updateGroupsAndDisplayedColumns();
        this.setFirstRightAndLastLeftPinned();
    };
    ColumnController.prototype.isSecondaryColumnsPresent = function () {
        return this.secondaryColumnsPresent;
    };
    ColumnController.prototype.setSecondaryColumns = function (colDefs) {
        var newColsPresent = colDefs && colDefs.length > 0;
        // if not cols passed, and we had to cols anyway, then do nothing
        if (!newColsPresent && !this.secondaryColumnsPresent) {
            return;
        }
        if (newColsPresent) {
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
        this.copyDownGridColumns();
        this.updateDisplayedColumns();
    };
    // called from: setColumnState, setColumnDefs, setAlternativeColumnDefs
    ColumnController.prototype.copyDownGridColumns = function () {
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
        this.clearDisplayedColumns();
        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_GRID_COLUMNS_CHANGED);
        this.eventService.dispatchEvent(events_1.Events.EVENT_GRID_COLUMNS_CHANGED, event);
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
    ColumnController.prototype.updateGroupsAndDisplayedColumns = function () {
        this.updateGroups();
        this.updateDisplayedColumnsFromTrees();
        this.updateVirtualSets();
        // this event is picked up by the gui, headerRenderer and rowRenderer, to recalculate what columns to display
        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED);
        this.eventService.dispatchEvent(events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, event);
    };
    ColumnController.prototype.updateDisplayedColumnsFromTrees = function () {
        this.addToDisplayedColumns(this.displayedLeftColumnTree, this.displayedLeftColumns);
        this.addToDisplayedColumns(this.displayedCentreColumnTree, this.displayedCenterColumns);
        this.addToDisplayedColumns(this.displayedRightColumnTree, this.displayedRightColumns);
        // order we add the arrays together is important, so the result
        // has the columns left to right, as they appear on the screen.
        this.allDisplayedColumns = this.displayedLeftColumns
            .concat(this.displayedCenterColumns)
            .concat(this.displayedRightColumns);
        this.setLeftValues();
    };
    // sets the left pixel position of each column
    ColumnController.prototype.setLeftValues = function () {
        this.setLeftValuesOfColumns();
        this.setLeftValuesOfGroups();
    };
    ColumnController.prototype.setLeftValuesOfColumns = function () {
        // go through each list of displayed columns
        var allColumns = this.primaryColumns.slice(0);
        [this.displayedLeftColumns, this.displayedRightColumns, this.displayedCenterColumns].forEach(function (columns) {
            var left = 0;
            columns.forEach(function (column) {
                column.setLeft(left);
                left += column.getActualWidth();
                utils_1.Utils.removeFromArray(allColumns, column);
            });
        });
        // items left in allColumns are columns not displayed, so remove the left position. this is
        // important for the rows, as if a col is made visible, then taken out, then made visible again,
        // we don't want the animation of the cell floating in from the old position, whatever that was.
        allColumns.forEach(function (column) {
            column.setLeft(null);
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
        this.columnUtils.deptFirstDisplayedColumnTreeSearch(displayedColumnTree, function (child) {
            if (child instanceof column_1.Column) {
                displayedColumns.push(child);
            }
        });
    };
    ColumnController.prototype.updateDisplayedCenterVirtualColumns = function () {
        var filteredCenterColumns;
        var skipVirtualisation = this.gridOptionsWrapper.isSuppressColumnVirtualisation() || this.gridOptionsWrapper.isForPrint();
        if (skipVirtualisation) {
            // no virtualisation, so don't filter
            filteredCenterColumns = this.displayedCenterColumns;
        }
        else {
            // filter out what should be visible
            filteredCenterColumns = this.filterOutColumnsWithinViewport(this.displayedCenterColumns);
        }
        this.allDisplayedVirtualColumns = filteredCenterColumns
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
                var addThisItem;
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
    ColumnController.prototype.filterOutColumnsWithinViewport = function (columns) {
        var _this = this;
        var result = utils_1.Utils.filter(columns, function (column) {
            // only out if both sides of columns are to the left or to the right of the boundary
            var columnLeft = column.getLeft();
            var columnRight = column.getLeft() + column.getActualWidth();
            var columnToMuchLeft = columnLeft < _this.viewportLeft && columnRight < _this.viewportLeft;
            var columnToMuchRight = columnLeft > _this.viewportRight && columnRight > _this.viewportRight;
            var includeThisCol = !columnToMuchLeft && !columnToMuchRight;
            return includeThisCol;
        });
        return result;
    };
    // called from api
    ColumnController.prototype.sizeColumnsToFit = function (gridWidth) {
        var _this = this;
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
            var availablePixels = gridWidth - getTotalWidth(colsToNotSpread);
            if (availablePixels <= 0) {
                // no width, set everything to minimum
                colsToSpread.forEach(function (column) {
                    column.setMinimum();
                });
            }
            else {
                var scale = availablePixels / getTotalWidth(colsToSpread);
                // we set the pixels for the last col based on what's left, as otherwise
                // we could be a pixel or two short or extra because of rounding errors.
                var pixelsForLastCol = availablePixels;
                // backwards through loop, as we are removing items as we go
                for (var i = colsToSpread.length - 1; i >= 0; i--) {
                    var column = colsToSpread[i];
                    var newWidth = Math.round(column.getActualWidth() * scale);
                    if (newWidth < column.getMinWidth()) {
                        column.setMinimum();
                        moveToNotSpread(column);
                        finishedResizing = false;
                    }
                    else if (column.isGreaterThanMax(newWidth)) {
                        column.setActualWidth(column.getMaxWidth());
                        moveToNotSpread(column);
                        finishedResizing = false;
                    }
                    else {
                        var onLastCol = i === 0;
                        if (onLastCol) {
                            column.setActualWidth(pixelsForLastCol);
                        }
                        else {
                            pixelsForLastCol -= newWidth;
                            column.setActualWidth(newWidth);
                        }
                    }
                }
            }
        }
        this.setLeftValues();
        // widths set, refresh the gui
        colsToFireEventFor.forEach(function (column) {
            var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_RESIZED).withColumn(column);
            _this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_RESIZED, event);
        });
        this.checkDisplayedCenterColumns();
        function moveToNotSpread(column) {
            utils_1.Utils.removeFromArray(colsToSpread, column);
            colsToNotSpread.push(column);
        }
        function getTotalWidth(columns) {
            var result = 0;
            for (var i = 0; i < columns.length; i++) {
                result += columns[i].getActualWidth();
            }
            return result;
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
        this.displayedLeftColumnTree = this.displayedGroupCreator.createDisplayedGroups(leftVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator);
        this.displayedRightColumnTree = this.displayedGroupCreator.createDisplayedGroups(rightVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator);
        this.displayedCentreColumnTree = this.displayedGroupCreator.createDisplayedGroups(centerVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator);
    };
    ColumnController.prototype.updateGroups = function () {
        var allGroups = this.getAllDisplayedColumnGroups();
        this.columnUtils.deptFirstAllColumnTreeSearch(allGroups, function (child) {
            if (child instanceof columnGroup_1.ColumnGroup) {
                var group = child;
                group.calculateDisplayedColumns();
            }
        });
    };
    ColumnController.prototype.createGroupAutoColumn = function () {
        // see if we need to insert the default grouping column
        var needAGroupColumn = this.rowGroupColumns.length > 0
            && !this.gridOptionsWrapper.isGroupSuppressAutoColumn()
            && !this.gridOptionsWrapper.isGroupUseEntireRow()
            && !this.gridOptionsWrapper.isGroupSuppressRow();
        this.groupAutoColumnActive = needAGroupColumn;
        // lazy create group auto-column
        if (needAGroupColumn && !this.groupAutoColumn) {
            // if one provided by user, use it, otherwise create one
            var autoColDef = this.gridOptionsWrapper.getGroupColumnDef();
            if (!autoColDef) {
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                autoColDef = {
                    headerName: localeTextFunc('group', 'Group'),
                    comparator: functions_1.defaultGroupComparator,
                    valueGetter: function (params) {
                        if (params.node.group) {
                            return params.node.key;
                        }
                        else if (params.data && params.colDef.field) {
                            return params.data[params.colDef.field];
                        }
                        else {
                            return null;
                        }
                    },
                    cellRenderer: 'group'
                };
            }
            // we never allow moving the group column
            autoColDef.suppressMovable = true;
            var colId = 'ag-Grid-AutoColumn';
            this.groupAutoColumn = new column_1.Column(autoColDef, colId, true);
            this.context.wireBean(this.groupAutoColumn);
        }
    };
    ColumnController.prototype.createValueColumns = function () {
        this.valueColumns.forEach(function (column) { return column.setValueActive(false); });
        this.valueColumns = [];
        // override with columns that have the aggFunc specified explicitly
        for (var i = 0; i < this.primaryColumns.length; i++) {
            var column = this.primaryColumns[i];
            if (column.getColDef().aggFunc) {
                column.setAggFunc(column.getColDef().aggFunc);
                this.valueColumns.push(column);
                column.setValueActive(true);
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
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], ColumnController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('expressionService'), 
        __metadata('design:type', expressionService_1.ExpressionService)
    ], ColumnController.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('balancedColumnTreeBuilder'), 
        __metadata('design:type', balancedColumnTreeBuilder_1.BalancedColumnTreeBuilder)
    ], ColumnController.prototype, "balancedColumnTreeBuilder", void 0);
    __decorate([
        context_1.Autowired('displayedGroupCreator'), 
        __metadata('design:type', displayedGroupCreator_1.DisplayedGroupCreator)
    ], ColumnController.prototype, "displayedGroupCreator", void 0);
    __decorate([
        context_1.Autowired('autoWidthCalculator'), 
        __metadata('design:type', autoWidthCalculator_1.AutoWidthCalculator)
    ], ColumnController.prototype, "autoWidthCalculator", void 0);
    __decorate([
        context_1.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], ColumnController.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('columnUtils'), 
        __metadata('design:type', columnUtils_1.ColumnUtils)
    ], ColumnController.prototype, "columnUtils", void 0);
    __decorate([
        context_1.Autowired('gridPanel'), 
        __metadata('design:type', gridPanel_1.GridPanel)
    ], ColumnController.prototype, "gridPanel", void 0);
    __decorate([
        context_1.Autowired('context'), 
        __metadata('design:type', context_1.Context)
    ], ColumnController.prototype, "context", void 0);
    __decorate([
        context_1.Optional('aggFuncService'), 
        __metadata('design:type', Object)
    ], ColumnController.prototype, "aggFuncService", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ColumnController.prototype, "init", null);
    __decorate([
        __param(0, context_1.Qualifier('loggerFactory')), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
        __metadata('design:returntype', void 0)
    ], ColumnController.prototype, "setBeans", null);
    ColumnController = __decorate([
        context_1.Bean('columnController'), 
        __metadata('design:paramtypes', [])
    ], ColumnController);
    return ColumnController;
})();
exports.ColumnController = ColumnController;
