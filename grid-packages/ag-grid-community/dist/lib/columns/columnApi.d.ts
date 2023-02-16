import { ColDef, ColGroupDef, IAggFunc } from "../entities/colDef";
import { IHeaderColumn } from "../interfaces/iHeaderColumn";
import { ColumnState, ApplyColumnStateParams } from "./columnModel";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { ColumnGroup } from "../entities/columnGroup";
import { Column, ColumnPinnedType } from "../entities/column";
import { ColumnEventType } from "../events";
export declare class ColumnApi {
    private columnModel;
    /** Gets the grid to size the columns to the specified width in pixels, e.g. `sizeColumnsToFit(900)`. To have the grid fit the columns to the grid's width, use the Grid API `gridApi.sizeColumnsToFit()` instead. */
    sizeColumnsToFit(gridWidth: number): void;
    /** Call this if you want to open or close a column group. */
    setColumnGroupOpened(group: ProvidedColumnGroup | string, newValue: boolean): void;
    /** Returns the column group with the given name. */
    getColumnGroup(name: string, instanceId?: number): ColumnGroup | null;
    /** Returns the provided column group with the given name. */
    getProvidedColumnGroup(name: string): ProvidedColumnGroup | null;
    /** Returns the display name for a column. Useful if you are doing your own header rendering and want the grid to work out if `headerValueGetter` is used, or if you are doing your own column management GUI, to know what to show as the column name. */
    getDisplayNameForColumn(column: Column, location: string | null): string;
    /** Returns the display name for a column group (when grouping columns). */
    getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: string | null): string;
    /** Returns the column with the given `colKey`, which can either be the `colId` (a string) or the `colDef` (an object). */
    getColumn(key: any): Column | null;
    /** Returns all the columns, regardless of visible or not. */
    getColumns(): Column[] | null;
    /** Applies the state of the columns from a previous state. Returns `false` if one or more columns could not be found. */
    applyColumnState(params: ApplyColumnStateParams): boolean;
    /** Gets the state of the columns. Typically used when saving column state. */
    getColumnState(): ColumnState[];
    /** Sets the state back to match the originally provided column definitions. */
    resetColumnState(): void;
    /** Gets the state of the column groups. Typically used when saving column group state. */
    getColumnGroupState(): {
        groupId: string;
        open: boolean;
    }[];
    /** Sets the state of the column group state from a previous state. */
    setColumnGroupState(stateItems: ({
        groupId: string;
        open: boolean;
    })[]): void;
    /** Sets the state back to match the originally provided column definitions. */
    resetColumnGroupState(): void;
    /** Returns `true` if pinning left or right, otherwise `false`. */
    isPinning(): boolean;
    /** Returns `true` if pinning left, otherwise `false`. */
    isPinningLeft(): boolean;
    /** Returns `true` if pinning right, otherwise `false`. */
    isPinningRight(): boolean;
    /** Returns the column to the right of the provided column, taking into consideration open / closed column groups and visible columns. This is useful if you need to know what column is beside yours e.g. if implementing your own cell navigation. */
    getDisplayedColAfter(col: Column): Column | null;
    /** Same as `getVisibleColAfter` except gives column to the left. */
    getDisplayedColBefore(col: Column): Column | null;
    /** Sets the visibility of a column. Key can be the column ID or `Column` object. */
    setColumnVisible(key: string | Column, visible: boolean): void;
    /** Same as `setColumnVisible`, but provide a list of column keys. */
    setColumnsVisible(keys: (string | Column)[], visible: boolean): void;
    /** Sets the column pinned / unpinned. Key can be the column ID, field, `ColDef` object or `Column` object. */
    setColumnPinned(key: string | Column, pinned: ColumnPinnedType): void;
    /** Same as `setColumnPinned`, but provide a list of column keys. */
    setColumnsPinned(keys: (string | Column)[], pinned: ColumnPinnedType): void;
    /**
     * Returns all the grid columns, same as `getColumns()`, except
     *
     *  a) it has the order of the columns that are presented in the grid
     *
     *  b) it's after the 'pivot' step, so if pivoting, has the value columns for the pivot.
     */
    getAllGridColumns(): Column[];
    /** Same as `getAllDisplayedColumns` but just for the pinned left portion of the grid. */
    getDisplayedLeftColumns(): Column[];
    /** Same as `getAllDisplayedColumns` but just for the center portion of the grid. */
    getDisplayedCenterColumns(): Column[];
    /** Same as `getAllDisplayedColumns` but just for the pinned right portion of the grid. */
    getDisplayedRightColumns(): Column[];
    /** Returns all columns currently displayed (e.g. are visible and if in a group, the group is showing the columns) for the pinned left, centre and pinned right portions of the grid. */
    getAllDisplayedColumns(): Column[];
    /** Same as `getAllGridColumns()`, except only returns rendered columns, i.e. columns that are not within the viewport and therefore not rendered, due to column virtualisation, are not displayed. */
    getAllDisplayedVirtualColumns(): Column[];
    /** Moves a column to `toIndex`. The column is first removed, then added at the `toIndex` location, thus index locations will change to the right of the column after the removal. */
    moveColumn(key: string | Column, toIndex: number): void;
    /** Same as `moveColumn` but works on index locations. */
    moveColumnByIndex(fromIndex: number, toIndex: number): void;
    /** Same as `moveColumn` but works on list. */
    moveColumns(columnsToMoveKeys: (string | Column)[], toIndex: number): void;
    /** Move the column to a new position in the row grouping order. */
    moveRowGroupColumn(fromIndex: number, toIndex: number): void;
    /** Sets the agg function for a column. `aggFunc` can be one of the built-in aggregations or a custom aggregation by name or direct function. */
    setColumnAggFunc(key: string | Column, aggFunc: string | IAggFunc | null | undefined): void;
    /** Sets the column width on a single column. The finished flag gets included in the resulting event and not used internally by the grid. The finished flag is intended for dragging, where a dragging action will produce many `columnWidth` events, so the consumer of events knows when it receives the last event in a stream. The finished parameter is optional, and defaults to `true`. */
    setColumnWidth(key: string | Column, newWidth: number, finished?: boolean, source?: ColumnEventType): void;
    /** Sets the column widths on multiple columns. This method offers better performance than calling `setColumnWidth` multiple times. The finished flag gets included in the resulting event and not used internally by the grid. The finished flag is intended for dragging, where a dragging action will produce many `columnWidth` events, so the consumer of events knows when it receives the last event in a stream. The finished parameter is optional, and defaults to `true`. */
    setColumnWidths(columnWidths: {
        key: string | Column;
        newWidth: number;
    }[], finished?: boolean, source?: ColumnEventType): void;
    /** Set the pivot mode. */
    setPivotMode(pivotMode: boolean): void;
    /** Get the pivot mode. */
    isPivotMode(): boolean;
    /** Returns the pivot result column for the given `pivotKeys` and `valueColId`. Useful to then call operations on the pivot column. */
    getPivotResultColumn(pivotKeys: string[], valueColKey: string | Column): Column | null;
    /** Set the value columns to the provided list of columns. */
    setValueColumns(colKeys: (string | Column)[]): void;
    /** Get a list of the existing value columns. */
    getValueColumns(): Column[];
    /** Remove the given column from the existing set of value columns. */
    removeValueColumn(colKey: (string | Column)): void;
    /** Like `removeValueColumn` but remove the given list of columns from the existing set of value columns. */
    removeValueColumns(colKeys: (string | Column)[]): void;
    /** Add the given column to the set of existing value columns. */
    addValueColumn(colKey: (string | Column)): void;
    /** Like `addValueColumn` but add the given list of columns to the existing set of value columns. */
    addValueColumns(colKeys: (string | Column)[]): void;
    /** Set the row group columns. */
    setRowGroupColumns(colKeys: (string | Column)[]): void;
    /** Remove a column from the row groups. */
    removeRowGroupColumn(colKey: string | Column): void;
    /** Same as `removeRowGroupColumn` but provide a list of columns. */
    removeRowGroupColumns(colKeys: (string | Column)[]): void;
    /** Add a column to the row groups. */
    addRowGroupColumn(colKey: string | Column): void;
    /** Same as `addRowGroupColumn` but provide a list of columns. */
    addRowGroupColumns(colKeys: (string | Column)[]): void;
    /** Get row group columns. */
    getRowGroupColumns(): Column[];
    /** Set the pivot columns. */
    setPivotColumns(colKeys: (string | Column)[]): void;
    /** Remove a pivot column. */
    removePivotColumn(colKey: string | Column): void;
    /** Same as `removePivotColumn` but provide a list of columns. */
    removePivotColumns(colKeys: (string | Column)[]): void;
    /** Add a pivot column. */
    addPivotColumn(colKey: string | Column): void;
    /** Same as `addPivotColumn` but provide a list of columns. */
    addPivotColumns(colKeys: (string | Column)[]): void;
    /** Get the pivot columns. */
    getPivotColumns(): Column[];
    /** Same as `getAllDisplayedColumnGroups` but just for the pinned left portion of the grid. */
    getLeftDisplayedColumnGroups(): IHeaderColumn[];
    /** Same as `getAllDisplayedColumnGroups` but just for the center portion of the grid. */
    getCenterDisplayedColumnGroups(): IHeaderColumn[];
    /** Same as `getAllDisplayedColumnGroups` but just for the pinned right portion of the grid. */
    getRightDisplayedColumnGroups(): IHeaderColumn[];
    /** Returns all 'root' column headers. If you are not grouping columns, these return the columns. If you are grouping, these return the top level groups - you can navigate down through each one to get the other lower level headers and finally the columns at the bottom. */
    getAllDisplayedColumnGroups(): IHeaderColumn[] | null;
    /** Auto-sizes a column based on its contents. */
    autoSizeColumn(key: string | Column, skipHeader?: boolean): void;
    /** Same as `autoSizeColumn`, but provide a list of column keys. */
    autoSizeColumns(keys: (string | Column)[], skipHeader?: boolean): void;
    /** Calls `autoSizeColumns` on all displayed columns. */
    autoSizeAllColumns(skipHeader?: boolean): void;
    /** Set the pivot result columns. */
    setPivotResultColumns(colDefs: (ColDef | ColGroupDef)[]): void;
    /** Returns the grid's pivot result columns. */
    getPivotResultColumns(): Column[] | null;
    private cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid;
    /** @deprecated v28 Use `getColumns` instead */
    getAllColumns(): Column[] | null;
    /** @deprecated v27 getOriginalColumnGroup is deprecated, use getProvidedColumnGroup. */
    getOriginalColumnGroup(name: string): ProvidedColumnGroup | null;
    /** @deprecated v28 Use `getColumns` instead. */
    getPrimaryColumns(): Column[] | null;
    /** @deprecated v28 Use `getPivotResultColumns` instead. */
    getSecondaryColumns(): Column[] | null;
    /** @deprecated v28 Use `setPivotResultColumns` instead. */
    setSecondaryColumns(colDefs: (ColDef | ColGroupDef)[]): void;
    /** @deprecated v28 Use `getPivotResultColumn` instead */
    getSecondaryPivotColumn(pivotKeys: string[], valueColKey: string | Column): Column | null;
}
