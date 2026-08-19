import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import type { ColDef, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnAutoSizeModule, GridStateModule } from 'ag-grid-community';

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
