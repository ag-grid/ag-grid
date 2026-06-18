import type { AgColumn, ColKey, IPivotResultColsService, IRowNode } from 'ag-grid-community';

import { isNumericLike, toNumber } from '../rowGrouping/distributeGroupValue/valueConversion';

/** Unwraps an aggregation wrapper (e.g. `avg`'s `{ value, count }`) to its scalar; returns non-wrappers as-is. */
export const unwrapAggValue = (value: any): any => {
    if (value != null && typeof value === 'object') {
        if (typeof value.toNumber === 'function') {
            return value.toNumber();
        }
        if ('value' in value) {
            return value.value;
        }
    }
    return value;
};

/** Numeric coercion for transforms: `null` for non-numeric or non-finite (so the cell blanks). Shares the
 *  agg-unwrap coercion with `valueConversion` (which returns `0` for non-numeric — here we need `null`). */
export const numericOrNull = (value: unknown): number | null => {
    if (!isNumericLike(value)) {
        return null;
    }
    const n = toNumber(value);
    return Number.isFinite(n) ? n : null;
};

/** Reads a node's aggregated value for a column, unwrapping avg/count wrappers to a number. */
export const readAggScalar = (node: IRowNode, column: AgColumn): number | null => {
    const aggData = node.aggData;
    return aggData ? numericOrNull(aggData[column.colId]) : null;
};

/** Reads a node's value (aggregate on group rows, leaf value on data rows) as a number. */
export const readNodeValue = (node: IRowNode, column: AgColumn): number | null =>
    numericOrNull(node.getDataValue(column, 'value'));

/** The pivot result column with pivot `keys` for value field `valueField`, or `null` when not resolvable. */
export const pivotResultCol = (
    pivotResultCols: IPivotResultColsService | undefined,
    keys: string[],
    valueField: ColKey
): AgColumn | null => pivotResultCols?.lookupPivotResultCol(keys, valueField) ?? null;
