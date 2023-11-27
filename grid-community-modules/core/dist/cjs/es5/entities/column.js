"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Column = exports.getNextColInstanceId = void 0;
var context_1 = require("../context/context");
var eventService_1 = require("../eventService");
var generic_1 = require("../utils/generic");
var object_1 = require("../utils/object");
var COL_DEF_DEFAULTS = {
    resizable: true,
    sortable: true
};
var instanceIdSequence = 0;
function getNextColInstanceId() {
    return instanceIdSequence++;
}
exports.getNextColInstanceId = getNextColInstanceId;
// Wrapper around a user provide column definition. The grid treats the column definition as ready only.
// This class contains all the runtime information about a column, plus some logic (the definition has no logic).
// This class implements both interfaces ColumnGroupChild and ProvidedColumnGroupChild as the class can
// appear as a child of either the original tree or the displayed tree. However the relevant group classes
// for each type only implements one, as each group can only appear in it's associated tree (eg ProvidedColumnGroup
// can only appear in OriginalColumn tree).
var Column = /** @class */ (function () {
    function Column(colDef, userProvidedColDef, colId, primary) {
        // used by React (and possibly other frameworks) as key for rendering. also used to
        // identify old vs new columns for destroying cols when no longer used.
        this.instanceId = getNextColInstanceId();
        // The measured height of this column's header when autoHeaderHeight is enabled
        this.autoHeaderHeight = null;
        this.moving = false;
        this.menuVisible = false;
        this.lastLeftPinned = false;
        this.firstRightPinned = false;
        this.filterActive = false;
        this.eventService = new eventService_1.EventService();
        this.tooltipEnabled = false;
        this.rowGroupActive = false;
        this.pivotActive = false;
        this.aggregationActive = false;
        this.colDef = colDef;
        this.userProvidedColDef = userProvidedColDef;
        this.colId = colId;
        this.primary = primary;
        this.setState(colDef);
    }
    Column.prototype.getInstanceId = function () {
        return this.instanceId;
    };
    Column.prototype.setState = function (colDef) {
        // sort
        if (colDef.sort !== undefined) {
            if (colDef.sort === 'asc' || colDef.sort === 'desc') {
                this.sort = colDef.sort;
            }
        }
        else {
            if (colDef.initialSort === 'asc' || colDef.initialSort === 'desc') {
                this.sort = colDef.initialSort;
            }
        }
        // sortIndex
        var sortIndex = colDef.sortIndex;
        var initialSortIndex = colDef.initialSortIndex;
        if (sortIndex !== undefined) {
            if (sortIndex !== null) {
                this.sortIndex = sortIndex;
            }
        }
        else {
            if (initialSortIndex !== null) {
                this.sortIndex = initialSortIndex;
            }
        }
        // hide
        var hide = colDef.hide;
        var initialHide = colDef.initialHide;
        if (hide !== undefined) {
            this.visible = !hide;
        }
        else {
            this.visible = !initialHide;
        }
        // pinned
        if (colDef.pinned !== undefined) {
            this.setPinned(colDef.pinned);
        }
        else {
            this.setPinned(colDef.initialPinned);
        }
        // flex
        var flex = colDef.flex;
        var initialFlex = colDef.initialFlex;
        if (flex !== undefined) {
            this.flex = flex;
        }
        else if (initialFlex !== undefined) {
            this.flex = initialFlex;
        }
    };
    // gets called when user provides an alternative colDef, eg
    Column.prototype.setColDef = function (colDef, userProvidedColDef, source) {
        if (source === void 0) { source = 'api'; }
        this.colDef = colDef;
        this.userProvidedColDef = userProvidedColDef;
        this.initMinAndMaxWidths();
        this.initDotNotation();
        this.initTooltip();
        this.eventService.dispatchEvent(this.createColumnEvent('colDefChanged', source));
    };
    /**
     * Returns the column definition provided by the application.
     * This may not be correct, as items can be superseded by default column options.
     * However it's useful for comparison, eg to know which application column definition matches that column.
     */
    Column.prototype.getUserProvidedColDef = function () {
        return this.userProvidedColDef;
    };
    Column.prototype.setParent = function (parent) {
        this.parent = parent;
    };
    /** Returns the parent column group, if column grouping is active. */
    Column.prototype.getParent = function () {
        return this.parent;
    };
    Column.prototype.setOriginalParent = function (originalParent) {
        this.originalParent = originalParent;
    };
    /**
     * Used for marryChildren, helps with comparing when duplicate groups have been created to manage split groups.
     *
     * Parent may contain a duplicate but not identical group when the group is split.
     */
    Column.prototype.getOriginalParent = function () {
        return this.originalParent;
    };
    // this is done after constructor as it uses gridOptionsService
    Column.prototype.initialise = function () {
        this.initMinAndMaxWidths();
        this.resetActualWidth('gridInitializing');
        this.initDotNotation();
        this.initTooltip();
    };
    Column.prototype.initDotNotation = function () {
        var suppressDotNotation = this.gridOptionsService.get('suppressFieldDotNotation');
        this.fieldContainsDots = (0, generic_1.exists)(this.colDef.field) && this.colDef.field.indexOf('.') >= 0 && !suppressDotNotation;
        this.tooltipFieldContainsDots = (0, generic_1.exists)(this.colDef.tooltipField) && this.colDef.tooltipField.indexOf('.') >= 0 && !suppressDotNotation;
    };
    Column.prototype.initMinAndMaxWidths = function () {
        var colDef = this.colDef;
        this.minWidth = this.columnUtils.calculateColMinWidth(colDef);
        this.maxWidth = this.columnUtils.calculateColMaxWidth(colDef);
    };
    Column.prototype.initTooltip = function () {
        this.tooltipEnabled = (0, generic_1.exists)(this.colDef.tooltipField) ||
            (0, generic_1.exists)(this.colDef.tooltipValueGetter) ||
            (0, generic_1.exists)(this.colDef.tooltipComponent);
    };
    Column.prototype.resetActualWidth = function (source) {
        if (source === void 0) { source = 'api'; }
        var initialWidth = this.columnUtils.calculateColInitialWidth(this.colDef);
        this.setActualWidth(initialWidth, source, true);
    };
    Column.prototype.isEmptyGroup = function () {
        return false;
    };
    Column.prototype.isRowGroupDisplayed = function (colId) {
        if ((0, generic_1.missing)(this.colDef) || (0, generic_1.missing)(this.colDef.showRowGroup)) {
            return false;
        }
        var showingAllGroups = this.colDef.showRowGroup === true;
        var showingThisGroup = this.colDef.showRowGroup === colId;
        return showingAllGroups || showingThisGroup;
    };
    /** Returns `true` if column is a primary column, `false` if secondary. Secondary columns are used for pivoting. */
    Column.prototype.isPrimary = function () {
        return this.primary;
    };
    /** Returns `true` if column filtering is allowed. */
    Column.prototype.isFilterAllowed = function () {
        // filter defined means it's a string, class or true.
        // if its false, null or undefined then it's false.
        var filterDefined = !!this.colDef.filter;
        return filterDefined;
    };
    Column.prototype.isFieldContainsDots = function () {
        return this.fieldContainsDots;
    };
    Column.prototype.isTooltipEnabled = function () {
        return this.tooltipEnabled;
    };
    Column.prototype.isTooltipFieldContainsDots = function () {
        return this.tooltipFieldContainsDots;
    };
    /** Add an event listener to the column. */
    Column.prototype.addEventListener = function (eventType, listener) {
        this.eventService.addEventListener(eventType, listener);
    };
    /** Remove event listener from the column. */
    Column.prototype.removeEventListener = function (eventType, listener) {
        this.eventService.removeEventListener(eventType, listener);
    };
    Column.prototype.createColumnFunctionCallbackParams = function (rowNode) {
        return {
            node: rowNode,
            data: rowNode.data,
            column: this,
            colDef: this.colDef,
            context: this.gridOptionsService.context,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi
        };
    };
    Column.prototype.isSuppressNavigable = function (rowNode) {
        // if boolean set, then just use it
        if (typeof this.colDef.suppressNavigable === 'boolean') {
            return this.colDef.suppressNavigable;
        }
        // if function, then call the function to find out
        if (typeof this.colDef.suppressNavigable === 'function') {
            var params = this.createColumnFunctionCallbackParams(rowNode);
            var userFunc = this.colDef.suppressNavigable;
            return userFunc(params);
        }
        return false;
    };
    /**
     * Returns `true` if the cell for this column is editable for the given `rowNode`, otherwise `false`.
     */
    Column.prototype.isCellEditable = function (rowNode) {
        // only allow editing of groups if the user has this option enabled
        if (rowNode.group && !this.gridOptionsService.get('enableGroupEdit')) {
            return false;
        }
        return this.isColumnFunc(rowNode, this.colDef.editable);
    };
    Column.prototype.isSuppressFillHandle = function () {
        return !!this.colDef.suppressFillHandle;
    };
    Column.prototype.isAutoHeight = function () {
        return !!this.colDef.autoHeight;
    };
    Column.prototype.isAutoHeaderHeight = function () {
        return !!this.colDef.autoHeaderHeight;
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
        return !!this.getColDefValue('resizable');
    };
    /** Get value from ColDef or default if it exists. */
    Column.prototype.getColDefValue = function (key) {
        var _a;
        return (_a = this.colDef[key]) !== null && _a !== void 0 ? _a : COL_DEF_DEFAULTS[key];
    };
    Column.prototype.isColumnFunc = function (rowNode, value) {
        // if boolean set, then just use it
        if (typeof value === 'boolean') {
            return value;
        }
        // if function, then call the function to find out
        if (typeof value === 'function') {
            var params = this.createColumnFunctionCallbackParams(rowNode);
            var editableFunc = value;
            return editableFunc(params);
        }
        return false;
    };
    Column.prototype.setMoving = function (moving, source) {
        if (source === void 0) { source = "api"; }
        this.moving = moving;
        this.eventService.dispatchEvent(this.createColumnEvent('movingChanged', source));
    };
    Column.prototype.createColumnEvent = function (type, source) {
        return {
            type: type,
            column: this,
            columns: [this],
            source: source,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        };
    };
    Column.prototype.isMoving = function () {
        return this.moving;
    };
    /** If sorting is active, returns the sort direction e.g. `'asc'` or `'desc'`. */
    Column.prototype.getSort = function () {
        return this.sort;
    };
    Column.prototype.setSort = function (sort, source) {
        if (source === void 0) { source = "api"; }
        if (this.sort !== sort) {
            this.sort = sort;
            this.eventService.dispatchEvent(this.createColumnEvent('sortChanged', source));
        }
        this.dispatchStateUpdatedEvent('sort');
    };
    Column.prototype.setMenuVisible = function (visible, source) {
        if (source === void 0) { source = "api"; }
        if (this.menuVisible !== visible) {
            this.menuVisible = visible;
            this.eventService.dispatchEvent(this.createColumnEvent('menuVisibleChanged', source));
        }
    };
    Column.prototype.isMenuVisible = function () {
        return this.menuVisible;
    };
    Column.prototype.isSortable = function () {
        return !!this.getColDefValue('sortable');
    };
    Column.prototype.isSortAscending = function () {
        return this.sort === 'asc';
    };
    Column.prototype.isSortDescending = function () {
        return this.sort === 'desc';
    };
    Column.prototype.isSortNone = function () {
        return (0, generic_1.missing)(this.sort);
    };
    Column.prototype.isSorting = function () {
        return (0, generic_1.exists)(this.sort);
    };
    Column.prototype.getSortIndex = function () {
        return this.sortIndex;
    };
    Column.prototype.setSortIndex = function (sortOrder) {
        this.sortIndex = sortOrder;
        this.dispatchStateUpdatedEvent('sortIndex');
    };
    Column.prototype.setAggFunc = function (aggFunc) {
        this.aggFunc = aggFunc;
        this.dispatchStateUpdatedEvent('aggFunc');
    };
    /** If aggregation is set for the column, returns the aggregation function. */
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
            this.eventService.dispatchEvent(this.createColumnEvent('leftChanged', source));
        }
    };
    /** Returns `true` if filter is active on the column. */
    Column.prototype.isFilterActive = function () {
        return this.filterActive;
    };
    // additionalEventAttributes is used by provided simple floating filter, so it can add 'floatingFilter=true' to the event
    Column.prototype.setFilterActive = function (active, source, additionalEventAttributes) {
        if (source === void 0) { source = "api"; }
        if (this.filterActive !== active) {
            this.filterActive = active;
            this.eventService.dispatchEvent(this.createColumnEvent('filterActiveChanged', source));
        }
        var filterChangedEvent = this.createColumnEvent('filterChanged', source);
        if (additionalEventAttributes) {
            (0, object_1.mergeDeep)(filterChangedEvent, additionalEventAttributes);
        }
        this.eventService.dispatchEvent(filterChangedEvent);
    };
    /** Returns `true` when this `Column` is hovered, otherwise `false` */
    Column.prototype.isHovered = function () {
        return this.columnHoverService.isHovered(this);
    };
    Column.prototype.setPinned = function (pinned) {
        if (pinned === true || pinned === 'left') {
            this.pinned = 'left';
        }
        else if (pinned === 'right') {
            this.pinned = 'right';
        }
        else {
            this.pinned = null;
        }
        this.dispatchStateUpdatedEvent('pinned');
    };
    Column.prototype.setFirstRightPinned = function (firstRightPinned, source) {
        if (source === void 0) { source = "api"; }
        if (this.firstRightPinned !== firstRightPinned) {
            this.firstRightPinned = firstRightPinned;
            this.eventService.dispatchEvent(this.createColumnEvent('firstRightPinnedChanged', source));
        }
    };
    Column.prototype.setLastLeftPinned = function (lastLeftPinned, source) {
        if (source === void 0) { source = "api"; }
        if (this.lastLeftPinned !== lastLeftPinned) {
            this.lastLeftPinned = lastLeftPinned;
            this.eventService.dispatchEvent(this.createColumnEvent('lastLeftPinnedChanged', source));
        }
    };
    Column.prototype.isFirstRightPinned = function () {
        return this.firstRightPinned;
    };
    Column.prototype.isLastLeftPinned = function () {
        return this.lastLeftPinned;
    };
    Column.prototype.isPinned = function () {
        return this.pinned === 'left' || this.pinned === 'right';
    };
    Column.prototype.isPinnedLeft = function () {
        return this.pinned === 'left';
    };
    Column.prototype.isPinnedRight = function () {
        return this.pinned === 'right';
    };
    Column.prototype.getPinned = function () {
        return this.pinned;
    };
    Column.prototype.setVisible = function (visible, source) {
        if (source === void 0) { source = "api"; }
        var newValue = visible === true;
        if (this.visible !== newValue) {
            this.visible = newValue;
            this.eventService.dispatchEvent(this.createColumnEvent('visibleChanged', source));
        }
        this.dispatchStateUpdatedEvent('hide');
    };
    Column.prototype.isVisible = function () {
        return this.visible;
    };
    Column.prototype.isSpanHeaderHeight = function () {
        var colDef = this.getColDef();
        return !colDef.suppressSpanHeaderHeight && !colDef.autoHeaderHeight;
    };
    /** Returns the column definition for this column.
     * The column definition will be the result of merging the application provided column definition with any provided defaults
     * (e.g. `defaultColDef` grid option, or column types.
     *
     * Equivalent: `getDefinition` */
    Column.prototype.getColDef = function () {
        return this.colDef;
    };
    Column.prototype.getColumnGroupShow = function () {
        return this.colDef.columnGroupShow;
    };
    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getId`, `getUniqueId` */
    Column.prototype.getColId = function () {
        return this.colId;
    };
    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getColId`, `getUniqueId` */
    Column.prototype.getId = function () {
        return this.colId;
    };
    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getColId`, `getId` */
    Column.prototype.getUniqueId = function () {
        return this.colId;
    };
    Column.prototype.getDefinition = function () {
        return this.colDef;
    };
    /** Returns the current width of the column. If the column is resized, the actual width is the new size. */
    Column.prototype.getActualWidth = function () {
        return this.actualWidth;
    };
    Column.prototype.getAutoHeaderHeight = function () {
        return this.autoHeaderHeight;
    };
    /** Returns true if the header height has changed */
    Column.prototype.setAutoHeaderHeight = function (height) {
        var changed = height !== this.autoHeaderHeight;
        this.autoHeaderHeight = height;
        return changed;
    };
    Column.prototype.createBaseColDefParams = function (rowNode) {
        var params = {
            node: rowNode,
            data: rowNode.data,
            colDef: this.colDef,
            column: this,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        };
        return params;
    };
    Column.prototype.getColSpan = function (rowNode) {
        if ((0, generic_1.missing)(this.colDef.colSpan)) {
            return 1;
        }
        var params = this.createBaseColDefParams(rowNode);
        var colSpan = this.colDef.colSpan(params);
        // colSpan must be number equal to or greater than 1
        return Math.max(colSpan, 1);
    };
    Column.prototype.getRowSpan = function (rowNode) {
        if ((0, generic_1.missing)(this.colDef.rowSpan)) {
            return 1;
        }
        var params = this.createBaseColDefParams(rowNode);
        var rowSpan = this.colDef.rowSpan(params);
        // rowSpan must be number equal to or greater than 1
        return Math.max(rowSpan, 1);
    };
    Column.prototype.setActualWidth = function (actualWidth, source, silent) {
        if (source === void 0) { source = "api"; }
        if (silent === void 0) { silent = false; }
        if (this.minWidth != null) {
            actualWidth = Math.max(actualWidth, this.minWidth);
        }
        if (this.maxWidth != null) {
            actualWidth = Math.min(actualWidth, this.maxWidth);
        }
        if (this.actualWidth !== actualWidth) {
            // disable flex for this column if it was manually resized.
            this.actualWidth = actualWidth;
            if (this.flex && source !== 'flex' && source !== 'gridInitializing') {
                this.flex = null;
            }
            if (!silent) {
                this.fireColumnWidthChangedEvent(source);
            }
        }
        this.dispatchStateUpdatedEvent('width');
    };
    Column.prototype.fireColumnWidthChangedEvent = function (source) {
        this.eventService.dispatchEvent(this.createColumnEvent('widthChanged', source));
    };
    Column.prototype.isGreaterThanMax = function (width) {
        if (this.maxWidth != null) {
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
    Column.prototype.getFlex = function () {
        return this.flex || 0;
    };
    // this method should only be used by the columnModel to
    // change flex when required by the applyColumnState method.
    Column.prototype.setFlex = function (flex) {
        if (this.flex !== flex) {
            this.flex = flex;
        }
        this.dispatchStateUpdatedEvent('flex');
    };
    Column.prototype.setMinimum = function (source) {
        if (source === void 0) { source = "api"; }
        if ((0, generic_1.exists)(this.minWidth)) {
            this.setActualWidth(this.minWidth, source);
        }
    };
    Column.prototype.setRowGroupActive = function (rowGroup, source) {
        if (source === void 0) { source = "api"; }
        if (this.rowGroupActive !== rowGroup) {
            this.rowGroupActive = rowGroup;
            this.eventService.dispatchEvent(this.createColumnEvent('columnRowGroupChanged', source));
        }
        this.dispatchStateUpdatedEvent('rowGroup');
    };
    /** Returns `true` if row group is currently active for this column. */
    Column.prototype.isRowGroupActive = function () {
        return this.rowGroupActive;
    };
    Column.prototype.setPivotActive = function (pivot, source) {
        if (source === void 0) { source = "api"; }
        if (this.pivotActive !== pivot) {
            this.pivotActive = pivot;
            this.eventService.dispatchEvent(this.createColumnEvent('columnPivotChanged', source));
        }
        this.dispatchStateUpdatedEvent('pivot');
    };
    /** Returns `true` if pivot is currently active for this column. */
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
            this.eventService.dispatchEvent(this.createColumnEvent('columnValueChanged', source));
        }
    };
    /** Returns `true` if value (aggregation) is currently active for this column. */
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
    Column.prototype.dispatchStateUpdatedEvent = function (key) {
        this.eventService.dispatchEvent({
            type: Column.EVENT_STATE_UPDATED,
            key: key
        });
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
    // + renderedHeaderCell - marks the header with sort icon
    Column.EVENT_COL_DEF_CHANGED = 'colDefChanged';
    Column.EVENT_MENU_VISIBLE_CHANGED = 'menuVisibleChanged';
    // + toolpanel, for gui updates
    Column.EVENT_ROW_GROUP_CHANGED = 'columnRowGroupChanged';
    // + toolpanel, for gui updates
    Column.EVENT_PIVOT_CHANGED = 'columnPivotChanged';
    // + toolpanel, for gui updates
    Column.EVENT_VALUE_CHANGED = 'columnValueChanged';
    // + dataTypeService - when waiting to infer cell data types
    Column.EVENT_STATE_UPDATED = 'columnStateUpdated';
    __decorate([
        (0, context_1.Autowired)('gridOptionsService')
    ], Column.prototype, "gridOptionsService", void 0);
    __decorate([
        (0, context_1.Autowired)('columnUtils')
    ], Column.prototype, "columnUtils", void 0);
    __decorate([
        (0, context_1.Autowired)('columnHoverService')
    ], Column.prototype, "columnHoverService", void 0);
    __decorate([
        context_1.PostConstruct
    ], Column.prototype, "initialise", null);
    return Column;
}());
exports.Column = Column;
