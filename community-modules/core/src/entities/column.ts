import { ColumnState } from "../columns/columnModel";
import { ColumnUtils } from "../columns/columnUtils";
import { Autowired, PostConstruct } from "../context/context";
import { AgEvent, AgEventListener, ColumnEvent, ColumnEventType } from "../events";
import { EventService } from "../eventService";
import { GridOptionsService } from "../gridOptionsService";
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { HeaderColumnId, IHeaderColumn } from "../interfaces/iHeaderColumn";
import { IProvidedColumn } from "../interfaces/iProvidedColumn";
import { IRowNode } from "../interfaces/iRowNode";
import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";
import { FrameworkEventListenerService } from "../misc/frameworkEventListenerService";
import { ColumnHoverService } from "../rendering/columnHoverService";
import { exists, missing } from "../utils/generic";
import { mergeDeep } from "../utils/object";
import {
    AbstractColDef,
    BaseColDefParams,
    ColDef,
    ColSpanParams, ColumnFunctionCallbackParams, ColumnMenuTab, IAggFunc, RowSpanParams, SortDirection
} from "./colDef";
import { ColumnGroup, ColumnGroupShowType } from "./columnGroup";
import { ProvidedColumnGroup } from "./providedColumnGroup";
import { warnOnce } from "../utils/function";
import { BrandedType } from "../utils";

export type ColumnPinnedType = 'left' | 'right' | boolean | null | undefined;
export type ColumnEventName =
    'movingChanged' |
    'leftChanged' |
    'widthChanged' |
    'lastLeftPinnedChanged' |
    'firstRightPinnedChanged' |
    'visibleChanged' |
    'filterChanged' |
    'filterActiveChanged' |
    'sortChanged' |
    'colDefChanged' |
    'menuVisibleChanged' |
    'columnRowGroupChanged' |
    'columnPivotChanged' |
    'columnValueChanged' |
    'columnStateUpdated';

const COL_DEF_DEFAULTS: Partial<ColDef> = {
    resizable: true,
    sortable: true
};

export type ColumnInstanceId = BrandedType<number, 'ColumnInstanceId'>;
let instanceIdSequence = 0;
export function getNextColInstanceId(): ColumnInstanceId {
    return instanceIdSequence++ as ColumnInstanceId;
}

// Wrapper around a user provide column definition. The grid treats the column definition as ready only.
// This class contains all the runtime information about a column, plus some logic (the definition has no logic).
// This class implements both interfaces ColumnGroupChild and ProvidedColumnGroupChild as the class can
// appear as a child of either the original tree or the displayed tree. However the relevant group classes
// for each type only implements one, as each group can only appear in it's associated tree (eg ProvidedColumnGroup
// can only appear in OriginalColumn tree).
export class Column<TValue = any> implements IHeaderColumn<TValue>, IProvidedColumn, IEventEmitter {

    // + renderedHeaderCell - for making header cell transparent when moving
    public static EVENT_MOVING_CHANGED: ColumnEventName = 'movingChanged';
    // + renderedCell - changing left position
    public static EVENT_LEFT_CHANGED: ColumnEventName = 'leftChanged';
    // + renderedCell - changing width
    public static EVENT_WIDTH_CHANGED: ColumnEventName = 'widthChanged';
    // + renderedCell - for changing pinned classes
    public static EVENT_LAST_LEFT_PINNED_CHANGED: ColumnEventName = 'lastLeftPinnedChanged';
    public static EVENT_FIRST_RIGHT_PINNED_CHANGED: ColumnEventName = 'firstRightPinnedChanged';
    // + renderedColumn - for changing visibility icon
    public static EVENT_VISIBLE_CHANGED: ColumnEventName = 'visibleChanged';
    // + every time the filter changes, used in the floating filters
    public static EVENT_FILTER_CHANGED: ColumnEventName = 'filterChanged';
    // + renderedHeaderCell - marks the header with filter icon
    public static EVENT_FILTER_ACTIVE_CHANGED: ColumnEventName = 'filterActiveChanged';
    // + renderedHeaderCell - marks the header with sort icon
    public static EVENT_SORT_CHANGED: ColumnEventName = 'sortChanged';
    // + renderedHeaderCell - marks the header with sort icon
    public static EVENT_COL_DEF_CHANGED: ColumnEventName = 'colDefChanged';

