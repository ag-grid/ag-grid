import { _missing } from '../agStack/utils/generic';
import { _toString } from '../agStack/utils/string';
import type { BeanCollection } from '../context/context';
import type { Column } from '../interfaces/iColumn';
import type { CellValueResolveFrom } from '../interfaces/iEditService';
import type { IRowNode } from '../interfaces/iRowNode';

export interface GetCellValueParams<TValue = any> {
    /** The row node to get the value from */
    rowNode: IRowNode;
    /** The column to get the value from */
    colKey: string | Column<TValue>;
    /** If `true` formatted value will be returned. */
    useFormatter?: boolean;
    /**
     * Specifies how to resolve the cell value when edits are pending.
     * - `'edit'` (default): Returns the current editing value, including live editor typing and pending batch values
     * - `'batch'`: Returns pending batch values but excludes live editor typing (useful for dependent calculations in valueGetters)
     * - `'data'`: Returns the actual stored data value, ignoring all edit state
     */
    from?: CellValueResolveFrom;
}

export function expireValueCache(beans: BeanCollection): void {
    beans.valueCache?.expire();
}

export function getCellValue<TValue = any>(beans: BeanCollection, params: GetCellValueParams<TValue>): any {
    const { colKey, rowNode, useFormatter, from = 'edit' } = params;

    const column = beans.colModel.getColDefCol(colKey) ?? beans.colModel.getCol(colKey);
    if (_missing(column)) {
        return null;
    }
    const result = beans.valueSvc.getValueForDisplay({
        column,
        node: rowNode,
        includeValueFormatted: useFormatter,
        from,
    });
    if (useFormatter) {
        return result.valueFormatted ?? _toString(result.value);
    }
    return result.value;
}
