import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

type Page = import('@playwright/test').Page;

// Header group cells are absolutely positioned, so visual order comes from their `left` offset rather than DOM
// order. Return the year group header texts, left-to-right.
const yearGroupOrder = (page: Page) =>
    page.locator('.ag-header-group-cell .ag-header-group-text').evaluateAll((els) =>
        els
            .map((e) => ({ text: e.textContent!.trim(), left: e.getBoundingClientRect().left }))
            .filter((e) => /^\d{4}$/.test(e.text))
            .sort((a, b) => a.left - b.left)
            .map((e) => e.text)
    );

const yearPillFor = (page: Page) => page.locator('.ag-column-drop-horizontal-cell', { hasText: 'Year' });

/** The pivot groups reorder asynchronously: poll until they are sorted `mode`-wards. Only the groups near the
 *  viewport are rendered, so this asserts the shape of the order rather than an exact list. */
const waitForYears = (page: Page, mode: 'asc' | 'desc') =>
    page.waitForFunction((expected) => {
        const years = Array.from(document.querySelectorAll('.ag-header-group-cell .ag-header-group-text'))
            .map((e) => ({ text: e.textContent!.trim(), left: e.getBoundingClientRect().left }))
            .filter((e) => /^\d{4}$/.test(e.text))
            .sort((a, b) => a.left - b.left)
            .map((e) => e.text);
        return (
            years.length > 1 &&
            years.every((year, i) => {
                if (i === 0) {
                    return true;
                }
                const previous = Number(years[i - 1]);
                return expected === 'asc' ? previous <= Number(year) : previous >= Number(year);
            })
        );
    }, mode);

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
            // what the example actually claims: it holds the same years, in neither ascending nor descending order.
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
