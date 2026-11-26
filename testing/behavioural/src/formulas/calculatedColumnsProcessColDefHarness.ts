// Fixtures shared by the calculated-columns processColDef suites, split by topic so vitest runs them in parallel.
import { waitFor } from '@testing-library/dom';

import type {
    CalculatedColumnProcessColDefParams,
    ColDef,
    GridApi,
    GridOptions,
    GridState,
    UserColumnProperty,
} from 'ag-grid-community';

import { createGrid } from './calculatedColumnsStateHarness';

export type ProcessColDef = (params: CalculatedColumnProcessColDefParams) => ColDef | undefined;

export const ROW_DATA = [
    { id: 'r1', g: 'x', a: 10, b: 3 },
    { id: 'r2', g: 'x', a: 5, b: 2 },
];

export const columnDefs = (): GridOptions['columnDefs'] => [{ field: 'a' }, { field: 'b' }];

/** A dialog-created calc col as grid state stores it, so a grid can start with one without driving the dialog. */
export function userColumnsState(
    colId: string,
    expression: string,
    properties: UserColumnProperty[] = []
): GridState['userColumns'] {
    return [
        {
            colId,
            created: true,
            parentGroupId: null,
            properties: [{ property: 'calculatedExpression', value: expression }, ...properties],
        },
    ];
}

export function gridWithUserColumn(
    id: string,
    colId: string,
    expression: string,
    processColDef: ProcessColDef | undefined,
    opts: Partial<GridOptions> = {}
): GridApi {
    return createGrid(id, {
        rowData: ROW_DATA,
        columnDefs: columnDefs(),
        calculatedColumns: processColDef ? { processColDef } : true,
        initialState: { userColumns: userColumnsState(colId, expression) },
        ...opts,
    });
}

export async function waitForColumn(api: GridApi, colId: string): Promise<void> {
    await waitFor(() => expect(api.getColumn(colId)).not.toBeNull());
}
