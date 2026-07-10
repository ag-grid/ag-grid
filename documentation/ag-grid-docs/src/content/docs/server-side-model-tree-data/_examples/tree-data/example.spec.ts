import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Tree data lazy-loads children when a group is expanded', async ({ page }) => {
        await waitForGridContent(page);

        // Group rows are located by their displayed employeeName (the auto-group column's inner renderer).
        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Top-level node loaded from the server, plus the first two levels which open by default.
        await expect(groupRow('Erica Rogers')).toBeVisible();
        await expect(groupRow('Erica Rogers').locator('[col-id="jobTitle"]')).toContainText('CEO');
        await expect(groupRow('Malcolm Barrett')).toBeVisible();
        await expect(groupRow('Esther Baker')).toBeVisible();

        // Esther Baker's children are not loaded until the group is expanded.
        await expect(groupRow('Brittany Hanson')).toHaveCount(0);
        await expect(groupRow('Derek Paul')).toHaveCount(0);

        // Expanding the level-2 group lazy-loads its children from the server.
        await groupRow('Esther Baker').locator('.ag-group-contracted').first().click();
        await expect(groupRow('Brittany Hanson')).toBeVisible();
        await expect(groupRow('Derek Paul')).toBeVisible();
        await expect(groupRow('Derek Paul').locator('[col-id="jobTitle"]')).toContainText('Inventory Control');
    });
});
