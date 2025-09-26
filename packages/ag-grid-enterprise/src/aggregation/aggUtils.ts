import type { AgColumn, BeanCollection, IAggFunc, IAggFuncParams, RowNode } from 'ag-grid-community';
import { _addGridCommonParams, _warn } from 'ag-grid-community';

export function _aggregateValues(
    beans: BeanCollection,
    values: any[],
    aggFuncOrString: string | IAggFunc,
    column: AgColumn,
    rowNode?: RowNode,
    pivotResultColumn?: AgColumn
): any {
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
    });

    return aggFunc(params);
}
