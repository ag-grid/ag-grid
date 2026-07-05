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

        await agIdFor.headerFilterButton('date').click();

        const picker = agIdFor.filterInstancePickerDisplay({ source: 'column-filter' });
        await picker.click();
        await page.getByText('Last 24 Months', { exact: true }).click();

        // close the popup and confirm the relative-range filter is now applied
        await agIdFor.cell('0', 'athlete').click();
        await expect(dateHeader).toHaveClass(/ag-header-cell-filtered/);
    });
});
