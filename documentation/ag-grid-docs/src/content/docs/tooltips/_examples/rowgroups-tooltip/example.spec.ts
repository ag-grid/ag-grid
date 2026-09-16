import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Grouped by country then year. The country and year colDefs each define a tooltip that
    // the generated group column inherits for its group rows, while autoGroupColumnDef
    // defines a tooltip that applies to leaf rows only.

    // Rows are addressed by group level rather than row index: expanding a group re-renders the
    // rows, so an index resolves to whichever row happens to occupy that slot at the time.
    const autoGroupCellAtLevel = (page: any, level: number) =>
        page.locator(`.ag-row-level-${level} .ag-cell[col-id="ag-Grid-AutoColumn"]`).first();

    // Each hover leaves its tooltip behind while it animates out, so park the pointer off the
    // grid and let the previous one go before hovering the next cell.
    const clearTooltips = async (page: any) => {
        await page.mouse.move(0, 0);
        await expect(page.locator('.ag-tooltip')).toHaveCount(0);
    };

    const expand = async (page: any, level: number) => {
        await autoGroupCellAtLevel(page, level).locator('.ag-group-contracted').click();
        await expect(autoGroupCellAtLevel(page, level + 1)).toBeVisible();
    };

    test.eachFramework('Group cells inherit the tooltip from the grouped column', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The first group row (Country) shows a tooltip inherited from the country colDef.
        await autoGroupCellAtLevel(page, 0).hover();

        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Country:');
    });

    test.eachFramework('The second group level inherits its own column tooltip', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Expand the first country group to reveal the year groups beneath it.
        await expand(page, 0);
        await clearTooltips(page);

        await autoGroupCellAtLevel(page, 1).hover();

        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Year:');
    });

    test.eachFramework('Leaf rows use the autoGroupColumnDef tooltip', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Expand down to a leaf row: country group, then year group.
        await expand(page, 0);
        await expand(page, 1);
        await clearTooltips(page);

        // At the leaf level autoGroupColumnDef.tooltip applies instead of the inherited
        // group tooltip.
        await autoGroupCellAtLevel(page, 2).hover();

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
