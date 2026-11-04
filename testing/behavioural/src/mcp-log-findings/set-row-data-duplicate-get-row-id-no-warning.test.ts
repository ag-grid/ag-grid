/*
 * Issue: With the Client-Side Row Model and `getRowId`, if rowData is replaced after the initial load
 * (the delta / immutable update path) and two rows return the same id, the grid logs no duplicate id
 * warning. The two rows are silently merged into one node, so one row is dropped without any feedback.
 *
 * Setup: ClientSideRowModelModule, `getRowId` returning `data.id`, initial rowData with unique ids, then
 * `api.setGridOption('rowData', ...)` with a new array in which the id 'a' appears twice.
 *
 * Expected: warning #2 "Duplicate node id `a` detected from `getRowId` callback, this could cause issues in
 * your grid." (the getRowId docs say ids must be unique, and warning #2 exists to report duplicates, as it
 * does for duplicates on the initial load and in transaction adds).
 *
 * Actual: no warning is logged; the existing node is looked up by id and updated for each duplicate.
 *
 * Reported on: react 34.2.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on React 34.2.0 (August 2026)
 * searched "duplicate node id getRowId same id rows ignored".
 */
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';

// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('CSRM setting rowData with a duplicate getRowId id', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test('warns about a duplicate node id when rowData is replaced', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api = gridsManager.createGrid(null, {
            getRowId: (params) => params.data.id,
            rowData: [{ id: 'a' }],
        });

        // In the test environment grid warnings are thrown as errors, so capture either form.
        const messages: string[] = [];
        try {
            api.setGridOption('rowData', [{ id: 'a' }, { id: 'a' }]);
        } catch (e) {
            messages.push(String((e as Error).message));
        }
        messages.push(...warn.mock.calls.map((args) => args.join(' ')));

        expect(messages.some((m) => /Duplicate node id `a` detected from `getRowId`/.test(m))).toBe(true);
    });
});
