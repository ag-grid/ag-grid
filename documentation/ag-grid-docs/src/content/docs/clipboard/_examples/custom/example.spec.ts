import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('displays the olympic winners source data', async ({ agIdFor }) => {
        // First row of olympic-winners.json: Michael Phelps, United States, total 8.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
    });

    test.eachFramework('Copy buttons trigger the sendToClipboard callback without error', async ({ agIdFor, page }) => {
        // Select a row, then use the API-driven copy button which routes through sendToClipboard.
        await agIdFor.rowNode('0').locator('.ag-checkbox-input').first().click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

        await page.getByRole('button', { name: 'Copy Selected Rows to Clipboard' }).click();
        await page.getByRole('button', { name: 'Copy Selected Range to Clipboard' }).click();

        // Grid stays intact after the custom clipboard callbacks run.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });
});
