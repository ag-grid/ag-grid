import { ColumnEventType } from "../events";
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { HeaderColumnId, IHeaderColumn } from "../interfaces/iHeaderColumn";
import { IProvidedColumn } from "../interfaces/iProvidedColumn";
import { IRowNode } from "../interfaces/iRowNode";
import { AbstractColDef, ColDef, ColumnFunctionCallbackParams, ColumnMenuTab, IAggFunc, SortDirection } from "./colDef";
import { ColumnGroup, ColumnGroupShowType } from "./columnGroup";
import { ProvidedColumnGroup } from "./providedColumnGroup";
import { BrandedType } from "../utils";
import { Environment } from "../environment";
export type ColumnPinnedType = 'left' | 'right' | boolean | null | undefined;
export type ColumnEventName = 'movingChanged' | 'leftChanged' | 'widthChanged' | 'lastLeftPinnedChanged' | 'firstRightPinnedChanged' | 'visibleChanged' | 'filterChanged' | 'filterActiveChanged' | 'sortChanged' | 'colDefChanged' | 'menuVisibleChanged' | 'columnRowGroupChanged' | 'columnPivotChanged' | 'columnValueChanged' | 'columnStateUpdated';
export type ColumnInstanceId = BrandedType<number, 'ColumnInstanceId'>;
export declare function getNextColInstanceId(): ColumnInstanceId;
export declare class Column<TValue = any> implements IHeaderColumn<TValue>, IProvidedColumn, IEventEmitter {
    static EVENT_MOVING_CHANGED: ColumnEventName;
    static EVENT_LEFT_CHANGED: ColumnEventName;
    static EVENT_WIDTH_CHANGED: ColumnEventName;
    static EVENT_LAST_LEFT_PINNED_CHANGED: ColumnEventName;
    static EVENT_FIRST_RIGHT_PINNED_CHANGED: ColumnEventName;
    static EVENT_VISIBLE_CHANGED: ColumnEventName;
    static EVENT_FILTER_CHANGED: ColumnEventName;
    static EVENT_FILTER_ACTIVE_CHANGED: ColumnEventName;
    static EVENT_SORT_CHANGED: ColumnEventName;
    static EVENT_COL_DEF_CHANGED: ColumnEventName;
    static EVENT_MENU_VISIBLE_CHANGED: ColumnEventName;
    static EVENT_ROW_GROUP_CHANGED: ColumnEventName;
    static EVENT_PIVOT_CHANGED: ColumnEventName;
    static EVENT_VALUE_CHANGED: ColumnEventName;
    static EVENT_STATE_UPDATED: ColumnEventName;
    private readonly gos;
    protected readonly environment: Environment;
    private readonly columnHoverService;
    private readonly frameworkOverrides;
    private frameworkEventListenerService;
    private readonly colId;
    private colDef;
    private instanceId;
    private userProvidedColDef;
    private actualWidth;
    private autoHeaderHeight;
    private visible;
    private pinned;
    private left;
    private oldLeft;
    private aggFunc;
    private sort;
    private sortIndex;
    private moving;
    private menuVisible;
    private lastLeftPinned;
    private firstRightPinned;
    private minWidth;
    private maxWidth;
    private filterActive;
    private eventService;
    private fieldContainsDots;
    private tooltipFieldContainsDots;
    private tooltipEnabled;
    private rowGroupActive;
    private pivotActive;
    private aggregationActive;
    private flex;
    private readonly primary;
    private parent;
    private originalParent;
    constructor(colDef: ColDef<any, TValue>, userProvidedColDef: ColDef<any, TValue> | null, colId: string, primary: boolean);
    getInstanceId(): ColumnInstanceId;
    private setState;
    setColDef(colDef: ColDef<any, TValue>, userProvidedColDef: ColDef<any, TValue> | null, source: ColumnEventType): void;
    /**
     * Returns the column definition provided by the application.
     * This may not be correct, as items can be superseded by default column options.
     * However it's useful for comparison, eg to know which application column definition matches that column.
     */
    getUserProvidedColDef(): ColDef<any, TValue> | null;
    setParent(parent: ColumnGroup): void;
    /** Returns the parent column group, if column grouping is active. */
    getParent(): ColumnGroup;
    setOriginalParent(originalParent: ProvidedColumnGroup | null): void;
    /**
     * Used for marryChildren, helps with comparing when duplicate groups have been created to manage split groups.
     *
     * Parent may contain a duplicate but not identical group when the group is split.
     */
    getOriginalParent(): ProvidedColumnGroup | null;
    private initialise;
    private initDotNotation;
    private initMinAndMaxWidths;
    private initTooltip;
    resetActualWidth(source: ColumnEventType): void;
    private calculateColInitialWidth;
    isEmptyGroup(): boolean;
    isRowGroupDisplayed(colId: string): boolean;
    /** Returns `true` if column is a primary column, `false` if secondary. Secondary columns are used for pivoting. */
    isPrimary(): boolean;
    /** Returns `true` if column filtering is allowed. */
    isFilterAllowed(): boolean;
    isFieldContainsDots(): boolean;
    isTooltipEnabled(): boolean;
    isTooltipFieldContainsDots(): boolean;
    /** Add an event listener to the column. */
    addEventListener(eventType: ColumnEventName, userListener: Function): void;
    /** Remove event listener from the column. */
    removeEventListener(eventType: ColumnEventName, userListener: Function): void;
    createColumnFunctionCallbackParams(rowNode: IRowNode): ColumnFunctionCallbackParams;
    isSuppressNavigable(rowNode: IRowNode): boolean;
    /**
     * Returns `true` if the cell for this column is editable for the given `rowNode`, otherwise `false`.
     */
    isCellEditable(rowNode: IRowNode): boolean;
    isSuppressFillHandle(): boolean;
    isAutoHeight(): boolean;
    isAutoHeaderHeight(): boolean;
    isRowDrag(rowNode: IRowNode): boolean;
    isDndSource(rowNode: IRowNode): boolean;
    isCellCheckboxSelection(rowNode: IRowNode): boolean;
    isSuppressPaste(rowNode: IRowNode): boolean;
    isResizable(): boolean;
    /** Get value from ColDef or default if it exists. */
    private getColDefValue;
    private isColumnFunc;
    setMoving(moving: boolean, source: ColumnEventType): void;
    private createColumnEvent;
    isMoving(): boolean;
    /** If sorting is active, returns the sort direction e.g. `'asc'` or `'desc'`. */
    getSort(): SortDirection | undefined;
    setSort(sort: SortDirection | undefined, source: ColumnEventType): void;
    setMenuVisible(visible: boolean, source: ColumnEventType): void;
    isMenuVisible(): boolean;
    isSortable(): boolean;
    isSortAscending(): boolean;
    isSortDescending(): boolean;
    isSortNone(): boolean;
    isSorting(): boolean;
    getSortIndex(): number | null | undefined;
    setSortIndex(sortOrder?: number | null): void;
    setAggFunc(aggFunc: string | IAggFunc | null | undefined): void;
    /** If aggregation is set for the column, returns the aggregation function. */
    getAggFunc(): string | IAggFunc | null | undefined;
    getLeft(): number | null;
    getOldLeft(): number | null;
    getRight(): number;
    setLeft(left: number | null, source: ColumnEventType): void;
    /** Returns `true` if filter is active on the column. */
    isFilterActive(): boolean;
    setFilterActive(active: boolean, source: ColumnEventType, additionalEventAttributes?: any): void;
    /** Returns `true` when this `Column` is hovered, otherwise `false` */
    isHovered(): boolean;
    setPinned(pinned: ColumnPinnedType): void;
    setFirstRightPinned(firstRightPinned: boolean, source: ColumnEventType): void;
    setLastLeftPinned(lastLeftPinned: boolean, source: ColumnEventType): void;
    isFirstRightPinned(): boolean;
    isLastLeftPinned(): boolean;
    isPinned(): boolean;
    isPinnedLeft(): boolean;
    isPinnedRight(): boolean;
    getPinned(): ColumnPinnedType;
    setVisible(visible: boolean, source: ColumnEventType): void;
    isVisible(): boolean;
    isSpanHeaderHeight(): boolean;
    getColumnGroupPaddingInfo(): {
        numberOfParents: number;
        isSpanningTotal: boolean;
    };
    /** Returns the column definition for this column.
     * The column definition will be the result of merging the application provided column definition with any provided defaults
     * (e.g. `defaultColDef` grid option, or column types.
     *
     * Equivalent: `getDefinition` */
    getColDef(): ColDef<any, TValue>;
    getColumnGroupShow(): ColumnGroupShowType | undefined;
    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getId`, `getUniqueId` */
    getColId(): string;
    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getColId`, `getUniqueId` */
    getId(): string;
    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getColId`, `getId` */
    getUniqueId(): HeaderColumnId;
    getDefinition(): AbstractColDef<any, TValue>;
    /** Returns the current width of the column. If the column is resized, the actual width is the new size. */
    getActualWidth(): number;
    getAutoHeaderHeight(): number | null;
    /** Returns true if the header height has changed */
    setAutoHeaderHeight(height: number): boolean;
    private createBaseColDefParams;
    getColSpan(rowNode: IRowNode): number;
    getRowSpan(rowNode: IRowNode): number;
    setActualWidth(actualWidth: number, source: ColumnEventType, silent?: boolean): void;
    fireColumnWidthChangedEvent(source: ColumnEventType): void;
    isGreaterThanMax(width: number): boolean;
    getMinWidth(): number | null | undefined;
    getMaxWidth(): number | null | undefined;
    getFlex(): number;
    setFlex(flex: number | null): void;
    setMinimum(source: ColumnEventType): void;
    setRowGroupActive(rowGroup: boolean, source: ColumnEventType): void;
    /** Returns `true` if row group is currently active for this column. */
    isRowGroupActive(): boolean;
    setPivotActive(pivot: boolean, source: ColumnEventType): void;
    /** Returns `true` if pivot is currently active for this column. */
    isPivotActive(): boolean;
    isAnyFunctionActive(): boolean;
    isAnyFunctionAllowed(): boolean;
    setValueActive(value: boolean, source: ColumnEventType): void;
    /** Returns `true` if value (aggregation) is currently active for this column. */
    isValueActive(): boolean;
    isAllowPivot(): boolean;
    isAllowValue(): boolean;
    isAllowRowGroup(): boolean;
    /**
     * @deprecated v31.1 Use `getColDef().menuTabs ?? defaultValues` instead.
     */
    getMenuTabs(defaultValues: ColumnMenuTab[]): ColumnMenuTab[];
    private dispatchStateUpdatedEvent;
}
