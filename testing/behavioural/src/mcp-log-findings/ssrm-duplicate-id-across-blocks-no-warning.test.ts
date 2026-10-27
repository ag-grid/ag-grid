/*
 * Issue: With the Server-Side Row Model and `getRowId`, if the datasource returns the same row id in two
 * different cache blocks, the grid logs no duplicate row id warning. Warning #205 only checks for
 * duplicates inside a single getRows response, so a duplicate spread over two blocks is silently accepted:
 * the existing node with that id is moved to the new index, which can leave selection on the wrong row.
 *
 * Setup: ServerSideRowModelModule, default lazy store, `cacheBlockSize` 5, `getRowId` returning `data.id`,
 * and a datasource where block 0 returns ids 0..4 and block 1 returns ids 5..8 plus a second row with id 0.
 * Both blocks are loaded.
 *
 * Expected: a duplicate row id warning (#205, "duplicate row ids ... were returned by the getRowId
 * callback"). getRowId docs say ids must be unique, and warning #205 exists to report duplicates.
 *
 * Actual: no warning is logged.
 *
 * Reported on: angular 34.0.2 and 35.3.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). Coding agents on Angular 34.0.2 (May 2026) and
 * 35.3.0 (September 2026) searched for the cause of wrong selection with SSRM, e.g. "getRowId duplicate
 * row id server-side row model selection wrong row" and "server side row model row selection getRowId
 * stable ids sorting duplicates selection persistence".
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('SSRM same row id in two blocks', () => {
    const gridsManager = new TestGridsManager({ modules: [ServerSideRowModelModule] });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test('warns about a duplicate row id across blocks', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const blockSize = 5;
        const requested: number[] = [];

        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }],
            rowModelType: 'serverSide',
            cacheBlockSize: blockSize,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    const start = params.request.startRow!;
                    requested.push(start);
                    const ids = Array.from({ length: blockSize }, (_, i) => start + i);
                    if (start === blockSize) {
                        ids[ids.length - 1] = 0; // id 0 is also in block 0
                    }
                    params.success({ rowData: ids.map((id) => ({ id })), rowCount: blockSize * 2 });
                },
            },
        });

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(blockSize * 2));
        await waitFor(() => expect(requested).toEqual(expect.arrayContaining([0, blockSize])));

        const messages = warn.mock.calls.map((args) => args.join(' '));
        expect(messages.some((m) => /duplicate row ids/.test(m))).toBe(true);
    });
});
