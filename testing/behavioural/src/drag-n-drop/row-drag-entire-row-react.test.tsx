import { act, cleanup, render, waitFor } from '@testing-library/react';
import { DragEventDispatcher, initPointerEventPolyfill, mockGridLayout } from 'ag-test-utils';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    EventApiModule,
    ModuleRegistry,
    RowDragModule,
    getGridElement,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

/** Drags row `fromId` by its cell, with no drag handle, onto row `toId`; returns the rows entered. */
const dragByCell = async (api: GridApi, fromId: string, toId: string): Promise<number> => {
    const gridElement = getGridElement(api)!;
    const cellOf = (rowId: string) => gridElement.querySelector(`.ag-row[row-id="${rowId}"] [col-id="a"]`)!;
    let entered = 0;
    const onEnter = () => ++entered;
    api.addEventListener('rowDragEnter', onEnter);

    const source = cellOf(fromId);
    const target = cellOf(toId);
    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const dispatcher = new DragEventDispatcher('mouse', gridElement.querySelector('.ag-grid-viewport'));
    await act(async () => {
        await dispatcher.startDrag(source, sourceRect.left + 5, sourceRect.top + 5);
        await dispatcher.movePointer(source, sourceRect.left + 10, sourceRect.top + 10);
        await dispatcher.movePointer(target, targetRect.left + 10, targetRect.top + 10);
        await dispatcher.finishDrag();
    });

    api.removeEventListener('rowDragEnter', onEnter);
    return entered;
};

describe('rowDragEntireRow (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, EventApiModule, RowDragModule]);
        mockGridLayout.init();
        initPointerEventPolyfill();
    });

    afterEach(() => {
        cleanup();
    });

    test('a row drags from any cell while the option is on, including after it is turned off and on again', async () => {
        let api: GridApi | undefined;
        render(
            <AgGridReact
                columnDefs={[{ field: 'a' }]}
                rowData={[
                    { id: '1', a: 'A' },
                    { id: '2', a: 'B' },
                ]}
                getRowId={(params) => params.data.id}
                rowDragEntireRow
                onGridReady={(e) => {
                    api = e.api;
                }}
            />
        );
        await waitFor(() => expect(getGridElement(api!)?.querySelectorAll('.ag-row [col-id="a"]').length).toBe(2));

        expect(await dragByCell(api!, '1', '2')).toBe(1);

        act(() => api!.setGridOption('rowDragEntireRow', false));
        expect(await dragByCell(api!, '1', '2')).toBe(0);

        act(() => api!.setGridOption('rowDragEntireRow', true));
        expect(await dragByCell(api!, '1', '2')).toBe(1);
    });
});
