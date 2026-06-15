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

/** Numeric coercion preserving `bigint`; `null` for non-numeric. For value-preserving modes (difference,
 *  running total) and `valueOf`, where percentages would otherwise lose `bigint` precision. */
export const exactOrNull = (value: unknown): number | bigint | null =>
    typeof value === 'bigint' ? value : numericOrNull(value);

/** Reads a node's aggregated value for a column, unwrapping avg/count wrappers to a number. */
export const readAggScalar = (node: IRowNode, column: AgColumn): number | null => {
    const aggData = node.aggData;
    return aggData ? numericOrNull(aggData[column.colId]) : null;
};

/** Reads a node's value (aggregate on group rows, leaf value on data rows) as a number. */
export const readNodeValue = (node: IRowNode, column: AgColumn): number | null =>
    numericOrNull(node.getDataValue(column, 'value'));

/** As {@link readNodeValue} but preserving `bigint` (for value-preserving modes / `valueOf`). */
export const readNodeExact = (node: IRowNode, column: AgColumn): number | bigint | null =>
    exactOrNull(node.getDataValue(column, 'value'));

/** Decodes the adjacent-item sentinels to a step — `(previous)` → -1, `(next)` → +1 — or `null` for an
 *  explicit item. Shared by the base-item readers (sibling, pivot, row). */
export const adjacentStep = (baseItem: string | number): -1 | 1 | null => {
    if (baseItem === '(previous)') {
        return -1;
    }
    if (baseItem === '(next)') {
        return 1;
    }
    return null;
};

/** The child of `siblings` whose group `key` matches `key`, or `undefined`. */
export const childByKey = (
    siblings: IRowNode[] | null | undefined,
    key: string | null | undefined
): IRowNode | undefined => {
    if (siblings && key != null) {
        for (let i = 0, len = siblings.length; i < len; ++i) {
            if (siblings[i].key === key) {
                return siblings[i];
            }
        }
    }
    return undefined;
};

/** The group `key` of the sibling `step` positions from `node` within `siblings`, or `null` past either end. */
export const adjacentSiblingKey = (siblings: IRowNode[], node: IRowNode, step: number): string | null => {
    const index = siblings.indexOf(node);
    const target = index + step;
    return index >= 0 && target >= 0 && target < siblings.length ? siblings[target].key : null;
};

/** The pivot result column with pivot `keys` for value field `valueField`, or `null` when not resolvable. */
export const pivotResultCol = (
    pivotResultCols: IPivotResultColsService | undefined,
    keys: string[],
    valueField: ColKey
): AgColumn | null => pivotResultCols?.lookupPivotResultCol(keys, valueField) ?? null;
