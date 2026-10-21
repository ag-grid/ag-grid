import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('setColumnLayout reorders and regroups the tool panel', async ({ page }) => {
        await waitForGridContent(page);

        const toolPanel = page.locator('.ag-column-select');
        await expect(toolPanel).toBeVisible();

        // The leaf column labels in tool panel order (group labels excluded).
        const leafLabels = toolPanel.locator('.ag-column-select-column .ag-column-select-column-label');

        // Initially the tool panel layout matches gridOptions.columnDefs order:
        // Athlete(Name, Age, Country), Competition(Year, Date), Sport, Medals(Gold, Silver, Bronze, Total).
        await expect(leafLabels).toHaveText([
            'Name',
            'Age',
            'Country',
            'Year',
            'Date',
            'Sport',
            'Gold',
            'Silver',
            'Bronze',
            'Total',
        ]);

        // Custom Sort Layout applies setColumnLayout with a re-ordered set of column defs.
        await page.getByRole('button', { name: 'Custom Sort Layout' }).click();
        await expect(leafLabels).toHaveText([
            'Age',
            'Country',
            'Name',
            'Date',
            'Year',
            'Bronze',
            'Gold',
            'Silver',
            'Total',
            'Sport',
        ]);

        // Custom Group Layout applies setColumnLayout introducing groups that don't exist in the grid.
        await page.getByRole('button', { name: 'Custom Group Layout' }).click();
        await expect(
            toolPanel.locator('.ag-column-select-column-label', { hasText: 'Dummy Group 1' }).first()
        ).toBeVisible();
        await expect(
            toolPanel.locator('.ag-column-select-column-label', { hasText: 'Dummy Group 2' }).first()
        ).toBeVisible();
        await expect(
            toolPanel.locator('.ag-column-select-column-label', { hasText: 'Dummy Group 3' }).first()
        ).toBeVisible();
    });

    test.eachFramework('the Custom Group Layout omits columns entirely from the tool panel', async ({ page }) => {
        await waitForGridContent(page);

        const toolPanel = page.locator('.ag-column-select');
        const leafLabels = toolPanel.locator('.ag-column-select-column .ag-column-select-column-label');

        // 'Year' and 'Date' are listed initially (from gridOptions.columnDefs).
        await expect(leafLabels.filter({ hasText: 'Year' })).toHaveCount(1);
        await expect(leafLabels.filter({ hasText: 'Date' })).toHaveCount(1);

        await page.getByRole('button', { name: 'Custom Group Layout' }).click();

        // customToolPanelColumnDefs omits the 'year' and 'date' columns, so they disappear from the
        // tool panel list altogether (the grid itself still has them).
        await expect(leafLabels.filter({ hasText: 'Year' })).toHaveCount(0);
        await expect(leafLabels.filter({ hasText: 'Date' })).toHaveCount(0);
    });

    test.eachFramework('the Custom Group Layout leaf order follows the layout, not the grid', async ({ page }) => {
        await waitForGridContent(page);

        const toolPanel = page.locator('.ag-column-select');
        const leafLabels = toolPanel.locator('.ag-column-select-column .ag-column-select-column-label');

        await page.getByRole('button', { name: 'Custom Group Layout' }).click();

        // Dummy Group 1: Age, Name, Dummy Group 2 (Sport, Country)
        // Medals: Total, Bronze, Dummy Group 3 (Silver, Gold)
        // Note 'Medals' in the grid is Gold, Silver, Bronze, Total - the layout order wins.
        await expect(leafLabels).toHaveText(['Age', 'Name', 'Sport', 'Country', 'Total', 'Bronze', 'Silver', 'Gold']);
    });
});
