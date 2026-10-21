import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { GridApi, IServerSideGetRowsParams } from 'ag-grid-community';
import { ModuleRegistry, RowApiModule, ScrollApiModule, ValidationModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

describe('SSRM block loading (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ServerSideRowModelApiModule,
            ServerSideRowModelModule,
            RowApiModule,
            ScrollApiModule,
            ValidationModule,
        ]);
    });

    afterEach(() => {
        cleanup();
    });

    test('a synchronous datasource set in onGridReady loads after it, and fills newly rendered rows before paint', async () => {
        const rowData = Array.from({ length: 300 }, (_, i) => ({ id: i }));
        const calls: string[] = [];
        let api: GridApi | undefined;
        render(
            <div style={{ height: 400 }}>
                <AgGridReact
                    columnDefs={[{ field: 'id' }]}
                    rowModelType="serverSide"
                    cacheBlockSize={50}
                    rowHeight={20}
                    onFirstDataRendered={() => calls.push('firstDataRendered')}
                    onGridReady={(event) => {
                        calls.push('onGridReady');
                        api = event.api;
                        event.api.setGridOption('serverSideDatasource', {
                            getRows: (params: IServerSideGetRowsParams) => {
                                const { startRow = 0, endRow = rowData.length } = params.request;
                                calls.push(`getRows ${startRow}`);
                                params.success({ rowData: rowData.slice(startRow, endRow), rowCount: rowData.length });
                            },
                        });
                    }}
                />
            </div>
        );
        await waitFor(() => expect(calls).toContain('firstDataRendered'));
        expect(calls).toEqual(['onGridReady', 'getRows 0', 'firstDataRendered']);

        api!.ensureIndexVisible(200);
        expect(api!.getDisplayedRowAtIndex(200)?.stub).toBe(true);

        // a zero-delay timeout only runs once the microtask queue is drained, the point at which the browser may paint
        await new Promise((resolve) => setTimeout(resolve));
        expect(api!.getDisplayedRowAtIndex(200)?.data).toEqual({ id: 200 });
    });
});
