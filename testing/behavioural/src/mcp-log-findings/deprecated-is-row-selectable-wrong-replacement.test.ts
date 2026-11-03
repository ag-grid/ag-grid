/*
 * Issue: the deprecation warning for the top-level `isRowSelectable` grid option tells the user to use
 * `selectionOptions.isRowSelectable`, an option that does not exist anywhere in the API. Developers (and
 * coding agents) then search for the nonexistent option.
 *
 * Setup: ClientSideRowModelModule and RowSelectionModule registered, grid created with
 * `rowSelection: { mode: 'multiRow' }` and the deprecated top-level `isRowSelectable` option.
 *
 * Expected: the warning names the real replacement, `rowSelection.isRowSelectable`, as the JSDoc for the
 * option in gridOptions.ts states ("Use `rowSelection.isRowSelectable` instead").
 *
 * Actual: the message in validation/rules/gridOptionsValidations.ts says
 * "Use `selectionOptions.isRowSelectable` instead."
 *
 * Reported on: vanilla 33.2.3 to 34.2.0, Angular 35.1.0, React 35.0.0 to 35.1.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). Coding agents on vanilla JS (v33-34), Angular
 * and React (v35), between February and August 2026, ran several searches about deprecated rowSelection
 * options, including "isRowSelectable deprecated selectionOptions.isRowSelectable" and "deprecated
 * isRowSelectable grid option still supported as top-level GridOptions in v35 or only inside rowSelection
 * object".
 */
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';

describe('deprecated isRowSelectable grid option', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, RowSelectionModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    test('deprecation warning names rowSelection.isRowSelectable', () => {
        // The suite's dev validations throw diagnostics synchronously, so the deprecation surfaces as an error.
        let message = '';
        try {
            gridMgr.createGrid('is-row-selectable-deprecated', {
                columnDefs: [{ field: 'a' }],
                rowData: [{ a: 1 }],
                rowSelection: { mode: 'multiRow' },
                isRowSelectable: () => true,
            });
        } catch (e) {
            message = (e as Error).message;
        }

        expect(message).toContain('Use `rowSelection.isRowSelectable` instead.');
    });
});
