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
            'is between',
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
            'is between',
            'is in last 7 days',
            'is in last 30 days',
            'is in this year',
            'is in last year',
            'is in last 24 months',
        ]);
    });

    test.eachFramework('should filter a number column with Between', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await applyExpression(page, '[Age] is between (20, 25)');
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
        await applyExpression(page, '[Date] is in last 7 days');
        await expectDates(page, (date) => date < sevenDaysAgo);

        await applyExpression(page, '[Date] is in last 30 days');
        await expectDates(page, (date) => date < daysAgo(30));

        await applyExpression(page, `[Date] is between ("${daysAgo(30)}", "${daysAgo(1)}")`);
        await expectDates(page, (date) => date <= daysAgo(30) || date >= daysAgo(1));
    });

    // Needs a real browser: the picker is sized from the pill, so only layout says whether the options still fit.
    test.eachFramework('should size the builder operator dropdown to its longest option', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await applyExpression(page, '[Date] is in last 7 days');
        await page.getByRole('button', { name: 'Builder' }).click();
        await page.getByRole('combobox', { name: 'Option' }).click();

        const picker = page.locator('.ag-rich-select-list');
        await expect(picker).toBeVisible();
        await expect(page.locator('.ag-rich-select-row')).not.toHaveCount(0);

        const { pickerWidth, overflowing } = await picker.evaluate((ePicker) => ({
            pickerWidth: ePicker.clientWidth,
            // Row width against the picker's content box, so no border or scroll offset has to be accounted for.
            overflowing: [...ePicker.querySelectorAll('.ag-rich-select-row')]
                .filter((row) => row.getBoundingClientRect().width > ePicker.clientWidth)
                .map((row) => row.textContent),
        }));

        // Two assertions because each catches a different half. Sizing the picker from the pill leaves it at
        // `pillSelectMinWidth`, so only the width discriminates there; laying the rows out at their content
        // width without resizing the popup keeps every row untruncated, so only their right edges do.
        expect(pickerWidth).toBeGreaterThan(140);
        expect(overflowing).toEqual([]);
    });
});
