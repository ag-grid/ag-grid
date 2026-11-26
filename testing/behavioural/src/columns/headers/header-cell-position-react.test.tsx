import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const columnDefs: ColDef[] = [0, 1, 2].map((i) => ({ colId: `c${i}`, field: `c${i}`, width: 100 }));

describe('React header cell positions', () => {
    afterEach(() => cleanup());

    it('a header cell moved to another lane is placed and sized in its new element', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={[{ c0: 1, c1: 2, c2: 3 }]}
                columnDefs={columnDefs}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const header = () => document.querySelector<HTMLElement>('.ag-header-cell[col-id="c1"]');
        await waitFor(() => expect(header()?.style.left).toBe('100px'));
        const before = header();

        act(() => apiRef.current!.setColumnsPinned(['c1'], 'left'));
        await waitFor(() => expect(header()?.closest('.ag-grid-pinned-left-cells')).not.toBeNull());

        expect(header()).not.toBe(before);
        await waitFor(() => expect(`${header()!.style.left}/${header()!.style.width}`).toBe('0px/100px'));
    });
    it('print layout empties the header pinned sections and draws every column in the scrolling one, until switched back', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={[{ c0: 1, c1: 2, c2: 3 }]}
                columnDefs={[{ ...columnDefs[0], pinned: 'left' }, columnDefs[1], columnDefs[2]]}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const sections = () => {
            const row = document.querySelector('.ag-header-row-column')!;
            const left = row.querySelector<HTMLElement>('.ag-grid-pinned-left-cells')!.style.width;
            const scrolling = row.querySelector<HTMLElement>('.ag-grid-scrolling-cells')!.style.width;
            return `${left}/${scrolling}`;
        };
        const pinnedLane = () =>
            document.querySelector('.ag-header-cell[col-id="c0"]')?.closest('.ag-grid-pinned-left-cells') != null;
        await waitFor(() => expect(sections()).toBe('100px/200px'));
        expect(pinnedLane()).toBe(true);

        act(() => apiRef.current!.setGridOption('domLayout', 'print'));
        await waitFor(() => expect(sections()).toBe('0px/300px'));
        await waitFor(() => expect(pinnedLane()).toBe(false));

        act(() => apiRef.current!.setGridOption('domLayout', 'normal'));
        await waitFor(() => expect(sections()).toBe('100px/200px'));
        await waitFor(() => expect(pinnedLane()).toBe(true));
    });

    describe('column moves within a pinned section', () => {
        const fourColumns: ColDef[] = [0, 1, 2, 3].map((i) => ({ colId: `c${i}`, field: `c${i}`, width: 100 }));
        const rowData = [{ c0: 1, c1: 2, c2: 3, c3: 4 }];

        const mountFourColumns = (ensureDomOrder?: boolean) => {
            const apiRef: { current?: GridApi } = {};
            render(
                <AgGridReact
                    rowData={rowData}
                    columnDefs={fourColumns}
                    ensureDomOrder={ensureDomOrder}
                    modules={[AllCommunityModule]}
                    onGridReady={(e: GridReadyEvent) => {
                        apiRef.current = e.api;
                    }}
                />
            );
            return apiRef;
        };
        const lane = (selector: string) =>
            Array.from(
                document.querySelectorAll<HTMLElement>(`.ag-header-row-column ${selector} .ag-header-cell[col-id]`)
            );
        const centre = () => lane('.ag-grid-scrolling-cells');
        const ids = (elements: HTMLElement[]) => elements.map((el) => el.getAttribute('col-id'));
        const lefts = (elements: HTMLElement[]) =>
            Object.fromEntries(elements.map((el) => [el.getAttribute('col-id'), el.style.left]));

        it('header cells follow their new positions when columns move within the centre section', async () => {
            const apiRef = mountFourColumns();
            await waitFor(() => expect(lefts(centre())).toEqual({ c0: '0px', c1: '100px', c2: '200px', c3: '300px' }));
            const before = centre();
            expect(ids(before)).toEqual(['c0', 'c1', 'c2', 'c3']);

            // order becomes c1, c2, c0, c3
            act(() => apiRef.current!.moveColumns(['c0'], 2));
            await waitFor(() => expect(lefts(centre())).toEqual({ c0: '200px', c1: '0px', c2: '100px', c3: '300px' }));

            // order becomes c0, c3, c1, c2
            act(() => apiRef.current!.moveColumns(['c1', 'c2'], 2));
            await waitFor(() => expect(lefts(centre())).toEqual({ c0: '0px', c1: '200px', c2: '300px', c3: '100px' }));
        });

        it('ensureDomOrder keeps the header cells in column order when columns move', async () => {
            const apiRef = mountFourColumns(true);
            await waitFor(() => expect(ids(centre())).toEqual(['c0', 'c1', 'c2', 'c3']));

            act(() => apiRef.current!.moveColumns(['c0'], 2));
            await waitFor(() => expect(ids(centre())).toEqual(['c1', 'c2', 'c0', 'c3']));

            act(() => apiRef.current!.moveColumns(['c1', 'c2'], 2));
            await waitFor(() => expect(ids(centre())).toEqual(['c0', 'c3', 'c1', 'c2']));
        });

        it('a column re-ordered and pinned in one call moves to the pinned section and the other header cells take their new positions', async () => {
            const apiRef = mountFourColumns();
            await waitFor(() => expect(lefts(centre())).toEqual({ c0: '0px', c1: '100px', c2: '200px', c3: '300px' }));

            // order becomes c2 (pinned), c3, c1, c0
            act(() => {
                apiRef.current!.applyColumnState({
                    state: [{ colId: 'c2', pinned: 'left' }, { colId: 'c3' }, { colId: 'c1' }, { colId: 'c0' }],
                    applyOrder: true,
                });
            });
            await waitFor(() => expect(ids(lane('.ag-grid-pinned-left-cells'))).toEqual(['c2']));
            await waitFor(() => expect(lefts(centre())).toEqual({ c0: '200px', c1: '100px', c3: '0px' }));
        });
    });
});
