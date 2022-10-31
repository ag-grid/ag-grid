/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { EventService } from "../eventService";
import { Autowired, PostConstruct } from "../context/context";
import { Constants } from "../constants/constants";
import { ModuleNames } from "../modules/moduleNames";
import { ModuleRegistry } from "../modules/moduleRegistry";
import { attrToNumber, attrToBoolean, exists, missing } from "../utils/generic";
import { doOnce } from "../utils/function";
import { mergeDeep } from "../utils/object";
let instanceIdSequence = 0;
// Wrapper around a user provide column definition. The grid treats the column definition as ready only.
// This class contains all the runtime information about a column, plus some logic (the definition has no logic).
// This class implements both interfaces ColumnGroupChild and ProvidedColumnGroupChild as the class can
// appear as a child of either the original tree or the displayed tree. However the relevant group classes
// for each type only implements one, as each group can only appear in it's associated tree (eg ProvidedColumnGroup
// can only appear in OriginalColumn tree).
export class Column {
    constructor(colDef, userProvidedColDef, colId, primary) {
        // used by React (and possibly other frameworks) as key for rendering
        this.instanceId = instanceIdSequence++;
        // The measured height of this column's header when autoHeaderHeight is enabled
        this.autoHeaderHeight = null;
        this.moving = false;
        this.menuVisible = false;
        this.filterActive = false;
        this.eventService = new EventService();
        this.rowGroupActive = false;
        this.pivotActive = false;
        this.aggregationActive = false;
        this.colDef = colDef;
        this.userProvidedColDef = userProvidedColDef;
        this.colId = colId;
        this.primary = primary;
        this.setState(colDef);
    }
    getInstanceId() {
        return this.instanceId;
    }
    setState(colDef) {
        // sort
        if (colDef.sort !== undefined) {
            if (colDef.sort === Constants.SORT_ASC || colDef.sort === Constants.SORT_DESC) {
                this.sort = colDef.sort;
            }
        }
        else {
            if (colDef.initialSort === Constants.SORT_ASC || colDef.initialSort === Constants.SORT_DESC) {
                this.sort = colDef.initialSort;
            }
        }
        // sortIndex
        const sortIndex = attrToNumber(colDef.sortIndex);
        const initialSortIndex = attrToNumber(colDef.initialSortIndex);
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
        const hide = attrToBoolean(colDef.hide);
        const initialHide = attrToBoolean(colDef.initialHide);
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
        const flex = attrToNumber(colDef.flex);
        const initialFlex = attrToNumber(colDef.initialFlex);
        if (flex !== undefined) {
            this.flex = flex;
        }
        else if (initialFlex !== undefined) {
            this.flex = initialFlex;
        }
    }
    // gets called when user provides an alternative colDef, eg
    setColDef(colDef, userProvidedColDef) {
        this.colDef = colDef;
        this.userProvidedColDef = userProvidedColDef;
        this.initMinAndMaxWidths();
        this.initDotNotation();
        this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_COL_DEF_CHANGED, "api"));
    }
    /**
     * Returns the column definition provided by the application.
     * This may not be correct, as items can be superseded by default column options.
     * However it's useful for comparison, eg to know which application column definition matches that column.
     */
    getUserProvidedColDef() {
        return this.userProvidedColDef;
    }
    setParent(parent) {
        this.parent = parent;
    }
    /** Returns the parent column group, if column grouping is active. */
    getParent() {
        return this.parent;
    }
    setOriginalParent(originalParent) {
        this.originalParent = originalParent;
    }
    getOriginalParent() {
        return this.originalParent;
    }
    // this is done after constructor as it uses gridOptionsWrapper
    initialise() {
        this.initMinAndMaxWidths();
        this.resetActualWidth('gridInitializing');
        this.initDotNotation();
        this.validate();
    }
    initDotNotation() {
        const suppressDotNotation = this.gridOptionsWrapper.isSuppressFieldDotNotation();
        this.fieldContainsDots = exists(this.colDef.field) && this.colDef.field.indexOf('.') >= 0 && !suppressDotNotation;
        this.tooltipFieldContainsDots = exists(this.colDef.tooltipField) && this.colDef.tooltipField.indexOf('.') >= 0 && !suppressDotNotation;
    }
    initMinAndMaxWidths() {
        const colDef = this.colDef;
        this.minWidth = this.columnUtils.calculateColMinWidth(colDef);
        this.maxWidth = this.columnUtils.calculateColMaxWidth(colDef);
    }
    resetActualWidth(source = 'api') {
        const initialWidth = this.columnUtils.calculateColInitialWidth(this.colDef);
        this.setActualWidth(initialWidth, source, true);
    }
    isEmptyGroup() {
        return false;
    }
    isRowGroupDisplayed(colId) {
        if (missing(this.colDef) || missing(this.colDef.showRowGroup)) {
            return false;
        }
        const showingAllGroups = this.colDef.showRowGroup === true;
        const showingThisGroup = this.colDef.showRowGroup === colId;
        return showingAllGroups || showingThisGroup;
    }
    /** Returns `true` if column is a primary column, `false` if secondary. Secondary columns are used for pivoting. */
    isPrimary() {
        return this.primary;
    }
    /** Returns `true` if column filtering is allowed. */
    isFilterAllowed() {
        // filter defined means it's a string, class or true.
        // if its false, null or undefined then it's false.
        const filterDefined = !!this.colDef.filter || !!this.colDef.filterFramework;
        return filterDefined;
    }
    isFieldContainsDots() {
        return this.fieldContainsDots;
    }
    isTooltipFieldContainsDots() {
        return this.tooltipFieldContainsDots;
    }
    validate() {
        const colDefAny = this.colDef;
        function warnOnce(msg, key, obj) {
            doOnce(() => {
                if (obj) {
                    console.warn(msg, obj);
                }
                else {
                    doOnce(() => console.warn(msg), key);
                }
            }, key);
        }
        const usingCSRM = this.gridOptionsWrapper.isRowModelDefault();
        if (usingCSRM && !ModuleRegistry.isRegistered(ModuleNames.RowGroupingModule)) {
            const rowGroupingItems = ['enableRowGroup', 'rowGroup', 'rowGroupIndex', 'enablePivot', 'enableValue', 'pivot', 'pivotIndex', 'aggFunc'];
            rowGroupingItems.forEach(item => {
                if (exists(colDefAny[item])) {
                    if (ModuleRegistry.isPackageBased()) {
                        warnOnce(`AG Grid: ${item} is only valid in ag-grid-enterprise, your column definition should not have ${item}`, 'ColumnRowGroupingMissing' + item);
                    }
                    else {
                        warnOnce(`AG Grid: ${item} is only valid with AG Grid Enterprise Module ${ModuleNames.RowGroupingModule} - your column definition should not have ${item}`, 'ColumnRowGroupingMissing' + item);
                    }
                }
            });
        }
        if (!ModuleRegistry.isRegistered(ModuleNames.RichSelectModule)) {
            if (this.colDef.cellEditor === 'agRichSelect' || this.colDef.cellEditor === 'agRichSelectCellEditor') {
                if (ModuleRegistry.isPackageBased()) {
                    warnOnce(`AG Grid: ${this.colDef.cellEditor} can only be used with ag-grid-enterprise`, 'ColumnRichSelectMissing');
                }
                else {
                    warnOnce(`AG Grid: ${this.colDef.cellEditor} can only be used with AG Grid Enterprise Module ${ModuleNames.RichSelectModule}`, 'ColumnRichSelectMissing');
                }
            }
        }
        if (this.gridOptionsWrapper.isTreeData()) {
            const itemsNotAllowedWithTreeData = ['rowGroup', 'rowGroupIndex', 'pivot', 'pivotIndex'];
            itemsNotAllowedWithTreeData.forEach(item => {
                if (exists(colDefAny[item])) {
                    warnOnce(`AG Grid: ${item} is not possible when doing tree data, your column definition should not have ${item}`, 'TreeDataCannotRowGroup');
                }
            });
        }
        if (exists(this.colDef.width) && typeof this.colDef.width !== 'number') {
            warnOnce('AG Grid: colDef.width should be a number, not ' + typeof this.colDef.width, 'ColumnCheck_asdfawef');
        }
        if (colDefAny.pinnedRowCellRenderer) {
            warnOnce('AG Grid: pinnedRowCellRenderer no longer exists, use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned. This was an unfortunate (but necessary) change we had to do to allow future plans we have of re-skinng the data grid in frameworks such as React, Angular and Vue. See https://www.ag-grid.com/javascript-grid/cell-rendering/#many-renderers-one-column', 'colDef.pinnedRowCellRenderer-deprecated');
        }
        if (colDefAny.pinnedRowCellRendererParams) {
            warnOnce('AG Grid: pinnedRowCellRenderer no longer exists, use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned. This was an unfortunate (but necessary) change we had to do to allow future plans we have of re-skinng the data grid in frameworks such as React, Angular and Vue. See https://www.ag-grid.com/javascript-grid/cell-rendering/#many-renderers-one-column', 'colDef.pinnedRowCellRenderer-deprecated');
        }
        if (colDefAny.pinnedRowCellRendererFramework) {
            warnOnce('AG Grid: pinnedRowCellRenderer no longer exists, use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned. This was an unfortunate (but necessary) change we had to do to allow future plans we have of re-skinng the data grid in frameworks such as React, Angular and Vue. See https://www.ag-grid.com/javascript-grid/cell-rendering/#many-renderers-one-column', 'colDef.pinnedRowCellRenderer-deprecated');
        }
        if (colDefAny.pinnedRowValueGetter) {
            warnOnce('AG Grid: pinnedRowCellRenderer is deprecated, use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned. This was an unfortunate (but necessary) change we had to do to allow future plans we have of re-skinng the data grid in frameworks such as React, Angular and Vue.', 'colDef.pinnedRowCellRenderer-deprecated');
        }
    }
    /** Add an event listener to the column. */
    addEventListener(eventType, listener) {
        this.eventService.addEventListener(eventType, listener);
    }
    /** Remove event listener from the column. */
    removeEventListener(eventType, listener) {
        this.eventService.removeEventListener(eventType, listener);
    }
    createColumnFunctionCallbackParams(rowNode) {
        return {
            node: rowNode,
            data: rowNode.data,
            column: this,
            colDef: this.colDef,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
    }
    isSuppressNavigable(rowNode) {
        // if boolean set, then just use it
        if (typeof this.colDef.suppressNavigable === 'boolean') {
            return this.colDef.suppressNavigable;
        }
        // if function, then call the function to find out
        if (typeof this.colDef.suppressNavigable === 'function') {
            const params = this.createColumnFunctionCallbackParams(rowNode);
            const userFunc = this.colDef.suppressNavigable;
            return userFunc(params);
        }
        return false;
    }
    isCellEditable(rowNode) {
        // only allow editing of groups if the user has this option enabled
        if (rowNode.group && !this.gridOptionsWrapper.isEnableGroupEdit()) {
            return false;
        }
        return this.isColumnFunc(rowNode, this.colDef.editable);
    }
    isSuppressFillHandle() {
        return !!attrToBoolean(this.colDef.suppressFillHandle);
    }
    isAutoHeight() {
        return !!attrToBoolean(this.colDef.autoHeight);
    }
    isAutoHeaderHeight() {
        return !!attrToBoolean(this.colDef.autoHeaderHeight);
    }
    isRowDrag(rowNode) {
        return this.isColumnFunc(rowNode, this.colDef.rowDrag);
    }
    isDndSource(rowNode) {
        return this.isColumnFunc(rowNode, this.colDef.dndSource);
    }
    isCellCheckboxSelection(rowNode) {
        return this.isColumnFunc(rowNode, this.colDef.checkboxSelection);
    }
    isSuppressPaste(rowNode) {
        return this.isColumnFunc(rowNode, this.colDef ? this.colDef.suppressPaste : null);
    }
    isResizable() {
        return !!attrToBoolean(this.colDef.resizable);
    }
    isColumnFunc(rowNode, value) {
        // if boolean set, then just use it
        if (typeof value === 'boolean') {
            return value;
        }
        // if function, then call the function to find out
        if (typeof value === 'function') {
            const params = this.createColumnFunctionCallbackParams(rowNode);
            const editableFunc = value;
            return editableFunc(params);
        }
        return false;
    }
    setMoving(moving, source = "api") {
        this.moving = moving;
        this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_MOVING_CHANGED, source));
    }
    createColumnEvent(type, source) {
        return {
            type: type,
            column: this,
            columns: [this],
            source: source,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext()
        };
    }
    isMoving() {
        return this.moving;
    }
    /** If sorting is active, returns the sort direction e.g. `'asc'` or `'desc'`. */
    getSort() {
        return this.sort;
    }
    setSort(sort, source = "api") {
        if (this.sort !== sort) {
            this.sort = sort;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_SORT_CHANGED, source));
        }
    }
    setMenuVisible(visible, source = "api") {
        if (this.menuVisible !== visible) {
            this.menuVisible = visible;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_MENU_VISIBLE_CHANGED, source));
        }
    }
    isMenuVisible() {
        return this.menuVisible;
    }
    isSortAscending() {
        return this.sort === Constants.SORT_ASC;
    }
    isSortDescending() {
        return this.sort === Constants.SORT_DESC;
    }
    isSortNone() {
        return missing(this.sort);
    }
    isSorting() {
        return exists(this.sort);
    }
    getSortIndex() {
        return this.sortIndex;
    }
    setSortIndex(sortOrder) {
        this.sortIndex = sortOrder;
    }
    setAggFunc(aggFunc) {
        this.aggFunc = aggFunc;
    }
    /** If aggregation is set for the column, returns the aggregation function. */
    getAggFunc() {
        return this.aggFunc;
    }
    getLeft() {
        return this.left;
    }
    getOldLeft() {
        return this.oldLeft;
    }
    getRight() {
        return this.left + this.actualWidth;
    }
    setLeft(left, source = "api") {
        this.oldLeft = this.left;
        if (this.left !== left) {
            this.left = left;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_LEFT_CHANGED, source));
        }
    }
    /** Returns `true` if filter is active on the column. */
    isFilterActive() {
        return this.filterActive;
    }
    // additionalEventAttributes is used by provided simple floating filter, so it can add 'floatingFilter=true' to the event
    setFilterActive(active, source = "api", additionalEventAttributes) {
        if (this.filterActive !== active) {
            this.filterActive = active;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_FILTER_ACTIVE_CHANGED, source));
        }
        const filterChangedEvent = this.createColumnEvent(Column.EVENT_FILTER_CHANGED, source);
        if (additionalEventAttributes) {
            mergeDeep(filterChangedEvent, additionalEventAttributes);
        }
        this.eventService.dispatchEvent(filterChangedEvent);
    }
    setPinned(pinned) {
        if (pinned === true || pinned === Constants.PINNED_LEFT) {
            this.pinned = Constants.PINNED_LEFT;
        }
        else if (pinned === Constants.PINNED_RIGHT) {
            this.pinned = Constants.PINNED_RIGHT;
        }
        else {
            this.pinned = null;
        }
    }
    setFirstRightPinned(firstRightPinned, source = "api") {
        if (this.firstRightPinned !== firstRightPinned) {
            this.firstRightPinned = firstRightPinned;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, source));
        }
    }
    setLastLeftPinned(lastLeftPinned, source = "api") {
        if (this.lastLeftPinned !== lastLeftPinned) {
            this.lastLeftPinned = lastLeftPinned;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_LAST_LEFT_PINNED_CHANGED, source));
        }
    }
    isFirstRightPinned() {
        return this.firstRightPinned;
    }
    isLastLeftPinned() {
        return this.lastLeftPinned;
    }
    isPinned() {
        return this.pinned === Constants.PINNED_LEFT || this.pinned === Constants.PINNED_RIGHT;
    }
    isPinnedLeft() {
        return this.pinned === Constants.PINNED_LEFT;
    }
    isPinnedRight() {
        return this.pinned === Constants.PINNED_RIGHT;
    }
    getPinned() {
        return this.pinned;
    }
    setVisible(visible, source = "api") {
        const newValue = visible === true;
        if (this.visible !== newValue) {
            this.visible = newValue;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_VISIBLE_CHANGED, source));
        }
    }
    isVisible() {
        return this.visible;
    }
    /** Returns the column definition for this column.
     * The column definition will be the result of merging the application provided column definition with any provided defaults
     * (e.g. `defaultColDef` grid option, or column types.
     *
     * Equivalent: `getDefinition` */
    getColDef() {
        return this.colDef;
    }
    getColumnGroupShow() {
        return this.colDef.columnGroupShow;
    }
    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getId`, `getUniqueId` */
    getColId() {
        return this.colId;
    }
    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getColId`, `getUniqueId` */
    getId() {
        return this.getColId();
    }
    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getColId`, `getId` */
    getUniqueId() {
        return this.getId();
    }
    getDefinition() {
        return this.colDef;
    }
    /** Returns the current width of the column. If the column is resized, the actual width is the new size. */
    getActualWidth() {
        return this.actualWidth;
    }
    getAutoHeaderHeight() {
        return this.autoHeaderHeight;
    }
    /** Returns true if the header height has changed */
    setAutoHeaderHeight(height) {
        const changed = height !== this.autoHeaderHeight;
        this.autoHeaderHeight = height;
        return changed;
    }
    createBaseColDefParams(rowNode) {
        const params = {
            node: rowNode,
            data: rowNode.data,
            colDef: this.colDef,
            column: this,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext()
        };
        return params;
    }
    getColSpan(rowNode) {
        if (missing(this.colDef.colSpan)) {
            return 1;
        }
        const params = this.createBaseColDefParams(rowNode);
        const colSpan = this.colDef.colSpan(params);
        // colSpan must be number equal to or greater than 1
        return Math.max(colSpan, 1);
    }
    getRowSpan(rowNode) {
        if (missing(this.colDef.rowSpan)) {
            return 1;
        }
        const params = this.createBaseColDefParams(rowNode);
        const rowSpan = this.colDef.rowSpan(params);
        // rowSpan must be number equal to or greater than 1
        return Math.max(rowSpan, 1);
    }
    setActualWidth(actualWidth, source = "api", silent = false) {
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
    }
    fireColumnWidthChangedEvent(source) {
        this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_WIDTH_CHANGED, source));
    }
    isGreaterThanMax(width) {
        if (this.maxWidth != null) {
            return width > this.maxWidth;
        }
        return false;
    }
    getMinWidth() {
        return this.minWidth;
    }
    getMaxWidth() {
        return this.maxWidth;
    }
    getFlex() {
        return this.flex || 0;
    }
    // this method should only be used by the columnModel to
    // change flex when required by the setColumnState method.
    setFlex(flex) {
        if (this.flex !== flex) {
            this.flex = flex;
        }
    }
    setMinimum(source = "api") {
        if (exists(this.minWidth)) {
            this.setActualWidth(this.minWidth, source);
        }
    }
    setRowGroupActive(rowGroup, source = "api") {
        if (this.rowGroupActive !== rowGroup) {
            this.rowGroupActive = rowGroup;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_ROW_GROUP_CHANGED, source));
        }
    }
    /** Returns `true` if row group is currently active for this column. */
    isRowGroupActive() {
        return this.rowGroupActive;
    }
    setPivotActive(pivot, source = "api") {
        if (this.pivotActive !== pivot) {
            this.pivotActive = pivot;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_PIVOT_CHANGED, source));
        }
    }
    /** Returns `true` if pivot is currently active for this column. */
    isPivotActive() {
        return this.pivotActive;
    }
    isAnyFunctionActive() {
        return this.isPivotActive() || this.isRowGroupActive() || this.isValueActive();
    }
    isAnyFunctionAllowed() {
        return this.isAllowPivot() || this.isAllowRowGroup() || this.isAllowValue();
    }
    setValueActive(value, source = "api") {
        if (this.aggregationActive !== value) {
            this.aggregationActive = value;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_VALUE_CHANGED, source));
        }
    }
    /** Returns `true` if value (aggregation) is currently active for this column. */
    isValueActive() {
        return this.aggregationActive;
    }
    isAllowPivot() {
        return this.colDef.enablePivot === true;
    }
    isAllowValue() {
        return this.colDef.enableValue === true;
    }
    isAllowRowGroup() {
        return this.colDef.enableRowGroup === true;
    }
    getMenuTabs(defaultValues) {
        let menuTabs = this.getColDef().menuTabs;
        if (menuTabs == null) {
            menuTabs = defaultValues;
        }
        return menuTabs;
    }
    // this used to be needed, as previous version of ag-grid had lockPosition as column state,
    // so couldn't depend on colDef version.
    isLockPosition() {
        console.warn('AG Grid: since v21, col.isLockPosition() should not be used, please use col.getColDef().lockPosition instead.');
        return this.colDef ? !!this.colDef.lockPosition : false;
    }
    // this used to be needed, as previous version of ag-grid had lockVisible as column state,
    // so couldn't depend on colDef version.
    isLockVisible() {
        console.warn('AG Grid: since v21, col.isLockVisible() should not be used, please use col.getColDef().lockVisible instead.');
        return this.colDef ? !!this.colDef.lockVisible : false;
    }
    // this used to be needed, as previous version of ag-grid had lockPinned as column state,
    // so couldn't depend on colDef version.
    isLockPinned() {
        console.warn('AG Grid: since v21, col.isLockPinned() should not be used, please use col.getColDef().lockPinned instead.');
        return this.colDef ? !!this.colDef.lockPinned : false;
    }
}
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
__decorate([
    Autowired('gridOptionsWrapper')
], Column.prototype, "gridOptionsWrapper", void 0);
__decorate([
    Autowired('columnUtils')
], Column.prototype, "columnUtils", void 0);
__decorate([
    PostConstruct
], Column.prototype, "initialise", null);
