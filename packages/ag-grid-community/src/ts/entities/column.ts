import { ColumnGroupChild } from "./columnGroupChild";
import { OriginalColumnGroupChild } from "./originalColumnGroupChild";
import {
    AbstractColDef,
    BaseColDefParams,
    ColDef,
    ColSpanParams,
    IAggFunc,
    IsColumnFunc,
    IsColumnFuncParams,
    RowSpanParams
} from "./colDef";
import { EventService } from "../eventService";
import { _ } from "../utils";
import { Autowired, PostConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ColumnUtils } from "../columnController/columnUtils";
import { RowNode } from "./rowNode";
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { ColumnEvent, ColumnEventType } from "../events";
import { ColumnApi } from "../columnController/columnApi";
import { GridApi } from "../gridApi";
import { ColumnGroup } from "./columnGroup";
import { OriginalColumnGroup } from "./originalColumnGroup";

// Wrapper around a user provide column definition. The grid treats the column definition as ready only.
// This class contains all the runtime information about a column, plus some logic (the definition has no logic).
// This class implements both interfaces ColumnGroupChild and OriginalColumnGroupChild as the class can
// appear as a child of either the original tree or the displayed tree. However the relevant group classes
// for each type only implements one, as each group can only appear in it's associated tree (eg OriginalColumnGroup
// can only appear in OriginalColumn tree).
export class Column implements ColumnGroupChild, OriginalColumnGroupChild, IEventEmitter {

    // + renderedHeaderCell - for making header cell transparent when moving
    public static EVENT_MOVING_CHANGED = 'movingChanged';
    // + renderedCell - changing left position
    public static EVENT_LEFT_CHANGED = 'leftChanged';
    // + renderedCell - changing width
    public static EVENT_WIDTH_CHANGED = 'widthChanged';
    // + renderedCell - for changing pinned classes
    public static EVENT_LAST_LEFT_PINNED_CHANGED = 'lastLeftPinnedChanged';
    public static EVENT_FIRST_RIGHT_PINNED_CHANGED = 'firstRightPinnedChanged';
    // + renderedColumn - for changing visibility icon
    public static EVENT_VISIBLE_CHANGED = 'visibleChanged';
    // + every time the filter changes, used in the floating filters
    public static EVENT_FILTER_CHANGED = 'filterChanged';
    // + renderedHeaderCell - marks the header with filter icon
    public static EVENT_FILTER_ACTIVE_CHANGED = 'filterActiveChanged';
    // + renderedHeaderCell - marks the header with sort icon
    public static EVENT_SORT_CHANGED = 'sortChanged';

    public static EVENT_MENU_VISIBLE_CHANGED = 'menuVisibleChanged';

    // + toolpanel, for gui updates
    public static EVENT_ROW_GROUP_CHANGED = 'columnRowGroupChanged';
    // + toolpanel, for gui updates
    public static EVENT_PIVOT_CHANGED = 'columnPivotChanged';
    // + toolpanel, for gui updates
    public static EVENT_VALUE_CHANGED = 'columnValueChanged';

    public static PINNED_RIGHT = 'right';
    public static PINNED_LEFT = 'left';

    public static SORT_ASC = 'asc';
    public static SORT_DESC = 'desc';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnUtils') private columnUtils: ColumnUtils;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private readonly colId: any;
    private colDef: ColDef;

    // We do NOT use this anywhere, we just keep a reference. this is to check object equivalence
    // when the user provides an updated list of columns - so we can check if we have a column already
    // existing for a col def. we cannot use the this.colDef as that is the result of a merge.
    // This is used in ColumnFactory
    private userProvidedColDef: ColDef;

    private actualWidth: any;

    private visible: any;
    private pinned: string | null;
    private left: number;
    private oldLeft: number;
    private aggFunc: string | IAggFunc | null;
    private sort: string;
    private sortedAt: number;
    private moving = false;
    private menuVisible = false;

    private lastLeftPinned: boolean;
    private firstRightPinned: boolean;

    private minWidth: number;
    private maxWidth: number;

    private filterActive = false;

    private eventService: EventService = new EventService();

    private fieldContainsDots: boolean;
    private tooltipFieldContainsDots: boolean;

    private rowGroupActive = false;
    private pivotActive = false;
    private aggregationActive = false;

    private readonly primary: boolean;

    private parent: ColumnGroup;
    private originalParent: OriginalColumnGroup;

