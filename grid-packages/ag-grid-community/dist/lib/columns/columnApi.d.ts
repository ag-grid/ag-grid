import { ColDef, ColGroupDef, HeaderLocation, IAggFunc } from "../entities/colDef";
import { Column, ColumnPinnedType } from "../entities/column";
import { ColumnGroup } from "../entities/columnGroup";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { ColumnEventType } from "../events";
import { GridApi } from "../gridApi";
import { IHeaderColumn } from "../interfaces/iHeaderColumn";
import { ApplyColumnStateParams, ColumnState } from "./columnModel";
/** @deprecated Use methods via the grid api instead. */
export declare class ColumnApi {
    private api;
    constructor(gridAp: GridApi);
    private viaApi;
    /** @deprecated v31 use `api.sizeColumnsToFit()` instead.   */
    sizeColumnsToFit(gridWidth: number): void;
    /** @deprecated v31 use `api.setColumnGroupOpened() instead. */
    setColumnGroupOpened(group: ProvidedColumnGroup | string, newValue: boolean): void;
    /** @deprecated v31 use `api.getColumnGroup() instead. */
    getColumnGroup(name: string, instanceId?: number): ColumnGroup | null;
    /** @deprecated v31 use `api.getProvidedColumnGroup() instead. */
    getProvidedColumnGroup(name: string): ProvidedColumnGroup | null;
    /** @deprecated v31 use `api.getDisplayNameForColumn() instead. */
    getDisplayNameForColumn(column: Column, location: HeaderLocation): string;
    /** @deprecated v31 use `api.getDisplayNameForColumnGroup() instead. */
    getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: HeaderLocation): string;
    /** @deprecated v31 use `api.getColumn() instead. */
    getColumn(key: string | ColDef | Column): Column | null;
    /** @deprecated v31 use `api.getColumns() instead. */
    getColumns(): Column[] | null;
    /** @deprecated v31 use `api.applyColumnState() instead. */
    applyColumnState(params: ApplyColumnStateParams): boolean;
    /** @deprecated v31 use `api.getColumnState() instead. */
    getColumnState(): ColumnState[];
    /** @deprecated v31 use `api.resetColumnState() instead. */
    resetColumnState(): void;
    /** @deprecated v31 use `api.getColumnGroupState() instead. */
    getColumnGroupState(): {
        groupId: string;
        open: boolean;
    }[];
    /** @deprecated v31 use `api.setColumnGroupState() instead. */
    setColumnGroupState(stateItems: ({
        groupId: string;
        open: boolean;
    })[]): void;
    /** @deprecated v31 use `api.resetColumnGroupState() instead. */
    resetColumnGroupState(): void;
    /** @deprecated v31 use `api.isPinning() instead. */
    isPinning(): boolean;
    /** @deprecated v31 use `api.isPinningLeft() instead. */
    isPinningLeft(): boolean;
    /** @deprecated v31 use `api.isPinningRight() instead. */
    isPinningRight(): boolean;
    /** @deprecated v31 use `api.getDisplayedColAfter() instead. */
    getDisplayedColAfter(col: Column): Column | null;
    /** @deprecated v31 use `api.getDisplayedColBefore() instead. */
    getDisplayedColBefore(col: Column): Column | null;
    /** @deprecated v31 use `api.setColumnVisible() instead. */
    setColumnVisible(key: string | Column, visible: boolean): void;
    /** @deprecated v31 use `api.setColumnsVisible() instead. */
    setColumnsVisible(keys: (string | Column)[], visible: boolean): void;
    /** @deprecated v31 use `api.setColumnPinned() instead. */
    setColumnPinned(key: string | ColDef | Column, pinned: ColumnPinnedType): void;
    /** @deprecated v31 use `api.setColumnsPinned() instead. */
    setColumnsPinned(keys: (string | ColDef | Column)[], pinned: ColumnPinnedType): void;
    /** @deprecated v31 use `api.getAllGridColumns() instead. */
    getAllGridColumns(): Column[];
    /** @deprecated v31 use `api.getDisplayedLeftColumns() instead. */
    getDisplayedLeftColumns(): Column[];
    /** @deprecated v31 use `api.getDisplayedCenterColumns() instead. */
    getDisplayedCenterColumns(): Column[];
    /** @deprecated v31 use `api.getDisplayedRightColumns() instead. */
    getDisplayedRightColumns(): Column[];
    /** @deprecated v31 use `api.getAllDisplayedColumns() instead. */
    getAllDisplayedColumns(): Column[];
    /** @deprecated v31 use `api.getAllDisplayedVirtualColumns() instead. */
    getAllDisplayedVirtualColumns(): Column[];
    /** @deprecated v31 use `api.moveColumn() instead. */
    moveColumn(key: string | ColDef | Column, toIndex: number): void;
    /** @deprecated v31 use `api.moveColumnByIndex() instead. */
    moveColumnByIndex(fromIndex: number, toIndex: number): void;
    /** @deprecated v31 use `api.moveColumns() instead. */
    moveColumns(columnsToMoveKeys: (string | ColDef | Column)[], toIndex: number): void;
    /** @deprecated v31 use `api.moveRowGroupColumn() instead. */
    moveRowGroupColumn(fromIndex: number, toIndex: number): void;
    /** @deprecated v31 use `api.setColumnAggFunc() instead. */
    setColumnAggFunc(key: string | ColDef | Column, aggFunc: string | IAggFunc | null | undefined): void;
    /** @deprecated v31 use `api.setColumnWidth() instead. */
    setColumnWidth(key: string | ColDef | Column, newWidth: number, finished?: boolean, source?: ColumnEventType): void;
    /** @deprecated v31 use `api.setColumnWidths() instead. */
    setColumnWidths(columnWidths: {
        key: string | ColDef | Column;
        newWidth: number;
    }[], finished?: boolean, source?: ColumnEventType): void;
    /** @deprecated v31 use `api.setPivotMode() instead. */
    setPivotMode(pivotMode: boolean): void;
    /** @deprecated v31 use `api.isPivotMode() instead. */
    isPivotMode(): boolean;
    /** @deprecated v31 use `api.getPivotResultColumn() instead. */
    getPivotResultColumn(pivotKeys: string[], valueColKey: string | ColDef | Column): Column | null;
    /** @deprecated v31 use `api.setValueColumns() instead. */
    setValueColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31 use `api.getValueColumns() instead. */
    getValueColumns(): Column[];
    /** @deprecated v31 use `api.removeValueColumn() instead. */
    removeValueColumn(colKey: (string | ColDef | Column)): void;
    /** @deprecated v31 use `api.removeValueColumns() instead. */
    removeValueColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31 use `api.addValueColumn() instead. */
    addValueColumn(colKey: (string | ColDef | Column)): void;
    /** @deprecated v31 use `api.addValueColumns() instead. */
    addValueColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31 use `api.setRowGroupColumns() instead. */
    setRowGroupColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31 use `api.removeRowGroupColumn() instead. */
    removeRowGroupColumn(colKey: string | ColDef | Column): void;
    /** @deprecated v31 use `api.removeRowGroupColumns() instead. */
    removeRowGroupColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31 use `api.addRowGroupColumn() instead. */
    addRowGroupColumn(colKey: string | ColDef | Column): void;
    /** @deprecated v31 use `api.addRowGroupColumns() instead. */
    addRowGroupColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31 use `api.getRowGroupColumns() instead. */
    getRowGroupColumns(): Column[];
    /** @deprecated v31 use `api.setPivotColumns() instead. */
    setPivotColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31 use `api.removePivotColumn() instead. */
    removePivotColumn(colKey: string | ColDef | Column): void;
    /** @deprecated v31 use `api.removePivotColumns() instead. */
    removePivotColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31 use `api.addPivotColumn() instead. */
    addPivotColumn(colKey: string | ColDef | Column): void;
    /** @deprecated v31 use `api.addPivotColumns() instead. */
    addPivotColumns(colKeys: (string | ColDef | Column)[]): void;
    /** @deprecated v31 use `api.getPivotColumns() instead. */
    getPivotColumns(): Column[];
    /** @deprecated v31 use `api.getLeftDisplayedColumnGroups() instead. */
    getLeftDisplayedColumnGroups(): IHeaderColumn[];
    /** @deprecated v31 use `api.getCenterDisplayedColumnGroups() instead. */
    getCenterDisplayedColumnGroups(): IHeaderColumn[];
    /** @deprecated v31 use `api.getRightDisplayedColumnGroups() instead. */
    getRightDisplayedColumnGroups(): IHeaderColumn[];
    /** @deprecated v31 use `api.getAllDisplayedColumnGroups() instead. */
    getAllDisplayedColumnGroups(): IHeaderColumn[] | null;
    /** @deprecated v31 use `api.autoSizeColumn() instead. */
    autoSizeColumn(key: string | ColDef | Column, skipHeader?: boolean): void;
    /** @deprecated v31 use `api.autoSizeColumns() instead. */
    autoSizeColumns(keys: (string | ColDef | Column)[], skipHeader?: boolean): void;
    /** @deprecated v31 use `api.autoSizeAllColumns() instead. */
    autoSizeAllColumns(skipHeader?: boolean): void;
    /** @deprecated v31 use `api.setPivotResultColumns() instead. */
    setPivotResultColumns(colDefs: (ColDef | ColGroupDef)[]): void;
    /** @deprecated v31 use `api.getPivotResultColumns() instead. */
    getPivotResultColumns(): Column[] | null;
}
