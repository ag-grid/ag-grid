import { _toString } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import { _resolvePivotColumnForRow } from '../entities/agColumn';
import type { Column } from '../interfaces/iColumn';
import type { CellValueResolveFrom } from '../interfaces/iEditService';
import type { IRowNode } from '../interfaces/iRowNode';

export interface GetCellValueParams<TValue = any> {
    /** The row to read from */
    rowNode: IRowNode;
    /** The column to read (field name, `colId`, or `Column` object) */
    colKey: string | Column<TValue>;
    /** If `true`, returns the formatted string (via the column's `valueFormatter`) instead of the raw value. */
    useFormatter?: boolean;
    /**
     * Controls which base value is returned.
     * - `'edit'` (default): Live editor value if the cell is being edited, then any pending batch value, then committed data.
     * - `'batch'`: Pending batch values but excluding live editor typing.
     * - `'data'`: Committed data only, ignoring all edit state.
     */
    from?: CellValueResolveFrom;
    /**
     * If `true`, applies the Show Values As transform (e.g. a percentage of a total) on top of the `from` base.
     * Columns without an active mode return the base value unchanged.
     */
    transformValues?: boolean;
}

export function expireValueCache(beans: BeanCollection): void {
    beans.valueCache?.expire();
}

export function getCellValue<TValue = any>(beans: BeanCollection, params: GetCellValueParams<TValue>): any {
    const { colKey, rowNode, useFormatter, from = 'edit', transformValues } = params;

    const column = beans.colModel.getCol(colKey);
    if (!column) {
        return null;
    }
    // API accepts an arbitrary node, so a pivot result column may be read on a leaf — redirect to the
    // underlying value column (display/selection paths never hit this, see ValueService.getValue).
    const result = beans.valueSvc.getValueForDisplay({
        column: _resolvePivotColumnForRow(column, rowNode),
        node: rowNode,
        includeValueFormatted: useFormatter,
        from,
        transformValues,
    });
    if (useFormatter) {
        return result.valueFormatted ?? _toString(result.value);
    }
    return result.value;
}
