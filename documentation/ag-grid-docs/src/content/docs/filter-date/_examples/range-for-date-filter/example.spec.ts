import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders the generated start and end dates', async ({ agIdFor }) => {
        // data generates one row per year 2010..2029, so the first row's startDate is in 2010
        await expect(agIdFor.cell('0', 'startDate')).toContainText('2010');
    });

    test.eachFramework('filters the start date column with an After condition', async ({ page, agIdFor }) => {
        const startHeader = agIdFor.headerCell('startDate');
        await expect(startHeader).not.toHaveClass(/ag-header-cell-filtered/);

        await agIdFor.headerFilterButton('startDate').click();

        const picker = agIdFor.filterInstancePickerDisplay({ source: 'column-filter' });
        await picker.click();
        await page.getByText('After', { exact: true }).click();

        const filterInput = agIdFor.dateFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();
        await filterInput.fill('2019-12-31');
        await filterInput.dispatchEvent('input');

        await agIdFor.cell('0', 'startDate').click();

        await expect(startHeader).toHaveClass(/ag-header-cell-filtered/);

        // one row per year 2010..2029; only 2020..2029 fall after 2019-12-31 => 10 rows remain
        await expect(page.locator('.ag-row[row-id]')).toHaveCount(10);
    });
});
