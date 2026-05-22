import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

/** Returns col-ids of header cells inside the given container selector, ordered by aria-colindex. */
async function getPinnedHeaderColIds(page: import('playwright/test').Page, containerSelector: string) {
    return page.evaluate((selector) => {
        const cells = document.querySelectorAll(`${selector} .ag-header-cell`);
        return Array.from(cells)
            .sort(
                (a, b) =>
                    parseInt(a.getAttribute('aria-colindex') || '0') - parseInt(b.getAttribute('aria-colindex') || '0')
            )
            .map((c) => c.getAttribute('col-id'));
    }, containerSelector);
}

test.agExample(import.meta, () => {
    test.eachFramework('initial pinned layout', async ({ page }) => {
        await waitForGridContent(page);

        const leftHeaders = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-left-cells');
        expect(leftHeaders).toEqual(['rowNum', 'athlete', 'age']);

        const rightHeaders = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-right-cells');
        expect(rightHeaders).toEqual(['total']);
    });

    test.eachFramework('Clear Pinned removes all pinning', async ({ page }) => {
        await waitForGridContent(page);

        await page.locator('button:text("Clear Pinned")').click();

        const leftHeaders = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-left-cells');
        expect(leftHeaders).toEqual([]);

        const rightHeaders = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-right-cells');
        expect(rightHeaders).toEqual([]);
    });

    test.eachFramework('Reset Pinned restores original layout', async ({ page }) => {
        await waitForGridContent(page);

        // Clear first, then reset
        await page.locator('button:text("Clear Pinned")').click();
        await page.locator('button:text-is("Left = #, Athlete, Age; Right = Total")').click();

        const leftHeaders = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-left-cells');
        expect(leftHeaders).toEqual(['rowNum', 'athlete', 'age']);

        const rightHeaders = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-right-cells');
        expect(rightHeaders).toEqual(['total']);
    });

    test.eachFramework('Pin Country moves only country to left', async ({ page }) => {
        await waitForGridContent(page);

        await page.locator('button:text("Left = Country")').click();

        const leftHeaders = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-left-cells');
        expect(leftHeaders).toEqual(['country']);

        const rightHeaders = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-right-cells');
        expect(rightHeaders).toEqual([]);
    });

    test.describe('sizeColumnsToFit with pinned columns', () => {
        test.use({ agModules: ['ColumnAutoSize'] });

        test.vanilla(
            'sizeColumnsToFit should not unpin left-pinned columns when no center columns exist',
            async ({ page, remoteGrid }) => {
                const remoteApi = remoteGrid(page, '1');

                await remoteApi.setGridOption('columnDefs', [
                    { field: 'athlete', pinned: 'left' },
                    { field: 'age', pinned: 'left' },
                    { colId: 'country', field: 'country', hide: true },
                ]);
                await waitForGridContent(page);

                const headersBefore = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-left-cells');
                expect(headersBefore).toEqual(['athlete', 'age']);

                await remoteApi.sizeColumnsToFit({});
                await page.waitForTimeout(600);

                const headersAfter = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-left-cells');
                expect(headersAfter).toEqual(['athlete', 'age']);

                const state = (await remoteApi.getColumnState()) as any[];
                expect(state.find((s) => s.colId === 'athlete').pinned).toBe('left');
                expect(state.find((s) => s.colId === 'age').pinned).toBe('left');
            }
        );

        test.vanilla(
            'sizeColumnsToFit should not unpin right-pinned columns when no center columns exist',
            async ({ page, remoteGrid }) => {
                const remoteApi = remoteGrid(page, '1');

                await remoteApi.setGridOption('columnDefs', [
                    { field: 'gold', pinned: 'right' },
                    { field: 'silver', pinned: 'right' },
                    { colId: 'bronze', field: 'bronze', hide: true },
                ]);
                await waitForGridContent(page);

                const headersBefore = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-right-cells');
                expect(headersBefore).toEqual(['gold', 'silver']);

                await remoteApi.sizeColumnsToFit({});
                await page.waitForTimeout(600);

                const headersAfter = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-right-cells');
                expect(headersAfter).toEqual(['gold', 'silver']);

                const state = (await remoteApi.getColumnState()) as any[];
                expect(state.find((s) => s.colId === 'gold').pinned).toBe('right');
                expect(state.find((s) => s.colId === 'silver').pinned).toBe('right');
            }
        );

        test.vanilla(
            'sizeColumnsToFit should not unpin mixed left+right columns when no center columns exist',
            async ({ page, remoteGrid }) => {
                const remoteApi = remoteGrid(page, '1');

                await remoteApi.setGridOption('columnDefs', [
                    { field: 'athlete', pinned: 'left' },
                    { field: 'age', pinned: 'left' },
                    { field: 'gold', pinned: 'right' },
                    { colId: 'country', field: 'country', hide: true },
                ]);
                await waitForGridContent(page);

                const leftBefore = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-left-cells');
                expect(leftBefore).toEqual(['athlete', 'age']);
                const rightBefore = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-right-cells');
                expect(rightBefore).toEqual(['gold']);

                await remoteApi.sizeColumnsToFit({});
                await page.waitForTimeout(600);

                const leftAfter = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-left-cells');
                expect(leftAfter).toEqual(['athlete', 'age']);
                const rightAfter = await getPinnedHeaderColIds(page, '.ag-header-row .ag-grid-pinned-right-cells');
                expect(rightAfter).toEqual(['gold']);

                const state = (await remoteApi.getColumnState()) as any[];
                expect(state.find((s) => s.colId === 'athlete').pinned).toBe('left');
                expect(state.find((s) => s.colId === 'age').pinned).toBe('left');
                expect(state.find((s) => s.colId === 'gold').pinned).toBe('right');
            }
        );
    });
});
