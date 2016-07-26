/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.4
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
var eventService_1 = require("../eventService");
var utils_1 = require("../utils");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnUtils_1 = require("../columnController/columnUtils");
// Wrapper around a user provide column definition. The grid treats the column definition as ready only.
// This class contains all the runtime information about a column, plus some logic (the definition has no logic).
// This class implements both interfaces ColumnGroupChild and OriginalColumnGroupChild as the class can
// appear as a child of either the original tree or the displayed tree. However the relevant group classes
// for each type only implements one, as each group can only appear in it's associated tree (eg OriginalColumnGroup
// can only appear in OriginalColumn tree).
var Column = (function () {
    function Column(colDef, colId, primary) {
        this.moving = false;
        this.filterActive = false;
        this.eventService = new eventService_1.EventService();
        this.rowGroupActive = false;
        this.pivotActive = false;
        this.aggregationActive = false;
        this.colDef = colDef;
        this.visible = !colDef.hide;
        this.sort = colDef.sort;
        this.sortedAt = colDef.sortedAt;
        this.colId = colId;
        this.primary = primary;
    }
    // this is done after constructor as it uses gridOptionsWrapper
    Column.prototype.initialise = function () {
        this.setPinned(this.colDef.pinned);
        var minColWidth = this.gridOptionsWrapper.getMinColWidth();
        var maxColWidth = this.gridOptionsWrapper.getMaxColWidth();
        if (this.colDef.minWidth) {
            this.minWidth = this.colDef.minWidth;
        }
        else {
            this.minWidth = minColWidth;
        }
        if (this.colDef.maxWidth) {
            this.maxWidth = this.colDef.maxWidth;
        }
        else {
            this.maxWidth = maxColWidth;
        }
        this.actualWidth = this.columnUtils.calculateColInitialWidth(this.colDef);
        var suppressDotNotation = this.gridOptionsWrapper.isSuppressFieldDotNotation();
        this.fieldContainsDots = utils_1.Utils.exists(this.colDef.field) && this.colDef.field.indexOf('.') >= 0 && !suppressDotNotation;
        this.validate();
    };
    Column.prototype.getUniqueId = function () {
        return this.getId();
    };
    Column.prototype.isPrimary = function () {
        return this.primary;
    };
    Column.prototype.isFilterAllowed = function () {
        return this.primary && !this.colDef.suppressFilter;
    };
    Column.prototype.isFieldContainsDots = function () {
        return this.fieldContainsDots;
    };
    Column.prototype.validate = function () {
        if (!this.gridOptionsWrapper.isEnterprise()) {
            if (utils_1.Utils.exists(this.colDef.aggFunc)) {
                console.warn('ag-Grid: aggFunc is only valid in ag-Grid-Enterprise');
            }
            if (utils_1.Utils.exists(this.colDef.rowGroupIndex)) {
                console.warn('ag-Grid: rowGroupIndex is only valid in ag-Grid-Enterprise');
            }
        }
        if (utils_1.Utils.exists(this.colDef.width) && typeof this.colDef.width !== 'number') {
            console.warn('ag-Grid: colDef.width should be a number, not ' + typeof this.colDef.width);
        }
    };
    Column.prototype.addEventListener = function (eventType, listener) {
        this.eventService.addEventListener(eventType, listener);
    };
    Column.prototype.removeEventListener = function (eventType, listener) {
        this.eventService.removeEventListener(eventType, listener);
    };
    Column.prototype.isCellEditable = function (rowNode) {
        // if boolean set, then just use it
        if (typeof this.colDef.editable === 'boolean') {
            return this.colDef.editable;
        }
        // if function, then call the function to find out
        if (typeof this.colDef.editable === 'function') {
            var params = {
                node: rowNode,
                column: this,
                colDef: this.colDef,
                context: this.gridOptionsWrapper.getContext(),
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi()
            };
            var editableFunc = this.colDef.editable;
            return editableFunc(params);
        }
        return false;
    };
    Column.prototype.setMoving = function (moving) {
        this.moving = moving;
        this.eventService.dispatchEvent(Column.EVENT_MOVING_CHANGED);
    };
    Column.prototype.isMoving = function () {
        return this.moving;
    };
    Column.prototype.getSort = function () {
        return this.sort;
    };
    Column.prototype.setSort = function (sort) {
        if (this.sort !== sort) {
            this.sort = sort;
            this.eventService.dispatchEvent(Column.EVENT_SORT_CHANGED);
        }
    };
    Column.prototype.isSortAscending = function () {
        return this.sort === Column.SORT_ASC;
    };
    Column.prototype.isSortDescending = function () {
        return this.sort === Column.SORT_DESC;
    };
    Column.prototype.isSortNone = function () {
        return utils_1.Utils.missing(this.sort);
    };
    Column.prototype.getSortedAt = function () {
        return this.sortedAt;
    };
    Column.prototype.setSortedAt = function (sortedAt) {
        this.sortedAt = sortedAt;
    };
    Column.prototype.setAggFunc = function (aggFunc) {
        this.aggFunc = aggFunc;
    };
    Column.prototype.getAggFunc = function () {
        return this.aggFunc;
    };
    Column.prototype.getLeft = function () {
        return this.left;
    };
    Column.prototype.getRight = function () {
        return this.left + this.actualWidth;
    };
    Column.prototype.setLeft = function (left) {
        if (this.left !== left) {
            this.left = left;
            this.eventService.dispatchEvent(Column.EVENT_LEFT_CHANGED);
        }
    };
    Column.prototype.isFilterActive = function () {
        return this.filterActive;
    };
    Column.prototype.setFilterActive = function (active) {
        if (this.filterActive !== active) {
            this.filterActive = active;
            this.eventService.dispatchEvent(Column.EVENT_FILTER_ACTIVE_CHANGED);
        }
    };
    Column.prototype.setPinned = function (pinned) {
        // pinning is not allowed when doing 'forPrint'
        if (this.gridOptionsWrapper.isForPrint()) {
            return;
        }
        if (pinned === true || pinned === Column.PINNED_LEFT) {
            this.pinned = Column.PINNED_LEFT;
        }
        else if (pinned === Column.PINNED_RIGHT) {
            this.pinned = Column.PINNED_RIGHT;
        }
        else {
            this.pinned = null;
        }
        // console.log(`setColumnsPinned ${this.getColId()} ${this.pinned}`);
    };
    Column.prototype.setFirstRightPinned = function (firstRightPinned) {
        if (this.firstRightPinned !== firstRightPinned) {
            this.firstRightPinned = firstRightPinned;
            this.eventService.dispatchEvent(Column.EVENT_FIRST_RIGHT_PINNED_CHANGED);
        }
    };
    Column.prototype.setLastLeftPinned = function (lastLeftPinned) {
        if (this.lastLeftPinned !== lastLeftPinned) {
            this.lastLeftPinned = lastLeftPinned;
            this.eventService.dispatchEvent(Column.EVENT_LAST_LEFT_PINNED_CHANGED);
        }
    };
    Column.prototype.isFirstRightPinned = function () {
        return this.firstRightPinned;
    };
    Column.prototype.isLastLeftPinned = function () {
        return this.lastLeftPinned;
    };
    Column.prototype.isPinned = function () {
        return this.pinned === Column.PINNED_LEFT || this.pinned === Column.PINNED_RIGHT;
    };
    Column.prototype.isPinnedLeft = function () {
        return this.pinned === Column.PINNED_LEFT;
    };
    Column.prototype.isPinnedRight = function () {
        return this.pinned === Column.PINNED_RIGHT;
    };
    Column.prototype.getPinned = function () {
        return this.pinned;
    };
    Column.prototype.setVisible = function (visible) {
        var newValue = visible === true;
        if (this.visible !== newValue) {
            this.visible = newValue;
            this.eventService.dispatchEvent(Column.EVENT_VISIBLE_CHANGED);
        }
    };
    Column.prototype.isVisible = function () {
        return this.visible;
    };
    Column.prototype.getColDef = function () {
        return this.colDef;
    };
    Column.prototype.getColumnGroupShow = function () {
        return this.colDef.columnGroupShow;
    };
    Column.prototype.getColId = function () {
        return this.colId;
    };
    Column.prototype.getId = function () {
        return this.getColId();
    };
    Column.prototype.getDefinition = function () {
        return this.colDef;
    };
    Column.prototype.getActualWidth = function () {
        return this.actualWidth;
    };
    Column.prototype.setActualWidth = function (actualWidth) {
        if (this.actualWidth !== actualWidth) {
            this.actualWidth = actualWidth;
            this.eventService.dispatchEvent(Column.EVENT_WIDTH_CHANGED);
        }
    };
    Column.prototype.isGreaterThanMax = function (width) {
        if (this.maxWidth) {
            return width > this.maxWidth;
        }
        else {
            return false;
        }
    };
    Column.prototype.getMinWidth = function () {
        return this.minWidth;
    };
    Column.prototype.getMaxWidth = function () {
        return this.maxWidth;
    };
    Column.prototype.setMinimum = function () {
        this.setActualWidth(this.minWidth);
    };
    Column.prototype.setRowGroupActive = function (rowGroup) {
        if (this.rowGroupActive !== rowGroup) {
            this.rowGroupActive = rowGroup;
            this.eventService.dispatchEvent(Column.EVENT_ROW_GROUP_CHANGED, this);
        }
    };
    Column.prototype.isRowGroupActive = function () {
        return this.rowGroupActive;
    };
    Column.prototype.setPivotActive = function (pivot) {
        if (this.pivotActive !== pivot) {
            this.pivotActive = pivot;
            this.eventService.dispatchEvent(Column.EVENT_PIVOT_CHANGED, this);
        }
    };
    Column.prototype.isPivotActive = function () {
        return this.pivotActive;
    };
    Column.prototype.isAnyFunctionActive = function () {
        return this.isPivotActive() || this.isRowGroupActive() || this.isValueActive();
    };
    Column.prototype.isAnyFunctionAllowed = function () {
        return this.isAllowPivot() || this.isAllowRowGroup() || this.isAllowValue();
    };
    Column.prototype.setValueActive = function (value) {
        if (this.aggregationActive !== value) {
            this.aggregationActive = value;
            this.eventService.dispatchEvent(Column.EVENT_VALUE_CHANGED, this);
        }
    };
    Column.prototype.isValueActive = function () {
        return this.aggregationActive;
    };
    Column.prototype.isAllowPivot = function () {
        return this.colDef.enablePivot === true;
    };
    Column.prototype.isAllowValue = function () {
        return this.colDef.enableValue === true;
    };
    Column.prototype.isAllowRowGroup = function () {
        return this.colDef.enableRowGroup === true;
    };
    // + renderedHeaderCell - for making header cell transparent when moving
    Column.EVENT_MOVING_CHANGED = 'movingChanged';
    // + renderedCell - changing left position
    Column.EVENT_LEFT_CHANGED = 'leftChanged';
    // + renderedCell - changing width
    Column.EVENT_WIDTH_CHANGED = 'widthChanged';
    // + renderedCell - for changing pinned classes
    Column.EVENT_LAST_LEFT_PINNED_CHANGED = 'lastLeftPinnedChanged';
    Column.EVENT_FIRST_RIGHT_PINNED_CHANGED = 'firstRightPinnedChanged';
    // + renderedColumn - for changing visibility icon
    Column.EVENT_VISIBLE_CHANGED = 'visibleChanged';
    // + renderedHeaderCell - marks the header with filter icon
    Column.EVENT_FILTER_ACTIVE_CHANGED = 'filterChanged';
    // + renderedHeaderCell - marks the header with sort icon
    Column.EVENT_SORT_CHANGED = 'filterChanged';
    // + toolpanel, for gui updates
    Column.EVENT_ROW_GROUP_CHANGED = 'columnRowGroupChanged';
    // + toolpanel, for gui updates
    Column.EVENT_PIVOT_CHANGED = 'columnPivotChanged';
    // + toolpanel, for gui updates
    Column.EVENT_VALUE_CHANGED = 'columnValueChanged';
    Column.PINNED_RIGHT = 'right';
    Column.PINNED_LEFT = 'left';
    Column.SORT_ASC = 'asc';
    Column.SORT_DESC = 'desc';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], Column.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnUtils'), 
        __metadata('design:type', columnUtils_1.ColumnUtils)
    ], Column.prototype, "columnUtils", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], Column.prototype, "initialise", null);
    return Column;
})();
exports.Column = Column;
