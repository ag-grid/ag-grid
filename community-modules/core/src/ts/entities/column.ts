import { IHeaderColumn } from "./iHeaderColumn";
import { IProvidedColumn } from "./iProvidedColumn";
import {
    AbstractColDef,
    BaseColDefParams,
    ColDef,
    ColSpanParams,
    IAggFunc,
    ColumnFunctionCallbackParams,
    RowSpanParams
} from "./colDef";
import { EventService } from "../eventService";
import { Autowired, Context, PostConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ColumnUtils } from "../columns/columnUtils";
import { RowNode } from "./rowNode";
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { ColumnEvent, ColumnEventType } from "../events";
import { ColumnApi } from "../columns/columnApi";
import { GridApi } from "../gridApi";
import { ColumnGroup } from "./columnGroup";
import { ProvidedColumnGroup } from "./providedColumnGroup";
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
export class Column implements IHeaderColumn, IProvidedColumn, IEventEmitter {

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

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnUtils') private columnUtils: ColumnUtils;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('context') private context: Context;

    private readonly colId: any;
    private colDef: ColDef;

    // used by React (and possibly other frameworks) as key for rendering
    private instanceId = instanceIdSequence++;

    // We do NOT use this anywhere, we just keep a reference. this is to check object equivalence
    // when the user provides an updated list of columns - so we can check if we have a column already
    // existing for a col def. we cannot use the this.colDef as that is the result of a merge.
    // This is used in ColumnFactory
    private userProvidedColDef: ColDef | null;

    private actualWidth: any;

    // The measured height of this column's header when autoHeaderHeight is enabled
    private autoHeaderHeight: number | null = null;

    private visible: any;
    private pinned: 'left' | 'right' | null;
    private left: number | null;
    private oldLeft: number | null;
    private aggFunc: string | IAggFunc | null | undefined;
    private sort: 'asc' | 'desc' | null | undefined;
    private sortIndex: number | null | undefined;
    private moving = false;
    private menuVisible = false;

    private lastLeftPinned: boolean;
    private firstRightPinned: boolean;

    private minWidth: number | null | undefined;
    private maxWidth: number | null | undefined;

    private filterActive = false;

    private eventService: EventService = new EventService();

    private fieldContainsDots: boolean;
    private tooltipFieldContainsDots: boolean;

    private rowGroupActive = false;
    private pivotActive = false;
    private aggregationActive = false;
    private flex: number | null | undefined;

    private readonly primary: boolean;

    private parent: ColumnGroup;
    private originalParent: ProvidedColumnGroup | null;

    constructor(colDef: ColDef, userProvidedColDef: ColDef | null, colId: string, primary: boolean) {
        this.colDef = colDef;
        this.userProvidedColDef = userProvidedColDef;
        this.colId = colId;
        this.primary = primary;

        this.setState(colDef);
    }

    public getInstanceId(): number {
        return this.instanceId;
    }

    private setState(colDef: ColDef): void {
        // sort
        if (colDef.sort !== undefined) {
            if (colDef.sort === Constants.SORT_ASC || colDef.sort === Constants.SORT_DESC) {
                this.sort = colDef.sort;
            }
        } else {
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
        } else {
            if (initialSortIndex !== null) {
                this.sortIndex = initialSortIndex;
            }
        }

        // hide
        const hide = attrToBoolean(colDef.hide);
        const initialHide = attrToBoolean(colDef.initialHide);

        if (hide !== undefined) {
            this.visible = !hide;
        } else {
            this.visible = !initialHide;
        }

        // pinned
        if (colDef.pinned !== undefined) {
            this.setPinned(colDef.pinned);
        } else {
            this.setPinned(colDef.initialPinned);
        }

        // flex
        const flex = attrToNumber(colDef.flex);
        const initialFlex = attrToNumber(colDef.initialFlex);
        if (flex !== undefined) {
            this.flex = flex;
        } else if (initialFlex !== undefined) {
            this.flex = initialFlex;
        }
    }

    // gets called when user provides an alternative colDef, eg
    public setColDef(colDef: ColDef, userProvidedColDef: ColDef | null): void {
        this.colDef = colDef;
        this.userProvidedColDef = userProvidedColDef;
        this.initMinAndMaxWidths();
        this.initDotNotation();
    }

    /**
     * Returns the column definition provided by the application.
     * This may not be correct, as items can be superseded by default column options.
     * However it's useful for comparison, eg to know which application column definition matches that column.
     */
    public getUserProvidedColDef(): ColDef | null {
        return this.userProvidedColDef;
    }

