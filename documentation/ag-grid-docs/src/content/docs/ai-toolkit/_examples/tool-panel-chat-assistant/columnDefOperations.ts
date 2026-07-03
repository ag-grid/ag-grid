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
        // Everything except the `operation` discriminator is a column-definition field; drop unset values.
        const colDef = Object.fromEntries(
            Object.entries(operation).filter(([key, value]) => key !== 'operation' && value !== undefined)
        ) as ColDef;
        newColumns.push(colDef);
    }

    if (newColumns.length) {
        const colDefs = gridApi.getColumnDefs() ?? [];
        gridApi.setGridOption('columnDefs', [...colDefs, ...newColumns]);
    }
}
