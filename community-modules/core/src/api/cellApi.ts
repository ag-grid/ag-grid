import type { BeanCollection } from '../context/context';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import { _missing } from '../utils/generic';
import { _escapeString } from '../utils/string';
import { _logDeprecation } from './apiUtils';
import type { GetCellValueParams } from './gridApi';

export function expireValueCache(beans: BeanCollection): void {
    beans.valueCache.expire();
}

export function getValue<TValue = any>(
    beans: BeanCollection,
    colKey: string | Column<TValue>,
    rowNode: IRowNode
): TValue | null | undefined {
    _logDeprecation('31.3', 'getValue', 'getCellValue');
    return getCellValue(beans, { colKey, rowNode }) as TValue | null | undefined;
}

export function getCellValue<TValue = any>(beans: BeanCollection, params: GetCellValueParams<TValue>): any {
    const { colKey, rowNode, useFormatter } = params;

    const column = beans.columnModel.getColDefCol(colKey) ?? beans.columnModel.getCol(colKey);
    if (_missing(column)) {
        return null;
    }

    const value = beans.valueService.getValue(column, rowNode);

    if (useFormatter) {
        const formattedValue = beans.valueService.formatValue(column, rowNode, value);
        // Match the logic in the default cell renderer insertValueWithoutCellRenderer if no formatter is used
        return formattedValue ?? _escapeString(value, true);
    }

    return value;
}
