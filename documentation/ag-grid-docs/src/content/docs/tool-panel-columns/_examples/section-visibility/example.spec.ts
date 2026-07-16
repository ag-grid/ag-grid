import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Suppressed sections are hidden until shown via the tool panel API', async ({ page }) => {
        await waitForGridContent(page);

        const panel = page.locator('.ag-column-panel');
        const rowGroups = panel.locator('.ag-column-drop-rowgroup');
        const values = panel.locator('.ag-column-drop-aggregation');
        const columnLabels = panel.locator('.ag-column-drop-pivot');
        const pivotMode = panel.locator('.ag-pivot-mode-panel');

        // The Columns Section is present with the columns list.
        await expect(panel.locator('.ag-column-select')).toBeVisible();
        await expect(panel.locator('.ag-column-select-column-label', { hasText: 'Name' })).toBeVisible();

        // Sections suppressed via toolPanelParams are absent, along with the select-all / filter controls.
        await expect(rowGroups).toHaveCount(0);
        await expect(values).toHaveCount(0);
        await expect(columnLabels).toHaveCount(0);
        await expect(pivotMode).toHaveCount(0);
        await expect(page.getByTestId('ag-column-panel-select-header-checkbox')).toBeHidden();
        await expect(page.getByTestId('ag-column-panel-select-header-filter')).toBeHidden();

        // The 'date' column is removed from the tool panel via colDef.suppressColumnsToolPanel=true.
        await expect(panel.locator('.ag-column-select-column-label', { hasText: 'date' })).toHaveCount(0);

        // Each button invokes the corresponding IColumnToolPanel section-visibility method.
        await page.getByRole('button', { name: 'Show Pivot Mode Section' }).click();
        await expect(pivotMode).toBeVisible();

        await page.getByRole('button', { name: 'Show Row Groups Section' }).click();
        await expect(rowGroups).toBeVisible();

        await page.getByRole('button', { name: 'Show Values Section' }).click();
        await expect(values).toBeVisible();

        await page.getByRole('button', { name: 'Show Pivot Section' }).click();
        await expect(columnLabels).toBeVisible();
    });
});
