import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React from 'react';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    NumberFilterModule,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

interface IRow {
    country: string;
    year: number;
    gold: number;
}

// SUM(gold): USA = 70, GBR = 35   |   SUM(gold) with year > 2008: USA = 40, GBR = 20
const ROW_DATA: IRow[] = [
    { country: 'USA', year: 2004, gold: 10 },
    { country: 'USA', year: 2008, gold: 20 },
    { country: 'USA', year: 2012, gold: 40 },
    { country: 'GBR', year: 2004, gold: 5 },
    { country: 'GBR', year: 2008, gold: 10 },
    { country: 'GBR', year: 2012, gold: 20 },
];

const COLUMN_DEFS: ColDef<IRow>[] = [
    { field: 'country', enableRowGroup: true },
    { field: 'year', filter: 'agNumberColumnFilter' },
    { field: 'gold', enableValue: true },
];

function goldCellValues(container: HTMLElement): string[] {
    return Array.from(container.querySelectorAll('[col-id="gold"][role="gridcell"]')).map(
        (cell) => cell.textContent ?? ''
    );
}

describe('React aggregation refresh when filtering in the same task as grouping', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            ClientSideRowModelApiModule,
            RowGroupingModule,
            NumberFilterModule,
            ColumnApiModule,
        ]);
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    function renderGrid(onGridReady: (event: GridReadyEvent<IRow>) => void, rowData = ROW_DATA) {
        return render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact<IRow>
                    rowData={rowData}
                    columnDefs={COLUMN_DEFS}
                    getRowId={({ data }) => `${data.country}-${data.year}`}
                    onGridReady={onGridReady}
                />
            </div>
        );
    }

    test('group rows show the filtered aggregate when the filter is applied in the same task', async () => {
        const rendered = renderGrid((event) => {
            event.api.applyColumnState({
                state: [
                    { colId: 'country', rowGroup: true, hide: true },
                    { colId: 'gold', aggFunc: 'sum' },
                ],
            });
            event.api.setFilterModel({
                year: { filterType: 'number', type: 'greaterThan', filter: 2008 },
            });
        });

        await waitFor(() => expect(goldCellValues(rendered.container)).toEqual(['40', '20']));
    });

    test('group rows show the updated aggregate when row data changes in the same task', async () => {
        const rowData = ROW_DATA.map((row) => ({ ...row }));
        const updated = { ...rowData[0], gold: 110 };

        const rendered = renderGrid((event) => {
            event.api.applyColumnState({
                state: [
                    { colId: 'country', rowGroup: true, hide: true },
                    { colId: 'gold', aggFunc: 'sum' },
                ],
            });
            event.api.applyTransaction({ update: [updated] });
        }, rowData);

        await waitFor(() => expect(goldCellValues(rendered.container)).toEqual(['170', '35']));
    });

    test('group rows show the filtered aggregate when the filter is applied in a later task', async () => {
        let gridApi: GridApi<IRow> | undefined;
        const rendered = renderGrid((event) => {
            gridApi = event.api;
            event.api.applyColumnState({
                state: [
                    { colId: 'country', rowGroup: true, hide: true },
                    { colId: 'gold', aggFunc: 'sum' },
                ],
            });
        });

        await waitFor(() => expect(goldCellValues(rendered.container)).toEqual(['70', '35']));

        act(() => {
            gridApi!.setFilterModel({
                year: { filterType: 'number', type: 'greaterThan', filter: 2008 },
            });
        });

        await waitFor(() => expect(goldCellValues(rendered.container)).toEqual(['40', '20']));
    });
});
