import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ScrollApiModule } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';
import { mockGridLayout } from '../test-utils/polyfills/mockGridLayout';

const overflowingColumnDefs = [
    { field: 'a', pinned: 'left' as const, width: 300 },
    { field: 'b', pinned: 'left' as const, width: 300 },
    { field: 'c', pinned: 'right' as const, width: 300 },
    { field: 'd', pinned: 'right' as const, width: 300 },
    { field: 'e', pinned: 'right' as const, width: 300 },
    { field: 'f', pinned: 'left' as const, width: 300 },
    { field: 'g', flex: 1 },
];

const rowData = [{ a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g' }];

const query = <T extends Element>(selector: string): T => {
    const element = document.querySelector<T>(selector);
    expect(element, `Expected ${selector} to be rendered`).not.toBeNull();
    return element!;
};

const dispatchGridSizeChanged = (api: GridApi, width: number): void => {
    const beans = (api.getAllGridColumns()[0] as any).beans;
    beans.eventSvc.dispatchEvent({
        type: 'gridSizeChanged',
        clientWidth: width,
        clientHeight: mockGridLayout.gridHeight,
    });
};

describe('Pinned columns wider than the viewport', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ScrollApiModule] });
    let originalGridWidth: number;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        mockGridLayout.gridWidth = 600;
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterAll(() => {
        mockGridLayout.gridWidth = originalGridWidth;
        mockGridLayout.useRealOffsetDimensions = false;
    });

    afterEach(() => {
        mockGridLayout.gridWidth = 600;
        gridsManager.reset();
    });

    test('clips mixed pinned sections without creating a horizontal scroll range', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: overflowingColumnDefs,
            rowData,
            processUnpinnedColumns: () => [],
        });

        await asyncSetTimeout(0);

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);
        expect(viewport.scrollLeft).toBe(0);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('600px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).toBe('1px');

        const headerRows = document.querySelectorAll<HTMLElement>('.ag-header-row');
        expect(headerRows.length).toBeGreaterThan(0);
        expect(Array.from(headerRows, (row) => row.style.width)).toEqual(Array.from(headerRows, () => '600px'));

        const firstRow = query<HTMLElement>('.ag-row');
        expect(query<HTMLElement>('.ag-row > .ag-grid-pinned-left-cells').style.width).toBe('900px');
        expect(query<HTMLElement>('.ag-row > .ag-grid-pinned-right-cells').style.width).toBe('900px');
        expect(firstRow.getBoundingClientRect().left).toBe(viewport.getBoundingClientRect().left);

        expect(api.getColumnState().filter((column) => column.pinned === 'left')).toHaveLength(3);
        expect(api.getColumnState().filter((column) => column.pinned === 'right')).toHaveLength(3);

        api.ensureColumnVisible('g');
        expect(viewport.scrollLeft).toBe(0);
    });

    test('restores normal horizontal sizing when the viewport becomes wide enough', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: overflowingColumnDefs,
            rowData,
            processUnpinnedColumns: () => [],
        });

        await asyncSetTimeout(0);

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);

        mockGridLayout.gridWidth = 2400;
        dispatchGridSizeChanged(api, 2400);

        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(false);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('2400px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).not.toBe('1px');

        mockGridLayout.gridWidth = 600;
        dispatchGridSizeChanged(api, 600);

        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('600px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).toBe('1px');
    });

    test('keeps the normal scroll range while pinned columns fit in the viewport', async () => {
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', pinned: 'left', width: 300 },
                { field: 'b', width: 500 },
                { field: 'c', width: 500 },
            ],
            rowData,
        });

        await asyncSetTimeout(0);

        expect(query<HTMLElement>('.ag-grid-viewport').classList.contains('ag-pinned-columns-overflow')).toBe(false);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('1300px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).toBe('1300px');
    });
});
