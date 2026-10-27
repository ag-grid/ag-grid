/*
 * Issue: with the Server-Side Row Model, setting `masterDetail: true` without registering
 * MasterDetailModule produces no "missing module" error. The grid then crashes when a master row is
 * expanded.
 *
 * Setup: ServerSideRowModelModule registered, MasterDetailModule not registered,
 * `rowModelType: 'serverSide'`, `masterDetail: true`.
 *
 * Expected: the `masterDetail` grid option is documented (gridOptions.ts JSDoc, @agModule) as needing
 * MasterDetailModule, every SSRM master detail docs example registers it, and
 * ServerSideRowModelModule does not depend on it. So creating the grid should report error #200 naming
 * MasterDetailModule, as it does on the Client-Side Row Model (the first test, which passes).
 *
 * Actual: the `masterDetail` rule in validation/rules/gridOptionsValidations.ts asks only for
 * 'ServerSideRowModel' when `rowModelType` is 'serverSide' (since AG-17050, first released in 35.3.0),
 * so nothing is reported. Expanding a master row then throws
 * "TypeError: Cannot read properties of undefined (reading 'newAgStackInstance')" because the detail
 * cell renderer was never registered.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on Vue 36.0.0 searched, in
 * September 2026, whether master detail works with the server-side row model ("master detail not
 * supported server-side row model restriction" and similar), then searched "masterDetail validation
 * error only supported with the client-side row model".
 */
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('masterDetail without MasterDetailModule', () => {
    // The suite's dev validations throw missing-module errors synchronously, so createGrid throws.
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, ServerSideRowModelModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    test('Client-Side Row Model reports MasterDetailModule as missing', () => {
        expect(() =>
            gridMgr.createGrid('csrm-md-no-module', {
                columnDefs: [{ field: 'id' }],
                masterDetail: true,
                rowData: [{ id: 'a' }],
            })
        ).toThrow(/#200.*MasterDetailModule/s);
    });

    test('Server-Side Row Model reports MasterDetailModule as missing', () => {
        expect(() =>
            gridMgr.createGrid('ssrm-md-no-module', {
                columnDefs: [{ field: 'id' }],
                rowModelType: 'serverSide',
                masterDetail: true,
                serverSideDatasource: { getRows: () => {} },
            })
        ).toThrow(/#200.*MasterDetailModule/s);
    });
});
