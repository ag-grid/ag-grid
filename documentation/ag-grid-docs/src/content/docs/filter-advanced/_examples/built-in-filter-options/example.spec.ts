import type { Page } from '@playwright/test';
import { ensureGridReady, expect, orderedValues, test, waitForGridContent } from '@utils/grid/test-utils';

const filterInput = (page: Page) => page.locator('.ag-advanced-filter input[type=text]');

/** Types `expression`, closes the suggestion popup covering the buttons, then applies it. */
async function applyExpression(page: Page, expression: string): Promise<void> {
    await filterInput(page).fill(expression);
    await page.keyboard.press('Escape');
    await expect(page.locator('.ag-autocomplete-list-popup')).toBeHidden();
    await page.locator('.ag-advanced-filter-buttons').getByText('Apply').click();
}

/** Every rendered date, once the grid has settled on the applied expression. */
async function expectDates(page: Page, isOutsideFilter: (date: string) => boolean): Promise<void> {
    await expect(async () => {
        const dates = await orderedValues(page, 'date');
        expect(dates.length).toBeGreaterThan(0);
        expect(dates.filter(isOutsideFilter)).toEqual([]);
    }).toPass();
}

function daysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${String(date.getDate()).padStart(2, '0')}`;
}

test.agExample(import.meta, () => {
    test.eachFramework('should offer Between for a column with no options of its own', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await filterInput(page).fill('[Age] ');

        const autocompleteList = page.locator('.ag-autocomplete-list-popup');
        await expect(autocompleteList).toBeVisible();
        await expect(autocompleteList.locator('.ag-autocomplete-row')).toHaveText([
            '=',
            '!=',
            '>',
            '>=',
            '<',
            '<=',
            'between',
            'is blank',
            'is not blank',
        ]);
    });

    // Asserted as a whole list, so the narrowing the page describes is covered as well as the options.
    test.eachFramework('should offer only the options the date column names', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await filterInput(page).fill('[Date] ');

        const autocompleteList = page.locator('.ag-autocomplete-list-popup');
        await expect(autocompleteList).toBeVisible();
        await expect(autocompleteList.locator('.ag-autocomplete-row')).toHaveText([
            '=',
            'between',
            'Last 7 Days',
            'Last 30 Days',
            'This Year',
            'Last Year',
            'Last 24 Months',
        ]);
    });

    test.eachFramework('should filter a number column with Between', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await applyExpression(page, '[Age] between (20, 25)');
        await expect(async () => {
            const ages = await orderedValues(page, 'age');
            expect(ages.length).toBeGreaterThan(0);
            expect(ages.map(Number).filter((age) => age <= 20 || age >= 25)).toEqual([]);
        }).toPass();
    });

    test.eachFramework('should filter the date column with Between and a relative option', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const sevenDaysAgo = daysAgo(7);
        await applyExpression(page, '[Date] Last 7 Days');
        await expectDates(page, (date) => date < sevenDaysAgo);

        await applyExpression(page, '[Date] Last 30 Days');
        await expectDates(page, (date) => date < daysAgo(30));

        await applyExpression(page, `[Date] between ("${daysAgo(30)}", "${daysAgo(1)}")`);
        await expectDates(page, (date) => date <= daysAgo(30) || date >= daysAgo(1));
    });
});
