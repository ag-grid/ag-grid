import { _missing } from '../agStack/utils/generic';
import { _toString } from '../agStack/utils/string';
import type { GetCellValueParams } from '../api/gridApi';
import type { BeanCollection } from '../context/context';

export function expireValueCache(beans: BeanCollection): void {
    beans.valueCache?.expire();
}

export function getCellValue<TValue = any>(beans: BeanCollection, params: GetCellValueParams<TValue>): any {
    const { colKey, rowNode, useFormatter } = params;

    const column = beans.colModel.getColDefCol(colKey) ?? beans.colModel.getCol(colKey);
    if (_missing(column)) {
        return null;
    }
    const result = beans.valueSvc.getValueForDisplay(column, rowNode, useFormatter);
    if (useFormatter) {
        return result.valueFormatted ?? _toString(result.value);
    }
    return result.value;
}
