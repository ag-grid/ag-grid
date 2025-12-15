import { _missing } from '../agStack/utils/generic';
import { _toString } from '../agStack/utils/string';
import type { BeanCollection } from '../context/context';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';

export interface GetCellValueParams<TValue = any> {
    /** The row node to get the value from */
    rowNode: IRowNode;
    /** The column to get the value from */
    colKey: string | Column<TValue>;
    /** If `true` formatted value will be returned. */
    useFormatter?: boolean;
}

export function expireValueCache(beans: BeanCollection): void {
    beans.valueCache?.expire();
}

export function getCellValue<TValue = any>(beans: BeanCollection, params: GetCellValueParams<TValue>): any {
    const { colKey, rowNode, useFormatter } = params;

    const column = beans.colModel.getColDefCol(colKey) ?? beans.colModel.getCol(colKey);
    if (_missing(column)) {
        return null;
    }
    const result = beans.valueSvc.getValueForDisplay({ column, node: rowNode, includeValueFormatted: useFormatter });
    if (useFormatter) {
        return result.valueFormatted ?? _toString(result.value);
    }
    return result.value;
}
