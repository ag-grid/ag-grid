import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'changes apply immediately, and the custom Reset button restores the column definitions',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            const toolPanel = page.locator('.ag-column-select');
            await expect(toolPanel).toBeVisible();

            const ageHeader = agIdFor.headerCell('age');
            const goldHeader = agIdFor.headerCell('gold');
            const checkboxFor = (label: string) =>
                toolPanel.locator('.ag-column-select-column').filter({ hasText: label }).locator('.ag-checkbox-input');

            // Initial state from the column definitions: 'Age' shown, 'Gold' hidden.
            await expect(ageHeader).toBeVisible();
            await expect(goldHeader).toBeHidden();

            // A custom button does not enable deferred updates, so changes apply straight away.
            await checkboxFor('Age').click();
            await checkboxFor('Gold').click();
            await expect(ageHeader).toBeHidden();
            await expect(goldHeader).toBeVisible();

            // Reset calls `api.resetColumnState()`, restoring the column definitions.
            await page.getByRole('button', { name: 'Reset' }).click();
            await expect(ageHeader).toBeVisible();
            await expect(goldHeader).toBeHidden();
            await expect(checkboxFor('Age')).toBeChecked();
            await expect(checkboxFor('Gold')).not.toBeChecked();
        }
    );
});
