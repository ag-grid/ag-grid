import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

type Page = import('@playwright/test').Page;

// Only the header cells near the viewport are rendered, so read the whole column order from the grid API rather
// than the DOM. Pivot result col ids are `<year>_<medal>`, so the year groups are their distinct year prefixes.
const yearGroupOrder = async (page: Page): Promise<string[]> => {
    const colIds: string[] = await page.evaluate(
        () =>
            (window as any)
                .getGridApi('1')
                .getPivotResultColumns()
                ?.map((col: any) => col.getColId()) ?? []
    );
    const years = colIds.map((colId) => colId.split('_')[0]).filter((year) => /^\d{4}$/.test(year));
    return years.filter((year, i) => years.indexOf(year) === i);
};

const yearPillFor = (page: Page) => page.locator('.ag-column-drop-horizontal-cell', { hasText: 'Year' });

/** The pivot groups reorder asynchronously: poll until they are sorted `mode`-wards. */
const waitForYears = (page: Page, mode: 'asc' | 'desc') =>
    expect(async () => {
        const years = await yearGroupOrder(page);
        expect(years.length).toBeGreaterThan(1);
        const ascending = years.slice().sort();
        expect(years).toEqual(mode === 'asc' ? ascending : ascending.reverse());
    }).toPass();

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
        }
    );

    test.eachFramework(
        'The Year pill sorts the supplied pivot result columns, and no sort returns them to the supplied order',
        async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // createPivotResultColumns() supplies the years in a scrambled order, but pivotSort defaults to
            // ascending, so the grid orders the supplied columns rather than displaying them as supplied.
            await waitForYears(page, 'asc');

            const yearPill = yearPillFor(page);
            await expect(yearPill).toBeVisible();
            await expect(yearPill.locator('.ag-sort-ascending-icon')).toBeVisible();

            // Activating the pill reorders the supplied columns, even though the grid did not generate them.
            await yearPill.click();
            await expect(yearPill.locator('.ag-sort-descending-icon')).toBeVisible();
            await waitForYears(page, 'desc');

            // Cycling on to no sort falls back to the order the columns were supplied in. The example shuffles that
            // order with the docs' seeded generator, so rather than pin the exact permutation to the seed, assert
            // what the example actually claims: the same years, in neither ascending nor descending order.
            const descendingYears = await yearGroupOrder(page);
            const ascendingYears = descendingYears.slice().reverse();
            const sortedYears = descendingYears.slice().sort();
            await yearPill.click();
            await expect(yearPill.locator('.ag-sort-descending-icon')).toBeHidden();
            await expect(yearPill.locator('.ag-sort-ascending-icon')).toBeHidden();
            await expect(async () => {
                const suppliedOrder = await yearGroupOrder(page);
                expect(suppliedOrder.length).toBeGreaterThan(1);
                expect(suppliedOrder.slice().sort()).toEqual(sortedYears);
                expect(suppliedOrder).not.toEqual(ascendingYears);
                expect(suppliedOrder).not.toEqual(descendingYears);
            }).toPass();

            // And back round to ascending.
            await yearPill.click();
            await expect(yearPill.locator('.ag-sort-ascending-icon')).toBeVisible();
            await waitForYears(page, 'asc');
        }
    );
});
