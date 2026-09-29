import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'changes apply immediately, and Reset restores the column definitions',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            const toolPanel = page.locator('.ag-column-select');
            const ageHeader = agIdFor.headerCell('age');
            const goldHeader = agIdFor.headerCell('gold');
            const columnCheckbox = (label: string) =>
                toolPanel.locator('.ag-column-select-column').filter({ hasText: label }).locator('.ag-checkbox-input');

            await expect(ageHeader).toBeVisible();
            await expect(goldHeader).toBeHidden();

            // With no Apply button, changes in the tool panel are applied straight away.
            await columnCheckbox('Age').click();
            await columnCheckbox('Gold').click();
            await expect(ageHeader).toBeHidden();
            await expect(goldHeader).toBeVisible();

            // Reset restores the visibility declared in the column definitions.
            await page.getByRole('button', { name: 'Reset' }).click();
            await expect(ageHeader).toBeVisible();
            await expect(goldHeader).toBeHidden();
            await expect(columnCheckbox('Age')).toBeChecked();
            await expect(columnCheckbox('Gold')).not.toBeChecked();
        }
    );
});
