import { waitFor } from '@testing-library/dom';
import { GridRows, TestGridsManager, waitForEvent } from 'ag-test-utils';
import { asyncSetTimeout } from 'ag-test-utils/node-utils';

import type { GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

/**
 * Characterization (golden-master) tests pinning the CURRENT behaviour of the
 * SSRM cache/loading configuration knobs:
 *   - serverSideInitialRowCount
 *   - cacheOverflowSize
 *   - blockLoadDebounceMillis
 *   - maxConcurrentDatasourceRequests
 *
 * These pin whatever the grid does today (bugs included) so that any future
 * change to cache/loading mechanics surfaces as a deliberate snapshot update
 * rather than a silent behavioural drift. They do NOT assert on any "ideal"
 * value — the asserted numbers were adopted from the actual runtime output.
 *
 * House style: setup is inline per test (no shared datasource factory) so each
 * test reads top-to-bottom; the request stream is recorded with a plain array
 * push. RowNode objects are never asserted directly (that crashes the reporter
 * on failure) — only booleans and counts.
 */
describe('SSRM cache config', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('serverSideInitialRowCount pre-populates filler rows before the first block resolves', async () => {
        const totalRows = 500;
        const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: i, value: `Row ${i}` }));

        // Deferred datasource: stash the params so the first block stays in-flight
        // and we can observe the pre-load display state.
        const pending: IServerSideGetRowsParams[] = [];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            serverSideInitialRowCount: 42,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    pending.push(params);
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);

        // Before any block resolves the grid sizes itself to the configured
        // initial row count — 42 filler rows are displayed. Gate on the initial block
        // having been dispatched (pending goes 0 -> 1) rather than on a fixed delay.
        await waitFor(() => {
            expect(pending.length).toBe(1);
            expect(api.getDisplayedRowCount()).toBe(42);
        });

        // Register the listener BEFORE draining — success() dispatches modelUpdated
        // synchronously, so attaching after would miss it and hang.
        const modelUpdated = waitForEvent('modelUpdated', api);
        // Drain the in-flight request(s) with the real slice + true row count.
        for (let i = 0, len = pending.length; i < len; ++i) {
            const request = pending[i].request;
            const slice = rowData.slice(request.startRow!, request.endRow!);
            pending[i].success({ rowData: slice, rowCount: totalRows });
        }
        await modelUpdated;

        // Once the real row count arrives the display count reflects it.
        expect(api.getDisplayedRowCount()).toBe(totalRows);
    });

    test('cacheOverflowSize lets the model extend past the known rows so more can be scrolled into', async () => {
        // With cacheOverflowSize the grid does not yet know the true row count
        // and pads the model by up to N extra rows so the user can scroll beyond
        // the last loaded block. The datasource deliberately never returns a
        // rowCount, forcing the "infinite / unknown total" branch.
        const knownRows = 100;
        const rowData = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `Row ${i}` }));
        const requests: [number, number][] = [];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            cacheOverflowSize: 5,
            rowBuffer: 0,
            suppressRowVirtualisation: false,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    requests.push([params.request.startRow!, params.request.endRow!]);
                    // Return a full block but NEVER a rowCount, so the total stays
                    // unknown and the overflow padding is what governs the model size.
                    const slice = rowData.slice(params.request.startRow!, params.request.startRow! + knownRows);
                    params.success({ rowData: slice });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        // One block of real rows is loaded; because the total is unknown the model
        // is padded so the last row is not yet reached and the next block stays
        // reachable by scrolling. Pinned behaviour: the padding adds exactly ONE
        // extra (filler) row here, NOT cacheOverflowSize (5) rows — cacheOverflowSize
        // caps how far ahead blocks may be created, it is not a straight row pad.
        expect(api.getDisplayedRowCount()).toBe(knownRows + 1);
        expect(requests).toEqual([[0, 100]]);
    });

    test('blockLoadDebounceMillis coalesces rapid scroll-driven block loads within the debounce window', async () => {
        const totalRows = 2000;
        const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: i, value: `Row ${i}` }));
        const requests: [number, number][] = [];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            // The debounce is what this test measures, so it asks for a small one rather than out-waiting the
            // 200ms a real app would use: an un-debounced load is issued ~5ms after the hop, so 60ms separates
            // the two outcomes just as well.
            blockLoadDebounceMillis: 60,
            rowBuffer: 0,
            suppressRowVirtualisation: false,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    requests.push([params.request.startRow!, params.request.endRow!]);
                    const slice = rowData.slice(params.request.startRow!, params.request.endRow!);
                    params.success({ rowData: slice, rowCount: totalRows });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);
        const requestsAfterInitial = requests.length;

        // Rapidly hop through several distant viewports. Each hop targets a block
        // that would otherwise be fetched immediately; the debounce window should
        // suppress the intermediate loads.
        api.ensureIndexVisible(500);
        api.ensureIndexVisible(1000);
        api.ensureIndexVisible(1500);
        // The block to load is derived from the rendered viewport, which the scroll updates synchronously, so
        // pin that the hops arrived: a failure here says the viewport never moved, not that a load was lost.
        expect(api.getRenderedNodes().map((node) => node.rowIndex)).toContain(1500);

        // Sample the request count while still inside the debounce window: the
        // intermediate blocks have NOT been fetched yet. This is a negative assertion —
        // waitFor cannot express "no request has been issued", so the delay IS the
        // observation window and must stay. It sits between the two outcomes, so a
        // timer that never fires early cannot make it flaky, only less strict.
        // eslint-disable-next-line no-restricted-syntax -- observation window inside blockLoadDebounceMillis
        await asyncSetTimeout(20);
        const requestsDuringWindow = requests.length - requestsAfterInitial;
        expect(requestsDuringWindow).toBe(0);

        // After the debounce window elapses the (final) block load fires. Poll the
        // recorded request stream directly rather than a fixed sleep or a modelUpdated
        // event — the event can race with viewport rendering on a congested CI box,
        // whereas a new request is exactly the observable this test asserts on.
        // The cap bounds the failure only, so it is sized for a shared CI core.
        await waitFor(() => expect(requests.length).toBeGreaterThan(requestsAfterInitial), { timeout: 8000 });
        const blocksAfterWindow = requests.slice(requestsAfterInitial);
        expect(blocksAfterWindow.length).toBeGreaterThan(0);
        // The debounce coalesced the three rapid hops into far fewer than three
        // fetches — pin that it did not fetch every intermediate block.
        expect(blocksAfterWindow.length).toBeLessThan(3);
        // Name the blocks the hops passed through: only the final viewport is fetched.
        const startRows = blocksAfterWindow.map(([startRow]) => startRow);
        expect(startRows).not.toContain(500);
        expect(startRows).not.toContain(1000);
    });

    test('maxConcurrentDatasourceRequests caps how many getRows calls are in-flight at once', async () => {
        const totalRows = 2000;
        const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: i, value: `Row ${i}` }));

        // Deferred datasource: stash every params so nothing resolves. The number
        // of getRows invocations in-flight before any resolve == the concurrency cap.
        //
        // The cap only bites when several blocks are demanded at once, so we prime
        // a known row count (serverSideInitialRowCount) and use a tiny block size —
        // the initial viewport then spans several blocks, all queued together, and
        // the cap decides how many actually reach the datasource simultaneously.
        const pending: IServerSideGetRowsParams[] = [];

        function makeGrid(cap: number): void {
            const gridOptions: GridOptions = {
                columnDefs: [{ field: 'id' }, { field: 'value' }],
                rowModelType: 'serverSide',
                cacheBlockSize: 2,
                serverSideInitialRowCount: 500,
                maxConcurrentDatasourceRequests: cap,
                getRowId: (params) => String(params.data.id),
                serverSideDatasource: {
                    getRows: (params) => {
                        pending.push(params);
                    },
                },
            };
            gridsManager.createGrid(null, gridOptions);
        }

        function drain(): void {
            for (let i = 0, len = pending.length; i < len; ++i) {
                const request = pending[i].request;
                pending[i].success({ rowData: rowData.slice(request.startRow!, request.endRow!), rowCount: totalRows });
            }
        }

        // Cap of 1: only a single request may be in-flight at a time. Poll up to the cap rather than assert after a
        // fixed delay - a loaded machine may not have issued them all yet - then let any excess request surface.
        makeGrid(1);
        await waitFor(() => expect(pending.length).toBe(1));
        // Negative assertion: no SECOND request may appear. waitFor cannot express that, so
        // this delay is the observation window in which an over-cap request would surface.
        // The cap being off puts the next request ~2ms behind the first, so 15ms is window enough.
        // eslint-disable-next-line no-restricted-syntax -- observation window for an over-cap concurrent getRows
        await asyncSetTimeout(15);
        expect(pending.length).toBe(1);

        drain();
        gridsManager.reset();
        pending.length = 0;

        // Cap of 2: exactly two requests may be in-flight simultaneously.
        makeGrid(2);
        await waitFor(() => expect(pending.length).toBe(2));
        // eslint-disable-next-line no-restricted-syntax -- observation window for an over-cap concurrent getRows
        await asyncSetTimeout(15);
        expect(pending.length).toBe(2);

        drain();
    });

    test('serverSideInitialRowCount filler rows render as stubs in the row model', async () => {
        const totalRows = 500;
        const pending: IServerSideGetRowsParams[] = [];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            serverSideInitialRowCount: 3,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    pending.push(params);
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);

        // The initial rows are filler/stub rows awaiting their block. Pin the
        // pre-load model shape via GridRows — which retries internally, so no sleep
        // is needed for the grid to reach the pre-load state.
        await new GridRows(api, 'ssrm initial row count before load').check(`
            ROOT id:<no-id>
            ├── filler id:rowIndex:0
            ├── filler id:rowIndex:1
            └── filler id:rowIndex:2
        `);

        // Drain the in-flight request so the deferred datasource does not leak past
        // the test; afterEach handles final teardown.
        const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: i, value: `Row ${i}` }));
        for (let i = 0, len = pending.length; i < len; ++i) {
            const request = pending[i].request;
            pending[i].success({ rowData: rowData.slice(request.startRow!, request.endRow!), rowCount: totalRows });
        }
    });
});
