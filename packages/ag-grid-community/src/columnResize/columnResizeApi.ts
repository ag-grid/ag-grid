import type { BeanCollection } from '../context/context';
import type { ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';

export function setColumnWidths(
    beans: BeanCollection,
    columnWidths: { key: ColKey; newWidth: number }[],
    finished: boolean = true,
    source: ColumnEventType = 'api'
): void {
    beans.colResize?.setColumnWidths(columnWidths, false, finished, source);
}
