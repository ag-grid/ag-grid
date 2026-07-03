import type { ColDef, GridApi } from 'ag-grid-community';

export interface AddCalculatedColumnOperation {
    operation: 'addCalculatedColumn';
    colId: string;
    headerName: string;
    calculatedExpression: string;
    cellDataType?: string;
    aggFunc?: string;
    width?: number;
    hide?: boolean;
}

export type ColumnDefOperation = AddCalculatedColumnOperation;

// `getStructuredSchema()` only describes Grid State, but adding a column is a column-definition
// change rather than a state change. We apply those operations ourselves before `setState()`.
export function applyColumnDefOperations(gridApi: GridApi, operations: ColumnDefOperation[] | undefined): void {
    if (!operations?.length) {
        return;
    }

    const newColumns: ColDef[] = [];
    for (let i = 0, len = operations.length; i < len; ++i) {
        const operation = operations[i];
        if (operation.operation !== 'addCalculatedColumn') {
            continue;
        }
        const { colId, headerName, calculatedExpression, cellDataType, aggFunc, width, hide } = operation;
        const colDef: ColDef = { colId, headerName, calculatedExpression };
        if (cellDataType !== undefined) {
            colDef.cellDataType = cellDataType;
        }
        if (aggFunc !== undefined) {
            colDef.aggFunc = aggFunc;
        }
        if (width !== undefined) {
            colDef.width = width;
        }
        if (hide !== undefined) {
            colDef.hide = hide;
        }
        newColumns.push(colDef);
    }

    if (newColumns.length) {
        const colDefs = gridApi.getColumnDefs() ?? [];
        gridApi.setGridOption('columnDefs', [...colDefs, ...newColumns]);
    }
}
