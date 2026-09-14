import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Grouped by country then year. The country and year colDefs each define a tooltip that
    // the generated group column inherits for its group rows, while autoGroupColumnDef
    // defines a tooltip that applies to leaf rows only.
    const autoGroupCellAt = (page: any, rowIndex: number) =>
        page.locator(`.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="ag-Grid-AutoColumn"]`).first();

    test.eachFramework('Group cells inherit the tooltip from the grouped column', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The first group row (Country) shows a tooltip inherited from the country colDef.
        const firstGroupCell = page.locator('.ag-row .ag-cell[col-id="ag-Grid-AutoColumn"]').first();
        await firstGroupCell.hover();

        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Country:');
    });

    test.eachFramework('The second group level inherits its own column tooltip', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Expand the first country group to reveal the year groups beneath it.
        await autoGroupCellAt(page, 0).locator('.ag-group-contracted').click();

        await autoGroupCellAt(page, 1).hover();

        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Year:');
    });

    test.eachFramework('Leaf rows use the autoGroupColumnDef tooltip', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Expand down to a leaf row: country group, then year group.
        await autoGroupCellAt(page, 0).locator('.ag-group-contracted').click();
        await autoGroupCellAt(page, 1).locator('.ag-group-contracted').click();

        // Row 2 is now a leaf, where autoGroupColumnDef.tooltip applies instead of the
        // inherited group tooltip.
        await autoGroupCellAt(page, 2).hover();

        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Athlete:');
    });

    test.eachFramework(
        'The group column header uses the autoGroupColumnDef headerTooltip',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await agIdFor.headerCell('ag-Grid-AutoColumn').hover();

            const tooltip = page.locator('.ag-tooltip');
            await expect(tooltip).toBeVisible();
            await expect(tooltip).toContainText('Group');
        }
    );
});
