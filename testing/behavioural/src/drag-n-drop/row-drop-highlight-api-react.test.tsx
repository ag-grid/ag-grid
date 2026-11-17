import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    RowDragModule,
    getGridElement,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import type { AgGridReactProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';

const renderGrid = async <TData,>(props: AgGridReactProps<TData>): Promise<GridApi<TData>> => {
    let api: GridApi<TData> | undefined;
    render(
        <React.StrictMode>
            <AgGridReact<TData> {...props} onGridReady={(params) => (api = params.api)} />
        </React.StrictMode>
    );
    await waitFor(() => expect(api).toBeDefined());
    return api!;
};

describe('row drop indicator (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowApiModule, RowDragModule, RowGroupingModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('a row drawn again keeps the highlight it holds', async () => {
        const api = await renderGrid({
            columnDefs: [{ field: 'a' }],
            rowData: [
                { id: '1', a: 'A' },
                { id: '2', a: 'B' },
            ],
            getRowId: (params) => params.data.id,
        });
        const highlighted = () => getGridElement(api)!.querySelector('.ag-row-highlight-above')?.getAttribute('row-id');

        act(() => api.setRowDropPositionIndicator({ row: api.getRowNode('2')!, dropIndicatorPosition: 'above' }));
        await waitFor(() => expect(highlighted()).toBe('2'));

        const rowElement = () => getGridElement(api)!.querySelector('.ag-row[row-id="2"]');
        const drawn = rowElement();
        act(() => api.redrawRows({ rowNodes: [api.getRowNode('2')!] }));
        await waitFor(() => expect(rowElement()).not.toBe(drawn));
        expect(highlighted()).toBe('2');
    });

    test('an embedded group row marks its own label in the section showing its group only, for the indicator to start from', async () => {
        for (const [enableRtl, labelSection] of [
            [false, 'ag-grid-pinned-left-cells'],
            [true, 'ag-grid-scrolling-cells'],
        ] as const) {
            const api = await renderGrid({
                enableRtl,
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', rowGroup: true, hide: true },
                    { field: 'athlete', pinned: 'left' },
                    { field: 'year' },
                ],
                rowData: [{ country: 'Ireland', sport: 'Sailing', athlete: 'John Von Neumann', year: '2000' }],
                groupDisplayType: 'groupRows',
                embedFullWidthRows: true,
                groupDefaultExpanded: -1,
            });
            const ownLabels = () =>
                Array.from(
                    getGridElement(api)!.querySelectorAll(
                        '.ag-row[row-index="1"] .ag-group-cell-all-levels > .ag-group-value'
                    )
                ).map((label) => [label.closest('[class*="-cells"]')!.classList[0], label.textContent]);

            await waitFor(() => expect(ownLabels()).toEqual([[labelSection, 'Sailing']]));
        }
    });
});
