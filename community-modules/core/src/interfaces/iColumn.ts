import type { AbstractColDef, ColDef, ColGroupDef, IAggFunc, SortDirection } from '../entities/colDef';
import type { BrandedType } from '../interfaces/brandedType';
import type { IEventEmitter } from './iEventEmitter';
import type { IRowNode } from './iRowNode';

export type HeaderColumnId = BrandedType<string, 'HeaderColumnId'>;

// Implemented by Column and ColumnGroup. Allows the groups to contain a list of this type for it's children.
// See the note at the top of Column class.
interface IHeaderColumn<TValue = any> extends IEventEmitter {
    /**
     * Returns the unique ID for the column.
     *
     */
    getUniqueId(): HeaderColumnId;

    /** Returns the current width of the column. If the column is resized, the actual width is the new size. */
    getActualWidth(): number;
    getMinWidth(): number | null | undefined;
    getLeft(): number | null;
    getDefinition(): AbstractColDef<any, TValue> | null;
    getColumnGroupShow(): ColumnGroupShowType | undefined;

    /** Returns the parent column group, if column grouping is active. */
    getParent(): ColumnGroup | null;
    isResizable(): boolean;
    isEmptyGroup(): boolean;
    isMoving(): boolean;
    getPinned(): ColumnPinnedType;
}

interface IProvidedColumn {
    isVisible(): boolean;
    getInstanceId(): ColumnInstanceId;
    getColumnGroupShow(): ColumnGroupShowType | undefined;

    /**
     * Returns the unique ID for the column.
     *
     */
    getId(): string;
}

export type ColumnPinnedType = 'left' | 'right' | boolean | null | undefined;
export type ColumnEventName =
    | 'movingChanged'
    | 'leftChanged'
    | 'widthChanged'
    | 'lastLeftPinnedChanged'
    | 'firstRightPinnedChanged'
    | 'visibleChanged'
    | 'filterChanged'
    | 'filterActiveChanged'
    | 'sortChanged'
    | 'colDefChanged'
    | 'menuVisibleChanged'
    | 'columnRowGroupChanged'
    | 'columnPivotChanged'
    | 'columnValueChanged'
    | 'columnStateUpdated';

export type ColumnInstanceId = BrandedType<number, 'ColumnInstanceId'>;

export interface Column<TValue = any> extends IHeaderColumn<TValue>, IProvidedColumn, IEventEmitter {
    /**
     * Returns the column definition provided by the application.
     * This may not be correct, as items can be superseded by default column options.
     * However it's useful for comparison, eg to know which application column definition matches that column.
     */
    getUserProvidedColDef(): ColDef<any, TValue> | null;

    isRowGroupDisplayed(colId: string): boolean;

    /** Returns `true` if column is a primary column, `false` if secondary. Secondary columns are used for pivoting. */
    isPrimary(): boolean;

    /** Returns `true` if column filtering is allowed. */
    isFilterAllowed(): boolean;

    isFieldContainsDots(): boolean;

    isTooltipEnabled(): boolean;

    isTooltipFieldContainsDots(): boolean;

    /** Add an event listener to the column. */
    // eslint-disable-next-line @typescript-eslint/ban-types
    addEventListener(eventType: ColumnEventName, userListener: Function): void;

    /** Remove event listener from the column. */
    // eslint-disable-next-line @typescript-eslint/ban-types
    removeEventListener(eventType: ColumnEventName, userListener: Function): void;

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

    /** If sorting is active, returns the sort direction e.g. `'asc'` or `'desc'`. */
    getSort(): SortDirection | undefined;

    isMenuVisible(): boolean;

    isSortable(): boolean;

    isSortAscending(): boolean;

    isSortDescending(): boolean;

    isSortNone(): boolean;

    isSorting(): boolean;

    getSortIndex(): number | null | undefined;

    /** If aggregation is set for the column, returns the aggregation function. */
    getAggFunc(): string | IAggFunc | null | undefined;

    getRight(): number;

    /** Returns `true` if filter is active on the column. */
    isFilterActive(): boolean;

    /** Returns `true` when this `Column` is hovered, otherwise `false` */
    isHovered(): boolean;

    isFirstRightPinned(): boolean;

    isLastLeftPinned(): boolean;

    isPinned(): boolean;

    isPinnedLeft(): boolean;

    isPinnedRight(): boolean;

    isSpanHeaderHeight(): boolean;

    getColumnGroupPaddingInfo(): { numberOfParents: number; isSpanningTotal: boolean };

    /** Returns the column definition for this column.
     * The column definition will be the result of merging the application provided column definition with any provided defaults
     * (e.g. `defaultColDef` grid option, or column types.
     *
     * Equivalent: `getDefinition` */
    getColDef(): ColDef<any, TValue>;

    /**
     * Returns the unique ID for the column.
     *
     * Equivalent: `getId`, `getUniqueId` */
    getColId(): string;

    getAutoHeaderHeight(): number | null;

    getColSpan(rowNode: IRowNode): number;

    getRowSpan(rowNode: IRowNode): number;

    isGreaterThanMax(width: number): boolean;

    getMaxWidth(): number | null | undefined;

    getFlex(): number;

    /** Returns `true` if row group is currently active for this column. */
    isRowGroupActive(): boolean;

    /** Returns `true` if pivot is currently active for this column. */
    isPivotActive(): boolean;

    isAnyFunctionActive(): boolean;

    isAnyFunctionAllowed(): boolean;

    /** Returns `true` if value (aggregation) is currently active for this column. */
    isValueActive(): boolean;

    isAllowPivot(): boolean;

    isAllowValue(): boolean;

    isAllowRowGroup(): boolean;

    isColumn: true;
}

export type ColumnGroupShowType = 'open' | 'closed';

export interface ColumnGroup<TValue = any> extends IHeaderColumn<TValue> {
    getGroupId(): string;

    getPartId(): number;

    isResizable(): boolean;

    getDisplayedChildren(): (Column | ColumnGroup)[] | null;

    getLeafColumns(): Column[];

    getDisplayedLeafColumns(): Column[];

    getColGroupDef(): ColGroupDef | null;

    isPadding(): boolean;

    isExpandable(): boolean;

    isExpanded(): boolean;

    getChildren(): (Column | ColumnGroup)[] | null;

    getProvidedColumnGroup(): ProvidedColumnGroup;

    getPaddingLevel(): number;

    isColumn: false;
}

export interface ProvidedColumnGroup extends IProvidedColumn, IEventEmitter {
    /**
     * Used for marryChildren, helps with comparing when duplicate groups have been created to manage split groups.
     *
     * Parent may contain a duplicate but not identical group when the group is split.
     */
    getOriginalParent(): ProvidedColumnGroup | null;

    getLevel(): number;

    isPadding(): boolean;

    isExpandable(): boolean;

    isExpanded(): boolean;

    getGroupId(): string;

    getChildren(): (Column | ProvidedColumnGroup)[];

    getColGroupDef(): ColGroupDef | null;

    getLeafColumns(): Column[];

    isColumn: false;
}
