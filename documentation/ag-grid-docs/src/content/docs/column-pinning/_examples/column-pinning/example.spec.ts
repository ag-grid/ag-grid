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

        const leftHeaders = await getPinnedHeaderColIds(page, '.ag-pinned-left-header');
        expect(leftHeaders).toEqual(['rowNum', 'athlete', 'age']);

        const rightHeaders = await getPinnedHeaderColIds(page, '.ag-pinned-right-header');
        expect(rightHeaders).toEqual(['total']);
    });

    test.eachFramework('Clear Pinned removes all pinning', async ({ page }) => {
        await waitForGridContent(page);

        await page.locator('button:text("Clear Pinned")').click();

        const leftHeaders = await getPinnedHeaderColIds(page, '.ag-pinned-left-header');
        expect(leftHeaders).toEqual([]);

        const rightHeaders = await getPinnedHeaderColIds(page, '.ag-pinned-right-header');
        expect(rightHeaders).toEqual([]);
    });

    test.eachFramework('Reset Pinned restores original layout', async ({ page }) => {
        await waitForGridContent(page);

        // Clear first, then reset
        await page.locator('button:text("Clear Pinned")').click();
        await page.locator('button:text-is("Left = #, Athlete, Age; Right = Total")').click();

        const leftHeaders = await getPinnedHeaderColIds(page, '.ag-pinned-left-header');
        expect(leftHeaders).toEqual(['rowNum', 'athlete', 'age']);

        const rightHeaders = await getPinnedHeaderColIds(page, '.ag-pinned-right-header');
        expect(rightHeaders).toEqual(['total']);
    });

    test.eachFramework('Pin Country moves only country to left', async ({ page }) => {
        await waitForGridContent(page);

        await page.locator('button:text("Left = Country")').click();

        const leftHeaders = await getPinnedHeaderColIds(page, '.ag-pinned-left-header');
        expect(leftHeaders).toEqual(['country']);

        const rightHeaders = await getPinnedHeaderColIds(page, '.ag-pinned-right-header');
        expect(rightHeaders).toEqual([]);
    });

    test.describe('sizeColumnsToFit with pinned columns', () => {
        test.use({ agModules: ['ColumnAutoSize'] });

        test.vanilla(
            'sizeColumnsToFit should not reverse pinned left column order when hidden column exists',
            async ({ page, remoteGrid }) => {
                const remoteApi = remoteGrid(page, '1');

                await remoteApi.setGridOption('columnDefs', [
                    { field: 'athlete', pinned: 'left' },
                    { field: 'age', pinned: 'left' },
                    { colId: 'country', field: 'country', hide: true },
                ]);
                await waitForGridContent(page);

                // Verify initial pinned left header order
                const headersBefore = await getPinnedHeaderColIds(page, '.ag-pinned-left-header');
                expect(headersBefore).toEqual(['athlete', 'age']);

                // Call sizeColumnsToFit and wait for any async layout changes
                await remoteApi.sizeColumnsToFit({});
                await page.waitForTimeout(600);

                // Verify pinned left header order is preserved
                const headersAfter = await getPinnedHeaderColIds(page, '.ag-pinned-left-header');
                expect(headersAfter).toEqual(['athlete', 'age']);

                // Verify both columns are still pinned left
                const pinnedState = (await remoteApi.getColumnState()) as any[];
                const athleteState = pinnedState.find((s) => s.colId === 'athlete');
                const ageState = pinnedState.find((s) => s.colId === 'age');
                expect(athleteState.pinned).toBe('left');
                expect(ageState.pinned).toBe('left');
            }
        );
    });
});
