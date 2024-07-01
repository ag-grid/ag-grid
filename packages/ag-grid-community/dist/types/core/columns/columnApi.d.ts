import type { BeanCollection } from '../context/context';
import type { ColDef, ColGroupDef, HeaderLocation } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { Column, ColumnGroup, ColumnPinnedType, ProvidedColumnGroup } from '../interfaces/iColumn';
import type { ApplyColumnStateParams, ColumnState } from './columnApplyStateService';
import type { ISizeColumnsToFitParams } from './columnSizeService';
export declare function getColumnDef<TValue = any, TData = any>(beans: BeanCollection, key: string | Column<TValue>): ColDef<TData, TValue> | null;
export declare function getColumnDefs<TData = any>(beans: BeanCollection): (ColDef<TData> | ColGroupDef<TData>)[] | undefined;
export declare function sizeColumnsToFit(beans: BeanCollection, paramsOrGridWidth?: ISizeColumnsToFitParams | number): void;
export declare function setColumnGroupOpened(beans: BeanCollection, group: ProvidedColumnGroup | string, newValue: boolean): void;
export declare function getColumnGroup(beans: BeanCollection, name: string, instanceId?: number): ColumnGroup | null;
export declare function getProvidedColumnGroup(beans: BeanCollection, name: string): ProvidedColumnGroup | null;
export declare function getDisplayNameForColumn(beans: BeanCollection, column: Column, location: HeaderLocation): string;
export declare function getDisplayNameForColumnGroup(beans: BeanCollection, columnGroup: ColumnGroup, location: HeaderLocation): string;
export declare function getColumn<TValue = any, TData = any>(beans: BeanCollection, key: string | ColDef<TData, TValue> | Column<TValue>): Column<TValue> | null;
export declare function getColumns(beans: BeanCollection): Column[] | null;
export declare function applyColumnState(beans: BeanCollection, params: ApplyColumnStateParams): boolean;
export declare function getColumnState(beans: BeanCollection): ColumnState[];
export declare function resetColumnState(beans: BeanCollection): void;
export declare function getColumnGroupState(beans: BeanCollection): {
    groupId: string;
    open: boolean;
}[];
export declare function setColumnGroupState(beans: BeanCollection, stateItems: {
    groupId: string;
    open: boolean;
}[]): void;
export declare function resetColumnGroupState(beans: BeanCollection): void;
export declare function isPinning(beans: BeanCollection): boolean;
export declare function isPinningLeft(beans: BeanCollection): boolean;
export declare function isPinningRight(beans: BeanCollection): boolean;
export declare function getDisplayedColAfter(beans: BeanCollection, col: Column): Column | null;
export declare function getDisplayedColBefore(beans: BeanCollection, col: Column): Column | null;
/** @deprecated v31.1 */
export declare function setColumnVisible(beans: BeanCollection, key: string | Column, visible: boolean): void;
export declare function setColumnsVisible(beans: BeanCollection, keys: (string | Column)[], visible: boolean): void;
/** @deprecated v31.1 */
export declare function setColumnPinned(beans: BeanCollection, key: string | ColDef | Column, pinned: ColumnPinnedType): void;
export declare function setColumnsPinned(beans: BeanCollection, keys: (string | ColDef | Column)[], pinned: ColumnPinnedType): void;
export declare function getAllGridColumns(beans: BeanCollection): Column[];
export declare function getDisplayedLeftColumns(beans: BeanCollection): Column[];
export declare function getDisplayedCenterColumns(beans: BeanCollection): Column[];
export declare function getDisplayedRightColumns(beans: BeanCollection): Column[];
export declare function getAllDisplayedColumns(beans: BeanCollection): Column[];
export declare function getAllDisplayedVirtualColumns(beans: BeanCollection): Column[];
/** @deprecated v31.1 */
export declare function moveColumn(beans: BeanCollection, key: string | ColDef | Column, toIndex: number): void;
export declare function moveColumnByIndex(beans: BeanCollection, fromIndex: number, toIndex: number): void;
export declare function moveColumns(beans: BeanCollection, columnsToMoveKeys: (string | ColDef | Column)[], toIndex: number): void;
/** @deprecated v31.1 */
export declare function setColumnWidth(beans: BeanCollection, key: string | ColDef | Column, newWidth: number, finished?: boolean, source?: ColumnEventType): void;
export declare function setColumnWidths(beans: BeanCollection, columnWidths: {
    key: string | ColDef | Column;
    newWidth: number;
}[], finished?: boolean, source?: ColumnEventType): void;
export declare function getLeftDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[];
export declare function getCenterDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[];
export declare function getRightDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[];
export declare function getAllDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[] | null;
/** @deprecated v31.1 */
export declare function autoSizeColumn(beans: BeanCollection, key: string | ColDef | Column, skipHeader?: boolean): void;
export declare function autoSizeColumns(beans: BeanCollection, keys: (string | ColDef | Column)[], skipHeader?: boolean): void;
export declare function autoSizeAllColumns(beans: BeanCollection, skipHeader?: boolean): void;
