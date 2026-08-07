import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnAutoSizeModule, GridStateModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { asyncSetTimeout, ignoreConsoleLicenseKeyError } from '../test-utils';
import { mockGridLayout } from '../test-utils/polyfills/mockGridLayout';
import type { HideClassRecorder } from './column-delay-render-utils';
import { isHidden, recordHideClassMutations } from './column-delay-render-utils';

const rowData = [
    { a: 'a0', b: 'b0' },
    { a: 'a1', b: 'b1' },
];

/**
 * React drives the reveal differently from vanilla: it retries until the header cells report as
 * rendered, so the reveal does not land synchronously with the flex pass. These cases cover that
 * path, which the vanilla suite cannot reach.
 */
describe('Column delay render (React)', () => {
    let recorder: HideClassRecorder;

    function renderGrid(options: GridOptions): Promise<GridApi> {
        return new Promise<GridApi>((resolve) => {
            render(<AgGridReact {...options} onGridReady={(e) => resolve(e.api)} />);
        });
    }

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule, GridStateModule]);
        ignoreConsoleLicenseKeyError();
        // The hide/reveal cycle is driven by measured viewport width, which jsdom reports as 0. Unlike
        // the vanilla tests there is no TestGridsManager to install the layout mock, so do it here.
        mockGridLayout.init();
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
        cleanup();
    });

    test('hides then reveals a flex grid', async () => {
        await renderGrid({
            columnDefs: [{ colId: 'a', flex: 1 }, { colId: 'b' }],
            rowData,
        });

        // The reveal is deferred under React rather than landing with the flex pass, hence the poll.
        // The retry loop it goes through is covered in columnDelayRenderService.test.ts.
        await waitFor(() => expect(recorder.events).toEqual(['add', 'remove']));
        expect(isHidden()).toBe(false);
    });

    test('never hides a grid with no flex columns', async () => {
        await renderGrid({
            columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            rowData,
        });

        await asyncSetTimeout(0);

        expect(recorder.events).toEqual([]);
        expect(isHidden()).toBe(false);
    });

    test('reveals once the header cells have rendered, not before', async () => {
        await renderGrid({
            columnDefs: [{ colId: 'a', flex: 1 }, { colId: 'b' }],
            rowData,
        });

        await waitFor(() => expect(isHidden()).toBe(false));
        // The reveal must not outrun the header render, otherwise it defeats its own purpose.
        expect(document.querySelectorAll('.ag-header-cell').length).toBeGreaterThan(0);
    });

    test('hides then reveals for an autoSizeStrategy', async () => {
        await renderGrid({
            columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            rowData,
            autoSizeStrategy: { type: 'fitGridWidth' },
        });

        await waitFor(() => expect(recorder.events).toEqual(['add', 'remove']));
        expect(isHidden()).toBe(false);
    });

    test('a reveal from a requester that never hid does not strip the hide', async () => {
        await renderGrid({
            columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            rowData,
            autoSizeStrategy: { type: 'fitCellContents' },
        });

        await waitFor(() => expect(recorder.events).toEqual(['add', 'remove']));
        expect(isHidden()).toBe(false);
    });

    test('hides once and reveals once when flex and column state both request', async () => {
        await renderGrid({
            columnDefs: [{ colId: 'a', flex: 1 }, { colId: 'b' }],
            rowData,
            initialState: { columnSizing: { columnSizingModel: [{ colId: 'b', width: 200 }] } },
        });

        await waitFor(() => expect(recorder.events).toEqual(['add', 'remove']));
        expect(isHidden()).toBe(false);
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
            await renderGrid({
                columnDefs: [
                    { colId: 'p1', pinned: 'left', width: 300 },
                    { colId: 'p2', pinned: 'left', width: 300 },
                    { colId: 'p3', pinned: 'left', width: 300 },
                    { colId: 'c1', flex: 1 },
                ],
                rowData,
                processUnpinnedColumns: () => [],
            });

            await waitFor(() => expect(document.querySelectorAll('.ag-header-cell').length).toBeGreaterThan(0));
            expect(isHidden()).toBe(false);
        });
    });
});
