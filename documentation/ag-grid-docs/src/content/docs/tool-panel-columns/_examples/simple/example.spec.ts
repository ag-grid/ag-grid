import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Columns tool panel toggle and group expansion', async ({ agIdFor, page }) => {
        const columnsButton = agIdFor.sideBarButton('Columns');
        const columnToolPanel = agIdFor.columnToolPanel();

        // Panel opens by default with sideBar: 'columns' - close it first
        await columnsButton.click();
        await expect(columnToolPanel).not.toBeVisible();

        // Open the columns tool panel via the sidebar button
        await columnsButton.click();
        await expect(columnToolPanel).toBeVisible();

        // Column groups are expanded by default - verify group headers and child columns are displayed
        const panel = page.locator('.ag-column-panel');
        await expect(
            panel.locator('.ag-column-select-virtual-list-item[aria-label="Competition Column Group"]')
        ).toBeVisible();
        await expect(
            panel.locator('.ag-column-select-virtual-list-item[aria-label="Medals Column Group"]')
        ).toBeVisible();
        await expect(panel.locator('.ag-column-select-virtual-list-item[aria-label="Sport Column"]')).toBeVisible();

        // Child columns of Competition are visible when the group is expanded
        await expect(panel.locator('.ag-column-select-virtual-list-item[aria-label="Year Column"]')).toBeVisible();
        await expect(panel.locator('.ag-column-select-virtual-list-item[aria-label="Date Column"]')).toBeVisible();

        // Collapse the Competition group using its expanded icon
        const competitionGroup = panel.locator(
            '.ag-column-select-virtual-list-item[aria-label="Competition Column Group"]'
        );
        await competitionGroup.locator('.ag-column-group-opened-icon').click();
        await expect(panel.locator('.ag-column-select-virtual-list-item[aria-label="Year Column"]')).not.toBeVisible();
        await expect(panel.locator('.ag-column-select-virtual-list-item[aria-label="Date Column"]')).not.toBeVisible();

        // Expand Competition again and verify children reappear
        await competitionGroup.locator('.ag-column-group-closed-icon').click();
        await expect(panel.locator('.ag-column-select-virtual-list-item[aria-label="Year Column"]')).toBeVisible();
        await expect(panel.locator('.ag-column-select-virtual-list-item[aria-label="Date Column"]')).toBeVisible();
    });
});
