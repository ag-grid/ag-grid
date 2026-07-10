import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders the olympic winner rows', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
    });

    test.eachFramework('opens the custom date selection component', async ({ page, agIdFor }) => {
        await agIdFor.floatingFilterButton('date').click();

        // the registered flatpickr-based date component renders in the filter popup
        await expect(page.locator('.custom-date-filter').first()).toBeVisible();
    });

    test.eachFramework('floating filter narrows the rows', async ({ page, agIdFor }) => {
        const athleteInput = agIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'athlete' });
        await athleteInput.fill('Phelps');
        await athleteInput.dispatchEvent('input');

        await expect(agIdFor.headerCell('athlete')).toHaveClass(/ag-header-cell-filtered/);
        // only the three Michael Phelps rows remain
        await expect(page.locator('.ag-row[row-id]')).toHaveCount(3);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });
});
