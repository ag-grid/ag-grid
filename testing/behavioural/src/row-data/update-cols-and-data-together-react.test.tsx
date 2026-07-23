import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColDef, GridApi } from 'ag-grid-community';
import { CellApiModule, ClientSideRowModelModule, ModuleRegistry, RowApiModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { asyncSetTimeout, ignoreConsoleLicenseKeyError } from '../test-utils';

/**
 * Updating columnDefs and rowData via props on the same React render must never evaluate a column's
 * value getter against row data from the other, not-yet-applied prop (AG-14611). The getters here
 * dereference nested data without guards, so any mixed-state evaluation throws.
 */
describe('React: columnDefs + rowData updated on the same render', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowApiModule, CellApiModule]);
        ignoreConsoleLicenseKeyError();
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    test('new column value getter only ever sees the new row data', async () => {
        // records the colId and which of {a,b} the row data carried when the getter ran
        const getterCalls: string[] = [];
        const makeGetter =
            (colId: 'a' | 'b') =>
            ({ data }: { data: any }) => {
                const shape = ['a', 'b'].filter((k) => data?.[k] !== undefined).join('+') || 'empty';
                getterCalls.push(`${colId}[${shape}]`);
                return data?.[colId]?.value ?? null;
            };

        const columnDefs1: ColDef[] = [{ colId: 'a', valueGetter: makeGetter('a') }];
        const rowData1 = [{ a: { value: 1 } }, { a: { value: 2 } }];

        const columnDefs2: ColDef[] = [
            { colId: 'a', valueGetter: makeGetter('a') },
            { colId: 'b', valueGetter: makeGetter('b') },
        ];
        const rowData2 = [
            { a: { value: 10 }, b: { value: 100 } },
            { a: { value: 20 }, b: { value: 200 } },
        ];

        let gridApi: GridApi | undefined;
        const ui = (columnDefs: ColDef[], rowData: any[]) => (
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    onGridReady={(p) => {
                        gridApi = p.api;
                    }}
                />
            </div>
        );

        const rendered = render(ui(columnDefs1, rowData1));
        await waitFor(() => expect(rendered.container.querySelectorAll('[row-id]').length).toBeGreaterThan(0));
        getterCalls.length = 0; // only observe the combined update

        // update both props on the same render
        await act(async () => {
            rendered.rerender(ui(columnDefs2, rowData2));
            await asyncSetTimeout(10);
        });

        const bValues = gridApi!
            .getRenderedNodes()
            .map((node) => gridApi!.getCellValue({ rowNode: node, colKey: 'b' }));
        expect(bValues).toEqual([100, 200]);

        // no getter may observe the mixed state: column b evaluated against rows without b
        const mixedStateCalls = getterCalls.filter((call) => !call.endsWith('[a+b]'));
        expect(mixedStateCalls).toEqual([]);
    });
});
