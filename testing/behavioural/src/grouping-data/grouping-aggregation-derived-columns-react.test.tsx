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

/** Derives from the aggregate rather than being aggregated, so no aggData entry carries it. */
const COLUMN_DEFS: ColDef<IRow>[] = [
    { field: 'country', enableRowGroup: true },
    { field: 'year', filter: 'agNumberColumnFilter' },
    { field: 'gold', enableValue: true },
    { colId: 'double', valueGetter: 'getValue("gold") * 2' },
];

function cellValues(container: HTMLElement, colId: string): string[] {
    return Array.from(container.querySelectorAll(`[col-id="${colId}"][role="gridcell"]`)).map(
        (cell) => cell.textContent ?? ''
    );
}

describe('React: columns derived from aggregates', () => {
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

    function renderGrid(onGridReady: (event: GridReadyEvent<IRow>) => void) {
        return render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact<IRow>
                    rowData={ROW_DATA}
                    columnDefs={COLUMN_DEFS}
                    getRowId={({ data }) => `${data.country}-${data.year}`}
                    onGridReady={onGridReady}
                />
            </div>
        );
    }

    const groupAndAggregate = (event: GridReadyEvent<IRow>) =>
        event.api.applyColumnState({
            state: [
                { colId: 'country', rowGroup: true, hide: true },
                { colId: 'gold', aggFunc: 'sum' },
            ],
        });

    test('the derived column follows the aggregate when the filter is applied in a later task', async () => {
        let gridApi: GridApi<IRow> | undefined;
        const rendered = renderGrid((event) => {
            gridApi = event.api;
            groupAndAggregate(event);
        });

        await waitFor(() => expect(cellValues(rendered.container, 'gold')).toEqual(['70', '35']));
        expect(cellValues(rendered.container, 'double')).toEqual(['140', '70']);

        act(() => {
            gridApi!.setFilterModel({
                year: { filterType: 'number', type: 'greaterThan', filter: 2008 },
            });
        });

        await waitFor(() => expect(cellValues(rendered.container, 'gold')).toEqual(['40', '20']));
        expect(cellValues(rendered.container, 'double')).toEqual(['80', '40']);
    });

    test('the derived column follows the aggregate when the filter is applied in the same task', async () => {
        const rendered = renderGrid((event) => {
            groupAndAggregate(event);
            event.api.setFilterModel({
                year: { filterType: 'number', type: 'greaterThan', filter: 2008 },
            });
        });

        await waitFor(() => expect(cellValues(rendered.container, 'gold')).toEqual(['40', '20']));
        expect(cellValues(rendered.container, 'double')).toEqual(['80', '40']);
    });
});
