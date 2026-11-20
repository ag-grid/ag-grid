import { act, cleanup, render, waitFor } from '@testing-library/react';
import { DragEventDispatcher, asyncSetTimeout, initPointerEventPolyfill } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';

import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ColumnHoverModule, getGridElement } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

describe('a kept column group header follows the leaves new column definitions give it (React)', () => {
    beforeAll(() => {
        mockGridLayout.init();
        initPointerEventPolyfill();
    });

    afterEach(() => {
        cleanup();
    });

    const rowData = [{ a: 1, c: 3, d: 4, e: 5 }];
    const columnDefs = (second: string): (ColDef | ColGroupDef)[] => [
        { field: 'a' },
        { groupId: 'g', children: [{ field: 'c' }, { field: second }] },
    ];
    const grid = (second: string) => (
        <React.StrictMode>
            <AgGridReact
                modules={[ClientSideRowModelModule, ColumnHoverModule]}
                suppressColumnVirtualisation
                columnHoverHighlight
                columnDefs={columnDefs(second)}
                rowData={rowData}
            />
        </React.StrictMode>
    );
    const hoveredByGroupHeader = () => {
        const header = document.querySelector('.ag-header-group-cell[col-id^="g_"]')!;
        header.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        const hovered = Array.from(document.querySelectorAll('.ag-cell.ag-column-hover'), (cell) =>
            cell.getAttribute('col-id')
        ).sort();
        header.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
        return hovered;
    };

    test('hovering the header highlights the leaves of each columnDefs update', async () => {
        const view = render(grid('d'));
        await waitFor(() => expect(hoveredByGroupHeader()).toEqual(['c', 'd']));

        view.rerender(grid('e'));
        await waitFor(() => expect(document.querySelector('.ag-cell[col-id="e"]')).not.toBeNull());
        expect(hoveredByGroupHeader()).toEqual(['c', 'e']);

        view.rerender(grid('d'));
        await waitFor(() => expect(document.querySelector('.ag-cell[col-id="d"]')).not.toBeNull());
        expect(hoveredByGroupHeader()).toEqual(['c', 'd']);
    });

    describe('dragging the header', () => {
        const leaf = (field: string, extra: Partial<ColDef> = {}): ColDef => ({ field, width: 100, ...extra });
        const groupHeader = '.ag-header-group-cell[col-id^="g_"]';
        const defs = (second: ColDef): (ColDef | ColGroupDef)[] => [
            { groupId: 'g', children: [leaf('c'), second] },
            leaf('a'),
            leaf('z'),
        ];
        let api: GridApi;
        const gridWith = (columnDefs: (ColDef | ColGroupDef)[]) => (
            <React.StrictMode>
                <AgGridReact
                    modules={[ClientSideRowModelModule, ColumnApiModule]}
                    suppressColumnVirtualisation
                    columnDefs={columnDefs}
                    rowData={rowData}
                    onGridReady={(e) => {
                        api = e.api;
                    }}
                />
            </React.StrictMode>
        );
        const columnOrder = () => api.getAllGridColumns().map((col) => col.getColId());
        const leavesOfGroup = () =>
            api
                .getColumnGroup('g')!
                .getLeafColumns()
                .map((col) => col.getColId())
                .sort();

        // Drags the group header from x=100 to x=350 over the body, as a user would.
        const dragGroup = async (settleMs: number) => {
            const header = getGridElement(api)!.querySelector(groupHeader)!;
            const viewport = getGridElement(api)!.querySelector('.ag-grid-viewport')!;
            const before = columnOrder();
            const dispatcher = new DragEventDispatcher('mouse', null, false);
            let dragStarted = false;
            try {
                await act(async () => {
                    await dispatcher.startDrag(header, 100, 100);
                    await dispatcher.movePointer(viewport, 100, 100);
                    await dispatcher.movePointer(viewport, 350, 100);
                    dragStarted = document.querySelector('.ag-dnd-ghost') != null;
                    await dispatcher.finishDrag(viewport);
                    // A drop moving nothing has no signal to poll for: hold open the window a move would land in.
                    await asyncSetTimeout(settleMs);
                });
            } finally {
                dispatcher.reset();
            }
            return { before, after: columnOrder(), dragStarted };
        };
        const gridReady = () =>
            waitFor(() => expect(getGridElement(api)?.querySelectorAll('.ag-header-cell').length).toBe(4));

        test('the header starts no drag once a leaf it now has is position-locked, as a fresh one starts none', async () => {
            const control = render(gridWith(defs(leaf('d'))));
            await gridReady();
            const unlocked = await dragGroup(0);
            control.unmount();

            const view = render(gridWith(defs(leaf('d'))));
            await gridReady();
            const headerBefore = getGridElement(api)!.querySelector(groupHeader);
            view.rerender(gridWith(defs(leaf('e', { lockPosition: true }))));
            await waitFor(() => expect(leavesOfGroup()).toEqual(['c', 'e']));
            await waitFor(() =>
                expect(getGridElement(api)!.querySelector('.ag-header-cell[col-id="e"]')).not.toBeNull()
            );
            expect(getGridElement(api)!.querySelector(groupHeader)).toBe(headerBefore);

            const locked = await dragGroup(50);

            expect(unlocked).toEqual({ before: ['c', 'd', 'a', 'z'], after: ['a', 'z', 'c', 'd'], dragStarted: true });
            expect(locked.dragStarted).toBe(false);
            expect(locked.after).toEqual(locked.before);
        });
    });
});
