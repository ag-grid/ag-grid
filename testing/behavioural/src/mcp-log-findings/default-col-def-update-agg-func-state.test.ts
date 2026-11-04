/**
 * Issue: updating `defaultColDef` through `updateGridOptions` mishandles the stateful `aggFunc` attribute and the
 * non-stateful `enableValue` attribute.
 *
 * Setup: numeric columns with `defaultColDef: { enableValue: true, aggFunc: 'sum' }`, then
 * `api.updateGridOptions({ defaultColDef: ... })` with variants.
 *
 * Expected (column-updating-definitions docs, "null vs undefined"): a stateful attribute set to `undefined` is
 * ignored (the column keeps its current aggFunc), `null` clears it. `enableValue` is not stateful, so it should
 * follow the new merged column definition.
 *
 * Actual: omitting aggFunc and `enableValue` handling behave as documented, but `aggFunc: null` in the new
 * `defaultColDef` does not clear the existing aggFunc: `getAggFunc()` still returns 'sum', even when
 * `columnDefs` are set again in the same update.
 *
 * Reported on: angular 34.1.1 - 35.2.1.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). Two searches (Angular 34.1.1 July 2026 and 35.2.1
 * September 2026), e.g. "column definition merge updateGridOptions defaultColDef loses aggFunc enableValue after
 * change" and "defaultColDef merge column definition undefined property override".
 */
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('updateGridOptions defaultColDef and aggFunc / enableValue', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, RowGroupingModule] });
    afterEach(() => gridsManager.reset());

    const create = () =>
        gridsManager.createGrid('g', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            defaultColDef: { enableValue: true, aggFunc: 'sum' },
            rowData: [{ a: 1, b: 2 }],
        });

    test('omitting aggFunc (undefined) keeps aggFunc; enableValue follows new default', () => {
        const api = create();
        api.updateGridOptions({ defaultColDef: { enableValue: false } });
        expect(api.getColumn('a')!.isAllowValue()).toBe(false);
        expect(api.getColumn('a')!.getAggFunc()).toBe('sum');
    });

    test('aggFunc: null in defaultColDef clears aggFunc', () => {
        const api = create();
        api.updateGridOptions({ defaultColDef: { enableValue: true, aggFunc: null } });
        expect(api.getColumn('a')!.getAggFunc()).toBeNull();
    });

    test('aggFunc: null in defaultColDef clears aggFunc when columnDefs are set again too', () => {
        const api = create();
        api.updateGridOptions({
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            defaultColDef: { enableValue: true, aggFunc: null },
        });
        expect(api.getColumn('a')!.getAggFunc()).toBeNull();
    });

    // Control: a different stateful attribute set to null in defaultColDef does clear, so the failure above is
    // specific to aggFunc.
    test('control: sort: null in defaultColDef clears sort', () => {
        const api = gridsManager.createGrid('g', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            defaultColDef: { sort: 'asc' },
            rowData: [{ a: 1, b: 2 }],
        });
        expect(api.getColumn('a')!.getSort()).toBe('asc');
        api.updateGridOptions({ defaultColDef: { sort: null } });
        expect(api.getColumn('a')!.getSort()).toBeNull();
    });
});
