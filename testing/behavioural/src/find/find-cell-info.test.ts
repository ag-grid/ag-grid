import { FindModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * Tests for findGetNumMatches and findGetParts API functions.
 */
describe('Find Cell Info API', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [FindModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    describe('findGetNumMatches', () => {
        test('returns number of matches in a specific cell', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'aaa' }, { value: 'aba' }, { value: 'bbb' }],
            });
            await new GridColumns(api, `returns number of matches in a specific cell setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `returns number of matches in a specific cell setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"aaa"
                ├── LEAF id:1 value:"aba"
                └── LEAF id:2 value:"bbb"
            `);

            api.setGridOption('findSearchValue', 'a');
            await new GridColumns(
                api,
                `returns number of matches in a specific cell after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `returns number of matches in a specific cell after setGridOption findSearchValue`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 value:"aaa"
                    ├── LEAF id:1 value:"aba"
                    └── LEAF id:2 value:"bbb"
                `);
            await asyncSetTimeout(1);

            const column = api.getColumn('value')!;

            // First row 'aaa' has 3 matches of 'a'
            const row0 = api.getDisplayedRowAtIndex(0)!;
            expect(api.findGetNumMatches({ node: row0, column })).toBe(3);

            // Second row 'aba' has 2 matches of 'a'
            const row1 = api.getDisplayedRowAtIndex(1)!;
            expect(api.findGetNumMatches({ node: row1, column })).toBe(2);

            // Third row 'bbb' has 0 matches of 'a'
            const row2 = api.getDisplayedRowAtIndex(2)!;
            expect(api.findGetNumMatches({ node: row2, column })).toBe(0);
        });

        test('returns 0 when no search value is set', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'aaa' }],
            });
            await new GridColumns(api, `returns 0 when no search value is set setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `returns 0 when no search value is set setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:"aaa"
            `);

            const column = api.getColumn('value')!;
            const row = api.getDisplayedRowAtIndex(0)!;

            expect(api.findGetNumMatches({ node: row, column })).toBe(0);
            await new GridRows(api, `returns 0 when no search value is set final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:"aaa"
            `);
        });

        test('works with multiple columns', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a' }, { field: 'b' }],
                rowData: [{ a: 'test', b: 'testing test' }],
            });
            await new GridColumns(api, `works with multiple columns setup`).checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);
            await new GridRows(api, `works with multiple columns setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"test" b:"testing test"
            `);

            api.setGridOption('findSearchValue', 'test');
            await new GridColumns(api, `works with multiple columns after setGridOption findSearchValue`).checkColumns(
                `
                    CENTER
                    ├── a "A" width:200
                    └── b "B" width:200
                `
            );
            await new GridRows(api, `works with multiple columns after setGridOption findSearchValue`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"test" b:"testing test"
            `);
            await asyncSetTimeout(1);

            const row = api.getDisplayedRowAtIndex(0)!;
            const colA = api.getColumn('a')!;
            const colB = api.getColumn('b')!;

            // Column 'a' has 1 match of 'test'
            expect(api.findGetNumMatches({ node: row, column: colA })).toBe(1);

            // Column 'b' has 2 matches of 'test' ('testing test')
            expect(api.findGetNumMatches({ node: row, column: colB })).toBe(2);
        });
    });

    describe('findGetParts', () => {
        test('returns parts with match info for cell value', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'hello world hello' }],
            });
            await new GridColumns(api, `returns parts with match info for cell value setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `returns parts with match info for cell value setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:"hello world hello"
            `);

            api.setGridOption('findSearchValue', 'hello');
            await new GridColumns(
                api,
                `returns parts with match info for cell value after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `returns parts with match info for cell value after setGridOption findSearchValue`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 value:"hello world hello"
                `);
            await asyncSetTimeout(1);

            const row = api.getDisplayedRowAtIndex(0)!;
            const column = api.getColumn('value')!;

            const parts = api.findGetParts({ node: row, column, value: 'hello world hello' });

            // Should split into: 'hello', ' world ', 'hello'
            expect(parts).toHaveLength(3);
            expect(parts[0]).toEqual({ value: 'hello', match: true, activeMatch: false });
            expect(parts[1]).toEqual({ value: ' world ' });
            expect(parts[2]).toEqual({ value: 'hello', match: true, activeMatch: false });
        });

        test('marks active match in parts', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'aaa' }],
            });
            await new GridColumns(api, `marks active match in parts setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `marks active match in parts setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:"aaa"
            `);

            api.setGridOption('findSearchValue', 'a');
            await new GridColumns(api, `marks active match in parts after setGridOption findSearchValue`).checkColumns(
                `
                    CENTER
                    └── value "Value" width:200
                `
            );
            await new GridRows(api, `marks active match in parts after setGridOption findSearchValue`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:"aaa"
            `);
            await asyncSetTimeout(1);

            // Navigate to second match
            api.findNext();
            api.findNext();

            const row = api.getDisplayedRowAtIndex(0)!;
            const column = api.getColumn('value')!;

            const parts = api.findGetParts({ node: row, column, value: 'aaa' });

            expect(parts).toHaveLength(3);
            expect(parts[0]).toEqual({ value: 'a', match: true, activeMatch: false });
            expect(parts[1]).toEqual({ value: 'a', match: true, activeMatch: true });
            expect(parts[2]).toEqual({ value: 'a', match: true, activeMatch: false });
        });

        test('returns single part when no matches', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'hello' }],
            });
            await new GridColumns(api, `returns single part when no matches setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `returns single part when no matches setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:"hello"
            `);

            api.setGridOption('findSearchValue', 'xyz');
            await new GridColumns(api, `returns single part when no matches after setGridOption findSearchValue`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `returns single part when no matches after setGridOption findSearchValue`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 value:"hello"
                `
            );
            await asyncSetTimeout(1);

            const row = api.getDisplayedRowAtIndex(0)!;
            const column = api.getColumn('value')!;

            const parts = api.findGetParts({ node: row, column, value: 'hello' });

            // No matches, so just one part with the full value
            expect(parts).toHaveLength(1);
            expect(parts[0]).toEqual({ value: 'hello' });
        });

        test('handles empty value', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: '' }],
            });
            await new GridColumns(api, `handles empty value setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `handles empty value setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:""
            `);

            api.setGridOption('findSearchValue', 'test');
            await new GridColumns(api, `handles empty value after setGridOption findSearchValue`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `handles empty value after setGridOption findSearchValue`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:""
            `);
            await asyncSetTimeout(1);

            const row = api.getDisplayedRowAtIndex(0)!;
            const column = api.getColumn('value')!;

            const parts = api.findGetParts({ node: row, column, value: '' });

            // Empty value returns empty array
            expect(parts).toHaveLength(0);
        });

        test('handles precedingNumMatches for multi-value cells', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'aa bb aa' }],
            });
            await new GridColumns(api, `handles precedingNumMatches for multi-value cells setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `handles precedingNumMatches for multi-value cells setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:"aa bb aa"
            `);

            api.setGridOption('findSearchValue', 'a');
            await new GridColumns(
                api,
                `handles precedingNumMatches for multi-value cells after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(
                api,
                `handles precedingNumMatches for multi-value cells after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:"aa bb aa"
            `);
            await asyncSetTimeout(1);

            // Navigate to third match (second 'aa')
            api.findNext();
            api.findNext();
            api.findNext();

            const row = api.getDisplayedRowAtIndex(0)!;
            const column = api.getColumn('value')!;

            // Get parts for second 'aa' with precedingNumMatches=2 (first 'aa' has 2 matches)
            const parts = api.findGetParts({
                node: row,
                column,
                value: 'aa',
                precedingNumMatches: 2,
            });

            // The third match overall should be active in this part
            expect(parts).toHaveLength(2);
            expect(parts[0]).toEqual({ value: 'a', match: true, activeMatch: true });
            expect(parts[1]).toEqual({ value: 'a', match: true, activeMatch: false });
        });
    });
});
