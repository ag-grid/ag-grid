/*
 * Issue: setting the `formulaDataSource` or `formulaFuncs` grid options without registering FormulaModule
 * gives no "missing module" error. The options are silently ignored, so formulas never calculate and
 * nothing tells the developer why. Calling `api.refreshFormulas()` does report error #200.
 *
 * Setup: ClientSideRowModelModule registered, FormulaModule not registered, `formulaDataSource` and
 * `formulaFuncs` set in gridOptions.
 *
 * Expected: both options are documented in gridOptions.ts (JSDoc, `@agModule FormulaModule`) as needing
 * FormulaModule, so creating the grid should report error #200 naming FormulaModule, as other options
 * with an @agModule tag do.
 *
 * Actual: the module map in validation/rules/gridOptionsValidations.ts has no entry for either option
 * (only the column definition `allowFormula` is mapped), so nothing is reported.
 *
 * Reported on: React 36.0.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on React 36.0.0 searched, in
 * September 2026, for "error 200 module not registered check if FormulaModule is registered on grid api
 * refreshFormulas formulaDataSource".
 */
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';

// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('formula grid options without FormulaModule', () => {
    // The suite's dev validations throw missing-module errors synchronously, so createGrid throws.
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    test('formulaDataSource reports FormulaModule as missing', () => {
        expect(() =>
            gridMgr.createGrid('formula-data-source-no-module', {
                formulaDataSource: {} as any,
            })
        ).toThrow(/#200.*FormulaModule/s);
    });

    test('formulaFuncs reports FormulaModule as missing', () => {
        expect(() =>
            gridMgr.createGrid('formula-funcs-no-module', {
                formulaFuncs: {} as any,
            })
        ).toThrow(/#200.*FormulaModule/s);
    });
});
