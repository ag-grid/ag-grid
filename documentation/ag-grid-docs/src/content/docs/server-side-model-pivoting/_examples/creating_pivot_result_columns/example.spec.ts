import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

// Header group cells are absolutely positioned, so visual order comes from their `left` offset
// rather than DOM order. Return the year group headers ordered left-to-right.
const yearGroupOrder = (page: import('@playwright/test').Page) =>
    page.locator('.ag-header-group-cell .ag-header-group-text').evaluateAll((els) =>
        els
            .map((e) => ({ year: e.textContent!.trim(), left: e.getBoundingClientRect().left }))
            .sort((a, b) => a.left - b.left)
            .map((e) => e.year)
    );

test.agExample(import.meta, () => {
    test.eachFramework(
        'App-built pivot result columns (setPivotResultColumns) render nested year -> medal groups',
        async ({ page }) => {
            await waitForGridContent(page);

            const groupRow = (name: string) =>
                page
                    .locator('.ag-row')
                    .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                    .first();

            // Grid is grouped by Country on the server side.
            await expect(groupRow('United States')).toBeVisible();
            await expect(groupRow('Russia')).toBeVisible();

            // createPivotResultColumns() builds a year column group per distinct year,
            // each nesting gold/silver/bronze value children.
            await expect(page.locator('.ag-header-group-cell').filter({ hasText: '2000' }).first()).toBeVisible();
            await expect(page.locator('.ag-header-group-cell').filter({ hasText: '2004' }).first()).toBeVisible();
            await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'Gold' }).first()).toBeVisible();
            await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'Silver' }).first()).toBeVisible();
            await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'Bronze' }).first()).toBeVisible();

            // The Country row shows the pivoted, aggregated medal counts against those columns.
            await expect(groupRow('United States').locator('[col-id="2000_gold"]')).toContainText('130');
            await expect(groupRow('United States').locator('[col-id="2000_silver"]')).toContainText('61');
            await expect(groupRow('United States').locator('[col-id="2000_bronze"]')).toContainText('52');
            await expect(groupRow('United States').locator('[col-id="2004_gold"]')).toContainText('118');
        }
    );

    test.eachFramework(
        'Activating the Year pivot pill reorders the app-built pivot result columns',
        async ({ page }) => {
            await waitForGridContent(page);

            const ascendingYears = await yearGroupOrder(page);
            expect(ascendingYears.length).toBeGreaterThan(1);
            expect(ascendingYears).toEqual([...ascendingYears].sort());

            // The Year pill in the pivot panel starts ascending; activating it cycles to descending.
            const yearPill = page.locator('.ag-column-drop-horizontal-cell', { hasText: 'Year' });
            await expect(yearPill.locator('.ag-sort-ascending-icon')).toBeVisible();
            await yearPill.click();
            await expect(yearPill.locator('.ag-sort-descending-icon')).toBeVisible();

            // The rows reload from the server, so wait for the reordered columns before reading the order.
            const lastYear = ascendingYears[ascendingYears.length - 1];
            await page.waitForFunction((expected) => {
                const cells = Array.from(document.querySelectorAll('.ag-header-group-cell .ag-header-group-text'));
                if (!cells.length) {
                    return false;
                }
                const leftmost = cells.sort(
                    (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left
                )[0];
                return leftmost.textContent!.trim() === expected;
            }, lastYear);
            expect(await yearGroupOrder(page)).toEqual([...ascendingYears].reverse());
        }
    );
});
