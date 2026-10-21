import { cleanup, render, waitFor } from '@testing-library/react';
import React, { useLayoutEffect } from 'react';

import type { GridApi, ICellRendererParams, IServerSideGetRowsParams } from 'ag-grid-community';
import { ModuleRegistry, RowApiModule, ValidationModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

/**
 * React coverage for RowCtrl skipping a batched fade-in once the row is destroyed. React renders rows through
 * `reactUi/rows/rowComp.tsx`, so the vanilla soft-refresh animation tests do not prove the fade-out holds there.
 */
describe('SSRM soft refresh row animation (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ServerSideRowModelApiModule,
            ServerSideRowModelModule,
            RowApiModule,
            ValidationModule,
        ]);
    });

    afterEach(() => {
        cleanup();
    });

    test('a row deleted straight after the first render fades out', async () => {
        const allRows = Array.from({ length: 20 }, (_, i) => ({ id: `r${String(i).padStart(2, '0')}`, value: i }));
        let rows = allRows;
        let api: GridApi | undefined;
        // refresh as soon as the rows commit, before the batched fade-in of the first render has run
        const RefreshOnMount = (props: ICellRendererParams) => {
            useLayoutEffect(() => {
                if (props.data.id === 'r03' && rows === allRows) {
                    rows = allRows.filter((row) => row.id !== 'r03');
                    props.api.refreshServerSide({ purge: false });
                }
            }, []);
            return <span>{props.value}</span>;
        };
        render(
            <AgGridReact
                columnDefs={[{ field: 'id', cellRenderer: RefreshOnMount }, { field: 'value' }]}
                rowModelType="serverSide"
                getRowId={(params) => params.data.id}
                animateRows
                rowHeight={24}
                cacheBlockSize={100}
                onGridReady={(event) => (api = event.api)}
                serverSideDatasource={{
                    getRows: (params: IServerSideGetRowsParams) => {
                        const { startRow = 0, endRow = rows.length } = params.request;
                        params.success({ rowData: rows.slice(startRow, endRow), rowCount: rows.length });
                    },
                }}
            />
        );
        await waitFor(() => expect(api?.getDisplayedRowCount()).toBe(19));
        const faded = [...document.querySelectorAll('[row-id].ag-opacity-zero')].map((el) => el.getAttribute('row-id'));
        expect(faded).toEqual(['r03']);
    });
});