    constructor(colDef: ColDef, userProvidedColDef: ColDef | null, colId: String, primary: boolean) {
        this.colDef = colDef;
        this.userProvidedColDef = userProvidedColDef;
        this.visible = !colDef.hide;
        this.sort = colDef.sort;
        this.sortedAt = colDef.sortedAt;
        this.colId = colId;
        this.primary = primary;
    }

    // gets called when user provides an alternative colDef, eg
    public setColDef(colDef: ColDef, userProvidedColDef: ColDef | null): void {
        this.colDef = colDef;
        this.userProvidedColDef = userProvidedColDef;
    }

    public getUserProvidedColDef(): ColDef {
        return this.userProvidedColDef;
    }

    public setParent(parent: ColumnGroup): void {
        this.parent = parent;
    }

    public getParent(): ColumnGroup {
        return this.parent;
    }

    public setOriginalParent(originalParent: OriginalColumnGroup | null): void {
        this.originalParent = originalParent;
    }

    public getOriginalParent(): OriginalColumnGroup | null {
        return this.originalParent;
    }

    // this is done after constructor as it uses gridOptionsWrapper
    @PostConstruct
    public initialise(): void {
        this.setPinned(this.colDef.pinned);

        const minColWidth = this.gridOptionsWrapper.getMinColWidth();
        const maxColWidth = this.gridOptionsWrapper.getMaxColWidth();

        if (this.colDef.minWidth) {
            this.minWidth = this.colDef.minWidth;
        } else {
            this.minWidth = minColWidth;
        }

        if (this.colDef.maxWidth) {
            this.maxWidth = this.colDef.maxWidth;
        } else {
            this.maxWidth = maxColWidth;
        }

        this.actualWidth = this.columnUtils.calculateColInitialWidth(this.colDef);

        const suppressDotNotation = this.gridOptionsWrapper.isSuppressFieldDotNotation();
        this.fieldContainsDots = _.exists(this.colDef.field) && this.colDef.field.indexOf('.') >= 0 && !suppressDotNotation;
        this.tooltipFieldContainsDots = _.exists(this.colDef.tooltipField) && this.colDef.tooltipField.indexOf('.') >= 0 && !suppressDotNotation;

        this.validate();
    }

    public isEmptyGroup(): boolean {
        return false;
    }

    public isRowGroupDisplayed(colId: string): boolean {
        if (_.missing(this.colDef) || _.missing(this.colDef.showRowGroup)) {
            return false;
        }

        const showingAllGroups = this.colDef.showRowGroup === true;
        const showingThisGroup = this.colDef.showRowGroup === colId;

        return showingAllGroups || showingThisGroup;
    }

    public getUniqueId(): string {
        return this.getId();
    }

    public isPrimary(): boolean {
        return this.primary;
    }

    public isFilterAllowed(): boolean {
        // filter defined means it's a string, class or true.
        // if its false, null or undefined then it's false.
        const filterDefined = !!this.colDef.filter || !!this.colDef.filterFramework;
        return this.primary && filterDefined;
    }

    public isFieldContainsDots(): boolean {
        return this.fieldContainsDots;
    }

    public isTooltipFieldContainsDots(): boolean {
        return this.tooltipFieldContainsDots;
    }

