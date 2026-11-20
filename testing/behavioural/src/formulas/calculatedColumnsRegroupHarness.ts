// Shared setup for the calculated-columns-regroup-ordering-* suites, split so vitest runs them in parallel.
import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, nextAnimationFrame } from 'ag-test-utils';

import type { ColDef, ColGroupDef, GridApi, GridOptions, Module } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    ColumnMenuModule,
    ContextMenuModule,
    FormulaModule,
    PivotModule,
    RowGroupingModule,
    RowNumbersModule,
} from 'ag-grid-enterprise';

import { addViaDialog, order } from './calculatedColumnsStateHarness';

export const gridsManager = new TestGridsManager({
    modules: [
        ClientSideRowModelModule,
        GridStateModule,
        CalculatedColumnsModule,
        FormulaModule,
        ColumnMenuModule,
        ContextMenuModule,
        PivotModule,
        RowGroupingModule,
        RowNumbersModule,
        TextEditorModule,
        NumberEditorModule,
        ValidationModule,
    ] as Module[],
});

export function createGrid(id: string, opts: Partial<GridOptions>): GridApi {
    return gridsManager.createGrid(id, {
        getRowId: (params) => params.data?.id,
        calculatedColumns: true,
        ...opts,
    });
}

export const regionAuto = 'ag-Grid-AutoColumn-region';
export const countryAuto = 'ag-Grid-AutoColumn-country';

/** Two columns added from the region auto group column, with `multipleColumns` row grouping. */
export async function createRegroupGrid(
    id: string,
    maintainColumnOrder: boolean,
    columnDefs: (ColDef | ColGroupDef)[]
) {
    const api = createGrid(id, {
        groupDisplayType: 'multipleColumns',
        maintainColumnOrder,
        rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
        columnDefs,
    });
    await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
    const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
    const x2 = await addViaDialog(api, x1, '[Revenue] - [Cost]');
    const expected = [regionAuto, x1, x2, countryAuto, 'region', 'country', 'revenue', 'cost'];
    expect({ maintainColumnOrder, order: order(api) }).toEqual({ maintainColumnOrder, order: expected });
    return { api, x1, x2, expected };
}

export const LEAF_DEFS: ColDef[] = [
    { field: 'region', rowGroup: true, hide: true },
    { field: 'country', rowGroup: true, hide: true },
    { field: 'revenue', headerName: 'Revenue', aggFunc: 'sum' },
    { field: 'cost', headerName: 'Cost', aggFunc: 'sum' },
];

// A reaction to the auto group columns changing may land on a frame or a later task.
export async function settle(): Promise<void> {
    await nextAnimationFrame();
    await asyncSetTimeout(0);
}

export async function regroup(api: GridApi): Promise<void> {
    api.setRowGroupColumns([]);
    await waitFor(() => expect(order(api).some((id) => id.startsWith('ag-Grid-AutoColumn'))).toBe(false));
    await settle();
    api.setRowGroupColumns(['region', 'country']);
    await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
    await settle();
}
