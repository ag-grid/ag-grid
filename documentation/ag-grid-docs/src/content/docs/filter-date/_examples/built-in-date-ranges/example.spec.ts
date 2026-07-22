import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('exposes the built-in named & relative date ranges', async ({ page, agIdFor }) => {
        await agIdFor.headerFilterButton('date').click();

        const picker = agIdFor.filterInstancePickerDisplay({ source: 'column-filter' });
        await picker.click();

        // the built-in ranges added via filterOptions are offered in the dropdown
        await expect(page.getByText('Year To Date', { exact: true })).toBeVisible();
        await expect(page.getByText('Last 7 Days', { exact: true })).toBeVisible();
        await expect(page.getByText('Last 24 Months', { exact: true })).toBeVisible();
    });

    test.eachFramework('selecting a relative range activates the filter', async ({ page, agIdFor }) => {
        const dateHeader = agIdFor.headerCell('date');
        await expect(dateHeader).not.toHaveClass(/ag-header-cell-filtered/);

        // Total row count before filtering, read from the grid's aria-rowcount (not the
        // virtualised DOM rows).
        const grid = page.locator('[aria-rowcount]').first();
        const rowCount = async () => Number(await grid.getAttribute('aria-rowcount'));
        const unfilteredCount = await rowCount();

        await agIdFor.headerFilterButton('date').click();

        const picker = agIdFor.filterInstancePickerDisplay({ source: 'column-filter' });
        await picker.click();
        await page.getByText('Last 24 Months', { exact: true }).click();

        // Close the filter popup and confirm the relative-range filter is now applied.
        // Press Escape rather than clicking a data cell: selecting the range re-filters the
        // rows, so the cell at index 0 is mid-re-render and the click can race it.
        await page.keyboard.press('Escape');
        await expect(dateHeader).toHaveClass(/ag-header-cell-filtered/);

        // The data spans ~12 months ago to ~6 months ahead; "Last 24 Months" (24 months ago →
        // tomorrow) always excludes the future-dated rows, so the row set shrinks. Asserting the
        // reduction keeps the test meaningful without depending on a specific row surviving.
        await expect(async () => {
            expect(await rowCount()).toBeLessThan(unfilteredCount);
        }).toPass();
    });
});
