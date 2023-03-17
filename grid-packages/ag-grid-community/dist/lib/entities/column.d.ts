import { IHeaderColumn } from "../interfaces/iHeaderColumn";
import { IProvidedColumn } from "../interfaces/iProvidedColumn";
import { AbstractColDef, ColDef, IAggFunc, ColumnFunctionCallbackParams, ColumnMenuTab, SortDirection } from "./colDef";
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { ColumnEventType } from "../events";
import { ColumnGroup, ColumnGroupShowType } from "./columnGroup";
import { ProvidedColumnGroup } from "./providedColumnGroup";
import { IRowNode } from "../interfaces/iRowNode";
export declare type ColumnPinnedType = 'left' | 'right' | boolean | null | undefined;
export declare type ColumnEventName = 'movingChanged' | 'leftChanged' | 'widthChanged' | 'lastLeftPinnedChanged' | 'firstRightPinnedChanged' | 'visibleChanged' | 'filterChanged' | 'filterActiveChanged' | 'sortChanged' | 'colDefChanged' | 'menuVisibleChanged' | 'columnRowGroupChanged' | 'columnPivotChanged' | 'columnValueChanged';
export declare function getNextColInstanceId(): number;
export declare class Column implements IHeaderColumn, IProvidedColumn, IEventEmitter {
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
    private gridOptionsService;
    private columnUtils;
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
    private rowGroupActive;
    private pivotActive;
    private aggregationActive;
    private flex;
    private readonly primary;
    private parent;
    private originalParent;
    constructor(colDef: ColDef, userProvidedColDef: ColDef | null, colId: string, primary: boolean);
    getInstanceId(): number;
    private setState;
    setColDef(colDef: ColDef, userProvidedColDef: ColDef | null): void;
    /**
     * Returns the column definition provided by the application.
     * This may not be correct, as items can be superseded by default column options.
     * However it's useful for comparison, eg to know which application column definition matches that column.
     */
    getUserProvidedColDef(): ColDef | null;
    setParent(parent: ColumnGroup): void;
    /** Returns the parent column group, if column grouping is active. */
    getParent(): ColumnGroup;
    setOriginalParent(originalParent: ProvidedColumnGroup | null): void;
    getOriginalParent(): ProvidedColumnGroup | null;
    private initialise;
    private initDotNotation;
    private initMinAndMaxWidths;
    resetActualWidth(source?: ColumnEventType): void;
    isEmptyGroup(): boolean;
    isRowGroupDisplayed(colId: string): boolean;
    /** Returns `true` if column is a primary column, `false` if secondary. Secondary columns are used for pivoting. */
    isPrimary(): boolean;
    /** Returns `true` if column filtering is allowed. */
    isFilterAllowed(): boolean;
    isFieldContainsDots(): boolean;
    isTooltipFieldContainsDots(): boolean;
    private validate;
    /** Add an event listener to the column. */
    addEventListener(eventType: ColumnEventName, listener: Function): void;
    /** Remove event listener from the column. */
    removeEventListener(eventType: ColumnEventName, listener: Function): void;
    createColumnFunctionCallbackParams(rowNode: IRowNode): ColumnFunctionCallbackParams;
    isSuppressNavigable(rowNode: IRowNode): boolean;
    isCellEditable(rowNode: IRowNode): boolean;
    isSuppressFillHandle(): boolean;
    isAutoHeight(): boolean;
    isAutoHeaderHeight(): boolean;
    isRowDrag(rowNode: IRowNode): boolean;
    isDndSource(rowNode: IRowNode): boolean;
    isCellCheckboxSelection(rowNode: IRowNode): boolean;
    isSuppressPaste(rowNode: IRowNode): boolean;
    isResizable(): boolean;
    private isColumnFunc;
    setMoving(moving: boolean, source?: ColumnEventType): void;
    private createColumnEvent;
    isMoving(): boolean;
    /** If sorting is active, returns the sort direction e.g. `'asc'` or `'desc'`. */
    getSort(): SortDirection | undefined;
    setSort(sort: SortDirection | undefined, source?: ColumnEventType): void;
    setMenuVisible(visible: boolean, source?: ColumnEventType): void;
    isMenuVisible(): boolean;
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
    setLeft(left: number | null, source?: ColumnEventType): void;
    /** Returns `true` if filter is active on the column. */
    isFilterActive(): boolean;
    setFilterActive(active: boolean, source?: ColumnEventType, additionalEventAttributes?: any): void;
    setPinned(pinned: ColumnPinnedType): void;
    setFirstRightPinned(firstRightPinned: boolean, source?: ColumnEventType): void;
    setLastLeftPinned(lastLeftPinned: boolean, source?: ColumnEventType): void;
    isFirstRightPinned(): boolean;
    isLastLeftPinned(): boolean;
    isPinned(): boolean;
    isPinnedLeft(): boolean;
    isPinnedRight(): boolean;
    getPinned(): ColumnPinnedType;
    setVisible(visible: boolean, source?: ColumnEventType): void;
    isVisible(): boolean;
    isSpanHeaderHeight(): boolean;
    /** Returns the column definition for this column.
     * The column definition will be the result of merging the application provided column definition with any provided defaults
     * (e.g. `defaultColDef` grid option, or column types.
     *
     * Equivalent: `getDefinition` */
    getColDef(): ColDef;
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
    getUniqueId(): string;
    getDefinition(): AbstractColDef;
    /** Returns the current width of the column. If the column is resized, the actual width is the new size. */
    getActualWidth(): number;
    getAutoHeaderHeight(): number | null;
    /** Returns true if the header height has changed */
    setAutoHeaderHeight(height: number): boolean;
    private createBaseColDefParams;
    getColSpan(rowNode: IRowNode): number;
    getRowSpan(rowNode: IRowNode): number;
    setActualWidth(actualWidth: number, source?: ColumnEventType, silent?: boolean): void;
    fireColumnWidthChangedEvent(source: ColumnEventType): void;
    isGreaterThanMax(width: number): boolean;
    getMinWidth(): number | null | undefined;
    getMaxWidth(): number | null | undefined;
    getFlex(): number;
    setFlex(flex: number | null): void;
    setMinimum(source?: ColumnEventType): void;
    setRowGroupActive(rowGroup: boolean, source?: ColumnEventType): void;
    /** Returns `true` if row group is currently active for this column. */
    isRowGroupActive(): boolean;
    setPivotActive(pivot: boolean, source?: ColumnEventType): void;
    /** Returns `true` if pivot is currently active for this column. */
    isPivotActive(): boolean;
    isAnyFunctionActive(): boolean;
    isAnyFunctionAllowed(): boolean;
    setValueActive(value: boolean, source?: ColumnEventType): void;
    /** Returns `true` if value (aggregation) is currently active for this column. */
    isValueActive(): boolean;
    isAllowPivot(): boolean;
    isAllowValue(): boolean;
    isAllowRowGroup(): boolean;
    getMenuTabs(defaultValues: ColumnMenuTab[]): ColumnMenuTab[];
}
