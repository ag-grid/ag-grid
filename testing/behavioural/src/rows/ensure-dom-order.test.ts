import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';

import type { ColDef, GridApi, GridOptions, ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    PinnedRowModule,
    RowApiModule,
    ScrollApiModule,
    TextEditorModule,
    _processOnChange,
} from 'ag-grid-community';

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
        modules: [
            ClientSideRowModelApiModule,
            ClientSideRowModelModule,
            PinnedRowModule,
            RowApiModule,
            ScrollApiModule,
            TextEditorModule,
        ],
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

    // A row moved in the DOM loses the pointer's hover without a pointerleave, so kept rows must not move.
    describe('with row virtualisation', () => {
        beforeAll(() => {
            // the viewport reports no height otherwise, so only the row buffer is rendered
            mockGridLayout.useRealOffsetDimensions = true;
        });

        afterAll(() => {
            mockGridLayout.useRealOffsetDimensions = false;
        });

        const rowKinds: Record<string, GridOptions<OrderRow>> = {
            plain: {},
            'pinned rows': {
                pinnedTopRowData: [{ id: 'top', value: -1 }],
                pinnedBottomRowData: [{ id: 'bottom', value: -2 }],
            },
            'full width rows': {
                isFullWidthRow: (params) => params.rowNode.data!.value! % 3 === 0,
                fullWidthCellRenderer: () => 'full width',
            },
        };

        describe.each(Object.keys(rowKinds))('%s', (rowKind) => {
            test.each([
                ['down', true],
                ['up', true],
                ['down', false],
                ['up', false],
            ] as const)(
                'scrolling %s leaves the rows it keeps in place (ensureDomOrder %s)',
                async (direction, ensureDomOrder) => {
                    const api = createGrid(gridsManager, ensureDomOrder, {
                        columnDefs: [{ field: 'value' }],
                        rowData: Array.from({ length: 200 }, (_, i) => ({ id: `r${i}`, value: i })),
                        suppressRowVirtualisation: false,
                        rowBuffer: 0,
                        ...rowKinds[rowKind],
                    });
                    await asyncSetTimeout(0);
                    if (direction === 'up') {
                        api.ensureIndexVisible(150, 'top');
                        await waitFor(() => expect(getScrollableRowIds(api)).toContain('r150'));
                    }

                    const root = TestGridsManager.getHTMLElement(api)!;
                    const rowsBefore = getRowsById(root);
                    const removedRows = new Set<Node>();
                    const collectRemoved = (records: MutationRecord[]) => {
                        for (const record of records) {
                            for (const node of record.removedNodes) {
                                removedRows.add(node);
                            }
                        }
                    };
                    const observer = new MutationObserver(collectRemoved);
                    observer.observe(root, { childList: true, subtree: true });

                    if (direction === 'down') {
                        api.ensureIndexVisible(5, 'top');
                        await waitFor(() => expect(getScrollableRowIds(api)).not.toContain('r0'));
                    } else {
                        api.ensureIndexVisible(145, 'top');
                        await waitFor(() => expect(getScrollableRowIds(api)).toContain('r145'));
                    }
                    collectRemoved(observer.takeRecords());
                    observer.disconnect();

                    const rowsAfter = getRowsById(root);
                    const keptIds = Array.from(rowsBefore.keys()).filter((id) => rowsAfter.has(id));
                    const keptBodyRows = keptIds.filter((id) => id.startsWith('r')).map((id) => rowsBefore.get(id)!);
                    expect(keptBodyRows.length).toBeGreaterThan(0);
                    expect(keptIds.length).toBeLessThan(rowsBefore.size);
                    if (rowKind === 'full width rows') {
                        expect(keptBodyRows.some((row) => row.classList.contains('ag-full-width-row'))).toBe(true);
                    }
                    const movedOrRecreated = keptIds.filter(
                        (id) => rowsAfter.get(id) !== rowsBefore.get(id) || removedRows.has(rowsBefore.get(id)!)
                    );
                    expect(movedOrRecreated).toEqual([]);
                    if (rowKind === 'pinned rows') {
                        expect(keptIds).toEqual(expect.arrayContaining(['top', 'bottom']));
                    }
                    if (ensureDomOrder) {
                        const rowIds = getScrollableRowIds(api);
                        expect(rowIds).toEqual([...rowIds].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))));
                    }
                }
            );
        });
    });

    test.each([true, false])(
        'a transaction removing and adding rows leaves the rows it keeps in place (ensureDomOrder %s)',
        async (ensureDomOrder) => {
            const api = createGrid(gridsManager, ensureDomOrder, {
                columnDefs: [{ field: 'value' }],
                rowData: Array.from({ length: 10 }, (_, i) => ({ id: `r${i}`, value: i })),
            });
            await asyncSetTimeout(0);

            const root = TestGridsManager.getHTMLElement(api)!;
            const rowsBefore = getRowsById(root);
            const removedRows = new Set<Node>();
            const observer = new MutationObserver((records) => {
                for (const record of records) {
                    for (const node of record.removedNodes) {
                        removedRows.add(node);
                    }
                }
            });
            observer.observe(root, { childList: true, subtree: true });

            api.applyTransaction({
                remove: [{ id: 'r2' }, { id: 'r3' }],
                add: [{ id: 'n1', value: 100 }],
                addIndex: 4,
            });
            await asyncSetTimeout(0);
            for (const record of observer.takeRecords()) {
                for (const node of record.removedNodes) {
                    removedRows.add(node);
                }
            }
            observer.disconnect();

            const rowsAfter = getRowsById(root);
            const keptIds = Array.from(rowsBefore.keys()).filter((id) => rowsAfter.has(id));
            expect(keptIds).toEqual(['r0', 'r1', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9']);
            const movedOrRecreated = keptIds.filter(
                (id) => rowsAfter.get(id) !== rowsBefore.get(id) || removedRows.has(rowsBefore.get(id)!)
            );
            expect(movedOrRecreated).toEqual([]);
            if (ensureDomOrder) {
                expect(getScrollableRowIds(api)).toEqual(getDisplayedRowIds(api));
            }
        }
    );

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

    // A full row edit keeps every cell whose column scrolls out of the viewport, so a batch of them
    // has to be merged back among the rendered cells at once. Inserting them one at a time, re-scanning
    // after each, reversed them relative to each other.
    test('keeps cells held by a full row edit in column order after scrolling', async () => {
        const columnDefs: ColDef<OrderRow>[] = Array.from({ length: 50 }, (_, i) => ({
            colId: `c${i}`,
            field: 'value',
            width: 200,
        }));
        const api = createGrid(gridsManager, true, {
            columnDefs,
            editType: 'fullRow',
            defaultColDef: { editable: true, cellDataType: false },
            rowData: [{ id: 'r1', value: 1 }],
            // TestGridsManager disables virtualisation by default, but columns only leave the
            // viewport - and so only get kept - when it is on.
            suppressColumnVirtualisation: false,
            suppressAnimationFrame: true,
        });
        await asyncSetTimeout(0);

        api.startEditingCell({ rowIndex: 0, colKey: 'c0' });
        await asyncSetTimeout(0);

        api.ensureColumnVisible('c40');
        await asyncSetTimeout(0);

        const rendered = getCellOrder(api, 'r1').center;
        const displayedOrder = api.getAllDisplayedColumns().map((col) => col.getColId());

        // the edit holds c0 on, well behind the scrolled viewport, so several cells are merged back
        expect(rendered).toContain('c0');
        expect(rendered.length).toBeGreaterThan(2);
        expect(rendered).toEqual(displayedOrder.filter((colId) => rendered.includes(colId)));
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

    test.each([false, true])(
        'a renderer redrawing a row as a removed row is destroyed leaves every row drawn (ensureDomOrder %s)',
        async (ensureDomOrder) => {
            const api = createGrid(gridsManager, ensureDomOrder, {
                columnDefs: [{ field: 'value', cellRenderer: RedrawRowAOnDestroy }],
                rowData: [
                    { id: 'x', value: 0 },
                    { id: 'a', value: 1 },
                    { id: 'b', value: 2 },
                ],
            });
            await asyncSetTimeout(0);
            expect(getScrollableRowIds(api)).toEqual(['x', 'a', 'b']);

            api.setGridOption('rowData', [
                { id: 'a', value: 1 },
                { id: 'b', value: 2 },
            ]);
            await asyncSetTimeout(0);

            // without ensureDomOrder a redrawn row is appended, so only which rows are drawn is stated
            const rowIds = getScrollableRowIds(api);
            expect(ensureDomOrder ? rowIds : rowIds.sort()).toEqual(['a', 'b']);
        }
    );

    test('cells moved while disabled follow the displayed order once a framework prop enables it', async () => {
        const api = createCellOrderGrid(gridsManager, false);

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
        expect(getCellOrder(api, 'r1').center).toEqual(['c1', 'c2']);

        // how Angular and Vue pass a changed input on, which reaches the rows of a grid already drawn
        _processOnChange({ ensureDomOrder: true }, api);
        await asyncSetTimeout(0);

        expect(getCellOrder(api, 'r1')).toEqual({
            left: ['l2', 'l1'],
            center: ['c2', 'c1'],
            right: ['r2', 'r1'],
        });
    });

    test('cells moved without DOM order are drawn in displayed order once print layout turns it on', async () => {
        const api = createCellOrderGrid(gridsManager, false);

        api.applyColumnState({
            applyOrder: true,
            state: [{ colId: 'c2' }, { colId: 'c1' }],
        });
        await asyncSetTimeout(0);
        expect(getCellOrder(api, 'r1').center).toEqual(['c1', 'c2']);

        api.setGridOption('domLayout', 'print');
        await asyncSetTimeout(0);

        expect(getRowCellColIds(api, 'r1')).toEqual(['l1', 'l2', 'c2', 'c1', 'r1', 'r2']);
    });

    // The header buckets its cells by lane and sorts within each lane; that path runs only on a
    // forceOrder rebuild, which outside print layout is what ensureDomOrder turns on.
    test('keeps header DOM order aligned with displayed order when enabled', async () => {
        const api = createCellOrderGrid(gridsManager, true);

        expect(getHeaderOrder(api)).toEqual({
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

        expect(getHeaderOrder(api)).toEqual({
            left: ['l2', 'l1'],
            center: ['c2', 'c1'],
            right: ['r2', 'r1'],
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

/** Redraws row `a` from inside the destroy of row `x`'s cell, so the row container lays its rows out mid-update. */
class RedrawRowAOnDestroy implements ICellRendererComp<OrderRow> {
    private readonly eGui = document.createElement('span');
    private params: ICellRendererParams<OrderRow> | undefined;

    public init(params: ICellRendererParams<OrderRow>): void {
        this.params = params;
        this.eGui.textContent = String(params.value);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(): boolean {
        return false;
    }

    public destroy(): void {
        const params = this.params;
        if (params?.data?.id !== 'x') {
            return;
        }
        const rowA = params.api.getRowNode('a');
        if (rowA) {
            params.api.redrawRows({ rowNodes: [rowA] });
        }
    }
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

function getScrollableRows(api: GridApi<OrderRow>): HTMLElement[] {
    const root = TestGridsManager.getHTMLElement(api);
    if (!root) {
        return [];
    }

    return Array.from(root.querySelectorAll<HTMLElement>('.ag-grid-scrolling-container > .ag-row[row-id]'));
}

function getRowsById(root: HTMLElement): Map<string, HTMLElement> {
    return new Map(
        Array.from(root.querySelectorAll<HTMLElement>('.ag-row[row-id]'), (row) => [row.getAttribute('row-id')!, row])
    );
}

function getScrollableRowIds(api: GridApi<OrderRow>): string[] {
    return getScrollableRows(api).map((row) => row.getAttribute('row-id') ?? '');
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

function getRowCellColIds(api: GridApi<OrderRow>, rowId: string): string[] {
    const row = TestGridsManager.getHTMLElement(api)?.querySelector<HTMLElement>(`.ag-row[row-id="${rowId}"]`);
    return row ? getCellColIds(row, '') : [];
}

function getCellColIds(row: HTMLElement, containerSelector: string): string[] {
    return Array.from(row.querySelectorAll<HTMLElement>(`${containerSelector} .ag-cell`))
        .map((cell) => cell.getAttribute('col-id') ?? '')
        .filter((colId) => !!colId);
}

function getHeaderOrder(api: GridApi<OrderRow>): { left: string[]; center: string[]; right: string[] } {
    const root = TestGridsManager.getHTMLElement(api);
    const header = root?.querySelector<HTMLElement>('.ag-header');
    if (!header) {
        return { left: [], center: [], right: [] };
    }

    return {
        left: getHeaderColIds(header, '.ag-grid-pinned-left-cells'),
        center: getHeaderColIds(header, '.ag-grid-scrolling-cells'),
        right: getHeaderColIds(header, '.ag-grid-pinned-right-cells'),
    };
}

function getHeaderColIds(header: HTMLElement, containerSelector: string): string[] {
    return Array.from(header.querySelectorAll<HTMLElement>(`${containerSelector} .ag-header-cell`))
        .map((cell) => cell.getAttribute('col-id') ?? '')
        .filter((colId) => !!colId);
}
