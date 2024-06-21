import type { AgProvidedColumnGroupEvent } from '../entities/agProvidedColumnGroup';
import type { AbstractColDef, ColDef, ColGroupDef, IAggFunc, SortDirection } from '../entities/colDef';
import type { ColumnEvent } from '../events';
import type { BrandedType } from '../interfaces/brandedType';
import type { IEventEmitter } from './iEventEmitter';
import type { IRowNode } from './iRowNode';

export type HeaderColumnId = BrandedType<string, 'HeaderColumnId'>;

// Implemented by Column and ColumnGroup. Allows the groups to contain a list of this type for it's children.
// See the note at the top of Column class.
interface IHeaderColumn<TValue, TEventType extends string> extends IEventEmitter<TEventType> {
    /**
     * Returns the unique ID for the column.
     *
     */
    getUniqueId(): HeaderColumnId;

    /** Returns the current width of the column. If the column is resized, the actual width is the new size. */
    getActualWidth(): number;
    /** Returns the minWidth of the column or the default min width. */
    getMinWidth(): number | null | undefined;
    /** Returns the left position of the column. */
    getLeft(): number | null;
    /** Returns the underlying definition. */
    getDefinition(): AbstractColDef<any, TValue> | null;
    /** Returns whether this column should be shown when the group is open / closed or undefined if its always shown. */
    getColumnGroupShow(): ColumnGroupShowType | undefined;

    /** Returns the parent column group, if column grouping is active. */
    getParent(): ColumnGroup | null;

    /** Returns `true` if this group is resizable. */
    isResizable(): boolean;

    /** Returns `true` if this is an empty group. */
    isEmptyGroup(): boolean;

    /** Returns `true` while the column is being moved. */
    isMoving(): boolean;

    /** Returns the pinned state of the column. */
    getPinned(): ColumnPinnedType;
}

interface IProvidedColumn {
    /** Returns `true` if the column is visible. */
    isVisible(): boolean;
    /** Returns the instance id of the column. */
    getInstanceId(): ColumnInstanceId;
    /** Returns whether this column should be shown when the group is open / closed or undefined if its always shown. */
    getColumnGroupShow(): ColumnGroupShowType | undefined;

    /** Returns the unique ID for the column. */
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

export interface Column<TValue = any>
    extends IHeaderColumn<TValue, ColumnEventName>,
        IProvidedColumn,
        IEventEmitter<ColumnEventName> {
    /**
     * Returns the column definition provided by the application.
     * This may not be correct, as items can be superseded by default column options.
     * However it's useful for comparison, eg to know which application column definition matches that column.
     */
    getUserProvidedColDef(): ColDef<any, TValue> | null;

    /** Returns `true` if this column group is being used to display a row group value. */
    isRowGroupDisplayed(colId: string): boolean;

    /** Returns `true` if column is a primary column, `false` if secondary. Secondary columns are used for pivoting. */
    isPrimary(): boolean;

    /** Returns `true` if column filtering is allowed. */
    isFilterAllowed(): boolean;

    /** Returns `true` if a tooltip is enabled for this column. */
    isTooltipEnabled(): boolean;

    /** Add an event listener to the column. */
    addEventListener<T extends ColumnEventName>(eventType: T, userListener: (params: ColumnEvent<T>) => void): void;

    /** Remove event listener from the column. */
    removeEventListener<T extends ColumnEventName>(eventType: T, userListener: (params: ColumnEvent<T>) => void): void;

    /** Returns `true` if navigation is suppressed for the given column and rowNode. */
    isSuppressNavigable(rowNode: IRowNode): boolean;

    /**
     * Returns `true` if the cell for this column is editable for the given `rowNode`, otherwise `false`.
     */
    isCellEditable(rowNode: IRowNode): boolean;

    /** Returns `true` if the fill handle is suppressed. */
    isSuppressFillHandle(): boolean;

    /** Returns `true` if the column has autoHeight enabled. */
    isAutoHeight(): boolean;

    /** Returns `true` if the column header has autoHeight enabled. */
    isAutoHeaderHeight(): boolean;

    /** Returns `true` if this column and row node can be dragged. */
    isRowDrag(rowNode: IRowNode): boolean;

    isCellCheckboxSelection(rowNode: IRowNode): boolean;

    isSuppressPaste(rowNode: IRowNode): boolean;

    /** If sorting is active, returns the sort direction e.g. `'asc'` or `'desc'`. */
    getSort(): SortDirection | undefined;

    /** Returns `true` if sorting is enabled for this column via the `sortable` property. */
    isSortable(): boolean;

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

export type AgColumnGroupEvent = 'leftChanged' | 'displayedChildrenChanged';
export interface ColumnGroup<TValue = any> extends IHeaderColumn<TValue, AgColumnGroupEvent> {
    /** Returns the group column id. */
    getGroupId(): string;

    /** Returns `true` if this group is resizable. */
    isResizable(): boolean;

    /** Returns the displayed children of this group. */
    getDisplayedChildren(): (Column | ColumnGroup)[] | null;

    /** Returns the leaf columns of this group. */
    getLeafColumns(): Column[];

    /** Returns the displayed leaf columns of this group. */
    getDisplayedLeafColumns(): Column[];

    /** Returns the column group definition for this column.
     * The column group definition will be the result of merging the application provided column group definition with any provided defaults
     * (e.g. `defaultColGroupDef` grid option.
     */
    getColGroupDef(): ColGroupDef | null;

    /** Returns `true` if this column group is a padding group that is used to correctly align column groups / children. */
    isPadding(): boolean;

    /** Returns the padding level of this padding group. */
    getPaddingLevel(): number;

    /** Returns `true` if this column group is expandable. */
    isExpandable(): boolean;

    /** Returns `true` if this column group is expanded. */
    isExpanded(): boolean;

    /** Returns the children of this group if they exist or `null` */
    getChildren(): (Column | ColumnGroup)[] | null;

    /** Returns the provided column group */
    getProvidedColumnGroup(): ProvidedColumnGroup;

    /** isColumn is always `false` as this is a group column */
    isColumn: false;
}

export interface ProvidedColumnGroup extends IProvidedColumn, IEventEmitter<AgProvidedColumnGroupEvent> {
    /**
     * Used for marryChildren, helps with comparing when duplicate groups have been created to manage split groups.
     *
     * Parent may contain a duplicate but not identical group when the group is split.
     */
    getOriginalParent(): ProvidedColumnGroup | null;

    /** Returns the level of this group. */
    getLevel(): number;

    /** Returns `true` if this column group is a padding group that is used to correctly align column groups / children. */
    isPadding(): boolean;

    /** Returns `true` if this column group is expandable. */
    isExpandable(): boolean;

    /** Returns `true` if this column group is expanded. */
    isExpanded(): boolean;

    /** Returns the group column id. */
    getGroupId(): string;

    /** Returns the children of this group. */
    getChildren(): (Column | ProvidedColumnGroup)[];

    /** Returns the column group definition for this column.
     * The column group definition will be the result of merging the application provided column group definition with any provided defaults
     * (e.g. `defaultColGroupDef` grid option.
     */
    getColGroupDef(): ColGroupDef | null;

    /** Returns the leaf columns of this group. */
    getLeafColumns(): Column[];

    /** isColumn is always `false` as this is a group column */
    isColumn: false;
}
