import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    TextEditorModule,
    ValidationModule,
    getGridElement,
} from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

interface Row {
    sport: string;
}

const sportCell = (api: GridApi) =>
    getGridElement(api)!.querySelector<HTMLElement>('.ag-row[row-index="0"] .ag-cell[col-id="sport"]');

const sports = (api: GridApi) => {
    const values: string[] = [];
    api.forEachNode((node) => values.push(node.data.sport));
    return values;
};

describe('Cell Selection fill handle (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelApiModule,
            ClientSideRowModelModule,
            CellSelectionModule,
            RowApiModule,
            TextEditorModule,
            ValidationModule,
        ]);
    });

    afterEach(() => {
        cleanup();
    });

    const renderGrid = async () => {
        let api: GridApi<Row> | undefined;
        render(
            <AgGridReact<Row>
                rowData={[{ sport: 'tennis' }, { sport: 'golf' }, { sport: 'rowing' }]}
                columnDefs={[{ field: 'sport', editable: true }]}
                cellSelection={{ handle: { mode: 'fill' } }}
                onGridReady={(event) => {
                    api = event.api;
                }}
            />
        );
        await waitFor(() => expect(sportCell(api!)).not.toBeNull());
        act(() => api!.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['sport'] }));
        await waitFor(() => expect(sportCell(api!)!.querySelector('.ag-fill-handle')).not.toBeNull());
        return api!;
    };

    test('a redrawn row keeps the fill handle', async () => {
        const api = await renderGrid();
        const before = sportCell(api);

        act(() => api.redrawRows());

        await waitFor(() => expect(sportCell(api)).not.toBe(before));
        await waitFor(() => expect(sportCell(api)!.querySelector('.ag-fill-handle')).not.toBeNull());
    });

    test('the fill handle still fills after the cell is edited', async () => {
        const api = await renderGrid();

        act(() => api.startEditingCell({ rowIndex: 0, colKey: 'sport' }));
        await waitFor(() => expect(api.getEditingCells()).toHaveLength(1));
        act(() => api.stopEditing());
        await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));
        const handle = await waitFor(() => {
            const fillHandle = sportCell(api)!.querySelector<HTMLElement>('.ag-fill-handle');
            expect(fillHandle).not.toBeNull();
            return fillHandle!;
        });

        fireEvent.dblClick(handle);

        await waitFor(() => expect(sports(api)).toEqual(['tennis', 'tennis', 'tennis']));
    });
});
