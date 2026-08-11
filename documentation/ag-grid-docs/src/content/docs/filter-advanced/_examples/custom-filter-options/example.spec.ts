import type { Page } from '@playwright/test';
import {
    clickHeaderToSort,
    ensureGridReady,
    expect,
    orderedValues,
    test,
    waitForGridContent,
} from '@utils/grid/test-utils';

const filterInput = (page: Page) => page.locator('.ag-advanced-filter input[type=text]');

/** Types `expression`, closes the suggestion popup covering the buttons, then applies it. */
async function applyExpression(page: Page, expression: string): Promise<void> {
    // Typed only once the row data has arrived, so the grid cannot apply the expression itself when it
    // re-validates and leave Apply disabled.
    await expect(page.locator('.ag-overlay-loading-wrapper')).toBeHidden();
    await filterInput(page).fill(expression);
    await page.keyboard.press('Escape');
    await expect(page.locator('.ag-autocomplete-list-popup')).toBeHidden();
    await page.locator('.ag-advanced-filter-buttons').getByText('Apply').click();
}

test.agExample(import.meta, () => {
    test.eachFramework('should suggest the custom filter options for a column', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await filterInput(page).fill('[Age] ');

        const autocompleteList = page.locator('.ag-autocomplete-list-popup');
        await expect(autocompleteList).toBeVisible();
        await expect(autocompleteList.getByText('Even Numbers', { exact: true })).toBeVisible();
        await expect(autocompleteList.getByText('Between (Exclusive)', { exact: true })).toBeVisible();
    });

    test.eachFramework('should filter rows with zero-input and two-input custom options', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await applyExpression(page, '[Age] Even Numbers');
        await expect(async () => {
            const ages = (await orderedValues(page, 'age')).map(Number);
            expect(ages.length).toBeGreaterThan(0);
            expect(ages.filter((age) => age % 2 !== 0)).toEqual([]);
        }).toPass();

        await applyExpression(page, '[Age] Between (Exclusive) (25, 30)');
        await expect(async () => {
            const ages = (await orderedValues(page, 'age')).map(Number);
            expect(ages.length).toBeGreaterThan(0);
            expect(ages.filter((age) => age <= 25 || age >= 30)).toEqual([]);
        }).toPass();

        // The brackets are optional, and a `displayKey` stands in for the display name.
        await applyExpression(page, '[Age] betweenExclusive 25, 30');
        await expect(filterInput(page)).toHaveValue('[Age] Between (Exclusive) 25, 30');
        await expect(async () => {
            const ages = (await orderedValues(page, 'age')).map(Number);
            expect(ages.length).toBeGreaterThan(0);
            expect(ages.filter((age) => age <= 25 || age >= 30)).toEqual([]);
        }).toPass();
    });

    test.eachFramework('should filter rows with a one-input custom option', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await applyExpression(page, '[Athlete] Regular Expression "^Mich"');
        await expect(async () => {
            const athletes = await orderedValues(page, 'athlete');
            expect(athletes.length).toBeGreaterThan(0);
            expect(athletes.filter((athlete) => !/^Mich/i.test(athlete))).toEqual([]);
        }).toPass();
    });

    test.eachFramework('should filter the date column with its custom options', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await applyExpression(page, '[Date] Leap Year');
        await expect(async () => {
            const years = (await orderedValues(page, 'date')).map((date) => Number(date.split('-')[0]));
            expect(years.length).toBeGreaterThan(0);
            expect(years.filter((year) => year % 4 !== 0 || (year % 100 === 0 && year % 400 !== 0))).toEqual([]);
        }).toPass();

        // 2000 is the data's only century year, and a leap year by the 400 rule the naive `% 100` one drops.
        // Sorted ascending to bring it into the rendered rows, which are the only ones readable.
        await clickHeaderToSort(page.locator('.ag-header-cell[col-id="date"]'));
        await expect(async () => {
            const years = (await orderedValues(page, 'date')).map((date) => Number(date.split('-')[0]));
            expect(years[0]).toBe(2000);
        }).toPass();

        await applyExpression(page, '[Date] Between (Exclusive) ("2008-08-20", "2008-08-25")');
        await expect(async () => {
            const dates = await orderedValues(page, 'date');
            expect(dates.length).toBeGreaterThan(0);
            expect(dates.filter((date) => date <= '2008-08-20' || date >= '2008-08-25')).toEqual([]);
        }).toPass();
    });
});
