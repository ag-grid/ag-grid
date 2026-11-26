import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React from 'react';

import type { GridApi, GridReadyEvent } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

interface IRow {
    company: string;
    website: string;
}

const ROW_DATA: IRow[] = [
    { company: 'A', website: 'x' },
    { company: 'B', website: 'y' },
];

const GroupCountRenderer = (params: { api: GridApi; value: string }) => (
    <span className="group-count-renderer">{`${params.api.getRowGroupColumns().length}:${params.value}`}</span>
);

const rendererTexts = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('.group-count-renderer')).map((el) => el.textContent);

describe('React: group cell renderer is re-evaluated when row groups change', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule]);
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    test('cellRendererSelector on the grouped column feeds the group inner renderer', async () => {
        let api!: GridApi<IRow>;
        const { container } = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact<IRow>
                    rowData={ROW_DATA}
                    columnDefs={[
                        {
                            field: 'company',
                            rowGroup: true,
                            hide: true,
                            cellRendererSelector: (params) =>
                                params.node?.group ? { component: GroupCountRenderer } : undefined,
                        },
                        { field: 'website', enableRowGroup: true },
                    ]}
                    groupDefaultExpanded={1}
                    getRowId={({ data }) => data.company}
                    onGridReady={(event: GridReadyEvent<IRow>) => {
                        api = event.api;
                    }}
                />
            </div>
        );
        await waitFor(() => expect(rendererTexts(container)).toEqual(['1:A', '1:B']));

        await act(async () => {
            api.addRowGroupColumns(['website']);
        });
        await waitFor(() => expect(rendererTexts(container).slice(0, 2)).toEqual(['2:A', '2:B']));
    });
});

interface ISportRow {
    id: string;
    country: string;
    sport: string;
}

const SPORT_ROWS: ISportRow[] = [
    { id: 'r1', country: 'UK', sport: 'Rowing' },
    { id: 'r2', country: 'UK', sport: 'Golf' },
    { id: 'r3', country: 'FR', sport: 'Rowing' },
];

describe('React: showOpenedGroup shows the new opened group when the row group columns change', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule]);
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    test('leaf rows show their new opened group after the row group columns change (setRowGroupColumns)', async () => {
        let api!: GridApi<ISportRow>;
        const { container } = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact<ISportRow>
                    rowData={SPORT_ROWS}
                    columnDefs={[
                        { field: 'country', rowGroup: true, enableRowGroup: true },
                        { field: 'sport', enableRowGroup: true },
                    ]}
                    showOpenedGroup={true}
                    groupDefaultExpanded={-1}
                    getRowId={(params) => params.data.id}
                    onGridReady={(event: GridReadyEvent<ISportRow>) => {
                        api = event.api;
                    }}
                />
            </div>
        );
        const leafAutoColumnTexts = () =>
            Object.fromEntries(
                ['r1', 'r2', 'r3'].map((id) => [
                    id,
                    container.querySelector(`[row-id="${id}"] [col-id="ag-Grid-AutoColumn"]`)?.textContent?.trim(),
                ])
            );
        await waitFor(() => expect(leafAutoColumnTexts()).toEqual({ r1: 'UK', r2: 'UK', r3: 'FR' }));

        await act(async () => {
            api.setRowGroupColumns(['sport']);
        });
        await waitFor(() => expect(leafAutoColumnTexts()).toEqual({ r1: 'Rowing', r2: 'Golf', r3: 'Rowing' }));
    });
});
