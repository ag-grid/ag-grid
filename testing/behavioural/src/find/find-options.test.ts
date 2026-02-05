import { FindModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';
import { expect } from '../test-utils/matchers';

/**
 * Tests for find options: case sensitivity, pagination, etc.
 */
describe('Find Options', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [FindModule],
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

            api.setGridOption('findSearchValue', 'apple');
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

            api.setGridOption('findSearchValue', 'apple');
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

            api.setGridOption('findSearchValue', 'Apple');
            await asyncSetTimeout(1);

            // Case-insensitive: both match
            expect(api.findGetTotalMatches()).toBe(2);

            // Enable case sensitivity
            api.setGridOption('findOptions', { caseSensitive: true });
            await asyncSetTimeout(1);

            // Only exact case match
            expect(api.findGetTotalMatches()).toBe(1);

            // Disable case sensitivity
            api.setGridOption('findOptions', { caseSensitive: false });
            await asyncSetTimeout(1);

            // Both match again
            expect(api.findGetTotalMatches()).toBe(2);
        });
    });

    describe('Pagination', () => {
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

            api.setGridOption('findSearchValue', 'apple');
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

            api.setGridOption('findSearchValue', 'apple');
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

            api.setGridOption('findSearchValue', 'apple');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            api.setGridOption('findSearchValue', 'banana');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            api.setGridOption('findSearchValue', 'a');
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

            api.setGridOption('findSearchValue', 'a');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBeGreaterThan(0);

            api.findNext();
            expect(api.findGetActiveMatch()).toBeDefined();

            // Clear search value
            api.setGridOption('findSearchValue', '');
            await asyncSetTimeout(1);

            expect(api.findGetTotalMatches()).toBe(0);
            expect(api.findGetActiveMatch()).toBeUndefined();
        });

        test('undefined search value clears matches', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'apple' }],
            });

            api.setGridOption('findSearchValue', 'apple');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            api.setGridOption('findSearchValue', undefined);
            await asyncSetTimeout(1);

            expect(api.findGetTotalMatches()).toBe(0);
        });
    });
});
