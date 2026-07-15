import type { GridApi, GridOptions, IViewportDatasource, IViewportDatasourceParams } from 'ag-grid-community';
import { RowSelectionModule, ScrollApiModule, TextEditorModule } from 'ag-grid-community';
import { ViewportRowModelModule } from 'ag-grid-enterprise';

import { GridActions } from '../selection/utils';
import { TestGridsManager, asyncSetTimeout } from '../test-utils';
import { mockGridLayout } from '../test-utils/polyfills/mockGridLayout';

const PAGE = 10;
const BUFFER = 5;
const ROW_HEIGHT = 20;
const ROW_COUNT = 500;

describe('viewport row model', () => {
    const gridsManager = new TestGridsManager({
        modules: [ViewportRowModelModule, ScrollApiModule, RowSelectionModule, TextEditorModule],
    });

    beforeAll(() => {
        // The viewport model only requests/keeps the rendered window, so tests must run against a
        // real, virtualised layout. jsdom reports 0-sized elements by default, which would render
        // every row; opt into the mocked dimensions so scrolling produces genuine viewport changes.
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
    });

    afterEach(() => {
        gridsManager.reset();
    });

    interface ViewportGrid {
        api: GridApi;
        /** The [firstRow, lastRow] pairs the datasource has been asked to load, in order. */
        ranges: [number, number][];
        /** The datasource params captured on init, for driving pushes/count changes from a test. */
        getDs: () => IViewportDatasourceParams;
    }

    /**
     * Creates a viewport grid backed by a datasource that serves positional rows on demand: each
     * requested [first, last] window is recorded and immediately fulfilled with `id === index` data.
     */
    function createViewportGrid(
        gridId: string,
        options: Partial<GridOptions> = {},
        datasourceOverrides: Partial<IViewportDatasource> = {},
        setRowCountOnInit = true
    ): ViewportGrid {
        const ranges: [number, number][] = [];
        let ds: IViewportDatasourceParams;

        const api = gridsManager.createGrid(gridId, {
            columnDefs: [{ field: 'name' }],
            rowModelType: 'viewport',
            rowHeight: ROW_HEIGHT,
            suppressRowVirtualisation: false,
            viewportRowModelPageSize: PAGE,
            viewportRowModelBufferSize: BUFFER,
            getRowId: (params) => params.data.id,
            viewportDatasource: {
                init: (params) => {
                    ds = params;
                    if (setRowCountOnInit) {
                        params.setRowCount(ROW_COUNT);
                    }
                },
                setViewportRange: (firstRow, lastRow) => {
                    ranges.push([firstRow, lastRow]);
                    const data: Record<number, { id: string; name: string }> = {};
                    for (let i = firstRow; i <= lastRow; i++) {
                        data[i] = { id: `${i}`, name: `name-${i}` };
                    }
                    ds.setRowData(data);
                },
                ...datasourceOverrides,
            },
            ...options,
        });

        return { api, ranges, getDs: () => ds };
    }

    // ---- viewport range calculation ---------------------------------------
    describe('requested viewport range', () => {
        test('covers the rendered window, padded by the buffer and rounded to whole pages', async () => {
            const { api, ranges } = createViewportGrid('myGrid');
            await asyncSetTimeout(0);
            api.ensureIndexVisible(300, 'top');
            await asyncSetTimeout(0);

            const [first, last] = ranges[ranges.length - 1];
            const visibleFirst = api.getFirstDisplayedRowIndex();
            const visibleLast = api.getLastDisplayedRowIndex();

            // both bounds are rounded outward to whole page boundaries
            expect(first % PAGE).toBe(0);
            expect(last % PAGE).toBe(0);
            // the requested window fully contains the rendered rows, padded by at least the buffer
            expect(first).toBeLessThanOrEqual(visibleFirst - BUFFER);
            expect(last).toBeGreaterThanOrEqual(visibleLast + BUFFER);
        });

        test('clamps the first requested row to zero at the top of the grid', async () => {
            const { ranges } = createViewportGrid('myGrid');
            await asyncSetTimeout(0);

            expect(ranges[0][0]).toBe(0);
        });

        test('clamps the last requested row to the final row index at the bottom of the grid', async () => {
            const { api, ranges } = createViewportGrid('myGrid');
            await asyncSetTimeout(0);
            api.ensureIndexVisible(ROW_COUNT - 1, 'bottom');
            await asyncSetTimeout(0);

            const [first, last] = ranges[ranges.length - 1];
            expect(last).toBe(ROW_COUNT - 1);
            expect(first % PAGE).toBe(0);
        });

        test('a larger buffer requests a wider window for the same scroll position', async () => {
            const small = createViewportGrid('small', { viewportRowModelBufferSize: 0 });
            const large = createViewportGrid('large', { viewportRowModelBufferSize: 30 });
            await asyncSetTimeout(0);
            small.api.ensureIndexVisible(300, 'top');
            large.api.ensureIndexVisible(300, 'top');
            await asyncSetTimeout(0);

            const [smallFirst, smallLast] = small.ranges[small.ranges.length - 1];
            const [largeFirst, largeLast] = large.ranges[large.ranges.length - 1];

            expect(largeFirst).toBeLessThan(smallFirst);
            expect(largeLast).toBeGreaterThan(smallLast);
        });

        test('does not re-request the datasource when a small scroll maps to the same page range', async () => {
            const { api, ranges } = createViewportGrid('myGrid');
            await asyncSetTimeout(0);
            api.ensureIndexVisible(300, 'top');
            await asyncSetTimeout(0);

            ranges.length = 0;
            // nudge the scroll by a couple of rows: the rendered window shifts but still rounds to
            // the same buffered page range, so the datasource must not be asked to reload
            api.ensureIndexVisible(302, 'top');
            await asyncSetTimeout(0);

            expect(ranges).toEqual([]);
        });
    });

    // ---- purging rows outside the viewport --------------------------------
    describe('rows outside the viewport', () => {
        test('are dropped once scrolled far out of view', async () => {
            const { api } = createViewportGrid('myGrid');
            await asyncSetTimeout(0);
            expect(api.getRowNode('2')).toBeDefined();

            api.ensureIndexVisible(300, 'top');
            await asyncSetTimeout(0);

            expect(api.getRowNode('2')).toBeUndefined();
            expect(api.getRowNode('300')).toBeDefined();
        });

        test('are kept when focused, even after scrolling away', async () => {
            const { api } = createViewportGrid('myGrid');
            await asyncSetTimeout(0);

            api.setFocusedCell(2, 'name');
            api.ensureIndexVisible(300, 'top');
            await asyncSetTimeout(0);

            expect(api.getRowNode('2')).toBeDefined();
        });

        test('are kept when being edited, even after scrolling away', async () => {
            const { api } = createViewportGrid('myGrid', { columnDefs: [{ field: 'name', editable: true }] });
            await asyncSetTimeout(0);

            api.startEditingCell({ rowIndex: 2, colKey: 'name' });
            api.ensureIndexVisible(300, 'top');
            await asyncSetTimeout(0);

            expect(api.getRowNode('2')).toBeDefined();
        });
    });

    // ---- data updates ------------------------------------------------------
    describe('data updates', () => {
        test('a datasource push for visible rows refreshes the rendered cells and fires modelUpdated', async () => {
            const { api, getDs } = createViewportGrid('myGrid');
            await asyncSetTimeout(0);
            expect(api.getRowNode('0')!.data.name).toBe('name-0');

            let modelUpdates = 0;
            api.addEventListener('modelUpdated', () => modelUpdates++);
            // push new data for an in-view row through the datasource contract, outside a scroll
            getDs().setRowData({ 0: { id: '0', name: 'updated-0' } });
            await asyncSetTimeout(0);

            expect(api.getRowNode('0')!.data.name).toBe('updated-0');
            expect(modelUpdates).toBe(1);
        });

        test('supplying data inside setViewportRange during a scroll does not fire an extra modelUpdated', async () => {
            const { api } = createViewportGrid('myGrid');
            await asyncSetTimeout(0);

            let modelUpdates = 0;
            api.addEventListener('modelUpdated', () => modelUpdates++);
            api.ensureIndexVisible(300, 'top');
            await asyncSetTimeout(0);

            expect(modelUpdates).toBe(0);
        });
    });

    // ---- row count ---------------------------------------------------------
    describe('row count', () => {
        test('ignores a repeated row count without a further model update', async () => {
            const { api, getDs } = createViewportGrid('myGrid', {}, {}, /* setRowCountOnInit */ false);
            getDs().setRowCount(10);
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowCount()).toBe(10);

            let modelUpdates = 0;
            api.addEventListener('modelUpdated', () => modelUpdates++);
            getDs().setRowCount(10);
            await asyncSetTimeout(0);

            expect(modelUpdates).toBe(0);
        });

        test('fires rowCountReady once across multiple row count changes', async () => {
            const { api, getDs } = createViewportGrid('myGrid', {}, {}, /* setRowCountOnInit */ false);

            let rowCountReady = 0;
            // rowCountReady is an internal event, so it is not on the public addEventListener type
            api.addEventListener('rowCountReady' as any, () => rowCountReady++);
            getDs().setRowCount(10);
            getDs().setRowCount(20);
            getDs().setRowCount(30);
            await asyncSetTimeout(0);

            expect(rowCountReady).toBe(1);
            expect(api.getDisplayedRowCount()).toBe(30);
        });
    });

    // ---- row height --------------------------------------------------------
    describe('row height', () => {
        test('recomputes row positions when the row height option changes', async () => {
            const { api } = createViewportGrid('myGrid');
            await asyncSetTimeout(0);

            expect(api.getRowNode('5')!.rowHeight).toBe(ROW_HEIGHT);
            expect(api.getRowNode('5')!.rowTop).toBe(5 * ROW_HEIGHT);

            api.setGridOption('rowHeight', 40);
            await asyncSetTimeout(0);

            expect(api.getRowNode('5')!.rowHeight).toBe(40);
            expect(api.getRowNode('5')!.rowTop).toBe(5 * 40);
        });
    });

    // ---- datasource lifecycle ---------------------------------------------
    describe('datasource lifecycle', () => {
        test('swapping the datasource destroys the previous one and initialises the new one', async () => {
            let firstDestroyed = false;
            const { api } = createViewportGrid('myGrid', {}, { destroy: () => (firstDestroyed = true) });
            await asyncSetTimeout(0);

            let secondInitialised = false;
            api.setGridOption('viewportDatasource', {
                init: () => (secondInitialised = true),
                setViewportRange: () => {},
            });

            expect(firstDestroyed).toBe(true);
            expect(secondInitialised).toBe(true);
        });

        test('destroying the grid destroys the datasource', async () => {
            let destroyed = false;
            const { api } = createViewportGrid('myGrid', {}, { destroy: () => (destroyed = true) });
            await asyncSetTimeout(0);

            api.destroy();

            expect(destroyed).toBe(true);
        });

        test('warns when the datasource has no init method', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            try {
                gridsManager.createGrid('myGrid', {
                    columnDefs: [{ field: 'name' }],
                    rowModelType: 'viewport',
                    viewportDatasource: { setViewportRange: () => {} } as any,
                });
                expect(warn.mock.calls.flat().join(' ')).toContain('viewport is missing init method');
            } finally {
                warn.mockRestore();
            }
        });
    });

    // ---- range selection ---------------------------------------------------
    describe('range selection', () => {
        test('shift-click selects the contiguous rows between the anchor and the target', async () => {
            const { api } = createViewportGrid('myGrid', {
                // headerCheckbox is unsupported under the viewport row model (warns #129); the header
                // checkbox is irrelevant to this shift-click range-selection test, so disable it.
                rowSelection: { mode: 'multiRow', enableClickSelection: true, headerCheckbox: false },
            });
            await asyncSetTimeout(0);

            const actions = new GridActions(api, '#myGrid');
            actions.clickRowByIndex(1);
            actions.clickRowByIndex(3, { shiftKey: true });
            await asyncSetTimeout(0);

            const selectedIds = api
                .getSelectedRows()
                .map((row: any) => row.id)
                .sort();
            expect(selectedIds).toEqual(['1', '2', '3']);
        });
    });
});
