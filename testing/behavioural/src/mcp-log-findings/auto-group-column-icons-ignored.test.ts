/*
 * Issue: `icons` set on `autoGroupColumnDef` (e.g. `groupExpanded` / `groupContracted`) is ignored by the
 * group cell renderer. Only the grid-level `icons` option changes the expand / contract icons.
 *
 * Setup: RowGroupingModule and TreeDataModule registered, Client-Side Row Model, `treeData: true`,
 * `getDataPath`, and
 * `autoGroupColumnDef: { icons: { groupExpanded: '<b class="custom-expanded">-</b>', groupContracted: '<b class="custom-contracted">+</b>' } }`.
 *
 * Expected: `colDef.icons` is documented (colDef.ts) as "Icons to use inside the column instead of the
 * grid's default icons", and `_createIconNoSpan` checks the column's `icons` before the grid option, so
 * the group cell's expand / contract icons should use the column-level icons.
 *
 * Actual: the group cell renderer (groupCellRendererCtrl.ts setupExpand) calls
 * `_createIconNoSpan(iconName, beans, null)` with no column, so the column-level icons are never
 * consulted and the default icons are rendered.
 *
 * Reported on grid version: Angular 33.3.2.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on Angular 33.3.2 searched, in
 * July 2026, "treeData groupContracted groupExpanded autoGroupColumnDef icons not applied" and
 * "group cell renderer icon overrides tree data collapsed expanded icon and suppress expand collapse".
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

describe('autoGroupColumnDef icons', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, TreeDataModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    test('colDef.icons on the auto group column are used for the expand / contract icons', async () => {
        await gridsManager.createGridAndWait('autoGroupIcons', {
            columnDefs: [{ field: 'name' }],
            rowData: [
                { path: ['Europe'], name: 'Europe' },
                { path: ['Europe', 'France'], name: 'France' },
            ],
            treeData: true,
            getDataPath: (data: any) => data.path,
            autoGroupColumnDef: {
                icons: {
                    groupExpanded: '<b class="custom-expanded">-</b>',
                    groupContracted: '<b class="custom-contracted">+</b>',
                },
            },
        });

        await waitFor(() => {
            expect(document.querySelector('.ag-group-contracted')).not.toBeNull();
        });
        expect(document.querySelector('.ag-group-contracted .custom-contracted')).not.toBeNull();
        expect(document.querySelector('.ag-group-expanded .custom-expanded')).not.toBeNull();
    });
});
