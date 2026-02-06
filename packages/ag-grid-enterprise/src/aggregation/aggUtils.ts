import type { AgColumn, BeanCollection, IAggFunc, IAggFuncParams, RowNode } from 'ag-grid-community';
import { _addGridCommonParams, _warn } from 'ag-grid-community';

interface AggregateValuesParams {
    beans: BeanCollection;
    values: any[];
    aggFuncOrString: string | IAggFunc;
    column: AgColumn;
    /** The row node being aggregated. Required for CSRM aggregation, undefined for integrated charts. */
    rowNode: RowNode | undefined;
    /** The pivot result column when aggregating pivot data. */
    pivotResultColumn: AgColumn | undefined;
    /** The children nodes contributing to this aggregation. Required for CSRM aggregation, empty array for integrated charts. */
    aggregatedChildren: RowNode[];
}

export function _aggregateValues({
    beans,
    values,
    aggFuncOrString,
    column,
    rowNode,
    pivotResultColumn,
    aggregatedChildren,
}: AggregateValuesParams): any {
    const aggFunc =
        typeof aggFuncOrString === 'string' ? beans.aggFuncSvc!.getAggFunc(aggFuncOrString) : aggFuncOrString;

    if (typeof aggFunc !== 'function') {
        _warn(109, { inputValue: aggFuncOrString.toString(), allSuggestions: beans.aggFuncSvc!.getFuncNames(column) });
        return null;
    }

    const params: IAggFuncParams = _addGridCommonParams(beans.gos, {
        values,
        column,
        colDef: column.colDef,
        pivotResultColumn,
        rowNode: rowNode!, // this is typed incorrectly. Within CSRM, this will always be defined. When called from integrated charts, this will never be defined.
        data: rowNode?.data,
        aggregatedChildren,
    });

    return aggFunc(params);
}