    private validate(): void {

        const colDefAny = this.colDef as any;

        if (!this.gridOptionsWrapper.isEnterprise()) {
            const itemsNotAllowedWithoutEnterprise =
                ['enableRowGroup', 'rowGroup', 'rowGroupIndex', 'enablePivot', 'enableValue', 'pivot', 'pivotIndex', 'aggFunc', 'chartDataType'];
            itemsNotAllowedWithoutEnterprise.forEach(item => {
                if (_.exists(colDefAny[item])) {
                    console.warn(`ag-Grid: ${item} is only valid in ag-Grid-Enterprise, your column definition should not have ${item}`);
                }
            });
        }

        if (this.gridOptionsWrapper.isTreeData()) {
            const itemsNotAllowedWithTreeData =
                ['rowGroup', 'rowGroupIndex', 'pivot', 'pivotIndex'];
            itemsNotAllowedWithTreeData.forEach(item => {
                if (_.exists(colDefAny[item])) {
                    console.warn(`ag-Grid: ${item} is not possible when doing tree data, your column definition should not have ${item}`);
                }
            });
        }

        if (_.exists(this.colDef.width) && typeof this.colDef.width !== 'number') {
            console.warn('ag-Grid: colDef.width should be a number, not ' + typeof this.colDef.width);
        }

        if (_.get(this, 'colDef.cellRendererParams.restrictToOneGroup', null)) {
            console.warn('ag-Grid: Since ag-grid 11.0.0 cellRendererParams.restrictToOneGroup is deprecated. You should use showRowGroup');
        }

        if (_.get(this, 'colDef.cellRendererParams.keyMap', null)) {
            console.warn('ag-Grid: Since ag-grid 11.0.0 cellRendererParams.keyMap is deprecated. You should use colDef.keyCreator');
        }

        if (_.get(this, 'colDef.cellRendererParams.keyMap', null)) {
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
            if (_.missing(this.colDef.valueFormatter)) {
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
            console.warn(`ag-Grid: since v20, colDef.suppressSorting is gone, instead use colDef.sortable=false.`, this.colDef);
            this.colDef.sortable = false;
        }

        if (colDefAny.suppressFilter) {
            console.warn(`ag-Grid: since v20, colDef.suppressFilter is gone, instead use colDef.filter=false.`, this.colDef);
            this.colDef.filter = false;
        }

        if (colDefAny.suppressResize) {
            console.warn(`ag-Grid: since v20, colDef.suppressResize is gone, instead use colDef.resizable=false.`, this.colDef);
            this.colDef.resizable = false;
        }

        if (colDefAny.tooltip) {
            console.warn(`ag-Grid: since v20.1, colDef.tooltip is gone, instead use colDef.tooltipValueGetter.`, this.colDef);
            this.colDef.tooltipValueGetter = colDefAny.tooltip;
        }

    }

    public addEventListener(eventType: string, listener: Function): void {
        this.eventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.eventService.removeEventListener(eventType, listener);
    }

    private createIsColumnFuncParams(rowNode: RowNode): IsColumnFuncParams {
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

    public isSuppressNavigable(rowNode: RowNode): boolean {
        // if boolean set, then just use it
        if (typeof this.colDef.suppressNavigable === 'boolean') {
            return this.colDef.suppressNavigable as boolean;
        }

        // if function, then call the function to find out
        if (typeof this.colDef.suppressNavigable === 'function') {
            const params = this.createIsColumnFuncParams(rowNode);
            const userFunc = this.colDef.suppressNavigable as IsColumnFunc;
            return userFunc(params);
        }

        return false;
    }

    public isCellEditable(rowNode: RowNode): boolean {

        // only allow editing of groups if the user has this option enabled
        if (rowNode.group && !this.gridOptionsWrapper.isEnableGroupEdit()) {
            return false;
        }

        return this.isColumnFunc(rowNode, this.colDef.editable);
    }

    public isRowDrag(rowNode: RowNode): boolean {
        return this.isColumnFunc(rowNode, this.colDef.rowDrag);
    }

    public isDndSource(rowNode: RowNode): boolean {
        return this.isColumnFunc(rowNode, this.colDef.dndSource);
    }

    public isCellCheckboxSelection(rowNode: RowNode): boolean {
        return this.isColumnFunc(rowNode, this.colDef.checkboxSelection);
    }

    public isSuppressPaste(rowNode: RowNode): boolean {
        return this.isColumnFunc(rowNode, this.colDef ? this.colDef.suppressPaste : null);
    }

    public isResizable(): boolean {
        return this.colDef.resizable === true;
    }

    private isColumnFunc(rowNode: RowNode, value: boolean | IsColumnFunc): boolean {
        // if boolean set, then just use it
        if (typeof value === 'boolean') {
            return value as boolean;
        }

        // if function, then call the function to find out
        if (typeof value === 'function') {
            const params = this.createIsColumnFuncParams(rowNode);
            const editableFunc = value as IsColumnFunc;
            return editableFunc(params);
        }

        return false;
    }

    public setMoving(moving: boolean, source: ColumnEventType = "api"): void {
        this.moving = moving;
        this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_MOVING_CHANGED, source));
    }

    private createColumnEvent(type: string, source: ColumnEventType): ColumnEvent {
        return {
            api: this.gridApi,
            columnApi: this.columnApi,
            type: type,
            column: this,
            columns: [this],
            source: source
        };
    }

    public isMoving(): boolean {
        return this.moving;
    }

