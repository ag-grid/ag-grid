import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, RowApiModule, TextFilterModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

interface Person {
    athlete: string;
    age: number;
}

describe('Floating Filters (React)', () => {
    afterEach(() => cleanup());

    test('a floating filter turned on by new column definitions appears', async () => {
        let api: GridApi<Person> | undefined;
        const { container } = render(
            <React.StrictMode>
                <AgGridReact<Person>
                    columnDefs={[
                        { field: 'athlete', filter: 'agTextColumnFilter', floatingFilter: true },
                        { field: 'age', filter: 'agNumberColumnFilter' },
                    ]}
                    rowData={[{ athlete: 'Ian Thorpe', age: 17 }]}
                    modules={[ClientSideRowModelModule, RowApiModule, TextFilterModule, NumberFilterModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        );
        const floatingInput = (colId: string) =>
            container.querySelector<HTMLInputElement>(`.ag-floating-filter[col-id="${colId}"] input`);
        await waitFor(() => expect(floatingInput('athlete')).not.toBeNull());
        expect(floatingInput('age')).toBeNull();

        act(() =>
            api!.setGridOption('columnDefs', [
                { field: 'athlete', filter: 'agTextColumnFilter', floatingFilter: true },
                { field: 'age', filter: 'agNumberColumnFilter', floatingFilter: true },
            ])
        );
        await waitFor(() => expect(floatingInput('age')).not.toBeNull());
    });

    test('a floating filter turned off and on again shows the model set while it was off', async () => {
        let api: GridApi<Person> | undefined;
        const withFloating = (floatingFilter: boolean): ColDef<Person>[] => [
            { field: 'athlete', filter: 'agTextColumnFilter', floatingFilter },
            { field: 'age', filter: 'agNumberColumnFilter' },
        ];
        const { container } = render(
            <React.StrictMode>
                <AgGridReact<Person>
                    columnDefs={withFloating(true)}
                    rowData={[{ athlete: 'Ian Thorpe', age: 17 }]}
                    modules={[ClientSideRowModelModule, RowApiModule, TextFilterModule, NumberFilterModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        );
        const floatingInput = () =>
            container.querySelector<HTMLInputElement>('.ag-floating-filter[col-id="athlete"] input');
        await waitFor(() => expect(floatingInput()).not.toBeNull());

        act(() => api!.setGridOption('columnDefs', withFloating(false)));
        await waitFor(() => expect(floatingInput()).toBeNull());
        await act(() =>
            api!.setColumnFilterModel('athlete', { filterType: 'text', type: 'contains', filter: 'Thorpe' })
        );
        act(() => api!.setGridOption('columnDefs', withFloating(true)));
        await waitFor(() => expect(floatingInput()?.value).toBe('Thorpe'));
    });

    test('a floating filter shows a model set before rows load at once, in the type the model states', async () => {
        let api: GridApi<Person> | undefined;
        const { container } = render(
            <React.StrictMode>
                <AgGridReact<Person>
                    columnDefs={[
                        { field: 'athlete', filter: 'agTextColumnFilter', floatingFilter: true },
                        { field: 'age', filter: true, floatingFilter: true },
                    ]}
                    rowData={[]}
                    modules={[ClientSideRowModelModule, RowApiModule, TextFilterModule, NumberFilterModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        );
        const floatingInput = (colId: string) =>
            container.querySelector<HTMLInputElement>(`.ag-floating-filter[col-id="${colId}"] input`)?.value;
        await waitFor(() => expect(floatingInput('age')).toBe(''));

        act(() =>
            api!.setFilterModel({
                athlete: { filterType: 'text', type: 'contains', filter: 'Thorpe' },
                age: { filterType: 'number', type: 'lessThan', filter: 20 },
            })
        );
        await waitFor(() => expect(floatingInput('athlete')).toBe('Thorpe'));
        await waitFor(() => expect(floatingInput('age')).toBe('20'));
        expect(api!.getDisplayedRowCount()).toBe(0);

        act(() =>
            api!.setGridOption('rowData', [
                { athlete: 'Ian Thorpe', age: 17 },
                { athlete: 'Grant Thorpe', age: 30 },
            ])
        );
        await waitFor(() => expect(api!.getDisplayedRowCount()).toBe(1));
        expect(floatingInput('age')).toBe('20');
        expect(floatingInput('athlete')).toBe('Thorpe');
    });
});
