import { cleanup, render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ALL_SEVERITIES, asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React, { StrictMode, useState } from 'react';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    CellApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    EventApiModule,
    ModuleRegistry,
    RowApiModule,
    RowSelectionModule,
    SELECTION_COLUMN_ID,
    enableDevValidations,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

describe('columnDefs and rowData changed in one React render', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            RowApiModule,
            CellApiModule,
            ColumnApiModule,
            EventApiModule,
        ]);
        // There is no TestGridsManager to install the layout mock the grid needs to become ready.
        mockGridLayout.init();
    });

    afterEach(() => {
        cleanup();
    });

    test('one click setting both props, in either prop order, adds a column reading the new rows and refreshes the rows once', async () => {
        const withoutNc: string[] = [];
        const apis: Record<'columnDefs first' | 'rowData first', GridApi | undefined> = {
            'columnDefs first': undefined,
            'rowData first': undefined,
        };

        const GridExample = () => {
            const [columnDefs, setColumnDefs] = useState<ColDef[]>([{ field: 'name' }]);
            const [rowData, setRowData] = useState<Record<string, any>[]>([{ id: 1, name: 'Some name' }]);

            const addColumn = () => {
                setRowData((rows) => rows.map((row) => ({ ...row, nc: { p: 'v' } })));
                setColumnDefs((columns) => [
                    ...columns,
                    {
                        colId: 'nc',
                        valueGetter: (params) => {
                            if (!params.data.nc) {
                                withoutNc.push(JSON.stringify(params.data));
                            }
                            return params.data.nc?.p;
                        },
                    },
                ]);
            };

            return (
                <>
                    <button type="button" onClick={addColumn}>
                        Add column
                    </button>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={rowData}
                        getRowId={(params) => String(params.data.id)}
                        onGridReady={(event) => (apis['columnDefs first'] = event.api)}
                    />
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        getRowId={(params) => String(params.data.id)}
                        onGridReady={(event) => (apis['rowData first'] = event.api)}
                    />
                </>
            );
        };

        const view = render(
            <StrictMode>
                <GridExample />
            </StrictMode>
        );

        await waitFor(() => expect(Object.values(apis).map((api) => api?.getDisplayedRowCount())).toEqual([1, 1]), {
            timeout: 2000,
        });
        await asyncSetTimeout(0);
        const heard: Record<string, string[]> = { 'columnDefs first': [], 'rowData first': [] };
        for (const [order, api] of Object.entries(apis)) {
            api!.addEventListener('modelUpdated', () => heard[order].push('modelUpdated'));
        }

        await userEvent.click(view.getByText('Add column'));
        await waitFor(
            () =>
                expect(Object.values(apis).map((api) => api!.getAllGridColumns().map((col) => col.getColId()))).toEqual(
                    [
                        ['name', 'nc'],
                        ['name', 'nc'],
                    ]
                ),
            { timeout: 2000 }
        );
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        const valuesOf = (api: GridApi) => {
            const values: unknown[] = [];
            api.forEachNode((rowNode) => values.push(api.getCellValue({ rowNode, colKey: 'nc' })));
            return values;
        };
        expect({
            withoutNc,
            values: Object.values(apis).map((api) => valuesOf(api!)),
            heard,
        }).toEqual({
            withoutNc: [],
            values: [['v'], ['v']],
            heard: { 'columnDefs first': ['modelUpdated'], 'rowData first': ['modelUpdated'] },
        });
    });
});

describe('selection column taking a user column id in React', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnApiModule, RowSelectionModule]);
        mockGridLayout.init();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    test('leaves every rendered cell and header cell a col-id of its own when the selection column takes its id', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
        const columnDefs: ColDef[] = [{ colId: SELECTION_COLUMN_ID, field: 'a' }, { field: 'x' }];
        const rowData = [
            { a: 'p', x: 1 },
            { a: 'q', x: 2 },
        ];
        const view = render(<AgGridReact columnDefs={columnDefs} rowData={rowData} />);
        await waitFor(() => expect(view.container.querySelectorAll('.ag-row .ag-cell')).toHaveLength(4), {
            timeout: 2000,
        });

        view.rerender(<AgGridReact columnDefs={columnDefs} rowData={rowData} rowSelection={{ mode: 'multiRow' }} />);

        const colIds = (parent: ParentNode, selector: string): string[] =>
            Array.from(parent.querySelectorAll(selector), (el) => el.getAttribute('col-id')!);
        const userId = `${SELECTION_COLUMN_ID}_1`;
        await waitFor(
            () => {
                expect(colIds(view.container, '.ag-header-cell[col-id]')).toContain(userId);
                const rows = Array.from(view.container.querySelectorAll('.ag-row'));
                expect(rows).toHaveLength(2);
                for (const row of rows) {
                    const ids = colIds(row, '.ag-cell[col-id]');
                    expect(ids).toContain(SELECTION_COLUMN_ID);
                    expect(ids).toContain(userId);
                }
            },
            { timeout: 2000 }
        );
        for (const row of Array.from(view.container.querySelectorAll('.ag-row'))) {
            const ids = colIds(row, '.ag-cell[col-id]');
            expect(ids).toEqual([...new Set(ids)]);
        }
        const headerIds = colIds(view.container, '.ag-header-cell[col-id]');
        expect(headerIds).toEqual([...new Set(headerIds)]);
        expect(headerIds).toContain(SELECTION_COLUMN_ID);
        expect(headerIds).toContain(userId);
        expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
    });
});
