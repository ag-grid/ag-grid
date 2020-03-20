/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { EventService } from "../eventService";
import { _ } from "../utils";
import { Autowired, PostConstruct } from "../context/context";
import { Constants } from "../constants";
import { ModuleNames } from "../modules/moduleNames";
import { ModuleRegistry } from "../modules/moduleRegistry";
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
        this.eventService = new EventService();
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
        if (this.colDef.flex) {
            this.flex = this.colDef.flex;
        }
        this.actualWidth = this.columnUtils.calculateColInitialWidth(this.colDef);
        var suppressDotNotation = this.gridOptionsWrapper.isSuppressFieldDotNotation();
        this.fieldContainsDots = _.exists(this.colDef.field) && this.colDef.field.indexOf('.') >= 0 && !suppressDotNotation;
        this.tooltipFieldContainsDots = _.exists(this.colDef.tooltipField) && this.colDef.tooltipField.indexOf('.') >= 0 && !suppressDotNotation;
        this.validate();
    };
    Column.prototype.isEmptyGroup = function () {
        return false;
    };
    Column.prototype.isRowGroupDisplayed = function (colId) {
        if (_.missing(this.colDef) || _.missing(this.colDef.showRowGroup)) {
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
        function warnOnce(msg, key, obj) {
            _.doOnce(function () {
                if (obj) {
                    console.warn(msg, obj);
                }
                else {
                    _.doOnce(function () { return console.warn(msg); }, key);
                }
            }, key);
        }
        if (!ModuleRegistry.isRegistered(ModuleNames.RowGroupingModule)) {
            var rowGroupingItems = ['enableRowGroup', 'rowGroup', 'rowGroupIndex', 'enablePivot', 'enableValue', 'pivot', 'pivotIndex', 'aggFunc'];
            rowGroupingItems.forEach(function (item) {
                if (_.exists(colDefAny[item])) {
                    warnOnce("ag-Grid: " + item + " is only valid with module Row Grouping, your column definition "
                        + ("should not have " + item), 'ColumnRowGroupingMissing' + item);
                }
            });
        }
        if (!ModuleRegistry.isRegistered(ModuleNames.RichSelectModule)) {
            if (this.colDef.cellEditor === 'agRichSelect' || this.colDef.cellEditor === 'agRichSelectCellEditor') {
                warnOnce("ag-Grid: " + this.colDef.cellEditor + " can only be used with "
                    + ("module " + ModuleNames.RichSelectModule), 'ColumnRichSelectMissing');
            }
        }
        if (this.gridOptionsWrapper.isTreeData()) {
            var itemsNotAllowedWithTreeData = ['rowGroup', 'rowGroupIndex', 'pivot', 'pivotIndex'];
            itemsNotAllowedWithTreeData.forEach(function (item) {
                if (_.exists(colDefAny[item])) {
                    warnOnce("ag-Grid: " + item + " is not possible when doing tree data, your "
                        + ("column definition should not have " + item), 'TreeDataCannotRowGroup');
                }
            });
        }
        if (_.exists(this.colDef.width) && typeof this.colDef.width !== 'number') {
            warnOnce('ag-Grid: colDef.width should be a number, not ' + typeof this.colDef.width, 'ColumnCheck_asdfawef');
        }
        if (_.get(this, 'colDef.cellRendererParams.restrictToOneGroup', null)) {
            warnOnce('ag-Grid: Since ag-grid 11.0.0 cellRendererParams.restrictToOneGroup is deprecated. You should use showRowGroup', 'ColumnCheck_sksldjf');
        }
        if (_.get(this, 'colDef.cellRendererParams.keyMap', null)) {
            warnOnce('ag-Grid: Since ag-grid 11.0.0 cellRendererParams.keyMap is deprecated. You should use colDef.keyCreator', 'ColumnCheck_ieiruhgdf');
        }
        if (_.get(this, 'colDef.cellRendererParams.keyMap', null)) {
            warnOnce('ag-Grid: Since ag-grid 11.0.0 cellRendererParams.keyMap is deprecated. You should use colDef.keyCreator', 'ColumnCheck_uitolghj');
        }
        if (colDefAny.floatingCellRenderer) {
            warnOnce('ag-Grid: since v11, floatingCellRenderer is now pinnedRowCellRenderer', 'ColumnCheck_soihwewe');
            this.colDef.pinnedRowCellRenderer = colDefAny.floatingCellRenderer;
        }
        if (colDefAny.floatingRendererFramework) {
            warnOnce('ag-Grid: since v11, floatingRendererFramework is now pinnedRowCellRendererFramework', 'ColumnCheck_zdkiouhwer');
            this.colDef.pinnedRowCellRendererFramework = colDefAny.floatingRendererFramework;
        }
        if (colDefAny.floatingRendererParams) {
            console.warn('ag-Grid: since v11, floatingRendererParams is now pinnedRowCellRendererParams', 'ColumnCheck_retiuhjs');
            this.colDef.pinnedRowCellRendererParams = colDefAny.floatingRendererParams;
        }
        if (colDefAny.floatingValueFormatter) {
            warnOnce('ag-Grid: since v11, floatingValueFormatter is now pinnedRowValueFormatter', 'ColumnCheck_qwroeihjdf');
            this.colDef.pinnedRowValueFormatter = colDefAny.floatingValueFormatter;
        }
        if (colDefAny.cellFormatter) {
            warnOnce('ag-Grid: since v12, cellFormatter is now valueFormatter', 'ColumnCheck_eoireknml');
            if (_.missing(this.colDef.valueFormatter)) {
                this.colDef.valueFormatter = colDefAny.cellFormatter;
            }
        }
        if (colDefAny.headerCellTemplate) {
            warnOnce('ag-Grid: since v15, headerCellTemplate is gone, use header component instead.', 'ColumnCheck_eroihxcm');
        }
        if (colDefAny.headerCellRenderer) {
            warnOnce('ag-Grid: since v15, headerCellRenderer is gone, use header component instead.', 'ColumnCheck_terteuh');
        }
        if (colDefAny.volatile) {
            warnOnce('ag-Grid: since v16, colDef.volatile is gone, please check refresh docs on how to refresh specific cells.', 'ColumnCheck_weoihjxcv');
        }
        if (colDefAny.suppressSorting) {
            warnOnce("ag-Grid: since v20, colDef.suppressSorting is gone, instead use colDef.sortable=false.", 'ColumnCheck_43ljrer', this.colDef);
            this.colDef.sortable = false;
        }
        if (colDefAny.suppressFilter) {
            warnOnce("ag-Grid: since v20, colDef.suppressFilter is gone, instead use colDef.filter=false.", 'ColumnCheck_erlkhfdm', this.colDef);
            this.colDef.filter = false;
        }
        if (colDefAny.suppressResize) {
            warnOnce("ag-Grid: since v20, colDef.suppressResize is gone, instead use colDef.resizable=false.", 'ColumnCheck_weoihjxcv', this.colDef);
            this.colDef.resizable = false;
        }
        if (colDefAny.tooltip) {
            warnOnce("ag-Grid: since v20.1, colDef.tooltip is gone, instead use colDef.tooltipValueGetter.", 'ColumnCheck_adslknjwef', this.colDef);
            this.colDef.tooltipValueGetter = colDefAny.tooltip;
        }
        if (colDefAny.suppressToolPanel) {
            warnOnce("ag-Grid: since v22, colDef.suppressToolPanel is gone, instead use suppressColumnsToolPanel / suppressFiltersToolPanel.", 'ColumnCheck_weihjlsjkdf', this.colDef);
            this.colDef.suppressColumnsToolPanel = true;
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
        return this.sort === Constants.SORT_ASC;
    };
    Column.prototype.isSortDescending = function () {
        return this.sort === Constants.SORT_DESC;
    };
    Column.prototype.isSortNone = function () {
        return _.missing(this.sort);
    };
    Column.prototype.isSorting = function () {
        return _.exists(this.sort);
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
            _.mergeDeep(filterChangedEvent, additionalEventAttributes);
        }
        this.eventService.dispatchEvent(filterChangedEvent);
    };
    Column.prototype.setPinned = function (pinned) {
        if (pinned === true || pinned === Constants.PINNED_LEFT) {
            this.pinned = Constants.PINNED_LEFT;
        }
        else if (pinned === Constants.PINNED_RIGHT) {
            this.pinned = Constants.PINNED_RIGHT;
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
        return this.pinned === Constants.PINNED_LEFT || this.pinned === Constants.PINNED_RIGHT;
    };
    Column.prototype.isPinnedLeft = function () {
        return this.pinned === Constants.PINNED_LEFT;
    };
    Column.prototype.isPinnedRight = function () {
        return this.pinned === Constants.PINNED_RIGHT;
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
        if (_.missing(this.colDef.colSpan)) {
            return 1;
        }
        var params = this.createBaseColDefParams(rowNode);
        var colSpan = this.colDef.colSpan(params);
        // colSpan must be number equal to or greater than 1
        return Math.max(colSpan, 1);
    };
    Column.prototype.getRowSpan = function (rowNode) {
        if (_.missing(this.colDef.rowSpan)) {
            return 1;
        }
        var params = this.createBaseColDefParams(rowNode);
        var rowSpan = this.colDef.rowSpan(params);
        // rowSpan must be number equal to or greater than 1
        return Math.max(rowSpan, 1);
    };
    Column.prototype.setActualWidth = function (actualWidth, source) {
        if (source === void 0) { source = "api"; }
        if (this.minWidth != null) {
            actualWidth = Math.max(actualWidth, this.minWidth);
        }
        if (this.maxWidth != null) {
            actualWidth = Math.min(actualWidth, this.maxWidth);
        }
        if (this.actualWidth !== actualWidth) {
            // disable flex for this column if it was manually resized.
            if (this.flex && source !== 'flex') {
                this.flex = 0;
            }
            this.actualWidth = actualWidth;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_WIDTH_CHANGED, source));
        }
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
    __decorate([
        Autowired('gridOptionsWrapper')
    ], Column.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('columnUtils')
    ], Column.prototype, "columnUtils", void 0);
    __decorate([
        Autowired('columnApi')
    ], Column.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], Column.prototype, "gridApi", void 0);
    __decorate([
        Autowired('context')
    ], Column.prototype, "context", void 0);
    __decorate([
        PostConstruct
    ], Column.prototype, "initialise", null);
    return Column;
}());
export { Column };
