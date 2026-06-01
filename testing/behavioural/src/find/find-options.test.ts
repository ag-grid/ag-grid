import { PaginationModule, TextEditorModule } from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * Tests for find options: case sensitivity, pagination, etc.
 */
describe('Find Options', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [PaginationModule, FindModule, TextEditorModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    describe('Case Sensitivity', () => {
        test('find is case-insensitive by default', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'Apple' }, { value: 'APPLE' }, { value: 'apple' }, { value: 'aPpLe' }],
            });
            await new GridColumns(api, `find is case-insensitive by default setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `find is case-insensitive by default setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"Apple"
                ├── LEAF id:1 value:"APPLE"
                ├── LEAF id:2 value:"apple"
                └── LEAF id:3 value:"aPpLe"
            `);

            api.setGridOption('findSearchValue', 'apple');
            await new GridColumns(api, `find is case-insensitive by default after setGridOption findSearchValue`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `find is case-insensitive by default after setGridOption findSearchValue`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 value:"Apple"
                    ├── LEAF id:1 value:"APPLE"
                    ├── LEAF id:2 value:"apple"
                    └── LEAF id:3 value:"aPpLe"
                `
            );
            await asyncSetTimeout(1);

            // All variations should match when case-insensitive
            expect(api.findGetTotalMatches()).toBe(4);
        });

        test('caseSensitive option makes find case-sensitive', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'Apple' }, { value: 'APPLE' }, { value: 'apple' }, { value: 'aPpLe' }],
                findOptions: { caseSensitive: true },
            });
            await new GridColumns(api, `caseSensitive option makes find case-sensitive setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `caseSensitive option makes find case-sensitive setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"Apple"
                ├── LEAF id:1 value:"APPLE"
                ├── LEAF id:2 value:"apple"
                └── LEAF id:3 value:"aPpLe"
            `);

            api.setGridOption('findSearchValue', 'apple');
            await new GridColumns(
                api,
                `caseSensitive option makes find case-sensitive after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(
                api,
                `caseSensitive option makes find case-sensitive after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"Apple"
                ├── LEAF id:1 value:"APPLE"
                ├── LEAF id:2 value:"apple"
                └── LEAF id:3 value:"aPpLe"
            `);
            await asyncSetTimeout(1);

            // Only exact case match
            expect(api.findGetTotalMatches()).toBe(1);

            // Verify it's the lowercase one
            api.findNext();
            const match = api.findGetActiveMatch()!;
            expect(match.node.data.value).toBe('apple');
        });

        test('caseSensitive option can be toggled dynamically', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'Apple' }, { value: 'apple' }],
            });
            await new GridColumns(api, `caseSensitive option can be toggled dynamically setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `caseSensitive option can be toggled dynamically setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"Apple"
                └── LEAF id:1 value:"apple"
            `);

            api.setGridOption('findSearchValue', 'Apple');
            await new GridColumns(
                api,
                `caseSensitive option can be toggled dynamically after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(
                api,
                `caseSensitive option can be toggled dynamically after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"Apple"
                └── LEAF id:1 value:"apple"
            `);
            await asyncSetTimeout(1);

            // Case-insensitive: both match
            expect(api.findGetTotalMatches()).toBe(2);

            // Enable case sensitivity
            api.setGridOption('findOptions', { caseSensitive: true });
            await new GridColumns(
                api,
                `caseSensitive option can be toggled dynamically after setGridOption findOptions`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `caseSensitive option can be toggled dynamically after setGridOption findOptions`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 value:"Apple"
                    └── LEAF id:1 value:"apple"
                `);
            await asyncSetTimeout(1);

            // Only exact case match
            expect(api.findGetTotalMatches()).toBe(1);

            // Disable case sensitivity
            api.setGridOption('findOptions', { caseSensitive: false });
            await new GridColumns(
                api,
                `caseSensitive option can be toggled dynamically after setGridOption findOptions #2`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(
                api,
                `caseSensitive option can be toggled dynamically after setGridOption findOptions #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"Apple"
                └── LEAF id:1 value:"apple"
            `);
            await asyncSetTimeout(1);

            // Both match again
            expect(api.findGetTotalMatches()).toBe(2);
        });
    });

    describe('Pagination', () => {
        // paginationPageSize=3 is intentionally not in the default paginationPageSizeSelector,
        // which triggers warnings #94 and #95. Suppress the console output and assert they fire.
        let warnSpy: ReturnType<typeof vitest.spyOn>;
        beforeEach(() => {
            warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        });
        afterEach(() => {
            warnSpy.mockRestore();
        });

        test('currentPageOnly option limits find to current page', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { value: 'apple' },
                    { value: 'apple' },
                    { value: 'banana' },
                    { value: 'apple' },
                    { value: 'apple' },
                    { value: 'cherry' },
                ],
                pagination: true,
                paginationPageSize: 3,
                findOptions: { currentPageOnly: true },
            });
            await new GridColumns(api, `currentPageOnly option limits find to current page setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `currentPageOnly option limits find to current page setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"apple"
                ├── LEAF id:1 value:"apple"
                ├── LEAF id:2 value:"banana"
                ├── LEAF id:3 value:"apple"
                ├── LEAF id:4 value:"apple"
                └── LEAF id:5 value:"cherry"
            `);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #94'),
                expect.any(String),
                expect.any(String)
            );
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #95'),
                expect.any(String),
                expect.any(String)
            );

            api.setGridOption('findSearchValue', 'apple');
            await new GridColumns(
                api,
                `currentPageOnly option limits find to current page after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(
                api,
                `currentPageOnly option limits find to current page after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"apple"
                ├── LEAF id:1 value:"apple"
                ├── LEAF id:2 value:"banana"
                ├── LEAF id:3 value:"apple"
                ├── LEAF id:4 value:"apple"
                └── LEAF id:5 value:"cherry"
            `);
            await asyncSetTimeout(1);

            // First page has 2 apples (rows 0, 1)
            expect(api.findGetTotalMatches()).toBe(2);

            // Navigate to second page
            api.paginationGoToPage(1);
            await asyncSetTimeout(1);

            // Second page has 2 apples (rows 3, 4)
            api.findRefresh();
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(2);
        });

        test('find all pages when currentPageOnly is false (default)', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { value: 'apple' },
                    { value: 'apple' },
                    { value: 'banana' },
                    { value: 'apple' },
                    { value: 'apple' },
                    { value: 'cherry' },
                ],
                pagination: true,
                paginationPageSize: 3,
            });
            await new GridColumns(api, `find all pages when currentPageOnly is false (default) setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `find all pages when currentPageOnly is false (default) setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"apple"
                ├── LEAF id:1 value:"apple"
                ├── LEAF id:2 value:"banana"
                ├── LEAF id:3 value:"apple"
                ├── LEAF id:4 value:"apple"
                └── LEAF id:5 value:"cherry"
            `);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #94'),
                expect.any(String),
                expect.any(String)
            );
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #95'),
                expect.any(String),
                expect.any(String)
            );

            api.setGridOption('findSearchValue', 'apple');
            await new GridColumns(
                api,
                `find all pages when currentPageOnly is false (default) after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(
                api,
                `find all pages when currentPageOnly is false (default) after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"apple"
                ├── LEAF id:1 value:"apple"
                ├── LEAF id:2 value:"banana"
                ├── LEAF id:3 value:"apple"
                ├── LEAF id:4 value:"apple"
                └── LEAF id:5 value:"cherry"
            `);
            await asyncSetTimeout(1);

            // All 4 apples across all pages
            expect(api.findGetTotalMatches()).toBe(4);
        });
    });

    describe('Search Value Changes', () => {
        test('changing search value updates matches', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'apple' }, { value: 'banana' }, { value: 'cherry' }],
            });
            await new GridColumns(api, `changing search value updates matches setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `changing search value updates matches setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"apple"
                ├── LEAF id:1 value:"banana"
                └── LEAF id:2 value:"cherry"
            `);

            api.setGridOption('findSearchValue', 'apple');
            await new GridColumns(api, `changing search value updates matches after setGridOption findSearchValue`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `changing search value updates matches after setGridOption findSearchValue`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 value:"apple"
                    ├── LEAF id:1 value:"banana"
                    └── LEAF id:2 value:"cherry"
                `
            );
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            api.setGridOption('findSearchValue', 'banana');
            await new GridColumns(api, `changing search value updates matches after setGridOption findSearchValue #2`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `changing search value updates matches after setGridOption findSearchValue #2`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 value:"apple"
                    ├── LEAF id:1 value:"banana"
                    └── LEAF id:2 value:"cherry"
                `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            api.setGridOption('findSearchValue', 'a');
            await new GridColumns(api, `changing search value updates matches after setGridOption findSearchValue #3`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `changing search value updates matches after setGridOption findSearchValue #3`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 value:"apple"
                    ├── LEAF id:1 value:"banana"
                    └── LEAF id:2 value:"cherry"
                `);
            await asyncSetTimeout(1);
            // 'apple', 'banana' contain multiple 'a's
            // apple has 1 'a', banana has 3 'a's = 4 total
            expect(api.findGetTotalMatches()).toBe(4);
        });

        test('empty search value clears matches', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'apple' }, { value: 'banana' }],
            });
            await new GridColumns(api, `empty search value clears matches setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `empty search value clears matches setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"apple"
                └── LEAF id:1 value:"banana"
            `);

            api.setGridOption('findSearchValue', 'a');
            await new GridColumns(api, `empty search value clears matches after setGridOption findSearchValue`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `empty search value clears matches after setGridOption findSearchValue`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"apple"
                └── LEAF id:1 value:"banana"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBeGreaterThan(0);

            api.findNext();
            expect(api.findGetActiveMatch()).toBeDefined();

            // Clear search value
            api.setGridOption('findSearchValue', '');
            await new GridColumns(api, `empty search value clears matches after setGridOption findSearchValue #2`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `empty search value clears matches after setGridOption findSearchValue #2`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 value:"apple"
                    └── LEAF id:1 value:"banana"
                `
            );
            await asyncSetTimeout(1);

            expect(api.findGetTotalMatches()).toBe(0);
            expect(api.findGetActiveMatch()).toBeUndefined();
        });

        test('undefined search value clears matches', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'apple' }],
            });
            await new GridColumns(api, `undefined search value clears matches setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `undefined search value clears matches setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:"apple"
            `);

            api.setGridOption('findSearchValue', 'apple');
            await new GridColumns(api, `undefined search value clears matches after setGridOption findSearchValue`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `undefined search value clears matches after setGridOption findSearchValue`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 value:"apple"
                `
            );
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            api.setGridOption('findSearchValue', undefined);
            await new GridColumns(api, `undefined search value clears matches after setGridOption findSearchValue #2`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `undefined search value clears matches after setGridOption findSearchValue #2`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 value:"apple"
                `);
            await asyncSetTimeout(1);

            expect(api.findGetTotalMatches()).toBe(0);
        });
    });
});