    public setParent(parent: ColumnGroup): void {
        this.parent = parent;
    }

    /** Returns the parent column group, if column grouping is active. */
    public getParent(): ColumnGroup {
        return this.parent;
    }

    public setOriginalParent(originalParent: ProvidedColumnGroup | null): void {
        this.originalParent = originalParent;
    }

    public getOriginalParent(): ProvidedColumnGroup | null {
        return this.originalParent;
    }

    // this is done after constructor as it uses gridOptionsWrapper
    @PostConstruct
    private initialise(): void {
        this.initMinAndMaxWidths();

        this.resetActualWidth('gridInitializing');

        this.initDotNotation();

        this.validate();
    }

    private initDotNotation(): void {
        const suppressDotNotation = this.gridOptionsWrapper.isSuppressFieldDotNotation();
        this.fieldContainsDots = exists(this.colDef.field) && this.colDef.field.indexOf('.') >= 0 && !suppressDotNotation;
        this.tooltipFieldContainsDots = exists(this.colDef.tooltipField) && this.colDef.tooltipField.indexOf('.') >= 0 && !suppressDotNotation;
    }

    private initMinAndMaxWidths(): void {
        const colDef = this.colDef;

        this.minWidth = this.columnUtils.calculateColMinWidth(colDef);
        this.maxWidth = this.columnUtils.calculateColMaxWidth(colDef);
    }

    public resetActualWidth(source: ColumnEventType = 'api'): void {
        const initialWidth = this.columnUtils.calculateColInitialWidth(this.colDef);
        this.setActualWidth(initialWidth, source, true);
    }

    public isEmptyGroup(): boolean {
        return false;
    }

    public isRowGroupDisplayed(colId: string): boolean {
        if (missing(this.colDef) || missing(this.colDef.showRowGroup)) {
            return false;
        }

        const showingAllGroups = this.colDef.showRowGroup === true;
        const showingThisGroup = this.colDef.showRowGroup === colId;

        return showingAllGroups || showingThisGroup;
    }

    /** Returns `true` if column is a primary column, `false` if secondary. Secondary columns are used for pivoting. */
    public isPrimary(): boolean {
        return this.primary;
    }

    /** Returns `true` if column filtering is allowed. */
    public isFilterAllowed(): boolean {
        // filter defined means it's a string, class or true.
        // if its false, null or undefined then it's false.
        const filterDefined = !!this.colDef.filter || !!this.colDef.filterFramework;
        return filterDefined;
    }

    public isFieldContainsDots(): boolean {
        return this.fieldContainsDots;
    }

    public isTooltipFieldContainsDots(): boolean {
        return this.tooltipFieldContainsDots;
    }

