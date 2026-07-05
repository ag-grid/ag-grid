import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('displays the olympic winners source data', async ({ agIdFor }) => {
        // First row of olympic-winners.json: Michael Phelps, United States, total 8.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
    });

    test.eachFramework('Selecting a row via its checkbox marks it selected', async ({ agIdFor }) => {
        const row0 = agIdFor.rowNode('0');
        await expect(row0).not.toHaveClass(/ag-row-selected/);

        await row0.locator('.ag-checkbox-input').first().click();
        await expect(row0).toHaveClass(/ag-row-selected/);

        // A second row can also be selected under multiRow selection.
        const row1 = agIdFor.rowNode('1');
        await row1.locator('.ag-checkbox-input').first().click();
        await expect(row1).toHaveClass(/ag-row-selected/);
        await expect(row0).toHaveClass(/ag-row-selected/);
    });
});
