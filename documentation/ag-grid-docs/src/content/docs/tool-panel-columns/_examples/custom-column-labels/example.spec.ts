import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders custom labels for columns and column groups', async ({ page }) => {
        await waitForGridContent(page);

        const toolPanel = page.locator('.ag-column-select');
        await expect(toolPanel.locator('.ag-column-select-column-group .custom-column-label')).toHaveCount(2);
        await expect(toolPanel.locator('.ag-column-select-column .custom-column-label')).toHaveCount(6);
        await expect(toolPanel.locator('.custom-column-label', { hasText: 'Athlete Details' })).toBeVisible();

        const athleteRow = toolPanel.locator('.ag-column-select-column', {
            has: toolPanel.locator('.custom-column-label', { hasText: 'Athlete' }),
        });
        await expect(athleteRow.locator('.ag-column-select-checkbox')).toBeVisible();
        await expect(athleteRow.locator('.ag-column-select-column-drag-handle')).toBeVisible();
    });
});
