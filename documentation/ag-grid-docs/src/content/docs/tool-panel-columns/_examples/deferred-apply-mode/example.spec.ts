import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Columns Tool Panel stages changes until Apply / discards on Cancel', async ({ page }) => {
        await waitForGridContent(page);

        // The Columns Tool Panel is present, along with the Cancel / Apply buttons that enable deferred updates.
        await expect(page.locator('.ag-column-select')).toBeVisible();
        const applyButton = page.getByRole('button', { name: 'Apply' });
        const cancelButton = page.getByRole('button', { name: 'Cancel' });
        await expect(applyButton).toBeVisible();
        await expect(cancelButton).toBeVisible();

        const toolPanelCheckbox = (name: string) =>
            page.locator('.ag-column-select-column').filter({ hasText: name }).locator('.ag-checkbox-input');

        // Apply path: unchecking 'Age' is staged only — the column stays visible until Apply is clicked.
        const ageHeader = page.locator('.ag-header-cell[col-id="age"]');
        await expect(ageHeader).toBeVisible();
        await toolPanelCheckbox('Age').click();
        await expect(ageHeader).toBeVisible();
        await applyButton.click();
        await expect(ageHeader).toBeHidden();

        // Cancel path: unchecking 'Year' is staged, then Cancel discards it and the column remains visible.
        const yearHeader = page.locator('.ag-header-cell[col-id="year"]');
        await expect(yearHeader).toBeVisible();
        await toolPanelCheckbox('Year').click();
        await expect(yearHeader).toBeVisible();
        await cancelButton.click();
        await expect(yearHeader).toBeVisible();
    });
});
