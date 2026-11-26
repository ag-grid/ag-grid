import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, waitForEvent } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridApi, GridOptions, IViewportDatasourceParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    PinnedRowModule,
    RowAutoHeightModule,
    ScrollApiModule,
} from 'ag-grid-community';
import { ServerSideRowModelModule, ViewportRowModelModule } from 'ag-grid-enterprise';

/**
 * A theme size parameter change reaches the grid as the internal `stylesChanged` event carrying
 * `rowHeightChanged`. The Client-Side Row Model has always re-applied the new uniform row height;
 * the Server-Side, Infinite and Viewport row models used to ignore it, so a theme change moved the
 * font size but left the rows at their old height (AG-13042).
 *
 * The organic path (a CSS custom property actually changing) cannot be exercised under happy-dom:
 * the grid's measurement element is detached there, so `Environment` never re-measures. These tests
 * therefore drive the same handler the theme code drives — the `stylesChanged` event — with the
 * measured default row height stubbed to the value the new theme would report.
 */

const NEW_ROW_HEIGHT = 64;
const SECOND_ROW_HEIGHT = 48;
const ROOT_ONLY_ROW_HEIGHT = 100;

/**
 * Simulates a theme size parameter change: the environment now measures `height` for the row-height
 * CSS variable, and the styles-changed event announces it.
 *
 * `beans` is `private readonly` on `RowNode`, so the cast is unavoidable — `stylesChanged` is an
 * internal event with no public API surface, and the grid's own theme code is what dispatches it.
 */
function applyThemeRowHeight(rowNode: unknown, height: number): void {
    const beans = (rowNode as any).beans;
    vi.spyOn(beans.environment, 'getDefaultRowHeight').mockReturnValue(height);
    beans.eventSvc.dispatchEvent({ type: 'stylesChanged', rowHeightChanged: true });
}

/** Asserts every displayed row is at `expectedHeight` and that the rows tile without gap or overlap. */
function expectUniformRowLayout(api: GridApi, expectedHeight: number): void {
    const count = api.getDisplayedRowCount();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
        const node = api.getDisplayedRowAtIndex(i);
        expect(node).toBeDefined();
        expect(node!.rowHeight).toBe(expectedHeight);
        expect(node!.rowTop).toBe(i * expectedHeight);
    }
}

const rowData = Array.from({ length: 10 }, (_, i) => ({ id: i, value: `Row ${i}` }));

