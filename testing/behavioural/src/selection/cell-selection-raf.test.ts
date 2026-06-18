import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { CellSpanModule, ClientSideRowModelModule, RenderApiModule } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, waitForEvent } from '../test-utils';

describe('Cell Selection RAF Deduplication', () => {
    let consoleWarnSpy: MockInstance;
    let rafSpy: MockInstance;

    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, RenderApiModule],
    });

    async function createGrid(go: GridOptions): Promise<GridApi> {
        const api = gridMgr.createGrid('myGrid', go);

        await waitForEvent('firstDataRendered', api);
        await asyncSetTimeout(0);

        return api;
    }

    const columnDefs = [{ field: 'name' }, { field: 'value' }];
    const rowData = [
        { name: 'a', value: 1 },
        { name: 'b', value: 2 },
        { name: 'c', value: 3 },
        { name: 'd', value: 4 },
    ];

    beforeEach(() => {
        gridMgr.reset();
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridMgr.reset();
        consoleWarnSpy.mockRestore();
        rafSpy?.mockRestore();
    });

    test('repeated refreshCells does not accumulate RAF callbacks when cell selection is active', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
        });
        await new GridColumns(
            api,
            `repeated refreshCells does not accumulate RAF callbacks when cell selection is a setup`
        ).checkColumns(`
            CENTER
            ├── name "Name" width:200
            └── value "Value" width:200
        `);
        await new GridRows(
            api,
            `repeated refreshCells does not accumulate RAF callbacks when cell selection is a setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"a" value:1
            ├── LEAF id:1 name:"b" value:2
            ├── LEAF id:2 name:"c" value:3
            └── LEAF id:3 name:"d" value:4
        `);

        // Add a cell range so the range feature is active on cells
        api.addCellRange({
            columns: ['name', 'value'],
            rowStartIndex: 0,
            rowEndIndex: 3,
        });
        await asyncSetTimeout(0);

        // Spy on requestAnimationFrame to count scheduling calls.
        // Using a non-executing spy so callbacks are queued but never fire,
        // simulating a hidden tab where RAF callbacks accumulate.
        let rafId = 1000;
        rafSpy = vitest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => ++rafId);

        const rafCountBefore = rafSpy.mock.calls.length;

        // Call refreshCells many times to simulate rapid updates (e.g. backgrounded tab)
        for (let i = 0; i < 20; i++) {
            api.refreshCells({ force: true, suppressFlash: true });
        }

        const rafScheduled = rafSpy.mock.calls.length - rafCountBefore;

        // With deduplication, the number of RAF calls should be bounded to at most
        // one per CellRangeFeature instance (8 cells in the range).
        // Without the fix, we'd see 20 * 8 = 160 RAF calls.
        expect(rafScheduled).toBeLessThanOrEqual(8);
        await new GridRows(
            api,
            `repeated refreshCells does not accumulate RAF callbacks when cell selection is a final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"a" value:1
            ├── LEAF id:1 name:"b" value:2
            ├── LEAF id:2 name:"c" value:3
            └── LEAF id:3 name:"d" value:4
        `);
    });

    test('scheduled range refresh resets after RAF fires allowing new scheduling', async () => {
        const api = await createGrid({
            columnDefs,
            rowData,
            cellSelection: true,
        });
        await new GridColumns(api, `scheduled range refresh resets after RAF fires allowing new scheduling setup`)
            .checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── value "Value" width:200
            `);
        await new GridRows(api, `scheduled range refresh resets after RAF fires allowing new scheduling setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"a" value:1
                ├── LEAF id:1 name:"b" value:2
                ├── LEAF id:2 name:"c" value:3
                └── LEAF id:3 name:"d" value:4
            `
        );

        api.addCellRange({
            columns: ['name', 'value'],
            rowStartIndex: 0,
            rowEndIndex: 1,
        });
        await asyncSetTimeout(0);

        // Capture callbacks instead of executing them
        const rafCallbacks: FrameRequestCallback[] = [];
        let rafId = 2000;
        rafSpy = vitest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            rafCallbacks.push(cb);
            return ++rafId;
        });

        // First batch of refreshCells
        api.refreshCells({ force: true, suppressFlash: true });
        const firstBatchCount = rafCallbacks.length;
        expect(firstBatchCount).toBeGreaterThan(0);

        // Execute all pending RAF callbacks (simulates frame firing when tab becomes visible)
        for (const cb of [...rafCallbacks]) {
            cb(performance.now());
        }
        rafCallbacks.length = 0;

        // Second batch — should be able to schedule again since the flags were reset
        api.refreshCells({ force: true, suppressFlash: true });

        expect(rafCallbacks.length).toBeGreaterThan(0);
        expect(rafCallbacks.length).toBe(firstBatchCount);
        await new GridRows(api, `scheduled range refresh resets after RAF fires allowing new scheduling final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"a" value:1
                ├── LEAF id:1 name:"b" value:2
                ├── LEAF id:2 name:"c" value:3
                └── LEAF id:3 name:"d" value:4
            `);
    });
});

describe('RowSpanService does not register listeners when enableCellSpan is not configured', () => {
    let consoleWarnSpy: MockInstance;
    let rafSpy: MockInstance;

    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSpanModule, CellSelectionModule, RenderApiModule],
    });

    beforeEach(() => {
        gridMgr.reset();
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridMgr.reset();
        consoleWarnSpy.mockRestore();
        rafSpy?.mockRestore();
    });

    const columnDefs = [{ field: 'name' }, { field: 'value' }];
    const rowData = [
        { name: 'a', value: 1 },
        { name: 'b', value: 2 },
        { name: 'c', value: 3 },
    ];

    test('data updates with cell selection do not accumulate RAF callbacks without enableCellSpan', async () => {
        const api = gridMgr.createGrid('myGrid', {
            columnDefs,
            rowData,
            cellSelection: true,
            getRowId: (params) => params.data.name,
        });
        await new GridColumns(
            api,
            `data updates with cell selection do not accumulate RAF callbacks without enableC setup`
        ).checkColumns(`
            CENTER
            ├── name "Name" width:200
            └── value "Value" width:200
        `);
        await new GridRows(
            api,
            `data updates with cell selection do not accumulate RAF callbacks without enableC setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a name:"a" value:1
            ├── LEAF id:b name:"b" value:2
            └── LEAF id:c name:"c" value:3
        `);

        await waitForEvent('firstDataRendered', api);
        await asyncSetTimeout(0);

        // Add a cell range to activate the range feature
        api.addCellRange({
            columns: ['name', 'value'],
            rowStartIndex: 0,
            rowEndIndex: 2,
        });
        await asyncSetTimeout(0);

        // Spy on RAF — don't execute callbacks (simulates hidden tab)
        let rafId = 3000;
        rafSpy = vitest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => ++rafId);

        // Simulate the real-world scenario: repeated data updates interleaved with
        // flushAllAnimationFrames (which happens during scroll/focus operations).
        // Each flush resets AnimationFrameService.ticking = false, allowing the
        // next spannedCellsUpdated cycle to schedule a fresh RAF — which then
        // accumulates because the old RAF is never cancelled.
        for (let i = 0; i < 10; i++) {
            api.applyTransaction({
                update: [{ name: 'a', value: i }],
            });
            // Allow debounced RowSpanService timeouts to dispatch spannedCellsUpdated
            await asyncSetTimeout(5);
            // Flush animation frame tasks (simulates what happens during scroll/focus)
            api.flushAllAnimationFrames();
        }

        const rafCount = rafSpy.mock.calls.length;

        // Without the RowSpanService fix, each flush+update cycle schedules a new RAF
        // via spannedCellsUpdated → updateColumnLists → AnimationFrameService, even when
        // no columns are spanning. This causes ~10+ orphaned RAFs.
        // With the fix, RowSpanService doesn't register listeners, so no extra RAFs accumulate.
        expect(rafCount).toBeLessThanOrEqual(5);
        await new GridRows(
            api,
            `data updates with cell selection do not accumulate RAF callbacks without enableC final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a name:"a" value:9
            ├── LEAF id:b name:"b" value:2
            └── LEAF id:c name:"c" value:3
        `);
    });

    test('data updates with enableCellSpan respond to span changes', async () => {
        let spanValue = 1;
        const api = gridMgr.createGrid('myGrid', {
            columnDefs: [
                { field: 'name' },
                {
                    field: 'value',
                    rowSpan: () => spanValue,
                },
            ],
            rowData,
            enableCellSpan: true,
            cellSelection: true,
            getRowId: (params) => params.data.name,
        });
        await new GridColumns(api, `data updates with enableCellSpan respond to span changes setup`).checkColumns(`
            CENTER
            ├── name "Name" width:200
            └── value "Value" width:200
        `);
        await new GridRows(api, `data updates with enableCellSpan respond to span changes setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a name:"a" value:1
            ├── LEAF id:b name:"b" value:2
            └── LEAF id:c name:"c" value:3
        `);

        await waitForEvent('firstDataRendered', api);
        await asyncSetTimeout(0);

        // Update data — with enableCellSpan active, RowSpanService should be processing events
        spanValue = 2;
        api.applyTransaction({
            update: [{ name: 'a', value: 999 }],
        });
        await new GridRows(api, `data updates with enableCellSpan respond to span changes after applyTransaction`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:a name:"a" value:999
                ├── LEAF id:b name:"b" value:2
                └── LEAF id:c name:"c" value:3
            `);

        // Allow RowSpanService timeouts and events to process
        await asyncSetTimeout(50);

        // The grid should not have errored — spans are being processed
        expect(api.getDisplayedRowCount()).toBe(3);
    });
});
