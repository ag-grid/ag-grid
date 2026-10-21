import { act, cleanup, render, waitFor } from '@testing-library/react';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';

import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ModuleRegistry, getGridElement } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

/** Each cell of the first row as `colId left|right width`, its pinned edge class and its aria-colindex. */
const cellGeometry = (api: GridApi, colIds: string[]): string[] =>
    colIds.map((colId) => {
        const cell = getGridElement(api)!.querySelector<HTMLElement>(
            `.ag-row[row-index="0"] .ag-cell[col-id="${colId}"]`
        );
        if (!cell) {
            return `${colId} -`;
        }
        const { left, right, width } = cell.style;
        let edge = '';
        if (cell.classList.contains('ag-cell-last-left-pinned')) {
            edge = ' last-left';
        } else if (cell.classList.contains('ag-cell-first-right-pinned')) {
            edge = ' first-right';
        }
        const position = left ? `left:${left}` : `right:${right}`;
        return `${colId} ${position} ${width}${edge} #${cell.getAttribute('aria-colindex')}`;
    });

describe('cell geometry (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnApiModule]);
        // No TestGridsManager here, so the layout mock that gives the viewport a width has to be installed.
        mockGridLayout.init();
    });

    afterEach(() => {
        cleanup();
    });

    // `waitFor`, not a bare promise, so React does not warn of the updates the grid makes on its way to ready
    const renderGrid = async (columnDefs: (ColDef | ColGroupDef)[]): Promise<GridApi> => {
        let api: GridApi | undefined;
        render(
            <AgGridReact
                columnDefs={columnDefs}
                rowData={[{}]}
                onGridReady={(e) => {
                    api = e.api;
                }}
            />
        );
        await waitFor(() => expect(api).toBeDefined());
        return api!;
    };

    test('cells follow resizes, including one that moves width between two columns', async () => {
        const api = await renderGrid([
            { colId: 'a', width: 100 },
            { colId: 'b', width: 100 },
            { colId: 'c', width: 100 },
        ]);
        const cols = ['a', 'b', 'c'];
        await waitFor(() =>
            expect(cellGeometry(api, cols)).toEqual([
                'a left:0px 100px #1',
                'b left:100px 100px #2',
                'c left:200px 100px #3',
            ])
        );

        act(() => api.setColumnWidths([{ key: 'a', newWidth: 150 }]));
        await waitFor(() =>
            expect(cellGeometry(api, cols)).toEqual([
                'a left:0px 150px #1',
                'b left:150px 100px #2',
                'c left:250px 100px #3',
            ])
        );

        act(() =>
            api.setColumnWidths([
                { key: 'a', newWidth: 100 },
                { key: 'b', newWidth: 150 },
            ])
        );
        await waitFor(() =>
            expect(cellGeometry(api, cols)).toEqual([
                'a left:0px 100px #1',
                'b left:100px 150px #2',
                'c left:250px 100px #3',
            ])
        );
    });

    test('cells and their aria-colindex follow hiding, showing and moving columns', async () => {
        const api = await renderGrid([
            { colId: 'a', width: 100 },
            { colId: 'b', width: 50 },
            { colId: 'c', width: 100 },
        ]);
        const cols = ['a', 'b', 'c'];
        await waitFor(() =>
            expect(cellGeometry(api, cols)).toEqual([
                'a left:0px 100px #1',
                'b left:100px 50px #2',
                'c left:150px 100px #3',
            ])
        );

        act(() => api.setColumnsVisible(['a'], false));
        await waitFor(() =>
            expect(cellGeometry(api, cols)).toEqual(['a -', 'b left:0px 50px #2', 'c left:50px 100px #3'])
        );

        act(() => {
            api.setColumnsVisible(['a'], true);
            api.moveColumns(['c'], 0);
        });
        await waitFor(() =>
            expect(cellGeometry(api, cols)).toEqual([
                'a left:100px 100px #2',
                'b left:200px 50px #3',
                'c left:0px 100px #1',
            ])
        );
    });

    // a group open and a move refresh the columns outside a column update, so the rows are laid out by that refresh alone
    test('cells follow a column group opening and closing, and a move across a spanning cell', async () => {
        const api = await renderGrid([
            {
                groupId: 'g',
                children: [
                    { colId: 'a', width: 100 },
                    { colId: 'b', width: 50, columnGroupShow: 'open' },
                ],
            },
            { colId: 'c', width: 100, colSpan: () => 2 },
            { colId: 'd', width: 100 },
            { colId: 'e', width: 100 },
        ]);
        const cols = ['a', 'b', 'c', 'd', 'e'];
        await waitFor(() =>
            expect(cellGeometry(api, cols)).toEqual([
                'a left:0px 100px #1',
                'b -',
                'c left:100px 200px #3',
                'd -',
                'e left:300px 100px #5',
            ])
        );

        act(() => api.setColumnGroupOpened('g', true));
        await waitFor(() =>
            expect(cellGeometry(api, cols)).toEqual([
                'a left:0px 100px #1',
                'b left:100px 50px #2',
                'c left:150px 200px #3',
                'd -',
                'e left:350px 100px #5',
            ])
        );

        act(() => {
            api.setColumnGroupOpened('g', false);
            api.moveColumns(['e'], 1);
        });
        await waitFor(() =>
            expect(cellGeometry(api, cols)).toEqual([
                'a left:0px 100px #1',
                'b -',
                'c left:200px 200px #4',
                'd -',
                'e left:100px 100px #2',
            ])
        );
    });

    test('a flex cell is resized when hiding or showing its neighbour leaves every left and section total unchanged', async () => {
        const api = await renderGrid([
            { colId: 'x', width: 100 },
            { colId: 'f', flex: 1 },
            { colId: 'a', width: 100 },
        ]);
        await waitFor(() => expect(cellGeometry(api, ['f'])).toEqual(['f left:100px 800px #2']));

        act(() => api.setColumnsVisible(['a'], false));
        await waitFor(() => expect(cellGeometry(api, ['f'])).toEqual(['f left:100px 900px #2']));

        act(() => api.setColumnsVisible(['a'], true));
        await waitFor(() => expect(cellGeometry(api, ['f'])).toEqual(['f left:100px 800px #2']));
    });

    test('the pinned edge classes follow pinning', async () => {
        const api = await renderGrid([
            { colId: 'l', width: 100, pinned: 'left' },
            { colId: 'c', width: 100 },
            { colId: 'r1', width: 100, pinned: 'right' },
            { colId: 'r2', width: 100, pinned: 'right' },
        ]);
        const cols = ['l', 'c', 'r1', 'r2'];
        await waitFor(() =>
            expect(cellGeometry(api, cols)).toEqual([
                'l left:0px 100px last-left #1',
                'c left:0px 100px #2',
                'r1 right:100px 100px first-right #3',
                'r2 right:0px 100px #4',
            ])
        );

        act(() => {
            api.setColumnsPinned(['c'], 'left');
            api.setColumnsPinned(['r1'], null);
        });
        await waitFor(() =>
            expect(cellGeometry(api, cols)).toEqual([
                'l left:0px 100px #1',
                'c left:100px 100px last-left #2',
                'r1 left:0px 100px #3',
                'r2 right:0px 100px first-right #4',
            ])
        );
    });
    test('the first, last and pinned edge classes follow the edges', async () => {
        const api = await renderGrid(['a', 'b', 'c', 'd'].map((colId) => ({ colId })));
        const edges = (): string =>
            Array.from(getGridElement(api)!.querySelectorAll<HTMLElement>('.ag-row[row-index="0"] .ag-cell'))
                .map((cell) => {
                    const marks = [
                        ['ag-column-first', 'F'],
                        ['ag-column-last', 'L'],
                        ['ag-cell-last-left-pinned', '<'],
                        ['ag-cell-first-right-pinned', '>'],
                    ]
                        .filter(([cls]) => cell.classList.contains(cls))
                        .map(([, mark]) => mark)
                        .join('');
                    return `${cell.getAttribute('col-id')}${marks}`;
                })
                .sort()
                .join(' ');
        await waitFor(() => expect(edges()).toBe('aF b c dL'));

        act(() => api.setColumnsVisible(['a'], false));
        await waitFor(() => expect(edges()).toBe('bF c dL'));

        act(() => api.moveColumns(['b'], 2));
        await waitFor(() => expect(edges()).toBe('b cF dL'));

        act(() => {
            api.setColumnsPinned(['d'], 'left');
            api.setColumnsPinned(['c'], 'right');
        });
        await waitFor(() => expect(edges()).toBe('b cL> dF<'));

        act(() => {
            api.setColumnsPinned(['c', 'd'], null);
            api.setColumnsVisible(['a'], true);
        });
        await waitFor(() => expect(edges()).toBe('aF b c dL'));
    });
});
