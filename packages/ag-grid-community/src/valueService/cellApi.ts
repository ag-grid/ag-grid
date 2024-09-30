import type { GetCellValueParams } from '../api/gridApi';
import type { BeanCollection } from '../context/context';
import { _missing } from '../utils/generic';
import { _escapeString } from '../utils/string';

export function expireValueCache(beans: BeanCollection): void {
    beans.valueCache?.expire();
}

export function getCellValue<TValue = any>(beans: BeanCollection, params: GetCellValueParams<TValue>): any {
    const { colKey, rowNode, useFormatter } = params;

    const column = beans.columnModel.getColDefCol(colKey) ?? beans.columnModel.getCol(colKey);
    if (_missing(column)) {
        return null;
    }

    const value = beans.valueService.getValueForDisplay(column, rowNode);

    if (useFormatter) {
        const formattedValue = beans.valueService.formatValue(column, rowNode, value);
        // Match the logic in the default cell renderer insertValueWithoutCellRenderer if no formatter is used
        return formattedValue ?? _escapeString(value, true);
    }

    return value;
}
