import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Refreshing a group reloads its children while retaining expanded state', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Canada is open by default, and the 2002 group under it, so its leaf rows (with a version cell) are shown.
        await expect(groupRow('Canada').locator('.ag-group-expanded')).toBeVisible();
        await expect(groupRow('2002').locator('.ag-group-expanded')).toBeVisible();
        const staleLeafVersions = page.locator('.ag-row:not(.ag-row-group) [col-id="version"]', {
            hasText: '1 - 1 - 1',
        });
        await expect(staleLeafVersions.first()).toBeVisible();

        // The fake server bumps its version every 4s; the loaded leaves still show the fetched version 1.
        await expect(page.locator('#version-indicator')).not.toHaveText('1');
        await expect(staleLeafVersions.first()).toBeVisible();

        // Refresh only the ['Canada', '2002'] group's children (the leaf rows).
        await page.getByRole('button', { name: "Refresh ['Canada', '2002'] Group" }).click();

        // Both groups stay expanded (expanded state is retained across the refresh)...
        await expect(groupRow('Canada').locator('.ag-group-expanded')).toBeVisible();
        await expect(groupRow('2002').locator('.ag-group-expanded')).toBeVisible();

        // ...and the leaf children reloaded, so no leaf still shows the stale version 1.
        await expect(staleLeafVersions).toHaveCount(0);
    });
});