    private validate(): void {

        const colDefAny = this.colDef as any;

        function warnOnce(msg: string, key: string, obj?: any) {
            doOnce(() => {
                if (obj) {
                    console.warn(msg, obj);
                } else {
                    doOnce(() => console.warn(msg), key);
                }
            }, key);
        }

        const usingCSRM = this.gridOptionsWrapper.isRowModelDefault();
        if (usingCSRM && !ModuleRegistry.isRegistered(ModuleNames.RowGroupingModule)) {
            const rowGroupingItems =
                ['enableRowGroup', 'rowGroup', 'rowGroupIndex', 'enablePivot', 'enableValue', 'pivot', 'pivotIndex', 'aggFunc'];
            rowGroupingItems.forEach(item => {
                if (exists(colDefAny[item])) {
                    if (ModuleRegistry.isPackageBased()) {
                        warnOnce(`AG Grid: ${item} is only valid in ag-grid-enterprise, your column definition should not have ${item}`, 'ColumnRowGroupingMissing' + item);
                    } else {
                        warnOnce(`AG Grid: ${item} is only valid with AG Grid Enterprise Module ${ModuleNames.RowGroupingModule} - your column definition should not have ${item}`, 'ColumnRowGroupingMissing' + item);
                    }
                }
            });
        }

        if (!ModuleRegistry.isRegistered(ModuleNames.RichSelectModule)) {
            if (this.colDef.cellEditor === 'agRichSelect') {
                if (ModuleRegistry.isPackageBased()) {
                    warnOnce(`AG Grid: ${this.colDef.cellEditor} can only be used with ag-grid-enterprise`, 'ColumnRichSelectMissing');
                } else {
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
    public addEventListener(eventType: string, listener: Function): void {
        this.eventService.addEventListener(eventType, listener);
    }

    /** Remove event listener from the column. */
    public removeEventListener(eventType: string, listener: Function): void {
        this.eventService.removeEventListener(eventType, listener);
    }

    private createColumnFunctionCallbackParams(rowNode: RowNode): ColumnFunctionCallbackParams {
        return {
            node: rowNode,
            data: rowNode.data,
            column: this,
            colDef: this.colDef,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridOptionsWrapper.getApi()!,
            columnApi: this.gridOptionsWrapper.getColumnApi()!
        };
    }

    public isSuppressNavigable(rowNode: RowNode): boolean {
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

    public isCellEditable(rowNode: RowNode): boolean {

        // only allow editing of groups if the user has this option enabled
        if (rowNode.group && !this.gridOptionsWrapper.isEnableGroupEdit()) {
            return false;
        }

        return this.isColumnFunc(rowNode, this.colDef.editable);
    }

    public isSuppressFillHandle(): boolean {
        return !!attrToBoolean(this.colDef.suppressFillHandle);
    }

    public isAutoHeight(): boolean {
        return !!attrToBoolean(this.colDef.autoHeight);
    }

    public isAutoHeaderHeight(): boolean {
        return !!attrToBoolean(this.colDef.autoHeaderHeight);
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
        return !!attrToBoolean(this.colDef.resizable);
    }

    private isColumnFunc(rowNode: RowNode, value?: boolean | ((params: ColumnFunctionCallbackParams) => boolean) | null): boolean {
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

    /** If sorting is active, returns the sort direction e.g. `'asc'` or `'desc'`. */
    public getSort(): 'asc' | 'desc' | null | undefined {
        return this.sort;
    }

    public setSort(sort: 'asc' | 'desc' | null | undefined, source: ColumnEventType = "api"): void {
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
        return this.sort === Constants.SORT_ASC;
    }

    public isSortDescending(): boolean {
        return this.sort === Constants.SORT_DESC;
    }

    public isSortNone(): boolean {
        return missing(this.sort);
    }

    public isSorting(): boolean {
        return exists(this.sort);
    }

    public getSortIndex(): number | null | undefined {
        return this.sortIndex;
    }

    public setSortIndex(sortOrder?: number | null): void {
        this.sortIndex = sortOrder;
    }

    public setAggFunc(aggFunc: string | IAggFunc | null | undefined): void {
        this.aggFunc = aggFunc;
    }

    /** If aggregation is set for the column, returns the aggregation function. */
    public getAggFunc(): string | IAggFunc | null | undefined {
        return this.aggFunc;
    }

    public getLeft(): number | null {
        return this.left;
    }

    public getOldLeft(): number | null {
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

    /** Returns `true` if filter is active on the column. */
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
            mergeDeep(filterChangedEvent, additionalEventAttributes);
        }
        this.eventService.dispatchEvent(filterChangedEvent);
    }

    public setPinned(pinned: string | boolean | null | undefined): void {
        if (pinned === true || pinned === Constants.PINNED_LEFT) {
            this.pinned = Constants.PINNED_LEFT;
        } else if (pinned === Constants.PINNED_RIGHT) {
            this.pinned = Constants.PINNED_RIGHT;
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
        return this.pinned === Constants.PINNED_LEFT || this.pinned === Constants.PINNED_RIGHT;
    }

    public isPinnedLeft(): boolean {
        return this.pinned === Constants.PINNED_LEFT;
    }

    public isPinnedRight(): boolean {
        return this.pinned === Constants.PINNED_RIGHT;
    }

    public getPinned(): 'left' | 'right' | null | undefined {
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

    /** Returns the column definition for this column.
     * The column definition will be the result of merging the application provided column definition with any provided defaults
     * (e.g. `defaultColDef` grid option, or column types.
     *
     * Equivalent: `getDefinition` */
    public getColDef(): ColDef {
        return this.colDef;
    }

    public getColumnGroupShow(): string | undefined {
        return this.colDef.columnGroupShow;
    }
    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getId`, `getUniqueId` */
    public getColId(): string {
        return this.colId;
    }
    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getColId`, `getUniqueId` */
    public getId(): string {
        return this.getColId();
    }
    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getColId`, `getId` */
    public getUniqueId(): string {
        return this.getId();
    }

    public getDefinition(): AbstractColDef {
        return this.colDef;
    }

    /** Returns the current width of the column. If the column is resized, the actual width is the new size. */
    public getActualWidth(): number {
        return this.actualWidth;
    }

    public getAutoHeaderHeight(): number | null {
        return this.autoHeaderHeight;
    }

    /** Returns true if the header height has changed */
    public setAutoHeaderHeight(height: number): boolean {
        const changed = height !== this.autoHeaderHeight;
        this.autoHeaderHeight = height;
        return changed;
    }

    private createBaseColDefParams(rowNode: RowNode): BaseColDefParams {
        const params: BaseColDefParams = {
            node: rowNode,
            data: rowNode.data,
            colDef: this.colDef,
            column: this,
            api: this.gridOptionsWrapper.getApi()!,
            columnApi: this.gridOptionsWrapper.getColumnApi()!,
            context: this.gridOptionsWrapper.getContext()
        };
        return params;
    }

    public getColSpan(rowNode: RowNode): number {
        if (missing(this.colDef.colSpan)) { return 1; }
        const params: ColSpanParams = this.createBaseColDefParams(rowNode);
        const colSpan = this.colDef.colSpan(params);
        // colSpan must be number equal to or greater than 1

        return Math.max(colSpan, 1);
    }

    public getRowSpan(rowNode: RowNode): number {
        if (missing(this.colDef.rowSpan)) { return 1; }
        const params: RowSpanParams = this.createBaseColDefParams(rowNode);
        const rowSpan = this.colDef.rowSpan(params);
        // rowSpan must be number equal to or greater than 1

        return Math.max(rowSpan, 1);
    }

    public setActualWidth(actualWidth: number, source: ColumnEventType = "api", silent: boolean = false): void {
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

    public fireColumnWidthChangedEvent(source: ColumnEventType): void {
        this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_WIDTH_CHANGED, source));
    }

    public isGreaterThanMax(width: number): boolean {
        if (this.maxWidth != null) {
            return width > this.maxWidth;
        }
        return false;
    }

    public getMinWidth(): number | null | undefined {
        return this.minWidth;
    }

    public getMaxWidth(): number | null | undefined {
        return this.maxWidth;
    }

    public getFlex(): number {
        return this.flex || 0;
    }

    // this method should only be used by the columnModel to
    // change flex when required by the setColumnState method.
    public setFlex(flex: number | null) {
        if (this.flex !== flex) { this.flex = flex; }
    }

    public setMinimum(source: ColumnEventType = "api"): void {
        if (exists(this.minWidth)) {
            this.setActualWidth(this.minWidth, source);
        }
    }

    public setRowGroupActive(rowGroup: boolean, source: ColumnEventType = "api"): void {
        if (this.rowGroupActive !== rowGroup) {
            this.rowGroupActive = rowGroup;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_ROW_GROUP_CHANGED, source));
        }
    }

    /** Returns `true` if row group is currently active for this column. */
    public isRowGroupActive(): boolean {
        return this.rowGroupActive;
    }

    public setPivotActive(pivot: boolean, source: ColumnEventType = "api"): void {
        if (this.pivotActive !== pivot) {
            this.pivotActive = pivot;
            this.eventService.dispatchEvent(this.createColumnEvent(Column.EVENT_PIVOT_CHANGED, source));
        }
    }

    /** Returns `true` if pivot is currently active for this column. */
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

    /** Returns `true` if value (aggregation) is currently active for this column. */
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

    public getMenuTabs(defaultValues: string[]): string[] {
        let menuTabs = this.getColDef().menuTabs;

        if (menuTabs == null) {
            menuTabs = defaultValues;
        }

        return menuTabs;
    }

    // this used to be needed, as previous version of ag-grid had lockPosition as column state,
    // so couldn't depend on colDef version.
    public isLockPosition(): boolean {
        console.warn('AG Grid: since v21, col.isLockPosition() should not be used, please use col.getColDef().lockPosition instead.');
        return this.colDef ? !!this.colDef.lockPosition : false;
    }

    // this used to be needed, as previous version of ag-grid had lockVisible as column state,
    // so couldn't depend on colDef version.
    public isLockVisible(): boolean {
        console.warn('AG Grid: since v21, col.isLockVisible() should not be used, please use col.getColDef().lockVisible instead.');
        return this.colDef ? !!this.colDef.lockVisible : false;
    }

    // this used to be needed, as previous version of ag-grid had lockPinned as column state,
    // so couldn't depend on colDef version.
    public isLockPinned(): boolean {
        console.warn('AG Grid: since v21, col.isLockPinned() should not be used, please use col.getColDef().lockPinned instead.');
        return this.colDef ? !!this.colDef.lockPinned : false;
    }

}
