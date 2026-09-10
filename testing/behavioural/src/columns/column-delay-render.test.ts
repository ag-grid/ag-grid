import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import type { ColDef, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    ExternalFilterModule,
    GridStateModule,
    NumberFilterModule,
    PaginationModule,
    QuickFilterModule,
} from 'ag-grid-community';
import { AdvancedFilterModule, RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import type { HideClassRecorder } from './column-delay-render-utils';
import { isHidden, recordHideClassMutations } from './column-delay-render-utils';

const rowData = [
    { a: 'a0', b: 'b0' },
    { a: 'a1', b: 'b1' },
];

describe('Column delay render', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnAutoSizeModule, GridStateModule],
    });

    let recorder: HideClassRecorder;

    beforeAll(() => {
        // The hide/reveal cycle is driven by measured viewport width, which happy-dom reports as 0.
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
    });

    beforeEach(() => {
        recorder = recordHideClassMutations();
    });

    afterEach(() => {
        recorder.stop();
        gridsManager.reset();
    });

    describe('colFlex requester', () => {
        test('hides then reveals a flex grid', async () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', flex: 1 }, { colId: 'b' }],
                rowData,
            });

            await asyncSetTimeout(0);

            expect(recorder.events).toEqual(['add', 'remove']);
            expect(isHidden()).toBe(false);
        });

        test('never hides a grid with no flex columns', async () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData,
            });

            await asyncSetTimeout(0);

            expect(recorder.events).toEqual([]);
            expect(isHidden()).toBe(false);
        });

        test('reveals when flex is removed before any flexing happened', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', flex: 1 }, { colId: 'b' }],
                rowData,
            });

            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }]);
            await asyncSetTimeout(0);

            expect(isHidden()).toBe(false);
        });
    });

    describe('columnState requester', () => {
        test('hides then reveals when initial column state is applied', async () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData,
                initialState: { columnSizing: { columnSizingModel: [{ colId: 'a', width: 200 }] } },
            });

            await asyncSetTimeout(0);

            expect(recorder.events).toEqual(['add', 'remove']);
            expect(isHidden()).toBe(false);
        });

        test('never hides when initial state has no column state', async () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData,
                initialState: { scroll: { top: 0, left: 0 } },
            });

            await asyncSetTimeout(0);

            expect(recorder.events).toEqual([]);
        });
    });

    describe('autoSizeStrategy requesters', () => {
        test('fitGridWidth hides then reveals', async () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData,
                autoSizeStrategy: { type: 'fitGridWidth' },
            });

            await asyncSetTimeout(0);

            expect(recorder.events).toEqual(['add', 'remove']);
            expect(isHidden()).toBe(false);
        });

        test('fitProvidedWidth hides then reveals', async () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData,
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 400 },
            });

            await asyncSetTimeout(0);

            expect(recorder.events).toEqual(['add', 'remove']);
            expect(isHidden()).toBe(false);
        });

        test('fitCellContents hides then reveals when row data is present', async () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData,
                autoSizeStrategy: { type: 'fitCellContents' },
            });

            // The reveal waits on firstDataRendered plus a further tick, so it lands after the hide.
            await waitFor(() => expect(recorder.events).toEqual(['add', 'remove']));
            expect(isHidden()).toBe(false);
        });

        test('fitCellContents never hides when there is no row data', async () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData: [],
                autoSizeStrategy: { type: 'fitCellContents' },
            });

            await asyncSetTimeout(0);

            expect(recorder.events).toEqual([]);
            expect(isHidden()).toBe(false);
        });
    });

    describe('multiple requesters', () => {
        test('a reveal from a requester that never hid does not strip the hide', async () => {
            // GridStateModule reveals 'columnState' on newColumnsLoaded whether or not it hid anything,
            // and that reveal lands before the autosize hide. If the unmatched reveal counted, it would
            // mark the grid revealed and the autosize hide below would silently do nothing.
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData,
                autoSizeStrategy: { type: 'fitCellContents' },
            });

            expect(recorder.events).toEqual(['add']);

            await waitFor(() => expect(recorder.events).toEqual(['add', 'remove']));
            expect(isHidden()).toBe(false);
        });

        test('hides once and reveals once when flex and column state both request', async () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', flex: 1 }, { colId: 'b' }],
                rowData,
                initialState: { columnSizing: { columnSizingModel: [{ colId: 'b', width: 200 }] } },
            });

            await asyncSetTimeout(0);

            expect(recorder.events).toEqual(['add', 'remove']);
            expect(isHidden()).toBe(false);
        });
    });

    describe('zero displayed rows (AG-18472)', () => {
        // Own manager: the filter modules must not join the file-level module set, which the
        // hide/reveal ordering of the tests above depends on.
        const filterGridsManager = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                ColumnAutoSizeModule,
                GridStateModule,
                NumberFilterModule,
                QuickFilterModule,
            ],
        });

        afterEach(() => {
            filterGridsManager.reset();
        });

        const filterAllRowsOut: GridOptions = {
            columnDefs: [{ colId: 'value', field: 'value', filter: 'agNumberColumnFilter' }],
            rowData: [{ value: 1 }, { value: 2 }, { value: 3 }],
            initialState: {
                filter: { filterModel: { value: { filterType: 'number', type: 'equals', filter: 99 } } },
            },
        };

        test('fitCellContents reveals when an initial filter matches no rows', async () => {
            const api = filterGridsManager.createGrid('myGrid', {
                ...filterAllRowsOut,
                autoSizeStrategy: { type: 'fitCellContents' },
            });

            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(0));
            // eslint-disable-next-line no-restricted-syntax -- window in which a late reveal would arrive
            await asyncSetTimeout(50);

            expect(recorder.events).toEqual(['add', 'remove']);
            expect(isHidden()).toBe(false);
            expect(document.querySelectorAll('.ag-header-cell').length).toBeGreaterThan(0);
        });

        test('fitGridWidth reveals when an initial filter matches no rows', async () => {
            const api = filterGridsManager.createGrid('myGrid', {
                ...filterAllRowsOut,
                autoSizeStrategy: { type: 'fitGridWidth' },
            });

            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(0));
            // eslint-disable-next-line no-restricted-syntax -- window in which a late reveal would arrive
            await asyncSetTimeout(50);

            expect(recorder.events).toEqual(['add', 'remove']);
            expect(isHidden()).toBe(false);
            expect(document.querySelectorAll('.ag-header-cell').length).toBeGreaterThan(0);
        });

        test('fitProvidedWidth reveals when an initial filter matches no rows', async () => {
            const api = filterGridsManager.createGrid('myGrid', {
                ...filterAllRowsOut,
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 400 },
            });

            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(0));
            // eslint-disable-next-line no-restricted-syntax -- window in which a late reveal would arrive
            await asyncSetTimeout(50);

            expect(recorder.events).toEqual(['add', 'remove']);
            expect(isHidden()).toBe(false);
            expect(document.querySelectorAll('.ag-header-cell').length).toBeGreaterThan(0);
        });

        test('fitCellContents reveals when an initial quick filter matches no rows', async () => {
            const api = filterGridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'value', field: 'value' }],
                rowData: [{ value: 1 }, { value: 2 }, { value: 3 }],
                quickFilterText: 'no-such-value',
                autoSizeStrategy: { type: 'fitCellContents' },
            });

            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(0));
            // eslint-disable-next-line no-restricted-syntax -- window in which a late reveal would arrive
            await asyncSetTimeout(50);

            expect(recorder.events).toEqual(['add', 'remove']);
            expect(isHidden()).toBe(false);
            expect(document.querySelectorAll('.ag-header-cell').length).toBeGreaterThan(0);
        });

        test('fitCellContents stays revealed and renders rows once the filter is cleared', async () => {
            const api = filterGridsManager.createGrid('myGrid', {
                ...filterAllRowsOut,
                autoSizeStrategy: { type: 'fitCellContents' },
            });

            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(0));
            api.setFilterModel(null);

            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(3));
            expect(isHidden()).toBe(false);
        });
    });

    describe('residual zero-render routes (AG-18472)', () => {
        // Own manager: these routes need the filter, grouping, tree-data, pagination and advanced-filter
        // modules, which must not join the file-level module set the ordering tests above depend on.
        const routeGridsManager = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                ColumnAutoSizeModule,
                GridStateModule,
                ExternalFilterModule,
                NumberFilterModule,
                PaginationModule,
                RowGroupingModule,
                TreeDataModule,
                AdvancedFilterModule,
            ],
        });

        afterEach(() => {
            routeGridsManager.reset();
        });

        const numberFilterCol: ColDef = { colId: 'value', field: 'value', filter: 'agNumberColumnFilter' };
        const threeRows = [{ value: 1 }, { value: 2 }, { value: 3 }];
        const matchesNothing = {
            filter: { filterModel: { value: { filterType: 'number', type: 'equals', filter: 99 } } },
        };
        const fitCellContents = { type: 'fitCellContents' } as const;

        /** A reveal seen inside this window is a real reveal, not the service's 1000ms fail-safe. */
        const REVEAL_WINDOW_MS = 100;

        async function expectFastReveal(api: { getDisplayedRowCount: () => number }, expectedRows = 0) {
            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(expectedRows));
            await asyncSetTimeout(REVEAL_WINDOW_MS);
            expect(recorder.events).toEqual(['add', 'remove']);
            expect(isHidden()).toBe(false);
            expect(document.querySelectorAll('.ag-header-cell').length).toBeGreaterThan(0);
        }

        test('A: an external filter excluding every row reveals', async () => {
            const api = routeGridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'value', field: 'value' }],
                rowData: threeRows,
                isExternalFilterPresent: () => true,
                doesExternalFilterPass: () => false,
                autoSizeStrategy: fitCellContents,
            });

            await expectFastReveal(api);
        });

        test('B: row grouping with a filter matching no rows reveals', async () => {
            const api = routeGridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', field: 'group', rowGroup: true }, numberFilterCol],
                rowData: [
                    { group: 'g1', value: 1 },
                    { group: 'g2', value: 2 },
                ],
                initialState: matchesNothing,
                autoSizeStrategy: fitCellContents,
            });

            await expectFastReveal(api);
        });

        test('C: tree data with a filter matching no rows reveals', async () => {
            const api = routeGridsManager.createGrid('myGrid', {
                columnDefs: [numberFilterCol],
                rowData: [
                    { path: ['a'], value: 1 },
                    { path: ['a', 'b'], value: 2 },
                ],
                treeData: true,
                getDataPath: (data: any) => data.path,
                initialState: matchesNothing,
                autoSizeStrategy: fitCellContents,
            } as GridOptions);

            await expectFastReveal(api);
        });

        test('D: continuous fitCellContents with a filter matching no rows reveals', async () => {
            const api = routeGridsManager.createGrid('myGrid', {
                columnDefs: [numberFilterCol],
                rowData: threeRows,
                initialState: matchesNothing,
                autoSizeStrategy: { type: 'fitCellContents', continuous: true },
            });

            await expectFastReveal(api);
        });

        test('F: pagination with a filter matching no rows reveals', async () => {
            const api = routeGridsManager.createGrid('myGrid', {
                columnDefs: [numberFilterCol],
                rowData: threeRows,
                pagination: true,
                paginationPageSize: 20,
                initialState: matchesNothing,
                autoSizeStrategy: fitCellContents,
            });

            await expectFastReveal(api);
        });

        test('G: an advanced filter matching no rows reveals', async () => {
            const api = routeGridsManager.createGrid('myGrid', {
                columnDefs: [numberFilterCol],
                rowData: threeRows,
                enableAdvancedFilter: true,
                initialState: {
                    filter: {
                        advancedFilterModel: {
                            filterType: 'number',
                            colId: 'value',
                            type: 'equals',
                            filter: 99,
                        },
                    },
                },
                autoSizeStrategy: fitCellContents,
            } as GridOptions);

            await expectFastReveal(api);
        });

        test('H: a grand total row with a filter that matches no rows reveals', async () => {
            // A grand total row would keep `getRowCount()` above zero and so bypass the empty-model
            // reveal; it is dropped along with the groups, leaving nothing displayed.
            const api = routeGridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', field: 'group', rowGroup: true }, numberFilterCol],
                rowData: [
                    { group: 'g1', value: 1 },
                    { group: 'g2', value: 2 },
                ],
                grandTotalRow: 'bottom',
                initialState: matchesNothing,
                autoSizeStrategy: fitCellContents,
            } as GridOptions);

            await expectFastReveal(api);
        });
    });

    describe('E: zero-height viewport with rows present', () => {
        // A viewport with no height is the one shape where rows exist — so `getRowCount() > 0` and the
        // empty-model reveal never applies — yet nothing obviously has to render. The row renderer's
        // buffer renders rows anyway, so `firstDataRendered` still fires.
        const zeroHeightGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, ColumnAutoSizeModule, GridStateModule],
        });

        beforeEach(() => {
            mockGridLayout.gridHeight = 0;
        });

        afterEach(() => {
            mockGridLayout.resetOptions();
            mockGridLayout.useRealOffsetDimensions = true;
            zeroHeightGridsManager.reset();
        });

        test('reveals even though the viewport has no height to render into', async () => {
            const api = zeroHeightGridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
                autoSizeStrategy: { type: 'fitCellContents' },
            });

            // Well inside the delay-render service's 1000ms fail-safe, so this is a real reveal.
            // eslint-disable-next-line no-restricted-syntax -- window in which a real reveal would arrive
            await asyncSetTimeout(100);

            expect(api.getRenderedNodes().length).toBeGreaterThan(0);
            expect(recorder.events).toEqual(['add', 'remove']);
            expect(isHidden()).toBe(false);
        });
    });

    describe('centre viewport with no space to flex', () => {
        let originalGridWidth: number;

        beforeAll(() => {
            originalGridWidth = mockGridLayout.gridWidth;
            mockGridLayout.gridWidth = 600;
        });

        afterAll(() => {
            mockGridLayout.gridWidth = originalGridWidth;
        });

        test('reveals when pinned columns are wider than the viewport', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'p1', pinned: 'left', width: 300 },
                { colId: 'p2', pinned: 'left', width: 300 },
                { colId: 'p3', pinned: 'left', width: 300 },
                { colId: 'c1', flex: 1 },
            ];

            gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
                processUnpinnedColumns: () => [],
            } as GridOptions);

            await asyncSetTimeout(0);

            expect(isHidden()).toBe(false);
            expect(document.querySelectorAll('.ag-header-cell').length).toBeGreaterThan(0);
        });
    });
});
