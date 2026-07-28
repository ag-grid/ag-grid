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

/** Only the year groups near the viewport are rendered, so assert the shape of the order, not an exact list. */
const isMonotonic = (years: string[], direction: 'asc' | 'desc') =>
    years.length > 1 &&
    years.every((year, i) => {
        if (i === 0) {
            return true;
        }
        const previous = Number(years[i - 1]);
        return direction === 'asc' ? previous <= Number(year) : previous >= Number(year);
    });

/** The pivot groups reorder asynchronously: poll until they are sorted `mode`-wards, or match an exact order. */
const waitForYears = (page: Page, mode: 'asc' | 'desc' | string[]) =>
    page.waitForFunction((expected) => {
        const years = Array.from(document.querySelectorAll('.ag-header-group-cell .ag-header-group-text'))
            .map((e) => ({ text: e.textContent!.trim(), left: e.getBoundingClientRect().left }))
            .filter((e) => /^\d{4}$/.test(e.text))
            .sort((a, b) => a.left - b.left)
            .map((e) => e.text);
        if (Array.isArray(expected)) {
            return years.join() === expected.join();
        }
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

            // createPivotResultColumns() supplies the years in an arbitrary order, so sort them ascending first
            // to bring the earliest years into view.
            const yearPill = yearPillFor(page);
            await expect(yearPill).toBeVisible();
            await yearPill.click();
            await waitForYears(page, 'asc');

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
        'The Year pill sorts the supplied pivot result columns, and clearing the sort restores their order',
        async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Supplying the columns resets pivot sorting, so the scrambled supplied order is displayed as-is.
            const suppliedOrder = await yearGroupOrder(page);
            expect(suppliedOrder.length).toBeGreaterThan(1);
            expect(isMonotonic(suppliedOrder, 'asc')).toBe(false);
            expect(isMonotonic(suppliedOrder, 'desc')).toBe(false);

            // Activating the pill sorts the supplied columns, even though the grid did not generate them.
            const yearPill = yearPillFor(page);
            await expect(yearPill).toBeVisible();
            await yearPill.click();
            await expect(yearPill.locator('.ag-sort-ascending-icon')).toBeVisible();
            await waitForYears(page, 'asc');

            // Cycling on to descending, then to no sort, returns the columns to the supplied order.
            await yearPill.click();
            await expect(yearPill.locator('.ag-sort-descending-icon')).toBeVisible();
            await waitForYears(page, 'desc');

            await yearPill.click();
            await expect(yearPill.locator('.ag-sort-descending-icon')).toBeHidden();
            await expect(yearPill.locator('.ag-sort-ascending-icon')).toBeHidden();
            await waitForYears(page, suppliedOrder);
        }
    );
});