describe('theme row height in virtualised row models', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            InfiniteRowModelModule,
            PinnedRowModule,
            RowAutoHeightModule,
            ScrollApiModule,
            ServerSideRowModelModule,
            ViewportRowModelModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    // ---- Server-Side Row Model --------------------------------------------

    describe('server-side row model', () => {
        function createSsrmGrid(overrides: Partial<GridOptions> = {}): GridApi {
            return gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'id' }, { field: 'value' }],
                rowModelType: 'serverSide',
                getRowId: (params) => String(params.data.id),
                serverSideDatasource: {
                    getRows: (params) => {
                        params.success({
                            rowData: rowData.slice(params.request.startRow, params.request.endRow),
                            rowCount: rowData.length,
                        });
                    },
                },
                ...overrides,
            });
        }

        async function createLoadedSsrmGrid(overrides: Partial<GridOptions> = {}): Promise<GridApi> {
            const api = createSsrmGrid(overrides);
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            return api;
        }

        test('row heights follow a theme row-height change', async () => {
            const api = await createLoadedSsrmGrid();

            const before = api.getDisplayedRowAtIndex(0)!.rowHeight!;
            expect(before).not.toBe(NEW_ROW_HEIGHT);

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), NEW_ROW_HEIGHT);
            await asyncSetTimeout(0);

            expectUniformRowLayout(api, NEW_ROW_HEIGHT);
        });

        test('a repeated theme change at the same height does not update the model', async () => {
            const api = await createLoadedSsrmGrid();

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), NEW_ROW_HEIGHT);
            await asyncSetTimeout(0);

            let modelUpdates = 0;
            api.addEventListener('modelUpdated', () => modelUpdates++);

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), NEW_ROW_HEIGHT);
            await asyncSetTimeout(0);

            expect(modelUpdates).toBe(0);
            expectUniformRowLayout(api, NEW_ROW_HEIGHT);
        });

        test('a theme change does not update the model while rowHeight is set', async () => {
            const api = await createLoadedSsrmGrid({ rowHeight: 30 });

            let modelUpdates = 0;
            api.addEventListener('modelUpdated', () => modelUpdates++);

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), NEW_ROW_HEIGHT);
            await asyncSetTimeout(0);

            expect(modelUpdates).toBe(0);
            expectUniformRowLayout(api, 30);
        });

        test('leaf heights follow a theme change when getRowHeight only answers for the root', async () => {
            const api = await createLoadedSsrmGrid({
                // The dummy root sits at level -1 and carries no data, so a callback shaped like this
                // pins the root's height while leaving every leaf on the theme-derived default.
                getRowHeight: (params) => (params.node.level === -1 ? ROOT_ONLY_ROW_HEIGHT : undefined),
            });

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), NEW_ROW_HEIGHT);
            await asyncSetTimeout(0);
            expectUniformRowLayout(api, NEW_ROW_HEIGHT);

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), SECOND_ROW_HEIGHT);
            await asyncSetTimeout(0);
            expectUniformRowLayout(api, SECOND_ROW_HEIGHT);
        });
    });

    // ---- Infinite Row Model ------------------------------------------------

    describe('infinite row model', () => {
        async function createLoadedInfiniteGrid(): Promise<GridApi> {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'id' }, { field: 'value' }],
                rowModelType: 'infinite',
                datasource: {
                    getRows: (params) => {
                        params.successCallback(rowData.slice(params.startRow, params.endRow), rowData.length);
                    },
                },
            });
            await waitForEvent('firstDataRendered', api);
            await asyncSetTimeout(0);
            return api;
        }

        test('row heights follow a theme row-height change', async () => {
            const api = await createLoadedInfiniteGrid();

            const node = api.getDisplayedRowAtIndex(0)!;
            expect(node.rowHeight).not.toBe(NEW_ROW_HEIGHT);

            applyThemeRowHeight(node, NEW_ROW_HEIGHT);
            await asyncSetTimeout(0);

            expectUniformRowLayout(api, NEW_ROW_HEIGHT);
        });

        test('the cache is told the new row height so later blocks match', async () => {
            const api = await createLoadedInfiniteGrid();
            const node = api.getDisplayedRowAtIndex(0)!;
            // `cacheParams` is internal state on the row model: it seeds the row height of blocks
            // loaded after the theme change, which has no public read-back.
            const rowModel = (node as any).beans.rowModel;

            applyThemeRowHeight(node, NEW_ROW_HEIGHT);
            await asyncSetTimeout(0);

            expect(rowModel.cacheParams.rowHeight).toBe(NEW_ROW_HEIGHT);
        });

        test('a repeated theme change at the same height does not update the model', async () => {
            const api = await createLoadedInfiniteGrid();

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), NEW_ROW_HEIGHT);
            await asyncSetTimeout(0);

            let modelUpdates = 0;
            api.addEventListener('modelUpdated', () => modelUpdates++);

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), NEW_ROW_HEIGHT);
            await asyncSetTimeout(0);

            expect(modelUpdates).toBe(0);
        });
    });

    // ---- Viewport Row Model ------------------------------------------------

    describe('viewport row model', () => {
        const ROW_COUNT = 500;

        beforeAll(() => {
            // The viewport model only keeps the rendered window, so it needs a genuinely virtualised
            // layout; happy-dom reports 0-sized elements, which would render every row.
            mockGridLayout.useRealOffsetDimensions = true;
        });

        afterAll(() => {
            mockGridLayout.resetOptions();
        });

        function createViewportGrid(): GridApi {
            let ds: IViewportDatasourceParams;

            return gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
                rowModelType: 'viewport',
                suppressRowVirtualisation: false,
                viewportRowModelPageSize: 10,
                viewportRowModelBufferSize: 5,
                getRowId: (params) => params.data.id,
                viewportDatasource: {
                    init: (params) => {
                        ds = params;
                        params.setRowCount(ROW_COUNT);
                    },
                    setViewportRange: (firstRow, lastRow) => {
                        const data: Record<number, { id: string; name: string }> = {};
                        for (let i = firstRow; i <= lastRow; i++) {
                            data[i] = { id: `${i}`, name: `name-${i}` };
                        }
                        ds.setRowData(data);
                    },
                },
            });
        }

        /** Checks the loaded nodes in `[first, last]` are uniform and tile without gap or overlap. */
        function expectLoadedRowsUniform(api: GridApi, first: number, last: number, expectedHeight: number): void {
            for (let i = first; i <= last; i++) {
                const node = api.getRowNode(`${i}`);
                expect(node).toBeDefined();
                expect(node!.rowHeight).toBe(expectedHeight);
                expect(node!.rowTop).toBe(i * expectedHeight);
            }
        }

        test('row heights follow a theme row-height change', async () => {
            const api = createViewportGrid();
            await asyncSetTimeout(0);

            const node = api.getRowNode('0')!;
            expect(node.rowHeight).not.toBe(NEW_ROW_HEIGHT);

            applyThemeRowHeight(node, NEW_ROW_HEIGHT);
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(ROW_COUNT);
            expectLoadedRowsUniform(api, 0, 5, NEW_ROW_HEIGHT);
        });
    });

    // ---- Client-Side Row Model (regression guard) --------------------------

    describe('client-side row model', () => {
        test('still re-lays-out rows on a theme row-height change', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'id' }, { field: 'value' }],
                rowData,
            });
            await waitForEvent('firstDataRendered', api);

            const node = api.getDisplayedRowAtIndex(0)!;
            expect(node.rowHeight).not.toBe(NEW_ROW_HEIGHT);

            applyThemeRowHeight(node, NEW_ROW_HEIGHT);
            await asyncSetTimeout(0);

            expectUniformRowLayout(api, NEW_ROW_HEIGHT);
        });

        // Auto height gives up before the rows off screen are rendered: they still take the new height then.
        test('a row off screen takes a theme change made while auto row height was active once auto height is gone', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'id' }, { field: 'value', autoHeight: true }],
                rowData: Array.from({ length: 200 }, (_, i) => ({ id: i, value: `Row ${i}` })),
                suppressRowVirtualisation: false,
            });
            await waitForEvent('firstDataRendered', api);
            const offScreen = api.getDisplayedRowAtIndex(150)!;
            expect(api.getRenderedNodes().map((n) => n.rowIndex)).not.toContain(150);

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), NEW_ROW_HEIGHT);
            await waitFor(() => expect(api.getDisplayedRowAtIndex(0)!.rowHeight).toBe(NEW_ROW_HEIGHT));
            api.setGridOption('columnDefs', [{ field: 'id' }, { field: 'value' }]);
            await asyncSetTimeout(0);

            api.ensureIndexVisible(150);
            await waitFor(() => expect(offScreen.rowHeight).toBe(NEW_ROW_HEIGHT));
        });

        // Auto height is documented as looking only at rendered rows, so the rest wait to be scrolled in.
        test('a row off screen keeps its height through a theme change while auto row height is active, and takes the new one once scrolled in', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'id' }, { field: 'value', autoHeight: true }],
                rowData: Array.from({ length: 200 }, (_, i) => ({ id: i, value: `Row ${i}` })),
                suppressRowVirtualisation: false,
            });
            await waitForEvent('firstDataRendered', api);

            const offScreen = api.getDisplayedRowAtIndex(150)!;
            const before = offScreen.rowHeight;
            expect(before).not.toBe(NEW_ROW_HEIGHT);
            expect(api.getRenderedNodes().map((n) => n.rowIndex)).not.toContain(150);

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), NEW_ROW_HEIGHT);
            await waitFor(() => expect(api.getDisplayedRowAtIndex(0)!.rowHeight).toBe(NEW_ROW_HEIGHT));

            expect(offScreen.rowHeight).toBe(before);

            api.ensureIndexVisible(150);
            await waitFor(() => expect(offScreen.rowHeight).toBe(NEW_ROW_HEIGHT));
        });
    });

    // ---- Auto row height ---------------------------------------------------

    // The configured height is the floor an auto-height row is held against, so a theme moving it moves every
    // row measuring less, and leaves a taller one at its content height.
    describe('with measured auto-height cells', () => {
        /** Row 0's and the pinned row's cell content: taller than the default and short heights, shorter than the new one. */
        const TALL_CONTENT = 50;
        const SHORT_ROW_HEIGHT = 30;
        const DEFAULT_ROW_HEIGHT = 42;

        beforeAll(() => {
            mockGridLayout.useRealOffsetDimensions = true;
            mockGridLayout.elementHeightOverride = (el) => {
                if (!el.classList.contains('ag-cell-wrapper') || !el.isConnected) {
                    return undefined;
                }
                const rowIndex = el.closest('.ag-row')?.getAttribute('row-index');
                return rowIndex === '0' || rowIndex === 't-0' ? TALL_CONTENT : 20;
            };
        });

        afterAll(() => {
            mockGridLayout.resetOptions();
        });

        const autoHeightColumnDefs = (autoHeight: boolean) => [{ field: 'id' }, { field: 'value', autoHeight }];

        const rowHeights = (api: GridApi) =>
            Array.from({ length: api.getDisplayedRowCount() }, (_, i) => api.getDisplayedRowAtIndex(i)!.rowHeight);

        /** Row 0 at `first`, every other row at `rest`. */
        const heights = (first: number, rest: number) => [first, ...rowData.slice(1).map(() => rest)];

        const createSsrmGrid = async (autoHeight: boolean): Promise<GridApi> => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: autoHeightColumnDefs(autoHeight),
                rowModelType: 'serverSide',
                getRowId: (params) => String(params.data.id),
                serverSideDatasource: {
                    getRows: (params) => {
                        params.success({
                            rowData: rowData.slice(params.request.startRow, params.request.endRow),
                            rowCount: rowData.length,
                        });
                    },
                },
            });
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            return api;
        };

        /** Both ways the configured height moves: a theme parameter, and the `rowHeight` grid option. */
        const ROW_HEIGHT_CHANGES = [
            [
                'a theme change',
                (api: GridApi, height: number) => applyThemeRowHeight(api.getDisplayedRowAtIndex(0), height),
            ],
            ['a rowHeight change', (api: GridApi, height: number) => api.setGridOption('rowHeight', height)],
        ] as const;

        test('client-side: a theme change moves the rows measuring less, and leaves a taller one, pinned rows included', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: autoHeightColumnDefs(true),
                rowData,
                pinnedTopRowData: [{ id: 'p', value: 'pinned' }],
            });
            const pinnedHeight = () => api.getPinnedTopRow(0)!.rowHeight;
            await waitFor(() => expect(rowHeights(api)).toEqual(heights(TALL_CONTENT, DEFAULT_ROW_HEIGHT)));
            await waitFor(() => expect(pinnedHeight()).toBe(TALL_CONTENT));

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), NEW_ROW_HEIGHT);
            await waitFor(() => expectUniformRowLayout(api, NEW_ROW_HEIGHT));
            await waitFor(() => expect(pinnedHeight()).toBe(NEW_ROW_HEIGHT));

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), SHORT_ROW_HEIGHT);
            await waitFor(() => expect(rowHeights(api)).toEqual(heights(TALL_CONTENT, SHORT_ROW_HEIGHT)));
            await waitFor(() => expect(pinnedHeight()).toBe(TALL_CONTENT));
        });

        test.each(ROW_HEIGHT_CHANGES)(
            'server-side: %s moves the rows measuring less, and leaves a taller one, without warning',
            async (_name, changeRowHeight) => {
                const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
                const api = await createSsrmGrid(true);
                await waitFor(() => expect(rowHeights(api)).toEqual(heights(TALL_CONTENT, DEFAULT_ROW_HEIGHT)));

                changeRowHeight(api, NEW_ROW_HEIGHT);
                await waitFor(() => expectUniformRowLayout(api, NEW_ROW_HEIGHT));

                changeRowHeight(api, SHORT_ROW_HEIGHT);
                await waitFor(() => expect(rowHeights(api)).toEqual(heights(TALL_CONTENT, SHORT_ROW_HEIGHT)));
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            }
        );

        test('server-side: a theme change made while auto row height is active still counts once it is gone', async () => {
            const api = await createSsrmGrid(false);

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), NEW_ROW_HEIGHT);
            await waitFor(() => expectUniformRowLayout(api, NEW_ROW_HEIGHT));

            api.setGridOption('columnDefs', autoHeightColumnDefs(true));
            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), DEFAULT_ROW_HEIGHT);
            await waitFor(() => expect(rowHeights(api)).toEqual(heights(TALL_CONTENT, DEFAULT_ROW_HEIGHT)));

            api.setGridOption('columnDefs', autoHeightColumnDefs(false));
            await waitFor(() => expectUniformRowLayout(api, DEFAULT_ROW_HEIGHT));

            applyThemeRowHeight(api.getDisplayedRowAtIndex(0), NEW_ROW_HEIGHT);
            await waitFor(() => expectUniformRowLayout(api, NEW_ROW_HEIGHT));
        });
    });
});