    public static EVENT_MENU_VISIBLE_CHANGED: ColumnEventName = 'menuVisibleChanged';

    // + toolpanel, for gui updates
    public static EVENT_ROW_GROUP_CHANGED: ColumnEventName = 'columnRowGroupChanged';
    // + toolpanel, for gui updates
    public static EVENT_PIVOT_CHANGED: ColumnEventName = 'columnPivotChanged';
    // + toolpanel, for gui updates
    public static EVENT_VALUE_CHANGED: ColumnEventName = 'columnValueChanged';
    // + dataTypeService - when waiting to infer cell data types
    public static EVENT_STATE_UPDATED: ColumnEventName = 'columnStateUpdated';

    @Autowired('gridOptionsService') private readonly gos: GridOptionsService;
    @Autowired('columnUtils') private readonly columnUtils: ColumnUtils;
    @Autowired('columnHoverService') private readonly columnHoverService: ColumnHoverService;
    
    @Autowired('frameworkOverrides') private readonly frameworkOverrides: IFrameworkOverrides;
    private frameworkEventListenerService: FrameworkEventListenerService | null;

    private readonly colId: any;
    private colDef: ColDef<any, TValue>;

    // used by React (and possibly other frameworks) as key for rendering. also used to
    // identify old vs new columns for destroying cols when no longer used.
    private instanceId = getNextColInstanceId();

    // We do NOT use this anywhere, we just keep a reference. this is to check object equivalence
    // when the user provides an updated list of columns - so we can check if we have a column already
    // existing for a col def. we cannot use the this.colDef as that is the result of a merge.
    // This is used in ColumnFactory
    private userProvidedColDef: ColDef<any, TValue> | null;

    private actualWidth: any;

    // The measured height of this column's header when autoHeaderHeight is enabled
    private autoHeaderHeight: number | null = null;

    private visible: any;
    private pinned: ColumnPinnedType;
    private left: number | null;
    private oldLeft: number | null;
    private aggFunc: string | IAggFunc | null | undefined;
    private sort: SortDirection | undefined;
    private sortIndex: number | null | undefined;
    private moving = false;
    private menuVisible = false;

    private lastLeftPinned: boolean = false;
    private firstRightPinned: boolean = false;

    private minWidth: number | null | undefined;
    private maxWidth: number | null | undefined;

    private filterActive = false;

    private eventService: EventService = new EventService();

    private fieldContainsDots: boolean;
    private tooltipFieldContainsDots: boolean;
    private tooltipEnabled = false;

    private rowGroupActive = false;
    private pivotActive = false;
    private aggregationActive = false;
    private flex: number | null | undefined;

    private readonly primary: boolean;

    private parent: ColumnGroup;
    private originalParent: ProvidedColumnGroup | null;

    constructor(colDef: ColDef<any, TValue>, userProvidedColDef: ColDef<any, TValue> | null, colId: string, primary: boolean) {
        this.colDef = colDef;
        this.userProvidedColDef = userProvidedColDef;
        this.colId = colId;
        this.primary = primary;

        this.setState(colDef);
    }

    public getInstanceId(): ColumnInstanceId {
        return this.instanceId;
    }

