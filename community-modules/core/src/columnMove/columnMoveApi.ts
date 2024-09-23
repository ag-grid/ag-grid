import type { BeanCollection } from '../context/context';
import type { ColDef } from '../entities/colDef';
import type { Column } from '../interfaces/iColumn';

/** @deprecated v31.1 */
export function moveColumn(beans: BeanCollection, key: string | ColDef | Column, toIndex: number): void {
    beans.columnMoveService?.moveColumns([key], toIndex, 'api');
}

export function moveColumnByIndex(beans: BeanCollection, fromIndex: number, toIndex: number): void {
    beans.columnMoveService?.moveColumnByIndex(fromIndex, toIndex, 'api');
}

export function moveColumns(beans: BeanCollection, columnsToMoveKeys: (string | ColDef | Column)[], toIndex: number) {
    beans.columnMoveService?.moveColumns(columnsToMoveKeys, toIndex, 'api');
}