    public getSort(): string {
        return this.sort;
    }

    public setSort(sort: string | null | undefined, source: ColumnEventType = "api"): void {
        if (this.sort !== sort) {
            this.sort = sort;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_SORT_CHANGED, source));
        }
    }

    public setMenuVisible(visible: boolean, source: ColumnEventType = "api"): void {
        if (this.menuVisible !== visible) {
            this.menuVisible = visible;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_MENU_VISIBLE_CHANGED, source));
        }
    }

    public isMenuVisible(): boolean {
        return this.menuVisible;
    }

    public isSortAscending(): boolean {
        return this.sort === Column.SORT_ASC;
    }

    public isSortDescending(): boolean {
        return this.sort === Column.SORT_DESC;
    }

    public isSortNone(): boolean {
        return _.missing(this.sort);
    }

    public isSorting(): boolean {
        return _.exists(this.sort);
    }

    public getSortedAt(): number {
        return this.sortedAt;
    }

    public setSortedAt(sortedAt: number | null): void {
        this.sortedAt = sortedAt;
    }

    public setAggFunc(aggFunc: string | IAggFunc | null | undefined): void {
        this.aggFunc = aggFunc;
    }

    public getAggFunc(): string | IAggFunc {
        return this.aggFunc;
    }

    public getLeft(): number {
        return this.left;
    }

    public getOldLeft(): number {
        return this.oldLeft;
    }

    public getRight(): number {
        return this.left + this.actualWidth;
    }

    public setLeft(left: number | null, source: ColumnEventType = "api") {
        this.oldLeft = this.left;
        if (this.left !== left) {
            this.left = left;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_LEFT_CHANGED, source));
        }
    }

    public isFilterActive(): boolean {
        return this.filterActive;
    }

    // additionalEventAttributes is used by provided simple floating filter, so it can add 'floatingFilter=true' to the event
    public setFilterActive(active: boolean, source: ColumnEventType = "api", additionalEventAttributes?: any): void {
        if (this.filterActive !== active) {
            this.filterActive = active;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_FILTER_ACTIVE_CHANGED, source));
        }
        const filterChangedEvent = this.createColumnEvent(Column.EVENT_FILTER_CHANGED, source);
        if (additionalEventAttributes) {
            _.mergeDeep(filterChangedEvent, additionalEventAttributes);
        }
        this.eventService.dispatchEvent(filterChangedEvent);
    }

    public setPinned(pinned: string | boolean | null | undefined): void {
        if (pinned === true || pinned === Column.PINNED_LEFT) {
            this.pinned = Column.PINNED_LEFT;
        } else if (pinned === Column.PINNED_RIGHT) {
            this.pinned = Column.PINNED_RIGHT;
        } else {
            this.pinned = null;
        }
    }

    public setFirstRightPinned(firstRightPinned: boolean, source: ColumnEventType = "api"): void {
        if (this.firstRightPinned !== firstRightPinned) {
            this.firstRightPinned = firstRightPinned;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, source));
        }
    }

    public setLastLeftPinned(lastLeftPinned: boolean, source: ColumnEventType = "api"): void {
        if (this.lastLeftPinned !== lastLeftPinned) {
            this.lastLeftPinned = lastLeftPinned;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_LAST_LEFT_PINNED_CHANGED, source));
        }
    }

    public isFirstRightPinned(): boolean {
        return this.firstRightPinned;
    }

    public isLastLeftPinned(): boolean {
        return this.lastLeftPinned;
    }

    public isPinned(): boolean {
        return this.pinned === Column.PINNED_LEFT || this.pinned === Column.PINNED_RIGHT;
    }

    public isPinnedLeft(): boolean {
        return this.pinned === Column.PINNED_LEFT;
    }

    public isPinnedRight(): boolean {
        return this.pinned === Column.PINNED_RIGHT;
    }

    public getPinned(): string {
        return this.pinned;
    }

    public setVisible(visible: boolean, source: ColumnEventType = "api"): void {
        const newValue = visible === true;
        if (this.visible !== newValue) {
            this.visible = newValue;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_VISIBLE_CHANGED, source));
        }
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public getColDef(): ColDef {
        return this.colDef;
    }

    public getColumnGroupShow(): string {
        return this.colDef.columnGroupShow;
    }

    public getColId(): string {
        return this.colId;
    }

    public getId(): string {
        return this.getColId();
    }

    public getDefinition(): AbstractColDef {
        return this.colDef;
    }

    public getActualWidth(): number {
        return this.actualWidth;
    }

    private createBaseColDefParams(rowNode: RowNode): BaseColDefParams {
        const params: BaseColDefParams = {
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

    public getColSpan(rowNode: RowNode): number {
        if (_.missing(this.colDef.colSpan)) { return 1; }
        const params: ColSpanParams = this.createBaseColDefParams(rowNode);
        const colSpan = this.colDef.colSpan(params);
        // colSpan must be number equal to or greater than 1

        return Math.max(colSpan, 1);
    }

    public getRowSpan(rowNode: RowNode): number {
        if (_.missing(this.colDef.rowSpan)) { return 1; }
        const params: RowSpanParams = this.createBaseColDefParams(rowNode);
        const rowSpan = this.colDef.rowSpan(params);
        // rowSpan must be number equal to or greater than 1

        return Math.max(rowSpan, 1);
    }

    public setActualWidth(actualWidth: number, source: ColumnEventType = "api"): void {
        if (this.actualWidth !== actualWidth) {
            this.actualWidth = actualWidth;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_WIDTH_CHANGED, source));
        }
    }

    public isGreaterThanMax(width: number): boolean {
        if (this.maxWidth) {
            return width > this.maxWidth;
        }
        return false;
    }

    public getMinWidth(): number {
        return this.minWidth;
    }

    public getMaxWidth(): number {
        return this.maxWidth;
    }

    public setMinimum(source: ColumnEventType = "api"): void {
        this.setActualWidth(this.minWidth, source);
    }

    public setRowGroupActive(rowGroup: boolean, source: ColumnEventType = "api"): void {
        if (this.rowGroupActive !== rowGroup) {
            this.rowGroupActive = rowGroup;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_ROW_GROUP_CHANGED, source));
        }
    }

    public isRowGroupActive(): boolean {
        return this.rowGroupActive;
    }

    public setPivotActive(pivot: boolean, source: ColumnEventType = "api"): void {
        if (this.pivotActive !== pivot) {
            this.pivotActive = pivot;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_PIVOT_CHANGED, source));
        }
    }

    public isPivotActive(): boolean {
        return this.pivotActive;
    }

    public isAnyFunctionActive(): boolean {
        return this.isPivotActive() || this.isRowGroupActive() || this.isValueActive();
    }

    public isAnyFunctionAllowed(): boolean {
        return this.isAllowPivot() || this.isAllowRowGroup() || this.isAllowValue();
    }

    public setValueActive(value: boolean, source: ColumnEventType = "api"): void {
        if (this.aggregationActive !== value) {
            this.aggregationActive = value;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_VALUE_CHANGED, source));
        }
    }

    public isValueActive(): boolean {
        return this.aggregationActive;
    }

    public isAllowPivot(): boolean {
        return this.colDef.enablePivot === true;
    }

    public isAllowValue(): boolean {
        return this.colDef.enableValue === true;
    }

    public isAllowRowGroup(): boolean {
        return this.colDef.enableRowGroup === true;
    }

    public getMenuTabs(defaultValues: string[]): string [] {
        let menuTabs: string[] = this.getColDef().menuTabs;
        if (menuTabs == null) {
            menuTabs = defaultValues;
        }
        return menuTabs;
    }

    // this used to be needed, as previous version of ag-grid had lockPosition as column state,
    // so couldn't depend on colDef version.
    public isLockPosition(): boolean {
        console.warn('ag-Grid: since v21, col.isLockPosition() should not be used, please use col.getColDef().lockPosition instead.');
        return this.colDef ? !!this.colDef.lockPosition : false;
    }

    // this used to be needed, as previous version of ag-grid had lockVisible as column state,
    // so couldn't depend on colDef version.
    public isLockVisible(): boolean {
        console.warn('ag-Grid: since v21, col.isLockVisible() should not be used, please use col.getColDef().lockVisible instead.');
        return this.colDef ? !!this.colDef.lockVisible : false;
    }

    // this used to be needed, as previous version of ag-grid had lockPinned as column state,
    // so couldn't depend on colDef version.
    public isLockPinned(): boolean {
        console.warn('ag-Grid: since v21, col.isLockPinned() should not be used, please use col.getColDef().lockPinned instead.');
        return this.colDef ? !!this.colDef.lockPinned : false;
    }

}
