import type { GetCellValueParams } from '../api/gridApi';
import type { BeanCollection } from '../context/context';
import { _missing } from '../utils/generic';
import { _escapeString } from '../utils/string';

export function expireValueCache(beans: BeanCollection): void {
    beans.valueCache?.expire();
}

export function getCellValue<TValue = any>(beans: BeanCollection, params: GetCellValueParams<TValue>): any {
    const { colKey, rowNode, useFormatter } = params;

    const column = beans.colModel.getColDefCol(colKey) ?? beans.colModel.getCol(colKey);
    if (_missing(column)) {
        return null;
    }

    if (useFormatter) {
        const [value, formattedValue] = beans.valueSvc.getValueForDisplay(column, rowNode, true);
        return formattedValue ?? _escapeString(value, true);
    }

    return beans.valueSvc.getValueForDisplay(column, rowNode);
}
