/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
Object.defineProperty(exports, "__esModule", { value: true });
var eventService_1 = require("../eventService");
var utils_1 = require("../utils");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnUtils_1 = require("../columnController/columnUtils");
var columnApi_1 = require("../columnController/columnApi");
var gridApi_1 = require("../gridApi");
// Wrapper around a user provide column definition. The grid treats the column definition as ready only.
// This class contains all the runtime information about a column, plus some logic (the definition has no logic).
// This class implements both interfaces ColumnGroupChild and OriginalColumnGroupChild as the class can
// appear as a child of either the original tree or the displayed tree. However the relevant group classes
// for each type only implements one, as each group can only appear in it's associated tree (eg OriginalColumnGroup
// can only appear in OriginalColumn tree).
var Column = /** @class */ (function () {
    function Column(colDef, userProvidedColDef, colId, primary) {
        this.moving = false;
        this.menuVisible = false;
        this.filterActive = false;
        this.eventService = new eventService_1.EventService();
        this.rowGroupActive = false;
        this.pivotActive = false;
        this.aggregationActive = false;
        this.colDef = colDef;
        this.userProvidedColDef = userProvidedColDef;
        this.visible = !colDef.hide;
        this.sort = colDef.sort;
        this.sortedAt = colDef.sortedAt;
        this.colId = colId;
        this.primary = primary;
    }
    // gets called when user provides an alternative colDef, eg
    Column.prototype.setColDef = function (colDef, userProvidedColDef) {
        this.colDef = colDef;
        this.userProvidedColDef = userProvidedColDef;
    };
    Column.prototype.getUserProvidedColDef = function () {
        return this.userProvidedColDef;
    };
    Column.prototype.setParent = function (parent) {
        this.parent = parent;
    };
    Column.prototype.getParent = function () {
        return this.parent;
    };
    Column.prototype.setOriginalParent = function (originalParent) {
        this.originalParent = originalParent;
    };
    Column.prototype.getOriginalParent = function () {
        return this.originalParent;
    };
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
        this.fieldContainsDots = utils_1._.exists(this.colDef.field) && this.colDef.field.indexOf('.') >= 0 && !suppressDotNotation;
        this.tooltipFieldContainsDots = utils_1._.exists(this.colDef.tooltipField) && this.colDef.tooltipField.indexOf('.') >= 0 && !suppressDotNotation;
        this.validate();
    };
    Column.prototype.isEmptyGroup = function () {
        return false;
    };
    Column.prototype.isRowGroupDisplayed = function (colId) {
        if (utils_1._.missing(this.colDef) || utils_1._.missing(this.colDef.showRowGroup)) {
            return false;
        }
        var showingAllGroups = this.colDef.showRowGroup === true;
        var showingThisGroup = this.colDef.showRowGroup === colId;
        return showingAllGroups || showingThisGroup;
    };
    Column.prototype.getUniqueId = function () {
        return this.getId();
    };
    Column.prototype.isPrimary = function () {
        return this.primary;
    };
    Column.prototype.isFilterAllowed = function () {
        // filter defined means it's a string, class or true.
        // if its false, null or undefined then it's false.
        var filterDefined = !!this.colDef.filter || !!this.colDef.filterFramework;
        return this.primary && filterDefined;
    };
    Column.prototype.isFieldContainsDots = function () {
        return this.fieldContainsDots;
    };
    Column.prototype.isTooltipFieldContainsDots = function () {
        return this.tooltipFieldContainsDots;
    };
    Column.prototype.validate = function () {
        var colDefAny = this.colDef;
        if (!this.gridOptionsWrapper.isEnterprise()) {
            var itemsNotAllowedWithoutEnterprise = ['enableRowGroup', 'rowGroup', 'rowGroupIndex', 'enablePivot', 'enableValue', 'pivot', 'pivotIndex', 'aggFunc', 'chartDataType'];
            itemsNotAllowedWithoutEnterprise.forEach(function (item) {
                if (utils_1._.exists(colDefAny[item])) {
                    console.warn("ag-Grid: " + item + " is only valid in ag-Grid-Enterprise, your column definition should not have " + item);
                }
            });
        }
        if (this.gridOptionsWrapper.isTreeData()) {
            var itemsNotAllowedWithTreeData = ['rowGroup', 'rowGroupIndex', 'pivot', 'pivotIndex'];
            itemsNotAllowedWithTreeData.forEach(function (item) {
                if (utils_1._.exists(colDefAny[item])) {
                    console.warn("ag-Grid: " + item + " is not possible when doing tree data, your column definition should not have " + item);
                }
            });
        }
        if (utils_1._.exists(this.colDef.width) && typeof this.colDef.width !== 'number') {
            console.warn('ag-Grid: colDef.width should be a number, not ' + typeof this.colDef.width);
        }
        if (utils_1._.get(this, 'colDef.cellRendererParams.restrictToOneGroup', null)) {
            console.warn('ag-Grid: Since ag-grid 11.0.0 cellRendererParams.restrictToOneGroup is deprecated. You should use showRowGroup');
        }
        if (utils_1._.get(this, 'colDef.cellRendererParams.keyMap', null)) {
            console.warn('ag-Grid: Since ag-grid 11.0.0 cellRendererParams.keyMap is deprecated. You should use colDef.keyCreator');
        }
        if (utils_1._.get(this, 'colDef.cellRendererParams.keyMap', null)) {
            console.warn('ag-Grid: Since ag-grid 11.0.0 cellRendererParams.keyMap is deprecated. You should use colDef.keyCreator');
        }
        if (colDefAny.floatingCellRenderer) {
            console.warn('ag-Grid: since v11, floatingCellRenderer is now pinnedRowCellRenderer');
            this.colDef.pinnedRowCellRenderer = colDefAny.floatingCellRenderer;
        }
        if (colDefAny.floatingRendererFramework) {
            console.warn('ag-Grid: since v11, floatingRendererFramework is now pinnedRowCellRendererFramework');
            this.colDef.pinnedRowCellRendererFramework = colDefAny.floatingRendererFramework;
        }
        if (colDefAny.floatingRendererParams) {
            console.warn('ag-Grid: since v11, floatingRendererParams is now pinnedRowCellRendererParams');
            this.colDef.pinnedRowCellRendererParams = colDefAny.floatingRendererParams;
        }
        if (colDefAny.floatingValueFormatter) {
            console.warn('ag-Grid: since v11, floatingValueFormatter is now pinnedRowValueFormatter');
            this.colDef.pinnedRowValueFormatter = colDefAny.floatingValueFormatter;
        }
        if (colDefAny.cellFormatter) {
            console.warn('ag-Grid: since v12, cellFormatter is now valueFormatter');
            if (utils_1._.missing(this.colDef.valueFormatter)) {
                this.colDef.valueFormatter = colDefAny.cellFormatter;
            }
        }
        if (colDefAny.headerCellTemplate) {
            console.warn('ag-Grid: since v15, headerCellTemplate is gone, use header component instead.');
        }
        if (colDefAny.headerCellRenderer) {
            console.warn('ag-Grid: since v15, headerCellRenderer is gone, use header component instead.');
        }
        if (colDefAny.volatile) {
            console.warn('ag-Grid: since v16, colDef.volatile is gone, please check refresh docs on how to refresh specific cells.');
        }
        if (colDefAny.suppressSorting) {
            console.warn("ag-Grid: since v20, colDef.suppressSorting is gone, instead use colDef.sortable=false.", this.colDef);
            this.colDef.sortable = false;
        }
        if (colDefAny.suppressFilter) {
            console.warn("ag-Grid: since v20, colDef.suppressFilter is gone, instead use colDef.filter=false.", this.colDef);
            this.colDef.filter = false;
        }
        if (colDefAny.suppressResize) {
            console.warn("ag-Grid: since v20, colDef.suppressResize is gone, instead use colDef.resizable=false.", this.colDef);
            this.colDef.resizable = false;
        }
        if (colDefAny.tooltip) {
            console.warn("ag-Grid: since v20.1, colDef.tooltip is gone, instead use colDef.tooltipValueGetter.", this.colDef);
            this.colDef.tooltipValueGetter = colDefAny.tooltip;
        }
    };
    Column.prototype.addEventListener = function (eventType, listener) {
        this.eventService.addEventListener(eventType, listener);
    };
    Column.prototype.removeEventListener = function (eventType, listener) {
        this.eventService.removeEventListener(eventType, listener);
    };
    Column.prototype.createIsColumnFuncParams = function (rowNode) {
        return {
            node: rowNode,
            data: rowNode.data,
            column: this,
            colDef: this.colDef,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
    };
    Column.prototype.isSuppressNavigable = function (rowNode) {
        // if boolean set, then just use it
        if (typeof this.colDef.suppressNavigable === 'boolean') {
            return this.colDef.suppressNavigable;
        }
        // if function, then call the function to find out
        if (typeof this.colDef.suppressNavigable === 'function') {
            var params = this.createIsColumnFuncParams(rowNode);
            var userFunc = this.colDef.suppressNavigable;
            return userFunc(params);
        }
        return false;
    };
    Column.prototype.isCellEditable = function (rowNode) {
        // only allow editing of groups if the user has this option enabled
        if (rowNode.group && !this.gridOptionsWrapper.isEnableGroupEdit()) {
            return false;
        }
        return this.isColumnFunc(rowNode, this.colDef.editable);
    };
    Column.prototype.isRowDrag = function (rowNode) {
        return this.isColumnFunc(rowNode, this.colDef.rowDrag);
    };
    Column.prototype.isDndSource = function (rowNode) {
        return this.isColumnFunc(rowNode, this.colDef.dndSource);
    };
    Column.prototype.isCellCheckboxSelection = function (rowNode) {
        return this.isColumnFunc(rowNode, this.colDef.checkboxSelection);
    };
    Column.prototype.isSuppressPaste = function (rowNode) {
        return this.isColumnFunc(rowNode, this.colDef ? this.colDef.suppressPaste : null);
    };
    Column.prototype.isResizable = function () {
        return this.colDef.resizable === true;
    };
    Column.prototype.isColumnFunc = function (rowNode, value) {
        // if boolean set, then just use it
        if (typeof value === 'boolean') {
            return value;
        }
        // if function, then call the function to find out
        if (typeof value === 'function') {
            var params = this.createIsColumnFuncParams(rowNode);
            var editableFunc = value;
            return editableFunc(params);
        }
        return false;
    };
    Column.prototype.setMoving = function (moving, source) {
        if (source === void 0) { source = "api"; }
        this.moving = moving;
        this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_MOVING_CHANGED, source));
    };
    Column.prototype.createColumnEvent = function (type, source) {
        return {
            api: this.gridApi,
            columnApi: this.columnApi,
            type: type,
            column: this,
            columns: [this],
            source: source
        };
    };
    Column.prototype.isMoving = function () {
        return this.moving;
    };
    Column.prototype.getSort = function () {
        return this.sort;
    };
    Column.prototype.setSort = function (sort, source) {
        if (source === void 0) { source = "api"; }
        if (this.sort !== sort) {
            this.sort = sort;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_SORT_CHANGED, source));
        }
    };
    Column.prototype.setMenuVisible = function (visible, source) {
        if (source === void 0) { source = "api"; }
        if (this.menuVisible !== visible) {
            this.menuVisible = visible;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_MENU_VISIBLE_CHANGED, source));
        }
    };
    Column.prototype.isMenuVisible = function () {
        return this.menuVisible;
    };
    Column.prototype.isSortAscending = function () {
        return this.sort === Column.SORT_ASC;
    };
    Column.prototype.isSortDescending = function () {
        return this.sort === Column.SORT_DESC;
    };
    Column.prototype.isSortNone = function () {
        return utils_1._.missing(this.sort);
    };
    Column.prototype.isSorting = function () {
        return utils_1._.exists(this.sort);
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
    Column.prototype.getOldLeft = function () {
        return this.oldLeft;
    };
    Column.prototype.getRight = function () {
        return this.left + this.actualWidth;
    };
    Column.prototype.setLeft = function (left, source) {
        if (source === void 0) { source = "api"; }
        this.oldLeft = this.left;
        if (this.left !== left) {
            this.left = left;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_LEFT_CHANGED, source));
        }
    };
    Column.prototype.isFilterActive = function () {
        return this.filterActive;
    };
    // additionalEventAttributes is used by provided simple floating filter, so it can add 'floatingFilter=true' to the event
    Column.prototype.setFilterActive = function (active, source, additionalEventAttributes) {
        if (source === void 0) { source = "api"; }
        if (this.filterActive !== active) {
            this.filterActive = active;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_FILTER_ACTIVE_CHANGED, source));
        }
        var filterChangedEvent = this.createColumnEvent(Column.EVENT_FILTER_CHANGED, source);
        if (additionalEventAttributes) {
            utils_1._.mergeDeep(filterChangedEvent, additionalEventAttributes);
        }
        this.eventService.dispatchEvent(filterChangedEvent);
    };
    Column.prototype.setPinned = function (pinned) {
        if (pinned === true || pinned === Column.PINNED_LEFT) {
            this.pinned = Column.PINNED_LEFT;
        }
        else if (pinned === Column.PINNED_RIGHT) {
            this.pinned = Column.PINNED_RIGHT;
        }
        else {
            this.pinned = null;
        }
    };
    Column.prototype.setFirstRightPinned = function (firstRightPinned, source) {
        if (source === void 0) { source = "api"; }
        if (this.firstRightPinned !== firstRightPinned) {
            this.firstRightPinned = firstRightPinned;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, source));
        }
    };
    Column.prototype.setLastLeftPinned = function (lastLeftPinned, source) {
        if (source === void 0) { source = "api"; }
        if (this.lastLeftPinned !== lastLeftPinned) {
            this.lastLeftPinned = lastLeftPinned;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_LAST_LEFT_PINNED_CHANGED, source));
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
    Column.prototype.setVisible = function (visible, source) {
        if (source === void 0) { source = "api"; }
        var newValue = visible === true;
        if (this.visible !== newValue) {
            this.visible = newValue;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_VISIBLE_CHANGED, source));
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
    Column.prototype.createBaseColDefParams = function (rowNode) {
        var params = {
            node: rowNode,
            data: rowNode.data,
            colDef: this.colDef,
            column: this,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext()
        };
        return params;
    };
    Column.prototype.getColSpan = function (rowNode) {
        if (utils_1._.missing(this.colDef.colSpan)) {
            return 1;
        }
        var params = this.createBaseColDefParams(rowNode);
        var colSpan = this.colDef.colSpan(params);
        // colSpan must be number equal to or greater than 1
        return Math.max(colSpan, 1);
    };
    Column.prototype.getRowSpan = function (rowNode) {
        if (utils_1._.missing(this.colDef.rowSpan)) {
            return 1;
        }
        var params = this.createBaseColDefParams(rowNode);
        var rowSpan = this.colDef.rowSpan(params);
        // rowSpan must be number equal to or greater than 1
        return Math.max(rowSpan, 1);
    };
    Column.prototype.setActualWidth = function (actualWidth, source) {
        if (source === void 0) { source = "api"; }
        if (this.actualWidth !== actualWidth) {
            this.actualWidth = actualWidth;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_WIDTH_CHANGED, source));
        }
    };
    Column.prototype.isGreaterThanMax = function (width) {
        if (this.maxWidth) {
            return width > this.maxWidth;
        }
        return false;
    };
    Column.prototype.getMinWidth = function () {
        return this.minWidth;
    };
    Column.prototype.getMaxWidth = function () {
        return this.maxWidth;
    };
    Column.prototype.setMinimum = function (source) {
        if (source === void 0) { source = "api"; }
        this.setActualWidth(this.minWidth, source);
    };
    Column.prototype.setRowGroupActive = function (rowGroup, source) {
        if (source === void 0) { source = "api"; }
        if (this.rowGroupActive !== rowGroup) {
            this.rowGroupActive = rowGroup;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_ROW_GROUP_CHANGED, source));
        }
    };
    Column.prototype.isRowGroupActive = function () {
        return this.rowGroupActive;
    };
    Column.prototype.setPivotActive = function (pivot, source) {
        if (source === void 0) { source = "api"; }
        if (this.pivotActive !== pivot) {
            this.pivotActive = pivot;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_PIVOT_CHANGED, source));
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
    Column.prototype.setValueActive = function (value, source) {
        if (source === void 0) { source = "api"; }
        if (this.aggregationActive !== value) {
            this.aggregationActive = value;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_VALUE_CHANGED, source));
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
    Column.prototype.getMenuTabs = function (defaultValues) {
        var menuTabs = this.getColDef().menuTabs;
        if (menuTabs == null) {
            menuTabs = defaultValues;
        }
        return menuTabs;
    };
    // this used to be needed, as previous version of ag-grid had lockPosition as column state,
    // so couldn't depend on colDef version.
    Column.prototype.isLockPosition = function () {
        console.warn('ag-Grid: since v21, col.isLockPosition() should not be used, please use col.getColDef().lockPosition instead.');
        return this.colDef ? !!this.colDef.lockPosition : false;
    };
    // this used to be needed, as previous version of ag-grid had lockVisible as column state,
    // so couldn't depend on colDef version.
    Column.prototype.isLockVisible = function () {
        console.warn('ag-Grid: since v21, col.isLockVisible() should not be used, please use col.getColDef().lockVisible instead.');
        return this.colDef ? !!this.colDef.lockVisible : false;
    };
    // this used to be needed, as previous version of ag-grid had lockPinned as column state,
    // so couldn't depend on colDef version.
    Column.prototype.isLockPinned = function () {
        console.warn('ag-Grid: since v21, col.isLockPinned() should not be used, please use col.getColDef().lockPinned instead.');
        return this.colDef ? !!this.colDef.lockPinned : false;
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
    // + every time the filter changes, used in the floating filters
    Column.EVENT_FILTER_CHANGED = 'filterChanged';
    // + renderedHeaderCell - marks the header with filter icon
    Column.EVENT_FILTER_ACTIVE_CHANGED = 'filterActiveChanged';
    // + renderedHeaderCell - marks the header with sort icon
    Column.EVENT_SORT_CHANGED = 'sortChanged';
    Column.EVENT_MENU_VISIBLE_CHANGED = 'menuVisibleChanged';
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
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], Column.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnUtils'),
        __metadata("design:type", columnUtils_1.ColumnUtils)
    ], Column.prototype, "columnUtils", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], Column.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], Column.prototype, "gridApi", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], Column.prototype, "initialise", null);
    return Column;
}());
exports.Column = Column;
