import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Columns Tool Panel lists columns and toggles visibility', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // The Columns Tool Panel is shown by default (sideBar: 'columns').
        const toolPanel = page.locator('.ag-column-select');
        await expect(toolPanel).toBeVisible();

        // Grid data is loaded.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // The tool panel shows the column groups from the column definitions.
        for (const label of ['Athlete', 'Competition', 'Medals', 'Sport']) {
            await expect(toolPanel.locator('.ag-column-select-column-label', { hasText: label }).first()).toBeVisible();
        }

        // With pivot mode off, unselecting a column toggles its visibility off in the grid.
        const goldHeader = agIdFor.headerCell('gold');
        await expect(goldHeader).toBeVisible();

        const goldCheckbox = toolPanel
            .locator('.ag-column-select-column')
            .filter({ hasText: 'Gold' })
            .locator('.ag-checkbox-input');
        await goldCheckbox.click();

        await expect(goldHeader).toBeHidden();
    });
});
