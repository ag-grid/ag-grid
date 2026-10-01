import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders custom labels for columns and column groups', async ({ page }) => {
        await waitForGridContent(page);

        const toolPanel = page.locator('.ag-column-select');
        await expect(toolPanel.locator('.ag-column-select-column-group .custom-column-label')).toHaveCount(2);
        await expect(toolPanel.locator('.ag-column-select-column .custom-column-label')).toHaveCount(6);
        await expect(toolPanel.locator('.custom-column-label', { hasText: 'Athlete Details' })).toBeVisible();

        const athleteRow = toolPanel.locator('.ag-column-select-column', {
            has: page.locator('.custom-column-label', { hasText: 'Athlete' }),
        });
        await expect(athleteRow.locator('.ag-column-select-checkbox')).toBeVisible();
        await expect(athleteRow.locator('.ag-column-select-column-drag-handle')).toBeVisible();
    });

    test.eachFramework('clicking a column custom label toggles the column visibility', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const toolPanel = page.locator('.ag-column-select');
        await expect(agIdFor.headerCell('sport')).toBeVisible();

        // Click the rendered label text (not the checkbox) - normal selection behaviour is retained.
        await toolPanel.locator('.custom-column-label-text', { hasText: 'Sport' }).click();

        await expect(agIdFor.headerCell('sport')).toBeHidden();
    });

    test.eachFramework('clicking a column group custom label toggles its child columns', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const toolPanel = page.locator('.ag-column-select');
        await expect(agIdFor.headerCell('gold')).toBeVisible();
        await expect(agIdFor.headerCell('silver')).toBeVisible();
        await expect(agIdFor.headerCell('bronze')).toBeVisible();

        // Click the group's rendered label - all of its children are hidden.
        await toolPanel
            .locator('.ag-column-select-column-group')
            .locator('.custom-column-label-text', { hasText: 'Results' })
            .click();

        await expect(agIdFor.headerCell('gold')).toBeHidden();
        await expect(agIdFor.headerCell('silver')).toBeHidden();
        await expect(agIdFor.headerCell('bronze')).toBeHidden();
    });
});
