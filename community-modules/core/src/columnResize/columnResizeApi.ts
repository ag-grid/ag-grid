import type { BeanCollection } from '../context/context';
import type { ColDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { Column } from '../interfaces/iColumn';

/** @deprecated v31.1 */
export function setColumnWidth(
    beans: BeanCollection,
    key: string | ColDef | Column,
    newWidth: number,
    finished: boolean = true,
    source: ColumnEventType = 'api'
): void {
    beans.columnResizeService?.setColumnWidths([{ key, newWidth }], false, finished, source);
}

export function setColumnWidths(
    beans: BeanCollection,
    columnWidths: { key: string | ColDef | Column; newWidth: number }[],
    finished: boolean = true,
    source: ColumnEventType = 'api'
): void {
    beans.columnResizeService?.setColumnWidths(columnWidths, false, finished, source);
}
