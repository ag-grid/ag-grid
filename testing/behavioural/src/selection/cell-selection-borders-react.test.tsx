import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ModuleRegistry, getGridElement } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

const rangeBorders = (api: GridApi, colIds: string[]): string[] =>
    colIds.map((colId) => {
        const cell = getGridElement(api)!.querySelector(`.ag-row[row-index="0"] .ag-cell[col-id="${colId}"]`);
        const sides = ['left', 'right'].filter((side) => cell?.classList.contains(`ag-cell-range-${side}`));
        return `${colId}:${sides.join(',')}`;
    });

describe('cell selection borders (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnApiModule, CellSelectionModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('opening a group that shows a column inside a range splits its borders', async () => {
        let api: GridApi | undefined;
        render(
            <AgGridReact
                columnDefs={[
                    { colId: 'a' },
                    {
                        groupId: 'g',
                        children: [{ colId: 'b' }, { colId: 'x', columnGroupShow: 'open' }, { colId: 'c' }],
                    },
                    { colId: 'd' },
                ]}
                rowData={[{}, {}]}
                cellSelection
                onGridReady={(e) => {
                    api = e.api;
                }}
            />
        );
        await waitFor(() => expect(rangeBorders(api!, ['b', 'c'])).toEqual(['b:', 'c:']));

        act(() => api!.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['b', 'c'] }));
        await waitFor(() => expect(rangeBorders(api!, ['b', 'c'])).toEqual(['b:left', 'c:right']));

        act(() => api!.setColumnGroupOpened('g', true));
        await waitFor(() => expect(rangeBorders(api!, ['b', 'c'])).toEqual(['b:left,right', 'c:left,right']));

        act(() => api!.setColumnGroupOpened('g', false));
        await waitFor(() => expect(rangeBorders(api!, ['b', 'c'])).toEqual(['b:left', 'c:right']));
    });
});
