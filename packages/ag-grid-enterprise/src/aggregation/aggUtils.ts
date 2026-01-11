import type {
    AgColumn,
    BeanCollection,
    ColumnModel,
    IAggFunc,
    IAggFuncParams,
    RowNode,
    ValueService,
} from 'ag-grid-community';
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

export function getValuesNormal(
    valueSvc: ValueService,
    valueRows: RowNode[] | null,
    valueColumns: AgColumn[]
): any[][] {
    // create 2d array, of all values for all valueColumns
    const values: any[][] = [];
    valueColumns.forEach(() => values.push([]));

    const valueColumnCount = valueColumns.length;

    const nodeList = valueRows ?? [];

    const rowCount = nodeList.length;

    for (let i = 0; i < rowCount; i++) {
        const childNode = nodeList[i];
        for (let j = 0; j < valueColumnCount; j++) {
            const valueColumn = valueColumns[j];
            // if the row is a group, then it will only have an agg result value,
            // which means valueGetter is never used.
            const value = valueSvc.getValue(valueColumn, childNode, false, 'api');
            values[j].push(value);
        }
    }

    return values;
}

export function setAggData(colModel: ColumnModel, rowNode: RowNode, newAggData: any): void {
    const oldAggData = rowNode.aggData;
    rowNode.aggData = newAggData;

    // if no event service, nobody has registered for events, so no need fire event
    if (rowNode.__localEventService) {
        const eventFunc = (colId: string) => {
            const value = rowNode.aggData ? rowNode.aggData[colId] : undefined;
            const oldValue = oldAggData ? oldAggData[colId] : undefined;

            if (value === oldValue) {
                return;
            }

            // do a quick lookup - despite the event it's possible the column no longer exists
            const column = colModel.getColById(colId);
            if (!column) {
                return;
            }

            rowNode.dispatchCellChangedEvent(column, value, oldValue);
        };

        if (oldAggData) {
            for (const key of Object.keys(oldAggData)) {
                eventFunc(key); // raise for old keys
            }
        }
        if (newAggData) {
            for (const key of Object.keys(newAggData)) {
                if (!oldAggData || !(key in oldAggData)) {
                    eventFunc(key); // new key, event not yet raised
                }
            }
        }
    }
}
