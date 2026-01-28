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

export function aggregateRowNodeUsingValuesAndPivot(
    beans: BeanCollection,
    rowNode: RowNode,
    children?: RowNode[] | null
): any {
    const result: any = {};

    const secondaryColumns = beans.pivotResultCols?.getPivotResultCols()?.list ?? [];
    let canSkipTotalColumns = true;
    for (let i = 0; i < secondaryColumns.length; i++) {
        const secondaryCol = secondaryColumns[i];
        const colDef = secondaryCol.getColDef();

        if (colDef.pivotTotalColumnIds != null) {
            canSkipTotalColumns = false;
            continue;
        }

        const keys: string[] = colDef.pivotKeys ?? [];
        let values: any[];

        if (rowNode.leafGroup) {
            // lowest level group, get the values from the mapped set
            values = getValuesFromMappedSet(beans, rowNode.childrenMapped, keys, colDef.pivotValueColumn as AgColumn);
        } else {
            // value columns and pivot columns, non-leaf group
            values = (children ?? rowNode.childrenAfterFilter!).map((childNode) => childNode.aggData[colDef.colId!]);
        }

        // bit of a memory drain storing null/undefined, but seems to speed up performance.
        result[colDef.colId!] = _aggregateValues(
            beans,
            values,
            colDef.pivotValueColumn!.getAggFunc()!,
            colDef.pivotValueColumn as AgColumn,
            rowNode,
            secondaryCol
        );
    }

    if (!canSkipTotalColumns) {
        for (let i = 0; i < secondaryColumns.length; i++) {
            const secondaryCol = secondaryColumns[i];
            const colDef = secondaryCol.getColDef();

            if (!colDef.pivotTotalColumnIds?.length) {
                continue;
            }

            const aggResults: any[] = colDef.pivotTotalColumnIds.map((currentColId: string) => result[currentColId]);
            // bit of a memory drain storing null/undefined, but seems to speed up performance.
            result[colDef.colId!] = _aggregateValues(
                beans,
                aggResults,
                colDef.pivotValueColumn!.getAggFunc()!,
                colDef.pivotValueColumn as AgColumn,
                rowNode,
                secondaryCol
            );
        }
    }

    return result;
}

function getValuesFromMappedSet(
    { valueSvc }: BeanCollection,
    mappedSet: any,
    keys: string[],
    valueColumn: AgColumn
): any[] {
    let mapPointer = mappedSet;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        mapPointer = mapPointer ? mapPointer[key] : null;
    }

    if (!mapPointer) {
        return [];
    }

    return mapPointer.map((rowNode: RowNode) => valueSvc.getValue(valueColumn, rowNode, false, 'api'));
}
