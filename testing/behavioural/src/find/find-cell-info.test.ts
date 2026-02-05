import { FindModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';
import { expect } from '../test-utils/matchers';

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

            api.setGridOption('findSearchValue', 'a');
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

            const column = api.getColumn('value')!;
            const row = api.getDisplayedRowAtIndex(0)!;

            expect(api.findGetNumMatches({ node: row, column })).toBe(0);
        });

        test('works with multiple columns', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a' }, { field: 'b' }],
                rowData: [{ a: 'test', b: 'testing test' }],
            });

            api.setGridOption('findSearchValue', 'test');
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

            api.setGridOption('findSearchValue', 'hello');
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

            api.setGridOption('findSearchValue', 'a');
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

            api.setGridOption('findSearchValue', 'xyz');
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

            api.setGridOption('findSearchValue', 'test');
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

            api.setGridOption('findSearchValue', 'a');
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
