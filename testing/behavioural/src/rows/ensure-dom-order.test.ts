import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

interface OrderRow {
    id: string;
    value?: number;
    l1?: string;
    l2?: string;
    c1?: string;
    c2?: string;
    r1?: string;
    r2?: string;
}

describe('ensureDomOrder', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('keeps row DOM order aligned with displayed order when enabled', async () => {
        const api = createRowOrderGrid(gridsManager, true);

        expect(getScrollableRowIds(api)).toEqual(['r1', 'r2', 'r3']);
        expect(getDisplayedRowIds(api)).toEqual(['r1', 'r2', 'r3']);

        api.setGridOption('rowData', [
            { id: 'r3', value: 3 },
            { id: 'r1', value: 1 },
            { id: 'r2', value: 2 },
        ]);
        await asyncSetTimeout(0);

        expect(getDisplayedRowIds(api)).toEqual(['r3', 'r1', 'r2']);
        expect(getScrollableRowIds(api)).toEqual(['r3', 'r1', 'r2']);
    });

    test('does not reorder existing row DOM nodes when disabled', async () => {
        const api = createRowOrderGrid(gridsManager, false);

        expect(getScrollableRowIds(api)).toEqual(['r1', 'r2', 'r3']);
        expect(getDisplayedRowIds(api)).toEqual(['r1', 'r2', 'r3']);

        api.setGridOption('rowData', [
            { id: 'r3', value: 3 },
            { id: 'r1', value: 1 },
            { id: 'r2', value: 2 },
        ]);
        await asyncSetTimeout(0);

        expect(getDisplayedRowIds(api)).toEqual(['r3', 'r1', 'r2']);
        expect(getScrollableRowIds(api)).toEqual(['r1', 'r2', 'r3']);
    });

    test('keeps cell DOM order aligned with displayed order when enabled', async () => {
        const api = createCellOrderGrid(gridsManager, true);

        expect(getCellOrder(api, 'r1')).toEqual({
            left: ['l1', 'l2'],
            center: ['c1', 'c2'],
            right: ['r1', 'r2'],
        });

        api.applyColumnState({
            applyOrder: true,
            state: [
                { colId: 'l2' },
                { colId: 'l1' },
                { colId: 'c2' },
                { colId: 'c1' },
                { colId: 'r2' },
                { colId: 'r1' },
            ],
        });
        await asyncSetTimeout(0);

        expect(getCellOrder(api, 'r1')).toEqual({
            left: ['l2', 'l1'],
            center: ['c2', 'c1'],
            right: ['r2', 'r1'],
        });
    });

    test('does not reorder existing cell DOM nodes when disabled', async () => {
        const api = createCellOrderGrid(gridsManager, false);

        expect(getCellOrder(api, 'r1')).toEqual({
            left: ['l1', 'l2'],
            center: ['c1', 'c2'],
            right: ['r1', 'r2'],
        });

        api.applyColumnState({
            applyOrder: true,
            state: [
                { colId: 'l2' },
                { colId: 'l1' },
                { colId: 'c2' },
                { colId: 'c1' },
                { colId: 'r2' },
                { colId: 'r1' },
            ],
        });
        await asyncSetTimeout(0);

        expect(getCellOrder(api, 'r1')).toEqual({
            left: ['l1', 'l2'],
            center: ['c1', 'c2'],
            right: ['r1', 'r2'],
        });
    });
});

function createRowOrderGrid(gridsManager: TestGridsManager, ensureDomOrder: boolean): GridApi<OrderRow> {
    return createGrid(gridsManager, ensureDomOrder, {
        columnDefs: [{ colId: 'value', field: 'value' }],
        rowData: [
            { id: 'r1', value: 1 },
            { id: 'r2', value: 2 },
            { id: 'r3', value: 3 },
        ],
    });
}

function createCellOrderGrid(gridsManager: TestGridsManager, ensureDomOrder: boolean): GridApi<OrderRow> {
    const columnDefs: ColDef<OrderRow>[] = [
        { colId: 'l1', field: 'l1', pinned: 'left' },
        { colId: 'l2', field: 'l2', pinned: 'left' },
        { colId: 'c1', field: 'c1' },
        { colId: 'c2', field: 'c2' },
        { colId: 'r1', field: 'r1', pinned: 'right' },
        { colId: 'r2', field: 'r2', pinned: 'right' },
    ];

    return createGrid(gridsManager, ensureDomOrder, {
        columnDefs,
        rowData: [
            {
                id: 'r1',
                l1: 'l1',
                l2: 'l2',
                c1: 'c1',
                c2: 'c2',
                r1: 'r1',
                r2: 'r2',
            },
        ],
    });
}

function createGrid(
    gridsManager: TestGridsManager,
    ensureDomOrder: boolean,
    partialOptions: GridOptions<OrderRow>
): GridApi<OrderRow> {
    return gridsManager.createGrid('myGrid', {
        ensureDomOrder,
        animateRows: false,
        getRowId: (params) => params.data.id,
        ...partialOptions,
    });
}

function getDisplayedRowIds(api: GridApi<OrderRow>): string[] {
    const rowCount = api.getDisplayedRowCount();
    const ids: string[] = [];

    for (let index = 0; index < rowCount; index++) {
        const rowId = api.getDisplayedRowAtIndex(index)?.id;
        if (rowId != null) {
            ids.push(String(rowId));
        }
    }

    return ids;
}

function getScrollableRowIds(api: GridApi<OrderRow>): string[] {
    const root = TestGridsManager.getHTMLElement(api);
    if (!root) {
        return [];
    }

    return Array.from(root.querySelectorAll<HTMLElement>('.ag-grid-scrolling-container > .ag-row[row-id]')).map(
        (row) => row.getAttribute('row-id') ?? ''
    );
}

function getCellOrder(api: GridApi<OrderRow>, rowId: string): { left: string[]; center: string[]; right: string[] } {
    const root = TestGridsManager.getHTMLElement(api);
    if (!root) {
        return { left: [], center: [], right: [] };
    }

    const row = root.querySelector<HTMLElement>(`.ag-grid-scrolling-container > .ag-row[row-id="${rowId}"]`);
    if (!row) {
        return { left: [], center: [], right: [] };
    }

    return {
        left: getCellColIds(row, '.ag-grid-pinned-left-cells'),
        center: getCellColIds(row, '.ag-grid-scrolling-cells'),
        right: getCellColIds(row, '.ag-grid-pinned-right-cells'),
    };
}

function getCellColIds(row: HTMLElement, containerSelector: string): string[] {
    return Array.from(row.querySelectorAll<HTMLElement>(`${containerSelector} .ag-cell`))
        .map((cell) => cell.getAttribute('col-id') ?? '')
        .filter((colId) => !!colId);
}
