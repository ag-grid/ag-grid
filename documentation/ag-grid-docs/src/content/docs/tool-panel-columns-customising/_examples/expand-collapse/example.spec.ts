import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Expand / Collapse column groups via the tool panel instance', async ({ page }) => {
        await waitForGridContent(page);

        const toolPanel = page.locator('.ag-column-select');
        await expect(toolPanel).toBeVisible();

        // A collapsed group hides its child columns from the tool panel list, so we assert
        // group state via the presence of child leaf labels.
        const leaf = (text: string) =>
            toolPanel.locator('.ag-column-select-column .ag-column-select-column-label', { hasText: text });
        const topGroup = (text: string) =>
            toolPanel.locator('.ag-column-select-column-group .ag-column-select-column-label', { hasText: text });

        // onGridReady calls collapseColumnGroups() so all groups start collapsed:
        // only the top-level 'Athlete' and 'Medals' groups are shown, child columns are hidden.
        await expect(topGroup('Athlete')).toBeVisible();
        await expect(topGroup('Medals')).toBeVisible();
        await expect(leaf('Year')).toHaveCount(0);
        await expect(leaf('Gold')).toHaveCount(0);

        // Expand All -> every child column becomes visible.
        await page.getByRole('button', { name: 'Expand All' }).click();
        await expect(leaf('Year')).toBeVisible();
        await expect(leaf('Gold')).toBeVisible();

        // Collapse All -> child columns hidden again.
        await page.getByRole('button', { name: 'Collapse All' }).click();
        await expect(leaf('Year')).toHaveCount(0);
        await expect(leaf('Gold')).toHaveCount(0);

        // Expand Athlete & Competition -> Competition children (Year/Date) visible,
        // but Medals stays collapsed so Gold remains hidden.
        await page.getByRole('button', { name: 'Expand Athlete & Competition' }).click();
        await expect(leaf('Year')).toBeVisible();
        await expect(leaf('Gold')).toHaveCount(0);

        // Collapse Competition -> Competition children hidden again.
        await page.getByRole('button', { name: 'Collapse Competition' }).click();
        await expect(leaf('Year')).toHaveCount(0);
    });
});