    private setState(colDef: ColDef): void {
        // sort
        if (colDef.sort !== undefined) {
            if (colDef.sort === 'asc' || colDef.sort === 'desc') {
                this.sort = colDef.sort;
            }
        } else {
            if (colDef.initialSort === 'asc' || colDef.initialSort === 'desc') {
                this.sort = colDef.initialSort;
            }
        }

        // sortIndex
        const sortIndex = colDef.sortIndex;
        const initialSortIndex = colDef.initialSortIndex;
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
        const hide = colDef.hide;
        const initialHide = colDef.initialHide;

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
        const flex = colDef.flex;
        const initialFlex = colDef.initialFlex;
        if (flex !== undefined) {
            this.flex = flex;
        } else if (initialFlex !== undefined) {
            this.flex = initialFlex;
        }
    }

    // gets called when user provides an alternative colDef, eg
    public setColDef(colDef: ColDef<any, TValue>, userProvidedColDef: ColDef<any, TValue> | null, source: ColumnEventType): void {
        this.colDef = colDef;
        this.userProvidedColDef = userProvidedColDef;
        this.initMinAndMaxWidths();
        this.initDotNotation();
        this.initTooltip();
        this.eventService.dispatchEvent(this.createColumnEvent('colDefChanged', source));
    }

    /**
     * Returns the column definition provided by the application.
     * This may not be correct, as items can be superseded by default column options.
     * However it's useful for comparison, eg to know which application column definition matches that column.
     */
    public getUserProvidedColDef(): ColDef<any, TValue> | null {
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

    /**
     * Used for marryChildren, helps with comparing when duplicate groups have been created to manage split groups.
     * 
     * Parent may contain a duplicate but not identical group when the group is split.
     */
    public getOriginalParent(): ProvidedColumnGroup | null {
        return this.originalParent;
    }

    // this is done after constructor as it uses gridOptionsService
    @PostConstruct
    private initialise(): void {
        this.initMinAndMaxWidths();

        this.resetActualWidth('gridInitializing');

        this.initDotNotation();

        this.initTooltip();
    }

    private initDotNotation(): void {
        const suppressDotNotation = this.gos.get('suppressFieldDotNotation');
        this.fieldContainsDots = exists(this.colDef.field) && this.colDef.field.indexOf('.') >= 0 && !suppressDotNotation;
        this.tooltipFieldContainsDots = exists(this.colDef.tooltipField) && this.colDef.tooltipField.indexOf('.') >= 0 && !suppressDotNotation;
    }

    private initMinAndMaxWidths(): void {
        const colDef = this.colDef;

        this.minWidth = this.columnUtils.calculateColMinWidth(colDef);
        this.maxWidth = this.columnUtils.calculateColMaxWidth(colDef);
    }

    private initTooltip(): void {
        this.tooltipEnabled = exists(this.colDef.tooltipField) ||
            exists(this.colDef.tooltipValueGetter) ||
            exists(this.colDef.tooltipComponent);
    }

    public resetActualWidth(source: ColumnEventType): void {
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
        const filterDefined = !!this.colDef.filter;
        return filterDefined;
    }

    public isFieldContainsDots(): boolean {
        return this.fieldContainsDots;
    }

    public isTooltipEnabled(): boolean {
        return this.tooltipEnabled;
    }

    public isTooltipFieldContainsDots(): boolean {
        return this.tooltipFieldContainsDots;
    }

    /** Add an event listener to the column. */
    public addEventListener(eventType: ColumnEventName, userListener: Function): void {
        if(this.frameworkOverrides.shouldWrapOutgoing && !this.frameworkEventListenerService) {
            // Only construct if we need it, as it's an overhead for column construction
            this.eventService.setFrameworkOverrides(this.frameworkOverrides);
            this.frameworkEventListenerService = new FrameworkEventListenerService(this.frameworkOverrides);
        }
        const listener = this.frameworkEventListenerService?.wrap(userListener as AgEventListener) ?? userListener;

        this.eventService.addEventListener(eventType, listener as AgEventListener);
    }

    /** Remove event listener from the column. */
    public removeEventListener(eventType: ColumnEventName, userListener: Function): void {
        const listener = this.frameworkEventListenerService?.unwrap(userListener as AgEventListener) ?? userListener;
        this.eventService.removeEventListener(eventType, listener as AgEventListener);
    }

    public createColumnFunctionCallbackParams(rowNode: IRowNode): ColumnFunctionCallbackParams {
        return this.gos.addGridCommonParams({
            node: rowNode,
            data: rowNode.data,
            column: this,
            colDef: this.colDef
        });
    }

    public isSuppressNavigable(rowNode: IRowNode): boolean {
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

    /**
     * Returns `true` if the cell for this column is editable for the given `rowNode`, otherwise `false`.
     */
    public isCellEditable(rowNode: IRowNode): boolean {
        // only allow editing of groups if the user has this option enabled
        if (rowNode.group && !this.gos.get('enableGroupEdit')) {
            return false;
        }

        return this.isColumnFunc(rowNode, this.colDef.editable);
    }

    public isSuppressFillHandle(): boolean {
        return !!this.colDef.suppressFillHandle;
    }

    public isAutoHeight(): boolean {
        return !!this.colDef.autoHeight;
    }

    public isAutoHeaderHeight(): boolean {
        return !!this.colDef.autoHeaderHeight;
    }

    public isRowDrag(rowNode: IRowNode): boolean {
        return this.isColumnFunc(rowNode, this.colDef.rowDrag);
    }

    public isDndSource(rowNode: IRowNode): boolean {
        return this.isColumnFunc(rowNode, this.colDef.dndSource);
    }

    public isCellCheckboxSelection(rowNode: IRowNode): boolean {
        return this.isColumnFunc(rowNode, this.colDef.checkboxSelection);
    }

    public isSuppressPaste(rowNode: IRowNode): boolean {
        return this.isColumnFunc(rowNode, this.colDef ? this.colDef.suppressPaste : null);
    }

    public isResizable(): boolean {
        return !!this.getColDefValue('resizable');
    }
    
    /** Get value from ColDef or default if it exists. */
    private getColDefValue<K extends keyof ColDef>(key: K): ColDef[K] {
        return this.colDef[key] ?? COL_DEF_DEFAULTS[key];
    }

    private isColumnFunc(rowNode: IRowNode, value?: boolean | ((params: ColumnFunctionCallbackParams) => boolean) | null): boolean {
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

    public setMoving(moving: boolean, source: ColumnEventType): void {
        this.moving = moving;
        this.eventService.dispatchEvent(this.createColumnEvent('movingChanged', source));
    }

    private createColumnEvent(type: ColumnEventName, source: ColumnEventType): ColumnEvent {
        return this.gos.addGridCommonParams({
            type: type,
            column: this,
            columns: [this],
            source: source
        });
    }

    public isMoving(): boolean {
        return this.moving;
    }

    /** If sorting is active, returns the sort direction e.g. `'asc'` or `'desc'`. */
    public getSort(): SortDirection | undefined {
        return this.sort;
    }

    public setSort(sort: SortDirection | undefined, source: ColumnEventType): void {
        if (this.sort !== sort) {
            this.sort = sort;
            this.eventService.dispatchEvent(this.createColumnEvent('sortChanged', source));
        }
        this.dispatchStateUpdatedEvent('sort');
    }

    public setMenuVisible(visible: boolean, source: ColumnEventType): void {
        if (this.menuVisible !== visible) {
            this.menuVisible = visible;
            this.eventService.dispatchEvent(this.createColumnEvent('menuVisibleChanged', source));
        }
    }

    public isMenuVisible(): boolean {
        return this.menuVisible;
    }

    public isSortable(): boolean {
        return !!this.getColDefValue('sortable');
    }

    public isSortAscending(): boolean {
        return this.sort === 'asc';
    }

    public isSortDescending(): boolean {
        return this.sort === 'desc';
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
        this.dispatchStateUpdatedEvent('sortIndex');
    }

    public setAggFunc(aggFunc: string | IAggFunc | null | undefined): void {
        this.aggFunc = aggFunc;
        this.dispatchStateUpdatedEvent('aggFunc');
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

    public setLeft(left: number | null, source: ColumnEventType) {
        this.oldLeft = this.left;
        if (this.left !== left) {
            this.left = left;
            this.eventService.dispatchEvent(this.createColumnEvent('leftChanged', source));
        }
    }

    /** Returns `true` if filter is active on the column. */
    public isFilterActive(): boolean {
        return this.filterActive;
    }

    // additionalEventAttributes is used by provided simple floating filter, so it can add 'floatingFilter=true' to the event
    public setFilterActive(active: boolean, source: ColumnEventType, additionalEventAttributes?: any): void {
        if (this.filterActive !== active) {
            this.filterActive = active;
            this.eventService.dispatchEvent(this.createColumnEvent('filterActiveChanged', source));
        }
        const filterChangedEvent = this.createColumnEvent('filterChanged', source);
        if (additionalEventAttributes) {
            mergeDeep(filterChangedEvent, additionalEventAttributes);
        }
        this.eventService.dispatchEvent(filterChangedEvent);
    }

    /** Returns `true` when this `Column` is hovered, otherwise `false` */
    public isHovered(): boolean {
        return this.columnHoverService.isHovered(this);
    }

    public setPinned(pinned: ColumnPinnedType): void {
        if (pinned === true || pinned === 'left') {
            this.pinned = 'left';
        } else if (pinned === 'right') {
            this.pinned = 'right';
        } else {
            this.pinned = null;
        }
        this.dispatchStateUpdatedEvent('pinned');
    }

    public setFirstRightPinned(firstRightPinned: boolean, source: ColumnEventType): void {
        if (this.firstRightPinned !== firstRightPinned) {
            this.firstRightPinned = firstRightPinned;
            this.eventService.dispatchEvent(this.createColumnEvent('firstRightPinnedChanged', source));
        }
    }

    public setLastLeftPinned(lastLeftPinned: boolean, source: ColumnEventType): void {
        if (this.lastLeftPinned !== lastLeftPinned) {
            this.lastLeftPinned = lastLeftPinned;
            this.eventService.dispatchEvent(this.createColumnEvent('lastLeftPinnedChanged', source));
        }
    }

    public isFirstRightPinned(): boolean {
        return this.firstRightPinned;
    }

    public isLastLeftPinned(): boolean {
        return this.lastLeftPinned;
    }

    public isPinned(): boolean {
        return this.pinned === 'left' || this.pinned === 'right';
    }

    public isPinnedLeft(): boolean {
        return this.pinned === 'left';
    }

    public isPinnedRight(): boolean {
        return this.pinned === 'right';
    }

    public getPinned(): ColumnPinnedType {
        return this.pinned;
    }

    public setVisible(visible: boolean, source: ColumnEventType): void {
        const newValue = visible === true;
        if (this.visible !== newValue) {
            this.visible = newValue;
            this.eventService.dispatchEvent(this.createColumnEvent('visibleChanged', source));
        }
        this.dispatchStateUpdatedEvent('hide');
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public isSpanHeaderHeight(): boolean {
        const colDef = this.getColDef();
        return !colDef.suppressSpanHeaderHeight && !colDef.autoHeaderHeight;
    }

    public getColumnGroupPaddingInfo(): { numberOfParents: number, isSpanningTotal: boolean } {
        let parent = this.getParent();

        if (!parent || !parent.isPadding()) { return { numberOfParents: 0, isSpanningTotal: false }; }

        const numberOfParents = parent.getPaddingLevel() + 1;
        let isSpanningTotal = true;

        while (parent) {
            if (!parent.isPadding()) {
                isSpanningTotal = false;
                break;
            }
            parent = parent.getParent();
        }

        return { numberOfParents, isSpanningTotal };
    }

    /** Returns the column definition for this column.
     * The column definition will be the result of merging the application provided column definition with any provided defaults
     * (e.g. `defaultColDef` grid option, or column types.
     *
     * Equivalent: `getDefinition` */
    public getColDef(): ColDef<any, TValue> {
        return this.colDef;
    }

    public getColumnGroupShow(): ColumnGroupShowType | undefined {
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
        return this.colId;
    }
    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getColId`, `getId` */
    public getUniqueId(): HeaderColumnId {
        return this.colId;
    }

    public getDefinition(): AbstractColDef<any, TValue> {
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

    private createBaseColDefParams(rowNode: IRowNode): BaseColDefParams {
        const params: BaseColDefParams = this.gos.addGridCommonParams({
            node: rowNode,
            data: rowNode.data,
            colDef: this.colDef,
            column: this
        });
        return params;
    }

    public getColSpan(rowNode: IRowNode): number {
        if (missing(this.colDef.colSpan)) { return 1; }
        const params: ColSpanParams = this.createBaseColDefParams(rowNode);
        const colSpan = this.colDef.colSpan(params);
        // colSpan must be number equal to or greater than 1

        return Math.max(colSpan, 1);
    }

    public getRowSpan(rowNode: IRowNode): number {
        if (missing(this.colDef.rowSpan)) { return 1; }
        const params: RowSpanParams = this.createBaseColDefParams(rowNode);
        const rowSpan = this.colDef.rowSpan(params);
        // rowSpan must be number equal to or greater than 1

        return Math.max(rowSpan, 1);
    }

    public setActualWidth(actualWidth: number, source: ColumnEventType, silent: boolean = false): void {
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
    }

    public fireColumnWidthChangedEvent(source: ColumnEventType): void {
        this.eventService.dispatchEvent(this.createColumnEvent('widthChanged', source));
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
    // change flex when required by the applyColumnState method.
    public setFlex(flex: number | null) {
        if (this.flex !== flex) { this.flex = flex; }
        this.dispatchStateUpdatedEvent('flex');
    }

    public setMinimum(source: ColumnEventType): void {
        if (exists(this.minWidth)) {
            this.setActualWidth(this.minWidth, source);
        }
    }

    public setRowGroupActive(rowGroup: boolean, source: ColumnEventType): void {
        if (this.rowGroupActive !== rowGroup) {
            this.rowGroupActive = rowGroup;
            this.eventService.dispatchEvent(this.createColumnEvent('columnRowGroupChanged', source));
        }
        this.dispatchStateUpdatedEvent('rowGroup');
    }

    /** Returns `true` if row group is currently active for this column. */
    public isRowGroupActive(): boolean {
        return this.rowGroupActive;
    }

    public setPivotActive(pivot: boolean, source: ColumnEventType): void {
        if (this.pivotActive !== pivot) {
            this.pivotActive = pivot;
            this.eventService.dispatchEvent(this.createColumnEvent('columnPivotChanged', source));
        }
        this.dispatchStateUpdatedEvent('pivot');
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

    public setValueActive(value: boolean, source: ColumnEventType): void {
        if (this.aggregationActive !== value) {
            this.aggregationActive = value;
            this.eventService.dispatchEvent(this.createColumnEvent('columnValueChanged', source));
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

    /**
     * @deprecated v31.1 Use `getColDef().menuTabs ?? defaultValues` instead.
     */
    public getMenuTabs(defaultValues: ColumnMenuTab[]): ColumnMenuTab[] {
        warnOnce(`As of v31.1, 'getMenuTabs' is deprecated. Use 'getColDef().menuTabs ?? defaultValues' instead.`);
        let menuTabs = this.getColDef().menuTabs;

        if (menuTabs == null) {
            menuTabs = defaultValues;
        }

        return menuTabs;
    }

    private dispatchStateUpdatedEvent(key: keyof ColumnState): void {
        this.eventService.dispatchEvent({
            type: Column.EVENT_STATE_UPDATED,
            key
        } as AgEvent);
    }
}
