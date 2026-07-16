import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Deferred updates stage until Apply, and Cancel discards them', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const toolPanel = page.locator('.ag-column-select');
        await expect(toolPanel).toBeVisible();

        // 'Age' starts visible in the grid.
        const ageHeader = agIdFor.headerCell('age');
        await expect(ageHeader).toBeVisible();

        const ageCheckbox = toolPanel
            .locator('.ag-column-select-column')
            .filter({ hasText: 'Age' })
            .locator('.ag-checkbox-input');
        await expect(ageCheckbox).toBeChecked();

        // Unchecking 'Age' stages the change but does NOT commit it: the grid column stays visible.
        await ageCheckbox.click();
        await expect(ageCheckbox).not.toBeChecked();
        await expect(ageHeader).toBeVisible();

        // Cancel discards the pending change and restores the last applied state.
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(ageCheckbox).toBeChecked();
        await expect(ageHeader).toBeVisible();

        // Staging the change again and clicking Apply commits it, hiding the column.
        await ageCheckbox.click();
        await expect(ageCheckbox).not.toBeChecked();
        await expect(ageHeader).toBeVisible();

        await page.getByRole('button', { name: 'Apply' }).click();
        await expect(ageHeader).toBeHidden();
    });
});
